/**
 * A utility method to walk up the prototype chain of the supplied object, calling the given
 * function with each prototype until it reaches the root of the prototype chain (where the
 * prototype is Object).
 *
 * This is useful for dealing with accumulating inheritance. For example, Action classes accumulate
 * their filters through inheritance, rather than replacing them. Since ES6/7 has no mechanism for
 * accumulating a value, we let each child class wipe out it's parent value, and rebuild the
 * accumulated value manually via this kind of prototype walking.
 *
 * @package metal
 */
export default function eachPrototype(obj: any, fn: (prototype: any) => void): void;
