"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const serializer_1 = require("./serializer");
/**
 * Renders the payload as a flat JSON object or array at the top level. Related
 * models are embedded.
 *
 * @package data
 */
class RawSerializer extends serializer_1.default {
    constructor() {
        super(...arguments);
        /**
         * The default content type to apply to responses formatted by this serializer
         */
        this.contentType = 'application/json';
    }
    /**
     * Renders the payload, either a primary data model(s) or an error payload.
     */
    serialize(body, action, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return body;
        });
    }
}
exports.default = RawSerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF3LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvcmVuZGVyL3Jhdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBc0M7QUFHdEM7Ozs7O0dBS0c7QUFDSCxtQkFBNEMsU0FBUSxvQkFBVTtJQUE5RDs7UUFFRTs7V0FFRztRQUNILGdCQUFXLEdBQUcsa0JBQWtCLENBQUM7SUFTbkMsQ0FBQztJQVBDOztPQUVHO0lBQ0csU0FBUyxDQUFDLElBQVMsRUFBRSxNQUFjLEVBQUUsVUFBeUIsRUFBRTs7WUFDcEUsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7S0FBQTtDQUVGO0FBZEQsZ0NBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2VyaWFsaXplciBmcm9tICcuL3NlcmlhbGl6ZXInO1xuaW1wb3J0IEFjdGlvbiwgeyBSZW5kZXJPcHRpb25zIH0gZnJvbSAnbGliL3J1bnRpbWUvYWN0aW9uJztcblxuLyoqXG4gKiBSZW5kZXJzIHRoZSBwYXlsb2FkIGFzIGEgZmxhdCBKU09OIG9iamVjdCBvciBhcnJheSBhdCB0aGUgdG9wIGxldmVsLiBSZWxhdGVkXG4gKiBtb2RlbHMgYXJlIGVtYmVkZGVkLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgUmF3U2VyaWFsaXplciBleHRlbmRzIFNlcmlhbGl6ZXIge1xuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCBjb250ZW50IHR5cGUgdG8gYXBwbHkgdG8gcmVzcG9uc2VzIGZvcm1hdHRlZCBieSB0aGlzIHNlcmlhbGl6ZXJcbiAgICovXG4gIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoZSBwYXlsb2FkLCBlaXRoZXIgYSBwcmltYXJ5IGRhdGEgbW9kZWwocykgb3IgYW4gZXJyb3IgcGF5bG9hZC5cbiAgICovXG4gIGFzeW5jIHNlcmlhbGl6ZShib2R5OiBhbnksIGFjdGlvbjogQWN0aW9uLCBvcHRpb25zOiBSZW5kZXJPcHRpb25zID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBib2R5O1xuICB9XG5cbn1cbiJdfQ==