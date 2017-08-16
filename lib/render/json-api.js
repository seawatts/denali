"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const assert = require("assert");
const path = require("path");
const inflection_1 = require("inflection");
const serializer_1 = require("./serializer");
const bluebird_1 = require("bluebird");
const set_if_not_empty_1 = require("../utils/set-if-not-empty");
/**
 * Renders the payload according to the JSONAPI 1.0 spec, including related resources, included
 * records, and support for meta and links.
 *
 * @package data
 */
class JSONAPISerializer extends serializer_1.default {
    constructor() {
        super(...arguments);
        /**
         * The default content type to use for any responses rendered by this serializer.
         */
        this.contentType = 'application/vnd.api+json';
    }
    /**
     * Take a response body (a model, an array of models, or an Error) and render it as a JSONAPI
     * compliant document
     */
    serialize(body, action, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let context = {
                action,
                body,
                options,
                document: {}
            };
            yield this.renderPrimary(context);
            yield this.renderIncluded(context);
            this.renderMeta(context);
            this.renderLinks(context);
            this.renderVersion(context);
            this.dedupeIncluded(context);
            return context.document;
        });
    }
    /**
     * Render the primary payload for a JSONAPI document (either a model or array of models).
     */
    renderPrimary(context) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let payload = context.body;
            if (lodash_1.isArray(payload)) {
                yield this.renderPrimaryArray(context, payload);
            }
            else {
                yield this.renderPrimaryObject(context, payload);
            }
        });
    }
    /**
     * Render the primary data for the document, either a single Model or a single Error.
     */
    renderPrimaryObject(context, payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (payload instanceof Error) {
                context.document.errors = [yield this.renderError(context, payload)];
            }
            else {
                context.document.data = yield this.renderRecord(context, payload);
            }
        });
    }
    /**
     * Render the primary data for the document, either an array of Models or Errors
     */
    renderPrimaryArray(context, payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (payload[0] instanceof Error) {
                context.document.errors = yield bluebird_1.map(payload, (error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    assert(error instanceof Error, 'You passed a mixed array of errors and models to the JSON-API serializer. The JSON-API spec does not allow for both `data` and `errors` top level objects in a response');
                    return yield this.renderError(context, error);
                }));
            }
            else {
                context.document.data = yield bluebird_1.map(payload, (record) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    assert(!(record instanceof Error), 'You passed a mixed array of errors and models to the JSON-API serializer. The JSON-API spec does not allow for both `data` and `errors` top level objects in a response');
                    return yield this.renderRecord(context, record);
                }));
            }
        });
    }
    /**
     * Render any included records supplied by the options into the top level of the document
     */
    renderIncluded(context) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (context.options.included) {
                assert(lodash_1.isArray(context.options.included), 'included records must be passed in as an array');
                context.document.included = yield bluebird_1.map(context.options.included, (includedRecord) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return yield this.renderRecord(context, includedRecord);
                }));
            }
        });
    }
    /**
     * Render top level meta object for a document. Default uses meta supplied in options call to
     * res.render().
     */
    renderMeta(context) {
        if (context.options.meta) {
            context.document.meta = context.options.meta;
        }
    }
    /**
     * Render top level links object for a document. Defaults to the links supplied in options.
     */
    renderLinks(context) {
        if (context.options.links) {
            context.document.links = context.options.links;
        }
    }
    /**
     * Render the version of JSONAPI supported.
     */
    renderVersion(context) {
        context.document.jsonapi = {
            version: '1.0'
        };
    }
    /**
     * Render the supplied record as a resource object.
     */
    renderRecord(context, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            assert(record, `Cannot serialize ${record}. You supplied ${record} instead of a Model instance.`);
            let serializedRecord = {
                type: inflection_1.pluralize(record.type),
                id: record.id
            };
            assert(serializedRecord.id != null, `Attempted to serialize a record (${record}) without an id, but the JSON-API spec requires all resources to have an id.`);
            set_if_not_empty_1.default(serializedRecord, 'attributes', this.attributesForRecord(context, record));
            set_if_not_empty_1.default(serializedRecord, 'relationships', yield this.relationshipsForRecord(context, record));
            set_if_not_empty_1.default(serializedRecord, 'links', this.linksForRecord(context, record));
            set_if_not_empty_1.default(serializedRecord, 'meta', this.metaForRecord(context, record));
            return serializedRecord;
        });
    }
    /**
     * Returns the JSONAPI attributes object representing this record's relationships
     */
    attributesForRecord(context, record) {
        let serializedAttributes = {};
        let attributes = this.attributesToSerialize(context.action, context.options);
        attributes.forEach((attributeName) => {
            let key = this.serializeAttributeName(context, attributeName);
            let rawValue = record[attributeName];
            if (!lodash_1.isUndefined(rawValue)) {
                let value = this.serializeAttributeValue(context, rawValue, key, record);
                serializedAttributes[key] = value;
            }
        });
        return serializedAttributes;
    }
    /**
     * The JSONAPI spec recommends (but does not require) that property names be dasherized. The
     * default implementation of this serializer therefore does that, but you can override this method
     * to use a different approach.
     */
    serializeAttributeName(context, name) {
        return lodash_1.kebabCase(name);
    }
    /**
     * Take an attribute value and return the serialized value. Useful for changing how certain types
     * of values are serialized, i.e. Date objects.
     *
     * The default implementation returns the attribute's value unchanged.
     */
    serializeAttributeValue(context, value, key, record) {
        return value;
    }
    /**
     * Returns the JSONAPI relationships object representing this record's relationships
     */
    relationshipsForRecord(context, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let serializedRelationships = {};
            let relationships = this.relationshipsToSerialize(context.action, context.options);
            // The result of this.relationships is a whitelist of which relationships should be serialized,
            // and the configuration for their serialization
            let relationshipNames = Object.keys(relationships);
            for (let name of relationshipNames) {
                let config = relationships[name];
                let key = config.key || this.serializeRelationshipName(context, name);
                let descriptor = record.constructor[name];
                assert(descriptor, `You specified a '${name}' relationship in your ${record.type} serializer, but no such relationship is defined on the ${record.type} model`);
                serializedRelationships[key] = yield this.serializeRelationship(context, name, config, descriptor, record);
            }
            return serializedRelationships;
        });
    }
    /**
     * Convert the relationship name to it's "over-the-wire" format. Defaults to dasherizing it.
     */
    serializeRelationshipName(context, name) {
        return lodash_1.kebabCase(name);
    }
    /**
     * Takes the serializer config and the model's descriptor for a relationship, and returns the
     * serialized relationship object. Also sideloads any full records if the relationship is so
     * configured.
     */
    serializeRelationship(context, name, config, descriptor, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relationship = {};
            set_if_not_empty_1.default(relationship, 'links', this.linksForRelationship(context, name, config, descriptor, record));
            set_if_not_empty_1.default(relationship, 'meta', this.metaForRelationship(context, name, config, descriptor, record));
            set_if_not_empty_1.default(relationship, 'data', yield this.dataForRelationship(context, name, config, descriptor, record));
            return relationship;
        });
    }
    /**
     * Returns the serialized form of the related Models for the given record and relationship.
     */
    dataForRelationship(context, name, config, descriptor, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relatedData = yield record.getRelated(name);
            if (descriptor.mode === 'hasMany') {
                return yield bluebird_1.map(relatedData, (relatedRecord) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return yield this.dataForRelatedRecord(context, name, relatedRecord, config, descriptor, record);
                }));
            }
            return yield this.dataForRelatedRecord(context, name, relatedData, config, descriptor, record);
        });
    }
    /**
     * Given a related record, return the resource object for that record, and sideload the record as
     * well.
     */
    dataForRelatedRecord(context, name, relatedRecord, config, descriptor, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // await this.includeRecord(context, name, relatedRecord, config, descriptor);
            return {
                type: inflection_1.pluralize(relatedRecord.type),
                id: relatedRecord.id
            };
        });
    }
    /**
     * Takes a relationship descriptor and the record it's for, and returns any links for that
     * relationship for that record. I.e. '/books/1/author'
     */
    linksForRelationship(context, name, config, descriptor, record) {
        let recordSelfLink = this.linksForRecord(context, record).self;
        let recordURL;
        if (typeof recordSelfLink === 'string') {
            recordURL = recordSelfLink;
        }
        else {
            recordURL = recordSelfLink.href;
        }
        return {
            self: path.join(recordURL, `relationships/${name}`),
            related: path.join(recordURL, name)
        };
    }
    /**
     * Returns any meta for a given relationship and record. No meta included by default.
     */
    metaForRelationship(context, name, config, descriptor, record) {
        // defaults to no meta content
    }
    /**
     * Returns links for a particular record, i.e. self: "/books/1". Default implementation assumes
     * the URL for a particular record maps to that type's `show` action, i.e. `books/show`.
     */
    linksForRecord(context, record) {
        let router = this.container.lookup('app:router');
        let url = router.urlFor(`${inflection_1.pluralize(record.type)}/show`, record);
        return typeof url === 'string' ? { self: url } : null;
    }
    /**
     * Returns meta for a particular record.
     */
    metaForRecord(context, record) {
        // defaults to no meta
    }
    /**
     * Sideloads a record into the top level "included" array
     */
    includeRecord(context, name, relatedRecord, config, descriptor) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            assert(relatedRecord, 'You tried to sideload an included record, but the record itself was not provided.');
            if (!lodash_1.isArray(context.document.included)) {
                context.document.included = [];
            }
            let relatedOptions = (context.options.relationships && context.options.relationships[name]) || context.options;
            let relatedSerializer = config.serializer || this.container.lookup(`serializer:${relatedRecord.type}`);
            let relatedContext = lodash_1.assign({}, context, { options: relatedOptions });
            context.document.included.push(yield relatedSerializer.renderRecord(relatedContext, relatedRecord));
        });
    }
    /**
     * Render the supplied error
     */
    renderError(context, error) {
        let renderedError = {
            status: error.status || 500,
            code: error.code || error.name || 'InternalServerError',
            detail: error.message
        };
        set_if_not_empty_1.default(renderedError, 'id', this.idForError(context, error));
        set_if_not_empty_1.default(renderedError, 'title', this.titleForError(context, error));
        set_if_not_empty_1.default(renderedError, 'source', this.sourceForError(context, error));
        set_if_not_empty_1.default(renderedError, 'meta', this.metaForError(context, error));
        set_if_not_empty_1.default(renderedError, 'links', this.linksForError(context, error));
        return renderedError;
    }
    /**
     * Given an error, return a unique id for this particular occurence of the problem.
     */
    idForError(context, error) {
        return error.id;
    }
    /**
     * A short, human-readable summary of the problem that SHOULD NOT change from occurrence to
     * occurrence of the problem, except for purposes of localization.
     */
    titleForError(context, error) {
        return error.title;
    }
    /**
     * Given an error, return a JSON Pointer, a URL query param name, or other info indicating the
     * source of the error.
     */
    sourceForError(context, error) {
        return error.source;
    }
    /**
     * Return the meta for a given error object. You could use this for example, to return debug
     * information in development environments.
     */
    metaForError(context, error) {
        return error.meta;
    }
    /**
     * Return a links object for an error. You could use this to link to a bug tracker report of the
     * error, for example.
     */
    linksForError(context, error) {
        // defaults to no links
    }
    /**
     * Remove duplicate entries from the sideloaded data.
     */
    dedupeIncluded(context) {
        if (lodash_1.isArray(context.document.included)) {
            context.document.included = lodash_1.uniqBy(context.document.included, (resource) => {
                return `${resource.type}/${resource.id}`;
            });
        }
    }
}
exports.default = JSONAPISerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1hcGkuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9yZW5kZXIvanNvbi1hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBTWdCO0FBQ2hCLGlDQUFpQztBQUNqQyw2QkFBNkI7QUFDN0IsMkNBQXVDO0FBQ3ZDLDZDQUFzQztBQU10Qyx1Q0FBK0I7QUFDL0IsZ0VBQXNEO0FBcUp0RDs7Ozs7R0FLRztBQUNILHVCQUFnRCxTQUFRLG9CQUFVO0lBQWxFOztRQUVFOztXQUVHO1FBQ0gsZ0JBQVcsR0FBRywwQkFBMEIsQ0FBQztJQXlWM0MsQ0FBQztJQXZWQzs7O09BR0c7SUFDRyxTQUFTLENBQUMsSUFBUyxFQUFFLE1BQWMsRUFBRSxPQUFzQjs7WUFDL0QsSUFBSSxPQUFPLEdBQVk7Z0JBQ3JCLE1BQU07Z0JBQ04sSUFBSTtnQkFDSixPQUFPO2dCQUNQLFFBQVEsRUFBRSxFQUFFO2FBQ2IsQ0FBQztZQUNGLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUMxQixDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNhLGFBQWEsQ0FBQyxPQUFnQjs7WUFDNUMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxnQkFBTyxDQUFD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QUNsRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRUQ7OztPQUdHO0lBQ08sY0FBYyxDQUFDLE9BQWdCLEVBQUUsS0FBVTtRQUNuRCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBRUQ7OztPQUdHO0lBQ08sWUFBWSxDQUFDLE9BQWdCLEVBQUUsS0FBVTtRQUNqRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQ7OztPQUdHO0lBQ08sYUFBYSxDQUFDLE9BQWdCLEVBQUUsS0FBVTtRQUNsRCx1QkFBdUI7SUFDekIsQ0FBQztJQUVEOztPQUVHO0lBQ08sY0FBYyxDQUFDLE9BQWdCO1FBQ3ZDLEVBQUUsQ0FBQyxDQUFDLGdCQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsZUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUTtnQkFDckUsTUFBTSxDQUFDLEdBQUksUUFBUSxDQUFDLElBQUssSUFBSyxRQUFRLENBQUMsRUFBRyxFQUFFLENBQUM7WUFDL0MsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztDQUdGO0FBOVZELG9DQThWQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGFzc2lnbixcbiAgaXNBcnJheSxcbiAgaXNVbmRlZmluZWQsXG4gIGtlYmFiQ2FzZSxcbiAgdW5pcUJ5XG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBwbHVyYWxpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcbmltcG9ydCBTZXJpYWxpemVyIGZyb20gJy4vc2VyaWFsaXplcic7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi4vZGF0YS9tb2RlbCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJy4uL3J1bnRpbWUvcm91dGVyJztcbmltcG9ydCBBY3Rpb24sIHsgUmVuZGVyT3B0aW9ucyB9IGZyb20gJy4uL3J1bnRpbWUvYWN0aW9uJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IgfSBmcm9tICcuLi9kYXRhL2Rlc2NyaXB0b3JzJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcENvbmZpZyB9IGZyb20gJy4vc2VyaWFsaXplcic7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgc2V0SWZOb3RFbXB0eSBmcm9tICcuLi91dGlscy9zZXQtaWYtbm90LWVtcHR5JztcblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgdGhlIHZhbHVlIGlzIG9ubHkgc2V0IGlmIGl0IGV4aXN0cywgc28gd2UgYXZvaWQgY3JlYXRpbmcgaXRlcmFibGUga2V5cyBvbiBvYmogZm9yXG4gKiB1bmRlZmluZWQgdmFsdWVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEpzb25BcGlEb2N1bWVudCB7XG4gIGRhdGE/OiBKc29uQXBpUmVzb3VyY2VPYmplY3QgfCBKc29uQXBpUmVzb3VyY2VPYmplY3RbXSB8IEpzb25BcGlSZXNvdXJjZUlkZW50aWZpZXIgfCBKc29uQXBpUmVzb3VyY2VJZGVudGlmaWVyW107XG4gIGVycm9ycz86IEpzb25BcGlFcnJvcltdO1xuICBtZXRhPzogSnNvbkFwaU1ldGE7XG4gIGpzb25hcGk/OiB7IHZlcnNpb246IHN0cmluZyB9O1xuICBsaW5rcz86IEpzb25BcGlMaW5rcztcbiAgaW5jbHVkZWQ/OiBKc29uQXBpUmVzb3VyY2VPYmplY3RbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpRXJyb3Ige1xuICAvKipcbiAgICogQSB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhpcyBwYXJ0aWN1bGFyIG9jY3VycmVuY2Ugb2YgdGhlIHByb2JsZW1cbiAgICovXG4gIGlkPzogc3RyaW5nO1xuICBsaW5rcz86IHtcbiAgICAvKipcbiAgICAgKiBBIGxpbmsgdGhhdCBsZWFkcyB0byBmdXJ0aGVyIGRldGFpbHMgYWJvdXQgdGhpcyBwYXJ0aWN1bGFyIG9jY3VycmVuY2Ugb2YgdGhlIHByb2JsZW1BXG4gICAgICovXG4gICAgYWJvdXQ/OiBKc29uQXBpTGluaztcbiAgfTtcbiAgLyoqXG4gICAqIFRoZSBIVFRQIHN0YXR1cyBjb2RlIGFwcGxpY2FibGUgdG8gdGhpcyBwcm9ibGVtLCBleHByZXNzZWQgYXMgYSBzdHJpbmcgdmFsdWVcbiAgICovXG4gIHN0YXR1cz86IHN0cmluZztcbiAgLyoqXG4gICAqIEFuIGFwcGxpY2F0aW9uLXNwZWNpZmljIGVycm9yIGNvZGUsIGV4cHJlc3NlZCBhcyBhIHN0cmluZyB2YWx1ZVxuICAgKi9cbiAgY29kZT86IHN0cmluZztcbiAgLyoqXG4gICAqIEEgc2hvcnQsIGh1bWFuLXJlYWRhYmxlIHN1bW1hcnkgb2YgdGhlIHByb2JsZW0gdGhhdCBTSE9VTEQgTk9UIGNoYW5nZSBmcm9tIG9jY3VycmVuY2UgdG9cbiAgICogb2NjdXJyZW5jZSBvZiB0aGUgcHJvYmxlbSwgZXhjZXB0IGZvciBwdXJwb3NlcyBvZiBsb2NhbGl6YXRpb25cbiAgICovXG4gIHRpdGxlPzogc3RyaW5nO1xuICAvKipcbiAgICogQSBodW1hbi1yZWFkYWJsZSBleHBsYW5hdGlvbiBzcGVjaWZpYyB0byB0aGlzIG9jY3VycmVuY2Ugb2YgdGhlIHByb2JsZW0uIExpa2UgdGl0bGUsIHRoaXNcbiAgICogZmllbGTigJlzIHZhbHVlIGNhbiBiZSBsb2NhbGl6ZWRcbiAgICovXG4gIGRldGFpbD86IHN0cmluZztcbiAgLyoqXG4gICAqIEFuIG9iamVjdCBjb250YWluaW5nIHJlZmVyZW5jZXMgdG8gdGhlIHNvdXJjZSBvZiB0aGUgZXJyb3JcbiAgICovXG4gIHNvdXJjZT86IHtcbiAgICAvKipcbiAgICAgKiBBIEpTT04gUG9pbnRlciBbUkZDNjkwMV0gdG8gdGhlIGFzc29jaWF0ZWQgZW50aXR5IGluIHRoZSByZXF1ZXN0IGRvY3VtZW50IFtlLmcuIFwiL2RhdGFcIiBmb3IgYVxuICAgICAqIHByaW1hcnkgZGF0YSBvYmplY3QsIG9yIFwiL2RhdGEvYXR0cmlidXRlcy90aXRsZVwiIGZvciBhIHNwZWNpZmljIGF0dHJpYnV0ZV1cbiAgICAgKi9cbiAgICBwb2ludGVyPzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIEEgc3RyaW5nIGluZGljYXRpbmcgd2hpY2ggVVJJIHF1ZXJ5IHBhcmFtZXRlciBjYXVzZWQgdGhlIGVycm9yXG4gICAgICovXG4gICAgcGFyYW1ldGVyPzogc3RyaW5nO1xuICB9O1xuICBtZXRhPzogSnNvbkFwaU1ldGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkFwaVJlc291cmNlT2JqZWN0IHtcbiAgaWQ6IHN0cmluZztcbiAgdHlwZTogc3RyaW5nO1xuICBhdHRyaWJ1dGVzPzogSnNvbkFwaUF0dHJpYnV0ZXM7XG4gIHJlbGF0aW9uc2hpcHM/OiBKc29uQXBpUmVsYXRpb25zaGlwcztcbiAgbGlua3M/OiBKc29uQXBpTGlua3M7XG4gIG1ldGE/OiBKc29uQXBpTWV0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpQXR0cmlidXRlcyB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpUmVsYXRpb25zaGlwcyB7XG4gIFtyZWxhdGlvbnNoaXBOYW1lOiBzdHJpbmddOiBKc29uQXBpUmVsYXRpb25zaGlwO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEpzb25BcGlSZWxhdGlvbnNoaXAge1xuICAvKipcbiAgICogTGlua3MgZm9yIHRoaXMgcmVsYXRpb25zaGlwLiBTaG91bGQgY29udGFpbiBhdCBsZWFzdCBhIFwic2VsZlwiIG9yIFwicmVsYXRlZFwiIGxpbmsuXG4gICAqL1xuICBsaW5rcz86IEpzb25BcGlMaW5rcztcbiAgZGF0YT86IEpzb25BcGlSZWxhdGlvbnNoaXBEYXRhO1xuICBtZXRhPzogSnNvbkFwaU1ldGE7XG59XG5cbmV4cG9ydCB0eXBlIEpzb25BcGlSZWxhdGlvbnNoaXBEYXRhID0gSnNvbkFwaVJlc291cmNlSWRlbnRpZmllciB8IEpzb25BcGlSZXNvdXJjZUlkZW50aWZpZXJbXTtcblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpUmVzb3VyY2VJZGVudGlmaWVyIHtcbiAgaWQ6IHN0cmluZztcbiAgdHlwZTogc3RyaW5nO1xuICBtZXRhPzogSnNvbkFwaU1ldGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkFwaU1ldGEge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkFwaUxpbmtzIHtcbiAgLyoqXG4gICAqIEEgbGluayBmb3IgdGhlIHJlc291cmNlIG9yIHJlbGF0aW9uc2hpcCBpdHNlbGYuIFRoaXMgbGluayBhbGxvd3MgdGhlIGNsaWVudCB0byBkaXJlY3RseVxuICAgKiBtYW5pcHVsYXRlIHRoZSByZXNvdXJjZSBvciByZWxhdGlvbnNoaXAuIEZvciBleGFtcGxlLCByZW1vdmluZyBhbiBhdXRob3IgdGhyb3VnaCBhbiBhcnRpY2xl4oCZc1xuICAgKiByZWxhdGlvbnNoaXAgVVJMIHdvdWxkIGRpc2Nvbm5lY3QgdGhlIHBlcnNvbiBmcm9tIHRoZSBhcnRpY2xlIHdpdGhvdXQgZGVsZXRpbmcgdGhlIHBlb3BsZVxuICAgKiByZXNvdXJjZSBpdHNlbGYuIFdoZW4gZmV0Y2hlZCBzdWNjZXNzZnVsbHksIHRoaXMgbGluayByZXR1cm5zIHRoZSBsaW5rYWdlIGZvciB0aGUgcmVsYXRlZFxuICAgKiByZXNvdXJjZXMgYXMgaXRzIHByaW1hcnkgZGF0YVxuICAgKi9cbiAgc2VsZj86IEpzb25BcGlMaW5rO1xuICAvKipcbiAgICogQSDigJxyZWxhdGVkIHJlc291cmNlIGxpbmvigJ0gcHJvdmlkZXMgYWNjZXNzIHRvIHJlc291cmNlIG9iamVjdHMgbGlua2VkIGluIGEgcmVsYXRpb25zaGlwLiBXaGVuXG4gICAqIGZldGNoZWQsIHRoZSByZWxhdGVkIHJlc291cmNlIG9iamVjdChzKSBhcmUgcmV0dXJuZWQgYXMgdGhlIHJlc3BvbnNl4oCZcyBwcmltYXJ5IGRhdGEuXG4gICAqL1xuICByZWxhdGVkPzogSnNvbkFwaUxpbms7XG4gIFtrZXk6IHN0cmluZ106IEpzb25BcGlMaW5rO1xufVxuXG5leHBvcnQgdHlwZSBKc29uQXBpTGluayA9IHN0cmluZyB8IHtcbiAgaHJlZjogc3RyaW5nLFxuICBtZXRhOiBKc29uQXBpTWV0YVxufTtcblxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIGV4dGVuZHMgUmVuZGVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBNb2RlbHMgeW91IHdhbnQgdG8gZW5zdXJlIGFyZSBpbmNsdWRlZCBpbiB0aGUgXCJpbmNsdWRlZFwiIHNpZGVsb2FkLiBOb3RlIHRoYXQgdGhlXG4gICAqIHNwZWMgcmVxdWlyZXMgXCJmdWxsLWxpbmthZ2VcIiAtIGkuZS4gYW55IE1vZGVscyB5b3UgaW5jbHVkZSBoZXJlIG11c3QgYmUgcmVmZXJlbmNlZCBieSBhXG4gICAqIHJlc291cmNlIGlkZW50aWZpZXIgZWxzZXdoZXJlIGluIHRoZSBwYXlsb2FkIC0gdG8gbWFpbnRhaW4gZnVsbCBjb21wbGlhbmNlLlxuICAgKi9cbiAgaW5jbHVkZWQ/OiBNb2RlbFtdO1xuICAvKipcbiAgICogQW55IHRvcCBsZXZlbCBtZXRhZGF0YSB0byBzZW5kIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgKi9cbiAgbWV0YT86IEpzb25BcGlNZXRhO1xuICAvKipcbiAgICogQW55IHRvcCBsZXZlbCBsaW5rcyB0byBzZW5kIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgKi9cbiAgbGlua3M/OiBKc29uQXBpTGlua3M7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuLyoqXG4gKiBVc2VkIGludGVybmFsbHkgdG8gc2ltcGxpZnkgcGFzc2luZyBhcmd1bWVudHMgcmVxdWlyZWQgYnkgYWxsIGZ1bmN0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0IHtcbiAgYWN0aW9uOiBBY3Rpb247XG4gIGJvZHk6IGFueTtcbiAgb3B0aW9uczogT3B0aW9ucztcbiAgZG9jdW1lbnQ6IEpzb25BcGlEb2N1bWVudDtcbn1cblxuLyoqXG4gKiBSZW5kZXJzIHRoZSBwYXlsb2FkIGFjY29yZGluZyB0byB0aGUgSlNPTkFQSSAxLjAgc3BlYywgaW5jbHVkaW5nIHJlbGF0ZWQgcmVzb3VyY2VzLCBpbmNsdWRlZFxuICogcmVjb3JkcywgYW5kIHN1cHBvcnQgZm9yIG1ldGEgYW5kIGxpbmtzLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgSlNPTkFQSVNlcmlhbGl6ZXIgZXh0ZW5kcyBTZXJpYWxpemVyIHtcblxuICAvKipcbiAgICogVGhlIGRlZmF1bHQgY29udGVudCB0eXBlIHRvIHVzZSBmb3IgYW55IHJlc3BvbnNlcyByZW5kZXJlZCBieSB0aGlzIHNlcmlhbGl6ZXIuXG4gICAqL1xuICBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi92bmQuYXBpK2pzb24nO1xuXG4gIC8qKlxuICAgKiBUYWtlIGEgcmVzcG9uc2UgYm9keSAoYSBtb2RlbCwgYW4gYXJyYXkgb2YgbW9kZWxzLCBvciBhbiBFcnJvcikgYW5kIHJlbmRlciBpdCBhcyBhIEpTT05BUElcbiAgICogY29tcGxpYW50IGRvY3VtZW50XG4gICAqL1xuICBhc3luYyBzZXJpYWxpemUoYm9keTogYW55LCBhY3Rpb246IEFjdGlvbiwgb3B0aW9uczogUmVuZGVyT3B0aW9ucyk6IFByb21pc2U8SnNvbkFwaURvY3VtZW50PiB7XG4gICAgbGV0IGNvbnRleHQ6IENvbnRleHQgPSB7XG4gICAgICBhY3Rpb24sXG4gICAgICBib2R5LFxuICAgICAgb3B0aW9ucyxcbiAgICAgIGRvY3VtZW50OiB7fVxuICAgIH07XG4gICAgYXdhaXQgdGhpcy5yZW5kZXJQcmltYXJ5KGNvbnRleHQpO1xuICAgIGF3YWl0IHRoaXMucmVuZGVySW5jbHVkZWQoY29udGV4dCk7XG4gICAgdGhpcy5yZW5kZXJNZXRhKGNvbnRleHQpO1xuICAgIHRoaXMucmVuZGVyTGlua3MoY29udGV4dCk7XG4gICAgdGhpcy5yZW5kZXJWZXJzaW9uKGNvbnRleHQpO1xuICAgIHRoaXMuZGVkdXBlSW5jbHVkZWQoY29udGV4dCk7XG4gICAgcmV0dXJuIGNvbnRleHQuZG9jdW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBwcmltYXJ5IHBheWxvYWQgZm9yIGEgSlNPTkFQSSBkb2N1bWVudCAoZWl0aGVyIGEgbW9kZWwgb3IgYXJyYXkgb2YgbW9kZWxzKS5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyByZW5kZXJQcmltYXJ5KGNvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgcGF5bG9hZCA9IGNvbnRleHQuYm9keTtcbiAgICBpZiAoaXNBcnJheShwYXlsb2FkKSkge1xuICAgICAgYXdhaXQgdGhpcy5yZW5kZXJQcmltYXJ5QXJyYXkoY29udGV4dCwgcGF5bG9hZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMucmVuZGVyUHJpbWFyeU9iamVjdChjb250ZXh0LCBwYXlsb2FkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBwcmltYXJ5IGRhdGEgZm9yIHRoZSBkb2N1bWVudCwgZWl0aGVyIGEgc2luZ2xlIE1vZGVsIG9yIGEgc2luZ2xlIEVycm9yLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJlbmRlclByaW1hcnlPYmplY3QoY29udGV4dDogQ29udGV4dCwgcGF5bG9hZDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHBheWxvYWQgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgY29udGV4dC5kb2N1bWVudC5lcnJvcnMgPSBbIGF3YWl0IHRoaXMucmVuZGVyRXJyb3IoY29udGV4dCwgcGF5bG9hZCkgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGV4dC5kb2N1bWVudC5kYXRhID0gYXdhaXQgdGhpcy5yZW5kZXJSZWNvcmQoY29udGV4dCwgcGF5bG9hZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgcHJpbWFyeSBkYXRhIGZvciB0aGUgZG9jdW1lbnQsIGVpdGhlciBhbiBhcnJheSBvZiBNb2RlbHMgb3IgRXJyb3JzXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcmVuZGVyUHJpbWFyeUFycmF5KGNvbnRleHQ6IENvbnRleHQsIHBheWxvYWQ6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChwYXlsb2FkWzBdIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQuZXJyb3JzID0gYXdhaXQgbWFwKHBheWxvYWQsIGFzeW5jIChlcnJvcjogRXJyb3IpID0+IHtcbiAgICAgICAgYXNzZXJ0KGVycm9yIGluc3RhbmNlb2YgRXJyb3IsICdZb3UgcGFzc2VkIGEgbWl4ZWQgYXJyYXkgb2YgZXJyb3JzIGFuZCBtb2RlbHMgdG8gdGhlIEpTT04tQVBJIHNlcmlhbGl6ZXIuIFRoZSBKU09OLUFQSSBzcGVjIGRvZXMgbm90IGFsbG93IGZvciBib3RoIGBkYXRhYCBhbmQgYGVycm9yc2AgdG9wIGxldmVsIG9iamVjdHMgaW4gYSByZXNwb25zZScpO1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZW5kZXJFcnJvcihjb250ZXh0LCBlcnJvcik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGV4dC5kb2N1bWVudC5kYXRhID0gYXdhaXQgbWFwKHBheWxvYWQsIGFzeW5jIChyZWNvcmQ6IE1vZGVsKSA9PiB7XG4gICAgICAgIGFzc2VydCghKHJlY29yZCBpbnN0YW5jZW9mIEVycm9yKSwgJ1lvdSBwYXNzZWQgYSBtaXhlZCBhcnJheSBvZiBlcnJvcnMgYW5kIG1vZGVscyB0byB0aGUgSlNPTi1BUEkgc2VyaWFsaXplci4gVGhlIEpTT04tQVBJIHNwZWMgZG9lcyBub3QgYWxsb3cgZm9yIGJvdGggYGRhdGFgIGFuZCBgZXJyb3JzYCB0b3AgbGV2ZWwgb2JqZWN0cyBpbiBhIHJlc3BvbnNlJyk7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlbmRlclJlY29yZChjb250ZXh0LCByZWNvcmQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciBhbnkgaW5jbHVkZWQgcmVjb3JkcyBzdXBwbGllZCBieSB0aGUgb3B0aW9ucyBpbnRvIHRoZSB0b3AgbGV2ZWwgb2YgdGhlIGRvY3VtZW50XG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcmVuZGVySW5jbHVkZWQoY29udGV4dDogQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChjb250ZXh0Lm9wdGlvbnMuaW5jbHVkZWQpIHtcbiAgICAgIGFzc2VydChpc0FycmF5KGNvbnRleHQub3B0aW9ucy5pbmNsdWRlZCksICdpbmNsdWRlZCByZWNvcmRzIG11c3QgYmUgcGFzc2VkIGluIGFzIGFuIGFycmF5Jyk7XG4gICAgICBjb250ZXh0LmRvY3VtZW50LmluY2x1ZGVkID0gYXdhaXQgbWFwKGNvbnRleHQub3B0aW9ucy5pbmNsdWRlZCwgYXN5bmMgKGluY2x1ZGVkUmVjb3JkKSA9PiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlbmRlclJlY29yZChjb250ZXh0LCBpbmNsdWRlZFJlY29yZCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRvcCBsZXZlbCBtZXRhIG9iamVjdCBmb3IgYSBkb2N1bWVudC4gRGVmYXVsdCB1c2VzIG1ldGEgc3VwcGxpZWQgaW4gb3B0aW9ucyBjYWxsIHRvXG4gICAqIHJlcy5yZW5kZXIoKS5cbiAgICovXG4gIHByb3RlY3RlZCByZW5kZXJNZXRhKGNvbnRleHQ6IENvbnRleHQpOiB2b2lkIHtcbiAgICBpZiAoY29udGV4dC5vcHRpb25zLm1ldGEpIHtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQubWV0YSA9IGNvbnRleHQub3B0aW9ucy5tZXRhO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdG9wIGxldmVsIGxpbmtzIG9iamVjdCBmb3IgYSBkb2N1bWVudC4gRGVmYXVsdHMgdG8gdGhlIGxpbmtzIHN1cHBsaWVkIGluIG9wdGlvbnMuXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVuZGVyTGlua3MoY29udGV4dDogQ29udGV4dCk6IHZvaWQge1xuICAgIGlmIChjb250ZXh0Lm9wdGlvbnMubGlua3MpIHtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQubGlua3MgPSBjb250ZXh0Lm9wdGlvbnMubGlua3M7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgdmVyc2lvbiBvZiBKU09OQVBJIHN1cHBvcnRlZC5cbiAgICovXG4gIHByb3RlY3RlZCByZW5kZXJWZXJzaW9uKGNvbnRleHQ6IENvbnRleHQpOiB2b2lkIHtcbiAgICBjb250ZXh0LmRvY3VtZW50Lmpzb25hcGkgPSB7XG4gICAgICB2ZXJzaW9uOiAnMS4wJ1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBzdXBwbGllZCByZWNvcmQgYXMgYSByZXNvdXJjZSBvYmplY3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcmVuZGVyUmVjb3JkKGNvbnRleHQ6IENvbnRleHQsIHJlY29yZDogTW9kZWwpOiBQcm9taXNlPEpzb25BcGlSZXNvdXJjZU9iamVjdD4ge1xuICAgIGFzc2VydChyZWNvcmQsIGBDYW5ub3Qgc2VyaWFsaXplICR7IHJlY29yZCB9LiBZb3Ugc3VwcGxpZWQgJHsgcmVjb3JkIH0gaW5zdGVhZCBvZiBhIE1vZGVsIGluc3RhbmNlLmApO1xuICAgIGxldCBzZXJpYWxpemVkUmVjb3JkOiBKc29uQXBpUmVzb3VyY2VPYmplY3QgPSB7XG4gICAgICB0eXBlOiBwbHVyYWxpemUocmVjb3JkLnR5cGUpLFxuICAgICAgaWQ6IHJlY29yZC5pZFxuICAgIH07XG4gICAgYXNzZXJ0KHNlcmlhbGl6ZWRSZWNvcmQuaWQgIT0gbnVsbCwgYEF0dGVtcHRlZCB0byBzZXJpYWxpemUgYSByZWNvcmQgKCR7IHJlY29yZCB9KSB3aXRob3V0IGFuIGlkLCBidXQgdGhlIEpTT04tQVBJIHNwZWMgcmVxdWlyZXMgYWxsIHJlc291cmNlcyB0byBoYXZlIGFuIGlkLmApO1xuICAgIHNldElmTm90RW1wdHkoc2VyaWFsaXplZFJlY29yZCwgJ2F0dHJpYnV0ZXMnLCB0aGlzLmF0dHJpYnV0ZXNGb3JSZWNvcmQoY29udGV4dCwgcmVjb3JkKSk7XG4gICAgc2V0SWZOb3RFbXB0eShzZXJpYWxpemVkUmVjb3JkLCAncmVsYXRpb25zaGlwcycsIGF3YWl0IHRoaXMucmVsYXRpb25zaGlwc0ZvclJlY29yZChjb250ZXh0LCByZWNvcmQpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHNlcmlhbGl6ZWRSZWNvcmQsICdsaW5rcycsIHRoaXMubGlua3NGb3JSZWNvcmQoY29udGV4dCwgcmVjb3JkKSk7XG4gICAgc2V0SWZOb3RFbXB0eShzZXJpYWxpemVkUmVjb3JkLCAnbWV0YScsIHRoaXMubWV0YUZvclJlY29yZChjb250ZXh0LCByZWNvcmQpKTtcbiAgICByZXR1cm4gc2VyaWFsaXplZFJlY29yZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBKU09OQVBJIGF0dHJpYnV0ZXMgb2JqZWN0IHJlcHJlc2VudGluZyB0aGlzIHJlY29yZCdzIHJlbGF0aW9uc2hpcHNcbiAgICovXG4gIHByb3RlY3RlZCBhdHRyaWJ1dGVzRm9yUmVjb3JkKGNvbnRleHQ6IENvbnRleHQsIHJlY29yZDogTW9kZWwpOiBKc29uQXBpQXR0cmlidXRlcyB7XG4gICAgbGV0IHNlcmlhbGl6ZWRBdHRyaWJ1dGVzOiBKc29uQXBpQXR0cmlidXRlcyA9IHt9O1xuICAgIGxldCBhdHRyaWJ1dGVzID0gdGhpcy5hdHRyaWJ1dGVzVG9TZXJpYWxpemUoY29udGV4dC5hY3Rpb24sIGNvbnRleHQub3B0aW9ucyk7XG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGVOYW1lKSA9PiB7XG4gICAgICBsZXQga2V5ID0gdGhpcy5zZXJpYWxpemVBdHRyaWJ1dGVOYW1lKGNvbnRleHQsIGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgbGV0IHJhd1ZhbHVlID0gcmVjb3JkW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgaWYgKCFpc1VuZGVmaW5lZChyYXdWYWx1ZSkpIHtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5zZXJpYWxpemVBdHRyaWJ1dGVWYWx1ZShjb250ZXh0LCByYXdWYWx1ZSwga2V5LCByZWNvcmQpO1xuICAgICAgICBzZXJpYWxpemVkQXR0cmlidXRlc1trZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZWRBdHRyaWJ1dGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBKU09OQVBJIHNwZWMgcmVjb21tZW5kcyAoYnV0IGRvZXMgbm90IHJlcXVpcmUpIHRoYXQgcHJvcGVydHkgbmFtZXMgYmUgZGFzaGVyaXplZC4gVGhlXG4gICAqIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBzZXJpYWxpemVyIHRoZXJlZm9yZSBkb2VzIHRoYXQsIGJ1dCB5b3UgY2FuIG92ZXJyaWRlIHRoaXMgbWV0aG9kXG4gICAqIHRvIHVzZSBhIGRpZmZlcmVudCBhcHByb2FjaC5cbiAgICovXG4gIHByb3RlY3RlZCBzZXJpYWxpemVBdHRyaWJ1dGVOYW1lKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGtlYmFiQ2FzZShuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGFuIGF0dHJpYnV0ZSB2YWx1ZSBhbmQgcmV0dXJuIHRoZSBzZXJpYWxpemVkIHZhbHVlLiBVc2VmdWwgZm9yIGNoYW5naW5nIGhvdyBjZXJ0YWluIHR5cGVzXG4gICAqIG9mIHZhbHVlcyBhcmUgc2VyaWFsaXplZCwgaS5lLiBEYXRlIG9iamVjdHMuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIHJldHVybnMgdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIHVuY2hhbmdlZC5cbiAgICovXG4gIHByb3RlY3RlZCBzZXJpYWxpemVBdHRyaWJ1dGVWYWx1ZShjb250ZXh0OiBDb250ZXh0LCB2YWx1ZTogYW55LCBrZXk6IHN0cmluZywgcmVjb3JkOiBNb2RlbCk6IGFueSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIEpTT05BUEkgcmVsYXRpb25zaGlwcyBvYmplY3QgcmVwcmVzZW50aW5nIHRoaXMgcmVjb3JkJ3MgcmVsYXRpb25zaGlwc1xuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJlbGF0aW9uc2hpcHNGb3JSZWNvcmQoY29udGV4dDogQ29udGV4dCwgcmVjb3JkOiBNb2RlbCk6IFByb21pc2U8SnNvbkFwaVJlbGF0aW9uc2hpcHM+IHtcbiAgICBsZXQgc2VyaWFsaXplZFJlbGF0aW9uc2hpcHM6IEpzb25BcGlSZWxhdGlvbnNoaXBzID0ge307XG4gICAgbGV0IHJlbGF0aW9uc2hpcHMgPSB0aGlzLnJlbGF0aW9uc2hpcHNUb1NlcmlhbGl6ZShjb250ZXh0LmFjdGlvbiwgY29udGV4dC5vcHRpb25zKTtcblxuICAgIC8vIFRoZSByZXN1bHQgb2YgdGhpcy5yZWxhdGlvbnNoaXBzIGlzIGEgd2hpdGVsaXN0IG9mIHdoaWNoIHJlbGF0aW9uc2hpcHMgc2hvdWxkIGJlIHNlcmlhbGl6ZWQsXG4gICAgLy8gYW5kIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGVpciBzZXJpYWxpemF0aW9uXG4gICAgbGV0IHJlbGF0aW9uc2hpcE5hbWVzID0gT2JqZWN0LmtleXMocmVsYXRpb25zaGlwcyk7XG4gICAgZm9yIChsZXQgbmFtZSBvZiByZWxhdGlvbnNoaXBOYW1lcykge1xuICAgICAgbGV0IGNvbmZpZyA9IHJlbGF0aW9uc2hpcHNbbmFtZV07XG4gICAgICBsZXQga2V5ID0gY29uZmlnLmtleSB8fCB0aGlzLnNlcmlhbGl6ZVJlbGF0aW9uc2hpcE5hbWUoY29udGV4dCwgbmFtZSk7XG4gICAgICBsZXQgZGVzY3JpcHRvciA9ICg8YW55PnJlY29yZC5jb25zdHJ1Y3RvcilbbmFtZV07XG4gICAgICBhc3NlcnQoZGVzY3JpcHRvciwgYFlvdSBzcGVjaWZpZWQgYSAnJHsgbmFtZSB9JyByZWxhdGlvbnNoaXAgaW4geW91ciAkeyByZWNvcmQudHlwZSB9IHNlcmlhbGl6ZXIsIGJ1dCBubyBzdWNoIHJlbGF0aW9uc2hpcCBpcyBkZWZpbmVkIG9uIHRoZSAkeyByZWNvcmQudHlwZSB9IG1vZGVsYCk7XG4gICAgICBzZXJpYWxpemVkUmVsYXRpb25zaGlwc1trZXldID0gYXdhaXQgdGhpcy5zZXJpYWxpemVSZWxhdGlvbnNoaXAoY29udGV4dCwgbmFtZSwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpO1xuICAgIH1cblxuICAgIHJldHVybiBzZXJpYWxpemVkUmVsYXRpb25zaGlwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoZSByZWxhdGlvbnNoaXAgbmFtZSB0byBpdCdzIFwib3Zlci10aGUtd2lyZVwiIGZvcm1hdC4gRGVmYXVsdHMgdG8gZGFzaGVyaXppbmcgaXQuXG4gICAqL1xuICBwcm90ZWN0ZWQgc2VyaWFsaXplUmVsYXRpb25zaGlwTmFtZShjb250ZXh0OiBDb250ZXh0LCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZWJhYkNhc2UobmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIHNlcmlhbGl6ZXIgY29uZmlnIGFuZCB0aGUgbW9kZWwncyBkZXNjcmlwdG9yIGZvciBhIHJlbGF0aW9uc2hpcCwgYW5kIHJldHVybnMgdGhlXG4gICAqIHNlcmlhbGl6ZWQgcmVsYXRpb25zaGlwIG9iamVjdC4gQWxzbyBzaWRlbG9hZHMgYW55IGZ1bGwgcmVjb3JkcyBpZiB0aGUgcmVsYXRpb25zaGlwIGlzIHNvXG4gICAqIGNvbmZpZ3VyZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgc2VyaWFsaXplUmVsYXRpb25zaGlwKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZywgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlY29yZDogTW9kZWwpOiBQcm9taXNlPEpzb25BcGlSZWxhdGlvbnNoaXA+IHtcbiAgICBsZXQgcmVsYXRpb25zaGlwOiBKc29uQXBpUmVsYXRpb25zaGlwID0ge307XG4gICAgc2V0SWZOb3RFbXB0eShyZWxhdGlvbnNoaXAsICdsaW5rcycsIHRoaXMubGlua3NGb3JSZWxhdGlvbnNoaXAoY29udGV4dCwgbmFtZSwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlbGF0aW9uc2hpcCwgJ21ldGEnLCB0aGlzLm1ldGFGb3JSZWxhdGlvbnNoaXAoY29udGV4dCwgbmFtZSwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlbGF0aW9uc2hpcCwgJ2RhdGEnLCBhd2FpdCB0aGlzLmRhdGFGb3JSZWxhdGlvbnNoaXAoY29udGV4dCwgbmFtZSwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpKTtcbiAgICByZXR1cm4gcmVsYXRpb25zaGlwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNlcmlhbGl6ZWQgZm9ybSBvZiB0aGUgcmVsYXRlZCBNb2RlbHMgZm9yIHRoZSBnaXZlbiByZWNvcmQgYW5kIHJlbGF0aW9uc2hpcC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBkYXRhRm9yUmVsYXRpb25zaGlwKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZywgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlY29yZDogTW9kZWwpOiBQcm9taXNlPEpzb25BcGlSZWxhdGlvbnNoaXBEYXRhPiB7XG4gICAgbGV0IHJlbGF0ZWREYXRhID0gYXdhaXQgcmVjb3JkLmdldFJlbGF0ZWQobmFtZSk7XG4gICAgaWYgKGRlc2NyaXB0b3IubW9kZSA9PT0gJ2hhc01hbnknKSB7XG4gICAgICByZXR1cm4gYXdhaXQgbWFwKDxNb2RlbFtdPnJlbGF0ZWREYXRhLCBhc3luYyAocmVsYXRlZFJlY29yZCkgPT4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5kYXRhRm9yUmVsYXRlZFJlY29yZChjb250ZXh0LCBuYW1lLCByZWxhdGVkUmVjb3JkLCBjb25maWcsIGRlc2NyaXB0b3IsIHJlY29yZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZGF0YUZvclJlbGF0ZWRSZWNvcmQoY29udGV4dCwgbmFtZSwgPE1vZGVsPnJlbGF0ZWREYXRhLCBjb25maWcsIGRlc2NyaXB0b3IsIHJlY29yZCk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSByZWxhdGVkIHJlY29yZCwgcmV0dXJuIHRoZSByZXNvdXJjZSBvYmplY3QgZm9yIHRoYXQgcmVjb3JkLCBhbmQgc2lkZWxvYWQgdGhlIHJlY29yZCBhc1xuICAgKiB3ZWxsLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGRhdGFGb3JSZWxhdGVkUmVjb3JkKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZywgcmVsYXRlZFJlY29yZDogTW9kZWwsIGNvbmZpZzogUmVsYXRpb25zaGlwQ29uZmlnLCBkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCByZWNvcmQ6IE1vZGVsKTogUHJvbWlzZTxKc29uQXBpUmVzb3VyY2VJZGVudGlmaWVyPiB7XG4gICAgLy8gYXdhaXQgdGhpcy5pbmNsdWRlUmVjb3JkKGNvbnRleHQsIG5hbWUsIHJlbGF0ZWRSZWNvcmQsIGNvbmZpZywgZGVzY3JpcHRvcik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHBsdXJhbGl6ZShyZWxhdGVkUmVjb3JkLnR5cGUpLFxuICAgICAgaWQ6IHJlbGF0ZWRSZWNvcmQuaWRcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgcmVsYXRpb25zaGlwIGRlc2NyaXB0b3IgYW5kIHRoZSByZWNvcmQgaXQncyBmb3IsIGFuZCByZXR1cm5zIGFueSBsaW5rcyBmb3IgdGhhdFxuICAgKiByZWxhdGlvbnNoaXAgZm9yIHRoYXQgcmVjb3JkLiBJLmUuICcvYm9va3MvMS9hdXRob3InXG4gICAqL1xuICBwcm90ZWN0ZWQgbGlua3NGb3JSZWxhdGlvbnNoaXAoY29udGV4dDogQ29udGV4dCwgbmFtZTogc3RyaW5nLCBjb25maWc6IFJlbGF0aW9uc2hpcENvbmZpZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcmVjb3JkOiBNb2RlbCk6IEpzb25BcGlMaW5rcyB7XG4gICAgbGV0IHJlY29yZFNlbGZMaW5rID0gdGhpcy5saW5rc0ZvclJlY29yZChjb250ZXh0LCByZWNvcmQpLnNlbGY7XG4gICAgbGV0IHJlY29yZFVSTDogc3RyaW5nO1xuICAgIGlmICh0eXBlb2YgcmVjb3JkU2VsZkxpbmsgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZWNvcmRVUkwgPSByZWNvcmRTZWxmTGluaztcbiAgICB9IGVsc2Uge1xuICAgICAgcmVjb3JkVVJMID0gcmVjb3JkU2VsZkxpbmsuaHJlZjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlbGY6IHBhdGguam9pbihyZWNvcmRVUkwsIGByZWxhdGlvbnNoaXBzLyR7IG5hbWUgfWApLFxuICAgICAgcmVsYXRlZDogcGF0aC5qb2luKHJlY29yZFVSTCwgbmFtZSlcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW55IG1ldGEgZm9yIGEgZ2l2ZW4gcmVsYXRpb25zaGlwIGFuZCByZWNvcmQuIE5vIG1ldGEgaW5jbHVkZWQgYnkgZGVmYXVsdC5cbiAgICovXG4gIHByb3RlY3RlZCBtZXRhRm9yUmVsYXRpb25zaGlwKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZywgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlY29yZDogTW9kZWwpOiBKc29uQXBpTWV0YSB8IHZvaWQge1xuICAgIC8vIGRlZmF1bHRzIHRvIG5vIG1ldGEgY29udGVudFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbGlua3MgZm9yIGEgcGFydGljdWxhciByZWNvcmQsIGkuZS4gc2VsZjogXCIvYm9va3MvMVwiLiBEZWZhdWx0IGltcGxlbWVudGF0aW9uIGFzc3VtZXNcbiAgICogdGhlIFVSTCBmb3IgYSBwYXJ0aWN1bGFyIHJlY29yZCBtYXBzIHRvIHRoYXQgdHlwZSdzIGBzaG93YCBhY3Rpb24sIGkuZS4gYGJvb2tzL3Nob3dgLlxuICAgKi9cbiAgcHJvdGVjdGVkIGxpbmtzRm9yUmVjb3JkKGNvbnRleHQ6IENvbnRleHQsIHJlY29yZDogTW9kZWwpOiBKc29uQXBpTGlua3Mge1xuICAgIGxldCByb3V0ZXI6IFJvdXRlciA9IHRoaXMuY29udGFpbmVyLmxvb2t1cCgnYXBwOnJvdXRlcicpO1xuICAgIGxldCB1cmwgPSByb3V0ZXIudXJsRm9yKGAkeyBwbHVyYWxpemUocmVjb3JkLnR5cGUpIH0vc2hvd2AsIHJlY29yZCk7XG4gICAgcmV0dXJuIHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnID8geyBzZWxmOiB1cmwgfSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBtZXRhIGZvciBhIHBhcnRpY3VsYXIgcmVjb3JkLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1ldGFGb3JSZWNvcmQoY29udGV4dDogQ29udGV4dCwgcmVjb3JkOiBNb2RlbCk6IHZvaWQgfCBKc29uQXBpTWV0YSB7XG4gICAgLy8gZGVmYXVsdHMgdG8gbm8gbWV0YVxuICB9XG5cbiAgLyoqXG4gICAqIFNpZGVsb2FkcyBhIHJlY29yZCBpbnRvIHRoZSB0b3AgbGV2ZWwgXCJpbmNsdWRlZFwiIGFycmF5XG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgaW5jbHVkZVJlY29yZChjb250ZXh0OiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIHJlbGF0ZWRSZWNvcmQ6IE1vZGVsLCBjb25maWc6IFJlbGF0aW9uc2hpcENvbmZpZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGFzc2VydChyZWxhdGVkUmVjb3JkLCAnWW91IHRyaWVkIHRvIHNpZGVsb2FkIGFuIGluY2x1ZGVkIHJlY29yZCwgYnV0IHRoZSByZWNvcmQgaXRzZWxmIHdhcyBub3QgcHJvdmlkZWQuJyk7XG4gICAgaWYgKCFpc0FycmF5KGNvbnRleHQuZG9jdW1lbnQuaW5jbHVkZWQpKSB7XG4gICAgICBjb250ZXh0LmRvY3VtZW50LmluY2x1ZGVkID0gW107XG4gICAgfVxuICAgIGxldCByZWxhdGVkT3B0aW9ucyA9IChjb250ZXh0Lm9wdGlvbnMucmVsYXRpb25zaGlwcyAmJiBjb250ZXh0Lm9wdGlvbnMucmVsYXRpb25zaGlwc1tuYW1lXSkgfHwgY29udGV4dC5vcHRpb25zO1xuICAgIGxldCByZWxhdGVkU2VyaWFsaXplcjogSlNPTkFQSVNlcmlhbGl6ZXIgPSBjb25maWcuc2VyaWFsaXplciB8fCB0aGlzLmNvbnRhaW5lci5sb29rdXAoYHNlcmlhbGl6ZXI6JHsgcmVsYXRlZFJlY29yZC50eXBlIH1gKTtcbiAgICBsZXQgcmVsYXRlZENvbnRleHQ6IENvbnRleHQgPSBhc3NpZ24oe30sIGNvbnRleHQsIHsgb3B0aW9uczogcmVsYXRlZE9wdGlvbnMgfSk7XG4gICAgY29udGV4dC5kb2N1bWVudC5pbmNsdWRlZC5wdXNoKGF3YWl0IHJlbGF0ZWRTZXJpYWxpemVyLnJlbmRlclJlY29yZChyZWxhdGVkQ29udGV4dCwgcmVsYXRlZFJlY29yZCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgc3VwcGxpZWQgZXJyb3JcbiAgICovXG4gIHByb3RlY3RlZCByZW5kZXJFcnJvcihjb250ZXh0OiBDb250ZXh0LCBlcnJvcjogYW55KTogSnNvbkFwaUVycm9yIHtcbiAgICBsZXQgcmVuZGVyZWRFcnJvciA9IHtcbiAgICAgIHN0YXR1czogZXJyb3Iuc3RhdHVzIHx8IDUwMCxcbiAgICAgIGNvZGU6IGVycm9yLmNvZGUgfHwgZXJyb3IubmFtZSB8fCAnSW50ZXJuYWxTZXJ2ZXJFcnJvcicsXG4gICAgICBkZXRhaWw6IGVycm9yLm1lc3NhZ2VcbiAgICB9O1xuICAgIHNldElmTm90RW1wdHkocmVuZGVyZWRFcnJvciwgJ2lkJywgdGhpcy5pZEZvckVycm9yKGNvbnRleHQsIGVycm9yKSk7XG4gICAgc2V0SWZOb3RFbXB0eShyZW5kZXJlZEVycm9yLCAndGl0bGUnLCB0aGlzLnRpdGxlRm9yRXJyb3IoY29udGV4dCwgZXJyb3IpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlbmRlcmVkRXJyb3IsICdzb3VyY2UnLCB0aGlzLnNvdXJjZUZvckVycm9yKGNvbnRleHQsIGVycm9yKSk7XG4gICAgc2V0SWZOb3RFbXB0eShyZW5kZXJlZEVycm9yLCAnbWV0YScsIHRoaXMubWV0YUZvckVycm9yKGNvbnRleHQsIGVycm9yKSk7XG4gICAgc2V0SWZOb3RFbXB0eShyZW5kZXJlZEVycm9yLCAnbGlua3MnLCB0aGlzLmxpbmtzRm9yRXJyb3IoY29udGV4dCwgZXJyb3IpKTtcbiAgICByZXR1cm4gcmVuZGVyZWRFcnJvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBlcnJvciwgcmV0dXJuIGEgdW5pcXVlIGlkIGZvciB0aGlzIHBhcnRpY3VsYXIgb2NjdXJlbmNlIG9mIHRoZSBwcm9ibGVtLlxuICAgKi9cbiAgcHJvdGVjdGVkIGlkRm9yRXJyb3IoY29udGV4dDogQ29udGV4dCwgZXJyb3I6IGFueSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGVycm9yLmlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgc2hvcnQsIGh1bWFuLXJlYWRhYmxlIHN1bW1hcnkgb2YgdGhlIHByb2JsZW0gdGhhdCBTSE9VTEQgTk9UIGNoYW5nZSBmcm9tIG9jY3VycmVuY2UgdG9cbiAgICogb2NjdXJyZW5jZSBvZiB0aGUgcHJvYmxlbSwgZXhjZXB0IGZvciBwdXJwb3NlcyBvZiBsb2NhbGl6YXRpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgdGl0bGVGb3JFcnJvcihjb250ZXh0OiBDb250ZXh0LCBlcnJvcjogYW55KTogc3RyaW5nIHtcbiAgICByZXR1cm4gZXJyb3IudGl0bGU7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYW4gZXJyb3IsIHJldHVybiBhIEpTT04gUG9pbnRlciwgYSBVUkwgcXVlcnkgcGFyYW0gbmFtZSwgb3Igb3RoZXIgaW5mbyBpbmRpY2F0aW5nIHRoZVxuICAgKiBzb3VyY2Ugb2YgdGhlIGVycm9yLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNvdXJjZUZvckVycm9yKGNvbnRleHQ6IENvbnRleHQsIGVycm9yOiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiBlcnJvci5zb3VyY2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBtZXRhIGZvciBhIGdpdmVuIGVycm9yIG9iamVjdC4gWW91IGNvdWxkIHVzZSB0aGlzIGZvciBleGFtcGxlLCB0byByZXR1cm4gZGVidWdcbiAgICogaW5mb3JtYXRpb24gaW4gZGV2ZWxvcG1lbnQgZW52aXJvbm1lbnRzLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1ldGFGb3JFcnJvcihjb250ZXh0OiBDb250ZXh0LCBlcnJvcjogYW55KTogSnNvbkFwaU1ldGEgfCB2b2lkIHtcbiAgICByZXR1cm4gZXJyb3IubWV0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBsaW5rcyBvYmplY3QgZm9yIGFuIGVycm9yLiBZb3UgY291bGQgdXNlIHRoaXMgdG8gbGluayB0byBhIGJ1ZyB0cmFja2VyIHJlcG9ydCBvZiB0aGVcbiAgICogZXJyb3IsIGZvciBleGFtcGxlLlxuICAgKi9cbiAgcHJvdGVjdGVkIGxpbmtzRm9yRXJyb3IoY29udGV4dDogQ29udGV4dCwgZXJyb3I6IGFueSk6IEpzb25BcGlMaW5rcyB8IHZvaWQge1xuICAgIC8vIGRlZmF1bHRzIHRvIG5vIGxpbmtzXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGR1cGxpY2F0ZSBlbnRyaWVzIGZyb20gdGhlIHNpZGVsb2FkZWQgZGF0YS5cbiAgICovXG4gIHByb3RlY3RlZCBkZWR1cGVJbmNsdWRlZChjb250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG4gICAgaWYgKGlzQXJyYXkoY29udGV4dC5kb2N1bWVudC5pbmNsdWRlZCkpIHtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQuaW5jbHVkZWQgPSB1bmlxQnkoY29udGV4dC5kb2N1bWVudC5pbmNsdWRlZCwgKHJlc291cmNlKSA9PiB7XG4gICAgICAgIHJldHVybiBgJHsgcmVzb3VyY2UudHlwZSB9LyR7IHJlc291cmNlLmlkIH1gO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxufVxuIl19