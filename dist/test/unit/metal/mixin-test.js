"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
ava_1.default('mixins apply in order', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class Base {
    }
    let MixinOne = denali_1.createMixin((BaseClass) => { return _a = class MixinOne extends BaseClass {
        },
        _a.foo = 'one',
        _a; var _a; });
    let MixinTwo = denali_1.createMixin((BaseClass) => { return _a = class MixinOne extends BaseClass {
        },
        _a.foo = 'two',
        _a; var _a; });
    let Result = denali_1.mixin(Base, MixinOne, MixinTwo);
    t.is(Result.foo, 'two');
}));
ava_1.default('mixins accumulate options until applied', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    class Base {
    }
    let Mixin = denali_1.createMixin((BaseClass, optionsOne, optionsTwo) => {
        t.is(optionsOne, 'one');
        t.is(optionsTwo, 'two');
        return class MixinOne extends BaseClass {
        };
    });
    Mixin('one');
    Mixin('two');
    denali_1.mixin(Base, Mixin);
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl4aW4tdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC91bml0L21ldGFsL21peGluLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2QixtQ0FBNEM7QUFFNUMsYUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQU8sQ0FBQztJQUNwQztLQUFhO0lBQ2IsSUFBSSxRQUFRLEdBQUcsb0JBQVcsQ0FBQyxDQUFDLFNBQXVCLG1CQUNqRCxjQUFlLFNBQVEsU0FBUztTQUUvQjtRQURRLE1BQUcsR0FBRyxLQUFNO3FCQUNwQixDQUNGLENBQUM7SUFDRixJQUFJLFFBQVEsR0FBRyxvQkFBVyxDQUFDLENBQUMsU0FBdUIsbUJBQ2pELGNBQWUsU0FBUSxTQUFTO1NBRS9CO1FBRFEsTUFBRyxHQUFHLEtBQU07cUJBQ3BCLENBQ0YsQ0FBQztJQUVGLElBQUksTUFBTSxHQUFHLGNBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLHlDQUF5QyxFQUFFLENBQU8sQ0FBQztJQUN0RCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1Y7S0FBYTtJQUNiLElBQUksS0FBSyxHQUFHLG9CQUFXLENBQUMsQ0FBQyxTQUF1QixFQUFFLFVBQVUsRUFBRSxVQUFVO1FBQ3RFLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxjQUFlLFNBQVEsU0FBUztTQUFHLENBQUM7SUFDN0MsQ0FBQyxDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDYixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDYixjQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3JCLENBQUMsQ0FBQSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyBuby1lbXB0eSBuby1pbnZhbGlkLXRoaXMgbWVtYmVyLWFjY2VzcyAqL1xuaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCB7IG1peGluLCBjcmVhdGVNaXhpbiB9IGZyb20gJ2RlbmFsaSc7XG5cbnRlc3QoJ21peGlucyBhcHBseSBpbiBvcmRlcicsIGFzeW5jICh0KSA9PiB7XG4gIGNsYXNzIEJhc2Uge31cbiAgbGV0IE1peGluT25lID0gY3JlYXRlTWl4aW4oKEJhc2VDbGFzczogbmV3KCkgPT4gYW55KSA9PlxuICAgIGNsYXNzIE1peGluT25lIGV4dGVuZHMgQmFzZUNsYXNzIHtcbiAgICAgIHN0YXRpYyBmb28gPSAnb25lJztcbiAgICB9XG4gICk7XG4gIGxldCBNaXhpblR3byA9IGNyZWF0ZU1peGluKChCYXNlQ2xhc3M6IG5ldygpID0+IGFueSkgPT5cbiAgICBjbGFzcyBNaXhpbk9uZSBleHRlbmRzIEJhc2VDbGFzcyB7XG4gICAgICBzdGF0aWMgZm9vID0gJ3R3byc7XG4gICAgfVxuICApO1xuXG4gIGxldCBSZXN1bHQgPSBtaXhpbihCYXNlLCBNaXhpbk9uZSwgTWl4aW5Ud28pO1xuICB0LmlzKFJlc3VsdC5mb28sICd0d28nKTtcbn0pO1xuXG50ZXN0KCdtaXhpbnMgYWNjdW11bGF0ZSBvcHRpb25zIHVudGlsIGFwcGxpZWQnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGNsYXNzIEJhc2Uge31cbiAgbGV0IE1peGluID0gY3JlYXRlTWl4aW4oKEJhc2VDbGFzczogbmV3KCkgPT4gYW55LCBvcHRpb25zT25lLCBvcHRpb25zVHdvKSA9PiB7XG4gICAgdC5pcyhvcHRpb25zT25lLCAnb25lJyk7XG4gICAgdC5pcyhvcHRpb25zVHdvLCAndHdvJyk7XG4gICAgcmV0dXJuIGNsYXNzIE1peGluT25lIGV4dGVuZHMgQmFzZUNsYXNzIHt9O1xuICB9KTtcblxuICBNaXhpbignb25lJyk7XG4gIE1peGluKCd0d28nKTtcbiAgbWl4aW4oQmFzZSwgTWl4aW4pO1xufSk7XG4iXX0=