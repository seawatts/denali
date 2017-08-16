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
            debug(`saving ${this.toString()}`);
            yield this.adapter.saveRecord(this, options);
            return this;
        });
    }
    /**
     * Delete this model.
     */
    delete(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`deleting ${this.toString()}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9kYXRhL21vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpQztBQUNqQyxxQ0FBcUM7QUFDckMsMkNBQW9EO0FBQ3BELG1DQUErQztBQUMvQyw0Q0FBMkM7QUFDM0Msa0RBQXVEO0FBSXZELE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQzs7Ozs7Ozs7Ozs7R0FXRztBQUNILFdBQTJCLFNBQVEsZ0JBQVk7SUFBL0M7O1FBNEdFOzs7V0FHRztRQUNILFdBQU0sR0FBUSxJQUFJLENBQUM7SUErR3JCLENBQUM7SUF2TkM7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxDQUFDLGtCQUFNLENBQUMsQ0FBQyxVQUF3QjtRQUN0QyxvQ0FBb0M7UUFDcEMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUM7UUFDVCxDQUFDO1FBQ0QsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxtQ0FBbUM7UUFDbkMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUMsVUFBVSxFQUFFLGFBQWE7WUFDM0QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFO2dCQUMxQyxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsR0FBRztvQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUN4RCxDQUFDO2dCQUNELEdBQUcsQ0FBQyxRQUFRO29CQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFB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O0lBRUQ7O09BRUc7SUFDRyxhQUFhLENBQUMsZ0JBQXdCLEVBQUUsWUFBbUIsRUFBRSxPQUFhOztZQUM5RSxJQUFJLFVBQVUsR0FBUyxJQUFJLENBQUMsV0FBWSxDQUFDLHNCQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUYsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ0gsT0FBTztRQUNMLElBQUksaUJBQWlCLEdBQTRCLElBQUksQ0FBQyxXQUFZLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxVQUFVLEVBQUUsYUFBYTtZQUNuSCxNQUFNLENBQUMsR0FBSSxhQUFjLElBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUUsRUFBRSxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLElBQUssa0JBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLElBQUssSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFHLElBQUssaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRSxHQUFHLENBQUM7SUFDbEgsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLE1BQU0sQ0FBQyxJQUFLLGtCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRSxJQUFLLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRyxHQUFHLENBQUM7SUFDaEYsQ0FBQzs7QUEzTkQ7OztHQUdHO0FBQ0ksY0FBUSxHQUFHLEtBQUssQ0FBQztBQU4xQix3QkErTkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCAqIGFzIGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCB7IHBsdXJhbGl6ZSwgc2luZ3VsYXJpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcbmltcG9ydCB7IHN0YXJ0Q2FzZSwgdXBwZXJGaXJzdCB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5pbXBvcnQgQ29udGFpbmVyLCB7IG9uTG9hZCB9IGZyb20gJy4uL21ldGFsL2NvbnRhaW5lcic7XG5pbXBvcnQgT1JNQWRhcHRlciBmcm9tICcuL29ybS1hZGFwdGVyJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIEF0dHJpYnV0ZURlc2NyaXB0b3IgfSBmcm9tICcuL2Rlc2NyaXB0b3JzJztcblxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGVuYWxpOm1vZGVsJyk7XG5cbi8qKlxuICogVGhlIE1vZGVsIGNsYXNzIGlzIHRoZSBjb3JlIG9mIERlbmFsaSdzIHVuaXF1ZSBhcHByb2FjaCB0byBkYXRhIGFuZCBPUk1zLiBJdCBhY3RzIGFzIGEgd3JhcHBlclxuICogYW5kIHRyYW5zbGF0aW9uIGxheWVyIHRoYXQgcHJvdmlkZXMgYSB1bmlmaWVkIGludGVyZmFjZSB0byBhY2Nlc3MgYW5kIG1hbmlwdWxhdGUgZGF0YSwgYnV0XG4gKiB0cmFuc2xhdGVzIHRob3NlIGludGVyYWN0aW9ucyBpbnRvIE9STSBzcGVjaWZpYyBvcGVyYXRpb25zIHZpYSBPUk0gYWRhcHRlcnMuXG4gKlxuICogTW9kZWxzIGFyZSBhYmxlIHRvIG1haW50YWluIHRoZWlyIHJlbGF0aXZlbHkgY2xlYW4gaW50ZXJmYWNlIHRoYW5rcyB0byB0aGUgd2F5IHRoZSBjb25zdHJ1Y3RvclxuICogYWN0dWFsbHkgcmV0dXJucyBhIFByb3h5IHdoaWNoIHdyYXBzIHRoZSBNb2RlbCBpbnN0YW5jZSwgcmF0aGVyIHRoYW4gdGhlIE1vZGVsIGluc3RhbmNlIGRpcmVjdGx5LlxuICogVGhpcyBtZWFucyB5b3UgY2FuIGRpcmVjdGx5IGdldCBhbmQgc2V0IHByb3BlcnRpZXMgb24geW91ciByZWNvcmRzLCBhbmQgdGhlIHJlY29yZCAod2hpY2ggaXMgYVxuICogUHJveHktd3JhcHBlZCBNb2RlbCkgd2lsbCB0cmFuc2xhdGUgYW5kIGZvcndhcmQgdGhvc2UgY2FsbHMgdG8gdGhlIHVuZGVybHlpbmcgT1JNIGFkYXB0ZXIuXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbCBleHRlbmRzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIE1hcmtzIHRoZSBNb2RlbCBhcyBhbiBhYnN0cmFjdCBiYXNlIG1vZGVsLCBzbyBPUk0gYWRhcHRlcnMgY2FuIGtub3cgbm90IHRvIGNyZWF0ZSB0YWJsZXMgb3JcbiAgICogb3RoZXIgc3VwcG9ydGluZyBpbmZyYXN0cnVjdHVyZS5cbiAgICovXG4gIHN0YXRpYyBhYnN0cmFjdCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBXaGVuIHRoaXMgY2xhc3MgaXMgbG9hZGVkIGludG8gYSBjb250YWluZXIsIGluc3BlY3QgdGhlIGNsYXNzIGRlZmludGlvbiBhbmQgYWRkIHRoZSBhcHByb3ByaWF0ZVxuICAgKiBnZXR0ZXJzIGFuZCBzZXR0ZXJzIGZvciBlYWNoIGF0dHJpYnV0ZSBkZWZpbmVkLCBhbmQgdGhlIGFwcHJvcHJpYXRlIHJlbGF0aW9uc2hpcCBtZXRob2RzIGZvclxuICAgKiBlYWNoIHJlbGF0aW9uc2hpcCBkZWZpbmVkLiBUaGVzZSB3aWxsIGRlbGVnYXRlIGFjdGl2aXR5IHRvIHRoZSB1bmRlcmx5aW5nIE9STSBpbnN0YW5jZS5cbiAgICovXG4gIHN0YXRpYyBbb25Mb2FkXShNb2RlbENsYXNzOiB0eXBlb2YgTW9kZWwpIHtcbiAgICAvLyBTa2lwIGRlZmluaW5nIG9uIGFic3RyYWN0IGNsYXNzZXNcbiAgICBpZiAoTW9kZWxDbGFzcy5oYXNPd25Qcm9wZXJ0eSgnYWJzdHJhY3QnKSAmJiBNb2RlbENsYXNzLmFic3RyYWN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBwcm90byA9IE1vZGVsQ2xhc3MucHJvdG90eXBlO1xuICAgIC8vIERlZmluZSBhdHRyaWJ1dGUgZ2V0dGVyL3NldHR0ZXJzXG4gICAgTW9kZWxDbGFzcy5tYXBBdHRyaWJ1dGVEZXNjcmlwdG9ycygoZGVzY3JpcHRvciwgYXR0cmlidXRlTmFtZSkgPT4ge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBhdHRyaWJ1dGVOYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuZ2V0QXR0cmlidXRlKHRoaXMsIGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQobmV3VmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hZGFwdGVyLnNldEF0dHJpYnV0ZSh0aGlzLCBhdHRyaWJ1dGVOYW1lLCBuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8vIERlZmluZSByZWxhdGlvbnNoaXAgb3BlcmF0aW9uc1xuICAgIE1vZGVsQ2xhc3MubWFwUmVsYXRpb25zaGlwRGVzY3JpcHRvcnMoKGRlc2NyaXB0b3IsIHJlbGF0aW9uc2hpcE5hbWUpID0+IHtcbiAgICAgIGxldCBtZXRob2RSb290ID0gdXBwZXJGaXJzdChyZWxhdGlvbnNoaXBOYW1lKTtcbiAgICAgIC8vIGdldEF1dGhvcihvcHRpb25zPylcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgYGdldCR7bWV0aG9kUm9vdH1gLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWUob3B0aW9ucz86IGFueSkge1xuICAgICAgICAgIHJldHVybiAoPE1vZGVsPnRoaXMpLmdldFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gc2V0QXV0aG9yKGNvbW1lbnRzLCBvcHRpb25zPylcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgYHNldCR7bWV0aG9kUm9vdH1gLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWUocmVsYXRlZE1vZGVsczogTW9kZWwgfCBNb2RlbFtdLCBvcHRpb25zPzogYW55KSB7XG4gICAgICAgICAgcmV0dXJuICg8TW9kZWw+dGhpcykuc2V0UmVsYXRlZChyZWxhdGlvbnNoaXBOYW1lLCByZWxhdGVkTW9kZWxzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoZGVzY3JpcHRvci5tb2RlID09PSAnaGFzTWFueScpIHtcbiAgICAgICAgbGV0IHNpbmd1bGFyUm9vdCA9IHNpbmd1bGFyaXplKG1ldGhvZFJvb3QpO1xuICAgICAgICAvLyBhZGRDb21tZW50KGNvbW1lbnQsIG9wdGlvbnM/KVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sIGBhZGQke3Npbmd1bGFyUm9vdH1gLCB7XG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIHZhbHVlKHJlbGF0ZWRNb2RlbDogTW9kZWwsIG9wdGlvbnM/OiBhbnkpIHtcbiAgICAgICAgICAgIHJldHVybiAoPE1vZGVsPnRoaXMpLmFkZFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZSwgcmVsYXRlZE1vZGVsLCBvcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyByZW1vdmVDb21tZW50KGNvbW1lbnQsIG9wdGlvbnM/KVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sIGByZW1vdmUke3Npbmd1bGFyUm9vdH1gLCB7XG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIHZhbHVlKHJlbGF0ZWRNb2RlbDogTW9kZWwsIG9wdGlvbnM/OiBhbnkpIHtcbiAgICAgICAgICAgIHJldHVybiAoPE1vZGVsPnRoaXMpLnJlbW92ZVJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZSwgcmVsYXRlZE1vZGVsLCBvcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIHN1cHBsaWVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBlYWNoIGF0dHJpYnV0ZSBvbiB0aGlzIG1vZGVsLCBwYXNzaW5nIGluIHRoZSBhdHRyaWJ1dGVcbiAgICogbmFtZSBhbmQgYXR0cmlidXRlIGRlc2NyaXB0b3IuXG4gICAqL1xuICBzdGF0aWMgbWFwQXR0cmlidXRlRGVzY3JpcHRvcnM8VD4oZm46IChkZXNjcmlwdG9yOiBBdHRyaWJ1dGVEZXNjcmlwdG9yLCBuYW1lOiBzdHJpbmcpID0+IFQpOiBUW10ge1xuICAgIGxldCBrbGFzcyA9IDxhbnk+dGhpcztcbiAgICBsZXQgcmVzdWx0OiBUW10gPSBbXTtcbiAgICBmb3IgKGxldCBrZXkgaW4ga2xhc3MpIHtcbiAgICAgIGlmIChrbGFzc1trZXldICYmIGtsYXNzW2tleV0uaXNBdHRyaWJ1dGUpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goZm4oa2xhc3Nba2V5XSwga2V5KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCB0aGUgc3VwcGxpZWQgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGVhY2ggcmVsYXRpb25zaGlwIG9uIHRoaXMgbW9kZWwsIHBhc3NpbmcgaW4gdGhlXG4gICAqIHJlbGF0aW9uc2hpcCBuYW1lIGFuZCByZWxhdGlvbnNoaXAgZGVzY3JpcHRvci5cbiAgICovXG4gIHN0YXRpYyBtYXBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yczxUPihmbjogKGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIG5hbWU6IHN0cmluZykgPT4gVCk6IFRbXSB7XG4gICAgbGV0IGtsYXNzID0gPGFueT50aGlzO1xuICAgIGxldCByZXN1bHQ6IFRbXSA9IFtdO1xuICAgIGZvciAobGV0IGtleSBpbiBrbGFzcykge1xuICAgICAgaWYgKGtsYXNzW2tleV0gJiYga2xhc3Nba2V5XS5pc1JlbGF0aW9uc2hpcCkge1xuICAgICAgICByZXN1bHQucHVzaChmbihrbGFzc1trZXldLCBrZXkpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHR5cGUgc3RyaW5nIGZvciB0aGlzIG1vZGVsIGNsYXNzLiBZb3UgbXVzdCBzdXBwbHkgYSBjb250YWluZXIgaW5zdGFuY2Ugc28gd2UgY2FuIGxvb2t1cFxuICAgKiB0aGUgY29udGFpbmVyIG5hbWUgZm9yIHRoaXMgbW9kZWwgY2xhc3MuXG4gICAqL1xuICBzdGF0aWMgZ2V0VHlwZShjb250YWluZXI6IENvbnRhaW5lcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5tZXRhRm9yKHRoaXMpLmNvbnRhaW5lck5hbWU7XG4gIH1cblxuICBba2V5OiBzdHJpbmddOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSB1bmRlcmx5aW5nIE9STSBhZGFwdGVyIHJlY29yZC4gQW4gb3BhcXVlIHZhbHVlIHRvIERlbmFsaSwgaGFuZGxlZCBlbnRpcmVseSBieSB0aGUgT1JNXG4gICAqIGFkYXB0ZXIuXG4gICAqL1xuICByZWNvcmQ6IGFueSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdHlwZSBvZiB0aGlzIG1vZGVsIGJhc2VkIG9uIHRoZSBjb250YWluZXIgbmFtZSBmb3IgaXRcbiAgICovXG4gIGdldCB0eXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLm1ldGFGb3IodGhpcy5jb25zdHJ1Y3RvcikuY29udGFpbmVyTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgT1JNIGFkYXB0ZXIgc3BlY2lmaWMgdG8gdGhpcyBtb2RlbCB0eXBlLiBEZWZhdWx0cyB0byB0aGUgYXBwbGljYXRpb24ncyBPUk0gYWRhcHRlciBpZiBub25lXG4gICAqIGZvciB0aGlzIHNwZWNpZmljIG1vZGVsIHR5cGUgaXMgZm91bmQuXG4gICAqL1xuICBnZXQgYWRhcHRlcigpOiBPUk1BZGFwdGVyIHtcbiAgICByZXR1cm4gdGhpcy5jb250YWluZXIubG9va3VwKGBvcm0tYWRhcHRlcjokeyB0aGlzLnR5cGUgfWAsIHsgbG9vc2U6IHRydWUgfSlcbiAgICAgICAgfHwgdGhpcy5jb250YWluZXIubG9va3VwKCdvcm0tYWRhcHRlcjphcHBsaWNhdGlvbicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpZCBvZiB0aGUgcmVjb3JkXG4gICAqL1xuICBnZXQgaWQoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmlkRm9yKHRoaXMpO1xuICB9XG4gIHNldCBpZCh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5hZGFwdGVyLnNldElkKHRoaXMsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZWxsIHRoZSB1bmRlcmx5aW5nIE9STSB0byBidWlsZCB0aGlzIHJlY29yZFxuICAgKi9cbiAgaW5pdChkYXRhOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIHN1cGVyLmluaXQoLi4uYXJndW1lbnRzKTtcbiAgICB0aGlzLnJlY29yZCA9IHRoaXMuYWRhcHRlci5idWlsZFJlY29yZCh0aGlzLnR5cGUsIGRhdGEsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcnNpc3QgdGhpcyBtb2RlbC5cbiAgICovXG4gIGFzeW5jIHNhdmUob3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWw+IHtcbiAgICBkZWJ1Zyhgc2F2aW5nICR7IHRoaXMudG9TdHJpbmcoKX1gKTtcbiAgICBhd2FpdCB0aGlzLmFkYXB0ZXIuc2F2ZVJlY29yZCh0aGlzLCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgdGhpcyBtb2RlbC5cbiAgICovXG4gIGFzeW5jIGRlbGV0ZShvcHRpb25zPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgZGVidWcoYGRlbGV0aW5nICR7IHRoaXMudG9TdHJpbmcoKSB9YCk7XG4gICAgYXdhaXQgdGhpcy5hZGFwdGVyLmRlbGV0ZVJlY29yZCh0aGlzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWxhdGVkIHJlY29yZChzKSBmb3IgdGhlIGdpdmVuIHJlbGF0aW9uc2hpcC5cbiAgICovXG4gIGFzeW5jIGdldFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbHxNb2RlbFtdPiB7XG4gICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtyZWxhdGlvbnNoaXBOYW1lXTtcbiAgICBhc3NlcnQoZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmlzUmVsYXRpb25zaGlwLCBgWW91IHRyaWVkIHRvIGZldGNoIHJlbGF0ZWQgJHsgcmVsYXRpb25zaGlwTmFtZSB9LCBidXQgbm8gc3VjaCByZWxhdGlvbnNoaXAgZXhpc3RzIG9uICR7IHRoaXMudHlwZSB9YCk7XG4gICAgbGV0IFJlbGF0ZWRNb2RlbCA9IHRoaXMuY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KGBtb2RlbDokeyBkZXNjcmlwdG9yLnR5cGUgfWApO1xuICAgIGxldCByZXN1bHRzID0gYXdhaXQgdGhpcy5hZGFwdGVyLmdldFJlbGF0ZWQodGhpcywgcmVsYXRpb25zaGlwTmFtZSwgZGVzY3JpcHRvciwgb3B0aW9ucyk7XG4gICAgaWYgKGRlc2NyaXB0b3IubW9kZSA9PT0gJ2hhc09uZScpIHtcbiAgICAgIGFzc2VydCghQXJyYXkuaXNBcnJheShyZXN1bHRzKSwgYFRoZSAkeyB0aGlzLnR5cGUgfSBPUk0gYWRhcHRlciByZXR1cm5lZCBhbiBhcnJheSBmb3IgdGhlIGhhc09uZSAnJHsgcmVsYXRpb25zaGlwTmFtZSB9JyByZWxhdGlvbnNoaXAgLSBpdCBzaG91bGQgcmV0dXJuIGVpdGhlciBhbiBPUk0gcmVjb3JkIG9yIG51bGwuYCk7XG4gICAgICByZXR1cm4gcmVzdWx0cyA/IFJlbGF0ZWRNb2RlbC5jcmVhdGUocmVzdWx0cykgOiBudWxsO1xuICAgIH1cbiAgICBhc3NlcnQoQXJyYXkuaXNBcnJheShyZXN1bHRzKSwgYFRoZSAkeyB0aGlzLnR5cGUgfSBPUk0gYWRhcHRlciBkaWQgbm90IHJldHVybiBhbiBhcnJheSBmb3IgdGhlIGhhc01hbnkgJyR7IHJlbGF0aW9uc2hpcE5hbWUgfScgcmVsYXRpb25zaGlwIC0gaXQgc2hvdWxkIHJldHVybiBhbiBhcnJheSAoZW1wdHkgaWYgbm8gcmVsYXRlZCByZWNvcmRzIGV4aXN0KS5gKTtcbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlY29yZDogYW55KSA9PiBSZWxhdGVkTW9kZWwuY3JlYXRlKHJlY29yZCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSByZWxhdGVkIHJlY29yZHMgZm9yIHRoZSBnaXZlbiByZWxhdGlvbnNoaXAgd2l0aCB0aGUgc3VwcGxpZWQgcmVsYXRlZCByZWNvcmRzLlxuICAgKi9cbiAgYXN5bmMgc2V0UmVsYXRlZChyZWxhdGlvbnNoaXBOYW1lOiBzdHJpbmcsIHJlbGF0ZWRNb2RlbHM6IE1vZGVsfE1vZGVsW10sIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgZGVzY3JpcHRvciA9ICg8YW55PnRoaXMuY29uc3RydWN0b3IpW3JlbGF0aW9uc2hpcE5hbWVdO1xuICAgIGF3YWl0IHRoaXMuYWRhcHRlci5zZXRSZWxhdGVkKHRoaXMsIHJlbGF0aW9uc2hpcE5hbWUsIGRlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlbGF0ZWQgcmVjb3JkIHRvIGEgaGFzTWFueSByZWxhdGlvbnNoaXAuXG4gICAqL1xuICBhc3luYyBhZGRSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWU6IHN0cmluZywgcmVsYXRlZE1vZGVsOiBNb2RlbCwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+dGhpcy5jb25zdHJ1Y3RvcilbcGx1cmFsaXplKHJlbGF0aW9uc2hpcE5hbWUpXTtcbiAgICBhd2FpdCB0aGlzLmFkYXB0ZXIuYWRkUmVsYXRlZCh0aGlzLCByZWxhdGlvbnNoaXBOYW1lLCBkZXNjcmlwdG9yLCByZWxhdGVkTW9kZWwsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgZ2l2ZW4gcmVjb3JkIGZyb20gdGhlIGhhc01hbnkgcmVsYXRpb25zaGlwXG4gICAqL1xuICBhc3luYyByZW1vdmVSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWU6IHN0cmluZywgcmVsYXRlZE1vZGVsOiBNb2RlbCwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+dGhpcy5jb25zdHJ1Y3RvcilbcGx1cmFsaXplKHJlbGF0aW9uc2hpcE5hbWUpXTtcbiAgICBhd2FpdCB0aGlzLmFkYXB0ZXIucmVtb3ZlUmVsYXRlZCh0aGlzLCByZWxhdGlvbnNoaXBOYW1lLCBkZXNjcmlwdG9yLCByZWxhdGVkTW9kZWwsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbiBodW1hbi1mcmllbmRseSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoaXMgTW9kZWwgaW5zdGFuY2UsIHdpdGggYSBzdW1tYXJ5IG9mIGl0J3NcbiAgICogYXR0cmlidXRlc1xuICAgKi9cbiAgaW5zcGVjdCgpOiBzdHJpbmcge1xuICAgIGxldCBhdHRyaWJ1dGVzU3VtbWFyeTogc3RyaW5nW10gPSAoPHR5cGVvZiBNb2RlbD50aGlzLmNvbnN0cnVjdG9yKS5tYXBBdHRyaWJ1dGVEZXNjcmlwdG9ycygoZGVzY3JpcHRvciwgYXR0cmlidXRlTmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGAkeyBhdHRyaWJ1dGVOYW1lIH09JHsgSlNPTi5zdHJpbmdpZnkodGhpc1thdHRyaWJ1dGVOYW1lXSkgfWA7XG4gICAgfSk7XG4gICAgcmV0dXJuIGA8JHsgc3RhcnRDYXNlKHRoaXMudHlwZSkgfTokeyB0aGlzLmlkID09IG51bGwgPyAnLW5ldy0nIDogdGhpcy5pZCB9ICR7IGF0dHJpYnV0ZXNTdW1tYXJ5LmpvaW4oJywgJykgfT5gO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbiBodW1hbi1mcmllbmRseSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoaXMgTW9kZWwgaW5zdGFuY2VcbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGA8JHsgc3RhcnRDYXNlKHRoaXMudHlwZSkgfTokeyB0aGlzLmlkID09IG51bGwgPyAnLW5ldy0nIDogdGhpcy5pZCB9PmA7XG4gIH1cblxufVxuXG4iXX0=