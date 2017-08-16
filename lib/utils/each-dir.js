"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
/**
 * Invoke the supplied callback for each directory in the supplied directory.
 *
 * @package util
 */
function eachDir(dirpath, fn) {
    fs.readdirSync(dirpath).forEach((childpath) => {
        let absolutepath = path.join(dirpath, childpath);
        if (fs.statSync(absolutepath).isDirectory()) {
            fn(childpath);
        }
    });
}
exports.default = eachDir;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWFjaC1kaXIuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi91dGlscy9lYWNoLWRpci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFFN0I7Ozs7R0FJRztBQUNILGlCQUFnQyxPQUFlLEVBQUUsRUFBK0I7SUFDOUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTO1FBQ3hDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBUEQsMEJBT0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIEludm9rZSB0aGUgc3VwcGxpZWQgY2FsbGJhY2sgZm9yIGVhY2ggZGlyZWN0b3J5IGluIHRoZSBzdXBwbGllZCBkaXJlY3RvcnkuXG4gKlxuICogQHBhY2thZ2UgdXRpbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBlYWNoRGlyKGRpcnBhdGg6IHN0cmluZywgZm46IChjaGlsZHBhdGg6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xuICBmcy5yZWFkZGlyU3luYyhkaXJwYXRoKS5mb3JFYWNoKChjaGlsZHBhdGgpID0+IHtcbiAgICBsZXQgYWJzb2x1dGVwYXRoID0gcGF0aC5qb2luKGRpcnBhdGgsIGNoaWxkcGF0aCk7XG4gICAgaWYgKGZzLnN0YXRTeW5jKGFic29sdXRlcGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgZm4oY2hpbGRwYXRoKTtcbiAgICB9XG4gIH0pO1xufVxuIl19