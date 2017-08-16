"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const bluebird_1 = require("bluebird");
exports.default = {
    name: 'define-orm-models',
    /**
     * Find all models, group them by their orm adapter, then give each adapter the chance to define
     * any internal model representation necessary.
     */
    initialize(application) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let container = application.container;
            let models = application.container.lookupAll('model');
            let modelsGroupedByAdapter = new Map();
            lodash_1.forEach(models, (ModelClass, modelName) => {
                if (ModelClass.hasOwnProperty('abstract') && ModelClass.abstract) {
                    return;
                }
                let Adapter = container.lookup(`orm-adapter:${modelName}`, { loose: true }) || container.lookup('orm-adapter:application');
                if (!modelsGroupedByAdapter.has(Adapter)) {
                    modelsGroupedByAdapter.set(Adapter, []);
                }
                modelsGroupedByAdapter.get(Adapter).push(ModelClass);
            });
            let definitions = [];
            modelsGroupedByAdapter.forEach((modelsForThisAdapter, Adapter) => {
                definitions.push(Adapter.defineModels(modelsForThisAdapter));
            });
            yield bluebird_1.all(definitions);
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5lLW9ybS1tb2RlbHMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImNvbmZpZy9pbml0aWFsaXplcnMvZGVmaW5lLW9ybS1tb2RlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBRWdCO0FBQ2hCLHVDQUErQjtBQUsvQixrQkFBZTtJQUNiLElBQUksRUFBRSxtQkFBbUI7SUFFekI7OztPQUdHO0lBQ0csVUFBVSxDQUFDLFdBQXdCOztZQUN2QyxJQUFJLFNBQVMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDO1lBQ3RDLElBQUksTUFBTSxHQUEwQyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RixJQUFJLHNCQUFzQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDdkMsZ0JBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUztnQkFDcEMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDakUsTUFBTSxDQUFDO2dCQUNULENBQUM7Z0JBQ0QsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFnQixTQUFVLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztnQkFDN0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxDQUFDO2dCQUNELHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLFdBQVcsR0FBVSxFQUFFLENBQUM7WUFDNUIsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUMsb0JBQW9DLEVBQUUsT0FBbUI7Z0JBQ3ZGLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLGNBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6QixDQUFDO0tBQUE7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgZm9yRWFjaFxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgYWxsIH0gZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4uLy4uL2xpYi9ydW50aW1lL2FwcGxpY2F0aW9uJztcbmltcG9ydCBNb2RlbCBmcm9tICcuLi8uLi9saWIvZGF0YS9tb2RlbCc7XG5pbXBvcnQgT1JNQWRhcHRlciBmcm9tICcuLi8uLi9saWIvZGF0YS9vcm0tYWRhcHRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ2RlZmluZS1vcm0tbW9kZWxzJyxcblxuICAvKipcbiAgICogRmluZCBhbGwgbW9kZWxzLCBncm91cCB0aGVtIGJ5IHRoZWlyIG9ybSBhZGFwdGVyLCB0aGVuIGdpdmUgZWFjaCBhZGFwdGVyIHRoZSBjaGFuY2UgdG8gZGVmaW5lXG4gICAqIGFueSBpbnRlcm5hbCBtb2RlbCByZXByZXNlbnRhdGlvbiBuZWNlc3NhcnkuXG4gICAqL1xuICBhc3luYyBpbml0aWFsaXplKGFwcGxpY2F0aW9uOiBBcHBsaWNhdGlvbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBjb250YWluZXIgPSBhcHBsaWNhdGlvbi5jb250YWluZXI7XG4gICAgbGV0IG1vZGVsczogeyBbbW9kZWxOYW1lOiBzdHJpbmddOiB0eXBlb2YgTW9kZWwgfSA9IGFwcGxpY2F0aW9uLmNvbnRhaW5lci5sb29rdXBBbGwoJ21vZGVsJyk7XG4gICAgbGV0IG1vZGVsc0dyb3VwZWRCeUFkYXB0ZXIgPSBuZXcgTWFwKCk7XG4gICAgZm9yRWFjaChtb2RlbHMsIChNb2RlbENsYXNzLCBtb2RlbE5hbWUpID0+IHtcbiAgICAgIGlmIChNb2RlbENsYXNzLmhhc093blByb3BlcnR5KCdhYnN0cmFjdCcpICYmIE1vZGVsQ2xhc3MuYWJzdHJhY3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IEFkYXB0ZXIgPSBjb250YWluZXIubG9va3VwKGBvcm0tYWRhcHRlcjokeyBtb2RlbE5hbWUgfWAsIHsgbG9vc2U6IHRydWUgfSkgfHwgY29udGFpbmVyLmxvb2t1cCgnb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nKTtcbiAgICAgIGlmICghbW9kZWxzR3JvdXBlZEJ5QWRhcHRlci5oYXMoQWRhcHRlcikpIHtcbiAgICAgICAgbW9kZWxzR3JvdXBlZEJ5QWRhcHRlci5zZXQoQWRhcHRlciwgW10pO1xuICAgICAgfVxuICAgICAgbW9kZWxzR3JvdXBlZEJ5QWRhcHRlci5nZXQoQWRhcHRlcikucHVzaChNb2RlbENsYXNzKTtcbiAgICB9KTtcbiAgICBsZXQgZGVmaW5pdGlvbnM6IGFueVtdID0gW107XG4gICAgbW9kZWxzR3JvdXBlZEJ5QWRhcHRlci5mb3JFYWNoKChtb2RlbHNGb3JUaGlzQWRhcHRlcjogdHlwZW9mIE1vZGVsW10sIEFkYXB0ZXI6IE9STUFkYXB0ZXIpOiB2b2lkID0+IHtcbiAgICAgIGRlZmluaXRpb25zLnB1c2goQWRhcHRlci5kZWZpbmVNb2RlbHMobW9kZWxzRm9yVGhpc0FkYXB0ZXIpKTtcbiAgICB9KTtcbiAgICBhd2FpdCBhbGwoZGVmaW5pdGlvbnMpO1xuICB9XG59O1xuIl19