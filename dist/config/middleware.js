"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const timing = require("response-time");
const compression = require("compression");
const cookies = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const body_parser_1 = require("body-parser");
/**
 * Denali ships with several base middleware included, each of which can be enabled/disabled
 * individually through config options.
 */
function baseMiddleware(router, application) {
    let config = application.config;
    /**
     * Returns true if the given property either does not exist on the config object, or it does exist
     * and it's `enabled` property is not `false`. All the middleware here are opt out, so to disable
     * you must define set that middleware's root config property to `{ enabled: false }`
     */
    function isEnabled(prop) {
        return !config[prop] || (config[prop] && config[prop].enabled !== false);
    }
    if (isEnabled('timing')) {
        router.use(timing());
    }
    if (isEnabled('logging')) {
        let defaultLoggingFormat = application.environment === 'production' ? 'combined' : 'dev';
        let defaultLoggingOptions = {
            // tslint:disable-next-line:completed-docs
            skip() {
                return application.environment === 'test';
            }
        };
        let format = (config.logging && config.logging.format) || defaultLoggingFormat;
        let options = lodash_1.defaults(config.logging || {}, defaultLoggingOptions);
        router.use(morgan(format, options));
        // Patch morgan to read from our non-express response
        morgan.token('res', (req, res, field) => {
            let header = res.getHeader(field);
            return Array.isArray(header) ? header.join(', ') : header;
        });
    }
    if (isEnabled('compression')) {
        router.use(compression());
    }
    if (isEnabled('cookies')) {
        router.use(cookies(config.cookies));
    }
    if (isEnabled('cors')) {
        router.use(cors(config.cors));
    }
    if (isEnabled('xssFilter')) {
        router.use(helmet.xssFilter());
    }
    if (isEnabled('frameguard')) {
        router.use(helmet.frameguard());
    }
    if (isEnabled('hidePoweredBy')) {
        router.use(helmet.hidePoweredBy());
    }
    if (isEnabled('ieNoOpen')) {
        router.use(helmet.ieNoOpen());
    }
    if (isEnabled('noSniff')) {
        router.use(helmet.noSniff());
    }
    if (isEnabled('bodyParser')) {
        router.use(body_parser_1.json({ type: config.bodyParser && config.bodyParser.type }));
    }
}
exports.default = baseMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsiY29uZmlnL21pZGRsZXdhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FFZ0I7QUFDaEIsd0NBQXdDO0FBQ3hDLDJDQUEyQztBQUMzQyx5Q0FBeUM7QUFDekMsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFDakMsNkNBQW1DO0FBS25DOzs7R0FHRztBQUNILHdCQUF1QyxNQUFjLEVBQUUsV0FBd0I7SUFFN0UsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztJQUVoQzs7OztPQUlHO0lBQ0gsbUJBQW1CLElBQVk7UUFDN0IsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLElBQUksb0JBQW9CLEdBQUcsV0FBVyxDQUFDLFdBQVcsS0FBSyxZQUFZLEdBQUcsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN6RixJQUFJLHFCQUFxQixHQUFHO1lBQzFCLDBDQUEwQztZQUMxQyxJQUFJO2dCQUNGLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQztZQUM1QyxDQUFDO1NBQ0YsQ0FBQztRQUNGLElBQUksTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLG9CQUFvQixDQUFDO1FBQy9FLElBQUksT0FBTyxHQUFHLGlCQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUNwRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUVwQyxxREFBcUQ7UUFDckQsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFvQixFQUFFLEdBQW1CLEVBQUUsS0FBYTtZQUMzRSxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLGtCQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDO0FBRUgsQ0FBQztBQXhFRCxpQ0F3RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBkZWZhdWx0c1xufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgdGltaW5nIGZyb20gJ3Jlc3BvbnNlLXRpbWUnO1xuaW1wb3J0ICogYXMgY29tcHJlc3Npb24gZnJvbSAnY29tcHJlc3Npb24nO1xuaW1wb3J0ICogYXMgY29va2llcyBmcm9tICdjb29raWUtcGFyc2VyJztcbmltcG9ydCAqIGFzIGNvcnMgZnJvbSAnY29ycyc7XG5pbXBvcnQgKiBhcyBoZWxtZXQgZnJvbSAnaGVsbWV0JztcbmltcG9ydCAqIGFzIG1vcmdhbiBmcm9tICdtb3JnYW4nO1xuaW1wb3J0IHsganNvbiB9IGZyb20gJ2JvZHktcGFyc2VyJztcbmltcG9ydCB7IEluY29taW5nTWVzc2FnZSwgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcbmltcG9ydCBSb3V0ZXIgZnJvbSAnLi4vbGliL3J1bnRpbWUvcm91dGVyJztcbmltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuLi9saWIvcnVudGltZS9hcHBsaWNhdGlvbic7XG5cbi8qKlxuICogRGVuYWxpIHNoaXBzIHdpdGggc2V2ZXJhbCBiYXNlIG1pZGRsZXdhcmUgaW5jbHVkZWQsIGVhY2ggb2Ygd2hpY2ggY2FuIGJlIGVuYWJsZWQvZGlzYWJsZWRcbiAqIGluZGl2aWR1YWxseSB0aHJvdWdoIGNvbmZpZyBvcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiYXNlTWlkZGxld2FyZShyb3V0ZXI6IFJvdXRlciwgYXBwbGljYXRpb246IEFwcGxpY2F0aW9uKTogdm9pZCB7XG5cbiAgbGV0IGNvbmZpZyA9IGFwcGxpY2F0aW9uLmNvbmZpZztcblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBwcm9wZXJ0eSBlaXRoZXIgZG9lcyBub3QgZXhpc3Qgb24gdGhlIGNvbmZpZyBvYmplY3QsIG9yIGl0IGRvZXMgZXhpc3RcbiAgICogYW5kIGl0J3MgYGVuYWJsZWRgIHByb3BlcnR5IGlzIG5vdCBgZmFsc2VgLiBBbGwgdGhlIG1pZGRsZXdhcmUgaGVyZSBhcmUgb3B0IG91dCwgc28gdG8gZGlzYWJsZVxuICAgKiB5b3UgbXVzdCBkZWZpbmUgc2V0IHRoYXQgbWlkZGxld2FyZSdzIHJvb3QgY29uZmlnIHByb3BlcnR5IHRvIGB7IGVuYWJsZWQ6IGZhbHNlIH1gXG4gICAqL1xuICBmdW5jdGlvbiBpc0VuYWJsZWQocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICFjb25maWdbcHJvcF0gfHwgKGNvbmZpZ1twcm9wXSAmJiBjb25maWdbcHJvcF0uZW5hYmxlZCAhPT0gZmFsc2UpO1xuICB9XG5cbiAgaWYgKGlzRW5hYmxlZCgndGltaW5nJykpIHtcbiAgICByb3V0ZXIudXNlKHRpbWluZygpKTtcbiAgfVxuXG4gIGlmIChpc0VuYWJsZWQoJ2xvZ2dpbmcnKSkge1xuICAgIGxldCBkZWZhdWx0TG9nZ2luZ0Zvcm1hdCA9IGFwcGxpY2F0aW9uLmVudmlyb25tZW50ID09PSAncHJvZHVjdGlvbicgPyAnY29tYmluZWQnIDogJ2Rldic7XG4gICAgbGV0IGRlZmF1bHRMb2dnaW5nT3B0aW9ucyA9IHtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wbGV0ZWQtZG9jc1xuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGFwcGxpY2F0aW9uLmVudmlyb25tZW50ID09PSAndGVzdCc7XG4gICAgICB9XG4gICAgfTtcbiAgICBsZXQgZm9ybWF0ID0gKGNvbmZpZy5sb2dnaW5nICYmIGNvbmZpZy5sb2dnaW5nLmZvcm1hdCkgfHwgZGVmYXVsdExvZ2dpbmdGb3JtYXQ7XG4gICAgbGV0IG9wdGlvbnMgPSBkZWZhdWx0cyhjb25maWcubG9nZ2luZyB8fCB7fSwgZGVmYXVsdExvZ2dpbmdPcHRpb25zKTtcbiAgICByb3V0ZXIudXNlKG1vcmdhbihmb3JtYXQsIG9wdGlvbnMpKTtcblxuICAgIC8vIFBhdGNoIG1vcmdhbiB0byByZWFkIGZyb20gb3VyIG5vbi1leHByZXNzIHJlc3BvbnNlXG4gICAgbW9yZ2FuLnRva2VuKCdyZXMnLCAocmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UsIGZpZWxkOiBzdHJpbmcpID0+IHtcbiAgICAgIGxldCBoZWFkZXIgPSByZXMuZ2V0SGVhZGVyKGZpZWxkKTtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGhlYWRlcikgPyBoZWFkZXIuam9pbignLCAnKSA6IGhlYWRlcjtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChpc0VuYWJsZWQoJ2NvbXByZXNzaW9uJykpIHtcbiAgICByb3V0ZXIudXNlKGNvbXByZXNzaW9uKCkpO1xuICB9XG5cbiAgaWYgKGlzRW5hYmxlZCgnY29va2llcycpKSB7XG4gICAgcm91dGVyLnVzZShjb29raWVzKGNvbmZpZy5jb29raWVzKSk7XG4gIH1cblxuICBpZiAoaXNFbmFibGVkKCdjb3JzJykpIHtcbiAgICByb3V0ZXIudXNlKGNvcnMoY29uZmlnLmNvcnMpKTtcbiAgfVxuXG4gIGlmIChpc0VuYWJsZWQoJ3hzc0ZpbHRlcicpKSB7XG4gICAgcm91dGVyLnVzZShoZWxtZXQueHNzRmlsdGVyKCkpO1xuICB9XG5cbiAgaWYgKGlzRW5hYmxlZCgnZnJhbWVndWFyZCcpKSB7XG4gICAgcm91dGVyLnVzZShoZWxtZXQuZnJhbWVndWFyZCgpKTtcbiAgfVxuXG4gIGlmIChpc0VuYWJsZWQoJ2hpZGVQb3dlcmVkQnknKSkge1xuICAgIHJvdXRlci51c2UoaGVsbWV0LmhpZGVQb3dlcmVkQnkoKSk7XG4gIH1cblxuICBpZiAoaXNFbmFibGVkKCdpZU5vT3BlbicpKSB7XG4gICAgcm91dGVyLnVzZShoZWxtZXQuaWVOb09wZW4oKSk7XG4gIH1cblxuICBpZiAoaXNFbmFibGVkKCdub1NuaWZmJykpIHtcbiAgICByb3V0ZXIudXNlKGhlbG1ldC5ub1NuaWZmKCkpO1xuICB9XG5cbiAgaWYgKGlzRW5hYmxlZCgnYm9keVBhcnNlcicpKSB7XG4gICAgcm91dGVyLnVzZShqc29uKHsgdHlwZTogY29uZmlnLmJvZHlQYXJzZXIgJiYgY29uZmlnLmJvZHlQYXJzZXIudHlwZSB9KSk7XG4gIH1cblxufVxuIl19