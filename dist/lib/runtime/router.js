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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvcnVudGltZS9yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBRTdCLDJDQUF1QztBQUN2Qyx1Q0FBb0M7QUFDcEMscUNBQXFDO0FBQ3JDLHFDQUE4QjtBQUM5QixtQ0FBNEI7QUFDNUIsdUNBQTRDO0FBQzVDLHNDQUF1QztBQUN2Qyw0Q0FBMkM7QUFHM0MsbUNBR2lCO0FBRWpCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQVcxQyxDQUFDO0FBb0NGOzs7Ozs7O0dBT0c7QUFDSCxZQUE0QixTQUFRLGdCQUFZO0lBQWhEOztRQUVFOztXQUVHO1FBQ0gsV0FBTSxHQUFnQjtZQUNwQixHQUFHLEVBQUUsRUFBRTtZQUNQLElBQUksRUFBRSxFQUFFO1lBQ1IsR0FBRyxFQUFFLEVBQUU7WUFDUCxLQUFLLEVBQUUsRUFBRTtZQUNULE1BQU0sRUFBRSxFQUFFO1lBQ1YsSUFBSSxFQUFFLEVBQUU7WUFDUixPQUFPLEVBQUUsRUFBRTtTQUNaLENBQUM7UUFFRjs7O1dBR0c7UUFDSyxlQUFVLEdBQW9CLElBQUssRUFBRSxDQUFDO0lBbVVoRCxDQUFDO0lBNVRDOzs7OztPQUtHO0lBQ0gsR0FBRyxDQUFDLEVBQTRCO1FBQzlCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRDs7OztPQUlHO0lBQ0csTUFBTSxDQUFDLEdBQW9CLEVBQUUsR0FBbUI7O1lBQ3BELElBQUksT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUM7Z0JBRUgsS0FBSyxDQUFDLElBQUssT0FBTyxDQUFDLEVBQUcsTUFBTyxPQUFPLENBQUMsTUFB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QyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1AsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7Q0FFRjtBQXRWRCx5QkFzVkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3YXJlIGZyb20gJ3dhcmUnO1xuaW1wb3J0IHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IHsgcGx1cmFsaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5pbXBvcnQgeyBmcm9tTm9kZSB9IGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCAqIGFzIGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBFcnJvcnMgZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IFJvdXRlIGZyb20gJy4vcm91dGUnO1xuaW1wb3J0IFJlcXVlc3QsIHsgTWV0aG9kIH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCBlbnN1cmVBcnJheSA9IHJlcXVpcmUoJ2FycmlmeScpO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuLi9tZXRhbC9jb250YWluZXInO1xuaW1wb3J0IEFjdGlvbiBmcm9tICcuL2FjdGlvbic7XG5pbXBvcnQge1xuICBmaW5kLFxuICBmb3JFYWNoXG4gfSBmcm9tICdsb2Rhc2gnO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZW5hbGk6cm91dGVyJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGVzQ2FjaGUge1xuICBnZXQ6IFJvdXRlW107XG4gIHBvc3Q6IFJvdXRlW107XG4gIHB1dDogUm91dGVbXTtcbiAgcGF0Y2g6IFJvdXRlW107XG4gIGRlbGV0ZTogUm91dGVbXTtcbiAgaGVhZDogUm91dGVbXTtcbiAgb3B0aW9uczogUm91dGVbXTtcbiAgW21ldGhvZDogc3RyaW5nXTogUm91dGVbXTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWlkZGxld2FyZUZuIHtcbiAgKHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlLCBuZXh0OiBGdW5jdGlvbik6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb3VyY2VPcHRpb25zIHtcbiAgLyoqXG4gICAqIFNob3VsZCByb3V0ZXMgZm9yIHJlbGF0ZWQgcmVzb3VyY2VzIGJlIGdlbmVyYXRlZD8gSWYgdHJ1ZSwgcm91dGVzIHdpbGwgYmUgZ2VuZXJhdGVkIGZvbGxvd2luZ1xuICAgKiB0aGUgSlNPTi1BUEkgcmVjb21tZW5kYXRpb25zIGZvciByZWxhdGlvbnNoaXAgVVJMcy5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgaHR0cDovL2pzb25hcGkub3JnL3JlY29tbWVuZGF0aW9ucy8jdXJscy1yZWxhdGlvbnNoaXBzfEpTT04tQVBJIFVSTFxuICAgKiBSZWNvbW1lbmRhdGlvc259XG4gICAqL1xuICByZWxhdGVkPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEEgbGlzdCBvZiBhY3Rpb24gdHlwZXMgdG8gX25vdF8gZ2VuZXJhdGUuXG4gICAqL1xuICBleGNlcHQ/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIEEgbGlzdCBvZiBhY3Rpb24gdHlwZXMgdGhhdCBzaG91bGQgYmUgdGhlIF9vbmx5XyBvbmVzIGdlbmVyYXRlZC5cbiAgICovXG4gIG9ubHk/OiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSb3V0ZXJEU0wge1xuICBnZXQocGF0dGVybjogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgcGFyYW1zPzoge30pOiB2b2lkO1xuICBwb3N0KHBhdHRlcm46IHN0cmluZywgYWN0aW9uOiBzdHJpbmcsIHBhcmFtcz86IHt9KTogdm9pZDtcbiAgcHV0KHBhdHRlcm46IHN0cmluZywgYWN0aW9uOiBzdHJpbmcsIHBhcmFtcz86IHt9KTogdm9pZDtcbiAgcGF0Y2gocGF0dGVybjogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgcGFyYW1zPzoge30pOiB2b2lkO1xuICBkZWxldGUocGF0dGVybjogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgcGFyYW1zPzoge30pOiB2b2lkO1xuICBoZWFkKHBhdHRlcm46IHN0cmluZywgYWN0aW9uOiBzdHJpbmcsIHBhcmFtcz86IHt9KTogdm9pZDtcbiAgb3B0aW9ucyhwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IHZvaWQ7XG4gIHJlc291cmNlKHJlc291cmNlTmFtZTogc3RyaW5nLCBvcHRpb25zPzogUmVzb3VyY2VPcHRpb25zKTogdm9pZDtcbn1cblxuLyoqXG4gKiBUaGUgUm91dGVyIGhhbmRsZXMgaW5jb21pbmcgcmVxdWVzdHMsIHNlbmRpbmcgdGhlbSB0byB0aGUgYXBwcm9wcmlhdGUgYWN0aW9uLiBJdCdzIGFsc29cbiAqIHJlc3BvbnNpYmxlIGZvciBkZWZpbmluZyByb3V0ZXMgaW4gdGhlIGZpcnN0IHBsYWNlIC0gaXQncyBwYXNzZWQgaW50byB0aGUgYGNvbmZpZy9yb3V0ZXMuanNgXG4gKiBmaWxlJ3MgZXhwb3J0ZWQgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICpcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb3V0ZXIgZXh0ZW5kcyBEZW5hbGlPYmplY3QgaW1wbGVtZW50cyBSb3V0ZXJEU0wge1xuXG4gIC8qKlxuICAgKiBUaGUgY2FjaGUgb2YgYXZhaWxhYmxlIHJvdXRlcy5cbiAgICovXG4gIHJvdXRlczogUm91dGVzQ2FjaGUgPSB7XG4gICAgZ2V0OiBbXSxcbiAgICBwb3N0OiBbXSxcbiAgICBwdXQ6IFtdLFxuICAgIHBhdGNoOiBbXSxcbiAgICBkZWxldGU6IFtdLFxuICAgIGhlYWQ6IFtdLFxuICAgIG9wdGlvbnM6IFtdXG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRlcm5hbCBnZW5lcmljIG1pZGRsZXdhcmUgaGFuZGxlciwgcmVzcG9uc2libGUgZm9yIGJ1aWxkaW5nIGFuZCBleGVjdXRpbmcgdGhlIG1pZGRsZXdhcmVcbiAgICogY2hhaW4uXG4gICAqL1xuICBwcml2YXRlIG1pZGRsZXdhcmU6IGFueSA9ICg8KCkgPT4gYW55PndhcmUpKCk7XG5cbiAgLyoqXG4gICAqIFRoZSBhcHBsaWNhdGlvbiBjb250YWluZXJcbiAgICovXG4gIGNvbnRhaW5lcjogQ29udGFpbmVyO1xuXG4gIC8qKlxuICAgKiBIZWxwZXIgbWV0aG9kIHRvIGludm9rZSB0aGUgZnVuY3Rpb24gZXhwb3J0ZWQgYnkgYGNvbmZpZy9yb3V0ZXMuanNgIGluIHRoZSBjb250ZXh0IG9mIHRoZVxuICAgKiBjdXJyZW50IHJvdXRlciBpbnN0YW5jZS5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBtYXAoZm46IChyb3V0ZXI6IFJvdXRlcikgPT4gdm9pZCk6IHZvaWQge1xuICAgIGRlYnVnKCdtYXBwaW5nIHJvdXRlcycpO1xuICAgIGZuKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGFuIGluY29taW5nIHJlcXVlc3QgYW5kIGl0J3MgcmVzcG9uc2UgZnJvbSBhbiBIVFRQIHNlcnZlciwgcHJlcGFyZXMgdGhlbSwgcnVucyB0aGVcbiAgICogZ2VuZXJpYyBtaWRkbGV3YXJlIGZpcnN0LCBoYW5kcyB0aGVtIG9mZiB0byB0aGUgYXBwcm9wcmlhdGUgYWN0aW9uIGdpdmVuIHRoZSBpbmNvbWluZyBVUkwsIGFuZFxuICAgKiBmaW5hbGx5IHJlbmRlcnMgdGhlIHJlc3BvbnNlLlxuICAgKi9cbiAgYXN5bmMgaGFuZGxlKHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHJlcXVlc3QgPSBuZXcgUmVxdWVzdChyZXEpO1xuICAgIHRyeSB7XG5cbiAgICAgIGRlYnVnKGBbJHsgcmVxdWVzdC5pZCB9XTogJHsgcmVxdWVzdC5tZXRob2QudG9VcHBlckNhc2UoKSB9ICR7IHJlcXVlc3QucGF0aCB9YCk7XG5cbiAgICAgIC8vIE1pZGRsZXdhcmVcbiAgICAgIGF3YWl0IGZyb21Ob2RlKChjYikgPT4gdGhpcy5taWRkbGV3YXJlLnJ1bihyZXF1ZXN0LCByZXMsIGNiKSk7XG5cbiAgICAgIC8vIEZpbmQgdGhlIG1hdGNoaW5nIHJvdXRlXG4gICAgICBkZWJ1ZyhgWyR7IHJlcXVlc3QuaWQgfV06IHJvdXRpbmcgcmVxdWVzdGApO1xuICAgICAgbGV0IHJvdXRlcyA9IHRoaXMucm91dGVzW3JlcXVlc3QubWV0aG9kXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHJlcXVlc3QucGFyYW1zID0gcm91dGVzW2ldLm1hdGNoKHJlcXVlc3QucGF0aCk7XG4gICAgICAgIGlmIChyZXF1ZXN0LnBhcmFtcykge1xuICAgICAgICAgIHJlcXVlc3Qucm91dGUgPSByb3V0ZXNbaV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEhhbmRsZSA0MDRzXG4gICAgICBpZiAoIXJlcXVlc3Qucm91dGUpIHtcbiAgICAgICAgZGVidWcoYFskeyByZXF1ZXN0LmlkIH1dOiAkeyByZXF1ZXN0Lm1ldGhvZCB9ICR7IHJlcXVlc3QucGF0aCB9IGRpZCBtYXRjaCBhbnkgcm91dGUuIEF2YWlsYWJsZSAkeyByZXF1ZXN0Lm1ldGhvZCB9IHJvdXRlczpcXG4keyByb3V0ZXMubWFwKChyKSA9PiByLnNwZWMpLmpvaW4oJyxcXG4nKSB9YCk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcnMuTm90Rm91bmQoJ1JvdXRlIG5vdCByZWNvZ25pemVkJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBvdXIgYWN0aW9uIHRvIGhhbmRsZSB0aGUgcmVzcG9uc2VcbiAgICAgIGxldCBhY3Rpb246IEFjdGlvbiA9IHJlcXVlc3Qucm91dGUuYWN0aW9uLmNyZWF0ZSgpO1xuXG4gICAgICAvLyBSdW4gdGhlIGFjdGlvblxuICAgICAgZGVidWcoYFskeyByZXF1ZXN0LmlkIH1dOiBydW5uaW5nIGFjdGlvbmApO1xuICAgICAgYXdhaXQgYWN0aW9uLnJ1bihyZXF1ZXN0LCByZXMpO1xuXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlRXJyb3IocmVxdWVzdCwgcmVzLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgcmVxdWVzdCwgcmVzcG9uc2UsIGFuZCBhbiBlcnJvciBhbmQgaGFuZHMgb2ZmIHRvIHRoZSBnZW5lcmljIGFwcGxpY2F0aW9uIGxldmVsIGVycm9yXG4gICAqIGFjdGlvbi5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlRXJyb3IocmVxdWVzdDogUmVxdWVzdCwgcmVzOiBTZXJ2ZXJSZXNwb25zZSwgZXJyb3I6IEVycm9yKSB7XG4gICAgcmVxdWVzdC5wYXJhbXMgPSByZXF1ZXN0LnBhcmFtcyB8fCB7fTtcbiAgICByZXF1ZXN0LnBhcmFtcy5lcnJvciA9IGVycm9yO1xuICAgIGxldCBlcnJvckFjdGlvbiA9IHRoaXMuY29udGFpbmVyLmxvb2t1cCgnYWN0aW9uOmVycm9yJyk7XG4gICAgcmV0dXJuIGVycm9yQWN0aW9uLnJ1bihyZXF1ZXN0LCByZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgc3VwcGxpZWQgbWlkZGxld2FyZSBmdW5jdGlvbiB0byB0aGUgZ2VuZXJpYyBtaWRkbGV3YXJlIHN0YWNrIHRoYXQgcnVucyBwcmlvciB0byBhY3Rpb25cbiAgICogaGFuZGxpbmcuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgdXNlKG1pZGRsZXdhcmU6IE1pZGRsZXdhcmVGbik6IHZvaWQge1xuICAgIHRoaXMubWlkZGxld2FyZS51c2UobWlkZGxld2FyZSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgcm91dGUgdG8gdGhlIGFwcGxpY2F0aW9uLiBNYXBzIGEgbWV0aG9kIGFuZCBVUkwgcGF0dGVybiB0byBhbiBhY3Rpb24sIHdpdGggb3B0aW9uYWxcbiAgICogYWRkaXRpb25hbCBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBVUkwgcGF0dGVybnMgY2FuIHVzZTpcbiAgICpcbiAgICogKiBEeW5hbWljIHNlZ21lbnRzLCBpLmUuIGAnZm9vLzpiYXInYCAqIFdpbGRjYXJkIHNlZ21lbnRzLCBpLmUuIGAnZm9vLypiYXInYCwgY2FwdHVyZXMgdGhlIHJlc3RcbiAgICogb2YgdGhlIFVSTCB1cFxuICAgKiAgICB0byB0aGUgcXVlcnlzdHJpbmdcbiAgICogKiBPcHRpb25hbCBncm91cHMsIGkuZS4gYCdmb28oLzpiYXIpJ2BcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICByb3V0ZShtZXRob2Q6IE1ldGhvZCwgcmF3UGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoOiBzdHJpbmcsIHBhcmFtcz86IGFueSkge1xuICAgIC8vIEVuc3VyZSBsZWFkaW5nIHNsYXNoZXNcbiAgICBsZXQgbm9ybWFsaXplZFBhdHRlcm4gPSByYXdQYXR0ZXJuLnJlcGxhY2UoL14oW14vXSkvLCAnLyQxJyk7XG4gICAgLy8gUmVtb3ZlIGhhcmRjb2RlZCB0cmFpbGluZyBzbGFzaGVzXG4gICAgbm9ybWFsaXplZFBhdHRlcm4gPSBub3JtYWxpemVkUGF0dGVybi5yZXBsYWNlKC9cXC8kLywgJycpO1xuICAgIC8vIEVuc3VyZSBvcHRpb25hbCB0cmFpbGluZyBzbGFzaGVzXG4gICAgbm9ybWFsaXplZFBhdHRlcm4gPSBgJHsgbm9ybWFsaXplZFBhdHRlcm4gfSgvKWA7XG4gICAgLy8gQWRkIHJvdXRlXG4gICAgbGV0IEFjdGlvbkNsYXNzID0gdGhpcy5jb250YWluZXIuZmFjdG9yeUZvcjxBY3Rpb24+KGBhY3Rpb246JHsgYWN0aW9uUGF0aCB9YCk7XG4gICAgbGV0IHJvdXRlID0gbmV3IFJvdXRlKG5vcm1hbGl6ZWRQYXR0ZXJuKTtcbiAgICByb3V0ZS5hY3Rpb25QYXRoID0gYWN0aW9uUGF0aDtcbiAgICByb3V0ZS5hY3Rpb24gPSBBY3Rpb25DbGFzcztcbiAgICByb3V0ZS5hZGRpdGlvbmFsUGFyYW1zID0gcGFyYW1zO1xuICAgIGlmICghcm91dGUuYWN0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGFjdGlvbiBmb3VuZCBhdCAkeyBhY3Rpb25QYXRoIH1gKTtcbiAgICB9XG4gICAgdGhpcy5yb3V0ZXNbbWV0aG9kXS5wdXNoKHJvdXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBVUkwgZm9yIGEgZ2l2ZW4gYWN0aW9uLiBZb3UgY2FuIHN1cHBseSBhIHBhcmFtcyBvYmplY3Qgd2hpY2hcbiAgICogd2lsbCBiZSB1c2VkIHRvIGZpbGwgaW4gdGhlIGR5bmFtaWMgc2VnZW1lbnRzIG9mIHRoZSBhY3Rpb24ncyByb3V0ZSAoaWZcbiAgICogYW55KS5cbiAgICovXG4gIHVybEZvcihhY3Rpb25QYXRoOiBzdHJpbmcsIGRhdGE6IGFueSk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgIGxldCBhY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5mYWN0b3J5Rm9yPEFjdGlvbj4oYGFjdGlvbjokeyBhY3Rpb25QYXRoIH1gKTtcbiAgICBpZiAoIWFjdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCByb3V0ZTogUm91dGU7XG4gICAgZm9yRWFjaCh0aGlzLnJvdXRlcywgKHJvdXRlcykgPT4ge1xuICAgICAgcm91dGUgPSBmaW5kKHJvdXRlcywgeyBhY3Rpb24gfSk7XG4gICAgICByZXR1cm4gIXJvdXRlOyAvLyBraWxsIHRoZSBpdGVyYXRvciBpZiB3ZSBmb3VuZCB0aGUgbWF0Y2hcbiAgICB9KTtcblxuICAgIHJldHVybiByb3V0ZSAmJiByb3V0ZS5yZXZlcnNlKGRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCBmb3IgYHRoaXMucm91dGUoJ2dldCcsIC4uLmFyZ3VtZW50cylgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0KHJhd1BhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aDogc3RyaW5nLCBwYXJhbXM/OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnJvdXRlKCdnZXQnLCByYXdQYXR0ZXJuLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCBmb3IgYHRoaXMucm91dGUoJ3Bvc3QnLCAuLi5hcmd1bWVudHMpYFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHBvc3QocmF3UGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoOiBzdHJpbmcsIHBhcmFtcz86IGFueSk6IHZvaWQge1xuICAgIHRoaXMucm91dGUoJ3Bvc3QnLCByYXdQYXR0ZXJuLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCBmb3IgYHRoaXMucm91dGUoJ3B1dCcsIC4uLmFyZ3VtZW50cylgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHV0KHJhd1BhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aDogc3RyaW5nLCBwYXJhbXM/OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnJvdXRlKCdwdXQnLCByYXdQYXR0ZXJuLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCBmb3IgYHRoaXMucm91dGUoJ3BhdGNoJywgLi4uYXJndW1lbnRzKWBcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwYXRjaChyYXdQYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGg6IHN0cmluZywgcGFyYW1zPzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5yb3V0ZSgncGF0Y2gnLCByYXdQYXR0ZXJuLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCBmb3IgYHRoaXMucm91dGUoJ2RlbGV0ZScsIC4uLmFyZ3VtZW50cylgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZGVsZXRlKHJhd1BhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aDogc3RyaW5nLCBwYXJhbXM/OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnJvdXRlKCdkZWxldGUnLCByYXdQYXR0ZXJuLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCBmb3IgYHRoaXMucm91dGUoJ2hlYWQnLCAuLi5hcmd1bWVudHMpYFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGhlYWQocmF3UGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoOiBzdHJpbmcsIHBhcmFtcz86IGFueSk6IHZvaWQge1xuICAgIHRoaXMucm91dGUoJ2hlYWQnLCByYXdQYXR0ZXJuLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCBmb3IgYHRoaXMucm91dGUoJ29wdGlvbnMnLCAuLi5hcmd1bWVudHMpYFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIG9wdGlvbnMocmF3UGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoOiBzdHJpbmcsIHBhcmFtcz86IGFueSk6IHZvaWQge1xuICAgIHRoaXMucm91dGUoJ29wdGlvbnMnLCByYXdQYXR0ZXJuLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbGwgdGhlIENSVUQgcm91dGVzIGZvciBhIGdpdmVuIHJlc291cmNlIGFuZCBpdCdzIHJlbGF0aW9uc2hpcHMuIEJhc2VkIG9uIHRoZSBKU09OLUFQSVxuICAgKiByZWNvbW1lbmRhdGlvbnMgZm9yIFVSTCBkZXNpZ24uXG4gICAqXG4gICAqIFRoZSBgb3B0aW9uc2AgYXJndW1lbnQgbGV0cyB5b3UgcGFzcyBpbiBgb25seWAgb3IgYGV4Y2VwdGAgYXJyYXlzIHRvIGRlZmluZSBleGNlcHRpb25zLiBBY3Rpb25cbiAgICogbmFtZXMgaW5jbHVkZWQgaW4gYG9ubHlgIHdpbGwgYmUgdGhlIG9ubHkgb25lcyBnZW5lcmF0ZWQsIHdoaWxlIG5hbWVzIGluY2x1ZGVkIGluIGBleGNlcHRgIHdpbGxcbiAgICogYmUgb21pdHRlZC5cbiAgICpcbiAgICogU2V0IGBvcHRpb25zLnJlbGF0ZWQgPSBmYWxzZWAgdG8gZGlzYWJsZSByZWxhdGlvbnNoaXAgcm91dGVzLlxuICAgKlxuICAgKiBJZiBubyBvcHRpb25zIGFyZSBzdXBwbGllZCwgdGhlIGZvbGxvd2luZyByb3V0ZXMgYXJlIGdlbmVyYXRlZCAoYXNzdW1pbmcgYSAnYm9va3MnIHJlc291cmNlIGFzXG4gICAqIGFuIGV4YW1wbGUpOlxuICAgKlxuICAgKiAgICogYEdFVCAvYm9va3NgXG4gICAqICAgKiBgUE9TVCAvYm9va3NgXG4gICAqICAgKiBgR0VUIC9ib29rcy86aWRgXG4gICAqICAgKiBgUEFUQ0ggL2Jvb2tzLzppZGBcbiAgICogICAqIGBERUxFVEUgL2Jvb2tzLzppZGBcbiAgICogICAqIGBHRVQgL2Jvb2tzLzppZC86cmVsYXRpb25gXG4gICAqICAgKiBgR0VUIC9ib29rcy86aWQvcmVsYXRpb25zaGlwcy86cmVsYXRpb25gXG4gICAqICAgKiBgUEFUQ0ggL2Jvb2tzLzppZC9yZWxhdGlvbnNoaXBzLzpyZWxhdGlvbmBcbiAgICogICAqIGBQT1NUIC9ib29rcy86aWQvcmVsYXRpb25zaGlwcy86cmVsYXRpb25gXG4gICAqICAgKiBgREVMRVRFIC9ib29rcy86aWQvcmVsYXRpb25zaGlwcy86cmVsYXRpb25gXG4gICAqXG4gICAqIFNlZSBodHRwOi8vanNvbmFwaS5vcmcvcmVjb21tZW5kYXRpb25zLyN1cmxzIGZvciBkZXRhaWxzLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHJlc291cmNlKHJlc291cmNlTmFtZTogc3RyaW5nLCBvcHRpb25zOiBSZXNvdXJjZU9wdGlvbnMgPSB7fSk6IHZvaWQge1xuICAgIGxldCBwbHVyYWwgPSBwbHVyYWxpemUocmVzb3VyY2VOYW1lKTtcbiAgICBsZXQgY29sbGVjdGlvbiA9IGAvJHsgcGx1cmFsIH1gO1xuICAgIGxldCByZXNvdXJjZSA9IGAkeyBjb2xsZWN0aW9uIH0vOmlkYDtcbiAgICBsZXQgcmVsYXRpb25zaGlwID0gYCR7IHJlc291cmNlIH0vcmVsYXRpb25zaGlwcy86cmVsYXRpb25gO1xuICAgIGxldCByZWxhdGVkID0gYCR7IHJlc291cmNlIH0vOnJlbGF0aW9uYDtcblxuICAgIGlmICghb3B0aW9ucy5yZWxhdGVkKSB7XG4gICAgICBvcHRpb25zLmV4Y2VwdCA9IFsgJ3JlbGF0ZWQnLCAnZmV0Y2gtcmVsYXRlZCcsICdyZXBsYWNlLXJlbGF0ZWQnLCAnYWRkLXJlbGF0ZWQnLCAncmVtb3ZlLXJlbGF0ZWQnIF0uY29uY2F0KG9wdGlvbnMuZXhjZXB0KTtcbiAgICB9XG5cbiAgICBsZXQgaGFzV2hpdGVsaXN0ID0gQm9vbGVhbihvcHRpb25zLm9ubHkpO1xuICAgIG9wdGlvbnMub25seSA9IGVuc3VyZUFycmF5KG9wdGlvbnMub25seSk7XG4gICAgb3B0aW9ucy5leGNlcHQgPSBlbnN1cmVBcnJheShvcHRpb25zLmV4Y2VwdCk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgZ2l2ZW4gYWN0aW9uIHNob3VsZCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIHdoaXRlbGlzdC9ibGFja2xpc3Qgb3B0aW9uc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGluY2x1ZGUoYWN0aW9uOiBzdHJpbmcpIHtcbiAgICAgIGxldCB3aGl0ZWxpc3RlZCA9IG9wdGlvbnMub25seS5pbmNsdWRlcyhhY3Rpb24pO1xuICAgICAgbGV0IGJsYWNrbGlzdGVkID0gb3B0aW9ucy5leGNlcHQuaW5jbHVkZXMoYWN0aW9uKTtcbiAgICAgIHJldHVybiAhYmxhY2tsaXN0ZWQgJiYgKFxuICAgICAgICAoaGFzV2hpdGVsaXN0ICYmIHdoaXRlbGlzdGVkKSB8fFxuICAgICAgICAhaGFzV2hpdGVsaXN0XG4gICAgICApO1xuICAgIH1cblxuICAgIFtcbiAgICAgIFsgJ2xpc3QnLCAnZ2V0JywgY29sbGVjdGlvbiBdLFxuICAgICAgWyAnY3JlYXRlJywgJ3Bvc3QnLCBjb2xsZWN0aW9uIF0sXG4gICAgICBbICdzaG93JywgJ2dldCcsIHJlc291cmNlIF0sXG4gICAgICBbICd1cGRhdGUnLCAncGF0Y2gnLCByZXNvdXJjZSBdLFxuICAgICAgWyAnZGVzdHJveScsICdkZWxldGUnLCByZXNvdXJjZSBdLFxuICAgICAgWyAncmVsYXRlZCcsICdnZXQnLCByZWxhdGVkIF0sXG4gICAgICBbICdmZXRjaC1yZWxhdGVkJywgJ2dldCcsIHJlbGF0aW9uc2hpcCBdLFxuICAgICAgWyAncmVwbGFjZS1yZWxhdGVkJywgJ3BhdGNoJywgcmVsYXRpb25zaGlwIF0sXG4gICAgICBbICdhZGQtcmVsYXRlZCcsICdwb3N0JywgcmVsYXRpb25zaGlwIF0sXG4gICAgICBbICdyZW1vdmUtcmVsYXRlZCcsICdkZWxldGUnLCByZWxhdGlvbnNoaXAgXVxuICAgIF0uZm9yRWFjaCgocm91dGVUZW1wbGF0ZTogWyBzdHJpbmcsIE1ldGhvZCwgc3RyaW5nIF0pID0+IHtcbiAgICAgIGxldCBbIGFjdGlvbiwgbWV0aG9kLCB1cmwgXSA9IHJvdXRlVGVtcGxhdGU7XG4gICAgICBpZiAoaW5jbHVkZShhY3Rpb24pKSB7XG4gICAgICAgIGxldCByb3V0ZU1ldGhvZCA9IDwodXJsOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nKSA9PiB2b2lkPnRoaXNbbWV0aG9kXTtcbiAgICAgICAgcm91dGVNZXRob2QuY2FsbCh0aGlzLCB1cmwsIGAkeyBwbHVyYWwgfS8keyBhY3Rpb24gfWApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgW21ldGhvZE5hbWU6IHN0cmluZ106IGFueTtcblxuICAvKipcbiAgICogRW5hYmxlcyBlYXN5IHJvdXRlIG5hbWVzcGFjaW5nLiBZb3UgY2FuIHN1cHBseSBhIG1ldGhvZCB3aGljaCB0YWtlcyBhIHNpbmdsZSBhcmd1bWVudCB0aGF0XG4gICAqIHdvcmtzIGp1c3QgbGlrZSB0aGUgYHJvdXRlcmAgYXJndW1lbnQgaW4geW91ciBgY29uZmlnL3JvdXRlcy5qc2AsIG9yIHlvdSBjYW4gdXNlIHRoZSByZXR1cm5cbiAgICogdmFsdWUganVzdCBsaWtlIHRoZSByb3V0ZXIuXG4gICAqXG4gICAqICAgcm91dGVyLm5hbWVzcGFjZSgndXNlcnMnLCAobmFtZXNwYWNlKSA9PiB7XG4gICAqICAgICBuYW1lc3BhY2UuZ2V0KCdzaWduLWluJyk7XG4gICAqICAgfSk7XG4gICAqICAgLy8gb3IgLi4uXG4gICAqICAgbGV0IG5hbWVzcGFjZSA9IHJvdXRlci5uYW1lc3BhY2UoJ3VzZXJzJyk7XG4gICAqICAgbmFtZXNwYWNlLmdldCgnc2lnbi1pbicpO1xuICAgKi9cbiAgbmFtZXNwYWNlKG5hbWVzcGFjZTogc3RyaW5nLCBmbjogKHdyYXBwZXI6IFJvdXRlckRTTCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGxldCByb3V0ZXIgPSB0aGlzO1xuICAgIGlmIChuYW1lc3BhY2UuZW5kc1dpdGgoJy8nKSkge1xuICAgICAgbmFtZXNwYWNlID0gbmFtZXNwYWNlLnNsaWNlKDAsIG5hbWVzcGFjZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgLy8gdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3NcbiAgICBsZXQgd3JhcHBlcjogUm91dGVyRFNMID0ge1xuICAgICAgZ2V0KHBhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aCwgcGFyYW1zKSB7XG4gICAgICAgIHJvdXRlci5yb3V0ZSgnZ2V0JywgYCR7IG5hbWVzcGFjZSB9LyR7IHBhdHRlcm4ucmVwbGFjZSgvXlxcLy8sICcnKSB9YCwgYWN0aW9uUGF0aCwgcGFyYW1zKTtcbiAgICAgIH0sXG4gICAgICBwb3N0KHBhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aCwgcGFyYW1zKSB7XG4gICAgICAgIHJvdXRlci5yb3V0ZSgncG9zdCcsIGAkeyBuYW1lc3BhY2UgfS8keyBwYXR0ZXJuLnJlcGxhY2UoL15cXC8vLCAnJykgfWAsIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gICAgICB9LFxuICAgICAgcHV0KHBhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aCwgcGFyYW1zKSB7XG4gICAgICAgIHJvdXRlci5yb3V0ZSgncHV0JywgYCR7IG5hbWVzcGFjZSB9LyR7IHBhdHRlcm4ucmVwbGFjZSgvXlxcLy8sICcnKSB9YCwgYWN0aW9uUGF0aCwgcGFyYW1zKTtcbiAgICAgIH0sXG4gICAgICBwYXRjaChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGgsIHBhcmFtcykge1xuICAgICAgICByb3V0ZXIucm91dGUoJ3BhdGNoJywgYCR7IG5hbWVzcGFjZSB9LyR7IHBhdHRlcm4ucmVwbGFjZSgvXlxcLy8sICcnKSB9YCwgYWN0aW9uUGF0aCwgcGFyYW1zKTtcbiAgICAgIH0sXG4gICAgICBkZWxldGUocGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoLCBwYXJhbXMpIHtcbiAgICAgICAgcm91dGVyLnJvdXRlKCdkZWxldGUnLCBgJHsgbmFtZXNwYWNlIH0vJHsgcGF0dGVybi5yZXBsYWNlKC9eXFwvLywgJycpIH1gLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICAgICAgfSxcbiAgICAgIGhlYWQocGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoLCBwYXJhbXMpIHtcbiAgICAgICAgcm91dGVyLnJvdXRlKCdoZWFkJywgYCR7IG5hbWVzcGFjZSB9LyR7IHBhdHRlcm4ucmVwbGFjZSgvXlxcLy8sICcnKSB9YCwgYWN0aW9uUGF0aCwgcGFyYW1zKTtcbiAgICAgIH0sXG4gICAgICBvcHRpb25zKHBhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aCwgcGFyYW1zKSB7XG4gICAgICAgIHJvdXRlci5yb3V0ZSgnb3B0aW9ucycsIGAkeyBuYW1lc3BhY2UgfS8keyBwYXR0ZXJuLnJlcGxhY2UoL15cXC8vLCAnJykgfWAsIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gICAgICB9LFxuICAgICAgcmVzb3VyY2UocmVzb3VyY2VOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IFJlc291cmNlT3B0aW9ucykge1xuICAgICAgICByb3V0ZXIucmVzb3VyY2UuY2FsbCh0aGlzLCByZXNvdXJjZU5hbWUsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH07XG4gICAgLy8gdHNsaW50OmVuYWJsZTpjb21wbGV0ZWQtZG9jc1xuICAgIGlmIChmbikge1xuICAgICAgZm4od3JhcHBlcik7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==