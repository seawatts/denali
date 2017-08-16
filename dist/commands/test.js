"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const path = require("path");
const child_process_1 = require("child_process");
const denali_cli_1 = require("denali-cli");
/**
 * Run your app's test suite
 *
 * @package commands
 */
class TestCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let files = argv.files;
            if (files.length === 0) {
                files.push('test/**/*.js');
            }
            else {
                // Swap common file extensions out with `.js` so ava will find the actual, built files This
                // doesn't cover every possible edge case, hence the `isValidJsPattern` below, but it should
                // cover the common use cases.
                files = files.map((pattern) => pattern.replace(/\.[A-z0-9]{1,4}$/, '.js'));
            }
            // Filter for .js files only
            files = files.filter((pattern) => {
                let isValidJsPattern = pattern.endsWith('*') || pattern.endsWith('.js');
                if (!isValidJsPattern) {
                    denali_cli_1.ui.warn(denali_cli_1.unwrap `
          If you want to run specific test files, you must use the .js extension. You supplied
          ${pattern}. Denali will build your test files before running them, so you need to use
          the compiled filename which ends in .js
        `);
                }
                return isValidJsPattern;
            });
            let project = new denali_cli_1.Project({
                environment: 'test',
                printSlowTrees: argv.printSlowTrees,
                audit: !argv.skipAudit,
                lint: !argv.skipLint,
                buildDummy: true
            });
            process.on('exit', this.cleanExit.bind(this));
            process.on('SIGINT', this.cleanExit.bind(this));
            process.on('SIGTERM', this.cleanExit.bind(this));
            if (argv.watch) {
                project.watch({
                    outputDir: argv.output,
                    // Don't let broccoli rebuild while tests are still running, or else
                    // we'll be removing the test files while in progress leading to cryptic
                    // errors.
                    beforeRebuild: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        if (this.tests) {
                            return new Promise((resolve) => {
                                this.tests.removeAllListeners('exit');
                                this.tests.on('exit', () => {
                                    delete this.tests;
                                    resolve();
                                });
                                this.tests.kill();
                                denali_cli_1.ui.info('\n\n===> Changes detected, cancelling in-progress tests ...\n\n');
                            });
                        }
                    }),
                    onBuild: this.runTests.bind(this, files, project, argv)
                });
            }
            else {
                try {
                    yield project.build(argv.output);
                    this.runTests(files, project, argv);
                }
                catch (error) {
                    process.exitCode = 1;
                }
            }
        });
    }
    cleanExit() {
        if (this.tests) {
            this.tests.kill();
        }
    }
    runTests(files, project, argv) {
        let avaPath = path.join(process.cwd(), 'node_modules', '.bin', 'ava');
        let args = files.concat(['!test/dummy/**/*', '--concurrency', argv.concurrency]);
        if (argv.debug) {
            avaPath = process.execPath;
            args = ['--inspect', '--debug-brk', path.join(process.cwd(), 'node_modules', 'ava', 'profile.js'), argv.debug];
        }
        if (argv.match) {
            args.push('--match', argv.match);
        }
        if (argv.verbose) {
            args.unshift('--verbose');
        }
        if (argv.timeout) {
            args.unshift('--timeout', argv.timeout);
        }
        if (argv.failFast) {
            args.unshift('--fail-fast');
        }
        if (argv.serial) {
            args.unshift('--serial');
        }
        this.tests = child_process_1.spawn(avaPath, args, {
            cwd: argv.output,
            stdio: ['pipe', process.stdout, process.stderr],
            env: lodash_1.assign({}, process.env, {
                PORT: argv.port,
                DENALI_LEAVE_TMP: argv.litter,
                NODE_ENV: project.environment,
                DEBUG_COLORS: 1
            })
        });
        denali_cli_1.ui.info(`===> Running ${project.pkg.name} tests ...`);
        this.tests.on('exit', (code) => {
            if (code === 0) {
                denali_cli_1.ui.success('\n===> Tests passed 👍');
            }
            else {
                denali_cli_1.ui.error('\n===> Tests failed 💥');
            }
            delete this.tests;
            if (argv.watch) {
                denali_cli_1.ui.info('===> Waiting for changes to re-run ...\n\n');
            }
            else {
                process.exitCode = code == null ? 1 : code;
                denali_cli_1.ui.info(`===> exiting with ${process.exitCode}`);
            }
        });
    }
}
/* tslint:disable:completed-docs typedef */
TestCommand.commandName = 'test';
TestCommand.description = "Run your app's test suite";
TestCommand.longDescription = denali_cli_1.unwrap `
    Runs your app's test suite, and can optionally keep re-running it on each file change (--watch).
  `;
TestCommand.runsInApp = true;
TestCommand.params = '[files...]';
TestCommand.flags = {
    debug: {
        description: 'The test file you want to debug. Can only debug one file at a time.',
        type: 'string'
    },
    watch: {
        description: 'Re-run the tests when the source files change',
        default: false,
        type: 'boolean'
    },
    match: {
        description: 'Filter which tests run based on the supplied regex pattern',
        type: 'string'
    },
    timeout: {
        description: 'Set the timeout for all tests, i.e. --timeout 10s, --timeout 2m',
        type: 'string'
    },
    skipLint: {
        description: 'Skip linting the app source files',
        default: false,
        type: 'boolean'
    },
    skipAudit: {
        description: 'Skip auditing your package.json for vulnerabilites',
        default: false,
        type: 'boolean'
    },
    verbose: {
        description: 'Print detailed output of the status of your test run',
        default: process.env.CI,
        type: 'boolean'
    },
    output: {
        description: 'The directory to write the compiled app to. Defaults to a tmp directory',
        default: path.join('tmp', 'test'),
        type: 'string'
    },
    printSlowTrees: {
        description: 'Print out an analysis of the build process, showing the slowest nodes.',
        default: false,
        type: 'boolean'
    },
    failFast: {
        description: 'Stop tests on the first failure',
        default: false,
        type: 'boolean'
    },
    litter: {
        description: 'Do not clean up tmp directories created during testing (useful for debugging)',
        default: false,
        type: 'boolean'
    },
    serial: {
        description: 'Run tests serially',
        default: false,
        type: 'boolean'
    },
    concurrency: {
        description: 'How many test files should run concurrently?',
        default: 5,
        type: 'number'
    }
};
exports.default = TestCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FFZ0I7QUFDaEIsNkJBQTZCO0FBQzdCLGlEQUFvRDtBQUNwRCwyQ0FBMEQ7QUFFMUQ7Ozs7R0FJRztBQUNILGlCQUFpQyxTQUFRLG9CQUFPO0lBZ0Z4QyxHQUFHLENBQUMsSUFBUzs7WUFDakIsSUFBSSxLQUFLLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNqQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDN0IsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLDJGQUEyRjtnQkFDM0YsNEZBQTRGO2dCQUM1Riw4QkFBOEI7Z0JBQzlCLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3RSxDQUFDO1lBQ0QsNEJBQTRCO1lBQzVCLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBZTtnQkFDbkMsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hFLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO29CQUN0QixlQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFNLENBQUE7O1lBRVQsT0FBUTs7U0FFWixDQUFDLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxNQUFNLENBQUMsZ0JBQWdCLENBQUM7WUFD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RUFBTyxTQUFTO0tBQ3JCO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsV0FBVyxFQUFFLGlDQUFpQztRQUM5QyxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsTUFBTSxFQUFFO1FBQ04sV0FBVyxFQUFFLCtFQUErRTtRQUM1RixPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsTUFBTSxFQUFFO1FBQ04sV0FBVyxFQUFFLG9CQUFvQjtRQUNqQyxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsV0FBVyxFQUFFLDhDQUE4QztRQUMzRCxPQUFPLEVBQUUsQ0FBQztRQUNWLElBQUksRUFBTyxRQUFRO0tBQ3BCO0NBQ0YsQ0FBQztBQTVFSiw4QkF3TUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBhc3NpZ25cbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzcGF3biwgQ2hpbGRQcm9jZXNzIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyB1aSwgQ29tbWFuZCwgUHJvamVjdCwgdW53cmFwIH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5cbi8qKlxuICogUnVuIHlvdXIgYXBwJ3MgdGVzdCBzdWl0ZVxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgY29tbWFuZE5hbWUgPSAndGVzdCc7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9IFwiUnVuIHlvdXIgYXBwJ3MgdGVzdCBzdWl0ZVwiO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFJ1bnMgeW91ciBhcHAncyB0ZXN0IHN1aXRlLCBhbmQgY2FuIG9wdGlvbmFsbHkga2VlcCByZS1ydW5uaW5nIGl0IG9uIGVhY2ggZmlsZSBjaGFuZ2UgKC0td2F0Y2gpLlxuICBgO1xuXG4gIHN0YXRpYyBydW5zSW5BcHAgPSB0cnVlO1xuXG4gIHN0YXRpYyBwYXJhbXMgPSAnW2ZpbGVzLi4uXSc7XG5cbiAgc3RhdGljIGZsYWdzID0ge1xuICAgIGRlYnVnOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSB0ZXN0IGZpbGUgeW91IHdhbnQgdG8gZGVidWcuIENhbiBvbmx5IGRlYnVnIG9uZSBmaWxlIGF0IGEgdGltZS4nLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgd2F0Y2g6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUmUtcnVuIHRoZSB0ZXN0cyB3aGVuIHRoZSBzb3VyY2UgZmlsZXMgY2hhbmdlJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIG1hdGNoOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0ZpbHRlciB3aGljaCB0ZXN0cyBydW4gYmFzZWQgb24gdGhlIHN1cHBsaWVkIHJlZ2V4IHBhdHRlcm4nLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgdGltZW91dDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTZXQgdGhlIHRpbWVvdXQgZm9yIGFsbCB0ZXN0cywgaS5lLiAtLXRpbWVvdXQgMTBzLCAtLXRpbWVvdXQgMm0nLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgc2tpcExpbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2tpcCBsaW50aW5nIHRoZSBhcHAgc291cmNlIGZpbGVzJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHNraXBBdWRpdDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTa2lwIGF1ZGl0aW5nIHlvdXIgcGFja2FnZS5qc29uIGZvciB2dWxuZXJhYmlsaXRlcycsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICB2ZXJib3NlOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1ByaW50IGRldGFpbGVkIG91dHB1dCBvZiB0aGUgc3RhdHVzIG9mIHlvdXIgdGVzdCBydW4nLFxuICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnYuQ0ksXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgb3V0cHV0OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBkaXJlY3RvcnkgdG8gd3JpdGUgdGhlIGNvbXBpbGVkIGFwcCB0by4gRGVmYXVsdHMgdG8gYSB0bXAgZGlyZWN0b3J5JyxcbiAgICAgIGRlZmF1bHQ6IHBhdGguam9pbigndG1wJywgJ3Rlc3QnKSxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIHByaW50U2xvd1RyZWVzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1ByaW50IG91dCBhbiBhbmFseXNpcyBvZiB0aGUgYnVpbGQgcHJvY2Vzcywgc2hvd2luZyB0aGUgc2xvd2VzdCBub2Rlcy4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgZmFpbEZhc3Q6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3RvcCB0ZXN0cyBvbiB0aGUgZmlyc3QgZmFpbHVyZScsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBsaXR0ZXI6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnRG8gbm90IGNsZWFuIHVwIHRtcCBkaXJlY3RvcmllcyBjcmVhdGVkIGR1cmluZyB0ZXN0aW5nICh1c2VmdWwgZm9yIGRlYnVnZ2luZyknLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgc2VyaWFsOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1J1biB0ZXN0cyBzZXJpYWxseScsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBjb25jdXJyZW5jeToge1xuICAgICAgZGVzY3JpcHRpb246ICdIb3cgbWFueSB0ZXN0IGZpbGVzIHNob3VsZCBydW4gY29uY3VycmVudGx5PycsXG4gICAgICBkZWZhdWx0OiA1LFxuICAgICAgdHlwZTogPGFueT4nbnVtYmVyJ1xuICAgIH1cbiAgfTtcblxuICB0ZXN0czogQ2hpbGRQcm9jZXNzO1xuXG4gIGFzeW5jIHJ1bihhcmd2OiBhbnkpIHtcbiAgICBsZXQgZmlsZXMgPSA8c3RyaW5nW10+YXJndi5maWxlcztcbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBmaWxlcy5wdXNoKCd0ZXN0LyoqLyouanMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3dhcCBjb21tb24gZmlsZSBleHRlbnNpb25zIG91dCB3aXRoIGAuanNgIHNvIGF2YSB3aWxsIGZpbmQgdGhlIGFjdHVhbCwgYnVpbHQgZmlsZXMgVGhpc1xuICAgICAgLy8gZG9lc24ndCBjb3ZlciBldmVyeSBwb3NzaWJsZSBlZGdlIGNhc2UsIGhlbmNlIHRoZSBgaXNWYWxpZEpzUGF0dGVybmAgYmVsb3csIGJ1dCBpdCBzaG91bGRcbiAgICAgIC8vIGNvdmVyIHRoZSBjb21tb24gdXNlIGNhc2VzLlxuICAgICAgZmlsZXMgPSBmaWxlcy5tYXAoKHBhdHRlcm4pID0+IHBhdHRlcm4ucmVwbGFjZSgvXFwuW0EtejAtOV17MSw0fSQvLCAnLmpzJykpO1xuICAgIH1cbiAgICAvLyBGaWx0ZXIgZm9yIC5qcyBmaWxlcyBvbmx5XG4gICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIoKHBhdHRlcm46IHN0cmluZykgPT4ge1xuICAgICAgbGV0IGlzVmFsaWRKc1BhdHRlcm4gPSBwYXR0ZXJuLmVuZHNXaXRoKCcqJykgfHwgcGF0dGVybi5lbmRzV2l0aCgnLmpzJyk7XG4gICAgICBpZiAoIWlzVmFsaWRKc1BhdHRlcm4pIHtcbiAgICAgICAgdWkud2Fybih1bndyYXBgXG4gICAgICAgICAgSWYgeW91IHdhbnQgdG8gcnVuIHNwZWNpZmljIHRlc3QgZmlsZXMsIHlvdSBtdXN0IHVzZSB0aGUgLmpzIGV4dGVuc2lvbi4gWW91IHN1cHBsaWVkXG4gICAgICAgICAgJHsgcGF0dGVybiB9LiBEZW5hbGkgd2lsbCBidWlsZCB5b3VyIHRlc3QgZmlsZXMgYmVmb3JlIHJ1bm5pbmcgdGhlbSwgc28geW91IG5lZWQgdG8gdXNlXG4gICAgICAgICAgdGhlIGNvbXBpbGVkIGZpbGVuYW1lIHdoaWNoIGVuZHMgaW4gLmpzXG4gICAgICAgIGApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlzVmFsaWRKc1BhdHRlcm47XG4gICAgfSk7XG5cbiAgICBsZXQgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgIGVudmlyb25tZW50OiAndGVzdCcsXG4gICAgICBwcmludFNsb3dUcmVlczogYXJndi5wcmludFNsb3dUcmVlcyxcbiAgICAgIGF1ZGl0OiAhYXJndi5za2lwQXVkaXQsXG4gICAgICBsaW50OiAhYXJndi5za2lwTGludCxcbiAgICAgIGJ1aWxkRHVtbXk6IHRydWVcbiAgICB9KTtcblxuICAgIHByb2Nlc3Mub24oJ2V4aXQnLCB0aGlzLmNsZWFuRXhpdC5iaW5kKHRoaXMpKTtcbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCB0aGlzLmNsZWFuRXhpdC5iaW5kKHRoaXMpKTtcbiAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgdGhpcy5jbGVhbkV4aXQuYmluZCh0aGlzKSk7XG5cbiAgICBpZiAoYXJndi53YXRjaCkge1xuICAgICAgcHJvamVjdC53YXRjaCh7XG4gICAgICAgIG91dHB1dERpcjogYXJndi5vdXRwdXQsXG4gICAgICAgIC8vIERvbid0IGxldCBicm9jY29saSByZWJ1aWxkIHdoaWxlIHRlc3RzIGFyZSBzdGlsbCBydW5uaW5nLCBvciBlbHNlXG4gICAgICAgIC8vIHdlJ2xsIGJlIHJlbW92aW5nIHRoZSB0ZXN0IGZpbGVzIHdoaWxlIGluIHByb2dyZXNzIGxlYWRpbmcgdG8gY3J5cHRpY1xuICAgICAgICAvLyBlcnJvcnMuXG4gICAgICAgIGJlZm9yZVJlYnVpbGQ6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy50ZXN0cykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMudGVzdHMucmVtb3ZlQWxsTGlzdGVuZXJzKCdleGl0Jyk7XG4gICAgICAgICAgICAgIHRoaXMudGVzdHMub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMudGVzdHM7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy50ZXN0cy5raWxsKCk7XG4gICAgICAgICAgICAgIHVpLmluZm8oJ1xcblxcbj09PT4gQ2hhbmdlcyBkZXRlY3RlZCwgY2FuY2VsbGluZyBpbi1wcm9ncmVzcyB0ZXN0cyAuLi5cXG5cXG4nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb25CdWlsZDogdGhpcy5ydW5UZXN0cy5iaW5kKHRoaXMsIGZpbGVzLCBwcm9qZWN0LCBhcmd2KVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHByb2plY3QuYnVpbGQoYXJndi5vdXRwdXQpO1xuICAgICAgICB0aGlzLnJ1blRlc3RzKGZpbGVzLCBwcm9qZWN0LCBhcmd2KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBjbGVhbkV4aXQoKSB7XG4gICAgaWYgKHRoaXMudGVzdHMpIHtcbiAgICAgIHRoaXMudGVzdHMua2lsbCgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBydW5UZXN0cyhmaWxlczogc3RyaW5nW10sIHByb2plY3Q6IFByb2plY3QsIGFyZ3Y6IGFueSkge1xuICAgIGxldCBhdmFQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMnLCAnLmJpbicsICdhdmEnKTtcbiAgICBsZXQgYXJncyA9IGZpbGVzLmNvbmNhdChbICchdGVzdC9kdW1teS8qKi8qJywgJy0tY29uY3VycmVuY3knLCBhcmd2LmNvbmN1cnJlbmN5IF0pO1xuICAgIGlmIChhcmd2LmRlYnVnKSB7XG4gICAgICBhdmFQYXRoID0gcHJvY2Vzcy5leGVjUGF0aDtcbiAgICAgIGFyZ3MgPSBbICctLWluc3BlY3QnLCAnLS1kZWJ1Zy1icmsnLCBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ25vZGVfbW9kdWxlcycsICdhdmEnLCAncHJvZmlsZS5qcycpLCBhcmd2LmRlYnVnIF07XG4gICAgfVxuICAgIGlmIChhcmd2Lm1hdGNoKSB7XG4gICAgICBhcmdzLnB1c2goJy0tbWF0Y2gnLCBhcmd2Lm1hdGNoKTtcbiAgICB9XG4gICAgaWYgKGFyZ3YudmVyYm9zZSkge1xuICAgICAgYXJncy51bnNoaWZ0KCctLXZlcmJvc2UnKTtcbiAgICB9XG4gICAgaWYgKGFyZ3YudGltZW91dCkge1xuICAgICAgYXJncy51bnNoaWZ0KCctLXRpbWVvdXQnLCBhcmd2LnRpbWVvdXQpO1xuICAgIH1cbiAgICBpZiAoYXJndi5mYWlsRmFzdCkge1xuICAgICAgYXJncy51bnNoaWZ0KCctLWZhaWwtZmFzdCcpO1xuICAgIH1cbiAgICBpZiAoYXJndi5zZXJpYWwpIHtcbiAgICAgIGFyZ3MudW5zaGlmdCgnLS1zZXJpYWwnKTtcbiAgICB9XG4gICAgdGhpcy50ZXN0cyA9IHNwYXduKGF2YVBhdGgsIGFyZ3MsIHtcbiAgICAgIGN3ZDogYXJndi5vdXRwdXQsXG4gICAgICBzdGRpbzogWyAncGlwZScsIHByb2Nlc3Muc3Rkb3V0LCBwcm9jZXNzLnN0ZGVyciBdLFxuICAgICAgZW52OiBhc3NpZ24oe30sIHByb2Nlc3MuZW52LCB7XG4gICAgICAgIFBPUlQ6IGFyZ3YucG9ydCxcbiAgICAgICAgREVOQUxJX0xFQVZFX1RNUDogYXJndi5saXR0ZXIsXG4gICAgICAgIE5PREVfRU5WOiBwcm9qZWN0LmVudmlyb25tZW50LFxuICAgICAgICBERUJVR19DT0xPUlM6IDFcbiAgICAgIH0pXG4gICAgfSk7XG4gICAgdWkuaW5mbyhgPT09PiBSdW5uaW5nICR7IHByb2plY3QucGtnLm5hbWUgfSB0ZXN0cyAuLi5gKTtcbiAgICB0aGlzLnRlc3RzLm9uKCdleGl0JywgKGNvZGU6IG51bWJlciB8IG51bGwpID0+IHtcbiAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgIHVpLnN1Y2Nlc3MoJ1xcbj09PT4gVGVzdHMgcGFzc2VkIO2gve2xjScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdWkuZXJyb3IoJ1xcbj09PT4gVGVzdHMgZmFpbGVkIO2gve2ypScpO1xuICAgICAgfVxuICAgICAgZGVsZXRlIHRoaXMudGVzdHM7XG4gICAgICBpZiAoYXJndi53YXRjaCkge1xuICAgICAgICB1aS5pbmZvKCc9PT0+IFdhaXRpbmcgZm9yIGNoYW5nZXMgdG8gcmUtcnVuIC4uLlxcblxcbicpO1xuICAgICAgIH0gZWxzZSB7XG4gICAgICAgICBwcm9jZXNzLmV4aXRDb2RlID0gY29kZSA9PSBudWxsID8gMSA6IGNvZGU7XG4gICAgICAgICB1aS5pbmZvKGA9PT0+IGV4aXRpbmcgd2l0aCAkeyBwcm9jZXNzLmV4aXRDb2RlIH1gKTtcbiAgICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==