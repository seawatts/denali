"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const fs = require("fs-extra");
const path = require("path");
const child_process_1 = require("child_process");
const denali_cli_1 = require("denali-cli");
const createDebug = require("debug");
const debug = createDebug('denali:commands:server');
/**
 * Runs the denali server for local or production use.
 *
 * @package commands
 */
class ServerCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug('running server command');
            if (argv.production) {
                argv.skipBuild = true;
                argv.environment = 'production';
            }
            argv.watch = argv.watch || argv.environment === 'development';
            if (argv.skipBuild) {
                this.startServer(argv);
                return;
            }
            let project = new denali_cli_1.Project({
                environment: argv.environment,
                printSlowTrees: argv.printSlowTrees,
                audit: !argv.skipAudit,
                lint: !argv.skipLint,
                buildDummy: true
            });
            process.on('exit', this.cleanExit.bind(this));
            process.on('SIGINT', this.cleanExit.bind(this));
            process.on('SIGTERM', this.cleanExit.bind(this));
            if (argv.watch) {
                debug('starting watcher');
                project.watch({
                    outputDir: argv.output,
                    onBuild: () => {
                        if (this.server) {
                            debug('killing existing server');
                            this.server.removeAllListeners('exit');
                            this.server.kill();
                        }
                        this.startServer(argv);
                    }
                });
            }
            else {
                debug('building project');
                yield project.build(argv.output);
                this.startServer(argv);
            }
        });
    }
    cleanExit() {
        if (this.server) {
            this.server.kill();
        }
    }
    startServer(argv) {
        let dir = argv.output;
        let args = ['app/index.js'];
        if (argv.debug) {
            args.unshift('--inspect', '--debug-brk');
        }
        if (!fs.existsSync(path.join(dir, 'app', 'index.js'))) {
            denali_cli_1.ui.error('Unable to start your application: missing app/index.js file');
            return;
        }
        debug(`starting server process: ${process.execPath} ${args.join(' ')}`);
        this.server = child_process_1.spawn(process.execPath, args, {
            cwd: dir,
            stdio: ['pipe', process.stdout, process.stderr],
            env: lodash_1.merge(lodash_1.clone(process.env), {
                PORT: argv.port,
                NODE_ENV: argv.environment
            })
        });
        this.server.on('error', (error) => {
            denali_cli_1.ui.error('Unable to start your application:');
            denali_cli_1.ui.error(error.stack);
        });
        if (argv.watch) {
            this.server.on('exit', (code) => {
                let result = code === 0 ? 'exited' : 'crashed';
                denali_cli_1.ui.error(`Server ${result}. waiting for changes to restart ...`);
            });
        }
    }
}
/* tslint:disable:completed-docs typedef */
ServerCommand.commandName = 'server';
ServerCommand.description = 'Runs the denali server for local or production use.';
ServerCommand.longDescription = denali_cli_1.unwrap `
    Launches the Denali server running your application.

    In a development environment, the server does several things:

     * watches your local filesystem for changes and automatically restarts for you.
     * lint your code on build
     * run a security audit of your package.json on build (via nsp)

    In production, the above features are disabled by default, and instead:

     * the server will fork worker processes to maximize CPU core usage`;
ServerCommand.runsInApp = true;
ServerCommand.flags = {
    environment: {
        description: 'The target environment to build for.',
        default: process.env.NODE_ENV || 'development',
        type: 'string'
    },
    debug: {
        description: 'Run in debug mode (add the --debug flag to node, launch node-inspector)',
        default: false,
        type: 'boolean'
    },
    watch: {
        description: 'Restart the server when the source files change (default: true in development)',
        type: 'boolean'
    },
    port: {
        description: 'The port the HTTP server should bind to (default: process.env.PORT or 3000)',
        default: process.env.PORT || 3000,
        type: 'number'
    },
    skipBuild: {
        description: "Don't build the app before launching the server. Useful in production if you prebuild the app before deploying. Implies --skip-lint and --skip-audit.",
        default: false,
        type: 'boolean'
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
    output: {
        description: 'The directory to write the compiled app to. Defaults to a tmp directory',
        default: 'dist',
        type: 'string'
    },
    production: {
        description: 'Shorthand for "--skip-build --environment production"',
        default: false,
        type: 'boolean'
    },
    printSlowTrees: {
        description: 'Print out an analysis of the build process, showing the slowest nodes.',
        default: false,
        type: 'boolean'
    }
};
exports.default = ServerCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBR2dCO0FBQ2hCLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0IsaURBQW9EO0FBQ3BELDJDQUEwRDtBQUMxRCxxQ0FBcUM7QUFFckMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFFcEQ7Ozs7R0FJRztBQUNILG1CQUFtQyxTQUFRLG9CQUFPO0lBMEUxQyxHQUFHLENBQUMsSUFBUzs7WUFDakIsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDaEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztZQUNsQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssYUFBYSxDQUFDO1lBRTlELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2QixNQUFNLENBQUM7WUFDVCxDQUFDO1lBRUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxvQkFBTyxDQUFDO2dCQUN4QixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzdCLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztnQkFDbkMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVM7Z0JBQ3RCLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRO2dCQUNwQixVQUFVLEVBQUUsSUFBSTth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QUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSTtRQUNqQyxJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSx1SkFBdUo7UUFDcEssT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFFBQVEsRUFBRTtRQUNSLFdBQVcsRUFBRSxtQ0FBbUM7UUFDaEQsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSxvREFBb0Q7UUFDakUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELE1BQU0sRUFBRTtRQUNOLFdBQVcsRUFBRSx5RUFBeUU7UUFDdEYsT0FBTyxFQUFFLE1BQU07UUFDZixJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELFVBQVUsRUFBRTtRQUNWLFdBQVcsRUFBRSx1REFBdUQ7UUFDcEUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELGNBQWMsRUFBRTtRQUNkLFdBQVcsRUFBRSx3RUFBd0U7UUFDckYsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtDQUNGLENBQUM7QUF0RUosZ0NBNEpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgY2xvbmUsXG4gIG1lcmdlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc3Bhd24sIENoaWxkUHJvY2VzcyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgdWksIENvbW1hbmQsIFByb2plY3QsIHVud3JhcCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0ICogYXMgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZW5hbGk6Y29tbWFuZHM6c2VydmVyJyk7XG5cbi8qKlxuICogUnVucyB0aGUgZGVuYWxpIHNlcnZlciBmb3IgbG9jYWwgb3IgcHJvZHVjdGlvbiB1c2UuXG4gKlxuICogQHBhY2thZ2UgY29tbWFuZHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmVyQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGNvbW1hbmROYW1lID0gJ3NlcnZlcic7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdSdW5zIHRoZSBkZW5hbGkgc2VydmVyIGZvciBsb2NhbCBvciBwcm9kdWN0aW9uIHVzZS4nO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIExhdW5jaGVzIHRoZSBEZW5hbGkgc2VydmVyIHJ1bm5pbmcgeW91ciBhcHBsaWNhdGlvbi5cblxuICAgIEluIGEgZGV2ZWxvcG1lbnQgZW52aXJvbm1lbnQsIHRoZSBzZXJ2ZXIgZG9lcyBzZXZlcmFsIHRoaW5nczpcblxuICAgICAqIHdhdGNoZXMgeW91ciBsb2NhbCBmaWxlc3lzdGVtIGZvciBjaGFuZ2VzIGFuZCBhdXRvbWF0aWNhbGx5IHJlc3RhcnRzIGZvciB5b3UuXG4gICAgICogbGludCB5b3VyIGNvZGUgb24gYnVpbGRcbiAgICAgKiBydW4gYSBzZWN1cml0eSBhdWRpdCBvZiB5b3VyIHBhY2thZ2UuanNvbiBvbiBidWlsZCAodmlhIG5zcClcblxuICAgIEluIHByb2R1Y3Rpb24sIHRoZSBhYm92ZSBmZWF0dXJlcyBhcmUgZGlzYWJsZWQgYnkgZGVmYXVsdCwgYW5kIGluc3RlYWQ6XG5cbiAgICAgKiB0aGUgc2VydmVyIHdpbGwgZm9yayB3b3JrZXIgcHJvY2Vzc2VzIHRvIG1heGltaXplIENQVSBjb3JlIHVzYWdlYDtcblxuICBzdGF0aWMgcnVuc0luQXBwID0gdHJ1ZTtcblxuICBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRhcmdldCBlbnZpcm9ubWVudCB0byBidWlsZCBmb3IuJyxcbiAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdkZXZlbG9wbWVudCcsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICBkZWJ1Zzoge1xuICAgICAgZGVzY3JpcHRpb246ICdSdW4gaW4gZGVidWcgbW9kZSAoYWRkIHRoZSAtLWRlYnVnIGZsYWcgdG8gbm9kZSwgbGF1bmNoIG5vZGUtaW5zcGVjdG9yKScsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICB3YXRjaDoge1xuICAgICAgZGVzY3JpcHRpb246ICdSZXN0YXJ0IHRoZSBzZXJ2ZXIgd2hlbiB0aGUgc291cmNlIGZpbGVzIGNoYW5nZSAoZGVmYXVsdDogdHJ1ZSBpbiBkZXZlbG9wbWVudCknLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHBvcnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHBvcnQgdGhlIEhUVFAgc2VydmVyIHNob3VsZCBiaW5kIHRvIChkZWZhdWx0OiBwcm9jZXNzLmVudi5QT1JUIG9yIDMwMDApJyxcbiAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52LlBPUlQgfHwgMzAwMCxcbiAgICAgIHR5cGU6IDxhbnk+J251bWJlcidcbiAgICB9LFxuICAgIHNraXBCdWlsZDoge1xuICAgICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgYnVpbGQgdGhlIGFwcCBiZWZvcmUgbGF1bmNoaW5nIHRoZSBzZXJ2ZXIuIFVzZWZ1bCBpbiBwcm9kdWN0aW9uIGlmIHlvdSBwcmVidWlsZCB0aGUgYXBwIGJlZm9yZSBkZXBsb3lpbmcuIEltcGxpZXMgLS1za2lwLWxpbnQgYW5kIC0tc2tpcC1hdWRpdC5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHNraXBMaW50OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1NraXAgbGludGluZyB0aGUgYXBwIHNvdXJjZSBmaWxlcycsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBza2lwQXVkaXQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2tpcCBhdWRpdGluZyB5b3VyIHBhY2thZ2UuanNvbiBmb3IgdnVsbmVyYWJpbGl0ZXMnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgb3V0cHV0OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBkaXJlY3RvcnkgdG8gd3JpdGUgdGhlIGNvbXBpbGVkIGFwcCB0by4gRGVmYXVsdHMgdG8gYSB0bXAgZGlyZWN0b3J5JyxcbiAgICAgIGRlZmF1bHQ6ICdkaXN0JyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIHByb2R1Y3Rpb246IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvcnRoYW5kIGZvciBcIi0tc2tpcC1idWlsZCAtLWVudmlyb25tZW50IHByb2R1Y3Rpb25cIicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBwcmludFNsb3dUcmVlczoge1xuICAgICAgZGVzY3JpcHRpb246ICdQcmludCBvdXQgYW4gYW5hbHlzaXMgb2YgdGhlIGJ1aWxkIHByb2Nlc3MsIHNob3dpbmcgdGhlIHNsb3dlc3Qgbm9kZXMuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9XG4gIH07XG5cbiAgc2VydmVyOiBDaGlsZFByb2Nlc3M7XG5cbiAgYXN5bmMgcnVuKGFyZ3Y6IGFueSkge1xuICAgIGRlYnVnKCdydW5uaW5nIHNlcnZlciBjb21tYW5kJyk7XG4gICAgaWYgKGFyZ3YucHJvZHVjdGlvbikge1xuICAgICAgYXJndi5za2lwQnVpbGQgPSB0cnVlO1xuICAgICAgYXJndi5lbnZpcm9ubWVudCA9ICdwcm9kdWN0aW9uJztcbiAgICB9XG4gICAgYXJndi53YXRjaCA9IGFyZ3Yud2F0Y2ggfHwgYXJndi5lbnZpcm9ubWVudCA9PT0gJ2RldmVsb3BtZW50JztcblxuICAgIGlmIChhcmd2LnNraXBCdWlsZCkge1xuICAgICAgdGhpcy5zdGFydFNlcnZlcihhcmd2KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgIGVudmlyb25tZW50OiBhcmd2LmVudmlyb25tZW50LFxuICAgICAgcHJpbnRTbG93VHJlZXM6IGFyZ3YucHJpbnRTbG93VHJlZXMsXG4gICAgICBhdWRpdDogIWFyZ3Yuc2tpcEF1ZGl0LFxuICAgICAgbGludDogIWFyZ3Yuc2tpcExpbnQsXG4gICAgICBidWlsZER1bW15OiB0cnVlXG4gICAgfSk7XG5cbiAgICBwcm9jZXNzLm9uKCdleGl0JywgdGhpcy5jbGVhbkV4aXQuYmluZCh0aGlzKSk7XG4gICAgcHJvY2Vzcy5vbignU0lHSU5UJywgdGhpcy5jbGVhbkV4aXQuYmluZCh0aGlzKSk7XG4gICAgcHJvY2Vzcy5vbignU0lHVEVSTScsIHRoaXMuY2xlYW5FeGl0LmJpbmQodGhpcykpO1xuXG4gICAgaWYgKGFyZ3Yud2F0Y2gpIHtcbiAgICAgIGRlYnVnKCdzdGFydGluZyB3YXRjaGVyJyk7XG4gICAgICBwcm9qZWN0LndhdGNoKHtcbiAgICAgICAgb3V0cHV0RGlyOiBhcmd2Lm91dHB1dCxcbiAgICAgICAgb25CdWlsZDogKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICAgICAgZGVidWcoJ2tpbGxpbmcgZXhpc3Rpbmcgc2VydmVyJyk7XG4gICAgICAgICAgICB0aGlzLnNlcnZlci5yZW1vdmVBbGxMaXN0ZW5lcnMoJ2V4aXQnKTtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyLmtpbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdGFydFNlcnZlcihhcmd2KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdidWlsZGluZyBwcm9qZWN0Jyk7XG4gICAgICBhd2FpdCBwcm9qZWN0LmJ1aWxkKGFyZ3Yub3V0cHV0KTtcbiAgICAgIHRoaXMuc3RhcnRTZXJ2ZXIoYXJndik7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNsZWFuRXhpdCgpIHtcbiAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuc2VydmVyLmtpbGwoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhcnRTZXJ2ZXIoYXJndjogYW55KSB7XG4gICAgbGV0IGRpciA9IGFyZ3Yub3V0cHV0O1xuICAgIGxldCBhcmdzID0gWyAnYXBwL2luZGV4LmpzJyBdO1xuICAgIGlmIChhcmd2LmRlYnVnKSB7XG4gICAgICBhcmdzLnVuc2hpZnQoJy0taW5zcGVjdCcsICctLWRlYnVnLWJyaycpO1xuICAgIH1cbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMocGF0aC5qb2luKGRpciwgJ2FwcCcsICdpbmRleC5qcycpKSkge1xuICAgICAgdWkuZXJyb3IoJ1VuYWJsZSB0byBzdGFydCB5b3VyIGFwcGxpY2F0aW9uOiBtaXNzaW5nIGFwcC9pbmRleC5qcyBmaWxlJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRlYnVnKGBzdGFydGluZyBzZXJ2ZXIgcHJvY2VzczogJHsgcHJvY2Vzcy5leGVjUGF0aCB9ICR7IGFyZ3Muam9pbignICcpIH1gKTtcbiAgICB0aGlzLnNlcnZlciA9IHNwYXduKHByb2Nlc3MuZXhlY1BhdGgsIGFyZ3MsIHtcbiAgICAgIGN3ZDogZGlyLFxuICAgICAgc3RkaW86IFsgJ3BpcGUnLCBwcm9jZXNzLnN0ZG91dCwgcHJvY2Vzcy5zdGRlcnIgXSxcbiAgICAgIGVudjogbWVyZ2UoY2xvbmUocHJvY2Vzcy5lbnYpLCB7XG4gICAgICAgIFBPUlQ6IGFyZ3YucG9ydCxcbiAgICAgICAgTk9ERV9FTlY6IGFyZ3YuZW52aXJvbm1lbnRcbiAgICAgIH0pXG4gICAgfSk7XG4gICAgdGhpcy5zZXJ2ZXIub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICB1aS5lcnJvcignVW5hYmxlIHRvIHN0YXJ0IHlvdXIgYXBwbGljYXRpb246Jyk7XG4gICAgICB1aS5lcnJvcihlcnJvci5zdGFjayk7XG4gICAgfSk7XG4gICAgaWYgKGFyZ3Yud2F0Y2gpIHtcbiAgICAgIHRoaXMuc2VydmVyLm9uKCdleGl0JywgKGNvZGUpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGNvZGUgPT09IDAgPyAnZXhpdGVkJyA6ICdjcmFzaGVkJztcbiAgICAgICAgdWkuZXJyb3IoYFNlcnZlciAkeyByZXN1bHQgfS4gd2FpdGluZyBmb3IgY2hhbmdlcyB0byByZXN0YXJ0IC4uLmApO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==