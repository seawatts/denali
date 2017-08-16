"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const denali_cli_1 = require("denali-cli");
/**
 * Generate an new action class + tests.
 *
 * @package blueprints
 */
class ActionBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        let levels = name.split('/').map(() => '..');
        levels.pop();
        let nesting;
        if (levels.length > 0) {
            nesting = levels.join('/');
        }
        else {
            nesting = '.';
        }
        return {
            name,
            className: lodash_1.upperFirst(lodash_1.camelCase(name)),
            nesting
        };
    }
    postInstall(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let name = argv.name;
            let method = argv.method || 'post';
            this.addRoute(method.toLowerCase(), `/${name}`, name);
        });
    }
    postUninstall(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let name = argv.name;
            let method = argv.method || 'post';
            this.removeRoute(method.toLowerCase(), `/${name}`, name);
        });
    }
}
/* tslint:disable:completed-docs typedef */
ActionBlueprint.blueprintName = 'action';
ActionBlueprint.description = 'Generates a new action class & unit tests';
ActionBlueprint.longDescription = denali_cli_1.unwrap `
    Usage: denali generate action <name> [options]

    Generates an action with the given name (can be a deeply nested path), along with unit test
    stubs.

    Guides: http://denalijs.org/master/guides/application/actions/
  `;
ActionBlueprint.params = '<name>';
ActionBlueprint.flags = {
    method: {
        description: 'The HTTP method to use for the route to this action',
        default: 'post',
        type: 'string'
    }
};
ActionBlueprint.runsInApp = true;
exports.default = ActionBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImJsdWVwcmludHMvYWN0aW9uL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUdnQjtBQUNoQiwyQ0FBK0M7QUFFL0M7Ozs7R0FJRztBQUNILHFCQUFxQyxTQUFRLHNCQUFTO0lBMEJwRCxNQUFNLENBQUMsSUFBUztRQUNkLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLE9BQWUsQ0FBQztRQUNwQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxDQUFDO1lBQ0wsSUFBSTtZQUNKLFNBQVMsRUFBRSxtQkFBVSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsT0FBTztTQUNSLENBQUM7SUFDSixDQUFDO0lBRUssV0FBVyxDQUFDLElBQVM7O1lBQ3pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDckIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUM7WUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSyxJQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRCxDQUFDO0tBQUE7SUFFSyxhQUFhLENBQUMsSUFBUzs7WUFDM0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNyQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQztZQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFLLElBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FBQTs7QUFuREQsMkNBQTJDO0FBQ3BDLDZCQUFhLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLDJCQUFXLEdBQUcsMkNBQTJDLENBQUM7QUFDMUQsK0JBQWUsR0FBRyxtQkFBTSxDQUFBOzs7Ozs7O0dBTzlCLENBQUM7QUFFSyxzQkFBTSxHQUFHLFFBQVEsQ0FBQztBQUVsQixxQkFBSyxHQUFHO0lBQ2IsTUFBTSxFQUFFO1FBQ04sV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxPQUFPLEVBQUUsTUFBTTtRQUNmLElBQUksRUFBUSxRQUFRO0tBQ3JCO0NBQ0YsQ0FBQztBQUVLLHlCQUFTLEdBQUcsSUFBSSxDQUFDO0FBeEIxQixrQ0FzREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICB1cHBlckZpcnN0LFxuICBjYW1lbENhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEJsdWVwcmludCwgdW53cmFwIH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5cbi8qKlxuICogR2VuZXJhdGUgYW4gbmV3IGFjdGlvbiBjbGFzcyArIHRlc3RzLlxuICpcbiAqIEBwYWNrYWdlIGJsdWVwcmludHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWN0aW9uQmx1ZXByaW50IGV4dGVuZHMgQmx1ZXByaW50IHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHN0YXRpYyBibHVlcHJpbnROYW1lID0gJ2FjdGlvbic7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdHZW5lcmF0ZXMgYSBuZXcgYWN0aW9uIGNsYXNzICYgdW5pdCB0ZXN0cyc7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgVXNhZ2U6IGRlbmFsaSBnZW5lcmF0ZSBhY3Rpb24gPG5hbWU+IFtvcHRpb25zXVxuXG4gICAgR2VuZXJhdGVzIGFuIGFjdGlvbiB3aXRoIHRoZSBnaXZlbiBuYW1lIChjYW4gYmUgYSBkZWVwbHkgbmVzdGVkIHBhdGgpLCBhbG9uZyB3aXRoIHVuaXQgdGVzdFxuICAgIHN0dWJzLlxuXG4gICAgR3VpZGVzOiBodHRwOi8vZGVuYWxpanMub3JnL21hc3Rlci9ndWlkZXMvYXBwbGljYXRpb24vYWN0aW9ucy9cbiAgYDtcblxuICBzdGF0aWMgcGFyYW1zID0gJzxuYW1lPic7XG5cbiAgc3RhdGljIGZsYWdzID0ge1xuICAgIG1ldGhvZDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgSFRUUCBtZXRob2QgdG8gdXNlIGZvciB0aGUgcm91dGUgdG8gdGhpcyBhY3Rpb24nLFxuICAgICAgZGVmYXVsdDogJ3Bvc3QnLFxuICAgICAgdHlwZTogPGFueT4gJ3N0cmluZydcbiAgICB9XG4gIH07XG5cbiAgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgbG9jYWxzKGFyZ3Y6IGFueSk6IGFueSB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgbGV0IGxldmVscyA9IG5hbWUuc3BsaXQoJy8nKS5tYXAoKCkgPT4gJy4uJyk7XG4gICAgbGV2ZWxzLnBvcCgpO1xuICAgIGxldCBuZXN0aW5nOiBzdHJpbmc7XG4gICAgaWYgKGxldmVscy5sZW5ndGggPiAwKSB7XG4gICAgICBuZXN0aW5nID0gbGV2ZWxzLmpvaW4oJy8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmVzdGluZyA9ICcuJztcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsXG4gICAgICBjbGFzc05hbWU6IHVwcGVyRmlyc3QoY2FtZWxDYXNlKG5hbWUpKSxcbiAgICAgIG5lc3RpbmdcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcG9zdEluc3RhbGwoYXJndjogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgbGV0IG1ldGhvZCA9IGFyZ3YubWV0aG9kIHx8ICdwb3N0JztcbiAgICB0aGlzLmFkZFJvdXRlKG1ldGhvZC50b0xvd2VyQ2FzZSgpLCBgLyR7IG5hbWUgfWAsIG5hbWUpO1xuICB9XG5cbiAgYXN5bmMgcG9zdFVuaW5zdGFsbChhcmd2OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICBsZXQgbWV0aG9kID0gYXJndi5tZXRob2QgfHwgJ3Bvc3QnO1xuICAgIHRoaXMucmVtb3ZlUm91dGUobWV0aG9kLnRvTG93ZXJDYXNlKCksIGAvJHsgbmFtZSB9YCwgbmFtZSk7XG4gIH1cbn1cbiJdfQ==