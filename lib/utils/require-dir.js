"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const walk = require("walk-sync");
/**
 * Recursively require every .js file in a directory. Returns an object whose keys are the filepaths
 * of the loaded modules (relative to the given directory). Handles modules with default exports
 * (the default export will be the returned module value).
 *
 * @package util
 */
function requireDir(dirpath, options = {}) {
    let modules = {};
    let paths;
    if (options.recurse === false) {
        paths = fs.readdirSync(dirpath);
    }
    else {
        paths = walk(dirpath);
    }
    paths.forEach((filepath) => {
        let absolutepath = path.join(dirpath, filepath);
        if (fs.statSync(absolutepath).isFile() && /\.js$/.test(filepath)) {
            let moduleName = filepath.slice(0, filepath.length - 3);
            let mod = require(absolutepath);
            modules[moduleName] = mod.default || mod;
        }
    });
    return modules;
}
exports.default = requireDir;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWlyZS1kaXIuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi91dGlscy9yZXF1aXJlLWRpci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0Isa0NBQWtDO0FBRWxDOzs7Ozs7R0FNRztBQUNILG9CQUFtQyxPQUFlLEVBQUUsVUFBK0IsRUFBRTtJQUNuRixJQUFJLE9BQU8sR0FBa0MsRUFBRSxDQUFDO0lBQ2hELElBQUksS0FBSyxDQUFDO0lBQ1YsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzlCLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLEtBQUssR0FBYSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRO1FBQ3JCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakUsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4RCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQzNDLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQWpCRCw2QkFpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgd2FsayBmcm9tICd3YWxrLXN5bmMnO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IHJlcXVpcmUgZXZlcnkgLmpzIGZpbGUgaW4gYSBkaXJlY3RvcnkuIFJldHVybnMgYW4gb2JqZWN0IHdob3NlIGtleXMgYXJlIHRoZSBmaWxlcGF0aHNcbiAqIG9mIHRoZSBsb2FkZWQgbW9kdWxlcyAocmVsYXRpdmUgdG8gdGhlIGdpdmVuIGRpcmVjdG9yeSkuIEhhbmRsZXMgbW9kdWxlcyB3aXRoIGRlZmF1bHQgZXhwb3J0c1xuICogKHRoZSBkZWZhdWx0IGV4cG9ydCB3aWxsIGJlIHRoZSByZXR1cm5lZCBtb2R1bGUgdmFsdWUpLlxuICpcbiAqIEBwYWNrYWdlIHV0aWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVxdWlyZURpcihkaXJwYXRoOiBzdHJpbmcsIG9wdGlvbnM6IHsgcmVjdXJzZT86IGZhbHNlIH0gPSB7fSk6IHsgW21vZHVsZU5hbWU6IHN0cmluZ106IGFueSB9IHtcbiAgbGV0IG1vZHVsZXM6IHsgW21vZHVsZU5hbWU6IHN0cmluZ106IGFueSB9ID0ge307XG4gIGxldCBwYXRocztcbiAgaWYgKG9wdGlvbnMucmVjdXJzZSA9PT0gZmFsc2UpIHtcbiAgICBwYXRocyA9IGZzLnJlYWRkaXJTeW5jKGRpcnBhdGgpO1xuICB9IGVsc2Uge1xuICAgIHBhdGhzID0gPHN0cmluZ1tdPndhbGsoZGlycGF0aCk7XG4gIH1cbiAgcGF0aHMuZm9yRWFjaCgoZmlsZXBhdGgpID0+IHtcbiAgICBsZXQgYWJzb2x1dGVwYXRoID0gcGF0aC5qb2luKGRpcnBhdGgsIGZpbGVwYXRoKTtcbiAgICBpZiAoZnMuc3RhdFN5bmMoYWJzb2x1dGVwYXRoKS5pc0ZpbGUoKSAmJiAvXFwuanMkLy50ZXN0KGZpbGVwYXRoKSkge1xuICAgICAgbGV0IG1vZHVsZU5hbWUgPSBmaWxlcGF0aC5zbGljZSgwLCBmaWxlcGF0aC5sZW5ndGggLSAzKTtcbiAgICAgIGxldCBtb2QgPSByZXF1aXJlKGFic29sdXRlcGF0aCk7XG4gICAgICBtb2R1bGVzW21vZHVsZU5hbWVdID0gbW9kLmRlZmF1bHQgfHwgbW9kO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBtb2R1bGVzO1xufVxuIl19