"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Bluebird = require("bluebird");
const cmdExists = require("command-exists");
const denali_cli_1 = require("denali-cli");
const child_process_1 = require("child_process");
const commandExists = Bluebird.promisify(cmdExists);
/**
 * Install an addon in your app.
 *
 * @package commands
 */
class InstallCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this.installAddon(argv.addonName);
            }
            catch (err) {
                yield this.fail(err.stack || err);
            }
        });
    }
    installAddon(addonName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Find the package info first to confirm it exists and is a denali addon
            let pkgManager = (yield commandExists('yarn')) ? 'yarn' : 'npm';
            yield denali_cli_1.spinner.start(`Searching for "${addonName}" addon ...`);
            let pkgInfo;
            let pkg;
            try {
                pkgInfo = child_process_1.execSync(`npm info ${addonName} --json`);
                pkg = JSON.parse(pkgInfo.toString());
            }
            catch (e) {
                this.fail('Lookup failed: ' + e.stack);
            }
            let isAddon = pkg.keywords.includes('denali-addon');
            if (!isAddon) {
                this.fail(`${addonName} is not a Denali addon.`);
            }
            yield denali_cli_1.spinner.succeed('Addon package found');
            // Install the package
            yield denali_cli_1.spinner.start(`Installing ${pkg.name}@${pkg.version}`);
            let installCommand = pkgManager === 'yarn' ? 'yarn add --mutex network' : 'npm install --save';
            try {
                child_process_1.execSync(`${installCommand} ${addonName}`, { stdio: 'pipe' });
            }
            catch (e) {
                this.fail('Install failed: ' + e.stack);
            }
            yield denali_cli_1.spinner.succeed('Addon package installed');
            // Run the installation blueprint
            let blueprints = denali_cli_1.Blueprint.findBlueprints(true);
            if (blueprints[addonName]) {
                denali_cli_1.ui.info('Running default blueprint for addon');
                let blueprint = new blueprints[addonName]();
                yield blueprint.generate({});
                yield denali_cli_1.spinner.succeed('Addon installed');
            }
        });
    }
    fail(msg) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield denali_cli_1.spinner.fail(`Install failed: ${msg}`);
            yield process.exit(1);
        });
    }
}
/* tslint:disable:completed-docs typedef */
InstallCommand.commandName = 'install';
InstallCommand.description = 'Install an addon in your app.';
InstallCommand.longDescription = denali_cli_1.unwrap `
    Installs the supplied addon in the project. Essentially a shortcut for \`npm install --save
    <addon>\`, with sanity checking that the project actually is a Denali addon.`;
InstallCommand.runsInApp = true;
InstallCommand.params = '<addonName>';
exports.default = InstallCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvaW5zdGFsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsNENBQTRDO0FBQzVDLDJDQUFxRTtBQUNyRSxpREFBZ0Q7QUFFaEQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBa0IsU0FBUyxDQUFDLENBQUM7QUFFckU7Ozs7R0FJRztBQUNILG9CQUFvQyxTQUFRLG9CQUFPO0lBYTNDLEdBQUcsQ0FBQyxJQUFTOztZQUNqQixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDYixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNwQyxDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBRUssWUFBWSxDQUFDLFNBQWlCOztZQUNsQyx5RUFBeUU7WUFDekUsSUFBSSxVQUFVLEdBQUcsQ0FBQSxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBRyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQzlELE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsa0JBQW1CLFNBQVUsYUFBYSxDQUFDLENBQUM7WUFDaEUsSUFBSSxPQUFPLENBQUM7WUFDWixJQUFJLEdBQUcsQ0FBQztZQUNSLElBQUksQ0FBQztnQkFDSCxPQUFPLEdBQUcsd0JBQUcsQ0FBQyxZQUFhLFNBQVUsU0FBUyxDQUFDLENBQUM7Z0JBQ2hELEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFDRCxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFJLFNBQVUseUJBQXlCLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBQ0QsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRTdDLHNCQUFzQjtZQUN0QixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLGNBQWUsR0FBRyxDQUFDLElBQUssSUFBSyxHQUFHLENBQUMsT0FBUSxFQUFFLENBQUMsQ0FBQztZQUNqRSxJQUFJLGNBQWMsR0FBRyxVQUFVLEtBQUssTUFBTSxHQUFHLDBCQUEwQixHQUFHLG9CQUFvQixDQUFDO1lBQy9GLElBQUksQ0FBQztnQkFDSCx3QkFBRyxDQUFDLEdBQUksY0FBZSxJQUFLLFNBQVUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDL0QsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUNELE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUVqRCxpQ0FBaUM7WUFDakMsSUFBSSxVQUFVLEdBQUcsc0JBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsZUFBRSxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxNQUFNLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzQyxDQUFDO1FBRUgsQ0FBQztLQUFBO0lBRWEsSUFBSSxDQUFDLEdBQVc7O1lBQzVCLE1BQU0sb0JBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW9CLEdBQUksRUFBRSxDQUFDLENBQUM7WUFDL0MsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7S0FBQTs7QUE3REQsMkNBQTJDO0FBQ3BDLDBCQUFXLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLDBCQUFXLEdBQUcsK0JBQStCLENBQUM7QUFDOUMsOEJBQWUsR0FBRyxtQkFBTSxDQUFBOztpRkFFZ0QsQ0FBQztBQUV6RSx3QkFBUyxHQUFHLElBQUksQ0FBQztBQUVqQixxQkFBTSxHQUFHLGFBQWEsQ0FBQztBQVhoQyxpQ0FpRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgKiBhcyBjbWRFeGlzdHMgZnJvbSAnY29tbWFuZC1leGlzdHMnO1xuaW1wb3J0IHsgdWksIHNwaW5uZXIsIENvbW1hbmQsIEJsdWVwcmludCwgdW53cmFwIH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5pbXBvcnQgeyBleGVjU3luYyBhcyBydW4gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgY29tbWFuZEV4aXN0cyA9IEJsdWViaXJkLnByb21pc2lmeTxib29sZWFuLCBzdHJpbmc+KGNtZEV4aXN0cyk7XG5cbi8qKlxuICogSW5zdGFsbCBhbiBhZGRvbiBpbiB5b3VyIGFwcC5cbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnN0YWxsQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGNvbW1hbmROYW1lID0gJ2luc3RhbGwnO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnSW5zdGFsbCBhbiBhZGRvbiBpbiB5b3VyIGFwcC4nO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIEluc3RhbGxzIHRoZSBzdXBwbGllZCBhZGRvbiBpbiB0aGUgcHJvamVjdC4gRXNzZW50aWFsbHkgYSBzaG9ydGN1dCBmb3IgXFxgbnBtIGluc3RhbGwgLS1zYXZlXG4gICAgPGFkZG9uPlxcYCwgd2l0aCBzYW5pdHkgY2hlY2tpbmcgdGhhdCB0aGUgcHJvamVjdCBhY3R1YWxseSBpcyBhIERlbmFsaSBhZGRvbi5gO1xuXG4gIHN0YXRpYyBydW5zSW5BcHAgPSB0cnVlO1xuXG4gIHN0YXRpYyBwYXJhbXMgPSAnPGFkZG9uTmFtZT4nO1xuXG4gIGFzeW5jIHJ1bihhcmd2OiBhbnkpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5pbnN0YWxsQWRkb24oYXJndi5hZGRvbk5hbWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgYXdhaXQgdGhpcy5mYWlsKGVyci5zdGFjayB8fCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGluc3RhbGxBZGRvbihhZGRvbk5hbWU6IHN0cmluZykge1xuICAgIC8vIEZpbmQgdGhlIHBhY2thZ2UgaW5mbyBmaXJzdCB0byBjb25maXJtIGl0IGV4aXN0cyBhbmQgaXMgYSBkZW5hbGkgYWRkb25cbiAgICBsZXQgcGtnTWFuYWdlciA9IGF3YWl0IGNvbW1hbmRFeGlzdHMoJ3lhcm4nKSA/ICd5YXJuJyA6ICducG0nO1xuICAgIGF3YWl0IHNwaW5uZXIuc3RhcnQoYFNlYXJjaGluZyBmb3IgXCIkeyBhZGRvbk5hbWUgfVwiIGFkZG9uIC4uLmApO1xuICAgIGxldCBwa2dJbmZvO1xuICAgIGxldCBwa2c7XG4gICAgdHJ5IHtcbiAgICAgIHBrZ0luZm8gPSBydW4oYG5wbSBpbmZvICR7IGFkZG9uTmFtZSB9IC0tanNvbmApO1xuICAgICAgcGtnID0gSlNPTi5wYXJzZShwa2dJbmZvLnRvU3RyaW5nKCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuZmFpbCgnTG9va3VwIGZhaWxlZDogJyArIGUuc3RhY2spO1xuICAgIH1cbiAgICBsZXQgaXNBZGRvbiA9IHBrZy5rZXl3b3Jkcy5pbmNsdWRlcygnZGVuYWxpLWFkZG9uJyk7XG4gICAgaWYgKCFpc0FkZG9uKSB7XG4gICAgICB0aGlzLmZhaWwoYCR7IGFkZG9uTmFtZSB9IGlzIG5vdCBhIERlbmFsaSBhZGRvbi5gKTtcbiAgICB9XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdBZGRvbiBwYWNrYWdlIGZvdW5kJyk7XG5cbiAgICAvLyBJbnN0YWxsIHRoZSBwYWNrYWdlXG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydChgSW5zdGFsbGluZyAkeyBwa2cubmFtZSB9QCR7IHBrZy52ZXJzaW9uIH1gKTtcbiAgICBsZXQgaW5zdGFsbENvbW1hbmQgPSBwa2dNYW5hZ2VyID09PSAneWFybicgPyAneWFybiBhZGQgLS1tdXRleCBuZXR3b3JrJyA6ICducG0gaW5zdGFsbCAtLXNhdmUnO1xuICAgIHRyeSB7XG4gICAgICBydW4oYCR7IGluc3RhbGxDb21tYW5kIH0gJHsgYWRkb25OYW1lIH1gLCB7IHN0ZGlvOiAncGlwZScgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5mYWlsKCdJbnN0YWxsIGZhaWxlZDogJyArIGUuc3RhY2spO1xuICAgIH1cbiAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoJ0FkZG9uIHBhY2thZ2UgaW5zdGFsbGVkJyk7XG5cbiAgICAvLyBSdW4gdGhlIGluc3RhbGxhdGlvbiBibHVlcHJpbnRcbiAgICBsZXQgYmx1ZXByaW50cyA9IEJsdWVwcmludC5maW5kQmx1ZXByaW50cyh0cnVlKTtcbiAgICBpZiAoYmx1ZXByaW50c1thZGRvbk5hbWVdKSB7XG4gICAgICB1aS5pbmZvKCdSdW5uaW5nIGRlZmF1bHQgYmx1ZXByaW50IGZvciBhZGRvbicpO1xuICAgICAgbGV0IGJsdWVwcmludCA9IG5ldyBibHVlcHJpbnRzW2FkZG9uTmFtZV0oKTtcbiAgICAgIGF3YWl0IGJsdWVwcmludC5nZW5lcmF0ZSh7fSk7XG4gICAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoJ0FkZG9uIGluc3RhbGxlZCcpO1xuICAgIH1cblxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBmYWlsKG1zZzogc3RyaW5nKSB7XG4gICAgYXdhaXQgc3Bpbm5lci5mYWlsKGBJbnN0YWxsIGZhaWxlZDogJHsgbXNnIH1gKTtcbiAgICBhd2FpdCBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxufVxuIl19