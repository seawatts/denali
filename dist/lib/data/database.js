"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const createDebug = require("debug");
const service_1 = require("../runtime/service");
const util = require("util");
const debug = createDebug('denali:database-service');
class DatabaseService extends service_1.default {
    find(modelType, id, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${modelType} find: ${id}`);
            assert(id != null, `You must pass an id to Model.find(id)`);
            let adapter = this.lookupAdapter(modelType);
            let result = yield adapter.find(modelType, id, options);
            if (!result) {
                return null;
            }
            let ModelFactory = this.container.factoryFor(`model:${modelType}`);
            return ModelFactory.create(result);
        });
    }
    queryOne(modelType, query, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${modelType} queryOne: ${util.inspect(query)}`);
            assert(query != null, `You must pass a query to Model.queryOne(conditions)`);
            let adapter = this.lookupAdapter(modelType);
            let record = yield adapter.queryOne(modelType, query, options);
            if (record) {
                let ModelFactory = this.container.factoryFor(`model:${modelType}`);
                return ModelFactory.create(record);
            }
            return null;
        });
    }
    query(modelType, query, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            assert(query != null, `You must pass a query to Model.query(conditions)`);
            let adapter = this.lookupAdapter(modelType);
            let result = yield adapter.query(modelType, query, options);
            debug(`${modelType} query: found ${result.length} records: ${util.inspect(query)}`);
            let ModelFactory = this.container.factoryFor(`model:${modelType}`);
            return result.map((record) => {
                return ModelFactory.create(record);
            });
        });
    }
    all(modelType, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let adapter = this.lookupAdapter(modelType);
            let result = yield adapter.all(modelType, options);
            let ModelFactory = this.container.factoryFor(`model:${modelType}`);
            debug(`${modelType} all: found ${result.length} records`);
            return result.map((record) => {
                return ModelFactory.create(record);
            });
        });
    }
    create(modelType, data, options) {
        return this.container.factoryFor(`model:${modelType}`).create(data, options);
    }
    lookupAdapter(modelType) {
        return this.container.lookup(`orm-adapter:${modelType}`, { loose: true }) || this.container.lookup('orm-adapter:application');
    }
}
exports.default = DatabaseService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9kYXRhL2RhdGFiYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpQztBQUNqQyxxQ0FBcUM7QUFDckMsZ0RBQXlDO0FBR3pDLDZCQUE2QjtBQUU3QixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUVyRCxxQkFBcUMsU0FBUSxpQkFBTztJQUU1QyxJQUFJLENBQUMsU0FBaUIsRUFBRSxFQUFPLEVBQUUsT0FBYTs7WUFDbEQsS0FBSyxDQUFDLEdBQUksU0FBVSxVQUFXLEVBQUcsRUFBRSxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLEVBQUUsSUFBSSxJQUFJLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztZQUM1RCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVDLElBQUksTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUNELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFRLFNBQVUsU0FBVSxFQUFFLENBQUMsQ0FBQztZQUM1RSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQUE7SUFFSyxRQUFRLENBQUMsU0FBaUIsRUFBRSxLQUFVLEVBQUUsT0FBYTs7WUFDekQsS0FBSyxDQUFDLEdBQUksU0FBVSxjQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFFLEVBQUUsQ0FB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bXBvcnQgKiBhcyBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgU2VydmljZSBmcm9tICcuLi9ydW50aW1lL3NlcnZpY2UnO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IE9STUFkYXB0ZXIgZnJvbSAnLi9vcm0tYWRhcHRlcic7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZW5hbGk6ZGF0YWJhc2Utc2VydmljZScpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRhYmFzZVNlcnZpY2UgZXh0ZW5kcyBTZXJ2aWNlIHtcblxuICBhc3luYyBmaW5kKG1vZGVsVHlwZTogc3RyaW5nLCBpZDogYW55LCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbHxudWxsPiB7XG4gICAgZGVidWcoYCR7IG1vZGVsVHlwZSB9IGZpbmQ6ICR7IGlkIH1gKTtcbiAgICBhc3NlcnQoaWQgIT0gbnVsbCwgYFlvdSBtdXN0IHBhc3MgYW4gaWQgdG8gTW9kZWwuZmluZChpZClgKTtcbiAgICBsZXQgYWRhcHRlciA9IHRoaXMubG9va3VwQWRhcHRlcihtb2RlbFR5cGUpO1xuICAgIGxldCByZXN1bHQgPSBhd2FpdCBhZGFwdGVyLmZpbmQobW9kZWxUeXBlLCBpZCwgb3B0aW9ucyk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgTW9kZWxGYWN0b3J5ID0gdGhpcy5jb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oYG1vZGVsOiR7IG1vZGVsVHlwZSB9YCk7XG4gICAgcmV0dXJuIE1vZGVsRmFjdG9yeS5jcmVhdGUocmVzdWx0KTtcbiAgfVxuXG4gIGFzeW5jIHF1ZXJ5T25lKG1vZGVsVHlwZTogc3RyaW5nLCBxdWVyeTogYW55LCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbHxudWxsPiB7XG4gICAgZGVidWcoYCR7IG1vZGVsVHlwZSB9IHF1ZXJ5T25lOiAkeyB1dGlsLmluc3BlY3QocXVlcnkpIH1gKTtcbiAgICBhc3NlcnQocXVlcnkgIT0gbnVsbCwgYFlvdSBtdXN0IHBhc3MgYSBxdWVyeSB0byBNb2RlbC5xdWVyeU9uZShjb25kaXRpb25zKWApO1xuICAgIGxldCBhZGFwdGVyID0gdGhpcy5sb29rdXBBZGFwdGVyKG1vZGVsVHlwZSk7XG4gICAgbGV0IHJlY29yZCA9IGF3YWl0IGFkYXB0ZXIucXVlcnlPbmUobW9kZWxUeXBlLCBxdWVyeSwgb3B0aW9ucyk7XG4gICAgaWYgKHJlY29yZCkge1xuICAgICAgbGV0IE1vZGVsRmFjdG9yeSA9IHRoaXMuY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KGBtb2RlbDokeyBtb2RlbFR5cGUgfWApO1xuICAgICAgcmV0dXJuIE1vZGVsRmFjdG9yeS5jcmVhdGUocmVjb3JkKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhc3luYyBxdWVyeShtb2RlbFR5cGU6IHN0cmluZywgcXVlcnk6IGFueSwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWxbXT4ge1xuICAgIGFzc2VydChxdWVyeSAhPSBudWxsLCBgWW91IG11c3QgcGFzcyBhIHF1ZXJ5IHRvIE1vZGVsLnF1ZXJ5KGNvbmRpdGlvbnMpYCk7XG4gICAgbGV0IGFkYXB0ZXIgPSB0aGlzLmxvb2t1cEFkYXB0ZXIobW9kZWxUeXBlKTtcbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgYWRhcHRlci5xdWVyeShtb2RlbFR5cGUsIHF1ZXJ5LCBvcHRpb25zKTtcbiAgICBkZWJ1ZyhgJHsgbW9kZWxUeXBlIH0gcXVlcnk6IGZvdW5kICR7cmVzdWx0Lmxlbmd0aH0gcmVjb3JkczogJHsgdXRpbC5pbnNwZWN0KHF1ZXJ5KSB9YCk7XG4gICAgbGV0IE1vZGVsRmFjdG9yeSA9IHRoaXMuY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KGBtb2RlbDokeyBtb2RlbFR5cGUgfWApO1xuICAgIHJldHVybiByZXN1bHQubWFwKChyZWNvcmQpID0+IHtcbiAgICAgIHJldHVybiBNb2RlbEZhY3RvcnkuY3JlYXRlKHJlY29yZCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBhbGwobW9kZWxUeXBlOiBzdHJpbmcsIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPE1vZGVsW10+IHtcbiAgICBsZXQgYWRhcHRlciA9IHRoaXMubG9va3VwQWRhcHRlcihtb2RlbFR5cGUpO1xuICAgIGxldCByZXN1bHQgPSBhd2FpdCBhZGFwdGVyLmFsbChtb2RlbFR5cGUsIG9wdGlvbnMpO1xuICAgIGxldCBNb2RlbEZhY3RvcnkgPSB0aGlzLmNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPihgbW9kZWw6JHsgbW9kZWxUeXBlIH1gKTtcbiAgICBkZWJ1ZyhgJHsgbW9kZWxUeXBlIH0gYWxsOiBmb3VuZCAke3Jlc3VsdC5sZW5ndGh9IHJlY29yZHNgKTtcbiAgICByZXR1cm4gcmVzdWx0Lm1hcCgocmVjb3JkKSA9PiB7XG4gICAgICByZXR1cm4gTW9kZWxGYWN0b3J5LmNyZWF0ZShyZWNvcmQpO1xuICAgIH0pO1xuICB9XG5cbiAgY3JlYXRlKG1vZGVsVHlwZTogc3RyaW5nLCBkYXRhOiBhbnksIG9wdGlvbnM/OiBhbnkpOiBNb2RlbCB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KGBtb2RlbDokeyBtb2RlbFR5cGUgfWApLmNyZWF0ZShkYXRhLCBvcHRpb25zKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBsb29rdXBBZGFwdGVyKG1vZGVsVHlwZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmxvb2t1cDxPUk1BZGFwdGVyPihgb3JtLWFkYXB0ZXI6JHsgbW9kZWxUeXBlIH1gLCB7IGxvb3NlOiB0cnVlIH0pIHx8IHRoaXMuY29udGFpbmVyLmxvb2t1cDxPUk1BZGFwdGVyPignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nKTtcbiAgfVxuXG59XG4iXX0=