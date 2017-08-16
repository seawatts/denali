"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const bluebird_1 = require("bluebird");
const addon_1 = require("./addon");
const topsort_1 = require("../utils/topsort");
const container_1 = require("../metal/container");
const find_plugins_1 = require("find-plugins");
const tryRequire = require("try-require");
const createDebug = require("debug");
const debug = createDebug('denali:application');
/**
 * Application instances are specialized Addons, designed to kick off the loading, mounting, and
 * launching stages of booting up.
 *
 * @package runtime
 */
class Application extends addon_1.default {
    constructor(options) {
        assert(fs.existsSync(options.dir), '`options.dir` must contain a valid path to the directory containing this application');
        let container = new container_1.default(options.dir);
        super(Object.assign(options, { container }));
        this.drainers = [];
        // Setup some helpful container shortcuts
        this.container.register('app:main', this, { singleton: true, instantiate: false });
        // Find addons for this application
        this.addons = this.buildAddons(options.addons || []);
        this.router = this.container.lookup('app:router');
        this.logger = this.container.lookup('app:logger');
        // Generate config first, since the loading process may need it
        this.config = this.generateConfig();
        this.compileRouter();
    }
    /**
     * Given a directory that contains an addon, load that addon and instantiate it's Addon class.
     */
    buildAddons(preseededAddons) {
        return find_plugins_1.default({
            dir: this.dir,
            keyword: 'denali-addon',
            include: preseededAddons
        }).map((plugin) => {
            let AddonClass;
            try {
                AddonClass = tryRequire(path.join(plugin.dir, 'app', 'addon.js'));
                AddonClass = AddonClass || addon_1.default;
            }
            catch (e) {
                /* tslint:disable:no-console */
                console.error(`Error loading an addon from ${plugin.dir}:`);
                console.error(e);
                /* tslint:enable:no-console */
                throw e;
            }
            AddonClass = (AddonClass.default || AddonClass);
            let addon = new AddonClass({
                environment: this.environment,
                container: this.container,
                dir: plugin.dir,
                pkg: plugin.pkg
            });
            debug(`Addon: ${addon.pkg.name}@${addon.pkg.version} (${addon.dir}) `);
            return addon;
        });
    }
    /**
     * Take the loaded environment config functions, and execute them. Application config is executed
     * first, and the returned config object is handed off to the addon config files, which add their
     * configuration by mutating that same object.
     *
     * The resulting final config is stored at `application.config`, and is registered in the
     * container under `config:environment`.
     *
     * This is invoked before the rest of the addons are loaded for 2 reasons:
     *
     * - The config values for the application could theoretically impact the addon loading process
     * - Addons are given a chance to modify the application config, so it must be loaded before they
     *   are.
     */
    generateConfig() {
        let appConfig = this.resolver.retrieve('config:environment') || lodash_1.constant({});
        let config = appConfig(this.environment);
        config.environment = this.environment;
        this.container.register('config:environment', config);
        this.addons.forEach((addon) => {
            let addonConfig = addon.resolver.retrieve('config:environment');
            if (addonConfig) {
                addonConfig(this.environment, config);
            }
        });
        return config;
    }
    /**
     * Assemble middleware and routes
     */
    compileRouter() {
        // Load addon middleware first
        this.addons.forEach((addon) => {
            let addonMiddleware = addon.resolver.retrieve('config:middleware') || lodash_1.noop;
            addonMiddleware(this.router, this);
        });
        // Then load app middleware
        let appMiddleware = this.resolver.retrieve('config:middleware') || lodash_1.noop;
        appMiddleware(this.router, this);
        // Load app routes first so they have precedence
        let appRoutes = this.resolver.retrieve('config:routes') || lodash_1.noop;
        appRoutes(this.router, this);
        // Load addon routes in reverse order so routing precedence matches addon load order
        this.addons.reverse().forEach((addon) => {
            let addonRoutes = addon.resolver.retrieve('config:routes') || lodash_1.noop;
            addonRoutes(this.router);
        });
    }
    /**
     * Start the Denali server. Runs all initializers, creates an HTTP server, and binds to the port
     * to handle incoming HTTP requests.
     *
     * @since 0.1.0
     */
    start() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let port = this.config.server.port || 3000;
            try {
                yield this.runInitializers();
                if (!this.config.server.detached) {
                    yield this.createServer(port);
                    this.logger.info(`${this.pkg.name}@${this.pkg.version} server up on port ${port}`);
                }
            }
            catch (error) {
                this.logger.error('Problem starting app ...');
                this.logger.error(error.stack || error);
            }
        });
    }
    /**
     * Creates an HTTP or HTTPS server, depending on whether or not SSL configuration is present in
     * config/environment.js
     */
    createServer(port) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => {
                let handler = this.router.handle.bind(this.router);
                let server;
                if (this.config.server.ssl) {
                    server = https.createServer(this.config.server.ssl, handler).listen(port, resolve);
                }
                else {
                    server = http.createServer(handler).listen(port, resolve);
                }
                this.drainers.push(function drainHttp() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield new Promise((resolveDrainer) => {
                            server.close(resolveDrainer);
                            setTimeout(resolveDrainer, 60 * 1000);
                        });
                    });
                });
            });
        });
    }
    /**
     * Lookup all initializers and run them in sequence. Initializers can override the default load
     * order by including `before` or `after` properties on the exported class (the name or array of
     * names of the other initializers it should run before/after).
     *
     * @since 0.1.0
     */
    runInitializers() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let initializers = topsort_1.default(lodash_1.values(this.container.lookupAll('initializer')));
            yield bluebird_1.each(initializers, (initializer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield initializer.initialize(this);
            }));
        });
    }
    /**
     * Shutdown the application gracefully (i.e. close external database connections, drain in-flight
     * requests, etc)
     *
     * @since 0.1.0
     */
    shutdown() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield bluebird_1.all(this.drainers.map((drainer) => drainer()));
            yield bluebird_1.all(this.addons.map((addon) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield addon.shutdown(this);
            })));
            this.container.teardown();
        });
    }
}
exports.default = Application;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9ydW50aW1lL2FwcGxpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUlnQjtBQUNoQixpQ0FBaUM7QUFDakMseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLHVDQUFxQztBQUNyQyxtQ0FBNEI7QUFDNUIsOENBQXVDO0FBR3ZDLGtEQUEyQztBQUMzQywrQ0FBdUM7QUFDdkMsMENBQTBDO0FBQzFDLHFDQUFxQztBQUdyQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQTZCaEQ7Ozs7O0dBS0c7QUFDSCxpQkFBaUMsU0FBUSxlQUFLO0lBd0M1QyxZQUFZLE9BQTJCO1FBQ3JDLE1BQU0sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxzRkFBc0YsQ0FBQyxDQUFDO1FBQzNILElBQUksU0FBUyxHQUFHLElBQUksbUJBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRW5CLHlDQUF5QztRQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUVuRixtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksRUFBRSxD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Y29uc3RhbnQsXG4gIG5vb3Bcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgeyBlYWNoLCBhbGwgfSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgQWRkb24gZnJvbSAnLi9hZGRvbic7XG5pbXBvcnQgdG9wc29ydCBmcm9tICcuLi91dGlscy90b3Bzb3J0JztcbmltcG9ydCBSb3V0ZXIgZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IExvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4uL21ldGFsL2NvbnRhaW5lcic7XG5pbXBvcnQgZmluZFBsdWdpbnMgZnJvbSAnZmluZC1wbHVnaW5zJztcbmltcG9ydCAqIGFzIHRyeVJlcXVpcmUgZnJvbSAndHJ5LXJlcXVpcmUnO1xuaW1wb3J0ICogYXMgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHsgVmVydGV4IH0gZnJvbSAnLi4vdXRpbHMvdG9wc29ydCc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTphcHBsaWNhdGlvbicpO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGluc3RhbnRpYXRpbmcgYW4gYXBwbGljYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcHBsaWNhdGlvbk9wdGlvbnMge1xuICByb3V0ZXI/OiBSb3V0ZXI7XG4gIGFkZG9ucz86IHN0cmluZ1tdO1xuICBjb250YWluZXI/OiBDb250YWluZXI7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBwa2c/OiBhbnk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZXJzIGFyZSBydW4gYmVmb3JlIHRoZSBhcHBsaWNhdGlvbiBzdGFydHMgdXAuIFlvdSBhcmUgZ2l2ZW4gdGhlIGFwcGxpY2F0aW9uIGluc3RhbmNlLFxuICogYW5kIGlmIHlvdSBuZWVkIHRvIHBlcmZvcm0gYXN5bmMgb3BlcmF0aW9ucywgeW91IGNhbiByZXR1cm4gYSBQcm9taXNlLiBZb3UgY2FuIGNvbmZpZ3VyZVxuICogaW5pdGlhbGl6ZXIgb3JkZXIgYnkgc3BlY2lmeWluZyB0aGUgbmFtZXMgb2YgaW5pdGlhbGl6ZXJzIHRoYXQgc2hvdWxkIGNvbWUgYmVmb3JlIG9yIGFmdGVyIHlvdXJcbiAqIGluaXRpYWxpemVyLlxuICpcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEluaXRpYWxpemVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICBiZWZvcmU/OiBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgYWZ0ZXI/OiBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgaW5pdGlhbGl6ZShhcHBsaWNhdGlvbjogQXBwbGljYXRpb24pOiBQcm9taXNlPGFueT47XG59XG5cbi8qKlxuICogQXBwbGljYXRpb24gaW5zdGFuY2VzIGFyZSBzcGVjaWFsaXplZCBBZGRvbnMsIGRlc2lnbmVkIHRvIGtpY2sgb2ZmIHRoZSBsb2FkaW5nLCBtb3VudGluZywgYW5kXG4gKiBsYXVuY2hpbmcgc3RhZ2VzIG9mIGJvb3RpbmcgdXAuXG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIEFkZG9uIHtcblxuICAvKipcbiAgICogVGhlIFJvdXRlciBpbnN0YW5jZSBmb3IgdGhpcyBBcHBsaWNhdGlvbi5cbiAgICovXG4gIHJvdXRlcjogUm91dGVyO1xuXG4gIC8qKlxuICAgKiBUaGUgYXBwbGljYXRpb24gY29uZmlnXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgY29uZmlnOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBjb250YWluZXIgaW5zdGFuY2UgZm9yIHRoZSBlbnRpcmUgYXBwbGljYXRpb25cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBjb250YWluZXI6IENvbnRhaW5lcjtcblxuICAvKipcbiAgICogVHJhY2sgc2VydmVycyB0aGF0IG5lZWQgdG8gZHJhaW4gYmVmb3JlIGFwcGxpY2F0aW9uIHNodXRkb3duXG4gICAqL1xuICBwcm90ZWN0ZWQgZHJhaW5lcnM6ICgoKSA9PiBQcm9taXNlPHZvaWQ+KVtdO1xuXG4gIC8qKlxuICAgKiBUaGUgbG9nZ2VyIGluc3RhbmNlIGZvciB0aGUgZW50aXJlIGFwcGxpY2F0aW9uXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgbG9nZ2VyOiBMb2dnZXI7XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgY2hpbGQgYWRkb25zIGZvciB0aGlzIGFwcCAob25lLWxldmVsIGRlZXAgb25seSwgaS5lLiBubyBhZGRvbnMtb2YtYWRkb25zIGFyZSBpbmNsdWRlZClcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhZGRvbnM6IEFkZG9uW107XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zKSB7XG4gICAgYXNzZXJ0KGZzLmV4aXN0c1N5bmMob3B0aW9ucy5kaXIpLCAnYG9wdGlvbnMuZGlyYCBtdXN0IGNvbnRhaW4gYSB2YWxpZCBwYXRoIHRvIHRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGlzIGFwcGxpY2F0aW9uJyk7XG4gICAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIob3B0aW9ucy5kaXIpO1xuICAgIHN1cGVyKE9iamVjdC5hc3NpZ24ob3B0aW9ucywgeyBjb250YWluZXIgfSkpO1xuXG4gICAgdGhpcy5kcmFpbmVycyA9IFtdO1xuXG4gICAgLy8gU2V0dXAgc29tZSBoZWxwZnVsIGNvbnRhaW5lciBzaG9ydGN1dHNcbiAgICB0aGlzLmNvbnRhaW5lci5yZWdpc3RlcignYXBwOm1haW4nLCB0aGlzLCB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuXG4gICAgLy8gRmluZCBhZGRvbnMgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICB0aGlzLmFkZG9ucyA9IHRoaXMuYnVpbGRBZGRvbnMob3B0aW9ucy5hZGRvbnMgfHwgW10pO1xuXG4gICAgdGhpcy5yb3V0ZXIgPSB0aGlzLmNvbnRhaW5lci5sb29rdXAoJ2FwcDpyb3V0ZXInKTtcbiAgICB0aGlzLmxvZ2dlciA9IHRoaXMuY29udGFpbmVyLmxvb2t1cCgnYXBwOmxvZ2dlcicpO1xuXG4gICAgLy8gR2VuZXJhdGUgY29uZmlnIGZpcnN0LCBzaW5jZSB0aGUgbG9hZGluZyBwcm9jZXNzIG1heSBuZWVkIGl0XG4gICAgdGhpcy5jb25maWcgPSB0aGlzLmdlbmVyYXRlQ29uZmlnKCk7XG5cbiAgICB0aGlzLmNvbXBpbGVSb3V0ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIGFuIGFkZG9uLCBsb2FkIHRoYXQgYWRkb24gYW5kIGluc3RhbnRpYXRlIGl0J3MgQWRkb24gY2xhc3MuXG4gICAqL1xuICBwcml2YXRlIGJ1aWxkQWRkb25zKHByZXNlZWRlZEFkZG9uczogc3RyaW5nW10pOiBBZGRvbltdIHtcbiAgICByZXR1cm4gZmluZFBsdWdpbnMoe1xuICAgICAgZGlyOiB0aGlzLmRpcixcbiAgICAgIGtleXdvcmQ6ICdkZW5hbGktYWRkb24nLFxuICAgICAgaW5jbHVkZTogcHJlc2VlZGVkQWRkb25zXG4gICAgfSkubWFwKChwbHVnaW4pID0+IHtcbiAgICAgIGxldCBBZGRvbkNsYXNzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgQWRkb25DbGFzcyA9IHRyeVJlcXVpcmUocGF0aC5qb2luKHBsdWdpbi5kaXIsICdhcHAnLCAnYWRkb24uanMnKSk7XG4gICAgICAgIEFkZG9uQ2xhc3MgPSBBZGRvbkNsYXNzIHx8IEFkZG9uO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlICovXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGxvYWRpbmcgYW4gYWRkb24gZnJvbSAkeyBwbHVnaW4uZGlyIH06YCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgICAgQWRkb25DbGFzcyA9IDx0eXBlb2YgQWRkb24+KEFkZG9uQ2xhc3MuZGVmYXVsdCB8fCBBZGRvbkNsYXNzKTtcbiAgICAgIGxldCBhZGRvbiA9IG5ldyBBZGRvbkNsYXNzKHtcbiAgICAgICAgZW52aXJvbm1lbnQ6IHRoaXMuZW52aXJvbm1lbnQsXG4gICAgICAgIGNvbnRhaW5lcjogdGhpcy5jb250YWluZXIsXG4gICAgICAgIGRpcjogcGx1Z2luLmRpcixcbiAgICAgICAgcGtnOiBwbHVnaW4ucGtnXG4gICAgICB9KTtcbiAgICAgIGRlYnVnKGBBZGRvbjogJHsgYWRkb24ucGtnLm5hbWUgfUAkeyBhZGRvbi5wa2cudmVyc2lvbiB9ICgkeyBhZGRvbi5kaXIgfSkgYCk7XG4gICAgICByZXR1cm4gYWRkb247XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSB0aGUgbG9hZGVkIGVudmlyb25tZW50IGNvbmZpZyBmdW5jdGlvbnMsIGFuZCBleGVjdXRlIHRoZW0uIEFwcGxpY2F0aW9uIGNvbmZpZyBpcyBleGVjdXRlZFxuICAgKiBmaXJzdCwgYW5kIHRoZSByZXR1cm5lZCBjb25maWcgb2JqZWN0IGlzIGhhbmRlZCBvZmYgdG8gdGhlIGFkZG9uIGNvbmZpZyBmaWxlcywgd2hpY2ggYWRkIHRoZWlyXG4gICAqIGNvbmZpZ3VyYXRpb24gYnkgbXV0YXRpbmcgdGhhdCBzYW1lIG9iamVjdC5cbiAgICpcbiAgICogVGhlIHJlc3VsdGluZyBmaW5hbCBjb25maWcgaXMgc3RvcmVkIGF0IGBhcHBsaWNhdGlvbi5jb25maWdgLCBhbmQgaXMgcmVnaXN0ZXJlZCBpbiB0aGVcbiAgICogY29udGFpbmVyIHVuZGVyIGBjb25maWc6ZW52aXJvbm1lbnRgLlxuICAgKlxuICAgKiBUaGlzIGlzIGludm9rZWQgYmVmb3JlIHRoZSByZXN0IG9mIHRoZSBhZGRvbnMgYXJlIGxvYWRlZCBmb3IgMiByZWFzb25zOlxuICAgKlxuICAgKiAtIFRoZSBjb25maWcgdmFsdWVzIGZvciB0aGUgYXBwbGljYXRpb24gY291bGQgdGhlb3JldGljYWxseSBpbXBhY3QgdGhlIGFkZG9uIGxvYWRpbmcgcHJvY2Vzc1xuICAgKiAtIEFkZG9ucyBhcmUgZ2l2ZW4gYSBjaGFuY2UgdG8gbW9kaWZ5IHRoZSBhcHBsaWNhdGlvbiBjb25maWcsIHNvIGl0IG11c3QgYmUgbG9hZGVkIGJlZm9yZSB0aGV5XG4gICAqICAgYXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZUNvbmZpZygpOiBhbnkge1xuICAgIGxldCBhcHBDb25maWcgPSB0aGlzLnJlc29sdmVyLnJldHJpZXZlKCdjb25maWc6ZW52aXJvbm1lbnQnKSB8fCBjb25zdGFudCh7fSk7XG4gICAgbGV0IGNvbmZpZyA9IGFwcENvbmZpZyh0aGlzLmVudmlyb25tZW50KTtcbiAgICBjb25maWcuZW52aXJvbm1lbnQgPSB0aGlzLmVudmlyb25tZW50O1xuICAgIHRoaXMuY29udGFpbmVyLnJlZ2lzdGVyKCdjb25maWc6ZW52aXJvbm1lbnQnLCBjb25maWcpO1xuICAgIHRoaXMuYWRkb25zLmZvckVhY2goKGFkZG9uKSA9PiB7XG4gICAgICBsZXQgYWRkb25Db25maWcgPSBhZGRvbi5yZXNvbHZlci5yZXRyaWV2ZSgnY29uZmlnOmVudmlyb25tZW50Jyk7XG4gICAgICBpZiAoYWRkb25Db25maWcpIHtcbiAgICAgICAgYWRkb25Db25maWcodGhpcy5lbnZpcm9ubWVudCwgY29uZmlnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VtYmxlIG1pZGRsZXdhcmUgYW5kIHJvdXRlc1xuICAgKi9cbiAgcHJpdmF0ZSBjb21waWxlUm91dGVyKCk6IHZvaWQge1xuICAgIC8vIExvYWQgYWRkb24gbWlkZGxld2FyZSBmaXJzdFxuICAgIHRoaXMuYWRkb25zLmZvckVhY2goKGFkZG9uKSA9PiB7XG4gICAgICBsZXQgYWRkb25NaWRkbGV3YXJlID0gYWRkb24ucmVzb2x2ZXIucmV0cmlldmUoJ2NvbmZpZzptaWRkbGV3YXJlJykgfHwgbm9vcDtcbiAgICAgIGFkZG9uTWlkZGxld2FyZSh0aGlzLnJvdXRlciwgdGhpcyk7XG4gICAgfSk7XG4gICAgLy8gVGhlbiBsb2FkIGFwcCBtaWRkbGV3YXJlXG4gICAgbGV0IGFwcE1pZGRsZXdhcmUgPSB0aGlzLnJlc29sdmVyLnJldHJpZXZlKCdjb25maWc6bWlkZGxld2FyZScpIHx8IG5vb3A7XG4gICAgYXBwTWlkZGxld2FyZSh0aGlzLnJvdXRlciwgdGhpcyk7XG4gICAgLy8gTG9hZCBhcHAgcm91dGVzIGZpcnN0IHNvIHRoZXkgaGF2ZSBwcmVjZWRlbmNlXG4gICAgbGV0IGFwcFJvdXRlcyA9IHRoaXMucmVzb2x2ZXIucmV0cmlldmUoJ2NvbmZpZzpyb3V0ZXMnKSB8fCBub29wO1xuICAgIGFwcFJvdXRlcyh0aGlzLnJvdXRlciwgdGhpcyk7XG4gICAgLy8gTG9hZCBhZGRvbiByb3V0ZXMgaW4gcmV2ZXJzZSBvcmRlciBzbyByb3V0aW5nIHByZWNlZGVuY2UgbWF0Y2hlcyBhZGRvbiBsb2FkIG9yZGVyXG4gICAgdGhpcy5hZGRvbnMucmV2ZXJzZSgpLmZvckVhY2goKGFkZG9uKSA9PiB7XG4gICAgICBsZXQgYWRkb25Sb3V0ZXMgPSBhZGRvbi5yZXNvbHZlci5yZXRyaWV2ZSgnY29uZmlnOnJvdXRlcycpIHx8IG5vb3A7XG4gICAgICBhZGRvblJvdXRlcyh0aGlzLnJvdXRlcik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdGhlIERlbmFsaSBzZXJ2ZXIuIFJ1bnMgYWxsIGluaXRpYWxpemVycywgY3JlYXRlcyBhbiBIVFRQIHNlcnZlciwgYW5kIGJpbmRzIHRvIHRoZSBwb3J0XG4gICAqIHRvIGhhbmRsZSBpbmNvbWluZyBIVFRQIHJlcXVlc3RzLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBwb3J0ID0gdGhpcy5jb25maWcuc2VydmVyLnBvcnQgfHwgMzAwMDtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5ydW5Jbml0aWFsaXplcnMoKTtcbiAgICAgIGlmICghdGhpcy5jb25maWcuc2VydmVyLmRldGFjaGVkKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlU2VydmVyKHBvcnQpO1xuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKGAkeyB0aGlzLnBrZy5uYW1lIH1AJHsgdGhpcy5wa2cudmVyc2lvbiB9IHNlcnZlciB1cCBvbiBwb3J0ICR7IHBvcnQgfWApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcignUHJvYmxlbSBzdGFydGluZyBhcHAgLi4uJyk7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcihlcnJvci5zdGFjayB8fCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gSFRUUCBvciBIVFRQUyBzZXJ2ZXIsIGRlcGVuZGluZyBvbiB3aGV0aGVyIG9yIG5vdCBTU0wgY29uZmlndXJhdGlvbiBpcyBwcmVzZW50IGluXG4gICAqIGNvbmZpZy9lbnZpcm9ubWVudC5qc1xuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVTZXJ2ZXIocG9ydDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGxldCBoYW5kbGVyID0gdGhpcy5yb3V0ZXIuaGFuZGxlLmJpbmQodGhpcy5yb3V0ZXIpO1xuICAgICAgbGV0IHNlcnZlcjogYW55O1xuICAgICAgaWYgKHRoaXMuY29uZmlnLnNlcnZlci5zc2wpIHtcbiAgICAgICAgc2VydmVyID0gaHR0cHMuY3JlYXRlU2VydmVyKHRoaXMuY29uZmlnLnNlcnZlci5zc2wsIGhhbmRsZXIpLmxpc3Rlbihwb3J0LCByZXNvbHZlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGhhbmRsZXIpLmxpc3Rlbihwb3J0LCByZXNvbHZlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZHJhaW5lcnMucHVzaChhc3luYyBmdW5jdGlvbiBkcmFpbkh0dHAoKSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlRHJhaW5lcikgPT4ge1xuICAgICAgICAgIHNlcnZlci5jbG9zZShyZXNvbHZlRHJhaW5lcik7XG4gICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlRHJhaW5lciwgNjAgKiAxMDAwKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgYWxsIGluaXRpYWxpemVycyBhbmQgcnVuIHRoZW0gaW4gc2VxdWVuY2UuIEluaXRpYWxpemVycyBjYW4gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgbG9hZFxuICAgKiBvcmRlciBieSBpbmNsdWRpbmcgYGJlZm9yZWAgb3IgYGFmdGVyYCBwcm9wZXJ0aWVzIG9uIHRoZSBleHBvcnRlZCBjbGFzcyAodGhlIG5hbWUgb3IgYXJyYXkgb2ZcbiAgICogbmFtZXMgb2YgdGhlIG90aGVyIGluaXRpYWxpemVycyBpdCBzaG91bGQgcnVuIGJlZm9yZS9hZnRlcikuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgcnVuSW5pdGlhbGl6ZXJzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBpbml0aWFsaXplcnMgPSA8SW5pdGlhbGl6ZXJbXT50b3Bzb3J0KDxWZXJ0ZXhbXT52YWx1ZXModGhpcy5jb250YWluZXIubG9va3VwQWxsKCdpbml0aWFsaXplcicpKSk7XG4gICAgYXdhaXQgZWFjaChpbml0aWFsaXplcnMsIGFzeW5jIChpbml0aWFsaXplcjogSW5pdGlhbGl6ZXIpID0+IHtcbiAgICAgIGF3YWl0IGluaXRpYWxpemVyLmluaXRpYWxpemUodGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2h1dGRvd24gdGhlIGFwcGxpY2F0aW9uIGdyYWNlZnVsbHkgKGkuZS4gY2xvc2UgZXh0ZXJuYWwgZGF0YWJhc2UgY29ubmVjdGlvbnMsIGRyYWluIGluLWZsaWdodFxuICAgKiByZXF1ZXN0cywgZXRjKVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGFzeW5jIHNodXRkb3duKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IGFsbCh0aGlzLmRyYWluZXJzLm1hcCgoZHJhaW5lcikgPT4gZHJhaW5lcigpKSk7XG4gICAgYXdhaXQgYWxsKHRoaXMuYWRkb25zLm1hcChhc3luYyAoYWRkb24pID0+IHtcbiAgICAgIGF3YWl0IGFkZG9uLnNodXRkb3duKHRoaXMpO1xuICAgIH0pKTtcbiAgICB0aGlzLmNvbnRhaW5lci50ZWFyZG93bigpO1xuICB9XG5cbn1cbiJdfQ==