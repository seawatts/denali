"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base Descriptor class
 *
 * @package data
 */
class Descriptor {
    /**
     * Creates an instance of Descriptor.
     */
    constructor(type, options = {}) {
        this.type = type;
        this.options = options;
    }
}
exports.Descriptor = Descriptor;
/**
 * The Attribute class is used to tell Denali what the available attributes are
 * on your Model. You shouldn't use the Attribute class directly; instead,
 * import the `attr()` method from Denali, and use it to define an attribute:
 *
 *     import { attr } from 'denali';
 *     class Post extends ApplicationModel {
 *       static title = attr('text');
 *     }
 *
 * Note that attributes must be defined as `static` properties on your Model
 * class.
 *
 * The `attr()` method takes two arguments:
 *
 *   * `type` - a string indicating the type of this attribute. Denali doesn't
 *   care what this string is. Your ORM adapter should specify what types it
 *   expects.
 *   * `options` - any additional options for this attribute. At the moment,
 *   these are used solely by your ORM adapter, there are no additional options
 *   that Denali expects itself.
 *
 * @package data
 * @since 0.1.0
 */
class AttributeDescriptor extends Descriptor {
    constructor() {
        super(...arguments);
        /**
         * Convenience flag for checking if this is an attribute
         */
        this.isAttribute = true;
    }
}
exports.AttributeDescriptor = AttributeDescriptor;
/**
 * Syntax sugar factory method for creating Attributes
 *
 * @package data
 * @since 0.1.0
 */
function attr(type, options) {
    return new AttributeDescriptor(type, options);
}
exports.attr = attr;
/**
 * The HasManyRelationship class is used to describe a 1 to many or many to many
 * relationship on your Model. You shouldn't use the HasManyRelationship class
 * directly; instead, import the `hasMany()` method from Denali, and use it to
 * define a relationship:
 *
 *     import { hasMany } from 'denali';
 *     class Post extends ApplicationModel {
 *       static comments = hasMany('comment');
 *     }
 *
 * Note that relationships must be defined as `static` properties on your Model
 * class.
 *
 * The `hasMany()` method takes two arguments:
 *
 *   * `type` - a string indicating the type of model for this relationship.
 *   * `options` - any additional options for this attribute. At the moment,
 *   these are used solely by your ORM adapter, there are no additional options
 *   that Denali expects itself.
 *
 * @package data
 * @since 0.1.0
 */
class HasManyRelationshipDescriptor extends Descriptor {
    constructor() {
        super(...arguments);
        /**
         * Convenience flag for checking if this is a relationship
         */
        this.isRelationship = true;
        /**
         * Relationship mode, i.e. 1 -> 1 or 1 -> N
         */
        this.mode = 'hasMany';
    }
}
exports.HasManyRelationshipDescriptor = HasManyRelationshipDescriptor;
/**
 * Syntax sugar factory function for creating HasManyRelationships
 *
 * @package data
 * @since 0.1.0
 */
function hasMany(type, options) {
    return new HasManyRelationshipDescriptor(type, options);
}
exports.hasMany = hasMany;
/**
 * The HasOneRelationship class is used to describe a 1 to many or 1 to 1
 * relationship on your Model. You shouldn't use the HasOneRelationship class
 * directly; instead, import the `hasOne()` method from Denali, and use it to
 * define a relationship:
 *
 *     import { hasOne } from 'denali';
 *     class Post extends ApplicationModel {
 *       static author = hasOne('user');
 *     }
 *
 * Note that relationships must be defined as `static` properties on your Model
 * class.
 *
 * The `hasOne()` method takes two arguments:
 *
 *   * `type` - a string indicating the type of model for this relationship.
 *   * `options` - any additional options for this attribute. At the moment,
 *   these are used solely by your ORM adapter, there are no additional options
 *   that Denali expects itself.
 *
 * @package data
 * @since 0.1.0
 */
class HasOneRelationshipDescriptor extends Descriptor {
    constructor() {
        super(...arguments);
        /**
         * Convenience flag for checking if this is a relationship
         */
        this.isRelationship = true;
        /**
         * Relationship mode, i.e. 1 -> 1 or 1 -> N
         */
        this.mode = 'hasOne';
    }
}
exports.HasOneRelationshipDescriptor = HasOneRelationshipDescriptor;
/**
 * Syntax sugar factory function for creating HasOneRelationships
 *
 * @package data
 * @since 0.1.0
 */
function hasOne(type, options) {
    return new HasOneRelationshipDescriptor(type, options);
}
exports.hasOne = hasOne;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzY3JpcHRvcnMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9kYXRhL2Rlc2NyaXB0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7R0FJRztBQUNIO0lBWUU7O09BRUc7SUFDSCxZQUFZLElBQVksRUFBRSxVQUFlLEVBQUU7UUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztDQUVGO0FBcEJELGdDQW9CQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSCx5QkFBaUMsU0FBUSxVQUFVO0lBQW5EOztRQUVFOztXQUVHO1FBQ0gsZ0JBQVcsR0FBRyxJQUFJLENBQUM7SUFFckIsQ0FBQztDQUFBO0FBUEQsa0RBT0M7QUFFRDs7Ozs7R0FLRztBQUNILGNBQXFCLElBQVksRUFBRSxPQUFhO0lBQzlDLE1BQU0sQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBRkQsb0JBRUM7QUFHRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxtQ0FBMkMsU0FBUSxVQUFVO0lBQTdEOztRQUVFOztXQUVHO1FBQ0gsbUJBQWMsR0FBRyxJQUFJLENBQUM7UUFFdEI7O1dBRUc7UUFDSCxTQUFJLEdBQXlCLFNBQVMsQ0FBQztJQUV6QyxDQUFDO0NBQUE7QUFaRCxzRUFZQztBQUVEOzs7OztHQUtHO0FBQ0gsaUJBQXdCLElBQVksRUFBRSxPQUFhO0lBQ2pELE1BQU0sQ0FBQyxJQUFJLDZCQUE2QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMxRCxDQUFDO0FBRkQsMEJBRUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxrQ0FBMEMsU0FBUSxVQUFVO0lBQTVEOztRQUVFOztXQUVHO1FBQ0gsbUJBQWMsR0FBRyxJQUFJLENBQUM7UUFFdEI7O1dBRUc7UUFDSCxTQUFJLEdBQXlCLFFBQVEsQ0FBQztJQUV4QyxDQUFDO0NBQUE7QUFaRCxvRUFZQztBQUVEOzs7OztHQUtHO0FBQ0gsZ0JBQXVCLElBQVksRUFBRSxPQUFhO0lBQ2hELE1BQU0sQ0FBQyxJQUFJLDRCQUE0QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRkQsd0JBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEJhc2UgRGVzY3JpcHRvciBjbGFzc1xuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGNsYXNzIERlc2NyaXB0b3Ige1xuXG4gIC8qKlxuICAgKiBXaGF0IGtpbmQgb2YgZGVzY3JpcHRvciBpcyB0aGlzPyBVc2VkIGJ5IHN1YmNsYXNzZXMgdG8gZGlmZmVyZW50aWF0ZSBlYXNpbHkgYmV0d2VlbiB0eXBlcy5cbiAgICovXG4gIHR5cGU6IHN0cmluZztcblxuICAvKipcbiAgICogR2VuZXJpYyBvcHRpb25zIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHN1cHBseSBEZW5hbGkgb3IgT1JNIHNwZWNpZmljIGNvbmZpZyBvcHRpb25zLlxuICAgKi9cbiAgb3B0aW9uczogYW55O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIERlc2NyaXB0b3IuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG5cbn1cblxuLyoqXG4gKiBUaGUgQXR0cmlidXRlIGNsYXNzIGlzIHVzZWQgdG8gdGVsbCBEZW5hbGkgd2hhdCB0aGUgYXZhaWxhYmxlIGF0dHJpYnV0ZXMgYXJlXG4gKiBvbiB5b3VyIE1vZGVsLiBZb3Ugc2hvdWxkbid0IHVzZSB0aGUgQXR0cmlidXRlIGNsYXNzIGRpcmVjdGx5OyBpbnN0ZWFkLFxuICogaW1wb3J0IHRoZSBgYXR0cigpYCBtZXRob2QgZnJvbSBEZW5hbGksIGFuZCB1c2UgaXQgdG8gZGVmaW5lIGFuIGF0dHJpYnV0ZTpcbiAqXG4gKiAgICAgaW1wb3J0IHsgYXR0ciB9IGZyb20gJ2RlbmFsaSc7XG4gKiAgICAgY2xhc3MgUG9zdCBleHRlbmRzIEFwcGxpY2F0aW9uTW9kZWwge1xuICogICAgICAgc3RhdGljIHRpdGxlID0gYXR0cigndGV4dCcpO1xuICogICAgIH1cbiAqXG4gKiBOb3RlIHRoYXQgYXR0cmlidXRlcyBtdXN0IGJlIGRlZmluZWQgYXMgYHN0YXRpY2AgcHJvcGVydGllcyBvbiB5b3VyIE1vZGVsXG4gKiBjbGFzcy5cbiAqXG4gKiBUaGUgYGF0dHIoKWAgbWV0aG9kIHRha2VzIHR3byBhcmd1bWVudHM6XG4gKlxuICogICAqIGB0eXBlYCAtIGEgc3RyaW5nIGluZGljYXRpbmcgdGhlIHR5cGUgb2YgdGhpcyBhdHRyaWJ1dGUuIERlbmFsaSBkb2Vzbid0XG4gKiAgIGNhcmUgd2hhdCB0aGlzIHN0cmluZyBpcy4gWW91ciBPUk0gYWRhcHRlciBzaG91bGQgc3BlY2lmeSB3aGF0IHR5cGVzIGl0XG4gKiAgIGV4cGVjdHMuXG4gKiAgICogYG9wdGlvbnNgIC0gYW55IGFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhpcyBhdHRyaWJ1dGUuIEF0IHRoZSBtb21lbnQsXG4gKiAgIHRoZXNlIGFyZSB1c2VkIHNvbGVseSBieSB5b3VyIE9STSBhZGFwdGVyLCB0aGVyZSBhcmUgbm8gYWRkaXRpb25hbCBvcHRpb25zXG4gKiAgIHRoYXQgRGVuYWxpIGV4cGVjdHMgaXRzZWxmLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlRGVzY3JpcHRvciBleHRlbmRzIERlc2NyaXB0b3Ige1xuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBmbGFnIGZvciBjaGVja2luZyBpZiB0aGlzIGlzIGFuIGF0dHJpYnV0ZVxuICAgKi9cbiAgaXNBdHRyaWJ1dGUgPSB0cnVlO1xuXG59XG5cbi8qKlxuICogU3ludGF4IHN1Z2FyIGZhY3RvcnkgbWV0aG9kIGZvciBjcmVhdGluZyBBdHRyaWJ1dGVzXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdHRyKHR5cGU6IHN0cmluZywgb3B0aW9ucz86IGFueSk6IEF0dHJpYnV0ZURlc2NyaXB0b3Ige1xuICByZXR1cm4gbmV3IEF0dHJpYnV0ZURlc2NyaXB0b3IodHlwZSwgb3B0aW9ucyk7XG59XG5cblxuLyoqXG4gKiBUaGUgSGFzTWFueVJlbGF0aW9uc2hpcCBjbGFzcyBpcyB1c2VkIHRvIGRlc2NyaWJlIGEgMSB0byBtYW55IG9yIG1hbnkgdG8gbWFueVxuICogcmVsYXRpb25zaGlwIG9uIHlvdXIgTW9kZWwuIFlvdSBzaG91bGRuJ3QgdXNlIHRoZSBIYXNNYW55UmVsYXRpb25zaGlwIGNsYXNzXG4gKiBkaXJlY3RseTsgaW5zdGVhZCwgaW1wb3J0IHRoZSBgaGFzTWFueSgpYCBtZXRob2QgZnJvbSBEZW5hbGksIGFuZCB1c2UgaXQgdG9cbiAqIGRlZmluZSBhIHJlbGF0aW9uc2hpcDpcbiAqXG4gKiAgICAgaW1wb3J0IHsgaGFzTWFueSB9IGZyb20gJ2RlbmFsaSc7XG4gKiAgICAgY2xhc3MgUG9zdCBleHRlbmRzIEFwcGxpY2F0aW9uTW9kZWwge1xuICogICAgICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICogICAgIH1cbiAqXG4gKiBOb3RlIHRoYXQgcmVsYXRpb25zaGlwcyBtdXN0IGJlIGRlZmluZWQgYXMgYHN0YXRpY2AgcHJvcGVydGllcyBvbiB5b3VyIE1vZGVsXG4gKiBjbGFzcy5cbiAqXG4gKiBUaGUgYGhhc01hbnkoKWAgbWV0aG9kIHRha2VzIHR3byBhcmd1bWVudHM6XG4gKlxuICogICAqIGB0eXBlYCAtIGEgc3RyaW5nIGluZGljYXRpbmcgdGhlIHR5cGUgb2YgbW9kZWwgZm9yIHRoaXMgcmVsYXRpb25zaGlwLlxuICogICAqIGBvcHRpb25zYCAtIGFueSBhZGRpdGlvbmFsIG9wdGlvbnMgZm9yIHRoaXMgYXR0cmlidXRlLiBBdCB0aGUgbW9tZW50LFxuICogICB0aGVzZSBhcmUgdXNlZCBzb2xlbHkgYnkgeW91ciBPUk0gYWRhcHRlciwgdGhlcmUgYXJlIG5vIGFkZGl0aW9uYWwgb3B0aW9uc1xuICogICB0aGF0IERlbmFsaSBleHBlY3RzIGl0c2VsZi5cbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGNsYXNzIEhhc01hbnlSZWxhdGlvbnNoaXBEZXNjcmlwdG9yIGV4dGVuZHMgRGVzY3JpcHRvciB7XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZsYWcgZm9yIGNoZWNraW5nIGlmIHRoaXMgaXMgYSByZWxhdGlvbnNoaXBcbiAgICovXG4gIGlzUmVsYXRpb25zaGlwID0gdHJ1ZTtcblxuICAvKipcbiAgICogUmVsYXRpb25zaGlwIG1vZGUsIGkuZS4gMSAtPiAxIG9yIDEgLT4gTlxuICAgKi9cbiAgbW9kZTogJ2hhc01hbnknIHwgJ2hhc09uZScgPSAnaGFzTWFueSc7XG5cbn1cblxuLyoqXG4gKiBTeW50YXggc3VnYXIgZmFjdG9yeSBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgSGFzTWFueVJlbGF0aW9uc2hpcHNcbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc01hbnkodHlwZTogc3RyaW5nLCBvcHRpb25zPzogYW55KTogSGFzTWFueVJlbGF0aW9uc2hpcERlc2NyaXB0b3Ige1xuICByZXR1cm4gbmV3IEhhc01hbnlSZWxhdGlvbnNoaXBEZXNjcmlwdG9yKHR5cGUsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFRoZSBIYXNPbmVSZWxhdGlvbnNoaXAgY2xhc3MgaXMgdXNlZCB0byBkZXNjcmliZSBhIDEgdG8gbWFueSBvciAxIHRvIDFcbiAqIHJlbGF0aW9uc2hpcCBvbiB5b3VyIE1vZGVsLiBZb3Ugc2hvdWxkbid0IHVzZSB0aGUgSGFzT25lUmVsYXRpb25zaGlwIGNsYXNzXG4gKiBkaXJlY3RseTsgaW5zdGVhZCwgaW1wb3J0IHRoZSBgaGFzT25lKClgIG1ldGhvZCBmcm9tIERlbmFsaSwgYW5kIHVzZSBpdCB0b1xuICogZGVmaW5lIGEgcmVsYXRpb25zaGlwOlxuICpcbiAqICAgICBpbXBvcnQgeyBoYXNPbmUgfSBmcm9tICdkZW5hbGknO1xuICogICAgIGNsYXNzIFBvc3QgZXh0ZW5kcyBBcHBsaWNhdGlvbk1vZGVsIHtcbiAqICAgICAgIHN0YXRpYyBhdXRob3IgPSBoYXNPbmUoJ3VzZXInKTtcbiAqICAgICB9XG4gKlxuICogTm90ZSB0aGF0IHJlbGF0aW9uc2hpcHMgbXVzdCBiZSBkZWZpbmVkIGFzIGBzdGF0aWNgIHByb3BlcnRpZXMgb24geW91ciBNb2RlbFxuICogY2xhc3MuXG4gKlxuICogVGhlIGBoYXNPbmUoKWAgbWV0aG9kIHRha2VzIHR3byBhcmd1bWVudHM6XG4gKlxuICogICAqIGB0eXBlYCAtIGEgc3RyaW5nIGluZGljYXRpbmcgdGhlIHR5cGUgb2YgbW9kZWwgZm9yIHRoaXMgcmVsYXRpb25zaGlwLlxuICogICAqIGBvcHRpb25zYCAtIGFueSBhZGRpdGlvbmFsIG9wdGlvbnMgZm9yIHRoaXMgYXR0cmlidXRlLiBBdCB0aGUgbW9tZW50LFxuICogICB0aGVzZSBhcmUgdXNlZCBzb2xlbHkgYnkgeW91ciBPUk0gYWRhcHRlciwgdGhlcmUgYXJlIG5vIGFkZGl0aW9uYWwgb3B0aW9uc1xuICogICB0aGF0IERlbmFsaSBleHBlY3RzIGl0c2VsZi5cbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGNsYXNzIEhhc09uZVJlbGF0aW9uc2hpcERlc2NyaXB0b3IgZXh0ZW5kcyBEZXNjcmlwdG9yIHtcblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZmxhZyBmb3IgY2hlY2tpbmcgaWYgdGhpcyBpcyBhIHJlbGF0aW9uc2hpcFxuICAgKi9cbiAgaXNSZWxhdGlvbnNoaXAgPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBSZWxhdGlvbnNoaXAgbW9kZSwgaS5lLiAxIC0+IDEgb3IgMSAtPiBOXG4gICAqL1xuICBtb2RlOiAnaGFzTWFueScgfCAnaGFzT25lJyA9ICdoYXNPbmUnO1xuXG59XG5cbi8qKlxuICogU3ludGF4IHN1Z2FyIGZhY3RvcnkgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIEhhc09uZVJlbGF0aW9uc2hpcHNcbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc09uZSh0eXBlOiBzdHJpbmcsIG9wdGlvbnM/OiBhbnkpOiBIYXNPbmVSZWxhdGlvbnNoaXBEZXNjcmlwdG9yIHtcbiAgcmV0dXJuIG5ldyBIYXNPbmVSZWxhdGlvbnNoaXBEZXNjcmlwdG9yKHR5cGUsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgdHlwZSBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yID0gSGFzTWFueVJlbGF0aW9uc2hpcERlc2NyaXB0b3IgfCBIYXNPbmVSZWxhdGlvbnNoaXBEZXNjcmlwdG9yO1xuIl19