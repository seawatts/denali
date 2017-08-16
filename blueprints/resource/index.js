"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const inflection_1 = require("inflection");
const denali_cli_1 = require("denali-cli");
/**
 * Generates a model, serializer, CRUD actions, and tests for a resource
 *
 * @package blueprints
 */
class ResourceBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        name = inflection_1.pluralize(name);
        let plural = {
            name,
            camelCased: lodash_1.camelCase(name),
            className: lodash_1.upperFirst(lodash_1.camelCase(name)),
            dasherized: lodash_1.kebabCase(name),
            humanized: lodash_1.lowerCase(name)
        };
        name = inflection_1.singularize(name);
        let singular = {
            name,
            camelCased: lodash_1.camelCase(name),
            className: lodash_1.upperFirst(lodash_1.camelCase(name)),
            dasherized: lodash_1.kebabCase(name),
            humanized: lodash_1.lowerCase(name)
        };
        return { plural, singular };
    }
    postInstall(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.addRoute('resource', inflection_1.singularize(argv.name));
        });
    }
    postUninstall(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.removeRoute('resource', inflection_1.singularize(argv.name));
        });
    }
}
/* tslint:disable:completed-docs typedef */
ResourceBlueprint.blueprintName = 'resource';
ResourceBlueprint.description = 'Generates a model, serializer, CRUD actions, and tests for a resource';
ResourceBlueprint.longDescription = denali_cli_1.unwrap `
    Usage: denali generate resource <name> [options]

    Generates a complete, end-to-end RESTful resource scaffold. This includes a Model to represent
    the data, a Serializer to determine how to send it over the wire, CRUD actions for manipulating
    the resource, and tests for all of the above.
  `;
ResourceBlueprint.params = '<name>';
exports.default = ResourceBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImJsdWVwcmludHMvcmVzb3VyY2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBS2dCO0FBQ2hCLDJDQUFvRDtBQUNwRCwyQ0FBK0M7QUFFL0M7Ozs7R0FJRztBQUNILHVCQUF1QyxTQUFRLHNCQUFTO0lBZXRELE1BQU0sQ0FBQyxJQUFTO1FBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLEdBQUcsc0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixJQUFJLE1BQU0sR0FBRztZQUNYLElBQUk7WUFDSixVQUFVLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxFQUFFLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxVQUFVLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1NBQzNCLENBQUM7UUFDRixJQUFJLEdBQUcsd0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixJQUFJLFFBQVEsR0FBRztZQUNiLElBQUk7WUFDSixVQUFVLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxFQUFFLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxVQUFVLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1NBQzNCLENBQUM7UUFDRixNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVLLFdBQVcsQ0FBQyxJQUFTOztZQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSx3QkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxJQUFTOztZQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSx3QkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7S0FBQTs7QUF4Q0QsMkNBQTJDO0FBQ3BDLCtCQUFhLEdBQUcsVUFBVSxDQUFDO0FBQzNCLDZCQUFXLEdBQUcsdUVBQXVFLENBQUM7QUFDdEYsaUNBQWUsR0FBRyxtQkFBTSxDQUFBOzs7Ozs7R0FNOUIsQ0FBQztBQUVLLHdCQUFNLEdBQUcsUUFBUSxDQUFDO0FBYjNCLG9DQTRDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIHVwcGVyRmlyc3QsXG4gIGNhbWVsQ2FzZSxcbiAgbG93ZXJDYXNlLFxuICBrZWJhYkNhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IHNpbmd1bGFyaXplLCBwbHVyYWxpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcbmltcG9ydCB7IEJsdWVwcmludCwgdW53cmFwIH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbW9kZWwsIHNlcmlhbGl6ZXIsIENSVUQgYWN0aW9ucywgYW5kIHRlc3RzIGZvciBhIHJlc291cmNlXG4gKlxuICogQHBhY2thZ2UgYmx1ZXByaW50c1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNvdXJjZUJsdWVwcmludCBleHRlbmRzIEJsdWVwcmludCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgYmx1ZXByaW50TmFtZSA9ICdyZXNvdXJjZSc7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdHZW5lcmF0ZXMgYSBtb2RlbCwgc2VyaWFsaXplciwgQ1JVRCBhY3Rpb25zLCBhbmQgdGVzdHMgZm9yIGEgcmVzb3VyY2UnO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFVzYWdlOiBkZW5hbGkgZ2VuZXJhdGUgcmVzb3VyY2UgPG5hbWU+IFtvcHRpb25zXVxuXG4gICAgR2VuZXJhdGVzIGEgY29tcGxldGUsIGVuZC10by1lbmQgUkVTVGZ1bCByZXNvdXJjZSBzY2FmZm9sZC4gVGhpcyBpbmNsdWRlcyBhIE1vZGVsIHRvIHJlcHJlc2VudFxuICAgIHRoZSBkYXRhLCBhIFNlcmlhbGl6ZXIgdG8gZGV0ZXJtaW5lIGhvdyB0byBzZW5kIGl0IG92ZXIgdGhlIHdpcmUsIENSVUQgYWN0aW9ucyBmb3IgbWFuaXB1bGF0aW5nXG4gICAgdGhlIHJlc291cmNlLCBhbmQgdGVzdHMgZm9yIGFsbCBvZiB0aGUgYWJvdmUuXG4gIGA7XG5cbiAgc3RhdGljIHBhcmFtcyA9ICc8bmFtZT4nO1xuXG4gIGxvY2Fscyhhcmd2OiBhbnkpIHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICBuYW1lID0gcGx1cmFsaXplKG5hbWUpO1xuICAgIGxldCBwbHVyYWwgPSB7XG4gICAgICBuYW1lLFxuICAgICAgY2FtZWxDYXNlZDogY2FtZWxDYXNlKG5hbWUpLFxuICAgICAgY2xhc3NOYW1lOiB1cHBlckZpcnN0KGNhbWVsQ2FzZShuYW1lKSksXG4gICAgICBkYXNoZXJpemVkOiBrZWJhYkNhc2UobmFtZSksXG4gICAgICBodW1hbml6ZWQ6IGxvd2VyQ2FzZShuYW1lKVxuICAgIH07XG4gICAgbmFtZSA9IHNpbmd1bGFyaXplKG5hbWUpO1xuICAgIGxldCBzaW5ndWxhciA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBjYW1lbENhc2VkOiBjYW1lbENhc2UobmFtZSksXG4gICAgICBjbGFzc05hbWU6IHVwcGVyRmlyc3QoY2FtZWxDYXNlKG5hbWUpKSxcbiAgICAgIGRhc2hlcml6ZWQ6IGtlYmFiQ2FzZShuYW1lKSxcbiAgICAgIGh1bWFuaXplZDogbG93ZXJDYXNlKG5hbWUpXG4gICAgfTtcbiAgICByZXR1cm4geyBwbHVyYWwsIHNpbmd1bGFyIH07XG4gIH1cblxuICBhc3luYyBwb3N0SW5zdGFsbChhcmd2OiBhbnkpIHtcbiAgICB0aGlzLmFkZFJvdXRlKCdyZXNvdXJjZScsIHNpbmd1bGFyaXplKGFyZ3YubmFtZSkpO1xuICB9XG5cbiAgYXN5bmMgcG9zdFVuaW5zdGFsbChhcmd2OiBhbnkpIHtcbiAgICB0aGlzLnJlbW92ZVJvdXRlKCdyZXNvdXJjZScsIHNpbmd1bGFyaXplKGFyZ3YubmFtZSkpO1xuICB9XG5cbn1cbiJdfQ==