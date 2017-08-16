"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const action_1 = require("../../lib/runtime/action");
const inject_1 = require("../../lib/metal/inject");
/**
 * The default error action. When Denali encounters an error while processing a request, it will
 * attempt to hand off that error to the `error` action, which can determine how to respond. This is
 * a good spot to do things like report the error to an error-tracking service, sanitize the error
 * response based on environment (i.e. a full stack trace in dev, but limited info in prod), etc.
 *
 * @export
 * @class ErrorAction
 * @extends {Action}
 */
class ErrorAction extends action_1.default {
    constructor() {
        super(...arguments);
        this.logger = inject_1.default('app:logger');
        this.parser = inject_1.default('parser:flat');
    }
    get originalAction() {
        return this.request._originalAction;
    }
    /**
     * Respond with JSON by default
     */
    respond({ params }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let error = params.error;
            assert(error, 'Error action must be invoked with an error as a param');
            // Print the error to the logs
            if ((!error.status || error.status >= 500) && this.config.environment !== 'test') {
                this.logger.error(`Request ${this.request.id} errored:\n${error.stack || error.message}`);
            }
            // Ensure a default status code of 500
            error.status = error.statusCode = error.statusCode || 500;
            // If debugging info is allowed, attach some debugging info to standard
            // locations.
            if (this.config.logging && this.config.logging.showDebuggingInfo) {
                error.meta = {
                    stack: error.stack,
                    action: this.originalAction
                };
                // Otherwise, sanitize the output
            }
            else {
                if (error.statusCode === 500) {
                    error.message = 'Internal Error';
                }
                delete error.stack;
            }
            if (this.request.accepts(['html']) && this.container.lookup('config:environment').environment !== 'production') {
                this.render(error.status, error, { view: 'error.html' });
            }
            else {
                this.render(error.status, error);
            }
        });
    }
}
exports.default = ErrorAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImFwcC9hY3Rpb25zL2Vycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpQztBQUNqQyxxREFBOEM7QUFHOUMsbURBQTRDO0FBRTVDOzs7Ozs7Ozs7R0FTRztBQUNILGlCQUFpQyxTQUFRLGdCQUFNO0lBQS9DOztRQU1FLFdBQU0sR0FBRyxnQkFBTSxDQUFTLFlBQVksQ0FBQyxDQUFDO1FBQ3RDLFdBQU0sR0FBRyxnQkFBTSxDQUFhLGFBQWEsQ0FBQyxDQUFDO0lBbUM3QyxDQUFDO0lBeENDLElBQUksY0FBYztRQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7SUFDdEMsQ0FBQztJQUtEOztPQUVHO0lBQ0csT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFPOztZQUMzQixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsdURBQXVELENBQUMsQ0FBQztZQUN2RSw4QkFBOEI7WUFDOUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNqRixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRyxjQUFlLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQVEsRUFBRSxDQUFDLENBQUM7WUFDaEcsQ0FBQztZQUNELHNDQUFzQztZQUN0QyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsSUFBSSxHQUFHLENBQUM7WUFDMUQsdUVBQXVFO1lBQ3ZFLGFBQWE7WUFDYixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pFLEtBQUssQ0FBQyxJQUFJLEdBQUc7b0JBQ1gsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO29CQUNsQixNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWM7aUJBQzVCLENBQUM7Z0JBQ0osaUNBQWlDO1lBQ2pDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLEtBQUssQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7Z0JBQ25DLENBQUM7Z0JBQ0QsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ3JCLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFFLE1BQU0sQ0FBRSxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDakgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQzNELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkMsQ0FBQztRQUNILENBQUM7S0FBQTtDQUVGO0FBMUNELDhCQTBDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IEFjdGlvbiBmcm9tICcuLi8uLi9saWIvcnVudGltZS9hY3Rpb24nO1xuaW1wb3J0IExvZ2dlciBmcm9tICcuLi8uLi9saWIvcnVudGltZS9sb2dnZXInO1xuaW1wb3J0IEZsYXRQYXJzZXIgZnJvbSAnLi4vLi4vbGliL3BhcnNlL2ZsYXQnO1xuaW1wb3J0IGluamVjdCBmcm9tICcuLi8uLi9saWIvbWV0YWwvaW5qZWN0JztcblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBlcnJvciBhY3Rpb24uIFdoZW4gRGVuYWxpIGVuY291bnRlcnMgYW4gZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBhIHJlcXVlc3QsIGl0IHdpbGxcbiAqIGF0dGVtcHQgdG8gaGFuZCBvZmYgdGhhdCBlcnJvciB0byB0aGUgYGVycm9yYCBhY3Rpb24sIHdoaWNoIGNhbiBkZXRlcm1pbmUgaG93IHRvIHJlc3BvbmQuIFRoaXMgaXNcbiAqIGEgZ29vZCBzcG90IHRvIGRvIHRoaW5ncyBsaWtlIHJlcG9ydCB0aGUgZXJyb3IgdG8gYW4gZXJyb3ItdHJhY2tpbmcgc2VydmljZSwgc2FuaXRpemUgdGhlIGVycm9yXG4gKiByZXNwb25zZSBiYXNlZCBvbiBlbnZpcm9ubWVudCAoaS5lLiBhIGZ1bGwgc3RhY2sgdHJhY2UgaW4gZGV2LCBidXQgbGltaXRlZCBpbmZvIGluIHByb2QpLCBldGMuXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIEVycm9yQWN0aW9uXG4gKiBAZXh0ZW5kcyB7QWN0aW9ufVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvckFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG5cbiAgZ2V0IG9yaWdpbmFsQWN0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdC5fb3JpZ2luYWxBY3Rpb247XG4gIH1cblxuICBsb2dnZXIgPSBpbmplY3Q8TG9nZ2VyPignYXBwOmxvZ2dlcicpO1xuICBwYXJzZXIgPSBpbmplY3Q8RmxhdFBhcnNlcj4oJ3BhcnNlcjpmbGF0Jyk7XG5cbiAgLyoqXG4gICAqIFJlc3BvbmQgd2l0aCBKU09OIGJ5IGRlZmF1bHRcbiAgICovXG4gIGFzeW5jIHJlc3BvbmQoeyBwYXJhbXMgfTogYW55KSB7XG4gICAgbGV0IGVycm9yID0gcGFyYW1zLmVycm9yO1xuICAgIGFzc2VydChlcnJvciwgJ0Vycm9yIGFjdGlvbiBtdXN0IGJlIGludm9rZWQgd2l0aCBhbiBlcnJvciBhcyBhIHBhcmFtJyk7XG4gICAgLy8gUHJpbnQgdGhlIGVycm9yIHRvIHRoZSBsb2dzXG4gICAgaWYgKCghZXJyb3Iuc3RhdHVzIHx8IGVycm9yLnN0YXR1cyA+PSA1MDApICYmIHRoaXMuY29uZmlnLmVudmlyb25tZW50ICE9PSAndGVzdCcpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKGBSZXF1ZXN0ICR7IHRoaXMucmVxdWVzdC5pZCB9IGVycm9yZWQ6XFxuJHsgZXJyb3Iuc3RhY2sgfHwgZXJyb3IubWVzc2FnZSB9YCk7XG4gICAgfVxuICAgIC8vIEVuc3VyZSBhIGRlZmF1bHQgc3RhdHVzIGNvZGUgb2YgNTAwXG4gICAgZXJyb3Iuc3RhdHVzID0gZXJyb3Iuc3RhdHVzQ29kZSA9IGVycm9yLnN0YXR1c0NvZGUgfHwgNTAwO1xuICAgIC8vIElmIGRlYnVnZ2luZyBpbmZvIGlzIGFsbG93ZWQsIGF0dGFjaCBzb21lIGRlYnVnZ2luZyBpbmZvIHRvIHN0YW5kYXJkXG4gICAgLy8gbG9jYXRpb25zLlxuICAgIGlmICh0aGlzLmNvbmZpZy5sb2dnaW5nICYmIHRoaXMuY29uZmlnLmxvZ2dpbmcuc2hvd0RlYnVnZ2luZ0luZm8pIHtcbiAgICAgIGVycm9yLm1ldGEgPSB7XG4gICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgYWN0aW9uOiB0aGlzLm9yaWdpbmFsQWN0aW9uXG4gICAgICB9O1xuICAgIC8vIE90aGVyd2lzZSwgc2FuaXRpemUgdGhlIG91dHB1dFxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZXJyb3Iuc3RhdHVzQ29kZSA9PT0gNTAwKSB7XG4gICAgICAgIGVycm9yLm1lc3NhZ2UgPSAnSW50ZXJuYWwgRXJyb3InO1xuICAgICAgfVxuICAgICAgZGVsZXRlIGVycm9yLnN0YWNrO1xuICAgIH1cbiAgICBpZiAodGhpcy5yZXF1ZXN0LmFjY2VwdHMoWyAnaHRtbCcgXSkgJiYgdGhpcy5jb250YWluZXIubG9va3VwKCdjb25maWc6ZW52aXJvbm1lbnQnKS5lbnZpcm9ubWVudCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB0aGlzLnJlbmRlcihlcnJvci5zdGF0dXMsIGVycm9yLCB7IHZpZXc6ICdlcnJvci5odG1sJyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXIoZXJyb3Iuc3RhdHVzLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==