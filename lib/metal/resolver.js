"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const path = require("path");
const fs = require("fs");
const tryRequire = require("try-require");
const inflection_1 = require("inflection");
const require_dir_1 = require("../utils/require-dir");
const assert = require("assert");
class Resolver {
    constructor(root) {
        /**
         * The internal cache of available references
         */
        this.registry = new Map();
        assert(root, 'You must supply a valid root path that the resolve should use to load from');
        this.root = root;
    }
    /**
     * Manually add a member to this resolver. Manually registered members take precedence over any
     * retrieved from the filesystem.
     */
    register(specifier, value) {
        assert(specifier.includes(':'), 'Container specifiers must be in "type:entry" format');
        this.registry.set(specifier, value);
    }
    /**
     * Fetch the member matching the given parsedName. First checks for any manually registered
     * members, then falls back to type specific retrieve methods that typically find the matching
     * file on the filesystem.
     */
    retrieve(specifier) {
        assert(specifier.includes(':'), 'Container specifiers must be in "type:entry" format');
        let [type, entry] = specifier.split(':');
        if (this.registry.has(specifier)) {
            return this.registry.get(specifier);
        }
        let retrieveMethod = this[`retrieve${lodash_1.upperFirst(lodash_1.camelCase(type))}`];
        if (!retrieveMethod) {
            retrieveMethod = this.retrieveOther;
        }
        let result = retrieveMethod.call(this, type, entry);
        return result && result.default || result;
    }
    /**
     * Unknown types are assumed to exist underneath the `app/` folder
     */
    retrieveOther(type, entry) {
        return tryRequire(path.join(this.root, 'app', inflection_1.pluralize(type), entry));
    }
    /**
     * App files are found in `app/*`
     */
    retrieveApp(type, entry) {
        return tryRequire(path.join(this.root, 'app', entry));
    }
    /**
     * Config files are found in `config/`
     */
    retrieveConfig(type, entry) {
        return tryRequire(path.join(this.root, 'config', entry));
    }
    /**
     * Initializer files are found in `config/initializers/`
     */
    retrieveInitializer(type, entry) {
        return tryRequire(path.join(this.root, 'config', 'initializers', entry));
    }
    /**
     * Retrieve all the entries for a given type. First checks for all manual registrations matching
     * that type, then retrieves all members for that type (typically from the filesystem).
     */
    availableForType(type) {
        let registeredForType = [];
        this.registry.forEach((entry, specifier) => {
            if (specifier.split(':')[0] === type) {
                registeredForType.push(specifier);
            }
        });
        let availableMethod = this[`availableFor${lodash_1.upperFirst(lodash_1.camelCase(type))}`];
        if (!availableMethod) {
            availableMethod = this.availableForOther;
        }
        let entries = availableMethod.call(this, type);
        let resolvedEntries = entries.map((entry) => `${type}:${entry}`);
        return lodash_1.uniq(registeredForType.sort().concat(resolvedEntries.sort()));
    }
    /**
     * Unknown types are assumed to exist in the `app/` folder
     */
    availableForOther(type) {
        let typeDir = path.join(this.root, 'app', inflection_1.pluralize(type));
        if (fs.existsSync(typeDir)) {
            return Object.keys(require_dir_1.default(typeDir));
        }
        return [];
    }
    /**
     * App files are found in `app/*`
     */
    availableForApp(type, entry) {
        let appDir = path.join(this.root, 'app');
        if (fs.existsSync(appDir)) {
            return Object.keys(require_dir_1.default(appDir, { recurse: false }));
        }
        return [];
    }
    /**
     * Config files are found in the `config/` folder. Initializers are _not_ included in this group
     */
    availableForConfig(type) {
        let configDir = path.join(this.root, 'config');
        if (fs.existsSync(configDir)) {
            return Object.keys(require_dir_1.default(configDir)).filter((entry) => {
                return entry.startsWith('initializers');
            });
        }
        return [];
    }
    /**
     * Initializers files are found in the `config/initializers/` folder
     */
    availableForInitializer(type) {
        let initializersDir = path.join(this.root, 'config', 'initializers');
        if (fs.existsSync(initializersDir)) {
            return Object.keys(require_dir_1.default(initializersDir));
        }
        return [];
    }
}
exports.default = Resolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9tZXRhbC9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUlnQjtBQUNoQiw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLDBDQUEwQztBQUMxQywyQ0FBdUM7QUFDdkMsc0RBQThDO0FBQzlDLGlDQUFpQztBQVlqQztJQWNFLFlBQVksSUFBWTtRQUx4Qjs7V0FFRztRQUNLLGFBQVEsR0FBYSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBR3JDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsNEVBQTRFLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUSxDQUFDLFNBQWlCLEVBQUUsS0FBVTtRQUNwQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxxREFBcUQsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFFBQVEsQ0FBQyxTQUFpQjtRQUN4QixNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxxREFBcUQsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBRSxJQUFJLEVBQUUsS0FBSyxDQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxD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LENBQUMsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVEOztPQUVHO0lBQ08sdUJBQXVCLENBQUMsSUFBWTtRQUM1QyxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3JFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNaLENBQUM7Q0FFRjtBQTdJRCwyQkE2SUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBjYW1lbENhc2UsXG4gIHVwcGVyRmlyc3QsXG4gIHVuaXFcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB0cnlSZXF1aXJlIGZyb20gJ3RyeS1yZXF1aXJlJztcbmltcG9ydCB7IHBsdXJhbGl6ZSB9IGZyb20gJ2luZmxlY3Rpb24nO1xuaW1wb3J0IHJlcXVpcmVEaXIgZnJvbSAnLi4vdXRpbHMvcmVxdWlyZS1kaXInO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmludGVyZmFjZSBSZXRyaWV2ZU1ldGhvZCB7XG4gICh0eXBlOiBzdHJpbmcsIGVudHJ5OiBzdHJpbmcpOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXZhaWxhYmxlRm9yVHlwZU1ldGhvZCB7XG4gICh0eXBlOiBzdHJpbmcpOiB7IFttb2R1bGVQYXRoOiBzdHJpbmddOiBhbnkgfTtcbn1cblxuZXhwb3J0IHR5cGUgUmVnaXN0cnkgPSBNYXA8c3RyaW5nLCBhbnk+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNvbHZlciB7XG5cbiAgW2tleTogc3RyaW5nXTogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgcm9vdCBkaXJlY3RvcnkgZm9yIHRoaXMgcmVzb2x2ZXIgdG8gc3RhcnQgZnJvbSB3aGVuIHNlYXJjaGluZyBmb3IgZmlsZXNcbiAgICovXG4gIHJvb3Q6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGludGVybmFsIGNhY2hlIG9mIGF2YWlsYWJsZSByZWZlcmVuY2VzXG4gICAqL1xuICBwcml2YXRlIHJlZ2lzdHJ5OiBSZWdpc3RyeSA9IG5ldyBNYXAoKTtcblxuICBjb25zdHJ1Y3Rvcihyb290OiBzdHJpbmcpIHtcbiAgICBhc3NlcnQocm9vdCwgJ1lvdSBtdXN0IHN1cHBseSBhIHZhbGlkIHJvb3QgcGF0aCB0aGF0IHRoZSByZXNvbHZlIHNob3VsZCB1c2UgdG8gbG9hZCBmcm9tJyk7XG4gICAgdGhpcy5yb290ID0gcm9vdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYW51YWxseSBhZGQgYSBtZW1iZXIgdG8gdGhpcyByZXNvbHZlci4gTWFudWFsbHkgcmVnaXN0ZXJlZCBtZW1iZXJzIHRha2UgcHJlY2VkZW5jZSBvdmVyIGFueVxuICAgKiByZXRyaWV2ZWQgZnJvbSB0aGUgZmlsZXN5c3RlbS5cbiAgICovXG4gIHJlZ2lzdGVyKHNwZWNpZmllcjogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgYXNzZXJ0KHNwZWNpZmllci5pbmNsdWRlcygnOicpLCAnQ29udGFpbmVyIHNwZWNpZmllcnMgbXVzdCBiZSBpbiBcInR5cGU6ZW50cnlcIiBmb3JtYXQnKTtcbiAgICB0aGlzLnJlZ2lzdHJ5LnNldChzcGVjaWZpZXIsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCB0aGUgbWVtYmVyIG1hdGNoaW5nIHRoZSBnaXZlbiBwYXJzZWROYW1lLiBGaXJzdCBjaGVja3MgZm9yIGFueSBtYW51YWxseSByZWdpc3RlcmVkXG4gICAqIG1lbWJlcnMsIHRoZW4gZmFsbHMgYmFjayB0byB0eXBlIHNwZWNpZmljIHJldHJpZXZlIG1ldGhvZHMgdGhhdCB0eXBpY2FsbHkgZmluZCB0aGUgbWF0Y2hpbmdcbiAgICogZmlsZSBvbiB0aGUgZmlsZXN5c3RlbS5cbiAgICovXG4gIHJldHJpZXZlKHNwZWNpZmllcjogc3RyaW5nKSB7XG4gICAgYXNzZXJ0KHNwZWNpZmllci5pbmNsdWRlcygnOicpLCAnQ29udGFpbmVyIHNwZWNpZmllcnMgbXVzdCBiZSBpbiBcInR5cGU6ZW50cnlcIiBmb3JtYXQnKTtcbiAgICBsZXQgWyB0eXBlLCBlbnRyeSBdID0gc3BlY2lmaWVyLnNwbGl0KCc6Jyk7XG4gICAgaWYgKHRoaXMucmVnaXN0cnkuaGFzKHNwZWNpZmllcikpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdldChzcGVjaWZpZXIpO1xuICAgIH1cbiAgICBsZXQgcmV0cmlldmVNZXRob2QgPSA8UmV0cmlldmVNZXRob2Q+dGhpc1tgcmV0cmlldmUkeyB1cHBlckZpcnN0KGNhbWVsQ2FzZSh0eXBlKSkgfWBdO1xuICAgIGlmICghcmV0cmlldmVNZXRob2QpIHtcbiAgICAgIHJldHJpZXZlTWV0aG9kID0gdGhpcy5yZXRyaWV2ZU90aGVyO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0ID0gcmV0cmlldmVNZXRob2QuY2FsbCh0aGlzLCB0eXBlLCBlbnRyeSk7XG4gICAgcmV0dXJuIHJlc3VsdCAmJiByZXN1bHQuZGVmYXVsdCB8fCByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogVW5rbm93biB0eXBlcyBhcmUgYXNzdW1lZCB0byBleGlzdCB1bmRlcm5lYXRoIHRoZSBgYXBwL2AgZm9sZGVyXG4gICAqL1xuICBwcm90ZWN0ZWQgcmV0cmlldmVPdGhlcih0eXBlOiBzdHJpbmcsIGVudHJ5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdHJ5UmVxdWlyZShwYXRoLmpvaW4odGhpcy5yb290LCAnYXBwJywgcGx1cmFsaXplKHR5cGUpLCBlbnRyeSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcCBmaWxlcyBhcmUgZm91bmQgaW4gYGFwcC8qYFxuICAgKi9cbiAgcHJvdGVjdGVkIHJldHJpZXZlQXBwKHR5cGU6IHN0cmluZywgZW50cnk6IHN0cmluZykge1xuICAgIHJldHVybiB0cnlSZXF1aXJlKHBhdGguam9pbih0aGlzLnJvb3QsICdhcHAnLCBlbnRyeSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZyBmaWxlcyBhcmUgZm91bmQgaW4gYGNvbmZpZy9gXG4gICAqL1xuICBwcm90ZWN0ZWQgcmV0cmlldmVDb25maWcodHlwZTogc3RyaW5nLCBlbnRyeTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRyeVJlcXVpcmUocGF0aC5qb2luKHRoaXMucm9vdCwgJ2NvbmZpZycsIGVudHJ5KSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXIgZmlsZXMgYXJlIGZvdW5kIGluIGBjb25maWcvaW5pdGlhbGl6ZXJzL2BcbiAgICovXG4gIHByb3RlY3RlZCByZXRyaWV2ZUluaXRpYWxpemVyKHR5cGU6IHN0cmluZywgZW50cnk6IHN0cmluZykge1xuICAgIHJldHVybiB0cnlSZXF1aXJlKHBhdGguam9pbih0aGlzLnJvb3QsICdjb25maWcnLCAnaW5pdGlhbGl6ZXJzJywgZW50cnkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhbGwgdGhlIGVudHJpZXMgZm9yIGEgZ2l2ZW4gdHlwZS4gRmlyc3QgY2hlY2tzIGZvciBhbGwgbWFudWFsIHJlZ2lzdHJhdGlvbnMgbWF0Y2hpbmdcbiAgICogdGhhdCB0eXBlLCB0aGVuIHJldHJpZXZlcyBhbGwgbWVtYmVycyBmb3IgdGhhdCB0eXBlICh0eXBpY2FsbHkgZnJvbSB0aGUgZmlsZXN5c3RlbSkuXG4gICAqL1xuICBhdmFpbGFibGVGb3JUeXBlKHR5cGU6IHN0cmluZykge1xuICAgIGxldCByZWdpc3RlcmVkRm9yVHlwZTogc3RyaW5nW10gPSBbXTtcbiAgICB0aGlzLnJlZ2lzdHJ5LmZvckVhY2goKGVudHJ5LCBzcGVjaWZpZXIpID0+IHtcbiAgICAgIGlmIChzcGVjaWZpZXIuc3BsaXQoJzonKVswXSA9PT0gdHlwZSkge1xuICAgICAgICByZWdpc3RlcmVkRm9yVHlwZS5wdXNoKHNwZWNpZmllcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbGV0IGF2YWlsYWJsZU1ldGhvZCA9IDxBdmFpbGFibGVGb3JUeXBlTWV0aG9kPnRoaXNbYGF2YWlsYWJsZUZvciR7IHVwcGVyRmlyc3QoY2FtZWxDYXNlKHR5cGUpKSB9YF07XG4gICAgaWYgKCFhdmFpbGFibGVNZXRob2QpIHtcbiAgICAgIGF2YWlsYWJsZU1ldGhvZCA9IHRoaXMuYXZhaWxhYmxlRm9yT3RoZXI7XG4gICAgfVxuICAgIGxldCBlbnRyaWVzID0gPHN0cmluZ1tdPmF2YWlsYWJsZU1ldGhvZC5jYWxsKHRoaXMsIHR5cGUpO1xuICAgIGxldCByZXNvbHZlZEVudHJpZXMgPSBlbnRyaWVzLm1hcCgoZW50cnkpID0+IGAkeyB0eXBlIH06JHsgZW50cnkgfWApO1xuICAgIHJldHVybiB1bmlxKHJlZ2lzdGVyZWRGb3JUeXBlLnNvcnQoKS5jb25jYXQocmVzb2x2ZWRFbnRyaWVzLnNvcnQoKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVua25vd24gdHlwZXMgYXJlIGFzc3VtZWQgdG8gZXhpc3QgaW4gdGhlIGBhcHAvYCBmb2xkZXJcbiAgICovXG4gIHByb3RlY3RlZCBhdmFpbGFibGVGb3JPdGhlcih0eXBlOiBzdHJpbmcpIHtcbiAgICBsZXQgdHlwZURpciA9IHBhdGguam9pbih0aGlzLnJvb3QsICdhcHAnLCBwbHVyYWxpemUodHlwZSkpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHR5cGVEaXIpKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMocmVxdWlyZURpcih0eXBlRGlyKSk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHAgZmlsZXMgYXJlIGZvdW5kIGluIGBhcHAvKmBcbiAgICovXG4gIHByb3RlY3RlZCBhdmFpbGFibGVGb3JBcHAodHlwZTogc3RyaW5nLCBlbnRyeTogc3RyaW5nKSB7XG4gICAgbGV0IGFwcERpciA9IHBhdGguam9pbih0aGlzLnJvb3QsICdhcHAnKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhhcHBEaXIpKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMocmVxdWlyZURpcihhcHBEaXIsIHsgcmVjdXJzZTogZmFsc2UgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlnIGZpbGVzIGFyZSBmb3VuZCBpbiB0aGUgYGNvbmZpZy9gIGZvbGRlci4gSW5pdGlhbGl6ZXJzIGFyZSBfbm90XyBpbmNsdWRlZCBpbiB0aGlzIGdyb3VwXG4gICAqL1xuICBwcm90ZWN0ZWQgYXZhaWxhYmxlRm9yQ29uZmlnKHR5cGU6IHN0cmluZykge1xuICAgIGxldCBjb25maWdEaXIgPSBwYXRoLmpvaW4odGhpcy5yb290LCAnY29uZmlnJyk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoY29uZmlnRGlyKSkge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlcXVpcmVEaXIoY29uZmlnRGlyKSkuZmlsdGVyKChlbnRyeSkgPT4ge1xuICAgICAgICByZXR1cm4gZW50cnkuc3RhcnRzV2l0aCgnaW5pdGlhbGl6ZXJzJyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVycyBmaWxlcyBhcmUgZm91bmQgaW4gdGhlIGBjb25maWcvaW5pdGlhbGl6ZXJzL2AgZm9sZGVyXG4gICAqL1xuICBwcm90ZWN0ZWQgYXZhaWxhYmxlRm9ySW5pdGlhbGl6ZXIodHlwZTogc3RyaW5nKSB7XG4gICAgbGV0IGluaXRpYWxpemVyc0RpciA9IHBhdGguam9pbih0aGlzLnJvb3QsICdjb25maWcnLCAnaW5pdGlhbGl6ZXJzJyk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoaW5pdGlhbGl6ZXJzRGlyKSkge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlcXVpcmVEaXIoaW5pdGlhbGl6ZXJzRGlyKSk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG59XG4iXX0=