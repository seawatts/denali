"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const denali_cli_1 = require("denali-cli");
/**
 * Generates a blank model
 *
 * @package blueprints
 */
class ModelBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        return {
            name,
            className: lodash_1.upperFirst(lodash_1.camelCase(name))
        };
    }
}
/* tslint:disable:completed-docs typedef */
ModelBlueprint.blueprintName = 'model';
ModelBlueprint.description = 'Generates a blank model';
ModelBlueprint.longDescription = denali_cli_1.unwrap `
    Usage: denali generate model <name> [options]

    Generates a blank model, along with a serializer for that model, and unit tests for both.

    Guides: http://denalijs.org/master/guides/data/models/
  `;
ModelBlueprint.params = '<name>';
exports.default = ModelBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImJsdWVwcmludHMvbW9kZWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FHZ0I7QUFDaEIsMkNBQStDO0FBRS9DOzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxzQkFBUztJQWVuRCxNQUFNLENBQUMsSUFBUztRQUNkLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsTUFBTSxDQUFDO1lBQ0wsSUFBSTtZQUNKLFNBQVMsRUFBRSxtQkFBVSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkMsQ0FBQztJQUNKLENBQUM7O0FBbkJELDJDQUEyQztBQUNwQyw0QkFBYSxHQUFHLE9BQU8sQ0FBQztBQUN4QiwwQkFBVyxHQUFHLHlCQUF5QixDQUFDO0FBQ3hDLDhCQUFlLEdBQUcsbUJBQU0sQ0FBQTs7Ozs7O0dBTTlCLENBQUM7QUFFSyxxQkFBTSxHQUFHLFFBQVEsQ0FBQztBQWIzQixpQ0F1QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICB1cHBlckZpcnN0LFxuICBjYW1lbENhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEJsdWVwcmludCwgdW53cmFwIH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgYmxhbmsgbW9kZWxcbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsQmx1ZXByaW50IGV4dGVuZHMgQmx1ZXByaW50IHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHN0YXRpYyBibHVlcHJpbnROYW1lID0gJ21vZGVsJztcbiAgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0dlbmVyYXRlcyBhIGJsYW5rIG1vZGVsJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIG1vZGVsIDxuYW1lPiBbb3B0aW9uc11cblxuICAgIEdlbmVyYXRlcyBhIGJsYW5rIG1vZGVsLCBhbG9uZyB3aXRoIGEgc2VyaWFsaXplciBmb3IgdGhhdCBtb2RlbCwgYW5kIHVuaXQgdGVzdHMgZm9yIGJvdGguXG5cbiAgICBHdWlkZXM6IGh0dHA6Ly9kZW5hbGlqcy5vcmcvbWFzdGVyL2d1aWRlcy9kYXRhL21vZGVscy9cbiAgYDtcblxuICBzdGF0aWMgcGFyYW1zID0gJzxuYW1lPic7XG5cbiAgbG9jYWxzKGFyZ3Y6IGFueSkge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgY2xhc3NOYW1lOiB1cHBlckZpcnN0KGNhbWVsQ2FzZShuYW1lKSlcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==