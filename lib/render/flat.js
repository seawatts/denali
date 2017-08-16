"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const assert = require("assert");
const bluebird_1 = require("bluebird");
const serializer_1 = require("./serializer");
/**
 * Renders the payload as a flat JSON object or array at the top level. Related
 * models are embedded.
 *
 * @package data
 */
class FlatSerializer extends serializer_1.default {
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
            if (body instanceof Error) {
                return this.renderError(body, action, options);
            }
            return this.renderPrimary(body, action, options);
        });
    }
    /**
     * Renders a primary data payload (a model or array of models).
     */
    renderPrimary(payload, action, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (lodash_1.isArray(payload)) {
                return yield bluebird_1.all(payload.map((model) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return yield this.renderModel(model, action, options);
                })));
            }
            return yield this.renderModel(payload, action, options);
        });
    }
    /**
     * Renders an individual model
     */
    renderModel(model, action, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let id = model.id;
            let attributes = this.serializeAttributes(model, action, options);
            let relationships = yield this.serializeRelationships(model, action, options);
            return lodash_1.assign({ id }, attributes, relationships);
        });
    }
    /**
     * Serialize the attributes for a given model
     */
    serializeAttributes(model, action, options) {
        let serializedAttributes = {};
        let attributes = this.attributesToSerialize(action, options);
        attributes.forEach((attributeName) => {
            let key = this.serializeAttributeName(attributeName);
            let rawValue = model[attributeName];
            if (!lodash_1.isUndefined(rawValue)) {
                let value = this.serializeAttributeValue(rawValue, key, model);
                serializedAttributes[key] = value;
            }
        });
        return serializedAttributes;
    }
    /**
     * Transform attribute names into their over-the-wire representation. Default
     * behavior uses the attribute name as-is.
     */
    serializeAttributeName(attributeName) {
        return attributeName;
    }
    /**
     * Take an attribute value and return the serialized value. Useful for
     * changing how certain types of values are serialized, i.e. Date objects.
     *
     * The default implementation returns the attribute's value unchanged.
     */
    serializeAttributeValue(value, key, model) {
        return value;
    }
    /**
     * Serialize the relationships for a given model
     */
    serializeRelationships(model, action, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let serializedRelationships = {};
            let relationships = this.relationshipsToSerialize(action, options);
            // The result of this.relationships is a whitelist of which relationships
            // should be serialized, and the configuration for their serialization
            for (let relationshipName in this.relationships) {
                let config = relationships[relationshipName];
                let key = config.key || this.serializeRelationshipName(relationshipName);
                let descriptor = model.constructor[relationshipName];
                assert(descriptor, `You specified a '${relationshipName}' relationship in your ${model.constructor.type} serializer, but no such relationship is defined on the ${model.constructor.type} model`);
                serializedRelationships[key] = yield this.serializeRelationship(relationshipName, config, descriptor, model, action, options);
            }
            return serializedRelationships;
        });
    }
    /**
     * Serializes a relationship
     */
    serializeRelationship(relationship, config, descriptor, model, action, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relatedSerializer = this.container.lookup(`serializer:${descriptor.type}`, { loose: true }) || this.container.lookup(`serializer:application`, { loose: true });
            assert(relatedSerializer, `No serializer found for ${descriptor.type}, and no fallback application serializer found either`);
            if (descriptor.mode === 'hasMany') {
                let relatedModels = yield model.getRelated(relationship);
                return yield bluebird_1.all(relatedModels.map((relatedModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (config.strategy === 'embed') {
                        return yield relatedSerializer.renderModel(relatedModel, action, options);
                    }
                    else if (config.strategy === 'id') {
                        return relatedModel.id;
                    }
                })));
            }
            else {
                let relatedModel = yield model.getRelated(relationship);
                if (config.strategy === 'embed') {
                    return yield relatedSerializer.renderModel(relatedModel, action, options);
                }
                else if (config.strategy === 'id') {
                    return relatedModel.id;
                }
            }
        });
    }
    /**
     * Transform relationship names into their over-the-wire representation. Default
     * behavior uses the relationship name as-is.
     *
     * @protected
     * @param {string} name
     * @returns {string}
     */
    serializeRelationshipName(name) {
        return name;
    }
    /**
     * Render an error payload
     */
    renderError(error, action, options) {
        return {
            status: error.status || 500,
            code: error.code || 'InternalServerError',
            message: error.message
        };
    }
}
exports.default = FlatSerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3JlbmRlci9mbGF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUlnQjtBQUNoQixpQ0FBaUM7QUFDakMsdUNBQStCO0FBQy9CLDZDQUE4RDtBQUs5RDs7Ozs7R0FLRztBQUNILG9CQUE2QyxTQUFRLG9CQUFVO0lBQS9EOztRQUVFOztXQUVHO1FBQ0gsZ0JBQVcsR0FBRyxrQkFBa0IsQ0FBQztJQXlJbkMsQ0FBQztJQXZJQzs7T0FFRztJQUNHLFNBQVMsQ0FBQyxJQUFTLEVBQUUsTUFBYyxFQUFFLFVBQXlCLEVBQUU7O1lBQ3BFLEVBQUUsQ0FBQyxDQUFDLElBQUksWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELENBQUM7S0FBQTtJQUVEOztPQUVHO0lBQ2EsYUFBYSxDQUFDLE9BQXNCLEVBQUUsTUFBYyxFQUFFLE9BQXNCOztZQUMxRixFQUFFLENBQUMsQ0FBQyxnQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckIsTUFBTSxDQUFDLE1BQU0sY0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBTyxLQUFLO29CQUN2QyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3hELENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQztZQUNOLENBQUM7WUFDRCxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMs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WUFDTixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxZQUFZLEdBQVUsTUFBTSxLQUFLLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMvRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUM1RSxDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO2dCQUN6QixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7S0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDTyx5QkFBeUIsQ0FBQyxJQUFZO1FBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDTyxXQUFXLENBQUMsS0FBVSxFQUFFLE1BQWMsRUFBRSxPQUFZO1FBQzVELE1BQU0sQ0FBQztZQUNMLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxJQUFJLEdBQUc7WUFDM0IsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUkscUJBQXFCO1lBQ3pDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztTQUN2QixDQUFDO0lBQ0osQ0FBQztDQUVGO0FBOUlELGlDQThJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzQXJyYXksXG4gIGFzc2lnbixcbiAgaXNVbmRlZmluZWRcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgYWxsIH0gZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IFNlcmlhbGl6ZXIsIHsgUmVsYXRpb25zaGlwQ29uZmlnIH0gZnJvbSAnLi9zZXJpYWxpemVyJztcbmltcG9ydCBNb2RlbCBmcm9tICcuLi9kYXRhL21vZGVsJztcbmltcG9ydCBBY3Rpb24sIHsgUmVuZGVyT3B0aW9ucyB9IGZyb20gJy4uL3J1bnRpbWUvYWN0aW9uJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IgfSBmcm9tICcuLi9kYXRhL2Rlc2NyaXB0b3JzJztcblxuLyoqXG4gKiBSZW5kZXJzIHRoZSBwYXlsb2FkIGFzIGEgZmxhdCBKU09OIG9iamVjdCBvciBhcnJheSBhdCB0aGUgdG9wIGxldmVsLiBSZWxhdGVkXG4gKiBtb2RlbHMgYXJlIGVtYmVkZGVkLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgRmxhdFNlcmlhbGl6ZXIgZXh0ZW5kcyBTZXJpYWxpemVyIHtcblxuICAvKipcbiAgICogVGhlIGRlZmF1bHQgY29udGVudCB0eXBlIHRvIGFwcGx5IHRvIHJlc3BvbnNlcyBmb3JtYXR0ZWQgYnkgdGhpcyBzZXJpYWxpemVyXG4gICAqL1xuICBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJztcblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgcGF5bG9hZCwgZWl0aGVyIGEgcHJpbWFyeSBkYXRhIG1vZGVsKHMpIG9yIGFuIGVycm9yIHBheWxvYWQuXG4gICAqL1xuICBhc3luYyBzZXJpYWxpemUoYm9keTogYW55LCBhY3Rpb246IEFjdGlvbiwgb3B0aW9uczogUmVuZGVyT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoYm9keSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJFcnJvcihib2R5LCBhY3Rpb24sIG9wdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJQcmltYXJ5KGJvZHksIGFjdGlvbiwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyBhIHByaW1hcnkgZGF0YSBwYXlsb2FkIChhIG1vZGVsIG9yIGFycmF5IG9mIG1vZGVscykuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcmVuZGVyUHJpbWFyeShwYXlsb2FkOiBNb2RlbHxNb2RlbFtdLCBhY3Rpb246IEFjdGlvbiwgb3B0aW9uczogUmVuZGVyT3B0aW9ucyk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQXJyYXkocGF5bG9hZCkpIHtcbiAgICAgIHJldHVybiBhd2FpdCBhbGwocGF5bG9hZC5tYXAoYXN5bmMgKG1vZGVsKSA9PiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlbmRlck1vZGVsKG1vZGVsLCBhY3Rpb24sIG9wdGlvbnMpO1xuICAgICAgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5yZW5kZXJNb2RlbChwYXlsb2FkLCBhY3Rpb24sIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgYW4gaW5kaXZpZHVhbCBtb2RlbFxuICAgKi9cbiAgYXN5bmMgcmVuZGVyTW9kZWwobW9kZWw6IE1vZGVsLCBhY3Rpb246IEFjdGlvbiwgb3B0aW9uczogUmVuZGVyT3B0aW9ucyk6IFByb21pc2U8YW55PiB7XG4gICAgbGV0IGlkID0gbW9kZWwuaWQ7XG4gICAgbGV0IGF0dHJpYnV0ZXMgPSB0aGlzLnNlcmlhbGl6ZUF0dHJpYnV0ZXMobW9kZWwsIGFjdGlvbiwgb3B0aW9ucyk7XG4gICAgbGV0IHJlbGF0aW9uc2hpcHMgPSBhd2FpdCB0aGlzLnNlcmlhbGl6ZVJlbGF0aW9uc2hpcHMobW9kZWwsIGFjdGlvbiwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIGFzc2lnbih7IGlkIH0sIGF0dHJpYnV0ZXMsIHJlbGF0aW9uc2hpcHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSB0aGUgYXR0cmlidXRlcyBmb3IgYSBnaXZlbiBtb2RlbFxuICAgKi9cbiAgcHJvdGVjdGVkIHNlcmlhbGl6ZUF0dHJpYnV0ZXMobW9kZWw6IE1vZGVsLCBhY3Rpb246IEFjdGlvbiwgb3B0aW9uczogUmVuZGVyT3B0aW9ucyk6IGFueSB7XG4gICAgbGV0IHNlcmlhbGl6ZWRBdHRyaWJ1dGVzOiBhbnkgPSB7fTtcbiAgICBsZXQgYXR0cmlidXRlcyA9IHRoaXMuYXR0cmlidXRlc1RvU2VyaWFsaXplKGFjdGlvbiwgb3B0aW9ucyk7IFxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlTmFtZSkgPT4ge1xuICAgICAgbGV0IGtleSA9IHRoaXMuc2VyaWFsaXplQXR0cmlidXRlTmFtZShhdHRyaWJ1dGVOYW1lKTtcbiAgICAgIGxldCByYXdWYWx1ZSA9IG1vZGVsW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgaWYgKCFpc1VuZGVmaW5lZChyYXdWYWx1ZSkpIHtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5zZXJpYWxpemVBdHRyaWJ1dGVWYWx1ZShyYXdWYWx1ZSwga2V5LCBtb2RlbCk7XG4gICAgICAgIHNlcmlhbGl6ZWRBdHRyaWJ1dGVzW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc2VyaWFsaXplZEF0dHJpYnV0ZXM7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtIGF0dHJpYnV0ZSBuYW1lcyBpbnRvIHRoZWlyIG92ZXItdGhlLXdpcmUgcmVwcmVzZW50YXRpb24uIERlZmF1bHRcbiAgICogYmVoYXZpb3IgdXNlcyB0aGUgYXR0cmlidXRlIG5hbWUgYXMtaXMuXG4gICAqL1xuICBwcm90ZWN0ZWQgc2VyaWFsaXplQXR0cmlidXRlTmFtZShhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBhdHRyaWJ1dGVOYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgYW4gYXR0cmlidXRlIHZhbHVlIGFuZCByZXR1cm4gdGhlIHNlcmlhbGl6ZWQgdmFsdWUuIFVzZWZ1bCBmb3JcbiAgICogY2hhbmdpbmcgaG93IGNlcnRhaW4gdHlwZXMgb2YgdmFsdWVzIGFyZSBzZXJpYWxpemVkLCBpLmUuIERhdGUgb2JqZWN0cy5cbiAgICpcbiAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gcmV0dXJucyB0aGUgYXR0cmlidXRlJ3MgdmFsdWUgdW5jaGFuZ2VkLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNlcmlhbGl6ZUF0dHJpYnV0ZVZhbHVlKHZhbHVlOiBhbnksIGtleTogc3RyaW5nLCBtb2RlbDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSByZWxhdGlvbnNoaXBzIGZvciBhIGdpdmVuIG1vZGVsXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgc2VyaWFsaXplUmVsYXRpb25zaGlwcyhtb2RlbDogYW55LCBhY3Rpb246IEFjdGlvbiwgb3B0aW9uczogUmVuZGVyT3B0aW9ucyk6IFByb21pc2U8eyBba2V5OiBzdHJpbmddOiBhbnkgfT4ge1xuICAgIGxldCBzZXJpYWxpemVkUmVsYXRpb25zaGlwczogeyBba2V5OiBzdHJpbmcgXTogYW55IH0gPSB7fTtcbiAgICBsZXQgcmVsYXRpb25zaGlwcyA9IHRoaXMucmVsYXRpb25zaGlwc1RvU2VyaWFsaXplKGFjdGlvbiwgb3B0aW9ucyk7IFxuXG4gICAgLy8gVGhlIHJlc3VsdCBvZiB0aGlzLnJlbGF0aW9uc2hpcHMgaXMgYSB3aGl0ZWxpc3Qgb2Ygd2hpY2ggcmVsYXRpb25zaGlwc1xuICAgIC8vIHNob3VsZCBiZSBzZXJpYWxpemVkLCBhbmQgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZWlyIHNlcmlhbGl6YXRpb25cbiAgICBmb3IgKGxldCByZWxhdGlvbnNoaXBOYW1lIGluIHRoaXMucmVsYXRpb25zaGlwcykge1xuICAgICAgbGV0IGNvbmZpZyA9IHJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwTmFtZV07XG4gICAgICBsZXQga2V5ID0gY29uZmlnLmtleSB8fCB0aGlzLnNlcmlhbGl6ZVJlbGF0aW9uc2hpcE5hbWUocmVsYXRpb25zaGlwTmFtZSk7XG4gICAgICBsZXQgZGVzY3JpcHRvciA9IG1vZGVsLmNvbnN0cnVjdG9yW3JlbGF0aW9uc2hpcE5hbWVdO1xuICAgICAgYXNzZXJ0KGRlc2NyaXB0b3IsIGBZb3Ugc3BlY2lmaWVkIGEgJyR7IHJlbGF0aW9uc2hpcE5hbWUgfScgcmVsYXRpb25zaGlwIGluIHlvdXIgJHsgbW9kZWwuY29uc3RydWN0b3IudHlwZSB9IHNlcmlhbGl6ZXIsIGJ1dCBubyBzdWNoIHJlbGF0aW9uc2hpcCBpcyBkZWZpbmVkIG9uIHRoZSAkeyBtb2RlbC5jb25zdHJ1Y3Rvci50eXBlIH0gbW9kZWxgKTtcbiAgICAgIHNlcmlhbGl6ZWRSZWxhdGlvbnNoaXBzW2tleV0gPSBhd2FpdCB0aGlzLnNlcmlhbGl6ZVJlbGF0aW9uc2hpcChyZWxhdGlvbnNoaXBOYW1lLCBjb25maWcsIGRlc2NyaXB0b3IsIG1vZGVsLCBhY3Rpb24sIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiBzZXJpYWxpemVkUmVsYXRpb25zaGlwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemVzIGEgcmVsYXRpb25zaGlwXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgc2VyaWFsaXplUmVsYXRpb25zaGlwKHJlbGF0aW9uc2hpcDogc3RyaW5nLCBjb25maWc6IFJlbGF0aW9uc2hpcENvbmZpZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgbW9kZWw6IE1vZGVsLCBhY3Rpb246IEFjdGlvbiwgb3B0aW9uczogUmVuZGVyT3B0aW9ucykge1xuICAgIGxldCByZWxhdGVkU2VyaWFsaXplciA9IHRoaXMuY29udGFpbmVyLmxvb2t1cDxGbGF0U2VyaWFsaXplcj4oYHNlcmlhbGl6ZXI6JHsgZGVzY3JpcHRvci50eXBlIH1gLCB7IGxvb3NlOiB0cnVlIH0pIHx8IHRoaXMuY29udGFpbmVyLmxvb2t1cDxGbGF0U2VyaWFsaXplcj4oYHNlcmlhbGl6ZXI6YXBwbGljYXRpb25gLCB7IGxvb3NlOiB0cnVlIH0pO1xuICAgIGFzc2VydChyZWxhdGVkU2VyaWFsaXplciwgYE5vIHNlcmlhbGl6ZXIgZm91bmQgZm9yICR7IGRlc2NyaXB0b3IudHlwZSB9LCBhbmQgbm8gZmFsbGJhY2sgYXBwbGljYXRpb24gc2VyaWFsaXplciBmb3VuZCBlaXRoZXJgKTtcbiAgICBpZiAoZGVzY3JpcHRvci5tb2RlID09PSAnaGFzTWFueScpIHtcbiAgICAgIGxldCByZWxhdGVkTW9kZWxzID0gPE1vZGVsW10+YXdhaXQgbW9kZWwuZ2V0UmVsYXRlZChyZWxhdGlvbnNoaXApO1xuICAgICAgcmV0dXJuIGF3YWl0IGFsbChyZWxhdGVkTW9kZWxzLm1hcChhc3luYyAocmVsYXRlZE1vZGVsOiBNb2RlbCkgPT4ge1xuICAgICAgICBpZiAoY29uZmlnLnN0cmF0ZWd5ID09PSAnZW1iZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHJlbGF0ZWRTZXJpYWxpemVyLnJlbmRlck1vZGVsKHJlbGF0ZWRNb2RlbCwgYWN0aW9uLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb25maWcuc3RyYXRlZ3kgPT09ICdpZCcpIHtcbiAgICAgICAgICByZXR1cm4gcmVsYXRlZE1vZGVsLmlkO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZWxhdGVkTW9kZWwgPSA8TW9kZWw+YXdhaXQgbW9kZWwuZ2V0UmVsYXRlZChyZWxhdGlvbnNoaXApO1xuICAgICAgaWYgKGNvbmZpZy5zdHJhdGVneSA9PT0gJ2VtYmVkJykge1xuICAgICAgICByZXR1cm4gYXdhaXQgcmVsYXRlZFNlcmlhbGl6ZXIucmVuZGVyTW9kZWwocmVsYXRlZE1vZGVsLCBhY3Rpb24sIG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIGlmIChjb25maWcuc3RyYXRlZ3kgPT09ICdpZCcpIHtcbiAgICAgICAgcmV0dXJuIHJlbGF0ZWRNb2RlbC5pZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtIHJlbGF0aW9uc2hpcCBuYW1lcyBpbnRvIHRoZWlyIG92ZXItdGhlLXdpcmUgcmVwcmVzZW50YXRpb24uIERlZmF1bHRcbiAgICogYmVoYXZpb3IgdXNlcyB0aGUgcmVsYXRpb25zaGlwIG5hbWUgYXMtaXMuXG4gICAqXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHByb3RlY3RlZCBzZXJpYWxpemVSZWxhdGlvbnNoaXBOYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGFuIGVycm9yIHBheWxvYWRcbiAgICovXG4gIHByb3RlY3RlZCByZW5kZXJFcnJvcihlcnJvcjogYW55LCBhY3Rpb246IEFjdGlvbiwgb3B0aW9uczogYW55KTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMgfHwgNTAwLFxuICAgICAgY29kZTogZXJyb3IuY29kZSB8fCAnSW50ZXJuYWxTZXJ2ZXJFcnJvcicsXG4gICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=