"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
ava_1.default('walks prototype chain of object', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class Grandparent {
    }
    class Parent extends Grandparent {
    }
    class Child extends Parent {
    }
    let prototypes = [];
    denali_1.eachPrototype(Child, (prototype) => {
        prototypes.push(prototype);
    });
    t.deepEqual(prototypes, [Child, Parent, Grandparent, Object.getPrototypeOf(Function), Object.getPrototypeOf({})]);
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWFjaC1wcm90b3R5cGUtdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC91bml0L21ldGFsL2VhY2gtcHJvdG90eXBlLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2QixtQ0FBdUM7QUFFdkMsYUFBSSxDQUFDLGlDQUFpQyxFQUFFLENBQU8sQ0FBQztJQUM5QztLQUFvQjtJQUNwQixZQUFhLFNBQVEsV0FBVztLQUFHO0lBQ25DLFdBQVksU0FBUSxNQUFNO0tBQUc7SUFFN0IsSUFBSSxVQUFVLEdBQVUsRUFBRSxDQUFDO0lBQzNCLHNCQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsU0FBUztRQUM3QixVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FBQyxDQUFDO0lBRUgsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFDO0FBQ3RILENBQUMsQ0FBQSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyBuby1lbXB0eSBuby1pbnZhbGlkLXRoaXMgbWVtYmVyLWFjY2VzcyAqL1xuaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCB7IGVhY2hQcm90b3R5cGUgfSBmcm9tICdkZW5hbGknO1xuXG50ZXN0KCd3YWxrcyBwcm90b3R5cGUgY2hhaW4gb2Ygb2JqZWN0JywgYXN5bmMgKHQpID0+IHtcbiAgY2xhc3MgR3JhbmRwYXJlbnQge31cbiAgY2xhc3MgUGFyZW50IGV4dGVuZHMgR3JhbmRwYXJlbnQge31cbiAgY2xhc3MgQ2hpbGQgZXh0ZW5kcyBQYXJlbnQge31cblxuICBsZXQgcHJvdG90eXBlczogYW55W10gPSBbXTtcbiAgZWFjaFByb3RvdHlwZShDaGlsZCwgKHByb3RvdHlwZSkgPT4ge1xuICAgIHByb3RvdHlwZXMucHVzaChwcm90b3R5cGUpO1xuICB9KTtcblxuICB0LmRlZXBFcXVhbChwcm90b3R5cGVzLCBbIENoaWxkLCBQYXJlbnQsIEdyYW5kcGFyZW50LCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRnVuY3Rpb24pLCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoe30pIF0pO1xufSk7XG4iXX0=