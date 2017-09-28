import {
  camelCase,
  upperFirst,
  uniq
} from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as tryRequire from 'try-require';
import { pluralize } from 'inflection';
import requireDir from '../utils/require-dir';
import * as assert from 'assert';
import * as createDebug from 'debug';

interface RetrieveMethod<T> {
  (type: string, entry: string): T;
}

export interface AvailableForTypeMethod {
  (type: string): { [modulePath: string]: any };
}

export type Registry = Map<string, any>;

export default class Resolver {

  [key: string]: any;

  /**
   * The root directory for this resolver to start from when searching for files
   */
  root: string;

  /**
   * The internal cache of available references
   */
  protected registry: Registry = new Map();

  constructor(root: string) {
    assert(root, 'You must supply a valid root path that the resolve should use to load from');
    this.debug = createDebug(`silly-denali:resolver:${ root }`);
    this.root = root;
  }

  /**
   * Manually add a member to this resolver. Manually registered members take precedence over any
   * retrieved from the filesystem.
   */
  register(specifier: string, value: any) {
    assert(specifier.includes(':'), 'Container specifiers must be in "type:entry" format');
    this.registry.set(specifier, value);
  }

  /**
   * Fetch the member matching the given parsedName. First checks for any manually registered
   * members, then falls back to type specific retrieve methods that typically find the matching
   * file on the filesystem.
   */
  retrieve<T>(specifier: string): T {
    assert(specifier.includes(':'), 'Container specifiers must be in "type:entry" format');
    this.debug(`retrieving ${ specifier }`);
    let [ type, entry ] = specifier.split(':');
    if (this.registry.has(specifier)) {
      this.debug(`cache hit, returning cached value`);
      return this.registry.get(specifier);
    }
    let retrieveMethod = <RetrieveMethod<T>>this[`retrieve${ upperFirst(camelCase(type)) }`];
    if (!retrieveMethod) {
      retrieveMethod = this.retrieveOther;
    }
    this.debug(`retrieving via retrieve${ upperFirst(camelCase(type)) }`);
    let result = retrieveMethod.call(this, type, entry);
    result = result && result.default || result;
    this.debug('retrieved %o', result);
    return result;
  }

  /**
   * Unknown types are assumed to exist underneath the `app/` folder
   */
  protected retrieveOther(type: string, entry: string) {
    this.debug(`attempting to retrieve ${ type }:${ entry } from ${ path.join(this.root, 'app', pluralize(type), entry) }`);
    return tryRequire(path.join(this.root, 'app', pluralize(type), entry));
  }

  /**
   * App files are found in `app/*`
   */
  protected retrieveApp(type: string, entry: string) {
    this.debug(`attempting to retrieve ${ type }:${ entry } from ${ path.join(this.root, 'app', entry) }`);
    return tryRequire(path.join(this.root, 'app', entry));
  }

  /**
   * Config files are found in `config/`
   */
  protected retrieveConfig(type: string, entry: string) {
    this.debug(`attempting to retrieve ${ type }:${ entry } from ${ path.join(this.root, 'config', entry) }`);
    return tryRequire(path.join(this.root, 'config', entry));
  }

  /**
   * Initializer files are found in `config/initializers/`
   */
  protected retrieveInitializer(type: string, entry: string) {
    this.debug(`attempting to retrieve ${ type }:${ entry } from ${ path.join(this.root, 'config', 'initializers', entry) }`);
    return tryRequire(path.join(this.root, 'config', 'initializers', entry));
  }

  /**
   * Retrieve all the entries for a given type. First checks for all manual registrations matching
   * that type, then retrieves all members for that type (typically from the filesystem).
   */
  availableForType(type: string) {
    let registeredForType: string[] = [];
    this.registry.forEach((entry, specifier) => {
      if (specifier.split(':')[0] === type) {
        registeredForType.push(specifier);
      }
    });
    let availableMethod = <AvailableForTypeMethod>this[`availableFor${ upperFirst(camelCase(type)) }`];
    if (!availableMethod) {
      availableMethod = this.availableForOther;
    }
    let entries = <string[]>availableMethod.call(this, type);
    let resolvedEntries = entries.map((entry) => `${ type }:${ entry }`);
    return uniq(registeredForType.sort().concat(resolvedEntries.sort()));
  }

  /**
   * Unknown types are assumed to exist in the `app/` folder
   */
  protected availableForOther(type: string) {
    let typeDir = path.join(this.root, 'app', pluralize(type));
    if (fs.existsSync(typeDir)) {
      return Object.keys(requireDir(typeDir));
    }
    return [];
  }

  /**
   * App files are found in `app/*`
   */
  protected availableForApp(type: string, entry: string) {
    let appDir = path.join(this.root, 'app');
    if (fs.existsSync(appDir)) {
      return Object.keys(requireDir(appDir, { recurse: false }));
    }
    return [];
  }

  /**
   * Config files are found in the `config/` folder. Initializers are _not_ included in this group
   */
  protected availableForConfig(type: string) {
    let configDir = path.join(this.root, 'config');
    if (fs.existsSync(configDir)) {
      return Object.keys(requireDir(configDir)).filter((entry) => {
        return entry.startsWith('initializers');
      });
    }
    return [];
  }

  /**
   * Initializers files are found in the `config/initializers/` folder
   */
  protected availableForInitializer(type: string) {
    let initializersDir = path.join(this.root, 'config', 'initializers');
    if (fs.existsSync(initializersDir)) {
      return Object.keys(requireDir(initializersDir));
    }
    return [];
  }

}
