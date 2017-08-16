"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const path = require("path");
const fs = require("fs-extra");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const denali_cli_1 = require("denali-cli");
function linkDependency(pkgDir, dependencyName, dependencyDir) {
    let dest = path.join(pkgDir, 'node_modules', dependencyName);
    // use fs-extra
    mkdirp.sync(path.dirname(dest));
    rimraf.sync(dest);
    fs.symlinkSync(dependencyDir, dest);
}
ava_1.default('launches a server', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let server = new denali_cli_1.CommandAcceptanceTest('server --port 3001', { name: 'server-command' });
    return server.spawn({
        failOnStderr: true,
        env: {
            DEBUG: null
        },
        checkOutput(stdout) {
            let started = stdout.indexOf('dummy@0.0.0 server up') > -1;
            if (started) {
                t.pass();
            }
            return started;
        }
    });
}));
ava_1.default('launches a server based on the dummy app in an addon', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let generateAddon = new denali_cli_1.CommandAcceptanceTest('addon my-denali-addon', { name: 'server-command-dummy-app', populateWithDummy: false });
    yield generateAddon.run({ failOnStderr: true });
    linkDependency(path.join(generateAddon.dir, 'my-denali-addon'), 'denali', path.join(process.cwd(), 'node_modules', 'denali'));
    let server = new denali_cli_1.CommandAcceptanceTest('server --port 3002', {
        dir: path.join(generateAddon.dir, 'my-denali-addon'),
        populateWithDummy: false
    });
    return server.spawn({
        failOnStderr: true,
        checkOutput(stdout, stderr) {
            let started = stdout.indexOf('dummy@0.0.0 server up') > -1;
            if (started) {
                t.pass();
            }
            return started;
        }
    });
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbInRlc3QvYWNjZXB0YW5jZS9jb21tYW5kcy9zZXJ2ZXItdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBMEU7QUFDMUUsNkJBQXVCO0FBQ3ZCLDZCQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IsaUNBQWlDO0FBQ2pDLGlDQUFpQztBQUNqQywyQ0FBbUQ7QUFFbkQsd0JBQXdCLE1BQWMsRUFBRSxjQUFzQixFQUFFLGFBQXFCO0lBQ25GLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUM3RCxlQUFlO0lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQixFQUFFLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQsYUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQU8sQ0FBQztJQUNoQyxJQUFJLE1BQU0sR0FBRyxJQUFJLGtDQUFxQixDQUFDLG9CQUFvQixFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUV6RixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNsQixZQUFZLEVBQUUsSUFBSTtRQUNsQixHQUFHLEVBQUU7WUFDSCxLQUFLLEVBQUUsSUFBSTtTQUNaO1FBQ0QsV0FBVyxDQUFDLE1BQU07WUFDaEIsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ1osQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDakIsQ0FBQztLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsc0RBQXNELEVBQUUsQ0FBTyxDQUFDO0lBQ25FLElBQUksYUFBYSxHQUFHLElBQUksa0NBQXFCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUN2SSxNQUFNLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNoRCxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzlILElBQUksTUFBTSxHQUFHLElBQUksa0NBQXFCLENBQUMsb0JBQW9CLEVBQUU7UUFDM0QsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQztRQUNwRCxpQkFBaUIsRUFBRSxLQUFLO0tBQ3pCLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2xCLFlBQVksRUFBRSxJQUFJO1FBQ2xCLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTTtZQUN4QixJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDWixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWCxDQUFDO1lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0ICogYXMgcmltcmFmIGZyb20gJ3JpbXJhZic7XG5pbXBvcnQgeyBDb21tYW5kQWNjZXB0YW5jZVRlc3QgfSBmcm9tICdkZW5hbGktY2xpJztcblxuZnVuY3Rpb24gbGlua0RlcGVuZGVuY3kocGtnRGlyOiBzdHJpbmcsIGRlcGVuZGVuY3lOYW1lOiBzdHJpbmcsIGRlcGVuZGVuY3lEaXI6IHN0cmluZykge1xuICBsZXQgZGVzdCA9IHBhdGguam9pbihwa2dEaXIsICdub2RlX21vZHVsZXMnLCBkZXBlbmRlbmN5TmFtZSk7XG4gIC8vIHVzZSBmcy1leHRyYVxuICBta2RpcnAuc3luYyhwYXRoLmRpcm5hbWUoZGVzdCkpO1xuICByaW1yYWYuc3luYyhkZXN0KTtcbiAgZnMuc3ltbGlua1N5bmMoZGVwZW5kZW5jeURpciwgZGVzdCk7XG59XG5cbnRlc3QoJ2xhdW5jaGVzIGEgc2VydmVyJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IHNlcnZlciA9IG5ldyBDb21tYW5kQWNjZXB0YW5jZVRlc3QoJ3NlcnZlciAtLXBvcnQgMzAwMScsIHsgbmFtZTogJ3NlcnZlci1jb21tYW5kJyB9KTtcblxuICByZXR1cm4gc2VydmVyLnNwYXduKHtcbiAgICBmYWlsT25TdGRlcnI6IHRydWUsXG4gICAgZW52OiB7XG4gICAgICBERUJVRzogbnVsbFxuICAgIH0sXG4gICAgY2hlY2tPdXRwdXQoc3Rkb3V0KSB7XG4gICAgICBsZXQgc3RhcnRlZCA9IHN0ZG91dC5pbmRleE9mKCdkdW1teUAwLjAuMCBzZXJ2ZXIgdXAnKSA+IC0xO1xuICAgICAgaWYgKHN0YXJ0ZWQpIHtcbiAgICAgICAgdC5wYXNzKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RhcnRlZDtcbiAgICB9XG4gIH0pO1xufSk7XG5cbnRlc3QoJ2xhdW5jaGVzIGEgc2VydmVyIGJhc2VkIG9uIHRoZSBkdW1teSBhcHAgaW4gYW4gYWRkb24nLCBhc3luYyAodCkgPT4ge1xuICBsZXQgZ2VuZXJhdGVBZGRvbiA9IG5ldyBDb21tYW5kQWNjZXB0YW5jZVRlc3QoJ2FkZG9uIG15LWRlbmFsaS1hZGRvbicsIHsgbmFtZTogJ3NlcnZlci1jb21tYW5kLWR1bW15LWFwcCcsIHBvcHVsYXRlV2l0aER1bW15OiBmYWxzZSB9KTtcbiAgYXdhaXQgZ2VuZXJhdGVBZGRvbi5ydW4oeyBmYWlsT25TdGRlcnI6IHRydWUgfSk7XG4gIGxpbmtEZXBlbmRlbmN5KHBhdGguam9pbihnZW5lcmF0ZUFkZG9uLmRpciwgJ215LWRlbmFsaS1hZGRvbicpLCAnZGVuYWxpJywgcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMnLCAnZGVuYWxpJykpO1xuICBsZXQgc2VydmVyID0gbmV3IENvbW1hbmRBY2NlcHRhbmNlVGVzdCgnc2VydmVyIC0tcG9ydCAzMDAyJywge1xuICAgIGRpcjogcGF0aC5qb2luKGdlbmVyYXRlQWRkb24uZGlyLCAnbXktZGVuYWxpLWFkZG9uJyksXG4gICAgcG9wdWxhdGVXaXRoRHVtbXk6IGZhbHNlXG4gIH0pO1xuXG4gIHJldHVybiBzZXJ2ZXIuc3Bhd24oe1xuICAgIGZhaWxPblN0ZGVycjogdHJ1ZSxcbiAgICBjaGVja091dHB1dChzdGRvdXQsIHN0ZGVycikge1xuICAgICAgbGV0IHN0YXJ0ZWQgPSBzdGRvdXQuaW5kZXhPZignZHVtbXlAMC4wLjAgc2VydmVyIHVwJykgPiAtMTtcbiAgICAgIGlmIChzdGFydGVkKSB7XG4gICAgICAgIHQucGFzcygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXJ0ZWQ7XG4gICAgfVxuICB9KTtcbn0pO1xuIl19