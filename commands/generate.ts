import { Command, Blueprint, unwrap } from 'denali-cli';

/**
 * Scaffold code for your app.
 *
 * @package commands
 */
export default class GenerateCommand extends Command {

  /* tslint:disable:completed-docs typedef */
  static commandName = 'generate';
  static description = 'Scaffold code for your app.';
  static longDescription = unwrap`
    Usage: denali generate <blueprint> [options]

    Generates code from the given blueprint. Blueprints are templates used by the
    generate command, but they can go beyond simple templating (i.e. installing
    addons).
  `;

  static params = '<blueprint>';

  static flags = {
    skipPostInstall: {
      description: "Don't run any post install hooks for the blueprint",
      default: false,
      type: <any>'boolean'
    }
  };

  protected static configureSubcommands(commandName: string, yargs: any, projectPkg: any): any {
    return Blueprint.findAndConfigureBlueprints(yargs, 'generate', projectPkg);
  }

}
