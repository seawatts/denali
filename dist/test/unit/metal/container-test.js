"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
const path = require("path");
const dummyAppPath = path.join(__dirname, '..', 'dummy');
ava_1.default('metaFor returns a container-scoped metadata object', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    let key = {};
    let meta = container.metaFor(key);
    meta.foo = true;
    t.is(container.metaFor(key), meta);
    let otherContainer = new denali_1.Container(dummyAppPath);
    t.not(otherContainer.metaFor(key), meta);
}));
ava_1.default('get/setOption allows options per type', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.setOption('type', 'singleton', true);
    t.true(container.getOption('type', 'singleton'));
    t.true(container.getOption('type:entry', 'singleton'));
}));
ava_1.default('get/setOption allows options per specifier', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.setOption('type:entry', 'singleton', true);
    t.true(container.getOption('type:entry', 'singleton'));
}));
ava_1.default('instantiate: true, singleton: true', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.setOption('foo', 'singleton', true);
    container.setOption('foo', 'instantiate', true);
    class Foo {
    }
    container.register('foo:main', Foo);
    let result = container.lookup('foo:main');
    t.true(result instanceof Foo);
    t.is(result, container.lookup('foo:main'));
}));
ava_1.default('instantiate: false, singleton: true', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.setOption('foo', 'singleton', true);
    container.setOption('foo', 'instantiate', false);
    let foo = {};
    container.register('foo:main', foo);
    let result = container.lookup('foo:main');
    t.is(result, foo);
    t.is(result, container.lookup('foo:main'));
}));
ava_1.default('instantiate: true, singleton: false', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.setOption('foo', 'singleton', false);
    container.setOption('foo', 'instantiate', true);
    class Foo {
    }
    container.register('foo:main', Foo);
    let result = container.lookup('foo:main');
    t.true(result instanceof Foo);
    t.not(result, container.lookup('foo:main'));
}));
ava_1.default('should default unknown types to instantiate: false, singleton: true', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.register('foo:main', { foo: true });
    let result = container.lookup('foo:main');
    t.true(result.foo);
}));
ava_1.default('register(type, value) registers a value on the container', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.register('foo:bar', { buzz: true }, { singleton: true, instantiate: false });
    t.true(container.lookup('foo:bar').buzz);
}));
ava_1.default('lookup(type) looks up a module', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.register('foo:bar', { buzz: true }, { singleton: true, instantiate: false });
    t.true(container.lookup('foo:bar').buzz);
}));
ava_1.default('lookupAll(type) returns an object with all the modules of the given type', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.register('foo:bar', { isBar: true }, { singleton: true, instantiate: false });
    container.register('foo:buzz', { isBuzz: true }, { singleton: true, instantiate: false });
    let type = container.lookupAll('foo');
    t.truthy(type.bar);
    t.true(type.bar.isBar);
    t.truthy(type.buzz);
    t.true(type.buzz.isBuzz);
}));
ava_1.default('lazily instantiates singletons (i.e. on lookup)', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    function Class() {
        t.fail('Class should not have been instantiated.');
    }
    container.register('foo:bar', Class, { singleton: true });
    t.pass();
}));
ava_1.default('availableForType() returns all registered instances of a type', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.register('foo:a', { a: true }, { singleton: true, instantiate: false });
    container.register('foo:b', { b: true }, { singleton: true, instantiate: false });
    container.register('foo:c', { c: true }, { singleton: true, instantiate: false });
    container.register('foo:d', { d: true }, { singleton: true, instantiate: false });
    t.deepEqual(container.availableForType('foo'), ['a', 'b', 'c', 'd']);
}));
ava_1.default('properties marked as injections are injected', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container(dummyAppPath);
    container.register('bar:main', { isPresent: true }, { singleton: true, instantiate: false });
    container.register('foo:main', { bar: denali_1.inject('bar:main') }, { singleton: true, instantiate: false });
    let foo = container.lookup('foo:main');
    t.true(foo.bar.isPresent, 'injection was applied');
}));
ava_1.default('tears down singletons', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = new denali_1.Container(dummyAppPath);
    container.register('foo:main', {
        teardown() {
            t.pass();
        }
    }, { singleton: false, instantiate: false });
    container.lookup('foo:main');
    container.teardown();
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbInRlc3QvdW5pdC9tZXRhbC9jb250YWluZXItdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBMEU7QUFDMUUsNkJBQXVCO0FBQ3ZCLG1DQUEyQztBQUMzQyw2QkFBNkI7QUFFN0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBRXpELGFBQUksQ0FBQyxvREFBb0QsRUFBRSxDQUFPLENBQUM7SUFDakUsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNiLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7SUFDaEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRW5DLElBQUksY0FBYyxHQUFHLElBQUksa0JBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0MsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyx1Q0FBdUMsRUFBRSxDQUFPLENBQUM7SUFDcEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMv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RyxJQUFJLGtCQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzdGLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLGVBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNyRyxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFNLFVBQVUsQ0FBQyxDQUFDO0lBRTVDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztBQUNyRCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQU8sQ0FBQztJQUNwQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO1FBQzdCLFFBQVE7WUFDTixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDO0tBQ0YsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDN0MsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QixTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDdkIsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHsgQ29udGFpbmVyLCBpbmplY3QgfSBmcm9tICdkZW5hbGknO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgZHVtbXlBcHBQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ2R1bW15Jyk7XG5cbnRlc3QoJ21ldGFGb3IgcmV0dXJucyBhIGNvbnRhaW5lci1zY29wZWQgbWV0YWRhdGEgb2JqZWN0JywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoZHVtbXlBcHBQYXRoKTtcbiAgbGV0IGtleSA9IHt9O1xuICBsZXQgbWV0YSA9IGNvbnRhaW5lci5tZXRhRm9yKGtleSk7XG4gIG1ldGEuZm9vID0gdHJ1ZTtcbiAgdC5pcyhjb250YWluZXIubWV0YUZvcihrZXkpLCBtZXRhKTtcblxuICBsZXQgb3RoZXJDb250YWluZXIgPSBuZXcgQ29udGFpbmVyKGR1bW15QXBwUGF0aCk7XG4gIHQubm90KG90aGVyQ29udGFpbmVyLm1ldGFGb3Ioa2V5KSwgbWV0YSk7XG59KTtcblxudGVzdCgnZ2V0L3NldE9wdGlvbiBhbGxvd3Mgb3B0aW9ucyBwZXIgdHlwZScsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKGR1bW15QXBwUGF0aCk7XG4gIGNvbnRhaW5lci5zZXRPcHRpb24oJ3R5cGUnLCAnc2luZ2xldG9uJywgdHJ1ZSk7XG4gIHQudHJ1ZShjb250YWluZXIuZ2V0T3B0aW9uKCd0eXBlJywgJ3NpbmdsZXRvbicpKTtcbiAgdC50cnVlKGNvbnRhaW5lci5nZXRPcHRpb24oJ3R5cGU6ZW50cnknLCAnc2luZ2xldG9uJykpO1xufSk7XG5cbnRlc3QoJ2dldC9zZXRPcHRpb24gYWxsb3dzIG9wdGlvbnMgcGVyIHNwZWNpZmllcicsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKGR1bW15QXBwUGF0aCk7XG4gIGNvbnRhaW5lci5zZXRPcHRpb24oJ3R5cGU6ZW50cnknLCAnc2luZ2xldG9uJywgdHJ1ZSk7XG4gIHQudHJ1ZShjb250YWluZXIuZ2V0T3B0aW9uKCd0eXBlOmVudHJ5JywgJ3NpbmdsZXRvbicpKTtcbn0pO1xuXG50ZXN0KCdpbnN0YW50aWF0ZTogdHJ1ZSwgc2luZ2xldG9uOiB0cnVlJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoZHVtbXlBcHBQYXRoKTtcbiAgY29udGFpbmVyLnNldE9wdGlvbignZm9vJywgJ3NpbmdsZXRvbicsIHRydWUpO1xuICBjb250YWluZXIuc2V0T3B0aW9uKCdmb28nLCAnaW5zdGFudGlhdGUnLCB0cnVlKTtcblxuICBjbGFzcyBGb28ge31cbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdmb286bWFpbicsIEZvbyk7XG4gIGxldCByZXN1bHQgPSBjb250YWluZXIubG9va3VwKCdmb286bWFpbicpO1xuXG4gIHQudHJ1ZShyZXN1bHQgaW5zdGFuY2VvZiBGb28pO1xuICB0LmlzKHJlc3VsdCwgY29udGFpbmVyLmxvb2t1cCgnZm9vOm1haW4nKSk7XG59KTtcblxudGVzdCgnaW5zdGFudGlhdGU6IGZhbHNlLCBzaW5nbGV0b246IHRydWUnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcihkdW1teUFwcFBhdGgpO1xuICBjb250YWluZXIuc2V0T3B0aW9uKCdmb28nLCAnc2luZ2xldG9uJywgdHJ1ZSk7XG4gIGNvbnRhaW5lci5zZXRPcHRpb24oJ2ZvbycsICdpbnN0YW50aWF0ZScsIGZhbHNlKTtcblxuICBsZXQgZm9vID0ge307XG4gIGNvbnRhaW5lci5yZWdpc3RlcignZm9vOm1haW4nLCBmb28pO1xuICBsZXQgcmVzdWx0ID0gY29udGFpbmVyLmxvb2t1cCgnZm9vOm1haW4nKTtcblxuICB0LmlzKHJlc3VsdCwgZm9vKTtcbiAgdC5pcyhyZXN1bHQsIGNvbnRhaW5lci5sb29rdXAoJ2ZvbzptYWluJykpO1xufSk7XG5cbnRlc3QoJ2luc3RhbnRpYXRlOiB0cnVlLCBzaW5nbGV0b246IGZhbHNlJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoZHVtbXlBcHBQYXRoKTtcbiAgY29udGFpbmVyLnNldE9wdGlvbignZm9vJywgJ3NpbmdsZXRvbicsIGZhbHNlKTtcbiAgY29udGFpbmVyLnNldE9wdGlvbignZm9vJywgJ2luc3RhbnRpYXRlJywgdHJ1ZSk7XG5cbiAgY2xhc3MgRm9vIHt9XG4gIGNvbnRhaW5lci5yZWdpc3RlcignZm9vOm1haW4nLCBGb28pO1xuICBsZXQgcmVzdWx0ID0gY29udGFpbmVyLmxvb2t1cCgnZm9vOm1haW4nKTtcblxuICB0LnRydWUocmVzdWx0IGluc3RhbmNlb2YgRm9vKTtcbiAgdC5ub3QocmVzdWx0LCBjb250YWluZXIubG9va3VwKCdmb286bWFpbicpKTtcbn0pO1xuXG50ZXN0KCdzaG91bGQgZGVmYXVsdCB1bmtub3duIHR5cGVzIHRvIGluc3RhbnRpYXRlOiBmYWxzZSwgc2luZ2xldG9uOiB0cnVlJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoZHVtbXlBcHBQYXRoKTtcblxuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzptYWluJywgeyBmb286IHRydWUgfSk7XG4gIGxldCByZXN1bHQgPSBjb250YWluZXIubG9va3VwKCdmb286bWFpbicpO1xuXG4gIHQudHJ1ZShyZXN1bHQuZm9vKTtcbn0pO1xuXG50ZXN0KCdyZWdpc3Rlcih0eXBlLCB2YWx1ZSkgcmVnaXN0ZXJzIGEgdmFsdWUgb24gdGhlIGNvbnRhaW5lcicsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKGR1bW15QXBwUGF0aCk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignZm9vOmJhcicsIHsgYnV6ejogdHJ1ZSB9LCB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuICB0LnRydWUoY29udGFpbmVyLmxvb2t1cDxhbnk+KCdmb286YmFyJykuYnV6eik7XG59KTtcblxudGVzdCgnbG9va3VwKHR5cGUpIGxvb2tzIHVwIGEgbW9kdWxlJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoZHVtbXlBcHBQYXRoKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdmb286YmFyJywgeyBidXp6OiB0cnVlIH0sIHsgc2luZ2xldG9uOiB0cnVlLCBpbnN0YW50aWF0ZTogZmFsc2UgfSk7XG4gIHQudHJ1ZShjb250YWluZXIubG9va3VwPGFueT4oJ2ZvbzpiYXInKS5idXp6KTtcbn0pO1xuXG50ZXN0KCdsb29rdXBBbGwodHlwZSkgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBhbGwgdGhlIG1vZHVsZXMgb2YgdGhlIGdpdmVuIHR5cGUnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcihkdW1teUFwcFBhdGgpO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzpiYXInLCB7IGlzQmFyOiB0cnVlIH0sIHsgc2luZ2xldG9uOiB0cnVlLCBpbnN0YW50aWF0ZTogZmFsc2UgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignZm9vOmJ1enonLCB7IGlzQnV6ejogdHJ1ZSB9LCB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuICBsZXQgdHlwZSA9IGNvbnRhaW5lci5sb29rdXBBbGw8YW55PignZm9vJyk7XG4gIHQudHJ1dGh5KHR5cGUuYmFyKTtcbiAgdC50cnVlKHR5cGUuYmFyLmlzQmFyKTtcbiAgdC50cnV0aHkodHlwZS5idXp6KTtcbiAgdC50cnVlKHR5cGUuYnV6ei5pc0J1enopO1xufSk7XG5cbnRlc3QoJ2xhemlseSBpbnN0YW50aWF0ZXMgc2luZ2xldG9ucyAoaS5lLiBvbiBsb29rdXApJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoZHVtbXlBcHBQYXRoKTtcbiAgZnVuY3Rpb24gQ2xhc3MoKSB7XG4gICAgdC5mYWlsKCdDbGFzcyBzaG91bGQgbm90IGhhdmUgYmVlbiBpbnN0YW50aWF0ZWQuJyk7XG4gIH1cbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdmb286YmFyJywgQ2xhc3MsIHsgc2luZ2xldG9uOiB0cnVlIH0pO1xuICB0LnBhc3MoKTtcbn0pO1xuXG50ZXN0KCdhdmFpbGFibGVGb3JUeXBlKCkgcmV0dXJucyBhbGwgcmVnaXN0ZXJlZCBpbnN0YW5jZXMgb2YgYSB0eXBlJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoZHVtbXlBcHBQYXRoKTtcblxuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzphJywge2E6IHRydWV9LCB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzpiJywge2I6IHRydWV9LCB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzpjJywge2M6IHRydWV9LCB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzpkJywge2Q6IHRydWV9LCB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuXG4gIHQuZGVlcEVxdWFsKGNvbnRhaW5lci5hdmFpbGFibGVGb3JUeXBlKCdmb28nKSwgWydhJywgJ2InLCAnYycsICdkJ10pO1xufSk7XG5cbnRlc3QoJ3Byb3BlcnRpZXMgbWFya2VkIGFzIGluamVjdGlvbnMgYXJlIGluamVjdGVkJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoZHVtbXlBcHBQYXRoKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdiYXI6bWFpbicsIHsgaXNQcmVzZW50OiB0cnVlIH0sIHsgc2luZ2xldG9uOiB0cnVlLCBpbnN0YW50aWF0ZTogZmFsc2UgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignZm9vOm1haW4nLCB7IGJhcjogaW5qZWN0KCdiYXI6bWFpbicpIH0sIHsgc2luZ2xldG9uOiB0cnVlLCBpbnN0YW50aWF0ZTogZmFsc2UgfSk7XG4gIGxldCBmb28gPSBjb250YWluZXIubG9va3VwPGFueT4oJ2ZvbzptYWluJyk7XG5cbiAgdC50cnVlKGZvby5iYXIuaXNQcmVzZW50LCAnaW5qZWN0aW9uIHdhcyBhcHBsaWVkJyk7XG59KTtcblxudGVzdCgndGVhcnMgZG93biBzaW5nbGV0b25zJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDEpO1xuICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcihkdW1teUFwcFBhdGgpO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzptYWluJywge1xuICAgIHRlYXJkb3duKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgfVxuICB9LCB7IHNpbmdsZXRvbjogZmFsc2UsIGluc3RhbnRpYXRlOiBmYWxzZSB9KTtcbiAgY29udGFpbmVyLmxvb2t1cCgnZm9vOm1haW4nKTtcbiAgY29udGFpbmVyLnRlYXJkb3duKCk7XG59KTsiXX0=