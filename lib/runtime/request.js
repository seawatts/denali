"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const accepts = require("accepts");
const typeis = require("type-is");
const url = require("url");
const uuid = require("uuid");
/**
 * The Request class represents an incoming HTTP request (specifically, Node's IncomingMessage).
 * It's designed with an express-compatible interface to allow interop with existing express
 * middleware.
 *
 * @package runtime
 * @since 0.1.0
 */
class Request {
    constructor(incomingMessage) {
        /**
         * baseUrl of the app, needed to simulate Express request api
         *
         * @since 0.1.0
         */
        this.baseUrl = '/';
        this._incomingMessage = incomingMessage;
        this.parsedUrl = url.parse(incomingMessage.url, true);
        this.url = this.parsedUrl.pathname;
        this.id = uuid.v4();
    }
    /**
     * The incoming request body, buffered and parsed by the serializer (if applicable)
     *
     * @since 0.1.0
     */
    get body() {
        return this._incomingMessage.body;
    }
    set body(value) {
        this._incomingMessage.body = value;
    }
    /**
     * The HTTP method of the request, lowercased
     *
     * @since 0.1.0
     */
    get method() {
        return this._incomingMessage.method.toLowerCase();
    }
    /**
     * The host name specified in the request (not including port number)
     *
     * @since 0.1.0
     */
    get hostname() {
        let host = this.get('host');
        return (host || '').split(':')[0];
    }
    /**
     * The IP address of the incoming request's connection
     *
     * @since 0.1.0
     */
    get ip() {
        return this._incomingMessage.socket.remoteAddress;
    }
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
    get originalUrl() {
        return this.parsedUrl.pathname;
    }
    /**
     * The path extracted from the URL of the incoming request.
     *
     * @since 0.1.0
     */
    get path() {
        return this.parsedUrl.pathname;
    }
    /**
     * The protocol extracted from the URL of the incoming request
     *
     * @since 0.1.0
     */
    get protocol() {
        return this.parsedUrl.protocol.toLowerCase();
    }
    /**
     * The query params supplied with the request URL, parsed into an object
     *
     * @since 0.1.0
     */
    get query() {
        return this.parsedUrl.query;
    }
    /**
     * Whether or not this request was made over https
     *
     * @since 0.1.0
     */
    get secure() {
        return this.protocol === 'https:';
    }
    /**
     * Whether or not this request was made by a client library
     *
     * @since 0.1.0
     */
    get xhr() {
        return this.get('x-requested-with') === 'XMLHttpRequest';
    }
    /**
     * The headers of the incoming request
     *
     * @since 0.1.0
     */
    get headers() {
        return this._incomingMessage.headers;
    }
    /**
     * An array of subdomains of the incoming request:
     *     // GET foo.bar.example.com
     *     request.subdomains  // [ 'foo', 'bar' ]
     *
     * @since 0.1.0
     */
    get subdomains() {
        // Drop the tld and root domain name
        return lodash_1.dropRight(this.hostname.split('.'), 2);
    }
    /*
     * Additional public properties of the IncomingMessage object
     */
    get httpVersion() {
        return this._incomingMessage.httpVersion;
    }
    get rawHeaders() {
        return this._incomingMessage.rawHeaders;
    }
    get rawTrailers() {
        return this._incomingMessage.rawTrailers;
    }
    get socket() {
        return this._incomingMessage.socket;
    }
    get statusCode() {
        return this._incomingMessage.statusCode;
    }
    get statusMessage() {
        return this._incomingMessage.statusMessage;
    }
    get trailers() {
        return this._incomingMessage.trailers;
    }
    get connection() {
        return this._incomingMessage.connection;
    }
    /**
     * Returns the best match for content types, or false if no match is possible. See the docs for
     * the `accepts` module on npm for more details.
     *
     * @since 0.1.0
     */
    accepts(serverAcceptedTypes) {
        return accepts(this._incomingMessage).type(serverAcceptedTypes);
    }
    /**
     * Gets the value of a header.
     *
     * @since 0.1.0
     */
    get(header) {
        return this._incomingMessage.headers[header.toLowerCase()];
    }
    /**
     * Checks if the request matches the supplied content types. See type-is module for details.
     *
     * @since 0.1.0
     */
    is(...types) {
        return typeis(this._incomingMessage, types);
    }
    /*
     * Below are methods from the IncomingMessage class, which includes the public methods
     * of the Readable & EventEmitter interfaces as well
     */
    /*
     * EventEmitter methods
     */
    addListener(eventName, listener) {
        this._incomingMessage.addListener(eventName, listener);
        return this;
    }
    emit(eventName, ...args) {
        return this._incomingMessage.emit(eventName, ...args);
    }
    eventNames() {
        return this._incomingMessage.eventNames();
    }
    getMaxListeners() {
        return this._incomingMessage.getMaxListeners();
    }
    listenerCount(eventName) {
        return this._incomingMessage.listenerCount(eventName);
    }
    listeners(eventName) {
        return this._incomingMessage.listeners(eventName);
    }
    on(eventName, listener) {
        this._incomingMessage.on(eventName, listener);
        return this;
    }
    once(eventName, listener) {
        this._incomingMessage.once(eventName, listener);
        return this;
    }
    prependListener(eventName, listener) {
        this._incomingMessage.prependListener(eventName, listener);
        return this;
    }
    prependOnceListener(eventName, listener) {
        this._incomingMessage.prependOnceListener(eventName, listener);
        return this;
    }
    removeAllListeners(eventName) {
        this._incomingMessage.removeAllListeners(eventName);
        return this;
    }
    removeListener(eventName, listener) {
        this._incomingMessage.removeListener(eventName, listener);
        return this;
    }
    setMaxListeners(n) {
        this._incomingMessage.setMaxListeners(n);
        return this;
    }
    /*
     * Readable methods
     */
    isPaused() {
        return this._incomingMessage.isPaused();
    }
    pause() {
        this._incomingMessage.pause();
        return this;
    }
    pipe(destination, options) {
        return this._incomingMessage.pipe(destination, options);
    }
    read(size) {
        return this._incomingMessage.read(size);
    }
    resume() {
        this._incomingMessage.resume();
        return this;
    }
    setEncoding(encoding) {
        this._incomingMessage.setEncoding(encoding);
        return this;
    }
    unpipe(destination) {
        return this._incomingMessage.unpipe(destination);
    }
    unshift(chunk) {
        return this._incomingMessage.unshift(chunk);
    }
    wrap(stream) {
        return this._incomingMessage.wrap(stream);
    }
    /*
     * IncomingMessage methods
     */
    destroy(error) {
        return this._incomingMessage.destroy(error);
    }
    setTimeout(msecs, callback) {
        this._incomingMessage.setTimeout(msecs, callback);
        return this;
    }
}
exports.default = Request;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3J1bnRpbWUvcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUVnQjtBQUNoQixtQ0FBbUM7QUFDbkMsa0NBQWtDO0FBQ2xDLDJCQUEyQjtBQUUzQiw2QkFBNkI7QUFhN0I7Ozs7Ozs7R0FPRztBQUNIO0lBaUVFLFlBQVksZUFBcUM7UUFoQ2pEOzs7O1dBSUc7UUFDSCxZQUFPLEdBQUcsR0FBRyxDQUFDO1FBNEJaLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUNuQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBdkJEOzs7O09BSUc7SUFDSCxJQUFJLElBQUk7UUFDTixNQUFNLENBQU8sSUFBSSxDQUFDLGdCQUFpQixDQUFDLElBQUksQ0FBQztJQUMzQyxDQUFDO0lBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSztRQUNOLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0lBQzVDLENBQUM7SUFlRDs7OztPQUlHO0lBQ0gsSUFBSSxNQUFNO1FBQ1IsTUFBTSxDQUFTLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDNUQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLFFBQVE7UUFDVixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVCLE1B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Q0Y7QUFoWEQsMEJBZ1hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgZHJvcFJpZ2h0XG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBhY2NlcHRzIGZyb20gJ2FjY2VwdHMnO1xuaW1wb3J0ICogYXMgdHlwZWlzIGZyb20gJ3R5cGUtaXMnO1xuaW1wb3J0ICogYXMgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgdXVpZCBmcm9tICd1dWlkJztcbmltcG9ydCB7IFNvY2tldCB9IGZyb20gJ25ldCc7XG5pbXBvcnQgeyBSZWFkYWJsZSwgV3JpdGFibGUgfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IFJvdXRlIGZyb20gJy4vcm91dGUnO1xuXG4vKipcbiAqIEF2YWlsYWJsZSBIVFRQIG1ldGhvZHMgKGxvd2VyY2FzZWQpXG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCB0eXBlIE1ldGhvZCA9ICdnZXQnIHwgJ3Bvc3QnIHwgJ3B1dCcgfCAncGF0Y2gnIHwgJ2RlbGV0ZScgfCAnaGVhZCcgfCAnb3B0aW9ucyc7XG5cbi8qKlxuICogVGhlIFJlcXVlc3QgY2xhc3MgcmVwcmVzZW50cyBhbiBpbmNvbWluZyBIVFRQIHJlcXVlc3QgKHNwZWNpZmljYWxseSwgTm9kZSdzIEluY29taW5nTWVzc2FnZSkuXG4gKiBJdCdzIGRlc2lnbmVkIHdpdGggYW4gZXhwcmVzcy1jb21wYXRpYmxlIGludGVyZmFjZSB0byBhbGxvdyBpbnRlcm9wIHdpdGggZXhpc3RpbmcgZXhwcmVzc1xuICogbWlkZGxld2FyZS5cbiAqXG4gKiBAcGFja2FnZSBydW50aW1lXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVxdWVzdCB7XG5cbiAgLyoqXG4gICAqIEEgVVVJRCBnZW5lcmF0ZWQgdW5xaXVlIHRvIHRoaXMgcmVxdWVzdC4gVXNlZnVsIGZvciB0cmFjaW5nIGEgcmVxdWVzdCB0aHJvdWdoIHRoZSBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBpZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgcGFyc2VkIFVSTCBvZiB0aGUgSW5jb21pbmdNZXNzYWdlXG4gICAqL1xuICBwcml2YXRlIHBhcnNlZFVybDogdXJsLlVybDtcblxuICAvKipcbiAgICogVGhlIG9yaWdpbmFsIEluY29taW5nTWVzc2FnZSBmcm9tIHRoZSBIVFRQIGxpYnJhcnkuXG4gICAqL1xuICBwcml2YXRlIF9pbmNvbWluZ01lc3NhZ2U6IGh0dHAuSW5jb21pbmdNZXNzYWdlO1xuXG4gIC8qKlxuICAgKiBUaGUgcm91dGUgcGFyc2VyIHJvdXRlIHRoYXQgd2FzIG1hdGNoZWRcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICByb3V0ZTogUm91dGU7XG5cbiAgLyoqXG4gICAqIFRoZSByZXF1ZXN0cyBwYXJhbXMgZXh0cmFjdGVkIGZyb20gdGhlIHJvdXRlIHBhcnNlciAoaS5lLiBqdXN0IHRoZSBVUkwgc2VnZW1lbnQgcGFyYW1zKVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHBhcmFtczogYW55O1xuXG4gIC8qKlxuICAgKiBiYXNlVXJsIG9mIHRoZSBhcHAsIG5lZWRlZCB0byBzaW11bGF0ZSBFeHByZXNzIHJlcXVlc3QgYXBpXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYmFzZVVybCA9ICcvJztcblxuICAvKipcbiAgICogVXJsIG9mIHRoZSByZXF1ZXN0IC0+IGNhbiBiZSBtb2RpZmllZFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHVybDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5jb21pbmcgcmVxdWVzdCBib2R5LCBidWZmZXJlZCBhbmQgcGFyc2VkIGJ5IHRoZSBzZXJpYWxpemVyIChpZiBhcHBsaWNhYmxlKVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBib2R5KCk6IGFueSB7XG4gICAgcmV0dXJuICg8YW55PnRoaXMuX2luY29taW5nTWVzc2FnZSkuYm9keTtcbiAgfVxuICBzZXQgYm9keSh2YWx1ZSkge1xuICAgICg8YW55PnRoaXMuX2luY29taW5nTWVzc2FnZSkuYm9keSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBvcmlnaW5hbCBhY3Rpb24gdGhhdCB3YXMgaW52b2tlZCBmb3IgdGhpcyByZXF1ZXN0LiBVc2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJzXG4gICAqIHNvIHRoZSBlcnJvciBhY3Rpb24gY2FuIHNlZSB0aGUgb3JpZ2luYWwgYWN0aW9uIHRoYXQgd2FzIGludm9rZWQuXG4gICAqL1xuICBfb3JpZ2luYWxBY3Rpb246IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihpbmNvbWluZ01lc3NhZ2U6IGh0dHAuSW5jb21pbmdNZXNzYWdlKSB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlID0gaW5jb21pbmdNZXNzYWdlO1xuICAgIHRoaXMucGFyc2VkVXJsID0gdXJsLnBhcnNlKGluY29taW5nTWVzc2FnZS51cmwsIHRydWUpO1xuICAgIHRoaXMudXJsID0gdGhpcy5wYXJzZWRVcmwucGF0aG5hbWU7XG4gICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgSFRUUCBtZXRob2Qgb2YgdGhlIHJlcXVlc3QsIGxvd2VyY2FzZWRcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQgbWV0aG9kKCk6IE1ldGhvZCB7XG4gICAgcmV0dXJuIDxNZXRob2Q+dGhpcy5faW5jb21pbmdNZXNzYWdlLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBob3N0IG5hbWUgc3BlY2lmaWVkIGluIHRoZSByZXF1ZXN0IChub3QgaW5jbHVkaW5nIHBvcnQgbnVtYmVyKVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBob3N0bmFtZSgpOiBzdHJpbmcge1xuICAgIGxldCBob3N0ID0gdGhpcy5nZXQoJ2hvc3QnKTtcbiAgICByZXR1cm4gKGhvc3QgfHwgJycpLnNwbGl0KCc6JylbMF07XG4gIH1cblxuICAvKipcbiAgICogVGhlIElQIGFkZHJlc3Mgb2YgdGhlIGluY29taW5nIHJlcXVlc3QncyBjb25uZWN0aW9uXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IGlwKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5zb2NrZXQucmVtb3RlQWRkcmVzcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgb3JpZ2luYWwgcGF0aCwgd2l0aG91dCBhbnkgbW9kaWZpY2F0aW9ucyBieSBtaWRkbGV3YXJlXG4gICAqIG9yIHRoZSByb3V0ZXIuXG4gICAqXG4gICAqIFRPRE86IHdoZW4gZGVuYWxpIHN1cHBvcnRzIG1vdW50aW5nIG9uIGEgc3VicGF0aCwgdGhpcyBzaG91bGRcbiAgICogICAgICAgYmUgdXBkYXRlZCB0byByZWZsZWN0IHRoZSBmdWxsIHBhdGgsIGFuZCB0aGUgcGF0aCB2YXJpYWJsZVxuICAgKiAgICAgICBpbiB0aGlzIGNsYXNzIHdpbGwgYmUgdGhlIHBhdGggKmFmdGVyKiB0aGUgc3VicGF0aFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBvcmlnaW5hbFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnBhcnNlZFVybC5wYXRobmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGF0aCBleHRyYWN0ZWQgZnJvbSB0aGUgVVJMIG9mIHRoZSBpbmNvbWluZyByZXF1ZXN0LlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBwYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VkVXJsLnBhdGhuYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwcm90b2NvbCBleHRyYWN0ZWQgZnJvbSB0aGUgVVJMIG9mIHRoZSBpbmNvbWluZyByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IHByb3RvY29sKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VkVXJsLnByb3RvY29sLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHF1ZXJ5IHBhcmFtcyBzdXBwbGllZCB3aXRoIHRoZSByZXF1ZXN0IFVSTCwgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IHF1ZXJ5KCk6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIHJldHVybiB0aGlzLnBhcnNlZFVybC5xdWVyeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0aGlzIHJlcXVlc3Qgd2FzIG1hZGUgb3ZlciBodHRwc1xuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBzZWN1cmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvdG9jb2wgPT09ICdodHRwczonO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoaXMgcmVxdWVzdCB3YXMgbWFkZSBieSBhIGNsaWVudCBsaWJyYXJ5XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IHhocigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3gtcmVxdWVzdGVkLXdpdGgnKSA9PT0gJ1hNTEh0dHBSZXF1ZXN0JztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaGVhZGVycyBvZiB0aGUgaW5jb21pbmcgcmVxdWVzdFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBoZWFkZXJzKCk6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuaGVhZGVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBzdWJkb21haW5zIG9mIHRoZSBpbmNvbWluZyByZXF1ZXN0OlxuICAgKiAgICAgLy8gR0VUIGZvby5iYXIuZXhhbXBsZS5jb21cbiAgICogICAgIHJlcXVlc3Quc3ViZG9tYWlucyAgLy8gWyAnZm9vJywgJ2JhcicgXVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBzdWJkb21haW5zKCk6IHN0cmluZ1tdIHtcbiAgICAvLyBEcm9wIHRoZSB0bGQgYW5kIHJvb3QgZG9tYWluIG5hbWVcbiAgICByZXR1cm4gZHJvcFJpZ2h0KHRoaXMuaG9zdG5hbWUuc3BsaXQoJy4nKSwgMik7XG4gIH1cblxuICAvKlxuICAgKiBBZGRpdGlvbmFsIHB1YmxpYyBwcm9wZXJ0aWVzIG9mIHRoZSBJbmNvbWluZ01lc3NhZ2Ugb2JqZWN0XG4gICAqL1xuXG4gIGdldCBodHRwVmVyc2lvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuaHR0cFZlcnNpb247XG4gIH1cblxuICBnZXQgcmF3SGVhZGVycygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5yYXdIZWFkZXJzO1xuICB9XG5cbiAgZ2V0IHJhd1RyYWlsZXJzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnJhd1RyYWlsZXJzO1xuICB9XG5cbiAgZ2V0IHNvY2tldCgpOiBTb2NrZXQge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uuc29ja2V0O1xuICB9XG5cbiAgZ2V0IHN0YXR1c0NvZGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnN0YXR1c0NvZGU7XG4gIH1cblxuICBnZXQgc3RhdHVzTWVzc2FnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uuc3RhdHVzTWVzc2FnZTtcbiAgfVxuXG4gIGdldCB0cmFpbGVycygpOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnRyYWlsZXJzO1xuICB9XG5cbiAgZ2V0IGNvbm5lY3Rpb24oKTogU29ja2V0IHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLmNvbm5lY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYmVzdCBtYXRjaCBmb3IgY29udGVudCB0eXBlcywgb3IgZmFsc2UgaWYgbm8gbWF0Y2ggaXMgcG9zc2libGUuIFNlZSB0aGUgZG9jcyBmb3JcbiAgICogdGhlIGBhY2NlcHRzYCBtb2R1bGUgb24gbnBtIGZvciBtb3JlIGRldGFpbHMuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYWNjZXB0cyhzZXJ2ZXJBY2NlcHRlZFR5cGVzOiBzdHJpbmdbXSk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgIHJldHVybiBhY2NlcHRzKHRoaXMuX2luY29taW5nTWVzc2FnZSkudHlwZShzZXJ2ZXJBY2NlcHRlZFR5cGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIGhlYWRlci5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQoaGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuaGVhZGVyc1toZWFkZXIudG9Mb3dlckNhc2UoKV07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSByZXF1ZXN0IG1hdGNoZXMgdGhlIHN1cHBsaWVkIGNvbnRlbnQgdHlwZXMuIFNlZSB0eXBlLWlzIG1vZHVsZSBmb3IgZGV0YWlscy5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBpcyguLi50eXBlczogc3RyaW5nW10pOiBzdHJpbmcgfCBib29sZWFuIHtcbiAgICByZXR1cm4gPHN0cmluZ3xib29sZWFuPnR5cGVpcyh0aGlzLl9pbmNvbWluZ01lc3NhZ2UsIHR5cGVzKTtcbiAgfVxuXG4gIC8qXG4gICAqIEJlbG93IGFyZSBtZXRob2RzIGZyb20gdGhlIEluY29taW5nTWVzc2FnZSBjbGFzcywgd2hpY2ggaW5jbHVkZXMgdGhlIHB1YmxpYyBtZXRob2RzXG4gICAqIG9mIHRoZSBSZWFkYWJsZSAmIEV2ZW50RW1pdHRlciBpbnRlcmZhY2VzIGFzIHdlbGxcbiAgICovXG5cbiAgLypcbiAgICogRXZlbnRFbWl0dGVyIG1ldGhvZHNcbiAgICovXG5cbiAgYWRkTGlzdGVuZXIoZXZlbnROYW1lOiBhbnksIGxpc3RlbmVyOiBGdW5jdGlvbik6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5hZGRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGVtaXQoZXZlbnROYW1lOiBhbnksIC4uLmFyZ3M6IGFueVtdKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5lbWl0KGV2ZW50TmFtZSwgLi4uYXJncyk7XG4gIH1cblxuICBldmVudE5hbWVzKCk6IGFueVtdIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLmV2ZW50TmFtZXMoKTtcbiAgfVxuXG4gIGdldE1heExpc3RlbmVycygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuZ2V0TWF4TGlzdGVuZXJzKCk7XG4gIH1cblxuICBsaXN0ZW5lckNvdW50KGV2ZW50TmFtZTogYW55KTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLmxpc3RlbmVyQ291bnQoZXZlbnROYW1lKTtcbiAgfVxuXG4gIGxpc3RlbmVycyhldmVudE5hbWU6IGFueSk6IEZ1bmN0aW9uW10ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UubGlzdGVuZXJzKGV2ZW50TmFtZSk7XG4gIH1cblxuICBvbihldmVudE5hbWU6IGFueSwgbGlzdGVuZXI6IEZ1bmN0aW9uKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLm9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgb25jZShldmVudE5hbWU6IGFueSwgbGlzdGVuZXI6IEZ1bmN0aW9uKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLm9uY2UoZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcmVwZW5kTGlzdGVuZXIoZXZlbnROYW1lOiBhbnksIGxpc3RlbmVyOiBGdW5jdGlvbik6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5wcmVwZW5kTGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcmVwZW5kT25jZUxpc3RlbmVyKGV2ZW50TmFtZTogYW55LCBsaXN0ZW5lcjogRnVuY3Rpb24pOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2UucHJlcGVuZE9uY2VMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbW92ZUFsbExpc3RlbmVycyhldmVudE5hbWU/OiBhbnkpOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2UucmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50TmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZW1vdmVMaXN0ZW5lcihldmVudE5hbWU6IGFueSwgbGlzdGVuZXI6IEZ1bmN0aW9uKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLnJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0TWF4TGlzdGVuZXJzKG46IG51bWJlcik6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5zZXRNYXhMaXN0ZW5lcnMobik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKlxuICAgKiBSZWFkYWJsZSBtZXRob2RzXG4gICAqL1xuXG4gIGlzUGF1c2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuaXNQYXVzZWQoKTtcbiAgfVxuXG4gIHBhdXNlKCk6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5wYXVzZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcGlwZShkZXN0aW5hdGlvbjogV3JpdGFibGUsIG9wdGlvbnM/OiBPYmplY3QpOiBXcml0YWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5waXBlKGRlc3RpbmF0aW9uLCBvcHRpb25zKTtcbiAgfVxuXG4gIHJlYWQoc2l6ZT86IG51bWJlcik6IHN0cmluZyB8IEJ1ZmZlciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UucmVhZChzaXplKTtcbiAgfVxuXG4gIHJlc3VtZSgpOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2UucmVzdW1lKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRFbmNvZGluZyhlbmNvZGluZzogc3RyaW5nKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLnNldEVuY29kaW5nKGVuY29kaW5nKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHVucGlwZShkZXN0aW5hdGlvbj86IFdyaXRhYmxlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS51bnBpcGUoZGVzdGluYXRpb24pO1xuICB9XG5cbiAgdW5zaGlmdChjaHVuazogQnVmZmVyIHwgc3RyaW5nIHwgYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS51bnNoaWZ0KGNodW5rKTtcbiAgfVxuXG4gIHdyYXAoc3RyZWFtOiBSZWFkYWJsZSkge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uud3JhcChzdHJlYW0pO1xuICB9XG5cbiAgLypcbiAgICogSW5jb21pbmdNZXNzYWdlIG1ldGhvZHNcbiAgICovXG5cbiAgZGVzdHJveShlcnJvcjogRXJyb3IpIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLmRlc3Ryb3koZXJyb3IpO1xuICB9XG5cbiAgc2V0VGltZW91dChtc2VjczogbnVtYmVyLCBjYWxsYmFjazogRnVuY3Rpb24pOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uuc2V0VGltZW91dChtc2VjcywgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iXX0=