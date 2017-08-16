"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const findup = require("findup-sync");
const tryRequire = require("try-require");
const object_1 = require("../metal/object");
const resolver_1 = require("../metal/resolver");
/**
 * Addons are the fundamental unit of organization for Denali apps. The Application class is just a
 * specialized Addon, and each Addon can contain any amount of functionality.
 *
 * ## Structure
 *
 * Addons are packaged as npm modules for easy sharing. When Denali boots up, it searches your
 * node_modules for available Denali Addons (identified by the `denali-addon` keyword in the
 * package.json). Addons can be nested (i.e. an addon can itself depend on another addon).
 *
 * Each addon can be composed of one or several of the following parts:
 *
 *   * Config
 *   * Initializers
 *   * Middleware
 *   * App classes
 *   * Routes
 *
 * ## Load order
 *
 * After Denali discovers the available addons, it then merges them to form a unified application.
 * Addons higher in the dependency tree take precedence, and sibling addons can specify load order
 * via their package.json files:
 *
 *     "denali": {
 *       "before": [ "another-addon-name" ],
 *       "after": [ "cool-addon-name" ]
 *     }
 *
 * @package runtime
 * @since 0.1.0
 */
class Addon extends object_1.default {
    constructor(options) {
        super();
        this.container = options.container;
        this.environment = options.environment;
        this.dir = options.dir;
        this.pkg = options.pkg || tryRequire(findup('package.json', { cwd: this.dir }));
        this.resolver = this.resolver || new resolver_1.default(this.dir);
        this.container.addResolver(this.resolver);
        this.container.register(`addon:${this.pkg.name}@${this.pkg.version}`, this);
    }
    /**
     * The name of the addon. Override this to use a different name than the package name for your
     * addon.
     *
     * @since 0.1.0
     */
    get name() {
        return (this.pkg && this.pkg.name) || 'anonymous-addon';
    }
    /**
     * A hook to perform any shutdown actions necessary to gracefully exit the application, i.e. close
     * database/socket connections.
     *
     * @since 0.1.0
     */
    shutdown(application) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // defaults to noop
        });
    }
}
exports.default = Addon;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkb24uanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9ydW50aW1lL2FkZG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNDQUF1QztBQUN2QywwQ0FBMEM7QUFDMUMsNENBQTJDO0FBRzNDLGdEQUF5QztBQWV6Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStCRztBQUNILFdBQTJCLFNBQVEsZ0JBQVk7SUFxQzdDLFlBQVksT0FBcUI7UUFDL0IsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVoRixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBVSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUssSUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILElBQUksSUFBSTtRQUNOLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBaUIsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDRyxRQUFRLENBQUMsV0FBd0I7O1lBQ3JDLG1CQUFtQjtRQUNyQixDQUFDO0tBQUE7Q0FFRjtBQXJFRCx3QkFxRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmluZHVwID0gcmVxdWlyZSgnZmluZHVwLXN5bmMnKTtcbmltcG9ydCAqIGFzIHRyeVJlcXVpcmUgZnJvbSAndHJ5LXJlcXVpcmUnO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuLi9tZXRhbC9jb250YWluZXInO1xuaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4vYXBwbGljYXRpb24nO1xuaW1wb3J0IFJlc29sdmVyIGZyb20gJy4uL21ldGFsL3Jlc29sdmVyJztcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciBvcHRpb25zIGZvciBBZGRvbiBjbGFzc1xuICpcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFkZG9uT3B0aW9ucyB7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBjb250YWluZXI6IENvbnRhaW5lcjtcbiAgcGtnPzogYW55O1xufVxuXG4vKipcbiAqIEFkZG9ucyBhcmUgdGhlIGZ1bmRhbWVudGFsIHVuaXQgb2Ygb3JnYW5pemF0aW9uIGZvciBEZW5hbGkgYXBwcy4gVGhlIEFwcGxpY2F0aW9uIGNsYXNzIGlzIGp1c3QgYVxuICogc3BlY2lhbGl6ZWQgQWRkb24sIGFuZCBlYWNoIEFkZG9uIGNhbiBjb250YWluIGFueSBhbW91bnQgb2YgZnVuY3Rpb25hbGl0eS5cbiAqXG4gKiAjIyBTdHJ1Y3R1cmVcbiAqXG4gKiBBZGRvbnMgYXJlIHBhY2thZ2VkIGFzIG5wbSBtb2R1bGVzIGZvciBlYXN5IHNoYXJpbmcuIFdoZW4gRGVuYWxpIGJvb3RzIHVwLCBpdCBzZWFyY2hlcyB5b3VyXG4gKiBub2RlX21vZHVsZXMgZm9yIGF2YWlsYWJsZSBEZW5hbGkgQWRkb25zIChpZGVudGlmaWVkIGJ5IHRoZSBgZGVuYWxpLWFkZG9uYCBrZXl3b3JkIGluIHRoZVxuICogcGFja2FnZS5qc29uKS4gQWRkb25zIGNhbiBiZSBuZXN0ZWQgKGkuZS4gYW4gYWRkb24gY2FuIGl0c2VsZiBkZXBlbmQgb24gYW5vdGhlciBhZGRvbikuXG4gKlxuICogRWFjaCBhZGRvbiBjYW4gYmUgY29tcG9zZWQgb2Ygb25lIG9yIHNldmVyYWwgb2YgdGhlIGZvbGxvd2luZyBwYXJ0czpcbiAqXG4gKiAgICogQ29uZmlnXG4gKiAgICogSW5pdGlhbGl6ZXJzXG4gKiAgICogTWlkZGxld2FyZVxuICogICAqIEFwcCBjbGFzc2VzXG4gKiAgICogUm91dGVzXG4gKlxuICogIyMgTG9hZCBvcmRlclxuICpcbiAqIEFmdGVyIERlbmFsaSBkaXNjb3ZlcnMgdGhlIGF2YWlsYWJsZSBhZGRvbnMsIGl0IHRoZW4gbWVyZ2VzIHRoZW0gdG8gZm9ybSBhIHVuaWZpZWQgYXBwbGljYXRpb24uXG4gKiBBZGRvbnMgaGlnaGVyIGluIHRoZSBkZXBlbmRlbmN5IHRyZWUgdGFrZSBwcmVjZWRlbmNlLCBhbmQgc2libGluZyBhZGRvbnMgY2FuIHNwZWNpZnkgbG9hZCBvcmRlclxuICogdmlhIHRoZWlyIHBhY2thZ2UuanNvbiBmaWxlczpcbiAqXG4gKiAgICAgXCJkZW5hbGlcIjoge1xuICogICAgICAgXCJiZWZvcmVcIjogWyBcImFub3RoZXItYWRkb24tbmFtZVwiIF0sXG4gKiAgICAgICBcImFmdGVyXCI6IFsgXCJjb29sLWFkZG9uLW5hbWVcIiBdXG4gKiAgICAgfVxuICpcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGRvbiBleHRlbmRzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGVudmlyb25tZW50IGZvciB0aGUgYXBwLCBpLmUuICdkZXZlbG9wbWVudCdcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgcm9vdCBkaXJlY3Rvcnkgb24gdGhlIGZpbGVzeXN0ZW0gZm9yIHRoaXMgYWRkb25cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBkaXI6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIHBhY2thZ2UuanNvbiBmb3IgdGhpcyBhZGRvblxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHBrZzogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgcmVzb2x2ZXIgaW5zdGFuY2UgdG8gdXNlIHdpdGggdGhpcyBhZGRvbi5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICByZXNvbHZlcjogUmVzb2x2ZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBjb25zdW1pbmcgYXBwbGljYXRpb24gY29udGFpbmVyIGluc3RhbmNlXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgY29udGFpbmVyOiBDb250YWluZXI7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogQWRkb25PcHRpb25zKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG9wdGlvbnMuY29udGFpbmVyO1xuICAgIHRoaXMuZW52aXJvbm1lbnQgPSBvcHRpb25zLmVudmlyb25tZW50O1xuICAgIHRoaXMuZGlyID0gb3B0aW9ucy5kaXI7XG4gICAgdGhpcy5wa2cgPSBvcHRpb25zLnBrZyB8fCB0cnlSZXF1aXJlKGZpbmR1cCgncGFja2FnZS5qc29uJywgeyBjd2Q6IHRoaXMuZGlyIH0pKTtcblxuICAgIHRoaXMucmVzb2x2ZXIgPSB0aGlzLnJlc29sdmVyIHx8IG5ldyBSZXNvbHZlcih0aGlzLmRpcik7XG4gICAgdGhpcy5jb250YWluZXIuYWRkUmVzb2x2ZXIodGhpcy5yZXNvbHZlcik7XG4gICAgdGhpcy5jb250YWluZXIucmVnaXN0ZXIoYGFkZG9uOiR7IHRoaXMucGtnLm5hbWUgfUAkeyB0aGlzLnBrZy52ZXJzaW9uIH1gLCB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbmFtZSBvZiB0aGUgYWRkb24uIE92ZXJyaWRlIHRoaXMgdG8gdXNlIGEgZGlmZmVyZW50IG5hbWUgdGhhbiB0aGUgcGFja2FnZSBuYW1lIGZvciB5b3VyXG4gICAqIGFkZG9uLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzLnBrZyAmJiB0aGlzLnBrZy5uYW1lKSB8fCAnYW5vbnltb3VzLWFkZG9uJztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGhvb2sgdG8gcGVyZm9ybSBhbnkgc2h1dGRvd24gYWN0aW9ucyBuZWNlc3NhcnkgdG8gZ3JhY2VmdWxseSBleGl0IHRoZSBhcHBsaWNhdGlvbiwgaS5lLiBjbG9zZVxuICAgKiBkYXRhYmFzZS9zb2NrZXQgY29ubmVjdGlvbnMuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgc2h1dGRvd24oYXBwbGljYXRpb246IEFwcGxpY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gZGVmYXVsdHMgdG8gbm9vcFxuICB9XG5cbn1cbiJdfQ==