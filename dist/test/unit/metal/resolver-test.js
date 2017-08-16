"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const path = require("path");
const denali_1 = require("denali");
const dummyAppPath = path.join(__dirname, '..', '..', '..');
ava_1.default('registered entries take precedence over resolved entries', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let resolver = new denali_1.Resolver(dummyAppPath);
    t.is(Object.getPrototypeOf(resolver.retrieve('action:application')), denali_1.Action);
    resolver.register('action:application', { foo: true });
    t.true(resolver.retrieve('action:application').foo);
}));
ava_1.default('retrieve tries type-specific retrieval methods if present', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class TestResolver extends denali_1.Resolver {
        retrieveFoo(type, entry) {
            t.pass();
        }
    }
    let resolver = new TestResolver(dummyAppPath);
    resolver.retrieve('foo:main');
}));
ava_1.default('availableForType returns array of available entries for given type', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let resolver = new denali_1.Resolver(dummyAppPath);
    resolver.register('foo:1', {});
    resolver.register('foo:2', {});
    resolver.register('foo:3', {});
    t.deepEqual(resolver.availableForType('foo'), ['foo:1', 'foo:2', 'foo:3']);
}));
ava_1.default('availableForType tries type-specific retrieval methods if present', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    class TestResolver extends denali_1.Resolver {
        availableForFoo(type) {
            t.pass();
            return [];
        }
    }
    let resolver = new TestResolver(dummyAppPath);
    resolver.availableForType('foo');
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXItdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC91bml0L21ldGFsL3Jlc29sdmVyLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2Qiw2QkFBNkI7QUFDN0IsbUNBQTBDO0FBRTFDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFNUQsYUFBSSxDQUFDLDBEQUEwRCxFQUFFLENBQU8sQ0FBQztJQUN2RSxJQUFJLFFBQVEsR0FBRyxJQUFJLGlCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLGVBQU0sQ0FBQyxDQUFDO0lBQzdFLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN2RCxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0RCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLDJEQUEyRCxFQUFFLENBQU8sQ0FBQztJQUN4RSxrQkFBbUIsU0FBUSxpQkFBUTtRQUNqQyxXQUFXLENBQUMsSUFBWSxFQUFFLEtBQWE7WUFDckMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUNGO0lBQ0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLG9FQUFvRSxFQUFFLENBQU8sQ0FBQztJQUNqRixJQUFJLFFBQVEsR0FBRyxJQUFJLGlCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUM7QUFDL0UsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxtRUFBbUUsRUFBRSxDQUFPLENBQUM7SUFDaEYsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNWLGtCQUFtQixTQUFRLGlCQUFRO1FBQ2pDLGVBQWUsQ0FBQyxJQUFZO1lBQzFCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNULE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDWixDQUFDO0tBQ0Y7SUFDRCxJQUFJLFFBQVEsR0FBRyxJQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEFjdGlvbiwgUmVzb2x2ZXIgfSBmcm9tICdkZW5hbGknO1xuXG5jb25zdCBkdW1teUFwcFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnLi4nKTtcblxudGVzdCgncmVnaXN0ZXJlZCBlbnRyaWVzIHRha2UgcHJlY2VkZW5jZSBvdmVyIHJlc29sdmVkIGVudHJpZXMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgcmVzb2x2ZXIgPSBuZXcgUmVzb2x2ZXIoZHVtbXlBcHBQYXRoKTtcbiAgdC5pcyhPYmplY3QuZ2V0UHJvdG90eXBlT2YocmVzb2x2ZXIucmV0cmlldmUoJ2FjdGlvbjphcHBsaWNhdGlvbicpKSwgQWN0aW9uKTtcbiAgcmVzb2x2ZXIucmVnaXN0ZXIoJ2FjdGlvbjphcHBsaWNhdGlvbicsIHsgZm9vOiB0cnVlIH0pO1xuICB0LnRydWUocmVzb2x2ZXIucmV0cmlldmUoJ2FjdGlvbjphcHBsaWNhdGlvbicpLmZvbyk7XG59KTtcblxudGVzdCgncmV0cmlldmUgdHJpZXMgdHlwZS1zcGVjaWZpYyByZXRyaWV2YWwgbWV0aG9kcyBpZiBwcmVzZW50JywgYXN5bmMgKHQpID0+IHtcbiAgY2xhc3MgVGVzdFJlc29sdmVyIGV4dGVuZHMgUmVzb2x2ZXIge1xuICAgIHJldHJpZXZlRm9vKHR5cGU6IHN0cmluZywgZW50cnk6IHN0cmluZykge1xuICAgICAgdC5wYXNzKCk7XG4gICAgfVxuICB9XG4gIGxldCByZXNvbHZlciA9IG5ldyBUZXN0UmVzb2x2ZXIoZHVtbXlBcHBQYXRoKTtcbiAgcmVzb2x2ZXIucmV0cmlldmUoJ2ZvbzptYWluJyk7XG59KTtcblxudGVzdCgnYXZhaWxhYmxlRm9yVHlwZSByZXR1cm5zIGFycmF5IG9mIGF2YWlsYWJsZSBlbnRyaWVzIGZvciBnaXZlbiB0eXBlJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IHJlc29sdmVyID0gbmV3IFJlc29sdmVyKGR1bW15QXBwUGF0aCk7XG4gIHJlc29sdmVyLnJlZ2lzdGVyKCdmb286MScsIHt9KTtcbiAgcmVzb2x2ZXIucmVnaXN0ZXIoJ2ZvbzoyJywge30pO1xuICByZXNvbHZlci5yZWdpc3RlcignZm9vOjMnLCB7fSk7XG4gIHQuZGVlcEVxdWFsKHJlc29sdmVyLmF2YWlsYWJsZUZvclR5cGUoJ2ZvbycpLCBbICdmb286MScsICdmb286MicsICdmb286MycgXSk7XG59KTtcblxudGVzdCgnYXZhaWxhYmxlRm9yVHlwZSB0cmllcyB0eXBlLXNwZWNpZmljIHJldHJpZXZhbCBtZXRob2RzIGlmIHByZXNlbnQnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMSk7XG4gIGNsYXNzIFRlc3RSZXNvbHZlciBleHRlbmRzIFJlc29sdmVyIHtcbiAgICBhdmFpbGFibGVGb3JGb28odHlwZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG4gIGxldCByZXNvbHZlciA9IG5ldyBUZXN0UmVzb2x2ZXIoZHVtbXlBcHBQYXRoKTtcbiAgcmVzb2x2ZXIuYXZhaWxhYmxlRm9yVHlwZSgnZm9vJyk7XG59KTtcbiJdfQ==