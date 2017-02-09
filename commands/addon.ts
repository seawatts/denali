import dedent from 'dedent-js';
import path from 'path';
import { Command } from 'denali-cli';
import AddonBlueprint from '../blueprints/addon';

export default class AddonCommand extends Command {

  static commandName = 'addon';
  static description = 'Create a new denali addon';
  static longDescription = dedent`
    Scaffolds a new addon project. Addons are the core of Denali's extensibility,
    and are bundled as node modules. This scaffold is a starting point for
    developing your own addons.

    For more information on using and developing addons, check out the guides:
    http://denalijs.github.com/denali/guides/addons`;

  static params: AddonBlueprint.params

  async run(argv: any) {
    let blueprint = new AddonBlueprint(path.join(__dirname, '..', 'blueprints', 'addon'));
    await blueprint.generate(this.parseArgs.call(blueprint, argTokens));
  }

}
