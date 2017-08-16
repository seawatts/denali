"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const assert = require("assert");
const typeis = require("type-is");
const parser_1 = require("./parser");
const errors_1 = require("../runtime/errors");
const set_if_not_empty_1 = require("../utils/set-if-not-empty");
const inflection_1 = require("inflection");
class JSONAPIParser extends parser_1.default {
    /**
     * Unlike the other serializers, the default parse implementation does modify the incoming
     * payload. It converts the default dasherized attribute names into camelCase.
     *
     * The parse method here retains the JSONAPI document structure (i.e. data, included, links, meta,
     * etc), only modifying resource objects in place.
     */
    parse(request) {
        let result = {
            query: request.query,
            headers: request.headers,
            params: request.params
        };
        if (!typeis.hasBody(request) || !request.body) {
            return result;
        }
        try {
            assert(request.get('content-type') === 'application/vnd.api+json', 'Invalid content type - must have `application/vnd.api+json` as the request content type');
            assert(request.body.data, 'Invalid JSON-API document (missing top level `data` object - see http://jsonapi.org/format/#document-top-level)');
            let parseResource = this.parseResource.bind(this);
            if (request.body.data) {
                if (!lodash_1.isArray(request.body.data)) {
                    result.body = parseResource(request.body.data);
                }
                else {
                    result.body = request.body.data.map(parseResource);
                }
            }
            if (request.body.included) {
                result.included = request.body.included.map(parseResource);
            }
            return result;
        }
        catch (e) {
            if (e.name === 'AssertionError') {
                throw new errors_1.default.BadRequest(e.message);
            }
            throw e;
        }
    }
    /**
     * Parse a single resource object from a JSONAPI document. The resource object could come from the
     * top level `data` payload, or from the sideloaded `included` records.
     */
    parseResource(resource) {
        let parsedResource = {};
        set_if_not_empty_1.default(parsedResource, 'id', this.parseId(resource.id));
        Object.assign(parsedResource, this.parseAttributes(resource.attributes));
        Object.assign(parsedResource, this.parseRelationships(resource.relationships));
        return parsedResource;
    }
    /**
     * Parse a resource object id
     */
    parseId(id) {
        return id;
    }
    /**
     * Parse a resource object's type string
     */
    parseType(type) {
        return inflection_1.singularize(type);
    }
    /**
     * Parse a resource object's attributes. By default, this converts from the JSONAPI recommended
     * dasheried keys to camelCase.
     */
    parseAttributes(attrs) {
        return lodash_1.mapKeys(attrs, (value, key) => {
            return lodash_1.camelCase(key);
        });
    }
    /**
     * Parse a resource object's relationships. By default, this converts from the JSONAPI recommended
     * dasheried keys to camelCase.
     */
    parseRelationships(relationships) {
        return lodash_1.mapKeys(relationships, (value, key) => {
            return lodash_1.camelCase(key);
        });
    }
}
exports.default = JSONAPIParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1hcGkuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9wYXJzZS9qc29uLWFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUlnQjtBQUNoQixpQ0FBaUM7QUFDakMsa0NBQWtDO0FBQ2xDLHFDQUE4QjtBQUM5Qiw4Q0FBdUM7QUFHdkMsZ0VBQXNEO0FBQ3RELDJDQUF5QztBQU96QyxtQkFBbUMsU0FBUSxnQkFBTTtJQUUvQzs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsT0FBZ0I7UUFDcEIsSUFBSSxNQUFNLEdBQW9CO1lBQzVCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztZQUNwQixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87WUFDeEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1NBQ3ZCLENBQUM7UUFFRixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxJQUFJLENBQUM7WUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSywwQkFBMEIsRUFBRSx5RkFBeUYsQ0FBQyxDQUFDO1lBQzlKLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxpSEFBaUgsQ0FBQyxDQUFDO1lBRTdJLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxNQUFNLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqRCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDO1lBQ0gsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUVELE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDWCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFDaEMsTUFBTSxJQUFJLGdCQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLENBQUM7UUFDVixDQUFDO0lBQ0gsQ0FBQztJQUdEOzs7T0FHRztJQUNPLGFBQWEsQ0FBQyxRQUErQjtRQUNyRCxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDeEIsMEJBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN6RSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDL0UsTUFBTSxDQUFDLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQ7O09BRUc7SUFDTyxPQUFPLENBQUMsRUFBVTtRQUMxQixNQUFNLENBQUMsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVEOztPQUVHO0lBQ08sU0FBUyxDQUFDLElBQVk7UUFDOUIsTUFBTSxDQUFDLHdCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7T0FHRztJQUNPLGVBQWUsQ0FBQyxLQUF3QjtRQUNoRCxNQUFNLENBQUMsZ0JBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRztZQUMvQixNQUFNLENBQUMsa0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDTyxrQkFBa0IsQ0FBQyxhQUFtQztRQUM5RCxNQUFNLENBQUMsZ0JBQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRztZQUN2QyxNQUFNLENBQUMsa0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FFRjtBQTlGRCxnQ0E4RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc0FycmF5LFxuICBtYXBLZXlzLFxuICBjYW1lbENhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0ICogYXMgdHlwZWlzIGZyb20gJ3R5cGUtaXMnO1xuaW1wb3J0IFBhcnNlciBmcm9tICcuL3BhcnNlcic7XG5pbXBvcnQgRXJyb3JzIGZyb20gJy4uL3J1bnRpbWUvZXJyb3JzJztcbmltcG9ydCB7IFJlc3BvbmRlclBhcmFtcyB9IGZyb20gJy4uL3J1bnRpbWUvYWN0aW9uJztcbmltcG9ydCBSZXF1ZXN0IGZyb20gJy4uL3J1bnRpbWUvcmVxdWVzdCc7XG5pbXBvcnQgc2V0SWZOb3RFbXB0eSBmcm9tICcuLi91dGlscy9zZXQtaWYtbm90LWVtcHR5JztcbmltcG9ydCB7IHNpbmd1bGFyaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5pbXBvcnQge1xuICBKc29uQXBpUmVzb3VyY2VPYmplY3QsXG4gIEpzb25BcGlBdHRyaWJ1dGVzLFxuICBKc29uQXBpUmVsYXRpb25zaGlwc1xufSBmcm9tICcuLi9yZW5kZXIvanNvbi1hcGknO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBKU09OQVBJUGFyc2VyIGV4dGVuZHMgUGFyc2VyIHtcblxuICAvKipcbiAgICogVW5saWtlIHRoZSBvdGhlciBzZXJpYWxpemVycywgdGhlIGRlZmF1bHQgcGFyc2UgaW1wbGVtZW50YXRpb24gZG9lcyBtb2RpZnkgdGhlIGluY29taW5nXG4gICAqIHBheWxvYWQuIEl0IGNvbnZlcnRzIHRoZSBkZWZhdWx0IGRhc2hlcml6ZWQgYXR0cmlidXRlIG5hbWVzIGludG8gY2FtZWxDYXNlLlxuICAgKlxuICAgKiBUaGUgcGFyc2UgbWV0aG9kIGhlcmUgcmV0YWlucyB0aGUgSlNPTkFQSSBkb2N1bWVudCBzdHJ1Y3R1cmUgKGkuZS4gZGF0YSwgaW5jbHVkZWQsIGxpbmtzLCBtZXRhLFxuICAgKiBldGMpLCBvbmx5IG1vZGlmeWluZyByZXNvdXJjZSBvYmplY3RzIGluIHBsYWNlLlxuICAgKi9cbiAgcGFyc2UocmVxdWVzdDogUmVxdWVzdCk6IFJlc3BvbmRlclBhcmFtcyB7XG4gICAgbGV0IHJlc3VsdDogUmVzcG9uZGVyUGFyYW1zID0ge1xuICAgICAgcXVlcnk6IHJlcXVlc3QucXVlcnksXG4gICAgICBoZWFkZXJzOiByZXF1ZXN0LmhlYWRlcnMsXG4gICAgICBwYXJhbXM6IHJlcXVlc3QucGFyYW1zXG4gICAgfTtcblxuICAgIGlmICghdHlwZWlzLmhhc0JvZHkocmVxdWVzdCkgfHwgIXJlcXVlc3QuYm9keSkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgYXNzZXJ0KHJlcXVlc3QuZ2V0KCdjb250ZW50LXR5cGUnKSA9PT0gJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicsICdJbnZhbGlkIGNvbnRlbnQgdHlwZSAtIG11c3QgaGF2ZSBgYXBwbGljYXRpb24vdm5kLmFwaStqc29uYCBhcyB0aGUgcmVxdWVzdCBjb250ZW50IHR5cGUnKTtcbiAgICAgIGFzc2VydChyZXF1ZXN0LmJvZHkuZGF0YSwgJ0ludmFsaWQgSlNPTi1BUEkgZG9jdW1lbnQgKG1pc3NpbmcgdG9wIGxldmVsIGBkYXRhYCBvYmplY3QgLSBzZWUgaHR0cDovL2pzb25hcGkub3JnL2Zvcm1hdC8jZG9jdW1lbnQtdG9wLWxldmVsKScpO1xuXG4gICAgICBsZXQgcGFyc2VSZXNvdXJjZSA9IHRoaXMucGFyc2VSZXNvdXJjZS5iaW5kKHRoaXMpO1xuXG4gICAgICBpZiAocmVxdWVzdC5ib2R5LmRhdGEpIHtcbiAgICAgICAgaWYgKCFpc0FycmF5KHJlcXVlc3QuYm9keS5kYXRhKSkge1xuICAgICAgICAgIHJlc3VsdC5ib2R5ID0gcGFyc2VSZXNvdXJjZShyZXF1ZXN0LmJvZHkuZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LmJvZHkgPSByZXF1ZXN0LmJvZHkuZGF0YS5tYXAocGFyc2VSZXNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHJlcXVlc3QuYm9keS5pbmNsdWRlZCkge1xuICAgICAgICByZXN1bHQuaW5jbHVkZWQgPSByZXF1ZXN0LmJvZHkuaW5jbHVkZWQubWFwKHBhcnNlUmVzb3VyY2UpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgPT09ICdBc3NlcnRpb25FcnJvcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9ycy5CYWRSZXF1ZXN0KGUubWVzc2FnZSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgc2luZ2xlIHJlc291cmNlIG9iamVjdCBmcm9tIGEgSlNPTkFQSSBkb2N1bWVudC4gVGhlIHJlc291cmNlIG9iamVjdCBjb3VsZCBjb21lIGZyb20gdGhlXG4gICAqIHRvcCBsZXZlbCBgZGF0YWAgcGF5bG9hZCwgb3IgZnJvbSB0aGUgc2lkZWxvYWRlZCBgaW5jbHVkZWRgIHJlY29yZHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgcGFyc2VSZXNvdXJjZShyZXNvdXJjZTogSnNvbkFwaVJlc291cmNlT2JqZWN0KTogYW55IHtcbiAgICBsZXQgcGFyc2VkUmVzb3VyY2UgPSB7fTtcbiAgICBzZXRJZk5vdEVtcHR5KHBhcnNlZFJlc291cmNlLCAnaWQnLCB0aGlzLnBhcnNlSWQocmVzb3VyY2UuaWQpKTtcbiAgICBPYmplY3QuYXNzaWduKHBhcnNlZFJlc291cmNlLCB0aGlzLnBhcnNlQXR0cmlidXRlcyhyZXNvdXJjZS5hdHRyaWJ1dGVzKSk7XG4gICAgT2JqZWN0LmFzc2lnbihwYXJzZWRSZXNvdXJjZSwgdGhpcy5wYXJzZVJlbGF0aW9uc2hpcHMocmVzb3VyY2UucmVsYXRpb25zaGlwcykpO1xuICAgIHJldHVybiBwYXJzZWRSZXNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhIHJlc291cmNlIG9iamVjdCBpZFxuICAgKi9cbiAgcHJvdGVjdGVkIHBhcnNlSWQoaWQ6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgcmVzb3VyY2Ugb2JqZWN0J3MgdHlwZSBzdHJpbmdcbiAgICovXG4gIHByb3RlY3RlZCBwYXJzZVR5cGUodHlwZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc2luZ3VsYXJpemUodHlwZSk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgYSByZXNvdXJjZSBvYmplY3QncyBhdHRyaWJ1dGVzLiBCeSBkZWZhdWx0LCB0aGlzIGNvbnZlcnRzIGZyb20gdGhlIEpTT05BUEkgcmVjb21tZW5kZWRcbiAgICogZGFzaGVyaWVkIGtleXMgdG8gY2FtZWxDYXNlLlxuICAgKi9cbiAgcHJvdGVjdGVkIHBhcnNlQXR0cmlidXRlcyhhdHRyczogSnNvbkFwaUF0dHJpYnV0ZXMpOiBhbnkge1xuICAgIHJldHVybiBtYXBLZXlzKGF0dHJzLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgcmV0dXJuIGNhbWVsQ2FzZShrZXkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgcmVzb3VyY2Ugb2JqZWN0J3MgcmVsYXRpb25zaGlwcy4gQnkgZGVmYXVsdCwgdGhpcyBjb252ZXJ0cyBmcm9tIHRoZSBKU09OQVBJIHJlY29tbWVuZGVkXG4gICAqIGRhc2hlcmllZCBrZXlzIHRvIGNhbWVsQ2FzZS5cbiAgICovXG4gIHByb3RlY3RlZCBwYXJzZVJlbGF0aW9uc2hpcHMocmVsYXRpb25zaGlwczogSnNvbkFwaVJlbGF0aW9uc2hpcHMpOiBhbnkge1xuICAgIHJldHVybiBtYXBLZXlzKHJlbGF0aW9uc2hpcHMsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICByZXR1cm4gY2FtZWxDYXNlKGtleSk7XG4gICAgfSk7XG4gIH1cblxufVxuIl19