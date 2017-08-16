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
        this.log('info', ...params);
    }
    /**
     * Log at the 'warn' level.
     *
     * @since 0.1.0
     */
    warn(...params) {
        this.log('warn', ...params);
    }
    /**
     * Log at the 'error' level.
     *
     * @since 0.1.0
     */
    error(...params) {
        this.log('error', ...params);
    }
    /**
     * Log at the 'debug' level.
     *
     * @since 0.2.0
     */
    debug(...params) {
        this.log('debug', ...params);
    }
    /**
     * Log a message to the logger at a specific log level.
     */
    log(level, ...params) {
        let message = this.formatMessage(level, ...params);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvcnVudGltZS9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FHZ0I7QUFDaEIsK0JBQStCO0FBQy9CLDRDQUEyQztBQUMzQyw2QkFBNkI7QUFJN0I7Ozs7OztHQU1HO0FBQ0gsWUFBNEIsU0FBUSxnQkFBWTtJQUFoRDs7UUFFRTs7OztXQUlHO1FBQ0gsYUFBUSxHQUFhLE1BQU0sQ0FBQztRQUU1Qjs7OztXQUlHO1FBQ0gsYUFBUSxHQUFHLElBQUksQ0FBQztRQUVoQjs7V0FFRztRQUNILFdBQU0sR0FBZTtZQUNuQixNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1NBQ1IsQ0FBQztRQUVGOztXQUVHO1FBQ0gsV0FBTSxHQUEwQztZQUM5QyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUs7WUFDakIsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJO1lBQ2pCLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNsQixLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUc7U0FDakIsQ0FBQztJQThFSixDQUFDO0lBNUVDOzs7O09BSUc7SUFDSCxJQUFJLENBQUMsR0FBRyxNQUFhO1FBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLENBQUMsR0FBRyxNQUFhO1FBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsR0FBRyxNQUFhO1FBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsR0FBRyxNQUFhO1FBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsR0FBRyxDQUFDLEtBQWUsRUFBRSxHQUFHLE1BQWE7UUFDbkMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUVuRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsQ0FBQztJQUNILENBQUM7SUFFUyxhQUFhLENBQUMsS0FBZSxFQUFFLEdBQUcsTUFBYTtRQUN2RCxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV2RCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBUyxFQUFFLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUYsSUFBSSxVQUFVLEdBQUcsaUJBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFMUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxpQkFBUSxDQUFDO1lBQy9DLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9DLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLFNBQVMsS0FBSyxVQUFVLE1BQU0sZ0JBQWdCLElBQUksQ0FBQztJQUNoRSxDQUFDO0lBRVMsS0FBSyxDQUFDLE9BQWU7UUFDN0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVTLFVBQVUsQ0FBQyxPQUFlO1FBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FDRjtBQWhIRCx5QkFnSEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpZGVudGl0eSxcbiAgcGFkU3RhcnRcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCBEZW5hbGlPYmplY3QgZnJvbSAnLi4vbWV0YWwvb2JqZWN0JztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5cbmV4cG9ydCB0eXBlIExvZ0xldmVsID0gJ2luZm8nIHwgJ3dhcm4nIHwgJ2Vycm9yJyB8ICdkZWJ1Zyc7XG5cbi8qKlxuICogQSBzaW1wbGUgTG9nZ2VyIGNsYXNzIHRoYXQgYWRkcyB0aW1lc3RhbXBzIGFuZCBzdXBwb3J0cyBtdWx0aXBsZSBsZXZlbHMgb2YgbG9nZ2luZywgY29sb3JpemVkXG4gKiBvdXRwdXQsIGFuZCBjb250cm9sIG92ZXIgdmVyYm9zaXR5LlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NvbnNvbGUvbG9nXG4gKiBAcGFja2FnZSBydW50aW1lXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9nZ2VyIGV4dGVuZHMgRGVuYWxpT2JqZWN0IHtcblxuICAvKipcbiAgICogRGVmYXVsdCBsb2cgbGV2ZWwgaWYgbm9uZSBzcGVjaWZpZWQuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgbG9nbGV2ZWw6IExvZ0xldmVsID0gJ2luZm8nO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IGlmIGxvZ3Mgc2hvdWxkIGJlIGNvbG9yaXplZC5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBjb2xvcml6ZSA9IHRydWU7XG5cbiAgLyoqXG4gICAqIEF2YWlsYWJsZSBsb2cgbGV2ZWxzIHRoYXQgY2FuIGJlIHVzZWQuXG4gICAqL1xuICBsZXZlbHM6IExvZ0xldmVsW10gPSBbXG4gICAgJ2luZm8nLFxuICAgICd3YXJuJyxcbiAgICAnZXJyb3InLFxuICAgICdkZWJ1ZydcbiAgXTtcblxuICAvKipcbiAgICogQ29sb3IgbWFwIGZvciB0aGUgYXZhaWxhYmxlIGxldmVscy5cbiAgICovXG4gIGNvbG9yczogeyBbbGV2ZWw6IHN0cmluZ106IGNoYWxrLkNoYWxrQ2hhaW4gfSA9IHtcbiAgICBpbmZvOiBjaGFsay53aGl0ZSxcbiAgICBkZWJ1ZzogY2hhbGsuY3lhbixcbiAgICB3YXJuOiBjaGFsay55ZWxsb3csXG4gICAgZXJyb3I6IGNoYWxrLnJlZFxuICB9O1xuXG4gIC8qKlxuICAgKiBMb2cgYXQgdGhlICdpbmZvJyBsZXZlbC5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBpbmZvKC4uLnBhcmFtczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLmxvZygnaW5mbycsIC4uLnBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogTG9nIGF0IHRoZSAnd2FybicgbGV2ZWwuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgd2FybiguLi5wYXJhbXM6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy5sb2coJ3dhcm4nLCAuLi5wYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZyBhdCB0aGUgJ2Vycm9yJyBsZXZlbC5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBlcnJvciguLi5wYXJhbXM6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy5sb2coJ2Vycm9yJywgLi4ucGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgYXQgdGhlICdkZWJ1ZycgbGV2ZWwuXG4gICAqXG4gICAqIEBzaW5jZSAwLjIuMFxuICAgKi9cbiAgZGVidWcoLi4ucGFyYW1zOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMubG9nKCdkZWJ1ZycsIC4uLnBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogTG9nIGEgbWVzc2FnZSB0byB0aGUgbG9nZ2VyIGF0IGEgc3BlY2lmaWMgbG9nIGxldmVsLlxuICAgKi9cbiAgbG9nKGxldmVsOiBMb2dMZXZlbCwgLi4ucGFyYW1zOiBhbnlbXSk6IHZvaWQge1xuICAgIGxldCBtZXNzYWdlID0gdGhpcy5mb3JtYXRNZXNzYWdlKGxldmVsLCAuLi5wYXJhbXMpO1xuXG4gICAgaWYgKGxldmVsLnRvTG93ZXJDYXNlKCkgPT09ICdlcnJvcicpIHtcbiAgICAgIHRoaXMud3JpdGVFcnJvcihtZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy53cml0ZShtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZm9ybWF0TWVzc2FnZShsZXZlbDogTG9nTGV2ZWwsIC4uLnBhcmFtczogYW55W10pOiBzdHJpbmcge1xuICAgIGxldCBmb3JtYXR0ZWRNZXNzYWdlID0gdXRpbC5mb3JtYXQuYXBwbHkodGhpcywgcGFyYW1zKTtcblxuICAgIGlmICh0aGlzLmxldmVscy5pbmRleE9mKGxldmVsKSA9PT0gLTEpIHtcbiAgICAgIGxldmVsID0gdGhpcy5sb2dsZXZlbDtcbiAgICB9XG5cbiAgICBsZXQgdGltZXN0YW1wID0gKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKCk7XG4gICAgbGV0IHBhZExlbmd0aCA9IHRoaXMubGV2ZWxzLnJlZHVjZSgobjogbnVtYmVyLCBsYWJlbCkgPT4gTWF0aC5tYXgobiwgbGFiZWwubGVuZ3RoKSwgbnVsbCk7XG4gICAgbGV0IGxldmVsTGFiZWwgPSBwYWRTdGFydChsZXZlbC50b1VwcGVyQ2FzZSgpLCBwYWRMZW5ndGgpO1xuXG4gICAgaWYgKHRoaXMuY29sb3JpemUpIHtcbiAgICAgIGxldCBjb2xvcml6ZXIgPSB0aGlzLmNvbG9yc1tsZXZlbF0gfHwgaWRlbnRpdHk7XG4gICAgICBmb3JtYXR0ZWRNZXNzYWdlID0gY29sb3JpemVyKGZvcm1hdHRlZE1lc3NhZ2UpO1xuICAgICAgbGV2ZWxMYWJlbCA9IGNvbG9yaXplcihsZXZlbExhYmVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYFske3RpbWVzdGFtcH1dICR7bGV2ZWxMYWJlbH0gLSAke2Zvcm1hdHRlZE1lc3NhZ2V9XFxuYDtcbiAgfVxuXG4gIHByb3RlY3RlZCB3cml0ZShtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShtZXNzYWdlKTtcbiAgfVxuXG4gIHByb3RlY3RlZCB3cml0ZUVycm9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1lc3NhZ2UpO1xuICB9XG59XG4iXX0=