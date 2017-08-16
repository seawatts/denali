"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const Bluebird = require("bluebird");
const denali_cli_1 = require("denali-cli");
const child_process_1 = require("child_process");
const read_pkg_1 = require("read-pkg");
const run = Bluebird.promisify(child_process_1.exec);
/**
 * Publish an addon to the npm registry.
 *
 * @package commands
 */
class PublishCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.build();
            if (!argv.skipTests) {
                yield this.runTests();
            }
            yield this.publish();
        });
    }
    runTests() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield denali_cli_1.spinner.start('Running tests');
            try {
                yield run('npm test', {});
            }
            catch (error) {
                yield denali_cli_1.spinner.fail('Tests failed, halting publish');
                throw error;
            }
            yield denali_cli_1.spinner.succeed('Tests passed');
        });
    }
    build() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield denali_cli_1.spinner.start('Building');
            try {
                yield run('npm run build', {});
            }
            catch (error) {
                yield denali_cli_1.spinner.fail('Build failed, halting publish');
                throw error;
            }
            yield denali_cli_1.spinner.succeed('Addon built');
        });
    }
    publish() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield denali_cli_1.spinner.start('Publishing');
            try {
                yield run('npm publish', { cwd: path.join(process.cwd(), 'dist') });
            }
            catch (error) {
                yield denali_cli_1.spinner.fail('Publish failed');
                throw error;
            }
            let pkg = read_pkg_1.sync();
            yield denali_cli_1.spinner.succeed(`${pkg.name} ${pkg.version} published!`);
        });
    }
}
/* tslint:disable:completed-docs typedef */
PublishCommand.commandName = 'publish';
PublishCommand.description = 'Publish an addon to the npm registry.';
PublishCommand.longDescription = denali_cli_1.unwrap `
    Publishes an addon to the npm registry. Runs tests builds the
    addon, and publishes the dist/ directory to the registry.`;
PublishCommand.runsInApp = true;
PublishCommand.flags = {
    skipTests: {
        description: 'Do not run tests before publishing',
        default: false,
        type: 'boolean'
    }
};
exports.default = PublishCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHVibGlzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBNkI7QUFDN0IscUNBQXFDO0FBQ3JDLDJDQUFzRDtBQUN0RCxpREFBa0Q7QUFDbEQsdUNBQTJDO0FBRTNDLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQTBDLG9CQUFJLENBQUMsQ0FBQztBQUU5RTs7OztHQUlHO0FBQ0gsb0JBQW9DLFNBQVEsb0JBQU87SUFtQjNDLEdBQUcsQ0FBQyxJQUFTOztZQUNqQixNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QixDQUFDO1lBQ0QsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsQ0FBQztLQUFBO0lBRWUsUUFBUTs7WUFDdEIsTUFBTSxvQkFBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE1BQU0sb0JBQU8sQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN4QyxDQUFDO0tBQUE7SUFFZSxLQUFLOztZQUNuQixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQztnQkFDSCxNQUFNLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxvQkFBTyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxNQUFNLG9CQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7S0FBQTtJQUVlLE9BQU87O1lBQ3JCLE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDO2dCQUNILE1BQU0sR0FBRyxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxvQkFBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxJQUFJLEdBQUcsR0FBRyxlQUFPLEVBQUUsQ0FBQztZQUNwQixNQUFNLG9CQUFPLENBQUMsT0FBTyxDQUFDLEdBQUksR0FBRyxDQUFDLElBQUssSUFBSyxHQUFHLENBQUMsT0FBUSxhQUFhLENBQUMsQ0FBQztRQUNyRSxDQUFDO0tBQUE7O0FBekRELDJDQUEyQztBQUNwQywwQkFBVyxHQUFHLFNBQVMsQ0FBQztBQUN4QiwwQkFBVyxHQUFHLHVDQUF1QyxDQUFDO0FBQ3RELDhCQUFlLEdBQUcsbUJBQU0sQ0FBQTs7OERBRTZCLENBQUM7QUFFdEQsd0JBQVMsR0FBRyxJQUFJLENBQUM7QUFFakIsb0JBQUssR0FBRztJQUNiLFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSxvQ0FBb0M7UUFDakQsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtDQUNGLENBQUM7QUFqQkosaUNBNkRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IHNwaW5uZXIsIENvbW1hbmQsIHVud3JhcCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHsgZXhlYywgRXhlY09wdGlvbnMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHN5bmMgYXMgcmVhZFBrZyB9IGZyb20gJ3JlYWQtcGtnJztcblxuY29uc3QgcnVuID0gQmx1ZWJpcmQucHJvbWlzaWZ5PFsgc3RyaW5nLCBzdHJpbmcgXSwgc3RyaW5nLCBFeGVjT3B0aW9ucz4oZXhlYyk7XG5cbi8qKlxuICogUHVibGlzaCBhbiBhZGRvbiB0byB0aGUgbnBtIHJlZ2lzdHJ5LlxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFB1Ymxpc2hDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgY29tbWFuZE5hbWUgPSAncHVibGlzaCc7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdQdWJsaXNoIGFuIGFkZG9uIHRvIHRoZSBucG0gcmVnaXN0cnkuJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBQdWJsaXNoZXMgYW4gYWRkb24gdG8gdGhlIG5wbSByZWdpc3RyeS4gUnVucyB0ZXN0cyBidWlsZHMgdGhlXG4gICAgYWRkb24sIGFuZCBwdWJsaXNoZXMgdGhlIGRpc3QvIGRpcmVjdG9yeSB0byB0aGUgcmVnaXN0cnkuYDtcblxuICBzdGF0aWMgcnVuc0luQXBwID0gdHJ1ZTtcblxuICBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgc2tpcFRlc3RzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0RvIG5vdCBydW4gdGVzdHMgYmVmb3JlIHB1Ymxpc2hpbmcnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH1cbiAgfTtcblxuICBhc3luYyBydW4oYXJndjogYW55KSB7XG4gICAgYXdhaXQgdGhpcy5idWlsZCgpO1xuICAgIGlmICghYXJndi5za2lwVGVzdHMpIHtcbiAgICAgIGF3YWl0IHRoaXMucnVuVGVzdHMoKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5wdWJsaXNoKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgcnVuVGVzdHMoKSB7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnUnVubmluZyB0ZXN0cycpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW4oJ25wbSB0ZXN0Jywge30pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzcGlubmVyLmZhaWwoJ1Rlc3RzIGZhaWxlZCwgaGFsdGluZyBwdWJsaXNoJyk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdUZXN0cyBwYXNzZWQnKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBidWlsZCgpIHtcbiAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdCdWlsZGluZycpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW4oJ25wbSBydW4gYnVpbGQnLCB7fSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHNwaW5uZXIuZmFpbCgnQnVpbGQgZmFpbGVkLCBoYWx0aW5nIHB1Ymxpc2gnKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoJ0FkZG9uIGJ1aWx0Jyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgcHVibGlzaCgpIHtcbiAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdQdWJsaXNoaW5nJyk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1bignbnBtIHB1Ymxpc2gnLCB7IGN3ZDogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdkaXN0JykgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHNwaW5uZXIuZmFpbCgnUHVibGlzaCBmYWlsZWQnKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBsZXQgcGtnID0gcmVhZFBrZygpO1xuICAgIGF3YWl0IHNwaW5uZXIuc3VjY2VlZChgJHsgcGtnLm5hbWUgfSAkeyBwa2cudmVyc2lvbiB9IHB1Ymxpc2hlZCFgKTtcbiAgfVxuXG59XG4iXX0=