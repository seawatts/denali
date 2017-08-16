"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const denali_cli_1 = require("denali-cli");
/**
 * Generates a blank serializer
 *
 * @package blueprints
 */
class SerializerBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        return {
            name,
            className: lodash_1.upperFirst(lodash_1.camelCase(name))
        };
    }
}
/* tslint:disable:completed-docs typedef */
SerializerBlueprint.blueprintName = 'serializer';
SerializerBlueprint.description = 'Generates a blank serializer';
SerializerBlueprint.longDescription = denali_cli_1.unwrap `
    Usage: denali generate serializer <name> [options]

    Generates a blank serializer for the given model.

    Guides: http://denalijs.org/master/guides/data/serializers/
  `;
SerializerBlueprint.params = '<name>';
exports.default = SerializerBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImJsdWVwcmludHMvc2VyaWFsaXplci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUdnQjtBQUNoQiwyQ0FBK0M7QUFFL0M7Ozs7R0FJRztBQUNILHlCQUF5QyxTQUFRLHNCQUFTO0lBZXhELE1BQU0sQ0FBQyxJQUFTO1FBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixNQUFNLENBQUM7WUFDTCxJQUFJO1lBQ0osU0FBUyxFQUFFLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QyxDQUFDO0lBQ0osQ0FBQzs7QUFuQkQsMkNBQTJDO0FBQ3BDLGlDQUFhLEdBQUcsWUFBWSxDQUFDO0FBQzdCLCtCQUFXLEdBQUcsOEJBQThCLENBQUM7QUFDN0MsbUNBQWUsR0FBRyxtQkFBTSxDQUFBOzs7Ozs7R0FNOUIsQ0FBQztBQUVLLDBCQUFNLEdBQUcsUUFBUSxDQUFDO0FBYjNCLHNDQXNCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIHVwcGVyRmlyc3QsXG4gIGNhbWVsQ2FzZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQmx1ZXByaW50LCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBibGFuayBzZXJpYWxpemVyXG4gKlxuICogQHBhY2thZ2UgYmx1ZXByaW50c1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJpYWxpemVyQmx1ZXByaW50IGV4dGVuZHMgQmx1ZXByaW50IHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHN0YXRpYyBibHVlcHJpbnROYW1lID0gJ3NlcmlhbGl6ZXInO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnR2VuZXJhdGVzIGEgYmxhbmsgc2VyaWFsaXplcic7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgVXNhZ2U6IGRlbmFsaSBnZW5lcmF0ZSBzZXJpYWxpemVyIDxuYW1lPiBbb3B0aW9uc11cblxuICAgIEdlbmVyYXRlcyBhIGJsYW5rIHNlcmlhbGl6ZXIgZm9yIHRoZSBnaXZlbiBtb2RlbC5cblxuICAgIEd1aWRlczogaHR0cDovL2RlbmFsaWpzLm9yZy9tYXN0ZXIvZ3VpZGVzL2RhdGEvc2VyaWFsaXplcnMvXG4gIGA7XG5cbiAgc3RhdGljIHBhcmFtcyA9ICc8bmFtZT4nO1xuXG4gIGxvY2Fscyhhcmd2OiBhbnkpIHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGNsYXNzTmFtZTogdXBwZXJGaXJzdChjYW1lbENhc2UobmFtZSkpXG4gICAgfTtcbiAgfVxufVxuIl19