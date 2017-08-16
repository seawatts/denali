"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const denali_cli_1 = require("denali-cli");
/**
 * Compile your app
 *
 * @package commands
 */
class BuildCommand extends denali_cli_1.Command {
    constructor() {
        super(...arguments);
        this.runsInApp = true;
    }
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let project = new denali_cli_1.Project({
                environment: argv.environment,
                printSlowTrees: argv.printSlowTrees,
                lint: !argv.skipLint,
                audit: !argv.skipAudit
            });
            if (argv.watch) {
                project.watch({
                    outputDir: argv.output
                });
            }
            else {
                try {
                    yield project.build(argv.output);
                }
                catch (error) {
                    yield denali_cli_1.spinner.fail('Build failed');
                    denali_cli_1.ui.error(error.stack);
                }
            }
        });
    }
}
/* tslint:disable:completed-docs typedef */
BuildCommand.commandName = 'build';
BuildCommand.description = 'Compile your app';
BuildCommand.longDescription = denali_cli_1.unwrap `
    Compiles your app based on your denali-build.js file, as well as any build-related addons.
  `;
BuildCommand.flags = {
    environment: {
        description: 'The target environment to build for.',
        default: process.env.NODE_ENV || 'development',
        type: 'string'
    },
    output: {
        description: 'The directory to build into',
        default: 'dist',
        type: 'string'
    },
    watch: {
        description: 'Continuously watch the source files and rebuild on changes',
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
    printSlowTrees: {
        description: 'Print out an analysis of the build process, showing the slowest nodes.',
        default: false,
        type: 'boolean'
    }
};
exports.default = BuildCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL2J1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUFtRTtBQUVuRTs7OztHQUlHO0FBQ0gsa0JBQWtDLFNBQVEsb0JBQU87SUFBakQ7O1FBMENFLGNBQVMsR0FBRyxJQUFJLENBQUM7SUF3Qm5CLENBQUM7SUF0Qk8sR0FBRyxDQUFDLElBQVM7O1lBQ2pCLElBQUksT0FBTyxHQUFHLElBQUksb0JBQU8sQ0FBQztnQkFDeEIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUM3QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7Z0JBQ25DLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRO2dCQUNwQixLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUzthQUN2QixDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZixPQUFPLENBQUMsS0FBSyxDQUFDO29CQUNaLFNBQVMsRUFBVSxJQUFJLENBQUMsTUFBTTtpQkFDL0IsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQztvQkFDSCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuQyxDQUFDO2dCQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2YsTUFBTSxvQkFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDbkMsZUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztLQUFBOztBQTlERCwyQ0FBMkM7QUFDcEMsd0JBQVcsR0FBRyxPQUFPLENBQUM7QUFDdEIsd0JBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUNqQyw0QkFBZSxHQUFHLG1CQUFNLENBQUE7O0dBRTlCLENBQUM7QUFFSyxrQkFBSyxHQUFHO0lBQ2IsV0FBVyxFQUFFO1FBQ1gsV0FBVyxFQUFFLHNDQUFzQztRQUNuRCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYTtRQUM5QyxJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELE1BQU0sRUFBRTtRQUNOLFdBQVcsRUFBRSw2QkFBNkI7UUFDMUMsT0FBTyxFQUFFLE1BQU07UUFDZixJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELEtBQUssRUFBRTtRQUNMLFdBQVcsRUFBRSw0REFBNEQ7UUFDekUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFFBQVEsRUFBRTtRQUNSLFdBQVcsRUFBRSxtQ0FBbUM7UUFDaEQsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSxvREFBb0Q7UUFDakUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELGNBQWMsRUFBRTtRQUNkLFdBQVcsRUFBRSx3RUFBd0U7UUFDckYsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtDQUNGLENBQUM7QUF4Q0osK0JBa0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdWksIHNwaW5uZXIsIENvbW1hbmQsIFByb2plY3QsIHVud3JhcCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuXG4vKipcbiAqIENvbXBpbGUgeW91ciBhcHBcbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCdWlsZENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHN0YXRpYyBjb21tYW5kTmFtZSA9ICdidWlsZCc7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdDb21waWxlIHlvdXIgYXBwJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBDb21waWxlcyB5b3VyIGFwcCBiYXNlZCBvbiB5b3VyIGRlbmFsaS1idWlsZC5qcyBmaWxlLCBhcyB3ZWxsIGFzIGFueSBidWlsZC1yZWxhdGVkIGFkZG9ucy5cbiAgYDtcblxuICBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRhcmdldCBlbnZpcm9ubWVudCB0byBidWlsZCBmb3IuJyxcbiAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdkZXZlbG9wbWVudCcsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGRpcmVjdG9yeSB0byBidWlsZCBpbnRvJyxcbiAgICAgIGRlZmF1bHQ6ICdkaXN0JyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIHdhdGNoOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0NvbnRpbnVvdXNseSB3YXRjaCB0aGUgc291cmNlIGZpbGVzIGFuZCByZWJ1aWxkIG9uIGNoYW5nZXMnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgc2tpcExpbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2tpcCBsaW50aW5nIHRoZSBhcHAgc291cmNlIGZpbGVzJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHNraXBBdWRpdDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTa2lwIGF1ZGl0aW5nIHlvdXIgcGFja2FnZS5qc29uIGZvciB2dWxuZXJhYmlsaXRlcycsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBwcmludFNsb3dUcmVlczoge1xuICAgICAgZGVzY3JpcHRpb246ICdQcmludCBvdXQgYW4gYW5hbHlzaXMgb2YgdGhlIGJ1aWxkIHByb2Nlc3MsIHNob3dpbmcgdGhlIHNsb3dlc3Qgbm9kZXMuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9XG4gIH07XG5cbiAgcnVuc0luQXBwID0gdHJ1ZTtcblxuICBhc3luYyBydW4oYXJndjogYW55KSB7XG4gICAgbGV0IHByb2plY3QgPSBuZXcgUHJvamVjdCh7XG4gICAgICBlbnZpcm9ubWVudDogYXJndi5lbnZpcm9ubWVudCxcbiAgICAgIHByaW50U2xvd1RyZWVzOiBhcmd2LnByaW50U2xvd1RyZWVzLFxuICAgICAgbGludDogIWFyZ3Yuc2tpcExpbnQsXG4gICAgICBhdWRpdDogIWFyZ3Yuc2tpcEF1ZGl0XG4gICAgfSk7XG5cbiAgICBpZiAoYXJndi53YXRjaCkge1xuICAgICAgcHJvamVjdC53YXRjaCh7XG4gICAgICAgIG91dHB1dERpcjogPHN0cmluZz5hcmd2Lm91dHB1dFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHByb2plY3QuYnVpbGQoYXJndi5vdXRwdXQpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgYXdhaXQgc3Bpbm5lci5mYWlsKCdCdWlsZCBmYWlsZWQnKTtcbiAgICAgICAgdWkuZXJyb3IoZXJyb3Iuc3RhY2spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iXX0=