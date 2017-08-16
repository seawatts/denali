"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const chalk = require("chalk");
const object_1 = require("../metal/object");
const util = require("util");
/**
 * A simple Logger class that adds timestamps and supports multiple levels of logging, colorized
 * output, and control over verbosity.
 * https://developer.mozilla.org/en-US/docs/Web/API/Console/log
 * @package runtime
 * @since 0.1.0
 */
class Logger extends object_1.default {
    constructor() {
        super(...arguments);
        /**
         * Default log level if none specified.
         *
         * @since 0.1.0
         */
        this.loglevel = 'info';
        /**
         * Specify if logs should be colorized.
         *
         * @since 0.1.0
         */
        this.colorize = true;
        /**
         * Available log levels that can be used.
         */
        this.levels = [
            'info',
            'warn',
            'error',
            'debug'
        ];
        /**
         * Color map for the available levels.
         */
        this.colors = {
            info: chalk.white,
            debug: chalk.cyan,
            warn: chalk.yellow,
            error: chalk.red
        };
    }
    /**
     * Log at the 'info' level.
     *
     * @since 0.1.0
     */
    info(...params) {
        this.log('info', params);
    }
    /**
     * Log at the 'warn' level.
     *
     * @since 0.1.0
     */
    warn(...params) {
        this.log('warn', params);
    }
    /**
     * Log at the 'error' level.
     *
     * @since 0.1.0
     */
    error(...params) {
        this.log('error', params);
    }
    /**
     * Log at the 'debug' level.
     *
     * @since 0.2.0
     */
    debug(...params) {
        this.log('debug', params);
    }
    /**
     * Log a message to the logger at a specific log level.
     */
    log(level, ...params) {
        let message = this.formatMessage(level, params);
        if (level.toLowerCase() === 'error') {
            this.writeError(message);
        }
        else {
            this.write(message);
        }
    }
    formatMessage(level, ...params) {
        let formattedMessage = util.format.apply(this, params);
        if (this.levels.indexOf(level) === -1) {
            level = this.loglevel;
        }
        let timestamp = (new Date()).toISOString();
        let padLength = this.levels.reduce((n, label) => Math.max(n, label.length), null);
        let levelLabel = lodash_1.padStart(level.toUpperCase(), padLength);
        if (this.colorize) {
            let colorizer = this.colors[level] || lodash_1.identity;
            formattedMessage = colorizer(formattedMessage);
            levelLabel = colorizer(levelLabel);
        }
        return `[${timestamp}] ${levelLabel} - ${formattedMessage}\n`;
    }
    write(message) {
        process.stdout.write(message);
    }
    writeError(message) {
        process.stderr.write(message);
    }
}
exports.default = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvcnVudGltZS9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FHZ0I7QUFDaEIsK0JBQStCO0FBQy9CLDRDQUEyQztBQUMzQyw2QkFBNkI7QUFJN0I7Ozs7OztHQU1HO0FBQ0gsWUFBNEIsU0FBUSxnQkFBWTtJQUFoRDs7UUFFRTs7OztXQUlHO1FBQ0gsYUFBUSxHQUFhLE1BQU0sQ0FBQztRQUU1Qjs7OztXQUlHO1FBQ0gsYUFBUSxHQUFHLElBQUksQ0FBQztRQUVoQjs7V0FFRztRQUNILFdBQU0sR0FBZTtZQUNuQixNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1NBQ1IsQ0FBQztRQUVGOztXQUVHO1FBQ0gsV0FBTSxHQUEwQztZQUM5QyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUs7WUFDakIsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJO1lBQ2pCLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNsQixLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUc7U0FDakIsQ0FBQztJQThFSixDQUFDO0lBNUVDOzs7O09BSUc7SUFDSCxJQUFJLENBQUMsR0FBRyxNQUFhO1FBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBSSxDQUFDLEdBQUcsTUFBYTtRQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxHQUFHLE1BQWE7UUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsR0FBRyxNQUFhO1FBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILEdBQUcsQ0FBQyxLQUFlLEVBQUUsR0FBRyxNQUFhO1FBQ25DLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRWhELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QixDQUFDO0lBQ0gsQ0FBQztJQUVTLGFBQWEsQ0FBQyxLQUFlLEVBQUUsR0FBRyxNQUFhO1FBQ3ZELElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXZELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN4QixDQUFDO1FBRUQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFTLEVBQUUsS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRixJQUFJLFVBQVUsR0FBRyxpQkFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUUxRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNsQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLGlCQUFRLENBQUM7WUFDL0MsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDL0MsVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksU0FBUyxLQUFLLFVBQVUsTUFBTSxnQkFBZ0IsSUFBSSxDQUFDO0lBQ2hFLENBQUM7SUFFUyxLQUFLLENBQUMsT0FBZTtRQUM3QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRVMsVUFBVSxDQUFDLE9BQWU7UUFDbEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNGO0FBaEhELHlCQWdIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlkZW50aXR5LFxuICBwYWRTdGFydFxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcblxuZXhwb3J0IHR5cGUgTG9nTGV2ZWwgPSAnaW5mbycgfCAnd2FybicgfCAnZXJyb3InIHwgJ2RlYnVnJztcblxuLyoqXG4gKiBBIHNpbXBsZSBMb2dnZXIgY2xhc3MgdGhhdCBhZGRzIHRpbWVzdGFtcHMgYW5kIHN1cHBvcnRzIG11bHRpcGxlIGxldmVscyBvZiBsb2dnaW5nLCBjb2xvcml6ZWRcbiAqIG91dHB1dCwgYW5kIGNvbnRyb2wgb3ZlciB2ZXJib3NpdHkuXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ29uc29sZS9sb2dcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dnZXIgZXh0ZW5kcyBEZW5hbGlPYmplY3Qge1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IGxvZyBsZXZlbCBpZiBub25lIHNwZWNpZmllZC5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBsb2dsZXZlbDogTG9nTGV2ZWwgPSAnaW5mbyc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgaWYgbG9ncyBzaG91bGQgYmUgY29sb3JpemVkLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGNvbG9yaXplID0gdHJ1ZTtcblxuICAvKipcbiAgICogQXZhaWxhYmxlIGxvZyBsZXZlbHMgdGhhdCBjYW4gYmUgdXNlZC5cbiAgICovXG4gIGxldmVsczogTG9nTGV2ZWxbXSA9IFtcbiAgICAnaW5mbycsXG4gICAgJ3dhcm4nLFxuICAgICdlcnJvcicsXG4gICAgJ2RlYnVnJ1xuICBdO1xuXG4gIC8qKlxuICAgKiBDb2xvciBtYXAgZm9yIHRoZSBhdmFpbGFibGUgbGV2ZWxzLlxuICAgKi9cbiAgY29sb3JzOiB7IFtsZXZlbDogc3RyaW5nXTogY2hhbGsuQ2hhbGtDaGFpbiB9ID0ge1xuICAgIGluZm86IGNoYWxrLndoaXRlLFxuICAgIGRlYnVnOiBjaGFsay5jeWFuLFxuICAgIHdhcm46IGNoYWxrLnllbGxvdyxcbiAgICBlcnJvcjogY2hhbGsucmVkXG4gIH07XG5cbiAgLyoqXG4gICAqIExvZyBhdCB0aGUgJ2luZm8nIGxldmVsLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGluZm8oLi4ucGFyYW1zOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMubG9nKCdpbmZvJywgcGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgYXQgdGhlICd3YXJuJyBsZXZlbC5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICB3YXJuKC4uLnBhcmFtczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLmxvZygnd2FybicsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogTG9nIGF0IHRoZSAnZXJyb3InIGxldmVsLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGVycm9yKC4uLnBhcmFtczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLmxvZygnZXJyb3InLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZyBhdCB0aGUgJ2RlYnVnJyBsZXZlbC5cbiAgICpcbiAgICogQHNpbmNlIDAuMi4wXG4gICAqL1xuICBkZWJ1ZyguLi5wYXJhbXM6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy5sb2coJ2RlYnVnJywgcGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgYSBtZXNzYWdlIHRvIHRoZSBsb2dnZXIgYXQgYSBzcGVjaWZpYyBsb2cgbGV2ZWwuXG4gICAqL1xuICBsb2cobGV2ZWw6IExvZ0xldmVsLCAuLi5wYXJhbXM6IGFueVtdKTogdm9pZCB7XG4gICAgbGV0IG1lc3NhZ2UgPSB0aGlzLmZvcm1hdE1lc3NhZ2UobGV2ZWwsIHBhcmFtcyk7XG5cbiAgICBpZiAobGV2ZWwudG9Mb3dlckNhc2UoKSA9PT0gJ2Vycm9yJykge1xuICAgICAgdGhpcy53cml0ZUVycm9yKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLndyaXRlKG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBmb3JtYXRNZXNzYWdlKGxldmVsOiBMb2dMZXZlbCwgLi4ucGFyYW1zOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgbGV0IGZvcm1hdHRlZE1lc3NhZ2UgPSB1dGlsLmZvcm1hdC5hcHBseSh0aGlzLCBwYXJhbXMpO1xuXG4gICAgaWYgKHRoaXMubGV2ZWxzLmluZGV4T2YobGV2ZWwpID09PSAtMSkge1xuICAgICAgbGV2ZWwgPSB0aGlzLmxvZ2xldmVsO1xuICAgIH1cblxuICAgIGxldCB0aW1lc3RhbXAgPSAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKTtcbiAgICBsZXQgcGFkTGVuZ3RoID0gdGhpcy5sZXZlbHMucmVkdWNlKChuOiBudW1iZXIsIGxhYmVsKSA9PiBNYXRoLm1heChuLCBsYWJlbC5sZW5ndGgpLCBudWxsKTtcbiAgICBsZXQgbGV2ZWxMYWJlbCA9IHBhZFN0YXJ0KGxldmVsLnRvVXBwZXJDYXNlKCksIHBhZExlbmd0aCk7XG5cbiAgICBpZiAodGhpcy5jb2xvcml6ZSkge1xuICAgICAgbGV0IGNvbG9yaXplciA9IHRoaXMuY29sb3JzW2xldmVsXSB8fCBpZGVudGl0eTtcbiAgICAgIGZvcm1hdHRlZE1lc3NhZ2UgPSBjb2xvcml6ZXIoZm9ybWF0dGVkTWVzc2FnZSk7XG4gICAgICBsZXZlbExhYmVsID0gY29sb3JpemVyKGxldmVsTGFiZWwpO1xuICAgIH1cblxuICAgIHJldHVybiBgWyR7dGltZXN0YW1wfV0gJHtsZXZlbExhYmVsfSAtICR7Zm9ybWF0dGVkTWVzc2FnZX1cXG5gO1xuICB9XG5cbiAgcHJvdGVjdGVkIHdyaXRlKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKG1lc3NhZ2UpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHdyaXRlRXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobWVzc2FnZSk7XG4gIH1cbn1cbiJdfQ==