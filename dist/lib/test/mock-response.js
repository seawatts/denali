"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const http_1 = require("http");
const lodash_1 = require("lodash");
/**
 * A mock response used to simluate the server response to mock requests during tests. You shouldn't
 * need to instantiate these directly - instead, use an AppAcceptance test.
 *
 * @package test
 */
class MockResponse extends stream_1.Transform {
    constructor(finish) {
        super();
        // Mock internals of ServerResponse
        // tslint:disable:completed-docs member-access
        this.statusCode = 200;
        this.statusMessage = http_1.STATUS_CODES[200];
        this._headers = {};
        this._buffers = [];
        if (typeof finish === 'function') {
            this.on('finish', finish);
        }
    }
    _transform(chunk, encoding, next) {
        this.push(chunk);
        this._buffers.push(chunk);
        next();
    }
    setHeader(name, value) {
        this._headers[name.toLowerCase()] = value;
    }
    getHeader(name) {
        return this._headers[name.toLowerCase()];
    }
    removeHeader(name) {
        delete this._headers[name.toLowerCase()];
    }
    _implicitHeader() {
        this.writeHead(this.statusCode);
    }
    writeHead(statusCode, reason, headers) {
        if (typeof reason !== 'string') {
            headers = reason;
            reason = null;
        }
        this.statusCode = statusCode;
        this.statusMessage = reason || http_1.STATUS_CODES[statusCode] || 'unknown';
        if (headers) {
            lodash_1.forEach(headers, (value, name) => {
                this.setHeader(name, value);
            });
        }
    }
    _getString() {
        return Buffer.concat(this._buffers).toString();
    }
    _getJSON() {
        return JSON.parse(this._getString());
    }
    writeContinue() {
        throw new Error('MockResponse.writeContinue() is not implemented');
    }
    setTimeout() {
        throw new Error('MockResponse.setTimeout() is not implemented');
    }
    addTrailers() {
        throw new Error('MockResponse.addTrailers() is not implemented');
    }
    get headersSent() {
        throw new Error('MockResponse.headersSent is not implemented');
    }
    get sendDate() {
        throw new Error('MockResponse.sendDate is not implemented');
    }
}
exports.default = MockResponse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay1yZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2Vhd2F0dHMvc3JjL2dpdGh1Yi5jb20vc2Vhd2F0dHMvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3Rlc3QvbW9jay1yZXNwb25zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFtQztBQUNuQywrQkFBb0M7QUFDcEMsbUNBQWlDO0FBRWpDOzs7OztHQUtHO0FBQ0gsa0JBQWtDLFNBQVEsa0JBQVM7SUFTakQsWUFBWSxNQUFtQjtRQUM3QixLQUFLLEVBQUUsQ0FBQztRQVJWLG1DQUFtQztRQUNuQyw4Q0FBOEM7UUFDOUMsZUFBVSxHQUFHLEdBQUcsQ0FBQztRQUNqQixrQkFBYSxHQUFHLG1CQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsYUFBUSxHQUE4QixFQUFFLENBQUM7UUFDekMsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUl0QixFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzVCLENBQUM7SUFDSCxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQWEsRUFBRSxRQUFnQixFQUFFLElBQWdCO1FBQzFELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsSUFBSSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBRUQsU0FBUyxDQUFDLElBQVksRUFBRSxLQUFhO1FBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzVDLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBWTtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsWUFBWSxDQUFDLElBQVk7UUFDdkIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELFNBQVMsQ0FBQyxVQUFrQixFQUFFLE1BQWUsRUFBRSxPQUFtQztRQUNoRixFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDakIsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLElBQUksbUJBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxTQUFTLENBQUM7UUFDckUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNaLGdCQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUk7Z0JBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRCxVQUFVO1FBQ1IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2pELENBQUM7SUFFRCxRQUFRO1FBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELGFBQWE7UUFDWCxNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVELFVBQVU7UUFDUixNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELFdBQVc7UUFDVCxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELElBQUksV0FBVztRQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FFRjtBQWhGRCwrQkFnRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgU1RBVFVTX0NPREVTIH0gZnJvbSAnaHR0cCc7XG5pbXBvcnQgeyBmb3JFYWNoIH0gZnJvbSAnbG9kYXNoJztcblxuLyoqXG4gKiBBIG1vY2sgcmVzcG9uc2UgdXNlZCB0byBzaW1sdWF0ZSB0aGUgc2VydmVyIHJlc3BvbnNlIHRvIG1vY2sgcmVxdWVzdHMgZHVyaW5nIHRlc3RzLiBZb3Ugc2hvdWxkbid0XG4gKiBuZWVkIHRvIGluc3RhbnRpYXRlIHRoZXNlIGRpcmVjdGx5IC0gaW5zdGVhZCwgdXNlIGFuIEFwcEFjY2VwdGFuY2UgdGVzdC5cbiAqXG4gKiBAcGFja2FnZSB0ZXN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vY2tSZXNwb25zZSBleHRlbmRzIFRyYW5zZm9ybSB7XG5cbiAgLy8gTW9jayBpbnRlcm5hbHMgb2YgU2VydmVyUmVzcG9uc2VcbiAgLy8gdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgbWVtYmVyLWFjY2Vzc1xuICBzdGF0dXNDb2RlID0gMjAwO1xuICBzdGF0dXNNZXNzYWdlID0gU1RBVFVTX0NPREVTWzIwMF07XG4gIF9oZWFkZXJzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG4gIF9idWZmZXJzOiBCdWZmZXJbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKGZpbmlzaD86ICgpID0+IHZvaWQpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmICh0eXBlb2YgZmluaXNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLm9uKCdmaW5pc2gnLCBmaW5pc2gpO1xuICAgIH1cbiAgfVxuXG4gIF90cmFuc2Zvcm0oY2h1bms6IEJ1ZmZlciwgZW5jb2Rpbmc6IHN0cmluZywgbmV4dDogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMucHVzaChjaHVuayk7XG4gICAgdGhpcy5fYnVmZmVycy5wdXNoKGNodW5rKTtcbiAgICBuZXh0KCk7XG4gIH1cblxuICBzZXRIZWFkZXIobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5faGVhZGVyc1tuYW1lLnRvTG93ZXJDYXNlKCldID0gdmFsdWU7XG4gIH1cblxuICBnZXRIZWFkZXIobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5faGVhZGVyc1tuYW1lLnRvTG93ZXJDYXNlKCldO1xuICB9XG5cbiAgcmVtb3ZlSGVhZGVyKG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGRlbGV0ZSB0aGlzLl9oZWFkZXJzW25hbWUudG9Mb3dlckNhc2UoKV07XG4gIH1cblxuICBfaW1wbGljaXRIZWFkZXIoKTogdm9pZCB7XG4gICAgdGhpcy53cml0ZUhlYWQodGhpcy5zdGF0dXNDb2RlKTtcbiAgfVxuXG4gIHdyaXRlSGVhZChzdGF0dXNDb2RlOiBudW1iZXIsIHJlYXNvbj86IHN0cmluZywgaGVhZGVycz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIHJlYXNvbiAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGhlYWRlcnMgPSByZWFzb247XG4gICAgICByZWFzb24gPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IHJlYXNvbiB8fCBTVEFUVVNfQ09ERVNbc3RhdHVzQ29kZV0gfHwgJ3Vua25vd24nO1xuICAgIGlmIChoZWFkZXJzKSB7XG4gICAgICBmb3JFYWNoKGhlYWRlcnMsICh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgICB0aGlzLnNldEhlYWRlcihuYW1lLCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0U3RyaW5nKCkge1xuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KHRoaXMuX2J1ZmZlcnMpLnRvU3RyaW5nKCk7XG4gIH1cblxuICBfZ2V0SlNPTigpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLl9nZXRTdHJpbmcoKSk7XG4gIH1cblxuICB3cml0ZUNvbnRpbnVlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTW9ja1Jlc3BvbnNlLndyaXRlQ29udGludWUoKSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHNldFRpbWVvdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNb2NrUmVzcG9uc2Uuc2V0VGltZW91dCgpIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgYWRkVHJhaWxlcnMoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNb2NrUmVzcG9uc2UuYWRkVHJhaWxlcnMoKSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCBoZWFkZXJzU2VudCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01vY2tSZXNwb25zZS5oZWFkZXJzU2VudCBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCBzZW5kRGF0ZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01vY2tSZXNwb25zZS5zZW5kRGF0ZSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG59XG4iXX0=