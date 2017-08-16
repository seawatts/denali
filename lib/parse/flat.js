"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class FlatParser extends parser_1.default {
    parse(request) {
        return {
            body: request.body,
            query: request.query,
            headers: request.headers,
            params: request.params
        };
    }
}
exports.default = FlatParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3BhcnNlL2ZsYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBOEI7QUFJOUIsZ0JBQWdDLFNBQVEsZ0JBQU07SUFFNUMsS0FBSyxDQUFDLE9BQWdCO1FBQ3BCLE1BQU0sQ0FBQztZQUNMLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDcEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtTQUN2QixDQUFDO0lBQ0osQ0FBQztDQUVGO0FBWEQsNkJBV0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUGFyc2VyIGZyb20gJy4vcGFyc2VyJztcbmltcG9ydCBSZXF1ZXN0IGZyb20gJy4uL3J1bnRpbWUvcmVxdWVzdCc7XG5pbXBvcnQgeyBSZXNwb25kZXJQYXJhbXMgfSBmcm9tICcuLi9ydW50aW1lL2FjdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZsYXRQYXJzZXIgZXh0ZW5kcyBQYXJzZXIge1xuXG4gIHBhcnNlKHJlcXVlc3Q6IFJlcXVlc3QpOiBSZXNwb25kZXJQYXJhbXMge1xuICAgIHJldHVybiB7XG4gICAgICBib2R5OiByZXF1ZXN0LmJvZHksXG4gICAgICBxdWVyeTogcmVxdWVzdC5xdWVyeSxcbiAgICAgIGhlYWRlcnM6IHJlcXVlc3QuaGVhZGVycyxcbiAgICAgIHBhcmFtczogcmVxdWVzdC5wYXJhbXNcbiAgICB9O1xuICB9XG5cbn0iXX0=