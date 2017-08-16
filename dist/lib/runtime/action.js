"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const instrumentation_1 = require("../metal/instrumentation");
const model_1 = require("../data/model");
const createDebug = require("debug");
const assert = require("assert");
const each_prototype_1 = require("../metal/each-prototype");
const object_1 = require("../metal/object");
const errors_1 = require("./errors");
const inject_1 = require("../metal/inject");
const debug = createDebug('denali:action');
/**
 * Actions form the core of interacting with a Denali application. They are the controller layer in
 * the MVC architecture, taking in incoming requests, performing business logic, and handing off to
 * the renderer to send the response.
 *
 * When a request comes in, Denali will invoke the `respond` method (or `respondWith__` for content
 * negotiated requests) on the matching Action class. The return value (or resolved return value) of
 * this method is used to render the response.
 *
 * Actions also support filters. Simply define a method on your action, and add the method name to
 * the `before` or `after` array. Filters behave similar to responders in that they receive the
 * request params and can return a promise which will be waited on before continuing. Filters are
 * inheritable, so child classes will run filters added by parent classes.
 *
 * @package runtime
 * @since 0.1.0
 */
class Action extends object_1.default {
    constructor() {
        super(...arguments);
        /**
         * Application config
         */
        this.config = inject_1.default('config:environment');
        /**
         * Force which parser should be used for parsing the incoming request.
         *
         * By default it uses the application parser, but you can override with the name of the parser
         * you'd rather use instead.
         *
         * @since 0.1.0
         */
        this.parser = inject_1.default('parser:application');
        /**
         * Automatically inject the db service into all actions
         *
         * @since 0.1.0
         */
        this.db = inject_1.default('service:db');
        /**
         * Automatically inject the logger into all actions
         *
         * @since 0.1.0
         */
        this.logger = inject_1.default('app:logger');
        /**
         * Track whether or not we have rendered yet
         */
        this.hasRendered = false;
    }
    render(status, body, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (typeof status !== 'number') {
                options = body;
                body = status;
                status = 200;
            }
            if (!options) {
                options = {};
            }
            this.hasRendered = true;
            debug(`[${this.request.id}]: rendering`);
            this.response.setHeader('X-Request-Id', this.request.id);
            debug(`[${this.request.id}]: setting response status code to ${status}`);
            this.response.statusCode = status;
            if (!body) {
                debug(`[${this.request.id}]: no response body to render, response finished`);
                this.response.end();
                return;
            }
            // Render with a custom view if requested
            if (options.view) {
                let view = this.container.lookup(`view:${options.view}`);
                assert(view, `No such view: ${options.view}`);
                debug(`[${this.request.id}]: rendering response body with the ${options.view} view`);
                return yield view.render(this, this.response, body, options);
            }
            // Pick the serializer to use
            let serializerLookup = 'application';
            if (options.serializer) {
                serializerLookup = options.serializer;
            }
            else {
                let sample = lodash_1.isArray(body) ? body[0] : body;
                if (sample instanceof model_1.default) {
                    serializerLookup = sample.type;
                }
            }
            // Render with the serializer
            let serializer = this.container.lookup(`serializer:${serializerLookup}`);
            debug(`[${this.request.id}]: rendering response body with the ${serializerLookup} serializer`);
            return yield serializer.render(this, this.response, body, options);
        });
    }
    /**
     * Invokes the action. Determines the best responder method for content negotiation, then executes
     * the filter/responder chain in sequence, handling errors and rendering the response.
     *
     * You shouldn't invoke this directly - Denali will automatically wire up your routes to this
     * method.
     */
    run(request, response) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.request = request;
            this.response = response;
            // Parse the incoming request based on the action's chosen parser
            debug(`[${request.id}]: parsing request`);
            assert(typeof this.parser.parse === 'function', 'The parser you supply must define a `parse(request)` method. See the parser docs for details');
            let parsedRequest = this.parser.parse(request);
            // Build the before and after filter chains
            let { beforeChain, afterChain } = this._buildFilterChains();
            let instrumentation = instrumentation_1.default.instrument('action.run', {
                action: this.actionPath,
                parsed: parsedRequest
            });
            // Before filters
            debug(`[${this.request.id}]: running before filters`);
            yield this._invokeFilters(beforeChain, parsedRequest);
            // Responder
            if (!this.hasRendered) {
                debug(`[${this.request.id}]: running responder`);
                let result = yield this.respond(parsedRequest);
                // Autorender if render has not been manually called and a value was returned
                if (!this.hasRendered) {
                    debug(`[${this.request.id}]: autorendering`);
                    yield this.render(result);
                }
            }
            // After filters
            debug(`[${this.request.id}]: running after filters`);
            yield this._invokeFilters(afterChain, parsedRequest);
            // If no one has rendered, bail
            if (!this.hasRendered) {
                throw new errors_1.default.InternalServerError(`${this.actionPath} did not render anything`);
            }
            instrumentation.finish();
        });
    }
    /**
     * Invokes the filters in the supplied chain in sequence.
     */
    _invokeFilters(chain, parsedRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            chain = lodash_1.clone(chain);
            while (chain.length > 0) {
                let filterName = chain.shift();
                let filter = this[filterName];
                let instrumentation = instrumentation_1.default.instrument('action.filter', {
                    action: this.actionPath,
                    request: parsedRequest,
                    filter: filterName
                });
                debug(`[${this.request.id}]: running '${filterName}' filter`);
                let filterResult = yield filter.call(this, parsedRequest);
                instrumentation.finish();
                if (!this.hasRendered && filterResult) {
                    return this.render(200, filterResult);
                }
            }
        });
    }
    /**
     * Walk the prototype chain of this Action instance to find all the `before` and `after` arrays to
     * build the complete filter chains.
     *
     * Caches the result on the child Action class to avoid the potentially expensive prototype walk
     * on each request.
     *
     * Throws if it encounters the name of a filter method that doesn't exist.
     */
    _buildFilterChains() {
        let meta = this.container.metaFor(this.constructor);
        if (!meta.beforeFiltersCache) {
            let prototypeChain = [];
            each_prototype_1.default(this.constructor, (prototype) => {
                prototypeChain.push(prototype);
            });
            prototypeChain = prototypeChain.reverse();
            ['before', 'after'].forEach((stage) => {
                let cache = meta[`${stage}FiltersCache`] = [];
                let filterNames = lodash_1.compact(lodash_1.uniq(lodash_1.flatten(lodash_1.map(prototypeChain, stage))));
                filterNames.forEach((filterName) => {
                    if (!this[filterName]) {
                        throw new Error(`${filterName} method not found on the ${this.actionPath} action.`);
                    }
                    cache.push(filterName);
                });
            });
        }
        return {
            beforeChain: meta.beforeFiltersCache,
            afterChain: meta.afterFiltersCache
        };
    }
}
/**
 * Invoked before the `respond()` method. The framework will invoke filters from parent classes
 * and mixins in the same order the mixins were applied.
 *
 * Filters can be synchronous, or return a promise (which will pause the before/respond/after
 * chain until it resolves).
 *
 * If a before filter returns any value (or returns a promise which resolves to any value) other
 * than null or undefined, Denali will attempt to render that response and halt further processing
 * of the request (including remaining before filters).
 *
 * Filters must be defined as static properties to allow Denali to extract the values. Instance
 * fields are not visible until instantiation, so there's no way to build an "accumulated" value
 * from each step in the inheritance chain.
 *
 * @since 0.1.0
 */
Action.before = [];
/**
 * Invoked after the `respond()` method. The framework will invoke filters from parent classes and
 * mixins in the same order the mixins were applied.
 *
 * Filters can be synchronous, or return a promise (which will pause the before/respond/after
 * chain until it resolves).
 *
 * Filters must be defined as static properties to allow Denali to extract the values. Instance
 * fields are not visible until instantiation, so there's no way to build an "accumulated" value
 * from each step in the inheritance chain.
 *
 * @since 0.1.0
 */
Action.after = [];
exports.default = Action;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvcnVudGltZS9hY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBT2dCO0FBQ2hCLDhEQUF1RDtBQUN2RCx5Q0FBa0M7QUFFbEMscUNBQXFDO0FBQ3JDLGlDQUFpQztBQUNqQyw0REFBb0Q7QUFDcEQsNENBQTJDO0FBRTNDLHFDQUE4QjtBQUk5Qiw0Q0FBcUM7QUFNckMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBbUQzQzs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILFlBQXFDLFNBQVEsZ0JBQVk7SUFBekQ7O1FBb0NFOztXQUVHO1FBQ0gsV0FBTSxHQUFHLGdCQUFNLENBQU0sb0JBQW9CLENBQUMsQ0FBQztRQUUzQzs7Ozs7OztXQU9HO1FBQ0gsV0FBTSxHQUFHLGdCQUFNLENBQVMsb0JBQW9CLENBQUMsQ0FBQztRQUU5Qzs7OztXQUlHO1FBQ0gsT0FBRSxHQUFHLGdCQUFNLENBQWtCLFlBQVksQ0FBQyxDQUFDO1FBRTNDOzs7O1dBSUc7UUFDSCxXQUFNLEdBQUcsZ0JBQU0sQ0FBUyxZQUFZLENBQUMsQ0FBQztRQWdCdEM7O1dBRUc7UUFDSyxnQkFBVyxHQUFHLEtBQUssQ0FBQztJQXNMOUIsQ0FBQztJQXBLTyxNQUFNLENBQUMsTUFBYyxFQUFFLElBQVUsRUFBRSxPQUF1Qjs7WUFDOUQsRUFBRSxDQUFDLENBQUMsT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDL0IsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDZixJQUFJLEdBQUcsTUFBTSxDQUFDO2dCQUNkLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDZixDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNiLE9BQU8sR0FB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QUNELE1BQU0sQ0FBQztZQUNMLFdBQVcsRUFBRSxJQUFJLENBQUMsa0JBQWtCO1lBQ3BDLFVBQVUsRUFBRSxJQUFJLENBQUMsaUJBQWlCO1NBQ25DLENBQUM7SUFDSixDQUFDOztBQXBRRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNJLGFBQU0sR0FBYSxFQUFFLENBQUM7QUFFN0I7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0ksWUFBSyxHQUFhLEVBQUUsQ0FBQztBQWxDOUIseUJBd1FDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNBcnJheSxcbiAgdW5pcSxcbiAgZmxhdHRlbixcbiAgY29tcGFjdCxcbiAgbWFwLFxuICBjbG9uZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IEluc3RydW1lbnRhdGlvbiBmcm9tICcuLi9tZXRhbC9pbnN0cnVtZW50YXRpb24nO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4uL2RhdGEvbW9kZWwnO1xuaW1wb3J0IFBhcnNlciBmcm9tICcuLi9wYXJzZS9wYXJzZXInO1xuaW1wb3J0ICogYXMgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgZWFjaFByb3RvdHlwZSBmcm9tICcuLi9tZXRhbC9lYWNoLXByb3RvdHlwZSc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5pbXBvcnQgUmVxdWVzdCBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IEVycm9ycyBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgVmlldyBmcm9tICcuLi9yZW5kZXIvdmlldyc7XG5pbXBvcnQgeyBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IHsgRGljdCB9IGZyb20gJy4uL3V0aWxzL3R5cGVzJztcbmltcG9ydCBpbmplY3QgZnJvbSAnLi4vbWV0YWwvaW5qZWN0JztcbmltcG9ydCBTZXJpYWxpemVyIGZyb20gJy4uL3JlbmRlci9zZXJpYWxpemVyJztcbmltcG9ydCBEYXRhYmFzZVNlcnZpY2UgZnJvbSAnLi4vZGF0YS9kYXRhYmFzZSc7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcENvbmZpZ3MgfSBmcm9tICcuLi9yZW5kZXIvc2VyaWFsaXplcic7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTphY3Rpb24nKTtcblxuZXhwb3J0IGludGVyZmFjZSBSZXNwb25kZXIge1xuICAocGFyYW1zOiBSZXNwb25kZXJQYXJhbXMpOiBhbnk7XG59XG5cbi8qKlxuICogVGhlIHBhcnNlciBkZXRlcm1pbmVzIHRoZSBleGFjdCBzaGFwZSBhbmQgc3RydWN0dXJlIG9mIHRoZSBhcmd1bWVudHMgb2JqZWN0IHBhc3NlZCBpbnRvIHlvdXJcbiAqIEFjdGlvbidzIHJlc3BvbmQgbWV0aG9kLiBIb3dldmVyLCB0aGUgY29tbW9uIGNvbnZlbnRpb24gaXMgdG8gYXQgbGVhc3QgZXhwb3NlIHRoZSBwcm9wZXJ0aWVzXG4gKiBsaXN0ZWQgYmVsb3cuXG4gKlxuICogKk5vdGUgZm9yIFR5cGVzY3JpcHQgdXNlcnM6KlxuICpcbiAqIEl0J3MgcG9zc2libGUgdG8gaGF2ZSBhIHBhcnNlciB0aGF0IHJldHVybnMgYSBxdWVyeSBvYmplY3Qgd2l0aCBub24tc3RyaW5nIHByb3BlcnRpZXMgKGkuZS4geW91clxuICogcGFyc2VyIGF1dG9tYXRpY2FsbHkgY29udmVydHMgdGhlIGBwYWdlPTRgIHF1ZXJ5IHBhcmFtIGludG8gYSBudW1iZXIpLiBJbiB0aGF0IGNhc2UsIHlvdSBzaG91bGRcbiAqIHByb2JhYmx5IGRlZmluZSB5b3VyIG93biBpbnRlcmZhY2UgdGhhdCBleHRlbmRzIGZyb20gdGhpcywgYW5kIHVzZSB0aGF0IGludGVyZmFjZSB0byB0eXBlIHlvdXJcbiAqIHJlc3BvbmQgbWV0aG9kIGFyZ3VtZW50LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc3BvbmRlclBhcmFtcyB7XG4gIGJvZHk/OiBhbnk7XG4gIHF1ZXJ5PzogRGljdDxzdHJpbmc+O1xuICBoZWFkZXJzPzogRGljdDxzdHJpbmc+O1xuICBwYXJhbXM/OiBEaWN0PHN0cmluZz47XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRoZSB2aWV3IGNsYXNzIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gcmVuZGVyIHRoaXMgcmVzcG9uc2UuIE92ZXJyaWRlcyB0aGUgYHNlcmlhbGl6ZXJgIHNldHRpbmcuXG4gICAqIFRoaXMgaXMgdXNlZnVsIGlmIHlvdSB3YW50IGNvbXBsZXRlLCBsb3ctbGV2ZWwgY29udHJvbCBvdmVyIHRoZSByZW5kZXJpbmcgcHJvY2VzcyAtIHlvdSdsbCBoYXZlXG4gICAqIGRpcmVjdCBhY2Nlc3MgdG8gdGhlIHJlc3BvbnNlIG9iamVjdCwgYW5kIGNhbiB1c2UgaXQgdG8gcmVuZGVyIGhvd2V2ZXIgeW91IHdhbnQuIFJlbmRlciB3aXRoXG4gICAqIGEgc3RyZWFtaW5nIEpTT04gcmVuZGVyZXIsIHVzZSBhbiBIVE1MIHRlbXBsYXRpbmcgZW5naW5lLCBhIGJpbmFyeSBwcm90b2NvbCwgZXRjLlxuICAgKi9cbiAgdmlldz86IHN0cmluZztcbiAgLyoqXG4gICAqIEV4cGxpY2l0bHkgc2V0IHRoZSBuYW1lIG9mIHRoZSBzZXJpYWxpemVyIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gcmVuZGVyIHRoaXMgcmVzcG9uc2UuIElmIG5vdFxuICAgKiBwcm92aWRlZCwgYW5kIHRoZSByZXNwb25zZSBib2R5IGlzIGEgTW9kZWwgb3IgYXJyYXkgb2YgTW9kZWxzLCBpdCB3aWxsIHRyeSB0byBmaW5kIGEgbWF0Y2hpbmdcbiAgICogc2VyaWFsaXplciBhbmQgdXNlIHRoYXQuIElmIGl0IGNhbid0IGZpbmQgdGhlIG1hdGNoaW5nIHNlcmlhbGl6ZXIsIG9yIGlmIHRoZSByZXNwb25zZSBib2R5IGlzXG4gICAqIGFub3RoZXIga2luZCBvZiBvYmplY3QsIGl0IHdpbGwgZmFsbCBiYWNrIHRvIHRoZSBhcHBsaWNhdGlvbiBzZXJpYWxpemVyLlxuICAgKi9cbiAgc2VyaWFsaXplcj86IHN0cmluZztcbiAgLyoqXG4gICAqIE92ZXJyaWRlIHdoaWNoIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIHNlcmlhbGl6ZWQuXG4gICAqL1xuICBhdHRyaWJ1dGVzPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBPdmVycmlkZSB3aGljaCByZWxhdGlvbnNoaXBzIHNob3VsZCBiZSBzZXJpYWxpemVkLlxuICAgKi9cbiAgcmVsYXRpb25zaGlwcz86IFJlbGF0aW9uc2hpcENvbmZpZ3M7XG59XG5cbi8qKlxuICogQWN0aW9ucyBmb3JtIHRoZSBjb3JlIG9mIGludGVyYWN0aW5nIHdpdGggYSBEZW5hbGkgYXBwbGljYXRpb24uIFRoZXkgYXJlIHRoZSBjb250cm9sbGVyIGxheWVyIGluXG4gKiB0aGUgTVZDIGFyY2hpdGVjdHVyZSwgdGFraW5nIGluIGluY29taW5nIHJlcXVlc3RzLCBwZXJmb3JtaW5nIGJ1c2luZXNzIGxvZ2ljLCBhbmQgaGFuZGluZyBvZmYgdG9cbiAqIHRoZSByZW5kZXJlciB0byBzZW5kIHRoZSByZXNwb25zZS5cbiAqXG4gKiBXaGVuIGEgcmVxdWVzdCBjb21lcyBpbiwgRGVuYWxpIHdpbGwgaW52b2tlIHRoZSBgcmVzcG9uZGAgbWV0aG9kIChvciBgcmVzcG9uZFdpdGhfX2AgZm9yIGNvbnRlbnRcbiAqIG5lZ290aWF0ZWQgcmVxdWVzdHMpIG9uIHRoZSBtYXRjaGluZyBBY3Rpb24gY2xhc3MuIFRoZSByZXR1cm4gdmFsdWUgKG9yIHJlc29sdmVkIHJldHVybiB2YWx1ZSkgb2ZcbiAqIHRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gcmVuZGVyIHRoZSByZXNwb25zZS5cbiAqXG4gKiBBY3Rpb25zIGFsc28gc3VwcG9ydCBmaWx0ZXJzLiBTaW1wbHkgZGVmaW5lIGEgbWV0aG9kIG9uIHlvdXIgYWN0aW9uLCBhbmQgYWRkIHRoZSBtZXRob2QgbmFtZSB0b1xuICogdGhlIGBiZWZvcmVgIG9yIGBhZnRlcmAgYXJyYXkuIEZpbHRlcnMgYmVoYXZlIHNpbWlsYXIgdG8gcmVzcG9uZGVycyBpbiB0aGF0IHRoZXkgcmVjZWl2ZSB0aGVcbiAqIHJlcXVlc3QgcGFyYW1zIGFuZCBjYW4gcmV0dXJuIGEgcHJvbWlzZSB3aGljaCB3aWxsIGJlIHdhaXRlZCBvbiBiZWZvcmUgY29udGludWluZy4gRmlsdGVycyBhcmVcbiAqIGluaGVyaXRhYmxlLCBzbyBjaGlsZCBjbGFzc2VzIHdpbGwgcnVuIGZpbHRlcnMgYWRkZWQgYnkgcGFyZW50IGNsYXNzZXMuXG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIEFjdGlvbiBleHRlbmRzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIEludm9rZWQgYmVmb3JlIHRoZSBgcmVzcG9uZCgpYCBtZXRob2QuIFRoZSBmcmFtZXdvcmsgd2lsbCBpbnZva2UgZmlsdGVycyBmcm9tIHBhcmVudCBjbGFzc2VzXG4gICAqIGFuZCBtaXhpbnMgaW4gdGhlIHNhbWUgb3JkZXIgdGhlIG1peGlucyB3ZXJlIGFwcGxpZWQuXG4gICAqXG4gICAqIEZpbHRlcnMgY2FuIGJlIHN5bmNocm9ub3VzLCBvciByZXR1cm4gYSBwcm9taXNlICh3aGljaCB3aWxsIHBhdXNlIHRoZSBiZWZvcmUvcmVzcG9uZC9hZnRlclxuICAgKiBjaGFpbiB1bnRpbCBpdCByZXNvbHZlcykuXG4gICAqXG4gICAqIElmIGEgYmVmb3JlIGZpbHRlciByZXR1cm5zIGFueSB2YWx1ZSAob3IgcmV0dXJucyBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgdG8gYW55IHZhbHVlKSBvdGhlclxuICAgKiB0aGFuIG51bGwgb3IgdW5kZWZpbmVkLCBEZW5hbGkgd2lsbCBhdHRlbXB0IHRvIHJlbmRlciB0aGF0IHJlc3BvbnNlIGFuZCBoYWx0IGZ1cnRoZXIgcHJvY2Vzc2luZ1xuICAgKiBvZiB0aGUgcmVxdWVzdCAoaW5jbHVkaW5nIHJlbWFpbmluZyBiZWZvcmUgZmlsdGVycykuXG4gICAqXG4gICAqIEZpbHRlcnMgbXVzdCBiZSBkZWZpbmVkIGFzIHN0YXRpYyBwcm9wZXJ0aWVzIHRvIGFsbG93IERlbmFsaSB0byBleHRyYWN0IHRoZSB2YWx1ZXMuIEluc3RhbmNlXG4gICAqIGZpZWxkcyBhcmUgbm90IHZpc2libGUgdW50aWwgaW5zdGFudGlhdGlvbiwgc28gdGhlcmUncyBubyB3YXkgdG8gYnVpbGQgYW4gXCJhY2N1bXVsYXRlZFwiIHZhbHVlXG4gICAqIGZyb20gZWFjaCBzdGVwIGluIHRoZSBpbmhlcml0YW5jZSBjaGFpbi5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBzdGF0aWMgYmVmb3JlOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBJbnZva2VkIGFmdGVyIHRoZSBgcmVzcG9uZCgpYCBtZXRob2QuIFRoZSBmcmFtZXdvcmsgd2lsbCBpbnZva2UgZmlsdGVycyBmcm9tIHBhcmVudCBjbGFzc2VzIGFuZFxuICAgKiBtaXhpbnMgaW4gdGhlIHNhbWUgb3JkZXIgdGhlIG1peGlucyB3ZXJlIGFwcGxpZWQuXG4gICAqXG4gICAqIEZpbHRlcnMgY2FuIGJlIHN5bmNocm9ub3VzLCBvciByZXR1cm4gYSBwcm9taXNlICh3aGljaCB3aWxsIHBhdXNlIHRoZSBiZWZvcmUvcmVzcG9uZC9hZnRlclxuICAgKiBjaGFpbiB1bnRpbCBpdCByZXNvbHZlcykuXG4gICAqXG4gICAqIEZpbHRlcnMgbXVzdCBiZSBkZWZpbmVkIGFzIHN0YXRpYyBwcm9wZXJ0aWVzIHRvIGFsbG93IERlbmFsaSB0byBleHRyYWN0IHRoZSB2YWx1ZXMuIEluc3RhbmNlXG4gICAqIGZpZWxkcyBhcmUgbm90IHZpc2libGUgdW50aWwgaW5zdGFudGlhdGlvbiwgc28gdGhlcmUncyBubyB3YXkgdG8gYnVpbGQgYW4gXCJhY2N1bXVsYXRlZFwiIHZhbHVlXG4gICAqIGZyb20gZWFjaCBzdGVwIGluIHRoZSBpbmhlcml0YW5jZSBjaGFpbi5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBzdGF0aWMgYWZ0ZXI6IHN0cmluZ1tdID0gW107XG5cbiAgLyoqXG4gICAqIEFwcGxpY2F0aW9uIGNvbmZpZ1xuICAgKi9cbiAgY29uZmlnID0gaW5qZWN0PGFueT4oJ2NvbmZpZzplbnZpcm9ubWVudCcpO1xuXG4gIC8qKlxuICAgKiBGb3JjZSB3aGljaCBwYXJzZXIgc2hvdWxkIGJlIHVzZWQgZm9yIHBhcnNpbmcgdGhlIGluY29taW5nIHJlcXVlc3QuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQgaXQgdXNlcyB0aGUgYXBwbGljYXRpb24gcGFyc2VyLCBidXQgeW91IGNhbiBvdmVycmlkZSB3aXRoIHRoZSBuYW1lIG9mIHRoZSBwYXJzZXJcbiAgICogeW91J2QgcmF0aGVyIHVzZSBpbnN0ZWFkLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHBhcnNlciA9IGluamVjdDxQYXJzZXI+KCdwYXJzZXI6YXBwbGljYXRpb24nKTtcblxuICAvKipcbiAgICogQXV0b21hdGljYWxseSBpbmplY3QgdGhlIGRiIHNlcnZpY2UgaW50byBhbGwgYWN0aW9uc1xuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGRiID0gaW5qZWN0PERhdGFiYXNlU2VydmljZT4oJ3NlcnZpY2U6ZGInKTtcblxuICAvKipcbiAgICogQXV0b21hdGljYWxseSBpbmplY3QgdGhlIGxvZ2dlciBpbnRvIGFsbCBhY3Rpb25zXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgbG9nZ2VyID0gaW5qZWN0PExvZ2dlcj4oJ2FwcDpsb2dnZXInKTtcblxuICAvKipcbiAgICogVGhlIGluY29taW5nIFJlcXVlc3QgdGhhdCB0aGlzIEFjdGlvbiBpcyByZXNwb25kaW5nIHRvLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHJlcXVlc3Q6IFJlcXVlc3Q7XG5cbiAgLyoqXG4gICAqIFRoZSBvdXRnb2luZyBIVFRQIHNlcnZlciByZXNwb25zZVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHJlc3BvbnNlOiBTZXJ2ZXJSZXNwb25zZTtcblxuICAvKipcbiAgICogVHJhY2sgd2hldGhlciBvciBub3Qgd2UgaGF2ZSByZW5kZXJlZCB5ZXRcbiAgICovXG4gIHByaXZhdGUgaGFzUmVuZGVyZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIHBhdGggdG8gdGhpcyBhY3Rpb24sIGkuZS4gJ3VzZXJzL2NyZWF0ZSdcbiAgICovXG4gIGFjdGlvblBhdGg6IHN0cmluZztcblxuICAvKipcbiAgICogQXV0b21hdGljYWxseSBpbmplY3QgdGhlIGRiIHNlcnZpY2VcbiAgICovXG4gIC8vIGRiID0gaW5qZWN0PERhdGFiYXNlU2VydmljZT4oJ3NlcnZpY2U6ZGInKTtcblxuICAvKipcbiAgICogUmVuZGVyIHRoZSByZXNwb25zZSBib2R5XG4gICAqL1xuXG4gIGFzeW5jIHJlbmRlcihib2R5OiBhbnksIG9wdGlvbnM/OiBSZW5kZXJPcHRpb25zKTogUHJvbWlzZTx2b2lkPjtcbiAgYXN5bmMgcmVuZGVyKHN0YXR1czogbnVtYmVyLCBib2R5PzogYW55LCBvcHRpb25zPzogUmVuZGVyT3B0aW9ucyk6IFByb21pc2U8dm9pZD47XG4gIGFzeW5jIHJlbmRlcihzdGF0dXM6IG51bWJlciwgYm9keT86IGFueSwgb3B0aW9ucz86IFJlbmRlck9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodHlwZW9mIHN0YXR1cyAhPT0gJ251bWJlcicpIHtcbiAgICAgIG9wdGlvbnMgPSBib2R5O1xuICAgICAgYm9keSA9IHN0YXR1cztcbiAgICAgIHN0YXR1cyA9IDIwMDtcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5oYXNSZW5kZXJlZCA9IHRydWU7XG5cbiAgICBkZWJ1ZyhgWyR7IHRoaXMucmVxdWVzdC5pZCB9XTogcmVuZGVyaW5nYCk7XG4gICAgdGhpcy5yZXNwb25zZS5zZXRIZWFkZXIoJ1gtUmVxdWVzdC1JZCcsIHRoaXMucmVxdWVzdC5pZCk7XG5cbiAgICBkZWJ1ZyhgWyR7IHRoaXMucmVxdWVzdC5pZCB9XTogc2V0dGluZyByZXNwb25zZSBzdGF0dXMgY29kZSB0byAkeyBzdGF0dXMgfWApO1xuICAgIHRoaXMucmVzcG9uc2Uuc3RhdHVzQ29kZSA9IHN0YXR1cztcblxuICAgIGlmICghYm9keSkge1xuICAgICAgZGVidWcoYFskeyB0aGlzLnJlcXVlc3QuaWQgfV06IG5vIHJlc3BvbnNlIGJvZHkgdG8gcmVuZGVyLCByZXNwb25zZSBmaW5pc2hlZGApO1xuICAgICAgdGhpcy5yZXNwb25zZS5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZW5kZXIgd2l0aCBhIGN1c3RvbSB2aWV3IGlmIHJlcXVlc3RlZFxuICAgIGlmIChvcHRpb25zLnZpZXcpIHtcbiAgICAgIGxldCB2aWV3ID0gdGhpcy5jb250YWluZXIubG9va3VwPFZpZXc+KGB2aWV3OiR7IG9wdGlvbnMudmlldyB9YCk7XG4gICAgICBhc3NlcnQodmlldywgYE5vIHN1Y2ggdmlldzogJHsgb3B0aW9ucy52aWV3IH1gKTtcbiAgICAgIGRlYnVnKGBbJHsgdGhpcy5yZXF1ZXN0LmlkIH1dOiByZW5kZXJpbmcgcmVzcG9uc2UgYm9keSB3aXRoIHRoZSAkeyBvcHRpb25zLnZpZXcgfSB2aWV3YCk7XG4gICAgICByZXR1cm4gYXdhaXQgdmlldy5yZW5kZXIodGhpcywgdGhpcy5yZXNwb25zZSwgYm9keSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gUGljayB0aGUgc2VyaWFsaXplciB0byB1c2VcbiAgICBsZXQgc2VyaWFsaXplckxvb2t1cCA9ICdhcHBsaWNhdGlvbic7XG4gICAgaWYgKG9wdGlvbnMuc2VyaWFsaXplcikge1xuICAgICAgc2VyaWFsaXplckxvb2t1cCA9IG9wdGlvbnMuc2VyaWFsaXplcjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHNhbXBsZSA9IGlzQXJyYXkoYm9keSkgPyBib2R5WzBdIDogYm9keTtcbiAgICAgIGlmIChzYW1wbGUgaW5zdGFuY2VvZiBNb2RlbCkge1xuICAgICAgICBzZXJpYWxpemVyTG9va3VwID0gc2FtcGxlLnR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVuZGVyIHdpdGggdGhlIHNlcmlhbGl6ZXJcbiAgICBsZXQgc2VyaWFsaXplciA9IHRoaXMuY29udGFpbmVyLmxvb2t1cDxTZXJpYWxpemVyPihgc2VyaWFsaXplcjokeyBzZXJpYWxpemVyTG9va3VwIH1gKTtcbiAgICBkZWJ1ZyhgWyR7IHRoaXMucmVxdWVzdC5pZCB9XTogcmVuZGVyaW5nIHJlc3BvbnNlIGJvZHkgd2l0aCB0aGUgJHsgc2VyaWFsaXplckxvb2t1cCB9IHNlcmlhbGl6ZXJgKTtcbiAgICByZXR1cm4gYXdhaXQgc2VyaWFsaXplci5yZW5kZXIodGhpcywgdGhpcy5yZXNwb25zZSwgYm9keSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlcyB0aGUgYWN0aW9uLiBEZXRlcm1pbmVzIHRoZSBiZXN0IHJlc3BvbmRlciBtZXRob2QgZm9yIGNvbnRlbnQgbmVnb3RpYXRpb24sIHRoZW4gZXhlY3V0ZXNcbiAgICogdGhlIGZpbHRlci9yZXNwb25kZXIgY2hhaW4gaW4gc2VxdWVuY2UsIGhhbmRsaW5nIGVycm9ycyBhbmQgcmVuZGVyaW5nIHRoZSByZXNwb25zZS5cbiAgICpcbiAgICogWW91IHNob3VsZG4ndCBpbnZva2UgdGhpcyBkaXJlY3RseSAtIERlbmFsaSB3aWxsIGF1dG9tYXRpY2FsbHkgd2lyZSB1cCB5b3VyIHJvdXRlcyB0byB0aGlzXG4gICAqIG1ldGhvZC5cbiAgICovXG4gIGFzeW5jIHJ1bihyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogU2VydmVyUmVzcG9uc2UpIHtcbiAgICB0aGlzLnJlcXVlc3QgPSByZXF1ZXN0O1xuICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcblxuICAgIC8vIFBhcnNlIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJhc2VkIG9uIHRoZSBhY3Rpb24ncyBjaG9zZW4gcGFyc2VyXG4gICAgZGVidWcoYFskeyByZXF1ZXN0LmlkIH1dOiBwYXJzaW5nIHJlcXVlc3RgKTtcbiAgICBhc3NlcnQodHlwZW9mIHRoaXMucGFyc2VyLnBhcnNlID09PSAnZnVuY3Rpb24nLCAnVGhlIHBhcnNlciB5b3Ugc3VwcGx5IG11c3QgZGVmaW5lIGEgYHBhcnNlKHJlcXVlc3QpYCBtZXRob2QuIFNlZSB0aGUgcGFyc2VyIGRvY3MgZm9yIGRldGFpbHMnKTtcbiAgICBsZXQgcGFyc2VkUmVxdWVzdDogUmVzcG9uZGVyUGFyYW1zID0gdGhpcy5wYXJzZXIucGFyc2UocmVxdWVzdCk7XG5cbiAgICAvLyBCdWlsZCB0aGUgYmVmb3JlIGFuZCBhZnRlciBmaWx0ZXIgY2hhaW5zXG4gICAgbGV0IHsgYmVmb3JlQ2hhaW4sIGFmdGVyQ2hhaW4gfSA9IHRoaXMuX2J1aWxkRmlsdGVyQ2hhaW5zKCk7XG5cbiAgICBsZXQgaW5zdHJ1bWVudGF0aW9uID0gSW5zdHJ1bWVudGF0aW9uLmluc3RydW1lbnQoJ2FjdGlvbi5ydW4nLCB7XG4gICAgICBhY3Rpb246IHRoaXMuYWN0aW9uUGF0aCxcbiAgICAgIHBhcnNlZDogcGFyc2VkUmVxdWVzdFxuICAgIH0pO1xuXG4gICAgLy8gQmVmb3JlIGZpbHRlcnNcbiAgICBkZWJ1ZyhgWyR7IHRoaXMucmVxdWVzdC5pZCB9XTogcnVubmluZyBiZWZvcmUgZmlsdGVyc2ApO1xuICAgIGF3YWl0IHRoaXMuX2ludm9rZUZpbHRlcnMoYmVmb3JlQ2hhaW4sIHBhcnNlZFJlcXVlc3QpO1xuXG4gICAgLy8gUmVzcG9uZGVyXG4gICAgaWYgKCF0aGlzLmhhc1JlbmRlcmVkKSB7XG4gICAgICBkZWJ1ZyhgWyR7IHRoaXMucmVxdWVzdC5pZCB9XTogcnVubmluZyByZXNwb25kZXJgKTtcbiAgICAgIGxldCByZXN1bHQgPSBhd2FpdCB0aGlzLnJlc3BvbmQocGFyc2VkUmVxdWVzdCk7XG4gICAgICAvLyBBdXRvcmVuZGVyIGlmIHJlbmRlciBoYXMgbm90IGJlZW4gbWFudWFsbHkgY2FsbGVkIGFuZCBhIHZhbHVlIHdhcyByZXR1cm5lZFxuICAgICAgaWYgKCF0aGlzLmhhc1JlbmRlcmVkKSB7XG4gICAgICAgIGRlYnVnKGBbJHsgdGhpcy5yZXF1ZXN0LmlkIH1dOiBhdXRvcmVuZGVyaW5nYCk7XG4gICAgICAgIGF3YWl0IHRoaXMucmVuZGVyKHJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWZ0ZXIgZmlsdGVyc1xuICAgIGRlYnVnKGBbJHsgdGhpcy5yZXF1ZXN0LmlkIH1dOiBydW5uaW5nIGFmdGVyIGZpbHRlcnNgKTtcbiAgICBhd2FpdCB0aGlzLl9pbnZva2VGaWx0ZXJzKGFmdGVyQ2hhaW4sIHBhcnNlZFJlcXVlc3QpO1xuXG4gICAgLy8gSWYgbm8gb25lIGhhcyByZW5kZXJlZCwgYmFpbFxuICAgIGlmICghdGhpcy5oYXNSZW5kZXJlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9ycy5JbnRlcm5hbFNlcnZlckVycm9yKGAkeyB0aGlzLmFjdGlvblBhdGggfSBkaWQgbm90IHJlbmRlciBhbnl0aGluZ2ApO1xuICAgIH1cblxuICAgIGluc3RydW1lbnRhdGlvbi5maW5pc2goKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCByZXNwb25kZXIgbWV0aG9kLiBZb3Ugc2hvdWxkIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHdpdGggd2hhdGV2ZXIgbG9naWMgaXMgbmVlZGVkIHRvXG4gICAqIHJlc3BvbmQgdG8gdGhlIGluY29taW5nIHJlcXVlc3QuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYWJzdHJhY3QgcmVzcG9uZChwYXJhbXM6IFJlc3BvbmRlclBhcmFtcyk6IGFueTtcblxuICAvKipcbiAgICogSW52b2tlcyB0aGUgZmlsdGVycyBpbiB0aGUgc3VwcGxpZWQgY2hhaW4gaW4gc2VxdWVuY2UuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9pbnZva2VGaWx0ZXJzKGNoYWluOiBzdHJpbmdbXSwgcGFyc2VkUmVxdWVzdDogUmVzcG9uZGVyUGFyYW1zKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjaGFpbiA9IGNsb25lKGNoYWluKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGZpbHRlck5hbWUgPSBjaGFpbi5zaGlmdCgpO1xuICAgICAgbGV0IGZpbHRlciA9IDxSZXNwb25kZXI+KDxhbnk+dGhpcylbZmlsdGVyTmFtZV07XG4gICAgICBsZXQgaW5zdHJ1bWVudGF0aW9uID0gSW5zdHJ1bWVudGF0aW9uLmluc3RydW1lbnQoJ2FjdGlvbi5maWx0ZXInLCB7XG4gICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb25QYXRoLFxuICAgICAgICByZXF1ZXN0OiBwYXJzZWRSZXF1ZXN0LFxuICAgICAgICBmaWx0ZXI6IGZpbHRlck5hbWVcbiAgICAgIH0pO1xuICAgICAgZGVidWcoYFskeyB0aGlzLnJlcXVlc3QuaWQgfV06IHJ1bm5pbmcgJyR7IGZpbHRlck5hbWUgfScgZmlsdGVyYCk7XG4gICAgICBsZXQgZmlsdGVyUmVzdWx0ID0gYXdhaXQgZmlsdGVyLmNhbGwodGhpcywgcGFyc2VkUmVxdWVzdCk7XG4gICAgICBpbnN0cnVtZW50YXRpb24uZmluaXNoKCk7XG4gICAgICBpZiAoIXRoaXMuaGFzUmVuZGVyZWQgJiYgZmlsdGVyUmVzdWx0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlcigyMDAsIGZpbHRlclJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdhbGsgdGhlIHByb3RvdHlwZSBjaGFpbiBvZiB0aGlzIEFjdGlvbiBpbnN0YW5jZSB0byBmaW5kIGFsbCB0aGUgYGJlZm9yZWAgYW5kIGBhZnRlcmAgYXJyYXlzIHRvXG4gICAqIGJ1aWxkIHRoZSBjb21wbGV0ZSBmaWx0ZXIgY2hhaW5zLlxuICAgKlxuICAgKiBDYWNoZXMgdGhlIHJlc3VsdCBvbiB0aGUgY2hpbGQgQWN0aW9uIGNsYXNzIHRvIGF2b2lkIHRoZSBwb3RlbnRpYWxseSBleHBlbnNpdmUgcHJvdG90eXBlIHdhbGtcbiAgICogb24gZWFjaCByZXF1ZXN0LlxuICAgKlxuICAgKiBUaHJvd3MgaWYgaXQgZW5jb3VudGVycyB0aGUgbmFtZSBvZiBhIGZpbHRlciBtZXRob2QgdGhhdCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgcHJpdmF0ZSBfYnVpbGRGaWx0ZXJDaGFpbnMoKTogeyBiZWZvcmVDaGFpbjogc3RyaW5nW10sIGFmdGVyQ2hhaW46IHN0cmluZ1tdIH0ge1xuICAgIGxldCBtZXRhID0gdGhpcy5jb250YWluZXIubWV0YUZvcih0aGlzLmNvbnN0cnVjdG9yKTtcbiAgICBpZiAoIW1ldGEuYmVmb3JlRmlsdGVyc0NhY2hlKSB7XG4gICAgICBsZXQgcHJvdG90eXBlQ2hhaW46IEFjdGlvbltdID0gW107XG4gICAgICBlYWNoUHJvdG90eXBlKDx0eXBlb2YgQWN0aW9uPnRoaXMuY29uc3RydWN0b3IsIChwcm90b3R5cGUpID0+IHtcbiAgICAgICAgcHJvdG90eXBlQ2hhaW4ucHVzaChwcm90b3R5cGUpO1xuICAgICAgfSk7XG4gICAgICBwcm90b3R5cGVDaGFpbiA9IHByb3RvdHlwZUNoYWluLnJldmVyc2UoKTtcbiAgICAgIFsgJ2JlZm9yZScsICdhZnRlcicgXS5mb3JFYWNoKChzdGFnZSkgPT4ge1xuICAgICAgICBsZXQgY2FjaGU6IHN0cmluZ1tdID0gbWV0YVtgJHsgc3RhZ2UgfUZpbHRlcnNDYWNoZWBdID0gW107XG4gICAgICAgIGxldCBmaWx0ZXJOYW1lcyA9IGNvbXBhY3QodW5pcShmbGF0dGVuKG1hcDxBY3Rpb24sIHN0cmluZ1tdPihwcm90b3R5cGVDaGFpbiwgc3RhZ2UpKSkpO1xuICAgICAgICBmaWx0ZXJOYW1lcy5mb3JFYWNoKChmaWx0ZXJOYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCEoPGFueT50aGlzKVtmaWx0ZXJOYW1lXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAkeyBmaWx0ZXJOYW1lIH0gbWV0aG9kIG5vdCBmb3VuZCBvbiB0aGUgJHsgdGhpcy5hY3Rpb25QYXRoIH0gYWN0aW9uLmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYWNoZS5wdXNoKGZpbHRlck5hbWUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgYmVmb3JlQ2hhaW46IG1ldGEuYmVmb3JlRmlsdGVyc0NhY2hlLFxuICAgICAgYWZ0ZXJDaGFpbjogbWV0YS5hZnRlckZpbHRlcnNDYWNoZVxuICAgIH07XG4gIH1cblxufVxuIl19