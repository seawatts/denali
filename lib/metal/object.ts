import * as assert from 'assert';
import mixin, { MixinApplicator } from './mixin';
import Container from './container';
import { injectInstance } from './inject';

/**
 * The base object class for Denali classes. Adds mixin support.
 *
 * @package metal
 */
export default class DenaliObject {

  /**
   * Prevent people from introducing subtle and difficult to diagnose bugs by sharing container
   * state statically
   */
  protected static set container(value: any) {
    throw new Error('You tried to set a `container` property on a class directly - this is generally a bad idea, since static references to containers')
  }

  /**
   * Apply mixins using this class as the base class. Pure syntactic sugar for the `mixin` helper.
   */
  static mixin(...mixins: MixinApplicator<any, any>[]): any {
    return <any>mixin(this, ...mixins);
  }

  /**
   * The application container instance
   */
  protected container: Container;

  /**
   * Apply injections to this instance
   */
  constructor(container: Container) {
    assert(container instanceof Container, 'You must supply a container whenever you instantiate a DenaliObject');
    injectInstance(this, container);
  }

}
