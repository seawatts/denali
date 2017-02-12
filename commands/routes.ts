import unwrap from '../lib/utils/unwrap';
import CliTable from 'cli-table2';
import { ui, Command, Project } from 'denali-cli';
import Application from '../lib/runtime/application';

export default class RoutesCommand extends Command {

  static commandName = 'routes';
  static description = 'Display all defined routes within your application.';
  static longDescription = unwrap`
    Displays routes from your application and any routes added by addons.
    Display shows the method, endpoint, and the action associated to that
    route.`;

  static runsInApp = true;

  static flags = {
    environment: {
      description: 'The target environment to build for.',
      defaultValue: 'development',
      type: <any>'string'
    },
    'print-slow-trees': {
      description: 'Print out an analysis of the build process, showing the slowest nodes.',
      defaultValue: false,
      type: <any>'boolean'
    }
  };

  async run(argv: any) {
    let project = new Project({
      environment: argv.environment,
      printSlowTrees: argv.printSlowTrees,
      buildDummy: true
    });
    let application: Application = await project.createApplication();
    await application.runInitializers();
    let routes = application.router.routes;
    let methods = Object.keys(routes);
    let table = new CliTable({
      head: [ 'URL', 'ACTION' ]
    });

    methods.forEach((method) => {
      let methodRoutes = routes[method];

      methodRoutes.forEach((route) => {
        table.push([ `${ method.toUpperCase() } ${ route.spec.replace(/\(\/\)$/, '/') }`, route.actionPath ]);
      });
    });

    ui.info(table.toString());
  }

}
