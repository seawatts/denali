"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("../../lib/runtime/action");
class IndexAction extends action_1.default {
    respond() {
        return this.render(200, { hello: 'world' }, { serializer: 'raw' });
    }
}
exports.default = IndexAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImFwcC9hY3Rpb25zL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQThDO0FBRTlDLGlCQUFpQyxTQUFRLGdCQUFNO0lBRTdDLE9BQU87UUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNyRSxDQUFDO0NBRUY7QUFORCw4QkFNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBY3Rpb24gZnJvbSAnLi4vLi4vbGliL3J1bnRpbWUvYWN0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5kZXhBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuXG4gIHJlc3BvbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyKDIwMCwgeyBoZWxsbzogJ3dvcmxkJyB9LCB7IHNlcmlhbGl6ZXI6ICdyYXcnIH0pO1xuICB9XG5cbn1cbiJdfQ==