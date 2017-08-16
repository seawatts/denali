"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const assert = require("assert");
const resolver_1 = require("./resolver");
const inject_1 = require("./inject");
const DEFAULT_OPTIONS = {
    instantiate: false,
    singleton: true
};
/**
 * Anytime the container first looks up a particular entry, if that entry defines a method under the
 * `onLoad` symbol, it will invoke that method with the looked up entry value.
 *
 * This is useful for simulating pseudo-design-time logic. For example, Model classes use this to
 * create getter and setter methods for attributes which forward to the underlying ORM instance. The
 * result is that we can programmatically customize the class prototype based on static
 * declarations, loosely analagous to Ruby's `included` hook.
 *
 * Warning: this is a very low-level API, and should be used sparingly! Since the onLoad hook is
 * invoked with the _static_ class, take care to avoid sharing any container-specific state on that
 * static class, lest you pollute across containers (since containers share the static class
 * reference)
 */
exports.onLoad = Symbol('container onLoad method');
/**
 * The container is the dependency injection solution for Denali. It is responsible for abstracting
 * away where a class came from. This allows several things:
 *
 *   * Apps can consume classes that originate from anywhere in the addon dependency tree, without
 *     needing to care/specify where.
 *   * We can more easily test parts of the framework by mocking out container entries instead of
 *     dealing with hardcoding dependencies
 *   * Support clean injection syntax, i.e. `mailer = service();`.
 *
 * In order to do these, the container must control creating instances of any classes it holds. This
 * allows us to ensure injections are applied to every instance. If you need to create your own
 * instance of a class, you can use the `factoryFor` method which allows you to create your own
 * instance with injections properly applied.
 *
 * However, this should be relatiely rare - most of the time you'll be dealing with objects that
 * are controlled by the framework.
 */
class Container {
    /**
     * Create a new container with a base (highest precedence) resolver at the given directory.
     */
    constructor(root) {
        /**
         * Manual registrations that should override resolver retrieved values
         */
        this.registry = {};
        /**
         * An array of resolvers used to retrieve container members. Resolvers are tried in order, first
         * to find the member wins. Normally, each addon will supply it's own resolver, allowing for
         * addon order and precedence when looking up container entries.
         */
        this.resolvers = [];
        /**
         * Internal cache of lookup values
         */
        this.lookups = {};
        /**
         * Internal cache of classes
         */
        this.classLookups = {};
        /**
         * Internal cache of factories
         */
        this.factoryLookups = {};
        /**
         * Options for container entries. Keyed on specifier or type. See ContainerOptions.
         */
        this.options = {
            app: { singleton: true, instantiate: true },
            action: { singleton: false, instantiate: true },
            config: { singleton: true, instantiate: false },
            initializer: { singleton: true, instantiate: false },
            'orm-adapter': { singleton: true, instantiate: true },
            model: { singleton: false, instantiate: false },
            parser: { singleton: true, instantiate: true },
            serializer: { singleton: true, instantiate: true },
            service: { singleton: true, instantiate: true },
            view: { singleton: true, instantiate: true }
        };
        /**
         * Internal metadata store. See `metaFor()`
         */
        this.meta = new Map();
        assert(root, 'You must supply a valid path as the root directory for the container to load from');
        this.resolvers.push(new resolver_1.default(root));
    }
    /**
     * Add a resolver to the container to use for lookups. New resolvers are added at lowest priority,
     * so all previously added resolvers will take precedence.
     */
    addResolver(resolver) {
        this.resolvers.push(resolver);
    }
    /**
     * Add a manual registration that will take precedence over any resolved lookups.
     */
    register(specifier, entry, options) {
        this.registry[specifier] = entry;
        if (options) {
            lodash_1.forOwn(options, (value, key) => {
                this.setOption(specifier, key, value);
            });
        }
    }
    /**
     * Return the factory for the given specifier. Typically only used when you need to control when
     * an object is instantiated.
     */
    factoryFor(specifier, options = {}) {
        let factory = this.factoryLookups[specifier];
        if (!factory) {
            let klass = this.classLookups[specifier];
            if (!klass) {
                klass = this.registry[specifier];
                if (!klass) {
                    lodash_1.forEach(this.resolvers, (resolver) => {
                        klass = resolver.retrieve(specifier);
                        if (klass) {
                            return false;
                        }
                    });
                }
                if (klass) {
                    this.classLookups[specifier] = klass;
                    this.onFirstLookup(specifier, klass);
                }
            }
            if (!klass) {
                if (options.loose) {
                    return;
                }
                throw new Error(`No class found for ${specifier}`);
            }
            factory = this.factoryLookups[specifier] = this.buildFactory(specifier, klass);
        }
        return factory;
    }
    /**
     * Run some logic anytime an entry is first looked up in the container. Here, we add some metadata
     * so the class can know what specifier it was looked up under, as well as running the special
     * onLoad hook, allowing classes to run some psuedo-design-time logic.
     */
    onFirstLookup(specifier, klass) {
        this.metaFor(klass).containerName = specifier.split(':')[1];
        if (klass[exports.onLoad]) {
            klass[exports.onLoad](klass);
        }
    }
    /**
     * Lookup the given specifier in the container. If options.loose is true, failed lookups will
     * return undefined rather than throw.
     */
    lookup(specifier, options = {}) {
        let singleton = this.getOption(specifier, 'singleton') !== false;
        if (singleton) {
            let lookup = this.lookups[specifier];
            if (lookup) {
                return lookup.instance;
            }
        }
        let factory = this.factoryFor(specifier, options);
        if (!factory) {
            return;
        }
        if (this.getOption(specifier, 'instantiate') === false) {
            let klass = factory.class;
            if (!singleton) {
                this.lookups[specifier] = klass;
                return klass;
            }
            let instance = klass;
            inject_1.injectInstance(instance, this);
            this.lookups[specifier] = { factory, instance };
            return klass;
        }
        let instance = factory.create();
        if (singleton && instance) {
            this.lookups[specifier] = { factory, instance };
        }
        return instance;
    }
    /**
     * Lookup all the entries for a given type in the container. This will ask all resolvers to
     * eagerly load all classes for this type. Returns an object whose keys are container specifiers
     * and values are the looked up values for those specifiers.
     */
    lookupAll(type) {
        let entries = this.availableForType(type);
        let values = entries.map((entry) => this.lookup(`${type}:${entry}`));
        return lodash_1.zipObject(entries, values);
    }
    /**
     * Returns an array of entry names for all entries under this type. Entries are eagerly looked up,
     * so resolvers will actively scan for all matching files, for example. Use sparingly.
     */
    availableForType(type) {
        let registrations = Object.keys(this.registry).filter((specifier) => {
            return specifier.startsWith(type);
        });
        let resolved = this.resolvers.reduce((entries, resolver) => {
            return entries.concat(resolver.availableForType(type));
        }, []);
        return lodash_1.uniq(registrations.concat(resolved)).map((specifier) => specifier.split(':')[1]);
    }
    /**
     * Return the value for the given option on the given specifier. Specifier may be a full specifier
     * or just a type.
     */
    getOption(specifier, optionName) {
        let [type] = specifier.split(':');
        let options = lodash_1.defaults(this.options[specifier], this.options[type], DEFAULT_OPTIONS);
        return options[optionName];
    }
    /**
     * Set the give option for the given specifier or type.
     */
    setOption(specifier, optionName, value) {
        if (!this.options[specifier]) {
            this.options[specifier] = { singleton: false, instantiate: false };
        }
        this.options[specifier][optionName] = value;
    }
    /**
     * Allow consumers to store metadata on the container. This is useful if you want to store data
     * tied to the lifetime of the container. For example, you may have an expensive calculation that
     * you can cache once per class. Rather than storing that cached value on `this.constructor`,
     * which is shared across containers, you can store it on `container.metaFor(this.constructor)`,
     * ensuring that your container doesn't pollute others.
     */
    metaFor(key) {
        if (!this.meta.has(key)) {
            this.meta.set(key, {});
        }
        return this.meta.get(key);
    }
    /**
     * Clear any cached lookups for this specifier. You probably don't want to use this. The only
     * significant use case is for testing to allow test containers to override an already looked up
     * value.
     */
    clearCache(specifier) {
        delete this.lookups[specifier];
        delete this.classLookups[specifier];
        delete this.factoryLookups[specifier];
    }
    /**
     * Given container-managed singletons a chance to cleanup on application shutdown
     */
    teardown() {
        lodash_1.forEach(this.lookups, (instance, specifier) => {
            if (typeof instance.teardown === 'function') {
                instance.teardown();
            }
        });
    }
    /**
     * Build the factory wrapper for a given container member
     */
    buildFactory(specifier, klass) {
        let container = this;
        return {
            class: klass,
            create(...args) {
                assert(typeof klass === 'function', `Unable to instantiate ${specifier} (it's not a constructor). Try setting the 'instantiate: false' option on this container entry to avoid instantiating it`);
                let instance = new klass();
                inject_1.injectInstance(instance, container);
                if (typeof instance.init === 'function') {
                    instance.init(...args);
                }
                return instance;
            }
        };
    }
}
exports.default = Container;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvbWV0YWwvY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBTWdCO0FBQ2hCLGlDQUFpQztBQUNqQyx5Q0FBa0M7QUFHbEMscUNBQTBDO0FBRTFDLE1BQU0sZUFBZSxHQUFHO0lBQ3RCLFdBQVcsRUFBRSxLQUFLO0lBQ2xCLFNBQVMsRUFBRSxJQUFJO0NBQ2hCLENBQUM7QUFFRjs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ1UsUUFBQSxNQUFNLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFxQ3hEOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNIO0lBa0RFOztPQUVHO0lBQ0gsWUFBWSxJQUFZO1FBbkR4Qjs7V0FFRztRQUNLLGFBQVEsR0FBMkIsRUFBRSxDQUFDO1FBRTlDOzs7O1dBSUc7UUFDSyxjQUFTLEdBQWUsRUFBRSxDQUFDO1FBRW5DOztXQUVHO1FBQ0ssWUFBTyxHQUFtRCxFQUFFLENBQUM7UUFFckU7O1dBRUc7UUFDSyxpQkFBWSxHQUEyQixFQUFFLENBQUM7UUFFbEQ7O1dBRUc7UUFDSyxtQkFBYyxHQUF1QixFQUFFLENBQUM7UUFFaEQ7O1dBRUc7UUFDSyxZQUFPLEdBQTJCO1lBQ3hDLEdBQUcsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTtZQUMzQyxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUU7WUFDL0MsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO1lBQy9DLFdBQVcsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRTtZQUNwRCxhQUFhLEVBQUUsRUFB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SUFDSyxZQUFZLENBQXlCLFNBQWlCLEVBQUUsS0FBcUI7UUFDbkYsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQztZQUNMLEtBQUssRUFBRSxLQUFLO1lBQ1osTUFBTSxDQUFDLEdBQUcsSUFBVztnQkFDbkIsTUFBTSxDQUFDLE9BQU8sS0FBSyxLQUFLLFVBQVUsRUFBRSx5QkFBMEIsU0FBVSwwSEFBMEgsQ0FBQyxDQUFDO2dCQUNwTSxJQUFJLFFBQVEsR0FBTSxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUM5Qix1QkFBYyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDcEMsRUFBRSxDQUFDLENBQUMsT0FBTyxRQUFRLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDekIsQ0FBQztnQkFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ2xCLENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBMVFELDRCQTBRQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGRlZmF1bHRzLFxuICBmb3JFYWNoLFxuICBmb3JPd24sXG4gIHVuaXEsXG4gIHppcE9iamVjdFxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgUmVzb2x2ZXIgZnJvbSAnLi9yZXNvbHZlcic7XG5pbXBvcnQgeyBEaWN0LCBDb25zdHJ1Y3RvciB9IGZyb20gJy4uL3V0aWxzL3R5cGVzJztcbmltcG9ydCBEZW5hbGlPYmplY3QgZnJvbSAnLi9vYmplY3QnO1xuaW1wb3J0IHsgaW5qZWN0SW5zdGFuY2UgfSBmcm9tICcuL2luamVjdCc7XG5cbmNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgaW5zdGFudGlhdGU6IGZhbHNlLFxuICBzaW5nbGV0b246IHRydWVcbn07XG5cbi8qKlxuICogQW55dGltZSB0aGUgY29udGFpbmVyIGZpcnN0IGxvb2tzIHVwIGEgcGFydGljdWxhciBlbnRyeSwgaWYgdGhhdCBlbnRyeSBkZWZpbmVzIGEgbWV0aG9kIHVuZGVyIHRoZVxuICogYG9uTG9hZGAgc3ltYm9sLCBpdCB3aWxsIGludm9rZSB0aGF0IG1ldGhvZCB3aXRoIHRoZSBsb29rZWQgdXAgZW50cnkgdmFsdWUuXG4gKlxuICogVGhpcyBpcyB1c2VmdWwgZm9yIHNpbXVsYXRpbmcgcHNldWRvLWRlc2lnbi10aW1lIGxvZ2ljLiBGb3IgZXhhbXBsZSwgTW9kZWwgY2xhc3NlcyB1c2UgdGhpcyB0b1xuICogY3JlYXRlIGdldHRlciBhbmQgc2V0dGVyIG1ldGhvZHMgZm9yIGF0dHJpYnV0ZXMgd2hpY2ggZm9yd2FyZCB0byB0aGUgdW5kZXJseWluZyBPUk0gaW5zdGFuY2UuIFRoZVxuICogcmVzdWx0IGlzIHRoYXQgd2UgY2FuIHByb2dyYW1tYXRpY2FsbHkgY3VzdG9taXplIHRoZSBjbGFzcyBwcm90b3R5cGUgYmFzZWQgb24gc3RhdGljXG4gKiBkZWNsYXJhdGlvbnMsIGxvb3NlbHkgYW5hbGFnb3VzIHRvIFJ1YnkncyBgaW5jbHVkZWRgIGhvb2suXG4gKlxuICogV2FybmluZzogdGhpcyBpcyBhIHZlcnkgbG93LWxldmVsIEFQSSwgYW5kIHNob3VsZCBiZSB1c2VkIHNwYXJpbmdseSEgU2luY2UgdGhlIG9uTG9hZCBob29rIGlzXG4gKiBpbnZva2VkIHdpdGggdGhlIF9zdGF0aWNfIGNsYXNzLCB0YWtlIGNhcmUgdG8gYXZvaWQgc2hhcmluZyBhbnkgY29udGFpbmVyLXNwZWNpZmljIHN0YXRlIG9uIHRoYXRcbiAqIHN0YXRpYyBjbGFzcywgbGVzdCB5b3UgcG9sbHV0ZSBhY3Jvc3MgY29udGFpbmVycyAoc2luY2UgY29udGFpbmVycyBzaGFyZSB0aGUgc3RhdGljIGNsYXNzXG4gKiByZWZlcmVuY2UpXG4gKi9cbmV4cG9ydCBjb25zdCBvbkxvYWQgPSBTeW1ib2woJ2NvbnRhaW5lciBvbkxvYWQgbWV0aG9kJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGFpbmVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgY29udGFpbmVyIHNob3VsZCB0cmVhdCB0aGUgbWVtYmVyIGFzIGEgc2luZ2xldG9uLiBJZiBwYWlyZWQgd2l0aCBgaW5zdGFudGlhdGVgLCB0aGVcbiAgICogY29udGFpbmVyIHdpbGwgY3JlYXRlIHRoYXQgc2luZ2xldG9uIG9uIHRoZSBmaXJzdCBsb29rdXAuIElmIG5vdCwgdGhlbiB0aGUgY29udGFpbmVyIHdpbGxcbiAgICogYXNzdW1lIHRvIG1lbWJlciBpcyBhbHJlYWR5IGEgc2luZ2xldG9uXG4gICAqL1xuICBzaW5nbGV0b24/OiBib29sZWFuO1xuICAvKipcbiAgICogVGhlIGNvbnRhaW5lciBzaG91bGQgY3JlYXRlIGFuIGluc3RhbmNlIG9uIGxvb2t1cC4gSWYgYHNpbmdsZXRvbmAgaXMgYWxzbyB0cnVlLCBvbmx5IG9uZVxuICAgKiBpbnN0YW5jZSB3aWxsIGJlIGNyZWF0ZWRcbiAgICovXG4gIGluc3RhbnRpYXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIEZhY3RvcnkgaXMgYSB3cmFwcGVyIG9iamVjdCBhcm91bmQgYSBjb250YWluZXJlZCBjbGFzcy4gSXQgaW5jbHVkZXMgdGhlIG9yaWdpbmFsIGNsYXNzLCBwbHVzIGFcbiAqIGBjcmVhdGUoKWAgbWV0aG9kIHRoYXQgaXMgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGEgbmV3IGluc3RhbmNlIGFuZCBhcHBseWluZyBhbnkgYXBwcm9wcmlhdGVcbiAqIGluamVjdGlvbnMuXG4gKlxuICogVGhlIEZhY3Rvcnkgb2JqZWN0IGlzIHVzZWQgdG8gaXNvbGF0ZSB0aGlzIGluamVjdGlvbiBsb2dpYyB0byBhIHNpbmdsZSBzcG90LiBUaGUgY29udGFpbmVyIHVzZXNcbiAqIHRoaXMgRmFjdG9yeSBvYmplY3QgaW50ZXJuYWxseSB3aGVuIGluc3RhbnRpYXRpbmcgZHVyaW5nIGEgYGxvb2t1cGAgY2FsbC4gVXNlcnMgY2FuIGFsc28gZmV0Y2hcbiAqIHRoaXMgRmFjdG9yeSB2aWEgYGZhY3RvcnlGb3IoKWAgaWYgdGhleSB3YW50IHRvIGNvbnRyb2wgaW5zdGFudGlhdGlvbi4gQSBnb29kIGV4YW1wbGUgaGVyZSBpc1xuICogTW9kZWxzLiBXZSBjb3VsZCBhbGxvdyB0aGUgY29udGFpbmVyIHRvIGluc3RhbnRpYXRlIG1vZGVscyBieSBzZXR0aW5nIGBpbnN0YW50aWF0ZTogdHJ1ZWAsIGJ1dFxuICogdGhhdCBpcyBpbmNvbnZlbmllbnQgLSBNb2RlbHMgdHlwaWNhbGx5IHRha2UgY29uc3RydWN0b3IgYXJndW1lbnRzIChjb250YWluZXIgaW5zdGFudGlhdGlvblxuICogZG9lc24ndCBzdXBwb3J0IHRoYXQpLCBhbmQgd2UgZnJlcXVlbnRseSB3YW50IHRvIGZldGNoIHRoZSBNb2RlbCBjbGFzcyBpdHNlbGYsIHdoaWNoIGlzXG4gKiBjdW1iZXJzb21lIHdpdGggYGluc3RhbnRpYXRlOiB0cnVlYC5cbiAqXG4gKiBJbnN0ZWFkLCB1c2VycyBjYW4gc2ltcGx5IHVzZSBgZmFjdG9yeUZvcmAgdG8gZmV0Y2ggdGhpcyBGYWN0b3J5IHdyYXBwZXIuIFRoZW4gdGhleSBjYW5cbiAqIGluc3RhbnRpYXRlIHRoZSBvYmplY3QgaG93ZXZlciB0aGV5IGxpa2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFjdG9yeTxUPiB7XG4gIGNsYXNzOiBDb25zdHJ1Y3RvcjxUPjtcbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogVDtcbn1cblxuLyoqXG4gKiBUaGUgY29udGFpbmVyIGlzIHRoZSBkZXBlbmRlbmN5IGluamVjdGlvbiBzb2x1dGlvbiBmb3IgRGVuYWxpLiBJdCBpcyByZXNwb25zaWJsZSBmb3IgYWJzdHJhY3RpbmdcbiAqIGF3YXkgd2hlcmUgYSBjbGFzcyBjYW1lIGZyb20uIFRoaXMgYWxsb3dzIHNldmVyYWwgdGhpbmdzOlxuICpcbiAqICAgKiBBcHBzIGNhbiBjb25zdW1lIGNsYXNzZXMgdGhhdCBvcmlnaW5hdGUgZnJvbSBhbnl3aGVyZSBpbiB0aGUgYWRkb24gZGVwZW5kZW5jeSB0cmVlLCB3aXRob3V0XG4gKiAgICAgbmVlZGluZyB0byBjYXJlL3NwZWNpZnkgd2hlcmUuXG4gKiAgICogV2UgY2FuIG1vcmUgZWFzaWx5IHRlc3QgcGFydHMgb2YgdGhlIGZyYW1ld29yayBieSBtb2NraW5nIG91dCBjb250YWluZXIgZW50cmllcyBpbnN0ZWFkIG9mXG4gKiAgICAgZGVhbGluZyB3aXRoIGhhcmRjb2RpbmcgZGVwZW5kZW5jaWVzXG4gKiAgICogU3VwcG9ydCBjbGVhbiBpbmplY3Rpb24gc3ludGF4LCBpLmUuIGBtYWlsZXIgPSBzZXJ2aWNlKCk7YC5cbiAqXG4gKiBJbiBvcmRlciB0byBkbyB0aGVzZSwgdGhlIGNvbnRhaW5lciBtdXN0IGNvbnRyb2wgY3JlYXRpbmcgaW5zdGFuY2VzIG9mIGFueSBjbGFzc2VzIGl0IGhvbGRzLiBUaGlzXG4gKiBhbGxvd3MgdXMgdG8gZW5zdXJlIGluamVjdGlvbnMgYXJlIGFwcGxpZWQgdG8gZXZlcnkgaW5zdGFuY2UuIElmIHlvdSBuZWVkIHRvIGNyZWF0ZSB5b3VyIG93blxuICogaW5zdGFuY2Ugb2YgYSBjbGFzcywgeW91IGNhbiB1c2UgdGhlIGBmYWN0b3J5Rm9yYCBtZXRob2Qgd2hpY2ggYWxsb3dzIHlvdSB0byBjcmVhdGUgeW91ciBvd25cbiAqIGluc3RhbmNlIHdpdGggaW5qZWN0aW9ucyBwcm9wZXJseSBhcHBsaWVkLlxuICpcbiAqIEhvd2V2ZXIsIHRoaXMgc2hvdWxkIGJlIHJlbGF0aWVseSByYXJlIC0gbW9zdCBvZiB0aGUgdGltZSB5b3UnbGwgYmUgZGVhbGluZyB3aXRoIG9iamVjdHMgdGhhdFxuICogYXJlIGNvbnRyb2xsZWQgYnkgdGhlIGZyYW1ld29yay5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIHtcblxuICAvKipcbiAgICogTWFudWFsIHJlZ2lzdHJhdGlvbnMgdGhhdCBzaG91bGQgb3ZlcnJpZGUgcmVzb2x2ZXIgcmV0cmlldmVkIHZhbHVlc1xuICAgKi9cbiAgcHJpdmF0ZSByZWdpc3RyeTogRGljdDxDb25zdHJ1Y3Rvcjxhbnk+PiA9IHt9O1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiByZXNvbHZlcnMgdXNlZCB0byByZXRyaWV2ZSBjb250YWluZXIgbWVtYmVycy4gUmVzb2x2ZXJzIGFyZSB0cmllZCBpbiBvcmRlciwgZmlyc3RcbiAgICogdG8gZmluZCB0aGUgbWVtYmVyIHdpbnMuIE5vcm1hbGx5LCBlYWNoIGFkZG9uIHdpbGwgc3VwcGx5IGl0J3Mgb3duIHJlc29sdmVyLCBhbGxvd2luZyBmb3JcbiAgICogYWRkb24gb3JkZXIgYW5kIHByZWNlZGVuY2Ugd2hlbiBsb29raW5nIHVwIGNvbnRhaW5lciBlbnRyaWVzLlxuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlcnM6IFJlc29sdmVyW10gPSBbXTtcblxuICAvKipcbiAgICogSW50ZXJuYWwgY2FjaGUgb2YgbG9va3VwIHZhbHVlc1xuICAgKi9cbiAgcHJpdmF0ZSBsb29rdXBzOiBEaWN0PHsgZmFjdG9yeTogRmFjdG9yeTxhbnk+LCBpbnN0YW5jZTogYW55IH0+ID0ge307XG5cbiAgLyoqXG4gICAqIEludGVybmFsIGNhY2hlIG9mIGNsYXNzZXNcbiAgICovXG4gIHByaXZhdGUgY2xhc3NMb29rdXBzOiBEaWN0PENvbnN0cnVjdG9yPGFueT4+ID0ge307XG5cbiAgLyoqXG4gICAqIEludGVybmFsIGNhY2hlIG9mIGZhY3Rvcmllc1xuICAgKi9cbiAgcHJpdmF0ZSBmYWN0b3J5TG9va3VwczogRGljdDxGYWN0b3J5PGFueT4+ID0ge307XG5cbiAgLyoqXG4gICAqIE9wdGlvbnMgZm9yIGNvbnRhaW5lciBlbnRyaWVzLiBLZXllZCBvbiBzcGVjaWZpZXIgb3IgdHlwZS4gU2VlIENvbnRhaW5lck9wdGlvbnMuXG4gICAqL1xuICBwcml2YXRlIG9wdGlvbnM6IERpY3Q8Q29udGFpbmVyT3B0aW9ucz4gPSB7XG4gICAgYXBwOiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IHRydWUgfSxcbiAgICBhY3Rpb246IHsgc2luZ2xldG9uOiBmYWxzZSwgaW5zdGFudGlhdGU6IHRydWUgfSxcbiAgICBjb25maWc6IHsgc2luZ2xldG9uOiB0cnVlLCBpbnN0YW50aWF0ZTogZmFsc2UgfSxcbiAgICBpbml0aWFsaXplcjogeyBzaW5nbGV0b246IHRydWUsIGluc3RhbnRpYXRlOiBmYWxzZSB9LFxuICAgICdvcm0tYWRhcHRlcic6IHsgc2luZ2xldG9uOiB0cnVlLCBpbnN0YW50aWF0ZTogdHJ1ZSB9LFxuICAgIG1vZGVsOiB7IHNpbmdsZXRvbjogZmFsc2UsIGluc3RhbnRpYXRlOiBmYWxzZSB9LFxuICAgIHBhcnNlcjogeyBzaW5nbGV0b246IHRydWUsIGluc3RhbnRpYXRlOiB0cnVlIH0sXG4gICAgc2VyaWFsaXplcjogeyBzaW5nbGV0b246IHRydWUsIGluc3RhbnRpYXRlOiB0cnVlIH0sXG4gICAgc2VydmljZTogeyBzaW5nbGV0b246IHRydWUsIGluc3RhbnRpYXRlOiB0cnVlIH0sXG4gICAgdmlldzogeyBzaW5nbGV0b246IHRydWUsIGluc3RhbnRpYXRlOiB0cnVlIH1cbiAgfTtcblxuICAvKipcbiAgICogSW50ZXJuYWwgbWV0YWRhdGEgc3RvcmUuIFNlZSBgbWV0YUZvcigpYFxuICAgKi9cbiAgcHJpdmF0ZSBtZXRhOiBNYXA8YW55LCBEaWN0PGFueT4+ID0gbmV3IE1hcCgpO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgY29udGFpbmVyIHdpdGggYSBiYXNlIChoaWdoZXN0IHByZWNlZGVuY2UpIHJlc29sdmVyIGF0IHRoZSBnaXZlbiBkaXJlY3RvcnkuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihyb290OiBzdHJpbmcpIHtcbiAgICBhc3NlcnQocm9vdCwgJ1lvdSBtdXN0IHN1cHBseSBhIHZhbGlkIHBhdGggYXMgdGhlIHJvb3QgZGlyZWN0b3J5IGZvciB0aGUgY29udGFpbmVyIHRvIGxvYWQgZnJvbScpO1xuICAgIHRoaXMucmVzb2x2ZXJzLnB1c2gobmV3IFJlc29sdmVyKHJvb3QpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSByZXNvbHZlciB0byB0aGUgY29udGFpbmVyIHRvIHVzZSBmb3IgbG9va3Vwcy4gTmV3IHJlc29sdmVycyBhcmUgYWRkZWQgYXQgbG93ZXN0IHByaW9yaXR5LFxuICAgKiBzbyBhbGwgcHJldmlvdXNseSBhZGRlZCByZXNvbHZlcnMgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gICAqL1xuICBhZGRSZXNvbHZlcihyZXNvbHZlcjogUmVzb2x2ZXIpIHtcbiAgICB0aGlzLnJlc29sdmVycy5wdXNoKHJlc29sdmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBtYW51YWwgcmVnaXN0cmF0aW9uIHRoYXQgd2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciBhbnkgcmVzb2x2ZWQgbG9va3Vwcy5cbiAgICovXG4gIHJlZ2lzdGVyKHNwZWNpZmllcjogc3RyaW5nLCBlbnRyeTogYW55LCBvcHRpb25zPzogQ29udGFpbmVyT3B0aW9ucykge1xuICAgIHRoaXMucmVnaXN0cnlbc3BlY2lmaWVyXSA9IGVudHJ5O1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBmb3JPd24ob3B0aW9ucywgKHZhbHVlLCBrZXk6IGtleW9mIENvbnRhaW5lck9wdGlvbnMpID0+IHtcbiAgICAgICAgdGhpcy5zZXRPcHRpb24oc3BlY2lmaWVyLCBrZXksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGZhY3RvcnkgZm9yIHRoZSBnaXZlbiBzcGVjaWZpZXIuIFR5cGljYWxseSBvbmx5IHVzZWQgd2hlbiB5b3UgbmVlZCB0byBjb250cm9sIHdoZW5cbiAgICogYW4gb2JqZWN0IGlzIGluc3RhbnRpYXRlZC5cbiAgICovXG4gIGZhY3RvcnlGb3I8VCA9IGFueT4oc3BlY2lmaWVyOiBzdHJpbmcsIG9wdGlvbnM6IHsgbG9vc2U/OiBib29sZWFuIH0gPSB7fSk6IEZhY3Rvcnk8VD4ge1xuICAgIGxldCBmYWN0b3J5ID0gdGhpcy5mYWN0b3J5TG9va3Vwc1tzcGVjaWZpZXJdO1xuICAgIGlmICghZmFjdG9yeSkge1xuICAgICAgbGV0IGtsYXNzID0gdGhpcy5jbGFzc0xvb2t1cHNbc3BlY2lmaWVyXTtcblxuICAgICAgaWYgKCFrbGFzcykge1xuICAgICAgICBrbGFzcyA9IHRoaXMucmVnaXN0cnlbc3BlY2lmaWVyXTtcblxuICAgICAgICBpZiAoIWtsYXNzKSB7XG4gICAgICAgICAgZm9yRWFjaCh0aGlzLnJlc29sdmVycywgKHJlc29sdmVyKSA9PiB7XG4gICAgICAgICAgICBrbGFzcyA9IHJlc29sdmVyLnJldHJpZXZlKHNwZWNpZmllcik7XG4gICAgICAgICAgICBpZiAoa2xhc3MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtsYXNzKSB7XG4gICAgICAgICAgdGhpcy5jbGFzc0xvb2t1cHNbc3BlY2lmaWVyXSA9IGtsYXNzO1xuICAgICAgICAgIHRoaXMub25GaXJzdExvb2t1cChzcGVjaWZpZXIsIGtsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWtsYXNzKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmxvb3NlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gY2xhc3MgZm91bmQgZm9yICR7IHNwZWNpZmllciB9YCk7XG4gICAgICB9XG5cbiAgICAgIGZhY3RvcnkgPSB0aGlzLmZhY3RvcnlMb29rdXBzW3NwZWNpZmllcl0gPSB0aGlzLmJ1aWxkRmFjdG9yeShzcGVjaWZpZXIsIGtsYXNzKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhY3Rvcnk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHNvbWUgbG9naWMgYW55dGltZSBhbiBlbnRyeSBpcyBmaXJzdCBsb29rZWQgdXAgaW4gdGhlIGNvbnRhaW5lci4gSGVyZSwgd2UgYWRkIHNvbWUgbWV0YWRhdGFcbiAgICogc28gdGhlIGNsYXNzIGNhbiBrbm93IHdoYXQgc3BlY2lmaWVyIGl0IHdhcyBsb29rZWQgdXAgdW5kZXIsIGFzIHdlbGwgYXMgcnVubmluZyB0aGUgc3BlY2lhbFxuICAgKiBvbkxvYWQgaG9vaywgYWxsb3dpbmcgY2xhc3NlcyB0byBydW4gc29tZSBwc3VlZG8tZGVzaWduLXRpbWUgbG9naWMuXG4gICAqL1xuICBvbkZpcnN0TG9va3VwKHNwZWNpZmllcjogc3RyaW5nLCBrbGFzczogYW55KSB7XG4gICAgdGhpcy5tZXRhRm9yKGtsYXNzKS5jb250YWluZXJOYW1lID0gc3BlY2lmaWVyLnNwbGl0KCc6JylbMV07XG4gICAgaWYgKGtsYXNzW29uTG9hZF0pIHtcbiAgICAgIGtsYXNzW29uTG9hZF0oa2xhc3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgdGhlIGdpdmVuIHNwZWNpZmllciBpbiB0aGUgY29udGFpbmVyLiBJZiBvcHRpb25zLmxvb3NlIGlzIHRydWUsIGZhaWxlZCBsb29rdXBzIHdpbGxcbiAgICogcmV0dXJuIHVuZGVmaW5lZCByYXRoZXIgdGhhbiB0aHJvdy5cbiAgICovXG4gIGxvb2t1cDxUID0gYW55PihzcGVjaWZpZXI6IHN0cmluZywgb3B0aW9uczogeyBsb29zZT86IGJvb2xlYW4gfSA9IHt9KTogVCB7XG4gICAgbGV0IHNpbmdsZXRvbiA9IHRoaXMuZ2V0T3B0aW9uKHNwZWNpZmllciwgJ3NpbmdsZXRvbicpICE9PSBmYWxzZTtcblxuICAgIGlmIChzaW5nbGV0b24pIHtcbiAgICAgIGxldCBsb29rdXAgPSB0aGlzLmxvb2t1cHNbc3BlY2lmaWVyXTtcbiAgICAgIGlmIChsb29rdXApIHtcbiAgICAgICAgcmV0dXJuIGxvb2t1cC5pbnN0YW5jZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZmFjdG9yeSA9IHRoaXMuZmFjdG9yeUZvcjxUPihzcGVjaWZpZXIsIG9wdGlvbnMpO1xuICAgIGlmICghZmFjdG9yeSkgeyByZXR1cm47IH1cblxuICAgIGlmICh0aGlzLmdldE9wdGlvbihzcGVjaWZpZXIsICdpbnN0YW50aWF0ZScpID09PSBmYWxzZSkge1xuICAgICAgbGV0IGtsYXNzID0gKDxhbnk+ZmFjdG9yeSkuY2xhc3M7XG4gICAgICBpZiAoIXNpbmdsZXRvbikge1xuICAgICAgICB0aGlzLmxvb2t1cHNbc3BlY2lmaWVyXSA9IGtsYXNzO1xuICAgICAgICByZXR1cm4ga2xhc3M7XG4gICAgICB9XG4gICAgICBsZXQgaW5zdGFuY2UgPSBrbGFzcztcbiAgICAgIGluamVjdEluc3RhbmNlKGluc3RhbmNlLCB0aGlzKTtcbiAgICAgIHRoaXMubG9va3Vwc1tzcGVjaWZpZXJdID0geyBmYWN0b3J5LCBpbnN0YW5jZSB9O1xuICAgICAgcmV0dXJuIGtsYXNzO1xuICAgIH1cblxuICAgIGxldCBpbnN0YW5jZSA9IGZhY3RvcnkuY3JlYXRlKCk7XG5cbiAgICBpZiAoc2luZ2xldG9uICYmIGluc3RhbmNlKSB7XG4gICAgICB0aGlzLmxvb2t1cHNbc3BlY2lmaWVyXSA9IHsgZmFjdG9yeSwgaW5zdGFuY2UgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogTG9va3VwIGFsbCB0aGUgZW50cmllcyBmb3IgYSBnaXZlbiB0eXBlIGluIHRoZSBjb250YWluZXIuIFRoaXMgd2lsbCBhc2sgYWxsIHJlc29sdmVycyB0b1xuICAgKiBlYWdlcmx5IGxvYWQgYWxsIGNsYXNzZXMgZm9yIHRoaXMgdHlwZS4gUmV0dXJucyBhbiBvYmplY3Qgd2hvc2Uga2V5cyBhcmUgY29udGFpbmVyIHNwZWNpZmllcnNcbiAgICogYW5kIHZhbHVlcyBhcmUgdGhlIGxvb2tlZCB1cCB2YWx1ZXMgZm9yIHRob3NlIHNwZWNpZmllcnMuXG4gICAqL1xuICBsb29rdXBBbGw8VCA9IGFueT4odHlwZTogc3RyaW5nKTogRGljdDxUPiB7XG4gICAgbGV0IGVudHJpZXMgPSB0aGlzLmF2YWlsYWJsZUZvclR5cGUodHlwZSk7XG4gICAgbGV0IHZhbHVlcyA9IGVudHJpZXMubWFwKChlbnRyeSkgPT4gdGhpcy5sb29rdXAoYCR7IHR5cGUgfTokeyBlbnRyeSB9YCkpO1xuICAgIHJldHVybiA8RGljdDxUPj56aXBPYmplY3QoZW50cmllcywgdmFsdWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGVudHJ5IG5hbWVzIGZvciBhbGwgZW50cmllcyB1bmRlciB0aGlzIHR5cGUuIEVudHJpZXMgYXJlIGVhZ2VybHkgbG9va2VkIHVwLFxuICAgKiBzbyByZXNvbHZlcnMgd2lsbCBhY3RpdmVseSBzY2FuIGZvciBhbGwgbWF0Y2hpbmcgZmlsZXMsIGZvciBleGFtcGxlLiBVc2Ugc3BhcmluZ2x5LlxuICAgKi9cbiAgYXZhaWxhYmxlRm9yVHlwZSh0eXBlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgbGV0IHJlZ2lzdHJhdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLnJlZ2lzdHJ5KS5maWx0ZXIoKHNwZWNpZmllcikgPT4ge1xuICAgICAgcmV0dXJuIHNwZWNpZmllci5zdGFydHNXaXRoKHR5cGUpO1xuICAgIH0pO1xuICAgIGxldCByZXNvbHZlZCA9IHRoaXMucmVzb2x2ZXJzLnJlZHVjZSgoZW50cmllcywgcmVzb2x2ZXIpID0+IHtcbiAgICAgIHJldHVybiBlbnRyaWVzLmNvbmNhdChyZXNvbHZlci5hdmFpbGFibGVGb3JUeXBlKHR5cGUpKTtcbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuIHVuaXEocmVnaXN0cmF0aW9ucy5jb25jYXQocmVzb2x2ZWQpKS5tYXAoKHNwZWNpZmllcikgPT4gc3BlY2lmaWVyLnNwbGl0KCc6JylbMV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgdmFsdWUgZm9yIHRoZSBnaXZlbiBvcHRpb24gb24gdGhlIGdpdmVuIHNwZWNpZmllci4gU3BlY2lmaWVyIG1heSBiZSBhIGZ1bGwgc3BlY2lmaWVyXG4gICAqIG9yIGp1c3QgYSB0eXBlLlxuICAgKi9cbiAgZ2V0T3B0aW9uKHNwZWNpZmllcjogc3RyaW5nLCBvcHRpb25OYW1lOiBrZXlvZiBDb250YWluZXJPcHRpb25zKTogYW55IHtcbiAgICBsZXQgWyB0eXBlIF0gPSBzcGVjaWZpZXIuc3BsaXQoJzonKTtcbiAgICBsZXQgb3B0aW9ucyA9IGRlZmF1bHRzKHRoaXMub3B0aW9uc1tzcGVjaWZpZXJdLCB0aGlzLm9wdGlvbnNbdHlwZV0sIERFRkFVTFRfT1BUSU9OUyk7XG4gICAgcmV0dXJuIG9wdGlvbnNbb3B0aW9uTmFtZV07XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBnaXZlIG9wdGlvbiBmb3IgdGhlIGdpdmVuIHNwZWNpZmllciBvciB0eXBlLlxuICAgKi9cbiAgc2V0T3B0aW9uKHNwZWNpZmllcjogc3RyaW5nLCBvcHRpb25OYW1lOiBrZXlvZiBDb250YWluZXJPcHRpb25zLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnNbc3BlY2lmaWVyXSkge1xuICAgICAgdGhpcy5vcHRpb25zW3NwZWNpZmllcl0gPSB7IHNpbmdsZXRvbjogZmFsc2UsIGluc3RhbnRpYXRlOiBmYWxzZSB9O1xuICAgIH1cbiAgICB0aGlzLm9wdGlvbnNbc3BlY2lmaWVyXVtvcHRpb25OYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93IGNvbnN1bWVycyB0byBzdG9yZSBtZXRhZGF0YSBvbiB0aGUgY29udGFpbmVyLiBUaGlzIGlzIHVzZWZ1bCBpZiB5b3Ugd2FudCB0byBzdG9yZSBkYXRhXG4gICAqIHRpZWQgdG8gdGhlIGxpZmV0aW1lIG9mIHRoZSBjb250YWluZXIuIEZvciBleGFtcGxlLCB5b3UgbWF5IGhhdmUgYW4gZXhwZW5zaXZlIGNhbGN1bGF0aW9uIHRoYXRcbiAgICogeW91IGNhbiBjYWNoZSBvbmNlIHBlciBjbGFzcy4gUmF0aGVyIHRoYW4gc3RvcmluZyB0aGF0IGNhY2hlZCB2YWx1ZSBvbiBgdGhpcy5jb25zdHJ1Y3RvcmAsXG4gICAqIHdoaWNoIGlzIHNoYXJlZCBhY3Jvc3MgY29udGFpbmVycywgeW91IGNhbiBzdG9yZSBpdCBvbiBgY29udGFpbmVyLm1ldGFGb3IodGhpcy5jb25zdHJ1Y3RvcilgLFxuICAgKiBlbnN1cmluZyB0aGF0IHlvdXIgY29udGFpbmVyIGRvZXNuJ3QgcG9sbHV0ZSBvdGhlcnMuXG4gICAqL1xuICBtZXRhRm9yKGtleTogYW55KSB7XG4gICAgaWYgKCF0aGlzLm1ldGEuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMubWV0YS5zZXQoa2V5LCB7fSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1ldGEuZ2V0KGtleSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgYW55IGNhY2hlZCBsb29rdXBzIGZvciB0aGlzIHNwZWNpZmllci4gWW91IHByb2JhYmx5IGRvbid0IHdhbnQgdG8gdXNlIHRoaXMuIFRoZSBvbmx5XG4gICAqIHNpZ25pZmljYW50IHVzZSBjYXNlIGlzIGZvciB0ZXN0aW5nIHRvIGFsbG93IHRlc3QgY29udGFpbmVycyB0byBvdmVycmlkZSBhbiBhbHJlYWR5IGxvb2tlZCB1cFxuICAgKiB2YWx1ZS5cbiAgICovXG4gIGNsZWFyQ2FjaGUoc3BlY2lmaWVyOiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5sb29rdXBzW3NwZWNpZmllcl07XG4gICAgZGVsZXRlIHRoaXMuY2xhc3NMb29rdXBzW3NwZWNpZmllcl07XG4gICAgZGVsZXRlIHRoaXMuZmFjdG9yeUxvb2t1cHNbc3BlY2lmaWVyXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBjb250YWluZXItbWFuYWdlZCBzaW5nbGV0b25zIGEgY2hhbmNlIHRvIGNsZWFudXAgb24gYXBwbGljYXRpb24gc2h1dGRvd25cbiAgICovXG4gIHRlYXJkb3duKCkge1xuICAgIGZvckVhY2godGhpcy5sb29rdXBzLCAoaW5zdGFuY2U6IERlbmFsaU9iamVjdCwgc3BlY2lmaWVyKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGluc3RhbmNlLnRlYXJkb3duID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGluc3RhbmNlLnRlYXJkb3duKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIGZhY3Rvcnkgd3JhcHBlciBmb3IgYSBnaXZlbiBjb250YWluZXIgbWVtYmVyXG4gICAqL1xuICBwcml2YXRlIGJ1aWxkRmFjdG9yeTxUIGV4dGVuZHMgRGVuYWxpT2JqZWN0PihzcGVjaWZpZXI6IHN0cmluZywga2xhc3M6IENvbnN0cnVjdG9yPFQ+KTogRmFjdG9yeTxUPiB7XG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXM7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzOiBrbGFzcyxcbiAgICAgIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBhc3NlcnQodHlwZW9mIGtsYXNzID09PSAnZnVuY3Rpb24nLCBgVW5hYmxlIHRvIGluc3RhbnRpYXRlICR7IHNwZWNpZmllciB9IChpdCdzIG5vdCBhIGNvbnN0cnVjdG9yKS4gVHJ5IHNldHRpbmcgdGhlICdpbnN0YW50aWF0ZTogZmFsc2UnIG9wdGlvbiBvbiB0aGlzIGNvbnRhaW5lciBlbnRyeSB0byBhdm9pZCBpbnN0YW50aWF0aW5nIGl0YCk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IDxUPm5ldyBrbGFzcygpO1xuICAgICAgICBpbmplY3RJbnN0YW5jZShpbnN0YW5jZSwgY29udGFpbmVyKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnN0YW5jZS5pbml0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgaW5zdGFuY2UuaW5pdCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuIl19