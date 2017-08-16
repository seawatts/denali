"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const path = require("path");
const denali_cli_1 = require("denali-cli");
const tryRequire = require("try-require");
const cmdExists = require("command-exists");
const Bluebird = require("bluebird");
const child_process_1 = require("child_process");
const run = Bluebird.promisify(child_process_1.exec);
const commandExists = Bluebird.promisify(cmdExists);
/**
 * Run migrations to update your database schema
 *
 * @package commands
 */
class MigrateCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let knex = tryRequire('knex');
            if (!knex) {
                yield denali_cli_1.spinner.start('Installing knex (required for migrations)');
                let yarnExists = yield commandExists('yarn');
                if (yarnExists) {
                    yield run('yarn add knex --mutex network');
                }
                else {
                    yield run('npm install --save knex');
                }
                knex = require('knex');
                yield denali_cli_1.spinner.succeed('Knex installed');
            }
            let project = new denali_cli_1.Project({
                environment: argv.environment,
                buildDummy: true
            });
            let application = yield project.createApplication();
            assert(application.config.migrations && application.config.migrations.db, 'DB connection info is missing. You must supply the knex connection info in config.migrations.db.');
            let db = knex(application.config.migrations.db);
            let migrationsDir = path.join(application.dir, 'config', 'migrations');
            try {
                if (argv.rollback) {
                    yield denali_cli_1.spinner.start('Rolling back last migration');
                    yield db.migrate.rollback({ directory: migrationsDir });
                }
                else if (argv.redo) {
                    yield denali_cli_1.spinner.start('Rolling back and replaying last migration');
                    yield db.migrate.rollback({ directory: migrationsDir });
                    yield db.migrate.latest({ directory: migrationsDir });
                }
                else {
                    yield denali_cli_1.spinner.start('Running migrations to latest');
                    yield db.migrate.latest({ directory: migrationsDir });
                }
                let newVersion = yield db.migrate.currentVersion();
                yield denali_cli_1.spinner.succeed(`Migrated to ${newVersion}`);
            }
            catch (error) {
                yield denali_cli_1.spinner.fail(`Migrations failed:\n${error.stack}`);
            }
            finally {
                yield db.destroy();
            }
        });
    }
}
/* tslint:disable:completed-docs typedef */
MigrateCommand.commandName = 'migrate';
MigrateCommand.description = 'Run migrations to update your database schema';
MigrateCommand.longDescription = denali_cli_1.unwrap `
    Runs (or rolls back) schema migrations for your database. Typically only
    applies when use SQL-based databases.`;
MigrateCommand.flags = {
    environment: {
        description: 'The target environment to build for.',
        default: process.env.NODE_ENV || 'development',
        type: 'string'
    },
    rollback: {
        description: 'Rollback the latest migration, or latest --step migrations. Defaults to 1 step.',
        default: false,
        type: 'boolean'
    },
    redo: {
        description: 'Shortcut for rolling back then migrating up again. If used with --step, it will replay that many migrations. If used with --version, it will roll back to that version then replay. If neither, defaults to --step 1',
        default: false,
        type: 'boolean'
    }
};
MigrateCommand.runsInApp = true;
exports.default = MigrateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvbWlncmF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBaUM7QUFDakMsNkJBQTZCO0FBQzdCLDJDQUErRDtBQUMvRCwwQ0FBMEM7QUFDMUMsNENBQTRDO0FBQzVDLHFDQUFxQztBQUNyQyxpREFBcUM7QUFFckMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBNkIsb0JBQUksQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQWtCLFNBQVMsQ0FBQyxDQUFDO0FBRXJFOzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxvQkFBTztJQTZCM0MsR0FBRyxDQUFDLElBQVM7O1lBQ2pCLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsTUFBTSxvQkFBTyxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLFVBQVUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDN0MsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDZixNQUFNLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUM3QyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLE1BQU0sR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkIsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFDRCxJQUFJLE9BQU8sR0FBRyxJ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QUFHLElBQUksQ0FBQztBQTNCMUIsaUNBdUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc3Bpbm5lciwgQ29tbWFuZCwgUHJvamVjdCwgdW53cmFwIH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5pbXBvcnQgKiBhcyB0cnlSZXF1aXJlIGZyb20gJ3RyeS1yZXF1aXJlJztcbmltcG9ydCAqIGFzIGNtZEV4aXN0cyBmcm9tICdjb21tYW5kLWV4aXN0cyc7XG5pbXBvcnQgKiBhcyBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IHJ1biA9IEJsdWViaXJkLnByb21pc2lmeTxbIHN0cmluZywgc3RyaW5nIF0sIHN0cmluZz4oZXhlYyk7XG5jb25zdCBjb21tYW5kRXhpc3RzID0gQmx1ZWJpcmQucHJvbWlzaWZ5PGJvb2xlYW4sIHN0cmluZz4oY21kRXhpc3RzKTtcblxuLyoqXG4gKiBSdW4gbWlncmF0aW9ucyB0byB1cGRhdGUgeW91ciBkYXRhYmFzZSBzY2hlbWFcbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWdyYXRlQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGNvbW1hbmROYW1lID0gJ21pZ3JhdGUnO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnUnVuIG1pZ3JhdGlvbnMgdG8gdXBkYXRlIHlvdXIgZGF0YWJhc2Ugc2NoZW1hJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBSdW5zIChvciByb2xscyBiYWNrKSBzY2hlbWEgbWlncmF0aW9ucyBmb3IgeW91ciBkYXRhYmFzZS4gVHlwaWNhbGx5IG9ubHlcbiAgICBhcHBsaWVzIHdoZW4gdXNlIFNRTC1iYXNlZCBkYXRhYmFzZXMuYDtcblxuICBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRhcmdldCBlbnZpcm9ubWVudCB0byBidWlsZCBmb3IuJyxcbiAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdkZXZlbG9wbWVudCcsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICByb2xsYmFjazoge1xuICAgICAgZGVzY3JpcHRpb246ICdSb2xsYmFjayB0aGUgbGF0ZXN0IG1pZ3JhdGlvbiwgb3IgbGF0ZXN0IC0tc3RlcCBtaWdyYXRpb25zLiBEZWZhdWx0cyB0byAxIHN0ZXAuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHJlZG86IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvcnRjdXQgZm9yIHJvbGxpbmcgYmFjayB0aGVuIG1pZ3JhdGluZyB1cCBhZ2Fpbi4gSWYgdXNlZCB3aXRoIC0tc3RlcCwgaXQgd2lsbCByZXBsYXkgdGhhdCBtYW55IG1pZ3JhdGlvbnMuIElmIHVzZWQgd2l0aCAtLXZlcnNpb24sIGl0IHdpbGwgcm9sbCBiYWNrIHRvIHRoYXQgdmVyc2lvbiB0aGVuIHJlcGxheS4gSWYgbmVpdGhlciwgZGVmYXVsdHMgdG8gLS1zdGVwIDEnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH1cbiAgfTtcblxuICBzdGF0aWMgcnVuc0luQXBwID0gdHJ1ZTtcblxuICBhc3luYyBydW4oYXJndjogYW55KSB7XG4gICAgbGV0IGtuZXggPSB0cnlSZXF1aXJlKCdrbmV4Jyk7XG4gICAgaWYgKCFrbmV4KSB7XG4gICAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdJbnN0YWxsaW5nIGtuZXggKHJlcXVpcmVkIGZvciBtaWdyYXRpb25zKScpO1xuICAgICAgbGV0IHlhcm5FeGlzdHMgPSBhd2FpdCBjb21tYW5kRXhpc3RzKCd5YXJuJyk7XG4gICAgICBpZiAoeWFybkV4aXN0cykge1xuICAgICAgICBhd2FpdCBydW4oJ3lhcm4gYWRkIGtuZXggLS1tdXRleCBuZXR3b3JrJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBydW4oJ25wbSBpbnN0YWxsIC0tc2F2ZSBrbmV4Jyk7XG4gICAgICB9XG4gICAgICBrbmV4ID0gcmVxdWlyZSgna25leCcpO1xuICAgICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdLbmV4IGluc3RhbGxlZCcpO1xuICAgIH1cbiAgICBsZXQgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgIGVudmlyb25tZW50OiBhcmd2LmVudmlyb25tZW50LFxuICAgICAgYnVpbGREdW1teTogdHJ1ZVxuICAgIH0pO1xuICAgIGxldCBhcHBsaWNhdGlvbiA9IGF3YWl0IHByb2plY3QuY3JlYXRlQXBwbGljYXRpb24oKTtcbiAgICBhc3NlcnQoYXBwbGljYXRpb24uY29uZmlnLm1pZ3JhdGlvbnMgJiYgYXBwbGljYXRpb24uY29uZmlnLm1pZ3JhdGlvbnMuZGIsICdEQiBjb25uZWN0aW9uIGluZm8gaXMgbWlzc2luZy4gWW91IG11c3Qgc3VwcGx5IHRoZSBrbmV4IGNvbm5lY3Rpb24gaW5mbyBpbiBjb25maWcubWlncmF0aW9ucy5kYi4nKTtcbiAgICBsZXQgZGIgPSBrbmV4KGFwcGxpY2F0aW9uLmNvbmZpZy5taWdyYXRpb25zLmRiKTtcbiAgICBsZXQgbWlncmF0aW9uc0RpciA9IHBhdGguam9pbihhcHBsaWNhdGlvbi5kaXIsICdjb25maWcnLCAnbWlncmF0aW9ucycpO1xuICAgIHRyeSB7XG4gICAgICBpZiAoYXJndi5yb2xsYmFjaykge1xuICAgICAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdSb2xsaW5nIGJhY2sgbGFzdCBtaWdyYXRpb24nKTtcbiAgICAgICAgYXdhaXQgZGIubWlncmF0ZS5yb2xsYmFjayh7IGRpcmVjdG9yeTogbWlncmF0aW9uc0RpciB9KTtcbiAgICAgIH0gZWxzZSBpZiAoYXJndi5yZWRvKSB7XG4gICAgICAgIGF3YWl0IHNwaW5uZXIuc3RhcnQoJ1JvbGxpbmcgYmFjayBhbmQgcmVwbGF5aW5nIGxhc3QgbWlncmF0aW9uJyk7XG4gICAgICAgIGF3YWl0IGRiLm1pZ3JhdGUucm9sbGJhY2soeyBkaXJlY3Rvcnk6IG1pZ3JhdGlvbnNEaXIgfSk7XG4gICAgICAgIGF3YWl0IGRiLm1pZ3JhdGUubGF0ZXN0KHsgZGlyZWN0b3J5OiBtaWdyYXRpb25zRGlyIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnUnVubmluZyBtaWdyYXRpb25zIHRvIGxhdGVzdCcpO1xuICAgICAgICBhd2FpdCBkYi5taWdyYXRlLmxhdGVzdCh7IGRpcmVjdG9yeTogbWlncmF0aW9uc0RpciB9KTtcbiAgICAgIH1cbiAgICAgIGxldCBuZXdWZXJzaW9uID0gYXdhaXQgZGIubWlncmF0ZS5jdXJyZW50VmVyc2lvbigpO1xuICAgICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKGBNaWdyYXRlZCB0byAkeyBuZXdWZXJzaW9uIH1gKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXdhaXQgc3Bpbm5lci5mYWlsKGBNaWdyYXRpb25zIGZhaWxlZDpcXG4keyBlcnJvci5zdGFjayB9YCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IGRiLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxufVxuIl19