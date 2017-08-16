"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const CliTable = require("cli-table2");
const denali_cli_1 = require("denali-cli");
/**
 * Display all defined routes within your application.
 *
 * @package commands
 */
class RoutesCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let project = new denali_cli_1.Project({
                environment: argv.environment,
                printSlowTrees: argv.printSlowTrees,
                buildDummy: true
            });
            let application = yield project.createApplication();
            yield application.runInitializers();
            let routes = application.router.routes;
            let methods = Object.keys(routes);
            let table = new CliTable({
                head: ['URL', 'ACTION']
            });
            methods.forEach((method) => {
                let methodRoutes = routes[method];
                methodRoutes.forEach((route) => {
                    table.push([`${method.toUpperCase()} ${route.spec.replace(/\(\/\)$/, '/')}`, route.actionPath]);
                });
            });
            denali_cli_1.ui.info(table.toString());
        });
    }
}
/* tslint:disable:completed-docs typedef */
RoutesCommand.commandName = 'routes';
RoutesCommand.description = 'Display all defined routes within your application.';
RoutesCommand.longDescription = denali_cli_1.unwrap `
    Displays routes from your application and any routes added by addons.
    Display shows the method, endpoint, and the action associated to that
    route.`;
RoutesCommand.runsInApp = true;
RoutesCommand.flags = {
    environment: {
        description: 'The target environment to build for.',
        default: process.env.NODE_ENV || 'development',
        type: 'string'
    },
    'print-slow-trees': {
        description: 'Print out an analysis of the build process, showing the slowest nodes.',
        default: false,
        type: 'boolean'
    }
};
exports.default = RoutesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy9yb3V0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQXVDO0FBQ3ZDLDJDQUEwRDtBQUcxRDs7OztHQUlHO0FBQ0gsbUJBQW1DLFNBQVEsb0JBQU87SUF5QjFDLEdBQUcsQ0FBQyxJQUFTOztZQUNqQixJQUFJLE9BQU8sR0FBRyxJQUFJLG9CQUFPLENBQUM7Z0JBQ3hCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjO2dCQUNuQyxVQUFVLEVBQUUsSUFBSTthQUNqQixDQUFDLENBQUM7WUFDSCxJQUFJLFdBQVcsR0FBZ0IsTUFBTSxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNqRSxNQUFNLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwQyxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN2QyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xDLElBQUksS0FBSyxHQUFHLElBQUksUUFBUSxDQUFDO2dCQUN2QixJQUFJLEVBQUUsQ0FBRSxLQUFLLEVBQUUsUUFBUSxDQUFFO2FBQzFCLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNO2dCQUNyQixJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWxDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLO29CQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUUsR0FBSSxNQUFNLENBQUMsV0FBVyxFQUFHLElBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBRSxDQUFDLENBQUM7Z0JBQ3hHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxlQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLENBQUM7S0FBQTs7QUE5Q0QsMkNBQTJDO0FBQ3BDLHlCQUFXLEdBQUcsUUFBUSxDQUFDO0FBQ3ZCLHlCQUFXLEdBQUcscURBQXFELENBQUM7QUFDcEUsNkJBQWUsR0FBRyxtQkFBTSxDQUFBOzs7V0FHdEIsQ0FBQztBQUVILHVCQUFTLEdBQUcsSUFBSSxDQUFDO0FBRWpCLG1CQUFLLEdBQUc7SUFDYixXQUFXLEVBQUU7UUFDWCxXQUFXLEVBQUUsc0NBQXNDO1FBQ25ELE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxhQUFhO1FBQzlDLElBQUksRUFBTyxRQUFRO0tBQ3BCO0lBQ0Qsa0JBQWtCLEVBQUU7UUFDbEIsV0FBVyxFQUFFLHdFQUF3RTtRQUNyRixPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0NBQ0YsQ0FBQztBQXZCSixnQ0FrREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBDbGlUYWJsZSBmcm9tICdjbGktdGFibGUyJztcbmltcG9ydCB7IHVpLCBDb21tYW5kLCBQcm9qZWN0LCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuLi9saWIvcnVudGltZS9hcHBsaWNhdGlvbic7XG5cbi8qKlxuICogRGlzcGxheSBhbGwgZGVmaW5lZCByb3V0ZXMgd2l0aGluIHlvdXIgYXBwbGljYXRpb24uXG4gKlxuICogQHBhY2thZ2UgY29tbWFuZHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm91dGVzQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGNvbW1hbmROYW1lID0gJ3JvdXRlcyc7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdEaXNwbGF5IGFsbCBkZWZpbmVkIHJvdXRlcyB3aXRoaW4geW91ciBhcHBsaWNhdGlvbi4nO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIERpc3BsYXlzIHJvdXRlcyBmcm9tIHlvdXIgYXBwbGljYXRpb24gYW5kIGFueSByb3V0ZXMgYWRkZWQgYnkgYWRkb25zLlxuICAgIERpc3BsYXkgc2hvd3MgdGhlIG1ldGhvZCwgZW5kcG9pbnQsIGFuZCB0aGUgYWN0aW9uIGFzc29jaWF0ZWQgdG8gdGhhdFxuICAgIHJvdXRlLmA7XG5cbiAgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgc3RhdGljIGZsYWdzID0ge1xuICAgIGVudmlyb25tZW50OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSB0YXJnZXQgZW52aXJvbm1lbnQgdG8gYnVpbGQgZm9yLicsXG4gICAgICBkZWZhdWx0OiBwcm9jZXNzLmVudi5OT0RFX0VOViB8fCAnZGV2ZWxvcG1lbnQnLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgJ3ByaW50LXNsb3ctdHJlZXMnOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1ByaW50IG91dCBhbiBhbmFseXNpcyBvZiB0aGUgYnVpbGQgcHJvY2Vzcywgc2hvd2luZyB0aGUgc2xvd2VzdCBub2Rlcy4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH1cbiAgfTtcblxuICBhc3luYyBydW4oYXJndjogYW55KSB7XG4gICAgbGV0IHByb2plY3QgPSBuZXcgUHJvamVjdCh7XG4gICAgICBlbnZpcm9ubWVudDogYXJndi5lbnZpcm9ubWVudCxcbiAgICAgIHByaW50U2xvd1RyZWVzOiBhcmd2LnByaW50U2xvd1RyZWVzLFxuICAgICAgYnVpbGREdW1teTogdHJ1ZVxuICAgIH0pO1xuICAgIGxldCBhcHBsaWNhdGlvbjogQXBwbGljYXRpb24gPSBhd2FpdCBwcm9qZWN0LmNyZWF0ZUFwcGxpY2F0aW9uKCk7XG4gICAgYXdhaXQgYXBwbGljYXRpb24ucnVuSW5pdGlhbGl6ZXJzKCk7XG4gICAgbGV0IHJvdXRlcyA9IGFwcGxpY2F0aW9uLnJvdXRlci5yb3V0ZXM7XG4gICAgbGV0IG1ldGhvZHMgPSBPYmplY3Qua2V5cyhyb3V0ZXMpO1xuICAgIGxldCB0YWJsZSA9IG5ldyBDbGlUYWJsZSh7XG4gICAgICBoZWFkOiBbICdVUkwnLCAnQUNUSU9OJyBdXG4gICAgfSk7XG5cbiAgICBtZXRob2RzLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgbGV0IG1ldGhvZFJvdXRlcyA9IHJvdXRlc1ttZXRob2RdO1xuXG4gICAgICBtZXRob2RSb3V0ZXMuZm9yRWFjaCgocm91dGUpID0+IHtcbiAgICAgICAgdGFibGUucHVzaChbIGAkeyBtZXRob2QudG9VcHBlckNhc2UoKSB9ICR7IHJvdXRlLnNwZWMucmVwbGFjZSgvXFwoXFwvXFwpJC8sICcvJykgfWAsIHJvdXRlLmFjdGlvblBhdGggXSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHVpLmluZm8odGFibGUudG9TdHJpbmcoKSk7XG4gIH1cblxufVxuIl19