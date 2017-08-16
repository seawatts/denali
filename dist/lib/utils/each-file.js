"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
/**
 * Invoke the supplied callback for each file (not directories) in the supplied directory.
 *
 * @package util
 */
function eachFile(dirpath, fn) {
    fs.readdirSync(dirpath).forEach((childpath) => {
        let absolutepath = path.join(dirpath, childpath);
        if (fs.statSync(absolutepath).isFile()) {
            fn(childpath);
        }
    });
}
exports.default = eachFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWFjaC1maWxlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvdXRpbHMvZWFjaC1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUU3Qjs7OztHQUlHO0FBQ0gsa0JBQWlDLE9BQWUsRUFBRSxFQUErQjtJQUMvRSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVM7UUFDeEMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakQsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hCLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFQRCwyQkFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8qKlxuICogSW52b2tlIHRoZSBzdXBwbGllZCBjYWxsYmFjayBmb3IgZWFjaCBmaWxlIChub3QgZGlyZWN0b3JpZXMpIGluIHRoZSBzdXBwbGllZCBkaXJlY3RvcnkuXG4gKlxuICogQHBhY2thZ2UgdXRpbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBlYWNoRmlsZShkaXJwYXRoOiBzdHJpbmcsIGZuOiAoY2hpbGRwYXRoOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkIHtcbiAgZnMucmVhZGRpclN5bmMoZGlycGF0aCkuZm9yRWFjaCgoY2hpbGRwYXRoKSA9PiB7XG4gICAgbGV0IGFic29sdXRlcGF0aCA9IHBhdGguam9pbihkaXJwYXRoLCBjaGlsZHBhdGgpO1xuICAgIGlmIChmcy5zdGF0U3luYyhhYnNvbHV0ZXBhdGgpLmlzRmlsZSgpKSB7XG4gICAgICBmbihjaGlsZHBhdGgpO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=