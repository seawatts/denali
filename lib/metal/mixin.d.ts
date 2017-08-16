export interface MixinApplicator<T, U extends T> {
    (...args: any[]): MixinApplicator<T, U>;
    _args: any[];
    _factory: MixinFactory<T, U>;
}
export interface MixinFactory<T, U extends T> {
    (baseClass: T, ...args: any[]): U;
}
/**
 * ES6 classes don't provide any native syntax or support for compositional mixins. This helper
 * method provides that support:
 *
 *     import { mixin } from 'denali';
 *     import MyMixin from '../mixins/my-mixin';
 *     import ApplicationAction from './application';
 *
 *     export default class MyAction extends mixin(ApplicationAction, MyMixin) {
 *       // ...
 *     }
 *
 * Objects that extend from Denali's Object class automatically get a static `mixin` method to make
 * the syntax a bit more familiar:
 *
 *     export default class MyAction extends ApplicationAction.mixin(MyMixin) {
 *
 * ## How it works
 *
 * Since ES6 classes are based on prototype chains, and protoype chains are purely linear (you can't
 * have two prototypes), we implement mixins by creating anonymous intermediate subclasses for each
 * applied mixin.
 *
 * Mixins are defined as factory functions that take a base class and extend it with their own
 * mixin properties/methods. When these mixin factory functions are applied, they are called in
 * order, with the result of the last mixin feeding into the base class of the next mixin factory.
 *
 * @package metal
 */
export default function mixin(baseClass: Function, ...mixins: any[]): any;
/**
 * Creates a mixin factory function wrapper. These wrapper functions have the special property that
 * they can be invoked an arbitrary number of times, and each time will cache the arguments to be
 * handed off to the actual factory function.
 *
 * This is useful to allow per-use options for your mixin. For example:
 *
 *     class ProtectedAction extends Action.mixin(authenticate({ ... })) {
 *
 * In that example, the optons object provided to the `authenticate` mixin function will be cached,
 * and once the mixin factory function is invoked, it will be provided as an additional argument:
 *
 *     createMixin((BaseClass, options) => {
 *
 * @package metal
 */
export declare function createMixin<T, U extends T>(mixinFactory: MixinFactory<T, U>): MixinApplicator<T, U>;
