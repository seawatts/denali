"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const denali_cli_1 = require("denali-cli");
const inflection_1 = require("inflection");
const lodash_1 = require("lodash");
/**
 * Generates a blank ORM adapter with stubs for all the required methods
 *
 * @package blueprints
 */
class ORMAdapterBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        name = inflection_1.singularize(name);
        return {
            name,
            className: lodash_1.upperFirst(lodash_1.camelCase(name))
        };
    }
}
/* tslint:disable:completed-docs typedef */
ORMAdapterBlueprint.blueprintName = 'orm-adapter';
ORMAdapterBlueprint.description = 'Generates a blank ORM adapter with stubs for all the required methods';
ORMAdapterBlueprint.longDescription = denali_cli_1.unwrap `
    Usage: denali generate orm-adapter <name> [options]

    Generates a new ORM adapter with stubs for all the required adapter methods. Note: this is
    typically an advanced use case (i.e. using a niche, specialty database). You should check to
    make sure there isn't already a Denali addon that implements the ORM adapter you need.

    Guides: http://denalijs.org/master/guides/data/orm-adapters/
  `;
ORMAdapterBlueprint.params = '<name>';
exports.default = ORMAdapterBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImJsdWVwcmludHMvb3JtLWFkYXB0ZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBK0M7QUFDL0MsMkNBQXlDO0FBQ3pDLG1DQUdnQjtBQUVoQjs7OztHQUlHO0FBQ0gseUJBQXlDLFNBQVEsc0JBQVM7SUFpQnhELE1BQU0sQ0FBQyxJQUFTO1FBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLEdBQUcsd0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixNQUFNLENBQUM7WUFDTCxJQUFJO1lBQ0osU0FBUyxFQUFFLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QyxDQUFDO0lBQ0osQ0FBQzs7QUF0QkQsMkNBQTJDO0FBQ3BDLGlDQUFhLEdBQUcsYUFBYSxDQUFDO0FBQzlCLCtCQUFXLEdBQUcsdUVBQXVFLENBQUM7QUFDdEYsbUNBQWUsR0FBRyxtQkFBTSxDQUFBOzs7Ozs7OztHQVE5QixDQUFDO0FBRUssMEJBQU0sR0FBRyxRQUFRLENBQUM7QUFmM0Isc0NBMEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmx1ZXByaW50LCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCB7IHNpbmd1bGFyaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5pbXBvcnQge1xuICB1cHBlckZpcnN0LFxuICBjYW1lbENhc2Vcbn0gZnJvbSAnbG9kYXNoJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBibGFuayBPUk0gYWRhcHRlciB3aXRoIHN0dWJzIGZvciBhbGwgdGhlIHJlcXVpcmVkIG1ldGhvZHNcbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9STUFkYXB0ZXJCbHVlcHJpbnQgZXh0ZW5kcyBCbHVlcHJpbnQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGJsdWVwcmludE5hbWUgPSAnb3JtLWFkYXB0ZXInO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnR2VuZXJhdGVzIGEgYmxhbmsgT1JNIGFkYXB0ZXIgd2l0aCBzdHVicyBmb3IgYWxsIHRoZSByZXF1aXJlZCBtZXRob2RzJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIG9ybS1hZGFwdGVyIDxuYW1lPiBbb3B0aW9uc11cblxuICAgIEdlbmVyYXRlcyBhIG5ldyBPUk0gYWRhcHRlciB3aXRoIHN0dWJzIGZvciBhbGwgdGhlIHJlcXVpcmVkIGFkYXB0ZXIgbWV0aG9kcy4gTm90ZTogdGhpcyBpc1xuICAgIHR5cGljYWxseSBhbiBhZHZhbmNlZCB1c2UgY2FzZSAoaS5lLiB1c2luZyBhIG5pY2hlLCBzcGVjaWFsdHkgZGF0YWJhc2UpLiBZb3Ugc2hvdWxkIGNoZWNrIHRvXG4gICAgbWFrZSBzdXJlIHRoZXJlIGlzbid0IGFscmVhZHkgYSBEZW5hbGkgYWRkb24gdGhhdCBpbXBsZW1lbnRzIHRoZSBPUk0gYWRhcHRlciB5b3UgbmVlZC5cblxuICAgIEd1aWRlczogaHR0cDovL2RlbmFsaWpzLm9yZy9tYXN0ZXIvZ3VpZGVzL2RhdGEvb3JtLWFkYXB0ZXJzL1xuICBgO1xuXG4gIHN0YXRpYyBwYXJhbXMgPSAnPG5hbWU+JztcblxuICBsb2NhbHMoYXJndjogYW55KSB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgbmFtZSA9IHNpbmd1bGFyaXplKG5hbWUpO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgY2xhc3NOYW1lOiB1cHBlckZpcnN0KGNhbWVsQ2FzZShuYW1lKSlcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==