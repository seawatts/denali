"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const createDebug = require("debug");
const inflection_1 = require("inflection");
const lodash_1 = require("lodash");
const object_1 = require("../metal/object");
const container_1 = require("../metal/container");
const debug = createDebug('denali:model');
/**
 * The Model class is the core of Denali's unique approach to data and ORMs. It acts as a wrapper
 * and translation layer that provides a unified interface to access and manipulate data, but
 * translates those interactions into ORM specific operations via ORM adapters.
 *
 * Models are able to maintain their relatively clean interface thanks to the way the constructor
 * actually returns a Proxy which wraps the Model instance, rather than the Model instance directly.
 * This means you can directly get and set properties on your records, and the record (which is a
 * Proxy-wrapped Model) will translate and forward those calls to the underlying ORM adapter.
 *
 * @package data
 */
class Model extends object_1.default {
    constructor() {
        super(...arguments);
        /**
         * The underlying ORM adapter record. An opaque value to Denali, handled entirely by the ORM
         * adapter.
         */
        this.record = null;
    }
    /**
     * When this class is loaded into a container, inspect the class defintion and add the appropriate
     * getters and setters for each attribute defined, and the appropriate relationship methods for
     * each relationship defined. These will delegate activity to the underlying ORM instance.
     */
    static [container_1.onLoad](ModelClass) {
        // Skip defining on abstract classes
        if (ModelClass.hasOwnProperty('abstract') && ModelClass.abstract) {
            return;
        }
        let proto = ModelClass.prototype;
        // Define attribute getter/settters
        ModelClass.mapAttributeDescriptors((descriptor, attributeName) => {
            Object.defineProperty(proto, attributeName, {
                configurable: true,
                get() {
                    return this.adapter.getAttribute(this, attributeName);
                },
                set(newValue) {
                    return this.adapter.setAttribute(this, attributeName, newValue);
                }
            });
        });
        // Define relationship operations
        ModelClass.mapRelationshipDescriptors((descriptor, relationshipName) => {
            let methodRoot = lodash_1.upperFirst(relationshipName);
            // getAuthor(options?)
            Object.defineProperty(proto, `get${methodRoot}`, {
                configurable: true,
                value(options) {
                    return this.getRelated(relationshipName, options);
                }
            });
            // setAuthor(comments, options?)
            Object.defineProperty(proto, `set${methodRoot}`, {
                configurable: true,
                value(relatedModels, options) {
                    return this.setRelated(relationshipName, relatedModels, options);
                }
            });
            if (descriptor.mode === 'hasMany') {
                let singularRoot = inflection_1.singularize(methodRoot);
                // addComment(comment, options?)
                Object.defineProperty(proto, `add${singularRoot}`, {
                    configurable: true,
                    value(relatedModel, options) {
                        return this.addRelated(relationshipName, relatedModel, options);
                    }
                });
                // removeComment(comment, options?)
                Object.defineProperty(proto, `remove${singularRoot}`, {
                    configurable: true,
                    value(relatedModel, options) {
                        return this.removeRelated(relationshipName, relatedModel, options);
                    }
                });
            }
        });
    }
    /**
     * Call the supplied callback function for each attribute on this model, passing in the attribute
     * name and attribute descriptor.
     */
    static mapAttributeDescriptors(fn) {
        let klass = this;
        let result = [];
        for (let key in klass) {
            if (klass[key] && klass[key].isAttribute) {
                result.push(fn(klass[key], key));
            }
        }
        return result;
    }
    /**
     * Call the supplied callback function for each relationship on this model, passing in the
     * relationship name and relationship descriptor.
     */
    static mapRelationshipDescriptors(fn) {
        let klass = this;
        let result = [];
        for (let key in klass) {
            if (klass[key] && klass[key].isRelationship) {
                result.push(fn(klass[key], key));
            }
        }
        return result;
    }
    /**
     * Get the type string for this model class. You must supply a container instance so we can lookup
     * the container name for this model class.
     */
    static getType(container) {
        return container.metaFor(this).containerName;
    }
    /**
     * Get the type of this model based on the container name for it
     */
    get type() {
        return this.container.metaFor(this.constructor).containerName;
    }
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     */
    get adapter() {
        return this.container.lookup(`orm-adapter:${this.type}`, { loose: true })
            || this.container.lookup('orm-adapter:application');
    }
    /**
     * The id of the record
     */
    get id() {
        return this.adapter.idFor(this);
    }
    set id(value) {
        this.adapter.setId(this, value);
    }
    /**
     * Tell the underlying ORM to build this record
     */
    init(data, options) {
        super.init(...arguments);
        this.record = this.adapter.buildRecord(this.type, data, options);
    }
    /**
     * Persist this model.
     */
    save(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`saving ${this.type}`);
            yield this.adapter.saveRecord(this, options);
            return this;
        });
    }
    /**
     * Delete this model.
     */
    delete(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.adapter.deleteRecord(this, options);
        });
    }
    /**
     * Returns the related record(s) for the given relationship.
     */
    getRelated(relationshipName, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[relationshipName];
            assert(descriptor && descriptor.isRelationship, `You tried to fetch related ${relationshipName}, but no such relationship exists on ${this.type}`);
            let RelatedModel = this.container.factoryFor(`model:${descriptor.type}`);
            let results = yield this.adapter.getRelated(this, relationshipName, descriptor, options);
            if (descriptor.mode === 'hasOne') {
                assert(!Array.isArray(results), `The ${this.type} ORM adapter returned an array for the hasOne '${relationshipName}' relationship - it should return either an ORM record or null.`);
                return results ? RelatedModel.create(results) : null;
            }
            assert(Array.isArray(results), `The ${this.type} ORM adapter did not return an array for the hasMany '${relationshipName}' relationship - it should return an array (empty if no related records exist).`);
            return results.map((record) => RelatedModel.create(record));
        });
    }
    /**
     * Replaces the related records for the given relationship with the supplied related records.
     */
    setRelated(relationshipName, relatedModels, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[relationshipName];
            yield this.adapter.setRelated(this, relationshipName, descriptor, relatedModels, options);
        });
    }
    /**
     * Add a related record to a hasMany relationship.
     */
    addRelated(relationshipName, relatedModel, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[inflection_1.pluralize(relationshipName)];
            yield this.adapter.addRelated(this, relationshipName, descriptor, relatedModel, options);
        });
    }
    /**
     * Remove the given record from the hasMany relationship
     */
    removeRelated(relationshipName, relatedModel, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[inflection_1.pluralize(relationshipName)];
            yield this.adapter.removeRelated(this, relationshipName, descriptor, relatedModel, options);
        });
    }
    /**
     * Return an human-friendly string representing this Model instance, with a summary of it's
     * attributes
     */
    inspect() {
        let attributesSummary = this.constructor.mapAttributeDescriptors((descriptor, attributeName) => {
            return `${attributeName}=${JSON.stringify(this[attributeName])}`;
        });
        return `<${lodash_1.startCase(this.type)}:${this.id == null ? '-new-' : this.id} ${attributesSummary.join(', ')}>`;
    }
    /**
     * Return an human-friendly string representing this Model instance
     */
    toString() {
        return `<${lodash_1.startCase(this.type)}:${this.id == null ? '-new-' : this.id}>`;
    }
}
/**
 * Marks the Model as an abstract base model, so ORM adapters can know not to create tables or
 * other supporting infrastructure.
 */
Model.abstract = false;
exports.default = Model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9kYXRhL21vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpQztBQUNqQyxxQ0FBcUM7QUFDckMsMkNBQW9EO0FBQ3BELG1DQUErQztBQUMvQyw0Q0FBMkM7QUFDM0Msa0RBQXVEO0FBSXZELE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQzs7Ozs7Ozs7Ozs7R0FXRztBQUNILFdBQTJCLFNBQVEsZ0JBQVk7SUFBL0M7O1FBNEdFOzs7V0FHRztRQUNILFdBQU0sR0FBUSxJQUFJLENBQUM7SUE4R3JCLENBQUM7SUF0TkM7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxDQUFDLGtCQUFNLENBQUMsQ0FBQyxVQUF3QjtRQUN0QyxvQ0FBb0M7UUFDcEMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUM7UUFDVCxDQUFDO1FBQ0QsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxtQ0FBbUM7UUFDbkMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUMsVUFBVSxFQUFFLGFBQWE7WUFDM0QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFO2dCQUMxQyxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsR0FBRztvQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUN4RCxDQUFDO2dCQUNELEdBQUcsQ0FBQyxRQUFRO29CQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNsRSxDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxpQ0FBaUM7UUFDakMsVUFBVSxDQUFDLDBCQUEwQixDQUFDLENBQUMsVUFBVSxFQUFFLGdCQUFnQjtZQUNqRSxJQUFJLFVBQVUsR0FBRyxtQkFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDOUMsc0JBQXNCO1lBQ3RCLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLE1BQU0sVUFBVSxFQUFFLEVBQUU7Z0JBQy9DLFlBQVksRUFBRSxJQUFJO2dCQUNsQixLQUFLLENBQUMsT0FBYTtvQkFDakIsTUFBTSxDQUFTLElBQUssQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzdELENBQUM7YUFDRixDQUFDLENBQUM7WUFDSCxnQ0FBZ0M7WUFDaEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxVQUFVLEVBQUUsRUFBRTtnQkFDL0MsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLEtBQUssQ0FBQyxhQUE4QixFQUFFLE9BQWE7b0JBQ2pELE1BQU0sQ0FBUyxJQUFLLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDNUUsQ0FBQzthQUNGLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsSUFBSSxZQUFZLEdBQUcsd0JBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDM0MsZ0NBQWdDO2dCQUNoQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLFlBQVksRUFBRSxFQUFFO29CQUNqRCxZQUFZLEVBQUUsSUFBSTtvQkFDbEIsS0FBSyxDQUFDLFlBQW1CLEVBQUUsT0FBYTt3QkFDdEMsTUFBTSxDQUFTLElBQUssQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUMzRSxDQUFDO2lCQUNGLENBQUMsQ0FBQztnQkFDSCxtQ0FBbUM7Z0JBQ25DLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsWUFBWSxFQUFFLEVBQUU7b0JBQ3BELFlBQVksRUFBRSxJQUFJO29CQUNsQixLQUFLLENBQUMsWUFBbUIsRUFBRSxPQUFhO3dCQUN0QyxNQUFNLENBQVMsSUFBSyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQzlFLENBQUM7aUJBQ0YsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyx1QkFBdUIsQ0FBSSxFQUF3RDtRQUN4RixJQUFJLEtBQUssR0FBUSxJQUFJLENBQUM7UUFDdEIsSUFBSSxNQUFNLEdBQVEsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuQyxDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQywwQkFBMEIsQ0FBSSxFQUEyRDtRQUM5RixJQUFJLEtBQUssR0FBUSxJQUFJLENBQUM7UUFDdEIsSUFBSSxNQUFNLEdBQVEsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuQyxDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBb0I7UUFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDO0lBQy9DLENBQUM7SUFVRDs7T0FFRztJQUNILElBQUksSUFBSTtRQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsYUFBYSxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJLE9BQU87UUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZ0IsSUFBSSxDQUFDLElBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO2VBQ3BFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSSxFQUFFO1FBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxJQUFJLEVBQUUsQ0FBQyxLQUFVO1FBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUksQ0FBQyxJQUFTLEVBQUUsT0FBWTtRQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7O09BRUc7SUFDRyxJQUFJLENBQUMsT0FBYTs7WUFDdEIsS0FBSyxDQUFDLFVBQVcsSUFBSSxDQUFDLElBQUssRUFBRSxDQUFDLENBQUM7WUFDL0IsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7S0FBQTtJQUVEOztPQUVHO0lBQ0csTUFBTSxDQUFDLE9BQWE7O1lBQ3hCLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2pELENBQUM7S0FBQTtJQUVEOztPQUVHO0lBQ0csVUFBVSxDQUFDLGdCQUF3QixFQUFFLE9BQWE7O1lBQ3RELElBQUksVUFBVSxHQUFTLElBQUksQ0FBQyxXQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxjQUFjLEVBQUUsOEJBQStCLGdCQUFpQix3Q0FBeUMsSUFBSSxDQUFDLElBQUssRUFBRSxDQUFDLENBQUM7WUFDdkosSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQVEsU0FBVSxVQUFVLENBQUMsSUFBSyxFQUFFLENBQUMsQ0FBQztZQUNsRixJQUFJLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekYsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQVEsSUFBSSxDQUFDLElBQUssa0RBQW1ELGdCQUFpQixpRUFBaUUsQ0FBQyxDQUFDO2dCQUN6TCxNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3ZELENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFRLElBQUksQ0FBQyxJQUFLLHlEQUEwRCxnQkFBaUIsaUZBQWlGLENBQUMsQ0FBQztZQUMvTSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQVcsS0FBSyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDRyxVQUFVLENBQUMsZ0JBQXdCLEVBQUUsYUFBNEIsRUFBRSxPQUFhOztZQUNwRixJQUFJLFVBQVUsR0FBUyxJQUFJLENBQUMsV0FBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDM0QsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1RixDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNHLFVBQVUsQ0FBQyxnQkFBd0IsRUFBRSxZQUFtQixFQUFFLE9BQWE7O1lBQzNFLElBQUksVUFBVSxHQUFTLElBQUksQ0FBQyxXQUFZLENBQUMsc0JBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzRixDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNHLGFBQWEsQ0FBQyxnQkFBd0IsRUFBRSxZQUFtQixFQUFFLE9BQWE7O1lBQzlFLElBQUksVUFBVSxHQUFTLElBQUksQ0FBQyxXQUFZLENBQUMsc0JBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDSCxPQUFPO1FBQ0wsSUFBSSxpQkFBaUIsR0FBNEIsSUFBSSxDQUFDLFdBQVksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxhQUFhO1lBQ25ILE1BQU0sQ0FBQyxHQUFJLGFBQWMsSUFBSyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBRSxFQUFFLENBQUM7UUFDdkUsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsSUFBSyxrQkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSyxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUcsSUFBSyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBQztJQUNsSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ04sTUFBTSxDQUFDLElBQUssa0JBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLElBQUssSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFHLEdBQUcsQ0FBQztJQUNoRixDQUFDOztBQTFORDs7O0dBR0c7QUFDSSxjQUFRLEdBQUcsS0FBSyxDQUFDO0FBTjFCLHdCQThOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0ICogYXMgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHsgcGx1cmFsaXplLCBzaW5ndWxhcml6ZSB9IGZyb20gJ2luZmxlY3Rpb24nO1xuaW1wb3J0IHsgc3RhcnRDYXNlLCB1cHBlckZpcnN0IH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBEZW5hbGlPYmplY3QgZnJvbSAnLi4vbWV0YWwvb2JqZWN0JztcbmltcG9ydCBDb250YWluZXIsIHsgb25Mb2FkIH0gZnJvbSAnLi4vbWV0YWwvY29udGFpbmVyJztcbmltcG9ydCBPUk1BZGFwdGVyIGZyb20gJy4vb3JtLWFkYXB0ZXInO1xuaW1wb3J0IHsgUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgQXR0cmlidXRlRGVzY3JpcHRvciB9IGZyb20gJy4vZGVzY3JpcHRvcnMnO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZW5hbGk6bW9kZWwnKTtcblxuLyoqXG4gKiBUaGUgTW9kZWwgY2xhc3MgaXMgdGhlIGNvcmUgb2YgRGVuYWxpJ3MgdW5pcXVlIGFwcHJvYWNoIHRvIGRhdGEgYW5kIE9STXMuIEl0IGFjdHMgYXMgYSB3cmFwcGVyXG4gKiBhbmQgdHJhbnNsYXRpb24gbGF5ZXIgdGhhdCBwcm92aWRlcyBhIHVuaWZpZWQgaW50ZXJmYWNlIHRvIGFjY2VzcyBhbmQgbWFuaXB1bGF0ZSBkYXRhLCBidXRcbiAqIHRyYW5zbGF0ZXMgdGhvc2UgaW50ZXJhY3Rpb25zIGludG8gT1JNIHNwZWNpZmljIG9wZXJhdGlvbnMgdmlhIE9STSBhZGFwdGVycy5cbiAqXG4gKiBNb2RlbHMgYXJlIGFibGUgdG8gbWFpbnRhaW4gdGhlaXIgcmVsYXRpdmVseSBjbGVhbiBpbnRlcmZhY2UgdGhhbmtzIHRvIHRoZSB3YXkgdGhlIGNvbnN0cnVjdG9yXG4gKiBhY3R1YWxseSByZXR1cm5zIGEgUHJveHkgd2hpY2ggd3JhcHMgdGhlIE1vZGVsIGluc3RhbmNlLCByYXRoZXIgdGhhbiB0aGUgTW9kZWwgaW5zdGFuY2UgZGlyZWN0bHkuXG4gKiBUaGlzIG1lYW5zIHlvdSBjYW4gZGlyZWN0bHkgZ2V0IGFuZCBzZXQgcHJvcGVydGllcyBvbiB5b3VyIHJlY29yZHMsIGFuZCB0aGUgcmVjb3JkICh3aGljaCBpcyBhXG4gKiBQcm94eS13cmFwcGVkIE1vZGVsKSB3aWxsIHRyYW5zbGF0ZSBhbmQgZm9yd2FyZCB0aG9zZSBjYWxscyB0byB0aGUgdW5kZXJseWluZyBPUk0gYWRhcHRlci5cbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsIGV4dGVuZHMgRGVuYWxpT2JqZWN0IHtcblxuICAvKipcbiAgICogTWFya3MgdGhlIE1vZGVsIGFzIGFuIGFic3RyYWN0IGJhc2UgbW9kZWwsIHNvIE9STSBhZGFwdGVycyBjYW4ga25vdyBub3QgdG8gY3JlYXRlIHRhYmxlcyBvclxuICAgKiBvdGhlciBzdXBwb3J0aW5nIGluZnJhc3RydWN0dXJlLlxuICAgKi9cbiAgc3RhdGljIGFic3RyYWN0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdoZW4gdGhpcyBjbGFzcyBpcyBsb2FkZWQgaW50byBhIGNvbnRhaW5lciwgaW5zcGVjdCB0aGUgY2xhc3MgZGVmaW50aW9uIGFuZCBhZGQgdGhlIGFwcHJvcHJpYXRlXG4gICAqIGdldHRlcnMgYW5kIHNldHRlcnMgZm9yIGVhY2ggYXR0cmlidXRlIGRlZmluZWQsIGFuZCB0aGUgYXBwcm9wcmlhdGUgcmVsYXRpb25zaGlwIG1ldGhvZHMgZm9yXG4gICAqIGVhY2ggcmVsYXRpb25zaGlwIGRlZmluZWQuIFRoZXNlIHdpbGwgZGVsZWdhdGUgYWN0aXZpdHkgdG8gdGhlIHVuZGVybHlpbmcgT1JNIGluc3RhbmNlLlxuICAgKi9cbiAgc3RhdGljIFtvbkxvYWRdKE1vZGVsQ2xhc3M6IHR5cGVvZiBNb2RlbCkge1xuICAgIC8vIFNraXAgZGVmaW5pbmcgb24gYWJzdHJhY3QgY2xhc3Nlc1xuICAgIGlmIChNb2RlbENsYXNzLmhhc093blByb3BlcnR5KCdhYnN0cmFjdCcpICYmIE1vZGVsQ2xhc3MuYWJzdHJhY3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHByb3RvID0gTW9kZWxDbGFzcy5wcm90b3R5cGU7XG4gICAgLy8gRGVmaW5lIGF0dHJpYnV0ZSBnZXR0ZXIvc2V0dHRlcnNcbiAgICBNb2RlbENsYXNzLm1hcEF0dHJpYnV0ZURlc2NyaXB0b3JzKChkZXNjcmlwdG9yLCBhdHRyaWJ1dGVOYW1lKSA9PiB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sIGF0dHJpYnV0ZU5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRhcHRlci5nZXRBdHRyaWJ1dGUodGhpcywgYXR0cmlidXRlTmFtZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldChuZXdWYWx1ZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuc2V0QXR0cmlidXRlKHRoaXMsIGF0dHJpYnV0ZU5hbWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgLy8gRGVmaW5lIHJlbGF0aW9uc2hpcCBvcGVyYXRpb25zXG4gICAgTW9kZWxDbGFzcy5tYXBSZWxhdGlvbnNoaXBEZXNjcmlwdG9ycygoZGVzY3JpcHRvciwgcmVsYXRpb25zaGlwTmFtZSkgPT4ge1xuICAgICAgbGV0IG1ldGhvZFJvb3QgPSB1cHBlckZpcnN0KHJlbGF0aW9uc2hpcE5hbWUpO1xuICAgICAgLy8gZ2V0QXV0aG9yKG9wdGlvbnM/KVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBgZ2V0JHttZXRob2RSb290fWAsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZShvcHRpb25zPzogYW55KSB7XG4gICAgICAgICAgcmV0dXJuICg8TW9kZWw+dGhpcykuZ2V0UmVsYXRlZChyZWxhdGlvbnNoaXBOYW1lLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBzZXRBdXRob3IoY29tbWVudHMsIG9wdGlvbnM/KVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBgc2V0JHttZXRob2RSb290fWAsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZShyZWxhdGVkTW9kZWxzOiBNb2RlbCB8IE1vZGVsW10sIG9wdGlvbnM/OiBhbnkpIHtcbiAgICAgICAgICByZXR1cm4gKDxNb2RlbD50aGlzKS5zZXRSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWUsIHJlbGF0ZWRNb2RlbHMsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChkZXNjcmlwdG9yLm1vZGUgPT09ICdoYXNNYW55Jykge1xuICAgICAgICBsZXQgc2luZ3VsYXJSb290ID0gc2luZ3VsYXJpemUobWV0aG9kUm9vdCk7XG4gICAgICAgIC8vIGFkZENvbW1lbnQoY29tbWVudCwgb3B0aW9ucz8pXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgYGFkZCR7c2luZ3VsYXJSb290fWAsIHtcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgdmFsdWUocmVsYXRlZE1vZGVsOiBNb2RlbCwgb3B0aW9ucz86IGFueSkge1xuICAgICAgICAgICAgcmV0dXJuICg8TW9kZWw+dGhpcykuYWRkUmVsYXRlZChyZWxhdGlvbnNoaXBOYW1lLCByZWxhdGVkTW9kZWwsIG9wdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHJlbW92ZUNvbW1lbnQoY29tbWVudCwgb3B0aW9ucz8pXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgYHJlbW92ZSR7c2luZ3VsYXJSb290fWAsIHtcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgdmFsdWUocmVsYXRlZE1vZGVsOiBNb2RlbCwgb3B0aW9ucz86IGFueSkge1xuICAgICAgICAgICAgcmV0dXJuICg8TW9kZWw+dGhpcykucmVtb3ZlUmVsYXRlZChyZWxhdGlvbnNoaXBOYW1lLCByZWxhdGVkTW9kZWwsIG9wdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCB0aGUgc3VwcGxpZWQgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGVhY2ggYXR0cmlidXRlIG9uIHRoaXMgbW9kZWwsIHBhc3NpbmcgaW4gdGhlIGF0dHJpYnV0ZVxuICAgKiBuYW1lIGFuZCBhdHRyaWJ1dGUgZGVzY3JpcHRvci5cbiAgICovXG4gIHN0YXRpYyBtYXBBdHRyaWJ1dGVEZXNjcmlwdG9yczxUPihmbjogKGRlc2NyaXB0b3I6IEF0dHJpYnV0ZURlc2NyaXB0b3IsIG5hbWU6IHN0cmluZykgPT4gVCk6IFRbXSB7XG4gICAgbGV0IGtsYXNzID0gPGFueT50aGlzO1xuICAgIGxldCByZXN1bHQ6IFRbXSA9IFtdO1xuICAgIGZvciAobGV0IGtleSBpbiBrbGFzcykge1xuICAgICAgaWYgKGtsYXNzW2tleV0gJiYga2xhc3Nba2V5XS5pc0F0dHJpYnV0ZSkge1xuICAgICAgICByZXN1bHQucHVzaChmbihrbGFzc1trZXldLCBrZXkpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSBzdXBwbGllZCBjYWxsYmFjayBmdW5jdGlvbiBmb3IgZWFjaCByZWxhdGlvbnNoaXAgb24gdGhpcyBtb2RlbCwgcGFzc2luZyBpbiB0aGVcbiAgICogcmVsYXRpb25zaGlwIG5hbWUgYW5kIHJlbGF0aW9uc2hpcCBkZXNjcmlwdG9yLlxuICAgKi9cbiAgc3RhdGljIG1hcFJlbGF0aW9uc2hpcERlc2NyaXB0b3JzPFQ+KGZuOiAoZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgbmFtZTogc3RyaW5nKSA9PiBUKTogVFtdIHtcbiAgICBsZXQga2xhc3MgPSA8YW55PnRoaXM7XG4gICAgbGV0IHJlc3VsdDogVFtdID0gW107XG4gICAgZm9yIChsZXQga2V5IGluIGtsYXNzKSB7XG4gICAgICBpZiAoa2xhc3Nba2V5XSAmJiBrbGFzc1trZXldLmlzUmVsYXRpb25zaGlwKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGZuKGtsYXNzW2tleV0sIGtleSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdHlwZSBzdHJpbmcgZm9yIHRoaXMgbW9kZWwgY2xhc3MuIFlvdSBtdXN0IHN1cHBseSBhIGNvbnRhaW5lciBpbnN0YW5jZSBzbyB3ZSBjYW4gbG9va3VwXG4gICAqIHRoZSBjb250YWluZXIgbmFtZSBmb3IgdGhpcyBtb2RlbCBjbGFzcy5cbiAgICovXG4gIHN0YXRpYyBnZXRUeXBlKGNvbnRhaW5lcjogQ29udGFpbmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gY29udGFpbmVyLm1ldGFGb3IodGhpcykuY29udGFpbmVyTmFtZTtcbiAgfVxuXG4gIFtrZXk6IHN0cmluZ106IGFueTtcblxuICAvKipcbiAgICogVGhlIHVuZGVybHlpbmcgT1JNIGFkYXB0ZXIgcmVjb3JkLiBBbiBvcGFxdWUgdmFsdWUgdG8gRGVuYWxpLCBoYW5kbGVkIGVudGlyZWx5IGJ5IHRoZSBPUk1cbiAgICogYWRhcHRlci5cbiAgICovXG4gIHJlY29yZDogYW55ID0gbnVsbDtcblxuICAvKipcbiAgICogR2V0IHRoZSB0eXBlIG9mIHRoaXMgbW9kZWwgYmFzZWQgb24gdGhlIGNvbnRhaW5lciBuYW1lIGZvciBpdFxuICAgKi9cbiAgZ2V0IHR5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jb250YWluZXIubWV0YUZvcih0aGlzLmNvbnN0cnVjdG9yKS5jb250YWluZXJOYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBPUk0gYWRhcHRlciBzcGVjaWZpYyB0byB0aGlzIG1vZGVsIHR5cGUuIERlZmF1bHRzIHRvIHRoZSBhcHBsaWNhdGlvbidzIE9STSBhZGFwdGVyIGlmIG5vbmVcbiAgICogZm9yIHRoaXMgc3BlY2lmaWMgbW9kZWwgdHlwZSBpcyBmb3VuZC5cbiAgICovXG4gIGdldCBhZGFwdGVyKCk6IE9STUFkYXB0ZXIge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5sb29rdXAoYG9ybS1hZGFwdGVyOiR7IHRoaXMudHlwZSB9YCwgeyBsb29zZTogdHJ1ZSB9KVxuICAgICAgICB8fCB0aGlzLmNvbnRhaW5lci5sb29rdXAoJ29ybS1hZGFwdGVyOmFwcGxpY2F0aW9uJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlkIG9mIHRoZSByZWNvcmRcbiAgICovXG4gIGdldCBpZCgpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuaWRGb3IodGhpcyk7XG4gIH1cbiAgc2V0IGlkKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLmFkYXB0ZXIuc2V0SWQodGhpcywgdmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlbGwgdGhlIHVuZGVybHlpbmcgT1JNIHRvIGJ1aWxkIHRoaXMgcmVjb3JkXG4gICAqL1xuICBpbml0KGRhdGE6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgc3VwZXIuaW5pdCguLi5hcmd1bWVudHMpO1xuICAgIHRoaXMucmVjb3JkID0gdGhpcy5hZGFwdGVyLmJ1aWxkUmVjb3JkKHRoaXMudHlwZSwgZGF0YSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUGVyc2lzdCB0aGlzIG1vZGVsLlxuICAgKi9cbiAgYXN5bmMgc2F2ZShvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbD4ge1xuICAgIGRlYnVnKGBzYXZpbmcgJHsgdGhpcy50eXBlIH1gKTtcbiAgICBhd2FpdCB0aGlzLmFkYXB0ZXIuc2F2ZVJlY29yZCh0aGlzLCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgdGhpcyBtb2RlbC5cbiAgICovXG4gIGFzeW5jIGRlbGV0ZShvcHRpb25zPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5hZGFwdGVyLmRlbGV0ZVJlY29yZCh0aGlzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWxhdGVkIHJlY29yZChzKSBmb3IgdGhlIGdpdmVuIHJlbGF0aW9uc2hpcC5cbiAgICovXG4gIGFzeW5jIGdldFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbHxNb2RlbFtdPiB7XG4gICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtyZWxhdGlvbnNoaXBOYW1lXTtcbiAgICBhc3NlcnQoZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmlzUmVsYXRpb25zaGlwLCBgWW91IHRyaWVkIHRvIGZldGNoIHJlbGF0ZWQgJHsgcmVsYXRpb25zaGlwTmFtZSB9LCBidXQgbm8gc3VjaCByZWxhdGlvbnNoaXAgZXhpc3RzIG9uICR7IHRoaXMudHlwZSB9YCk7XG4gICAgbGV0IFJlbGF0ZWRNb2RlbCA9IHRoaXMuY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KGBtb2RlbDokeyBkZXNjcmlwdG9yLnR5cGUgfWApO1xuICAgIGxldCByZXN1bHRzID0gYXdhaXQgdGhpcy5hZGFwdGVyLmdldFJlbGF0ZWQodGhpcywgcmVsYXRpb25zaGlwTmFtZSwgZGVzY3JpcHRvciwgb3B0aW9ucyk7XG4gICAgaWYgKGRlc2NyaXB0b3IubW9kZSA9PT0gJ2hhc09uZScpIHtcbiAgICAgIGFzc2VydCghQXJyYXkuaXNBcnJheShyZXN1bHRzKSwgYFRoZSAkeyB0aGlzLnR5cGUgfSBPUk0gYWRhcHRlciByZXR1cm5lZCBhbiBhcnJheSBmb3IgdGhlIGhhc09uZSAnJHsgcmVsYXRpb25zaGlwTmFtZSB9JyByZWxhdGlvbnNoaXAgLSBpdCBzaG91bGQgcmV0dXJuIGVpdGhlciBhbiBPUk0gcmVjb3JkIG9yIG51bGwuYCk7XG4gICAgICByZXR1cm4gcmVzdWx0cyA/IFJlbGF0ZWRNb2RlbC5jcmVhdGUocmVzdWx0cykgOiBudWxsO1xuICAgIH1cbiAgICBhc3NlcnQoQXJyYXkuaXNBcnJheShyZXN1bHRzKSwgYFRoZSAkeyB0aGlzLnR5cGUgfSBPUk0gYWRhcHRlciBkaWQgbm90IHJldHVybiBhbiBhcnJheSBmb3IgdGhlIGhhc01hbnkgJyR7IHJlbGF0aW9uc2hpcE5hbWUgfScgcmVsYXRpb25zaGlwIC0gaXQgc2hvdWxkIHJldHVybiBhbiBhcnJheSAoZW1wdHkgaWYgbm8gcmVsYXRlZCByZWNvcmRzIGV4aXN0KS5gKTtcbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlY29yZDogYW55KSA9PiBSZWxhdGVkTW9kZWwuY3JlYXRlKHJlY29yZCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSByZWxhdGVkIHJlY29yZHMgZm9yIHRoZSBnaXZlbiByZWxhdGlvbnNoaXAgd2l0aCB0aGUgc3VwcGxpZWQgcmVsYXRlZCByZWNvcmRzLlxuICAgKi9cbiAgYXN5bmMgc2V0UmVsYXRlZChyZWxhdGlvbnNoaXBOYW1lOiBzdHJpbmcsIHJlbGF0ZWRNb2RlbHM6IE1vZGVsfE1vZGVsW10sIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgZGVzY3JpcHRvciA9ICg8YW55PnRoaXMuY29uc3RydWN0b3IpW3JlbGF0aW9uc2hpcE5hbWVdO1xuICAgIGF3YWl0IHRoaXMuYWRhcHRlci5zZXRSZWxhdGVkKHRoaXMsIHJlbGF0aW9uc2hpcE5hbWUsIGRlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlbGF0ZWQgcmVjb3JkIHRvIGEgaGFzTWFueSByZWxhdGlvbnNoaXAuXG4gICAqL1xuICBhc3luYyBhZGRSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWU6IHN0cmluZywgcmVsYXRlZE1vZGVsOiBNb2RlbCwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+dGhpcy5jb25zdHJ1Y3RvcilbcGx1cmFsaXplKHJlbGF0aW9uc2hpcE5hbWUpXTtcbiAgICBhd2FpdCB0aGlzLmFkYXB0ZXIuYWRkUmVsYXRlZCh0aGlzLCByZWxhdGlvbnNoaXBOYW1lLCBkZXNjcmlwdG9yLCByZWxhdGVkTW9kZWwsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgZ2l2ZW4gcmVjb3JkIGZyb20gdGhlIGhhc01hbnkgcmVsYXRpb25zaGlwXG4gICAqL1xuICBhc3luYyByZW1vdmVSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWU6IHN0cmluZywgcmVsYXRlZE1vZGVsOiBNb2RlbCwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+dGhpcy5jb25zdHJ1Y3RvcilbcGx1cmFsaXplKHJlbGF0aW9uc2hpcE5hbWUpXTtcbiAgICBhd2FpdCB0aGlzLmFkYXB0ZXIucmVtb3ZlUmVsYXRlZCh0aGlzLCByZWxhdGlvbnNoaXBOYW1lLCBkZXNjcmlwdG9yLCByZWxhdGVkTW9kZWwsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbiBodW1hbi1mcmllbmRseSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoaXMgTW9kZWwgaW5zdGFuY2UsIHdpdGggYSBzdW1tYXJ5IG9mIGl0J3NcbiAgICogYXR0cmlidXRlc1xuICAgKi9cbiAgaW5zcGVjdCgpOiBzdHJpbmcge1xuICAgIGxldCBhdHRyaWJ1dGVzU3VtbWFyeTogc3RyaW5nW10gPSAoPHR5cGVvZiBNb2RlbD50aGlzLmNvbnN0cnVjdG9yKS5tYXBBdHRyaWJ1dGVEZXNjcmlwdG9ycygoZGVzY3JpcHRvciwgYXR0cmlidXRlTmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGAkeyBhdHRyaWJ1dGVOYW1lIH09JHsgSlNPTi5zdHJpbmdpZnkodGhpc1thdHRyaWJ1dGVOYW1lXSkgfWA7XG4gICAgfSk7XG4gICAgcmV0dXJuIGA8JHsgc3RhcnRDYXNlKHRoaXMudHlwZSkgfTokeyB0aGlzLmlkID09IG51bGwgPyAnLW5ldy0nIDogdGhpcy5pZCB9ICR7IGF0dHJpYnV0ZXNTdW1tYXJ5LmpvaW4oJywgJykgfT5gO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbiBodW1hbi1mcmllbmRseSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoaXMgTW9kZWwgaW5zdGFuY2VcbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGA8JHsgc3RhcnRDYXNlKHRoaXMudHlwZSkgfTokeyB0aGlzLmlkID09IG51bGwgPyAnLW5ldy0nIDogdGhpcy5pZCB9PmA7XG4gIH1cblxufVxuXG4iXX0=