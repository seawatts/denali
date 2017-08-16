/// <reference types="node" />
import * as http from 'http';
import { Socket } from 'net';
import { Readable, Writable } from 'stream';
import Route from './route';
/**
 * Available HTTP methods (lowercased)
 *
 * @package runtime
 * @since 0.1.0
 */
export declare type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
/**
 * The Request class represents an incoming HTTP request (specifically, Node's IncomingMessage).
 * It's designed with an express-compatible interface to allow interop with existing express
 * middleware.
 *
 * @package runtime
 * @since 0.1.0
 */
export default class Request {
    /**
     * A UUID generated unqiue to this request. Useful for tracing a request through the application.
     *
     * @since 0.1.0
     */
    id: string;
    /**
     * The parsed URL of the IncomingMessage
     */
    private parsedUrl;
    /**
     * The original IncomingMessage from the HTTP library.
     */
    private _incomingMessage;
    /**
     * The route parser route that was matched
     *
     * @since 0.1.0
     */
    route: Route;
    /**
     * The requests params extracted from the route parser (i.e. just the URL segement params)
     *
     * @since 0.1.0
     */
    params: any;
    /**
     * baseUrl of the app, needed to simulate Express request api
     *
     * @since 0.1.0
     */
    baseUrl: string;
    /**
     * Url of the request -> can be modified
     *
     * @since 0.1.0
     */
    url: string;
    /**
     * The incoming request body, buffered and parsed by the serializer (if applicable)
     *
     * @since 0.1.0
     */
    body: any;
    /**
     * The name of the original action that was invoked for this request. Used when an error occurs
     * so the error action can see the original action that was invoked.
     */
    _originalAction: string;
    constructor(incomingMessage: http.IncomingMessage);
    /**
     * The HTTP method of the request, lowercased
     *
     * @since 0.1.0
     */
    readonly method: Method;
    /**
     * The host name specified in the request (not including port number)
     *
     * @since 0.1.0
     */
    readonly hostname: string;
    /**
     * The IP address of the incoming request's connection
     *
     * @since 0.1.0
     */
    readonly ip: string;
    /**
     * The original path, without any modifications by middleware
     * or the router.
     *
     * TODO: when denali supports mounting on a subpath, this should
     *       be updated to reflect the full path, and the path variable
     *       in this class will be the path *after* the subpath
     *
     * @since 0.1.0
     */
    readonly originalUrl: string;
    /**
     * The path extracted from the URL of the incoming request.
     *
     * @since 0.1.0
     */
    readonly path: string;
    /**
     * The protocol extracted from the URL of the incoming request
     *
     * @since 0.1.0
     */
    readonly protocol: string;
    /**
     * The query params supplied with the request URL, parsed into an object
     *
     * @since 0.1.0
     */
    readonly query: {
        [key: string]: string;
    };
    /**
     * Whether or not this request was made over https
     *
     * @since 0.1.0
     */
    readonly secure: boolean;
    /**
     * Whether or not this request was made by a client library
     *
     * @since 0.1.0
     */
    readonly xhr: boolean;
    /**
     * The headers of the incoming request
     *
     * @since 0.1.0
     */
    readonly headers: {
        [key: string]: string;
    };
    /**
     * An array of subdomains of the incoming request:
     *     // GET foo.bar.example.com
     *     request.subdomains  // [ 'foo', 'bar' ]
     *
     * @since 0.1.0
     */
    readonly subdomains: string[];
    readonly httpVersion: string;
    readonly rawHeaders: string[];
    readonly rawTrailers: string[];
    readonly socket: Socket;
    readonly statusCode: number;
    readonly statusMessage: string;
    readonly trailers: {
        [key: string]: string;
    };
    readonly connection: Socket;
    /**
     * Returns the best match for content types, or false if no match is possible. See the docs for
     * the `accepts` module on npm for more details.
     *
     * @since 0.1.0
     */
    accepts(serverAcceptedTypes: string[]): string | boolean;
    /**
     * Gets the value of a header.
     *
     * @since 0.1.0
     */
    get(header: string): string;
    /**
     * Checks if the request matches the supplied content types. See type-is module for details.
     *
     * @since 0.1.0
     */
    is(...types: string[]): string | boolean;
    addListener(eventName: any, listener: Function): Request;
    emit(eventName: any, ...args: any[]): boolean;
    eventNames(): any[];
    getMaxListeners(): number;
    listenerCount(eventName: any): number;
    listeners(eventName: any): Function[];
    on(eventName: any, listener: Function): Request;
    once(eventName: any, listener: Function): Request;
    prependListener(eventName: any, listener: Function): Request;
    prependOnceListener(eventName: any, listener: Function): Request;
    removeAllListeners(eventName?: any): Request;
    removeListener(eventName: any, listener: Function): Request;
    setMaxListeners(n: number): Request;
    isPaused(): boolean;
    pause(): Request;
    pipe(destination: Writable, options?: Object): Writable;
    read(size?: number): string | Buffer | null;
    resume(): Request;
    setEncoding(encoding: string): Request;
    unpipe(destination?: Writable): http.IncomingMessage;
    unshift(chunk: Buffer | string | any): void;
    wrap(stream: Readable): Readable;
    destroy(error: Error): void;
    setTimeout(msecs: number, callback: Function): Request;
}
