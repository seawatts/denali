"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
function mockRequest(options) {
    return new denali_1.Request(new denali_1.MockRequest(options));
}
ava_1.default.beforeEach((t) => {
    let container = t.context.container = new denali_1.Container(__dirname);
    container.register('app:logger', denali_1.Logger);
    container.register('service:db', denali_1.DatabaseService);
    container.register('parser:application', denali_1.FlatParser);
    container.register('serializer:application', denali_1.RawSerializer);
    container.register('service:db', {}, { instantiate: false });
    container.register('config:environment', {});
    t.context.runAction = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        let response = new denali_1.MockResponse();
        let action = yield container.lookup('action:test');
        action.actionPath = 'test';
        yield action.run(mockRequest(options), response);
        // If we can parse a response, return that, otherwise just return false (lots of these tests
        // don't care about the response bod);
        try {
            return response._getJSON();
        }
        catch (e) {
            return false;
        }
    });
});
ava_1.default.todo('renders with a custom view if provided');
ava_1.default.todo('throws if nothing renders');
ava_1.default('invokes respond() with params', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('action:test', class TestAction extends denali_1.Action {
        respond({ query }) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.is(query.foo, 'bar');
                t.pass();
                return {};
            });
        }
    });
    yield t.context.runAction({ url: '/?foo=bar' });
}));
ava_1.default('does not invoke the serializer if no response body was provided', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.Serializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
        serialize(action, body, options) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.fail('Serializer should not be invoked');
            });
        }
    });
    container.register('action:test', class TestAction extends denali_1.Action {
        respond() {
            t.pass();
            this.render(200);
        }
    });
    yield t.context.runAction();
}));
ava_1.default('uses a specified serializer type when provided', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('serializer:foo', class TestSerializer extends denali_1.Serializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
        serialize(action, body, options) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.pass();
            });
        }
    });
    container.register('action:test', class TestAction extends denali_1.Action {
        respond() {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.pass();
                yield this.render(200, {}, { serializer: 'foo' });
            });
        }
    });
    yield t.context.runAction();
}));
ava_1.default('renders with the model type serializer if a model was rendered', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('serializer:foo', class FooSerializer extends denali_1.Serializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
        serialize(action, body, options) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.pass();
            });
        }
    });
    container.register('action:test', class TestAction extends denali_1.Action {
        respond() {
            t.pass();
            return new Proxy({
                constructor: { type: 'foo' },
                type: 'foo'
            }, {
                getPrototypeOf() {
                    return denali_1.Model.prototype;
                }
            });
        }
    });
    yield t.context.runAction();
}));
ava_1.default('renders with the application serializer if all options exhausted', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.Serializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
        serialize(action, body, options) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.pass();
            });
        }
    });
    container.register('action:test', class TestAction extends denali_1.Action {
        respond() {
            t.pass();
            return {};
        }
    });
    yield t.context.runAction();
}));
ava_1.default('invokes before filters prior to respond()', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let sequence = [];
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            beforeFilter() { sequence.push('before'); }
            respond() { sequence.push('respond'); return {}; }
            afterFilter() { sequence.push('after'); }
        },
        _a.before = ['beforeFilter'],
        _a.after = ['afterFilter'],
        _a));
    yield t.context.runAction();
    t.deepEqual(sequence, ['before', 'respond', 'after']);
    var _a;
}));
ava_1.default('invokes superclass filters before subclass filters', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let sequence = [];
    let container = t.context.container;
    class ParentClass extends denali_1.Action {
        parentBefore() { sequence.push('parent'); }
    }
    ParentClass.before = ['parentBefore'];
    container.register('action:test', (_a = class ChildClass extends ParentClass {
            childBefore() { sequence.push('child'); }
            respond() { return {}; }
        },
        _a.before = ['childBefore'],
        _a));
    yield t.context.runAction();
    t.deepEqual(sequence, ['parent', 'child']);
    var _a;
}));
ava_1.default('error out when an non-existent filter was specified', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() { }
        },
        _a.before = ['some-non-existent-method'],
        _a));
    // tslint:disable-next-line:no-floating-promises
    yield t.throws(t.context.runAction());
    var _a;
}));
ava_1.default('before filters that render block the responder', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() {
                t.fail('Filter should have preempted this responder method');
            }
            preempt() {
                this.render(200, { hello: 'world' });
            }
        },
        _a.before = ['preempt'],
        _a));
    let response = yield t.context.runAction();
    t.deepEqual(response, { hello: 'world' });
    var _a;
}));
ava_1.default('before filters that return block the responder', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() {
                t.fail('Filter should have preempted this responder method');
            }
            preempt() {
                return { hello: 'world' };
            }
        },
        _a.before = ['preempt'],
        _a));
    let response = yield t.context.runAction();
    t.deepEqual(response, { hello: 'world' });
    var _a;
}));
ava_1.default('after filters run after responder, even if responder renders', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() { return {}; }
            afterFilter() { t.pass(); }
        },
        _a.after = ['afterFilter'],
        _a));
    yield t.context.runAction();
    var _a;
}));
ava_1.default('after filters run even if a before filter renders', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() { t.fail(); }
            beforeFilter() {
                t.pass();
                this.render(200);
            }
            afterFilter() { t.pass(); }
        },
        _a.before = ['beforeFilter'],
        _a.after = ['afterFilter'],
        _a));
    yield t.context.runAction();
    var _a;
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy10ZXN0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvcnVudGltZS9hY3Rpb25zLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2QixtQ0FheUI7QUFFekIscUJBQXFCLE9BQWE7SUFDaEMsTUFBTSxDQUFDLElBQUksZ0JBQU8sQ0FBTSxJQUFJLG9CQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBRUQsYUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDaEIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxrQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9ELFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLGVBQU0sQ0FBQyxDQUFDO0lBQ3pDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLHdCQUFlLENBQUMsQ0FBQztJQUNsRCxTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLG1CQUFVLENBQUMsQ0FBQztJQUNyRCxTQUFTLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLHNCQUFhLENBQUMsQ0FBQztJQUM1RCxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUM3RCxTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQU8sT0FBYTtRQUN4QyxJQUFJLFFBQVEsR0FBRyxJQUFJLHFCQUFZLEVBQUUsQ0FBQztRQUNsQyxJQUFJLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFN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QUFLLEdBQUcsQ0FBRSxhQUFhLENBQUc7WUFHakMsQ0FBQztJQUNILE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFDOUIsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxtREFBbUQsRUFBRSxDQUFPLENBQUM7SUFDaEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNWLElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxRQUFFLGdCQUFpQixTQUFRLGVBQU07WUFHL0QsT0FBTyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkIsWUFBWTtnQkFDVixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQixDQUFDO1lBQ0QsV0FBVyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDNUI7UUFSUSxTQUFNLEdBQUcsQ0FBRSxjQUFjLENBQUc7UUFDNUIsUUFBSyxHQUFHLENBQUUsYUFBYSxDQUFHO1lBT2pDLENBQUM7SUFDSCxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBQzlCLENBQUMsQ0FBQSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyBuby1lbXB0eSBuby1pbnZhbGlkLXRoaXMgbWVtYmVyLWFjY2VzcyAqL1xuaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCB7XG4gIEFjdGlvbixcbiAgTW9kZWwsXG4gIENvbnRhaW5lcixcbiAgU2VyaWFsaXplcixcbiAgUmVxdWVzdCxcbiAgTW9ja1JlcXVlc3QsXG4gIE1vY2tSZXNwb25zZSxcbiAgRmxhdFBhcnNlcixcbiAgUmF3U2VyaWFsaXplcixcbiAgUmVuZGVyT3B0aW9ucyxcbiAgUmVzcG9uZGVyUGFyYW1zLFxuICBEYXRhYmFzZVNlcnZpY2UsXG4gIExvZ2dlciB9IGZyb20gJ2RlbmFsaSc7XG5cbmZ1bmN0aW9uIG1vY2tSZXF1ZXN0KG9wdGlvbnM/OiBhbnkpIHtcbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KDxhbnk+bmV3IE1vY2tSZXF1ZXN0KG9wdGlvbnMpKTtcbn1cblxudGVzdC5iZWZvcmVFYWNoKCh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcihfX2Rpcm5hbWUpO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FwcDpsb2dnZXInLCBMb2dnZXIpO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcnZpY2U6ZGInLCBEYXRhYmFzZVNlcnZpY2UpO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3BhcnNlcjphcHBsaWNhdGlvbicsIEZsYXRQYXJzZXIpO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6YXBwbGljYXRpb24nLCBSYXdTZXJpYWxpemVyKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJ2aWNlOmRiJywge30sIHsgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2NvbmZpZzplbnZpcm9ubWVudCcsIHt9KTtcbiAgdC5jb250ZXh0LnJ1bkFjdGlvbiA9IGFzeW5jIChvcHRpb25zPzogYW55KSA9PiB7XG4gICAgbGV0IHJlc3BvbnNlID0gbmV3IE1vY2tSZXNwb25zZSgpO1xuICAgIGxldCBhY3Rpb24gPSBhd2FpdCBjb250YWluZXIubG9va3VwPEFjdGlvbj4oJ2FjdGlvbjp0ZXN0Jyk7XG4gICAgYWN0aW9uLmFjdGlvblBhdGggPSAndGVzdCc7XG4gICAgYXdhaXQgYWN0aW9uLnJ1bihtb2NrUmVxdWVzdChvcHRpb25zKSwgPGFueT5yZXNwb25zZSk7XG4gICAgLy8gSWYgd2UgY2FuIHBhcnNlIGEgcmVzcG9uc2UsIHJldHVybiB0aGF0LCBvdGhlcndpc2UganVzdCByZXR1cm4gZmFsc2UgKGxvdHMgb2YgdGhlc2UgdGVzdHNcbiAgICAvLyBkb24ndCBjYXJlIGFib3V0IHRoZSByZXNwb25zZSBib2QpO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuX2dldEpTT04oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xufSk7XG5cbnRlc3QudG9kbygncmVuZGVycyB3aXRoIGEgY3VzdG9tIHZpZXcgaWYgcHJvdmlkZWQnKTtcbnRlc3QudG9kbygndGhyb3dzIGlmIG5vdGhpbmcgcmVuZGVycycpO1xuXG50ZXN0KCdpbnZva2VzIHJlc3BvbmQoKSB3aXRoIHBhcmFtcycsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigyKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIGFzeW5jIHJlc3BvbmQoeyBxdWVyeSB9OiBSZXNwb25kZXJQYXJhbXMpIHtcbiAgICAgIHQuaXMocXVlcnkuZm9vLCAnYmFyJyk7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH0pO1xuXG4gIGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oeyB1cmw6ICcvP2Zvbz1iYXInIH0pO1xufSk7XG5cbnRlc3QoJ2RvZXMgbm90IGludm9rZSB0aGUgc2VyaWFsaXplciBpZiBubyByZXNwb25zZSBib2R5IHdhcyBwcm92aWRlZCcsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmFwcGxpY2F0aW9uJywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgICBhc3luYyBzZXJpYWxpemUoYWN0aW9uOiBBY3Rpb24sIGJvZHk6IGFueSwgb3B0aW9uczogUmVuZGVyT3B0aW9ucykge1xuICAgICAgdC5mYWlsKCdTZXJpYWxpemVyIHNob3VsZCBub3QgYmUgaW52b2tlZCcpO1xuICAgIH1cbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICByZXNwb25kKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICB0aGlzLnJlbmRlcigyMDApO1xuICAgIH1cbiAgfSk7XG5cbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xufSk7XG5cbnRlc3QoJ3VzZXMgYSBzcGVjaWZpZWQgc2VyaWFsaXplciB0eXBlIHdoZW4gcHJvdmlkZWQnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpmb28nLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXM6IHN0cmluZ1tdID0gW107XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICAgIGFzeW5jIHNlcmlhbGl6ZShhY3Rpb246IEFjdGlvbiwgYm9keTogYW55LCBvcHRpb25zOiBSZW5kZXJPcHRpb25zKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICB9XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgYXN5bmMgcmVzcG9uZCgpIHtcbiAgICAgIHQucGFzcygpO1xuICAgICAgYXdhaXQgdGhpcy5yZW5kZXIoMjAwLCB7fSwgeyBzZXJpYWxpemVyOiAnZm9vJyB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIHdpdGggdGhlIG1vZGVsIHR5cGUgc2VyaWFsaXplciBpZiBhIG1vZGVsIHdhcyByZW5kZXJlZCcsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigyKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmZvbycsIGNsYXNzIEZvb1NlcmlhbGl6ZXIgZXh0ZW5kcyBTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgICBhc3luYyBzZXJpYWxpemUoYWN0aW9uOiBBY3Rpb24sIGJvZHk6IGFueSwgb3B0aW9uczogUmVuZGVyT3B0aW9ucykge1xuICAgICAgdC5wYXNzKCk7XG4gICAgfVxuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHJldHVybiBuZXcgUHJveHkoe1xuICAgICAgICBjb25zdHJ1Y3RvcjogeyB0eXBlOiAnZm9vJyB9LFxuICAgICAgICB0eXBlOiAnZm9vJ1xuICAgICAgfSwge1xuICAgICAgICBnZXRQcm90b3R5cGVPZigpIHtcbiAgICAgICAgICByZXR1cm4gTW9kZWwucHJvdG90eXBlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIHdpdGggdGhlIGFwcGxpY2F0aW9uIHNlcmlhbGl6ZXIgaWYgYWxsIG9wdGlvbnMgZXhoYXVzdGVkJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDIpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXM6IHN0cmluZ1tdID0gW107XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICAgIGFzeW5jIHNlcmlhbGl6ZShhY3Rpb246IEFjdGlvbiwgYm9keTogYW55LCBvcHRpb25zOiBSZW5kZXJPcHRpb25zKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICB9XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIHQucGFzcygpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSk7XG5cbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xufSk7XG5cbnRlc3QoJ2ludm9rZXMgYmVmb3JlIGZpbHRlcnMgcHJpb3IgdG8gcmVzcG9uZCgpJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IHNlcXVlbmNlOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgc3RhdGljIGJlZm9yZSA9IFsgJ2JlZm9yZUZpbHRlcicgXTtcbiAgICBzdGF0aWMgYWZ0ZXIgPSBbICdhZnRlckZpbHRlcicgXTtcblxuICAgIGJlZm9yZUZpbHRlcigpIHsgc2VxdWVuY2UucHVzaCgnYmVmb3JlJyk7IH1cbiAgICByZXNwb25kKCkgeyBzZXF1ZW5jZS5wdXNoKCdyZXNwb25kJyk7IHJldHVybiB7fTsgfVxuICAgIGFmdGVyRmlsdGVyKCkgeyBzZXF1ZW5jZS5wdXNoKCdhZnRlcicpOyB9XG4gIH0pO1xuXG4gIGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbiAgdC5kZWVwRXF1YWwoc2VxdWVuY2UsIFsgJ2JlZm9yZScsICdyZXNwb25kJywgJ2FmdGVyJyBdKTtcbn0pO1xuXG50ZXN0KCdpbnZva2VzIHN1cGVyY2xhc3MgZmlsdGVycyBiZWZvcmUgc3ViY2xhc3MgZmlsdGVycycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBzZXF1ZW5jZTogc3RyaW5nW10gPSBbXTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgYWJzdHJhY3QgY2xhc3MgUGFyZW50Q2xhc3MgZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHN0YXRpYyBiZWZvcmUgPSBbICdwYXJlbnRCZWZvcmUnIF07XG5cbiAgICBwYXJlbnRCZWZvcmUoKSB7IHNlcXVlbmNlLnB1c2goJ3BhcmVudCcpOyB9XG4gIH1cbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIENoaWxkQ2xhc3MgZXh0ZW5kcyBQYXJlbnRDbGFzcyB7XG4gICAgc3RhdGljIGJlZm9yZSA9IFsgJ2NoaWxkQmVmb3JlJyBdO1xuXG4gICAgY2hpbGRCZWZvcmUoKSB7IHNlcXVlbmNlLnB1c2goJ2NoaWxkJyk7IH1cbiAgICByZXNwb25kKCkgeyByZXR1cm4ge307IH1cbiAgfSk7XG5cbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xuICB0LmRlZXBFcXVhbChzZXF1ZW5jZSwgWyAncGFyZW50JywgJ2NoaWxkJyBdKTtcbn0pO1xuXG50ZXN0KCdlcnJvciBvdXQgd2hlbiBhbiBub24tZXhpc3RlbnQgZmlsdGVyIHdhcyBzcGVjaWZpZWQnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgc3RhdGljIGJlZm9yZSA9IFsgJ3NvbWUtbm9uLWV4aXN0ZW50LW1ldGhvZCcgXTtcbiAgICByZXNwb25kKCkge31cbiAgfSk7XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWZsb2F0aW5nLXByb21pc2VzXG4gIGF3YWl0IHQudGhyb3dzKHQuY29udGV4dC5ydW5BY3Rpb24oKSk7XG59KTtcblxudGVzdCgnYmVmb3JlIGZpbHRlcnMgdGhhdCByZW5kZXIgYmxvY2sgdGhlIHJlc3BvbmRlcicsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHN0YXRpYyBiZWZvcmUgPSBbICdwcmVlbXB0JyBdO1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICB0LmZhaWwoJ0ZpbHRlciBzaG91bGQgaGF2ZSBwcmVlbXB0ZWQgdGhpcyByZXNwb25kZXIgbWV0aG9kJyk7XG4gICAgfVxuICAgIHByZWVtcHQoKSB7XG4gICAgICAgdGhpcy5yZW5kZXIoMjAwLCB7IGhlbGxvOiAnd29ybGQnIH0pO1xuICAgIH1cbiAgfSk7XG4gIGxldCByZXNwb25zZSA9IGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbiAgdC5kZWVwRXF1YWwocmVzcG9uc2UsIHsgaGVsbG86ICd3b3JsZCcgfSk7XG59KTtcblxudGVzdCgnYmVmb3JlIGZpbHRlcnMgdGhhdCByZXR1cm4gYmxvY2sgdGhlIHJlc3BvbmRlcicsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHN0YXRpYyBiZWZvcmUgPSBbICdwcmVlbXB0JyBdO1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICB0LmZhaWwoJ0ZpbHRlciBzaG91bGQgaGF2ZSBwcmVlbXB0ZWQgdGhpcyByZXNwb25kZXIgbWV0aG9kJyk7XG4gICAgfVxuICAgIHByZWVtcHQoKSB7XG4gICAgICAgcmV0dXJuIHsgaGVsbG86ICd3b3JsZCcgfTtcbiAgICB9XG4gIH0pO1xuICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKCk7XG4gIHQuZGVlcEVxdWFsKHJlc3BvbnNlLCB7IGhlbGxvOiAnd29ybGQnIH0pO1xufSk7XG5cbnRlc3QoJ2FmdGVyIGZpbHRlcnMgcnVuIGFmdGVyIHJlc3BvbmRlciwgZXZlbiBpZiByZXNwb25kZXIgcmVuZGVycycsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHN0YXRpYyBhZnRlciA9IFsgJ2FmdGVyRmlsdGVyJyBdO1xuICAgIHJlc3BvbmQoKSB7IHJldHVybiB7fTsgfVxuICAgIGFmdGVyRmlsdGVyKCkgeyB0LnBhc3MoKTsgfVxuICB9KTtcbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xufSk7XG5cbnRlc3QoJ2FmdGVyIGZpbHRlcnMgcnVuIGV2ZW4gaWYgYSBiZWZvcmUgZmlsdGVyIHJlbmRlcnMnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAnYmVmb3JlRmlsdGVyJyBdO1xuICAgIHN0YXRpYyBhZnRlciA9IFsgJ2FmdGVyRmlsdGVyJyBdO1xuICAgIHJlc3BvbmQoKSB7IHQuZmFpbCgpOyB9XG4gICAgYmVmb3JlRmlsdGVyKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICB0aGlzLnJlbmRlcigyMDApO1xuICAgIH1cbiAgICBhZnRlckZpbHRlcigpIHsgdC5wYXNzKCk7IH1cbiAgfSk7XG4gIGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbn0pO1xuIl19