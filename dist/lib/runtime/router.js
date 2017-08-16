"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ware = require("ware");
const inflection_1 = require("inflection");
const bluebird_1 = require("bluebird");
const createDebug = require("debug");
const errors_1 = require("./errors");
const route_1 = require("./route");
const request_1 = require("./request");
const ensureArray = require("arrify");
const object_1 = require("../metal/object");
const lodash_1 = require("lodash");
const debug = createDebug('denali:router');
;
/**
 * The Router handles incoming requests, sending them to the appropriate action. It's also
 * responsible for defining routes in the first place - it's passed into the `config/routes.js`
 * file's exported function as the first argument.
 *
 * @package runtime
 * @since 0.1.0
 */
class Router extends object_1.default {
    constructor() {
        super(...arguments);
        /**
         * The cache of available routes.
         */
        this.routes = {
            get: [],
            post: [],
            put: [],
            patch: [],
            delete: [],
            head: [],
            options: []
        };
        /**
         * The internal generic middleware handler, responsible for building and executing the middleware
         * chain.
         */
        this.middleware = ware();
    }
    /**
     * Helper method to invoke the function exported by `config/routes.js` in the context of the
     * current router instance.
     *
     * @since 0.1.0
     */
    map(fn) {
        debug('mapping routes');
        fn(this);
    }
    /**
     * Takes an incoming request and it's response from an HTTP server, prepares them, runs the
     * generic middleware first, hands them off to the appropriate action given the incoming URL, and
     * finally renders the response.
     */
    handle(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let request = new request_1.default(req);
            try {
                debug(`[${request.id}]: ${request.method.toUpperCase()} ${request.path}`);
                // Middleware
                yield bluebird_1.fromNode((cb) => this.middleware.run(request, res, cb));
                // Find the matching route
                debug(`[${request.id}]: routing request`);
                let routes = this.routes[request.method];
                for (let i = 0; i < routes.length; i += 1) {
                    request.params = routes[i].match(request.path);
                    if (request.params) {
                        request.route = routes[i];
                        break;
                    }
                }
                // Handle 404s
                if (!request.route) {
                    debug(`[${request.id}]: ${request.method} ${request.path} did match any route. Available ${request.method} routes:\n${routes.map((r) => r.spec).join(',\n')}`);
                    throw new errors_1.default.NotFound('Route not recognized');
                }
                // Create our action to handle the response
                let action = request.route.action.create();
                // Run the action
                debug(`[${request.id}]: running action`);
                yield action.run(request, res);
            }
            catch (error) {
                yield this.handleError(request, res, error);
            }
        });
    }
    /**
     * Takes a request, response, and an error and hands off to the generic application level error
     * action.
     */
    handleError(request, res, error) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            request.params = request.params || {};
            request.params.error = error;
            let errorAction = this.container.lookup('action:error');
            return errorAction.run(request, res);
        });
    }
    /**
     * Add the supplied middleware function to the generic middleware stack that runs prior to action
     * handling.
     *
     * @since 0.1.0
     */
    use(middleware) {
        this.middleware.use(middleware);
    }
    /**
     * Add a route to the application. Maps a method and URL pattern to an action, with optional
     * additional parameters.
     *
     * URL patterns can use:
     *
     * * Dynamic segments, i.e. `'foo/:bar'` * Wildcard segments, i.e. `'foo/*bar'`, captures the rest
     * of the URL up
     *    to the querystring
     * * Optional groups, i.e. `'foo(/:bar)'`
     *
     * @since 0.1.0
     */
    route(method, rawPattern, actionPath, params) {
        // Ensure leading slashes
        let normalizedPattern = rawPattern.replace(/^([^/])/, '/$1');
        // Remove hardcoded trailing slashes
        normalizedPattern = normalizedPattern.replace(/\/$/, '');
        // Ensure optional trailing slashes
        normalizedPattern = `${normalizedPattern}(/)`;
        // Add route
        let ActionClass = this.container.factoryFor(`action:${actionPath}`);
        let route = new route_1.default(normalizedPattern);
        route.actionPath = actionPath;
        route.action = ActionClass;
        route.additionalParams = params;
        if (!route.action) {
            throw new Error(`No action found at ${actionPath}`);
        }
        this.routes[method].push(route);
    }
    /**
     * Returns the URL for a given action. You can supply a params object which
     * will be used to fill in the dynamic segements of the action's route (if
     * any).
     */
    urlFor(actionPath, data) {
        let action = this.container.factoryFor(`action:${actionPath}`);
        if (!action) {
            return false;
        }
        let route;
        lodash_1.forEach(this.routes, (routes) => {
            route = lodash_1.find(routes, { action });
            return !route; // kill the iterator if we found the match
        });
        return route && route.reverse(data);
    }
    /**
     * Shorthand for `this.route('get', ...arguments)`
     *
     * @since 0.1.0
     */
    get(rawPattern, actionPath, params) {
        this.route('get', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('post', ...arguments)`
     *
     * @since 0.1.0
     */
    post(rawPattern, actionPath, params) {
        this.route('post', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('put', ...arguments)`
     *
     * @since 0.1.0
     */
    put(rawPattern, actionPath, params) {
        this.route('put', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('patch', ...arguments)`
     *
     * @since 0.1.0
     */
    patch(rawPattern, actionPath, params) {
        this.route('patch', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('delete', ...arguments)`
     *
     * @since 0.1.0
     */
    delete(rawPattern, actionPath, params) {
        this.route('delete', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('head', ...arguments)`
     *
     * @since 0.1.0
     */
    head(rawPattern, actionPath, params) {
        this.route('head', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('options', ...arguments)`
     *
     * @since 0.1.0
     */
    options(rawPattern, actionPath, params) {
        this.route('options', rawPattern, actionPath, params);
    }
    /**
     * Create all the CRUD routes for a given resource and it's relationships. Based on the JSON-API
     * recommendations for URL design.
     *
     * The `options` argument lets you pass in `only` or `except` arrays to define exceptions. Action
     * names included in `only` will be the only ones generated, while names included in `except` will
     * be omitted.
     *
     * Set `options.related = false` to disable relationship routes.
     *
     * If no options are supplied, the following routes are generated (assuming a 'books' resource as
     * an example):
     *
     *   * `GET /books`
     *   * `POST /books`
     *   * `GET /books/:id`
     *   * `PATCH /books/:id`
     *   * `DELETE /books/:id`
     *   * `GET /books/:id/:relation`
     *   * `GET /books/:id/relationships/:relation`
     *   * `PATCH /books/:id/relationships/:relation`
     *   * `POST /books/:id/relationships/:relation`
     *   * `DELETE /books/:id/relationships/:relation`
     *
     * See http://jsonapi.org/recommendations/#urls for details.
     *
     * @since 0.1.0
     */
    resource(resourceName, options = {}) {
        let plural = inflection_1.pluralize(resourceName);
        let collection = `/${plural}`;
        let resource = `${collection}/:id`;
        let relationship = `${resource}/relationships/:relation`;
        let related = `${resource}/:relation`;
        if (!options.related) {
            options.except = ['related', 'fetch-related', 'replace-related', 'add-related', 'remove-related'].concat(options.except);
        }
        let hasWhitelist = Boolean(options.only);
        options.only = ensureArray(options.only);
        options.except = ensureArray(options.except);
        /**
         * Check if the given action should be generated based on the whitelist/blacklist options
         */
        function include(action) {
            let whitelisted = options.only.includes(action);
            let blacklisted = options.except.includes(action);
            return !blacklisted && ((hasWhitelist && whitelisted) ||
                !hasWhitelist);
        }
        [
            ['list', 'get', collection],
            ['create', 'post', collection],
            ['show', 'get', resource],
            ['update', 'patch', resource],
            ['destroy', 'delete', resource],
            ['related', 'get', related],
            ['fetch-related', 'get', relationship],
            ['replace-related', 'patch', relationship],
            ['add-related', 'post', relationship],
            ['remove-related', 'delete', relationship]
        ].forEach((routeTemplate) => {
            let [action, method, url] = routeTemplate;
            if (include(action)) {
                let routeMethod = this[method];
                routeMethod.call(this, url, `${plural}/${action}`);
            }
        });
    }
    /**
     * Enables easy route namespacing. You can supply a method which takes a single argument that
     * works just like the `router` argument in your `config/routes.js`, or you can use the return
     * value just like the router.
     *
     *   router.namespace('users', (namespace) => {
     *     namespace.get('sign-in');
     *   });
     *   // or ...
     *   let namespace = router.namespace('users');
     *   namespace.get('sign-in');
     */
    namespace(namespace, fn) {
        let router = this;
        if (namespace.endsWith('/')) {
            namespace = namespace.slice(0, namespace.length - 1);
        }
        // tslint:disable:completed-docs
        let wrapper = {
            get(pattern, actionPath, params) {
                router.route('get', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            post(pattern, actionPath, params) {
                router.route('post', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            put(pattern, actionPath, params) {
                router.route('put', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            patch(pattern, actionPath, params) {
                router.route('patch', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            delete(pattern, actionPath, params) {
                router.route('delete', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            head(pattern, actionPath, params) {
                router.route('head', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            options(pattern, actionPath, params) {
                router.route('options', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            resource(resourceName, options) {
                router.resource.call(this, resourceName, options);
            }
        };
        // tslint:enable:completed-docs
        if (fn) {
            fn(wrapper);
        }
    }
}
exports.default = Router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvcnVudGltZS9yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBRTdCLDJDQUF1QztBQUN2Qyx1Q0FBb0M7QUFDcEMscUNBQXFDO0FBQ3JDLHFDQUE4QjtBQUM5QixtQ0FBNEI7QUFDNUIsdUNBQTRDO0FBQzVDLHNDQUF1QztBQUN2Qyw0Q0FBMkM7QUFHM0MsbUNBR2lCO0FBRWpCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQVcxQyxDQUFDO0FBb0NGOzs7Ozs7O0dBT0c7QUFDSCxZQUE0QixTQUFRLGdCQUFZO0lBQWhEOztRQUVFOztXQUVHO1FBQ0gsV0FBTSxHQUFnQjtZQUNwQixHQUFHLEVBQUUsRUFBRTtZQUNQLElBQUksRUFBRSxFQUFFO1lBQ1IsR0FBRyxFQUFFLEVBQUU7WUFDUCxLQUFLLEVBQUUsRUFBRTtZQUNULE1BQU0sRUFBRSxFQUFFO1lBQ1YsSUFBSSxFQUFFLEVBQUU7WUFDUixPQUFPLEVBQUUsRUFBRTtTQUNaLENBQUM7UUFFRjs7O1dBR0c7UUFDSyxlQUFVLEdBQW9CLElBQUssRUFBRSxDQUFDO0lBbVVoRCxDQUFDO0lBNVRDOzs7OztPQUtHO0lBQ0gsR0FBRyxDQUFDLEVBQTRCO1FBQzlCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRDs7OztPQUlHO0lBQ0csTUFBTSxDQUFDLEdBQW9CLEVBQUUsR0FBbUI7O1lBQ3BELElBQUksT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUM7Z0JBRUgsS0FBSyxDQUFDLElBQUssT0FBTyxDQUFDLEVBQUcsTUFBTyxPQUFPLENBQUMsTUFB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QyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1AsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7Q0FFRjtBQXRWRCx5QkFzVkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3YXJlIGZyb20gJ3dhcmUnO1xuaW1wb3J0IHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IHsgcGx1cmFsaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5pbXBvcnQgeyBmcm9tTm9kZSB9IGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCAqIGFzIGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBFcnJvcnMgZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IFJvdXRlIGZyb20gJy4vcm91dGUnO1xuaW1wb3J0IFJlcXVlc3QsIHsgTWV0aG9kIH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCBlbnN1cmVBcnJheSA9IHJlcXVpcmUoJ2FycmlmeScpO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuLi9tZXRhbC9jb250YWluZXInO1xuaW1wb3J0IEFjdGlvbiBmcm9tICcuL2FjdGlvbic7XG5pbXBvcnQge1xuICBmaW5kLFxuICBmb3JFYWNoXG4gfSBmcm9tICdsb2Rhc2gnO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZW5hbGk6cm91dGVyJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGVzQ2FjaGUge1xuICBnZXQ6IFJvdXRlW107XG4gIHBvc3Q6IFJvdXRlW107XG4gIHB1dDogUm91dGVbXTtcbiAgcGF0Y2g6IFJvdXRlW107XG4gIGRlbGV0ZTogUm91dGVbXTtcbiAgaGVhZDogUm91dGVbXTtcbiAgb3B0aW9uczogUm91dGVbXTtcbiAgW21ldGhvZDogc3RyaW5nXTogUm91dGVbXTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWlkZGxld2FyZUZuIHtcbiAgKHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlLCBuZXh0OiBGdW5jdGlvbik6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb3VyY2VPcHRpb25zIHtcbiAgLyoqXG4gICAqIFNob3VsZCByb3V0ZXMgZm9yIHJlbGF0ZWQgcmVzb3VyY2VzIGJlIGdlbmVyYXRlZD8gSWYgdHJ1ZSwgcm91dGVzIHdpbGwgYmUgZ2VuZXJhdGVkIGZvbGxvd2luZ1xuICAgKiB0aGUgSlNPTi1BUEkgcmVjb21tZW5kYXRpb25zIGZvciByZWxhdGlvbnNoaXAgVVJMcy5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgaHR0cDovL2pzb25hcGkub3JnL3JlY29tbWVuZGF0aW9ucy8jdXJscy1yZWxhdGlvbnNoaXBzfEpTT04tQVBJIFVSTFxuICAgKiBSZWNvbW1lbmRhdGlvc259XG4gICAqL1xuICByZWxhdGVkPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEEgbGlzdCBvZiBhY3Rpb24gdHlwZXMgdG8gX25vdF8gZ2VuZXJhdGUuXG4gICAqL1xuICBleGNlcHQ/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIEEgbGlzdCBvZiBhY3Rpb24gdHlwZXMgdGhhdCBzaG91bGQgYmUgdGhlIF9vbmx5XyBvbmVzIGdlbmVyYXRlZC5cbiAgICovXG4gIG9ubHk/OiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSb3V0ZXJEU0wge1xuICBnZXQocGF0dGVybjogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgcGFyYW1zOiB7fSk6IHZvaWQ7XG4gIHBvc3QocGF0dGVybjogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgcGFyYW1zOiB7fSk6IHZvaWQ7XG4gIHB1dChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBwYXJhbXM6IHt9KTogdm9pZDtcbiAgcGF0Y2gocGF0dGVybjogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgcGFyYW1zOiB7fSk6IHZvaWQ7XG4gIGRlbGV0ZShwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBwYXJhbXM6IHt9KTogdm9pZDtcbiAgaGVhZChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBwYXJhbXM6IHt9KTogdm9pZDtcbiAgb3B0aW9ucyhwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBwYXJhbXM6IHt9KTogdm9pZDtcbiAgcmVzb3VyY2UocmVzb3VyY2VOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXNvdXJjZU9wdGlvbnMpOiB2b2lkO1xufVxuXG4vKipcbiAqIFRoZSBSb3V0ZXIgaGFuZGxlcyBpbmNvbWluZyByZXF1ZXN0cywgc2VuZGluZyB0aGVtIHRvIHRoZSBhcHByb3ByaWF0ZSBhY3Rpb24uIEl0J3MgYWxzb1xuICogcmVzcG9uc2libGUgZm9yIGRlZmluaW5nIHJvdXRlcyBpbiB0aGUgZmlyc3QgcGxhY2UgLSBpdCdzIHBhc3NlZCBpbnRvIHRoZSBgY29uZmlnL3JvdXRlcy5qc2BcbiAqIGZpbGUncyBleHBvcnRlZCBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvdXRlciBleHRlbmRzIERlbmFsaU9iamVjdCBpbXBsZW1lbnRzIFJvdXRlckRTTCB7XG5cbiAgLyoqXG4gICAqIFRoZSBjYWNoZSBvZiBhdmFpbGFibGUgcm91dGVzLlxuICAgKi9cbiAgcm91dGVzOiBSb3V0ZXNDYWNoZSA9IHtcbiAgICBnZXQ6IFtdLFxuICAgIHBvc3Q6IFtdLFxuICAgIHB1dDogW10sXG4gICAgcGF0Y2g6IFtdLFxuICAgIGRlbGV0ZTogW10sXG4gICAgaGVhZDogW10sXG4gICAgb3B0aW9uczogW11cbiAgfTtcblxuICAvKipcbiAgICogVGhlIGludGVybmFsIGdlbmVyaWMgbWlkZGxld2FyZSBoYW5kbGVyLCByZXNwb25zaWJsZSBmb3IgYnVpbGRpbmcgYW5kIGV4ZWN1dGluZyB0aGUgbWlkZGxld2FyZVxuICAgKiBjaGFpbi5cbiAgICovXG4gIHByaXZhdGUgbWlkZGxld2FyZTogYW55ID0gKDwoKSA9PiBhbnk+d2FyZSkoKTtcblxuICAvKipcbiAgICogVGhlIGFwcGxpY2F0aW9uIGNvbnRhaW5lclxuICAgKi9cbiAgY29udGFpbmVyOiBDb250YWluZXI7XG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gaW52b2tlIHRoZSBmdW5jdGlvbiBleHBvcnRlZCBieSBgY29uZmlnL3JvdXRlcy5qc2AgaW4gdGhlIGNvbnRleHQgb2YgdGhlXG4gICAqIGN1cnJlbnQgcm91dGVyIGluc3RhbmNlLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIG1hcChmbjogKHJvdXRlcjogUm91dGVyKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgZGVidWcoJ21hcHBpbmcgcm91dGVzJyk7XG4gICAgZm4odGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYW4gaW5jb21pbmcgcmVxdWVzdCBhbmQgaXQncyByZXNwb25zZSBmcm9tIGFuIEhUVFAgc2VydmVyLCBwcmVwYXJlcyB0aGVtLCBydW5zIHRoZVxuICAgKiBnZW5lcmljIG1pZGRsZXdhcmUgZmlyc3QsIGhhbmRzIHRoZW0gb2ZmIHRvIHRoZSBhcHByb3ByaWF0ZSBhY3Rpb24gZ2l2ZW4gdGhlIGluY29taW5nIFVSTCwgYW5kXG4gICAqIGZpbmFsbHkgcmVuZGVycyB0aGUgcmVzcG9uc2UuXG4gICAqL1xuICBhc3luYyBoYW5kbGUocmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KHJlcSk7XG4gICAgdHJ5IHtcblxuICAgICAgZGVidWcoYFskeyByZXF1ZXN0LmlkIH1dOiAkeyByZXF1ZXN0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpIH0gJHsgcmVxdWVzdC5wYXRoIH1gKTtcblxuICAgICAgLy8gTWlkZGxld2FyZVxuICAgICAgYXdhaXQgZnJvbU5vZGUoKGNiKSA9PiB0aGlzLm1pZGRsZXdhcmUucnVuKHJlcXVlc3QsIHJlcywgY2IpKTtcblxuICAgICAgLy8gRmluZCB0aGUgbWF0Y2hpbmcgcm91dGVcbiAgICAgIGRlYnVnKGBbJHsgcmVxdWVzdC5pZCB9XTogcm91dGluZyByZXF1ZXN0YCk7XG4gICAgICBsZXQgcm91dGVzID0gdGhpcy5yb3V0ZXNbcmVxdWVzdC5tZXRob2RdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgcmVxdWVzdC5wYXJhbXMgPSByb3V0ZXNbaV0ubWF0Y2gocmVxdWVzdC5wYXRoKTtcbiAgICAgICAgaWYgKHJlcXVlc3QucGFyYW1zKSB7XG4gICAgICAgICAgcmVxdWVzdC5yb3V0ZSA9IHJvdXRlc1tpXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gSGFuZGxlIDQwNHNcbiAgICAgIGlmICghcmVxdWVzdC5yb3V0ZSkge1xuICAgICAgICBkZWJ1ZyhgWyR7IHJlcXVlc3QuaWQgfV06ICR7IHJlcXVlc3QubWV0aG9kIH0gJHsgcmVxdWVzdC5wYXRoIH0gZGlkIG1hdGNoIGFueSByb3V0ZS4gQXZhaWxhYmxlICR7IHJlcXVlc3QubWV0aG9kIH0gcm91dGVzOlxcbiR7IHJvdXRlcy5tYXAoKHIpID0+IHIuc3BlYykuam9pbignLFxcbicpIH1gKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9ycy5Ob3RGb3VuZCgnUm91dGUgbm90IHJlY29nbml6ZWQnKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIG91ciBhY3Rpb24gdG8gaGFuZGxlIHRoZSByZXNwb25zZVxuICAgICAgbGV0IGFjdGlvbjogQWN0aW9uID0gcmVxdWVzdC5yb3V0ZS5hY3Rpb24uY3JlYXRlKCk7XG5cbiAgICAgIC8vIFJ1biB0aGUgYWN0aW9uXG4gICAgICBkZWJ1ZyhgWyR7IHJlcXVlc3QuaWQgfV06IHJ1bm5pbmcgYWN0aW9uYCk7XG4gICAgICBhd2FpdCBhY3Rpb24ucnVuKHJlcXVlc3QsIHJlcyk7XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVFcnJvcihyZXF1ZXN0LCByZXMsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSByZXF1ZXN0LCByZXNwb25zZSwgYW5kIGFuIGVycm9yIGFuZCBoYW5kcyBvZmYgdG8gdGhlIGdlbmVyaWMgYXBwbGljYXRpb24gbGV2ZWwgZXJyb3JcbiAgICogYWN0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVFcnJvcihyZXF1ZXN0OiBSZXF1ZXN0LCByZXM6IFNlcnZlclJlc3BvbnNlLCBlcnJvcjogRXJyb3IpIHtcbiAgICByZXF1ZXN0LnBhcmFtcyA9IHJlcXVlc3QucGFyYW1zIHx8IHt9O1xuICAgIHJlcXVlc3QucGFyYW1zLmVycm9yID0gZXJyb3I7XG4gICAgbGV0IGVycm9yQWN0aW9uID0gdGhpcy5jb250YWluZXIubG9va3VwKCdhY3Rpb246ZXJyb3InKTtcbiAgICByZXR1cm4gZXJyb3JBY3Rpb24ucnVuKHJlcXVlc3QsIHJlcyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHRoZSBzdXBwbGllZCBtaWRkbGV3YXJlIGZ1bmN0aW9uIHRvIHRoZSBnZW5lcmljIG1pZGRsZXdhcmUgc3RhY2sgdGhhdCBydW5zIHByaW9yIHRvIGFjdGlvblxuICAgKiBoYW5kbGluZy5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICB1c2UobWlkZGxld2FyZTogTWlkZGxld2FyZUZuKTogdm9pZCB7XG4gICAgdGhpcy5taWRkbGV3YXJlLnVzZShtaWRkbGV3YXJlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSByb3V0ZSB0byB0aGUgYXBwbGljYXRpb24uIE1hcHMgYSBtZXRob2QgYW5kIFVSTCBwYXR0ZXJuIHRvIGFuIGFjdGlvbiwgd2l0aCBvcHRpb25hbFxuICAgKiBhZGRpdGlvbmFsIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIFVSTCBwYXR0ZXJucyBjYW4gdXNlOlxuICAgKlxuICAgKiAqIER5bmFtaWMgc2VnbWVudHMsIGkuZS4gYCdmb28vOmJhcidgICogV2lsZGNhcmQgc2VnbWVudHMsIGkuZS4gYCdmb28vKmJhcidgLCBjYXB0dXJlcyB0aGUgcmVzdFxuICAgKiBvZiB0aGUgVVJMIHVwXG4gICAqICAgIHRvIHRoZSBxdWVyeXN0cmluZ1xuICAgKiAqIE9wdGlvbmFsIGdyb3VwcywgaS5lLiBgJ2ZvbygvOmJhciknYFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHJvdXRlKG1ldGhvZDogTWV0aG9kLCByYXdQYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGg6IHN0cmluZywgcGFyYW1zPzogYW55KSB7XG4gICAgLy8gRW5zdXJlIGxlYWRpbmcgc2xhc2hlc1xuICAgIGxldCBub3JtYWxpemVkUGF0dGVybiA9IHJhd1BhdHRlcm4ucmVwbGFjZSgvXihbXi9dKS8sICcvJDEnKTtcbiAgICAvLyBSZW1vdmUgaGFyZGNvZGVkIHRyYWlsaW5nIHNsYXNoZXNcbiAgICBub3JtYWxpemVkUGF0dGVybiA9IG5vcm1hbGl6ZWRQYXR0ZXJuLnJlcGxhY2UoL1xcLyQvLCAnJyk7XG4gICAgLy8gRW5zdXJlIG9wdGlvbmFsIHRyYWlsaW5nIHNsYXNoZXNcbiAgICBub3JtYWxpemVkUGF0dGVybiA9IGAkeyBub3JtYWxpemVkUGF0dGVybiB9KC8pYDtcbiAgICAvLyBBZGQgcm91dGVcbiAgICBsZXQgQWN0aW9uQ2xhc3MgPSB0aGlzLmNvbnRhaW5lci5mYWN0b3J5Rm9yPEFjdGlvbj4oYGFjdGlvbjokeyBhY3Rpb25QYXRoIH1gKTtcbiAgICBsZXQgcm91dGUgPSBuZXcgUm91dGUobm9ybWFsaXplZFBhdHRlcm4pO1xuICAgIHJvdXRlLmFjdGlvblBhdGggPSBhY3Rpb25QYXRoO1xuICAgIHJvdXRlLmFjdGlvbiA9IEFjdGlvbkNsYXNzO1xuICAgIHJvdXRlLmFkZGl0aW9uYWxQYXJhbXMgPSBwYXJhbXM7XG4gICAgaWYgKCFyb3V0ZS5hY3Rpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gYWN0aW9uIGZvdW5kIGF0ICR7IGFjdGlvblBhdGggfWApO1xuICAgIH1cbiAgICB0aGlzLnJvdXRlc1ttZXRob2RdLnB1c2gocm91dGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFVSTCBmb3IgYSBnaXZlbiBhY3Rpb24uIFlvdSBjYW4gc3VwcGx5IGEgcGFyYW1zIG9iamVjdCB3aGljaFxuICAgKiB3aWxsIGJlIHVzZWQgdG8gZmlsbCBpbiB0aGUgZHluYW1pYyBzZWdlbWVudHMgb2YgdGhlIGFjdGlvbidzIHJvdXRlIChpZlxuICAgKiBhbnkpLlxuICAgKi9cbiAgdXJsRm9yKGFjdGlvblBhdGg6IHN0cmluZywgZGF0YTogYW55KTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgbGV0IGFjdGlvbiA9IHRoaXMuY29udGFpbmVyLmZhY3RvcnlGb3I8QWN0aW9uPihgYWN0aW9uOiR7IGFjdGlvblBhdGggfWApO1xuICAgIGlmICghYWN0aW9uKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHJvdXRlOiBSb3V0ZTtcbiAgICBmb3JFYWNoKHRoaXMucm91dGVzLCAocm91dGVzKSA9PiB7XG4gICAgICByb3V0ZSA9IGZpbmQocm91dGVzLCB7IGFjdGlvbiB9KTtcbiAgICAgIHJldHVybiAhcm91dGU7IC8vIGtpbGwgdGhlIGl0ZXJhdG9yIGlmIHdlIGZvdW5kIHRoZSBtYXRjaFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJvdXRlICYmIHJvdXRlLnJldmVyc2UoZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIGZvciBgdGhpcy5yb3V0ZSgnZ2V0JywgLi4uYXJndW1lbnRzKWBcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQocmF3UGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoOiBzdHJpbmcsIHBhcmFtcz86IGFueSk6IHZvaWQge1xuICAgIHRoaXMucm91dGUoJ2dldCcsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIGZvciBgdGhpcy5yb3V0ZSgncG9zdCcsIC4uLmFyZ3VtZW50cylgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcG9zdChyYXdQYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGg6IHN0cmluZywgcGFyYW1zPzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5yb3V0ZSgncG9zdCcsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIGZvciBgdGhpcy5yb3V0ZSgncHV0JywgLi4uYXJndW1lbnRzKWBcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdXQocmF3UGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoOiBzdHJpbmcsIHBhcmFtcz86IGFueSk6IHZvaWQge1xuICAgIHRoaXMucm91dGUoJ3B1dCcsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIGZvciBgdGhpcy5yb3V0ZSgncGF0Y2gnLCAuLi5hcmd1bWVudHMpYFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHBhdGNoKHJhd1BhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aDogc3RyaW5nLCBwYXJhbXM/OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnJvdXRlKCdwYXRjaCcsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIGZvciBgdGhpcy5yb3V0ZSgnZGVsZXRlJywgLi4uYXJndW1lbnRzKWBcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBkZWxldGUocmF3UGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoOiBzdHJpbmcsIHBhcmFtcz86IGFueSk6IHZvaWQge1xuICAgIHRoaXMucm91dGUoJ2RlbGV0ZScsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIGZvciBgdGhpcy5yb3V0ZSgnaGVhZCcsIC4uLmFyZ3VtZW50cylgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgaGVhZChyYXdQYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGg6IHN0cmluZywgcGFyYW1zPzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5yb3V0ZSgnaGVhZCcsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIGZvciBgdGhpcy5yb3V0ZSgnb3B0aW9ucycsIC4uLmFyZ3VtZW50cylgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgb3B0aW9ucyhyYXdQYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGg6IHN0cmluZywgcGFyYW1zPzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5yb3V0ZSgnb3B0aW9ucycsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGFsbCB0aGUgQ1JVRCByb3V0ZXMgZm9yIGEgZ2l2ZW4gcmVzb3VyY2UgYW5kIGl0J3MgcmVsYXRpb25zaGlwcy4gQmFzZWQgb24gdGhlIEpTT04tQVBJXG4gICAqIHJlY29tbWVuZGF0aW9ucyBmb3IgVVJMIGRlc2lnbi5cbiAgICpcbiAgICogVGhlIGBvcHRpb25zYCBhcmd1bWVudCBsZXRzIHlvdSBwYXNzIGluIGBvbmx5YCBvciBgZXhjZXB0YCBhcnJheXMgdG8gZGVmaW5lIGV4Y2VwdGlvbnMuIEFjdGlvblxuICAgKiBuYW1lcyBpbmNsdWRlZCBpbiBgb25seWAgd2lsbCBiZSB0aGUgb25seSBvbmVzIGdlbmVyYXRlZCwgd2hpbGUgbmFtZXMgaW5jbHVkZWQgaW4gYGV4Y2VwdGAgd2lsbFxuICAgKiBiZSBvbWl0dGVkLlxuICAgKlxuICAgKiBTZXQgYG9wdGlvbnMucmVsYXRlZCA9IGZhbHNlYCB0byBkaXNhYmxlIHJlbGF0aW9uc2hpcCByb3V0ZXMuXG4gICAqXG4gICAqIElmIG5vIG9wdGlvbnMgYXJlIHN1cHBsaWVkLCB0aGUgZm9sbG93aW5nIHJvdXRlcyBhcmUgZ2VuZXJhdGVkIChhc3N1bWluZyBhICdib29rcycgcmVzb3VyY2UgYXNcbiAgICogYW4gZXhhbXBsZSk6XG4gICAqXG4gICAqICAgKiBgR0VUIC9ib29rc2BcbiAgICogICAqIGBQT1NUIC9ib29rc2BcbiAgICogICAqIGBHRVQgL2Jvb2tzLzppZGBcbiAgICogICAqIGBQQVRDSCAvYm9va3MvOmlkYFxuICAgKiAgICogYERFTEVURSAvYm9va3MvOmlkYFxuICAgKiAgICogYEdFVCAvYm9va3MvOmlkLzpyZWxhdGlvbmBcbiAgICogICAqIGBHRVQgL2Jvb2tzLzppZC9yZWxhdGlvbnNoaXBzLzpyZWxhdGlvbmBcbiAgICogICAqIGBQQVRDSCAvYm9va3MvOmlkL3JlbGF0aW9uc2hpcHMvOnJlbGF0aW9uYFxuICAgKiAgICogYFBPU1QgL2Jvb2tzLzppZC9yZWxhdGlvbnNoaXBzLzpyZWxhdGlvbmBcbiAgICogICAqIGBERUxFVEUgL2Jvb2tzLzppZC9yZWxhdGlvbnNoaXBzLzpyZWxhdGlvbmBcbiAgICpcbiAgICogU2VlIGh0dHA6Ly9qc29uYXBpLm9yZy9yZWNvbW1lbmRhdGlvbnMvI3VybHMgZm9yIGRldGFpbHMuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcmVzb3VyY2UocmVzb3VyY2VOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IFJlc291cmNlT3B0aW9ucyA9IHt9KTogdm9pZCB7XG4gICAgbGV0IHBsdXJhbCA9IHBsdXJhbGl6ZShyZXNvdXJjZU5hbWUpO1xuICAgIGxldCBjb2xsZWN0aW9uID0gYC8keyBwbHVyYWwgfWA7XG4gICAgbGV0IHJlc291cmNlID0gYCR7IGNvbGxlY3Rpb24gfS86aWRgO1xuICAgIGxldCByZWxhdGlvbnNoaXAgPSBgJHsgcmVzb3VyY2UgfS9yZWxhdGlvbnNoaXBzLzpyZWxhdGlvbmA7XG4gICAgbGV0IHJlbGF0ZWQgPSBgJHsgcmVzb3VyY2UgfS86cmVsYXRpb25gO1xuXG4gICAgaWYgKCFvcHRpb25zLnJlbGF0ZWQpIHtcbiAgICAgIG9wdGlvbnMuZXhjZXB0ID0gWyAncmVsYXRlZCcsICdmZXRjaC1yZWxhdGVkJywgJ3JlcGxhY2UtcmVsYXRlZCcsICdhZGQtcmVsYXRlZCcsICdyZW1vdmUtcmVsYXRlZCcgXS5jb25jYXQob3B0aW9ucy5leGNlcHQpO1xuICAgIH1cblxuICAgIGxldCBoYXNXaGl0ZWxpc3QgPSBCb29sZWFuKG9wdGlvbnMub25seSk7XG4gICAgb3B0aW9ucy5vbmx5ID0gZW5zdXJlQXJyYXkob3B0aW9ucy5vbmx5KTtcbiAgICBvcHRpb25zLmV4Y2VwdCA9IGVuc3VyZUFycmF5KG9wdGlvbnMuZXhjZXB0KTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBnaXZlbiBhY3Rpb24gc2hvdWxkIGJlIGdlbmVyYXRlZCBiYXNlZCBvbiB0aGUgd2hpdGVsaXN0L2JsYWNrbGlzdCBvcHRpb25zXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5jbHVkZShhY3Rpb246IHN0cmluZykge1xuICAgICAgbGV0IHdoaXRlbGlzdGVkID0gb3B0aW9ucy5vbmx5LmluY2x1ZGVzKGFjdGlvbik7XG4gICAgICBsZXQgYmxhY2tsaXN0ZWQgPSBvcHRpb25zLmV4Y2VwdC5pbmNsdWRlcyhhY3Rpb24pO1xuICAgICAgcmV0dXJuICFibGFja2xpc3RlZCAmJiAoXG4gICAgICAgIChoYXNXaGl0ZWxpc3QgJiYgd2hpdGVsaXN0ZWQpIHx8XG4gICAgICAgICFoYXNXaGl0ZWxpc3RcbiAgICAgICk7XG4gICAgfVxuXG4gICAgW1xuICAgICAgWyAnbGlzdCcsICdnZXQnLCBjb2xsZWN0aW9uIF0sXG4gICAgICBbICdjcmVhdGUnLCAncG9zdCcsIGNvbGxlY3Rpb24gXSxcbiAgICAgIFsgJ3Nob3cnLCAnZ2V0JywgcmVzb3VyY2UgXSxcbiAgICAgIFsgJ3VwZGF0ZScsICdwYXRjaCcsIHJlc291cmNlIF0sXG4gICAgICBbICdkZXN0cm95JywgJ2RlbGV0ZScsIHJlc291cmNlIF0sXG4gICAgICBbICdyZWxhdGVkJywgJ2dldCcsIHJlbGF0ZWQgXSxcbiAgICAgIFsgJ2ZldGNoLXJlbGF0ZWQnLCAnZ2V0JywgcmVsYXRpb25zaGlwIF0sXG4gICAgICBbICdyZXBsYWNlLXJlbGF0ZWQnLCAncGF0Y2gnLCByZWxhdGlvbnNoaXAgXSxcbiAgICAgIFsgJ2FkZC1yZWxhdGVkJywgJ3Bvc3QnLCByZWxhdGlvbnNoaXAgXSxcbiAgICAgIFsgJ3JlbW92ZS1yZWxhdGVkJywgJ2RlbGV0ZScsIHJlbGF0aW9uc2hpcCBdXG4gICAgXS5mb3JFYWNoKChyb3V0ZVRlbXBsYXRlOiBbIHN0cmluZywgTWV0aG9kLCBzdHJpbmcgXSkgPT4ge1xuICAgICAgbGV0IFsgYWN0aW9uLCBtZXRob2QsIHVybCBdID0gcm91dGVUZW1wbGF0ZTtcbiAgICAgIGlmIChpbmNsdWRlKGFjdGlvbikpIHtcbiAgICAgICAgbGV0IHJvdXRlTWV0aG9kID0gPCh1cmw6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpID0+IHZvaWQ+dGhpc1ttZXRob2RdO1xuICAgICAgICByb3V0ZU1ldGhvZC5jYWxsKHRoaXMsIHVybCwgYCR7IHBsdXJhbCB9LyR7IGFjdGlvbiB9YCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBbbWV0aG9kTmFtZTogc3RyaW5nXTogYW55O1xuXG4gIC8qKlxuICAgKiBFbmFibGVzIGVhc3kgcm91dGUgbmFtZXNwYWNpbmcuIFlvdSBjYW4gc3VwcGx5IGEgbWV0aG9kIHdoaWNoIHRha2VzIGEgc2luZ2xlIGFyZ3VtZW50IHRoYXRcbiAgICogd29ya3MganVzdCBsaWtlIHRoZSBgcm91dGVyYCBhcmd1bWVudCBpbiB5b3VyIGBjb25maWcvcm91dGVzLmpzYCwgb3IgeW91IGNhbiB1c2UgdGhlIHJldHVyblxuICAgKiB2YWx1ZSBqdXN0IGxpa2UgdGhlIHJvdXRlci5cbiAgICpcbiAgICogICByb3V0ZXIubmFtZXNwYWNlKCd1c2VycycsIChuYW1lc3BhY2UpID0+IHtcbiAgICogICAgIG5hbWVzcGFjZS5nZXQoJ3NpZ24taW4nKTtcbiAgICogICB9KTtcbiAgICogICAvLyBvciAuLi5cbiAgICogICBsZXQgbmFtZXNwYWNlID0gcm91dGVyLm5hbWVzcGFjZSgndXNlcnMnKTtcbiAgICogICBuYW1lc3BhY2UuZ2V0KCdzaWduLWluJyk7XG4gICAqL1xuICBuYW1lc3BhY2UobmFtZXNwYWNlOiBzdHJpbmcsIGZuOiAod3JhcHBlcjogUm91dGVyRFNMKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgbGV0IHJvdXRlciA9IHRoaXM7XG4gICAgaWYgKG5hbWVzcGFjZS5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBuYW1lc3BhY2UgPSBuYW1lc3BhY2Uuc2xpY2UoMCwgbmFtZXNwYWNlLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jc1xuICAgIGxldCB3cmFwcGVyOiBSb3V0ZXJEU0wgPSB7XG4gICAgICBnZXQocGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoLCBwYXJhbXMpIHtcbiAgICAgICAgcm91dGVyLnJvdXRlKCdnZXQnLCBgJHsgbmFtZXNwYWNlIH0vJHsgcGF0dGVybi5yZXBsYWNlKC9eXFwvLywgJycpIH1gLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICAgICAgfSxcbiAgICAgIHBvc3QocGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoLCBwYXJhbXMpIHtcbiAgICAgICAgcm91dGVyLnJvdXRlKCdwb3N0JywgYCR7IG5hbWVzcGFjZSB9LyR7IHBhdHRlcm4ucmVwbGFjZSgvXlxcLy8sICcnKSB9YCwgYWN0aW9uUGF0aCwgcGFyYW1zKTtcbiAgICAgIH0sXG4gICAgICBwdXQocGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoLCBwYXJhbXMpIHtcbiAgICAgICAgcm91dGVyLnJvdXRlKCdwdXQnLCBgJHsgbmFtZXNwYWNlIH0vJHsgcGF0dGVybi5yZXBsYWNlKC9eXFwvLywgJycpIH1gLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICAgICAgfSxcbiAgICAgIHBhdGNoKHBhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aCwgcGFyYW1zKSB7XG4gICAgICAgIHJvdXRlci5yb3V0ZSgncGF0Y2gnLCBgJHsgbmFtZXNwYWNlIH0vJHsgcGF0dGVybi5yZXBsYWNlKC9eXFwvLywgJycpIH1gLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICAgICAgfSxcbiAgICAgIGRlbGV0ZShwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGgsIHBhcmFtcykge1xuICAgICAgICByb3V0ZXIucm91dGUoJ2RlbGV0ZScsIGAkeyBuYW1lc3BhY2UgfS8keyBwYXR0ZXJuLnJlcGxhY2UoL15cXC8vLCAnJykgfWAsIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gICAgICB9LFxuICAgICAgaGVhZChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGgsIHBhcmFtcykge1xuICAgICAgICByb3V0ZXIucm91dGUoJ2hlYWQnLCBgJHsgbmFtZXNwYWNlIH0vJHsgcGF0dGVybi5yZXBsYWNlKC9eXFwvLywgJycpIH1gLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICAgICAgfSxcbiAgICAgIG9wdGlvbnMocGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoLCBwYXJhbXMpIHtcbiAgICAgICAgcm91dGVyLnJvdXRlKCdvcHRpb25zJywgYCR7IG5hbWVzcGFjZSB9LyR7IHBhdHRlcm4ucmVwbGFjZSgvXlxcLy8sICcnKSB9YCwgYWN0aW9uUGF0aCwgcGFyYW1zKTtcbiAgICAgIH0sXG4gICAgICByZXNvdXJjZShyZXNvdXJjZU5hbWU6IHN0cmluZywgb3B0aW9uczogUmVzb3VyY2VPcHRpb25zKSB7XG4gICAgICAgIHJvdXRlci5yZXNvdXJjZS5jYWxsKHRoaXMsIHJlc291cmNlTmFtZSwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfTtcbiAgICAvLyB0c2xpbnQ6ZW5hYmxlOmNvbXBsZXRlZC1kb2NzXG4gICAgaWYgKGZuKSB7XG4gICAgICBmbih3cmFwcGVyKTtcbiAgICB9XG4gIH1cblxufVxuIl19