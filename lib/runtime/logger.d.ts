/// <reference types="chalk" />
import * as chalk from 'chalk';
import DenaliObject from '../metal/object';
export declare type LogLevel = 'info' | 'warn' | 'error' | 'debug';
/**
 * A simple Logger class that adds timestamps and supports multiple levels of logging, colorized
 * output, and control over verbosity.
 * https://developer.mozilla.org/en-US/docs/Web/API/Console/log
 * @package runtime
 * @since 0.1.0
 */
export default class Logger extends DenaliObject {
    /**
     * Default log level if none specified.
     *
     * @since 0.1.0
     */
    loglevel: LogLevel;
    /**
     * Specify if logs should be colorized.
     *
     * @since 0.1.0
     */
    colorize: boolean;
    /**
     * Available log levels that can be used.
     */
    levels: LogLevel[];
    /**
     * Color map for the available levels.
     */
    colors: {
        [level: string]: chalk.ChalkChain;
    };
    /**
     * Log at the 'info' level.
     *
     * @since 0.1.0
     */
    info(...params: any[]): void;
    /**
     * Log at the 'warn' level.
     *
     * @since 0.1.0
     */
    warn(...params: any[]): void;
    /**
     * Log at the 'error' level.
     *
     * @since 0.1.0
     */
    error(...params: any[]): void;
    /**
     * Log at the 'debug' level.
     *
     * @since 0.2.0
     */
    debug(...params: any[]): void;
    /**
     * Log a message to the logger at a specific log level.
     */
    log(level: LogLevel, ...params: any[]): void;
    protected formatMessage(level: LogLevel, ...params: any[]): string;
    protected write(message: string): void;
    protected writeError(message: string): void;
}
