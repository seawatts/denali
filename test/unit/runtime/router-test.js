"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const path = require("path");
const denali_1 = require("denali");
const dummyAppPath = path.join(__dirname, '..', 'dummy');
ava_1.default.todo('map creates routes');
ava_1.default.todo('handle finds matching route & hands off to action');
ava_1.default.todo('fails fast if action does not exist');
ava_1.default.todo('method shortcuts define routes');
ava_1.default.todo('resource() creates CRUD routes');
ava_1.default.todo('resource(name, { related: false }) creates CRUD routes except relationship ones');
ava_1.default.todo('resource(name, { except: [...] }) creates CRUD routes except listed ones');
ava_1.default.todo('resource(name, { only: [...] }) creates only listed CRUD routes');
ava_1.default.todo('namespace(name, ...) returns a wrapper to create routes under the namespace');
ava_1.default('runs middleware before determining routing', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let count = 0;
    let container = new denali_1.Container(dummyAppPath);
    container.register('app:router', denali_1.Router);
    container.register('app:logger', denali_1.Logger);
    container.register('parser:application', denali_1.FlatParser);
    container.register('config:environment', { environment: 'development' });
    container.register('service:db', {}, { instantiate: false });
    container.register('action:error', class TestAction extends denali_1.Action {
        respond() {
            count += 1;
            t.is(count, 2);
        }
    });
    let router = container.lookup('app:router');
    router.use((req, res, next) => {
        count += 1;
        t.is(count, 1);
        next();
    });
    yield router.handle((new denali_1.MockRequest()), new denali_1.MockResponse());
}));
ava_1.default('#urlFor works with string argument', (t) => {
    let container = new denali_1.Container(dummyAppPath);
    container.register('app:router', denali_1.Router);
    container.register('action:index', class TestAction extends denali_1.Action {
        constructor() {
            super(...arguments);
            this.serializer = false;
        }
        respond() {
            // noop
        }
    });
    let router = container.lookup('app:router');
    router.get('/test/:id/', 'index');
    t.is(router.urlFor('index', { id: 10 }), '/test/10/', 'Router should return the correctly reversed url');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbInRlc3QvdW5pdC9ydW50aW1lL3JvdXRlci10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCLG1DQU95QjtBQUV6QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFekQsYUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ2hDLGFBQUksQ0FBQyxJQUFJLENBQUMsbURBQW1ELENBQUMsQ0FBQztBQUMvRCxhQUFJLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7QUFDakQsYUFBSSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQzVDLGFBQUksQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUM1QyxhQUFJLENBQUMsSUFBSSxDQUFDLGlGQUFpRixDQUFDLENBQUM7QUFDN0YsYUFBSSxDQUFDLElBQUksQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO0FBQ3RGLGFBQUksQ0FBQyxJQUFJLENBQUMsaUVBQWlFLENBQUMsQ0FBQztBQUM3RSxhQUFJLENBQUMsSUFBSSxDQUFDLDZFQUE2RSxDQUFDLENBQUM7QUFFekYsYUFBSSxDQUFDLDRDQUE0QyxFQUFFLENBQU8sQ0FBQztJQUN6RCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLGVBQU0sQ0FBQyxDQUFDO0lBQ3pDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLGVBQU0sQ0FBQyxDQUFDO0lBQ3pDLFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsbUJBQVUsQ0FBQyxDQUFDO0lBQ3JELFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztJQUN6RSxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUM3RCxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxnQkFBaUIsU0FBUSxlQUFNO1FBQ2hFLE9BQU87WUFDTCxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQ1gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsQ0FBQztLQUNGLENBQUMsQ0FBQztJQUNILElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQVMsWUFBWSxDQUFDLENBQUM7SUFDcEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSTtRQUN4QixLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDZixJQUFJLEVBQUUsQ0FBQztJQUNULENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFNLENBQUMsSUFBSSxvQkFBVyxFQUFFLENBQUMsRUFBUSxJQUFJLHFCQUFZLEVBQUcsQ0FBQyxDQUFDO0FBQzNFLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsb0NBQW9DLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLElBQUksU0FBUyxHQUFHLElBQUksa0JBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUU1QyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxlQUFNLENBQUMsQ0FBQztJQUN6QyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxnQkFBaUIsU0FBUSxlQUFNO1FBQS9COztZQUNqQyxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSXJCLENBQUM7UUFIQyxPQUFPO1lBQ0wsT0FBTztRQUNULENBQUM7S0FDRixDQUFDLENBQUM7SUFFSCxJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWxDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsaURBQWlELENBQUMsQ0FBQztBQUN6RyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7XG4gIFJvdXRlcixcbiAgTW9ja1JlcXVlc3QsXG4gIE1vY2tSZXNwb25zZSxcbiAgQ29udGFpbmVyLFxuICBBY3Rpb24sXG4gIEZsYXRQYXJzZXIsXG4gIExvZ2dlciB9IGZyb20gJ2RlbmFsaSc7XG5cbmNvbnN0IGR1bW15QXBwUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdkdW1teScpO1xuXG50ZXN0LnRvZG8oJ21hcCBjcmVhdGVzIHJvdXRlcycpO1xudGVzdC50b2RvKCdoYW5kbGUgZmluZHMgbWF0Y2hpbmcgcm91dGUgJiBoYW5kcyBvZmYgdG8gYWN0aW9uJyk7XG50ZXN0LnRvZG8oJ2ZhaWxzIGZhc3QgaWYgYWN0aW9uIGRvZXMgbm90IGV4aXN0Jyk7XG50ZXN0LnRvZG8oJ21ldGhvZCBzaG9ydGN1dHMgZGVmaW5lIHJvdXRlcycpO1xudGVzdC50b2RvKCdyZXNvdXJjZSgpIGNyZWF0ZXMgQ1JVRCByb3V0ZXMnKTtcbnRlc3QudG9kbygncmVzb3VyY2UobmFtZSwgeyByZWxhdGVkOiBmYWxzZSB9KSBjcmVhdGVzIENSVUQgcm91dGVzIGV4Y2VwdCByZWxhdGlvbnNoaXAgb25lcycpO1xudGVzdC50b2RvKCdyZXNvdXJjZShuYW1lLCB7IGV4Y2VwdDogWy4uLl0gfSkgY3JlYXRlcyBDUlVEIHJvdXRlcyBleGNlcHQgbGlzdGVkIG9uZXMnKTtcbnRlc3QudG9kbygncmVzb3VyY2UobmFtZSwgeyBvbmx5OiBbLi4uXSB9KSBjcmVhdGVzIG9ubHkgbGlzdGVkIENSVUQgcm91dGVzJyk7XG50ZXN0LnRvZG8oJ25hbWVzcGFjZShuYW1lLCAuLi4pIHJldHVybnMgYSB3cmFwcGVyIHRvIGNyZWF0ZSByb3V0ZXMgdW5kZXIgdGhlIG5hbWVzcGFjZScpO1xuXG50ZXN0KCdydW5zIG1pZGRsZXdhcmUgYmVmb3JlIGRldGVybWluaW5nIHJvdXRpbmcnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGxldCBjb3VudCA9IDA7XG4gIGxldCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKGR1bW15QXBwUGF0aCk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYXBwOnJvdXRlcicsIFJvdXRlcik7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYXBwOmxvZ2dlcicsIExvZ2dlcik7XG4gIGNvbnRhaW5lci5yZWdpc3RlcigncGFyc2VyOmFwcGxpY2F0aW9uJywgRmxhdFBhcnNlcik7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignY29uZmlnOmVudmlyb25tZW50JywgeyBlbnZpcm9ubWVudDogJ2RldmVsb3BtZW50JyB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJ2aWNlOmRiJywge30sIHsgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjplcnJvcicsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICBjb3VudCArPSAxO1xuICAgICAgdC5pcyhjb3VudCwgMik7XG4gICAgfVxuICB9KTtcbiAgbGV0IHJvdXRlciA9IGNvbnRhaW5lci5sb29rdXA8Um91dGVyPignYXBwOnJvdXRlcicpO1xuICByb3V0ZXIudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgIGNvdW50ICs9IDE7XG4gICAgdC5pcyhjb3VudCwgMSk7XG4gICAgbmV4dCgpO1xuICB9KTtcbiAgYXdhaXQgcm91dGVyLmhhbmRsZSg8YW55PihuZXcgTW9ja1JlcXVlc3QoKSksICg8YW55Pm5ldyBNb2NrUmVzcG9uc2UoKSkpO1xufSk7XG5cbnRlc3QoJyN1cmxGb3Igd29ya3Mgd2l0aCBzdHJpbmcgYXJndW1lbnQnLCAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcihkdW1teUFwcFBhdGgpO1xuXG4gIGNvbnRhaW5lci5yZWdpc3RlcignYXBwOnJvdXRlcicsIFJvdXRlcik7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOmluZGV4JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgc2VyaWFsaXplciA9IGZhbHNlO1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICAvLyBub29wXG4gICAgfVxuICB9KTtcblxuICBsZXQgcm91dGVyID0gY29udGFpbmVyLmxvb2t1cCgnYXBwOnJvdXRlcicpO1xuICByb3V0ZXIuZ2V0KCcvdGVzdC86aWQvJywgJ2luZGV4Jyk7XG5cbiAgdC5pcyhyb3V0ZXIudXJsRm9yKCdpbmRleCcsIHtpZDogMTB9KSwgJy90ZXN0LzEwLycsICdSb3V0ZXIgc2hvdWxkIHJldHVybiB0aGUgY29ycmVjdGx5IHJldmVyc2VkIHVybCcpO1xufSk7XG4iXX0=