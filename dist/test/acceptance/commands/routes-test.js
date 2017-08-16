"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ava_1 = require("ava");
const dedent = require("dedent-js");
const denali_cli_1 = require("denali-cli");
ava_1.default('prints list of configured routes', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let generate = new denali_cli_1.CommandAcceptanceTest('routes', { name: 'routes-command' });
    let result = yield generate.run({ failOnStderr: true });
    t.true(result.stdout.trim().endsWith(dedent `
┌───────┬────────┐
│ URL   │ ACTION │
├───────┼────────┤
│ GET / │ index  │
└───────┴────────┘
  `.trim()));
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbInRlc3QvYWNjZXB0YW5jZS9jb21tYW5kcy9yb3V0ZXMtdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBdUI7QUFDdkIsb0NBQW9DO0FBQ3BDLDJDQUFtRDtBQUVuRCxhQUFJLENBQUMsa0NBQWtDLEVBQUUsQ0FBTyxDQUFDO0lBQy9DLElBQUksUUFBUSxHQUFHLElBQUksa0NBQXFCLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUUvRSxJQUFJLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQTs7Ozs7O0dBTTFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgKiBhcyBkZWRlbnQgZnJvbSAnZGVkZW50LWpzJztcbmltcG9ydCB7IENvbW1hbmRBY2NlcHRhbmNlVGVzdCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuXG50ZXN0KCdwcmludHMgbGlzdCBvZiBjb25maWd1cmVkIHJvdXRlcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBnZW5lcmF0ZSA9IG5ldyBDb21tYW5kQWNjZXB0YW5jZVRlc3QoJ3JvdXRlcycsIHsgbmFtZTogJ3JvdXRlcy1jb21tYW5kJyB9KTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgZ2VuZXJhdGUucnVuKHsgZmFpbE9uU3RkZXJyOiB0cnVlIH0pO1xuICB0LnRydWUocmVzdWx0LnN0ZG91dC50cmltKCkuZW5kc1dpdGgoZGVkZW50YFxu4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG7ilIIgVVJMICAg4pSCIEFDVElPTiDilIJcbuKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpFxu4pSCIEdFVCAvIOKUgiBpbmRleCAg4pSCXG7ilJTilIDilIDilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilIDilJhcbiAgYC50cmltKCkpKTtcbn0pO1xuIl19