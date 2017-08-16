"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const createDebug = require("debug");
const service_1 = require("../runtime/service");
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
            debug(`${modelType} queryOne: ${query}`);
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
            debug(`${modelType} query: ${query}`);
            assert(query != null, `You must pass a query to Model.query(conditions)`);
            let adapter = this.lookupAdapter(modelType);
            let result = yield adapter.query(modelType, query, options);
            let ModelFactory = this.container.factoryFor(`model:${modelType}`);
            return result.map((record) => {
                return ModelFactory.create(record);
            });
        });
    }
    all(modelType, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${modelType} all`);
            let adapter = this.lookupAdapter(modelType);
            let result = yield adapter.all(modelType, options);
            let ModelFactory = this.container.factoryFor(`model:${modelType}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NlYXdhdHRzL3NyYy9naXRodWIuY29tL3NlYXdhdHRzL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9kYXRhL2RhdGFiYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpQztBQUNqQyxxQ0FBcUM7QUFDckMsZ0RBQXlDO0FBSXpDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRXJELHFCQUFxQyxTQUFRLGlCQUFPO0lBRTVDLElBQUksQ0FBQyxTQUFpQixFQUFFLEVBQU8sRUFBRSxPQUFhOztZQUNsRCxLQUFLLENBQUMsR0FBSSxTQUFVLFVBQVcsRUFBRyxFQUFFLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsRUFBRSxJQUFJLElBQUksRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO1lBQzVELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUMsSUFBSSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDeEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBQ0QsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQVEsU0FBVSxTQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLENBQUM7S0FBQTtJQUVLLFFBQVEsQ0FBQyxTQUFpQixFQUFFLEtBQVUsRUFBRSxPQUFhOztZQUN6RCxLQUFLLENBQUMsR0FBSSxTQUFVLGNBQWUsS0FBTSxFQUFFLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRSxxREFBcUQsQ0FBQyxDQUFDO1lBQzdFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUMsSUFBSSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDWCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBUSxTQUFVLFNBQVUsRUFBRSxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRUssS0FBSyxDQUFDLFNBQWlCLEVBQUUsS0FBVSxFQUFFLE9BQWE7O1lBQ3RELEtBQUssQ0FBQyxHQUFJLFNBQVUsV0FBWSxLQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFLGtEQUFrRCxDQUFDLENBQUM7WUFDMUUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1QyxJQUFJLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM1RCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBUSxTQUFVLFNBQVUsRUFBRSxDQUFDLENBQUM7WUFDNUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNO2dCQUN2QixNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVLLEdBQUcsQ0FBQyxTQUFpQixFQUFFLE9BQWE7O1lBQ3hDLEtBQUssQ0FBQyxHQUFJLFNBQVUsTUFBTSxDQUFDLENBQUM7WUFDNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1QyxJQUFJLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25ELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFRLFNBQVUsU0FBVSxFQUFFLENBQUMsQ0FBQztZQUM1RSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU07Z0JBQ3ZCLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRUQsTUFBTSxDQUFDLFNBQWlCLEVBQUUsSUFBUyxFQUFFLE9BQWE7UUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFRLFNBQVUsU0FBVSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFUyxhQUFhLENBQUMsU0FBaUI7UUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFhLGVBQWdCLFNBQVUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQWEseUJBQXlCLENBQUMsQ0FBQztJQUMxSixDQUFDO0NBRUY7QUF2REQsa0NBdURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgKiBhcyBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgU2VydmljZSBmcm9tICcuLi9ydW50aW1lL3NlcnZpY2UnO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IE9STUFkYXB0ZXIgZnJvbSAnLi9vcm0tYWRhcHRlcic7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTpkYXRhYmFzZS1zZXJ2aWNlJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFiYXNlU2VydmljZSBleHRlbmRzIFNlcnZpY2Uge1xuXG4gIGFzeW5jIGZpbmQobW9kZWxUeXBlOiBzdHJpbmcsIGlkOiBhbnksIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPE1vZGVsfG51bGw+IHtcbiAgICBkZWJ1ZyhgJHsgbW9kZWxUeXBlIH0gZmluZDogJHsgaWQgfWApO1xuICAgIGFzc2VydChpZCAhPSBudWxsLCBgWW91IG11c3QgcGFzcyBhbiBpZCB0byBNb2RlbC5maW5kKGlkKWApO1xuICAgIGxldCBhZGFwdGVyID0gdGhpcy5sb29rdXBBZGFwdGVyKG1vZGVsVHlwZSk7XG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIuZmluZChtb2RlbFR5cGUsIGlkLCBvcHRpb25zKTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBNb2RlbEZhY3RvcnkgPSB0aGlzLmNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPihgbW9kZWw6JHsgbW9kZWxUeXBlIH1gKTtcbiAgICByZXR1cm4gTW9kZWxGYWN0b3J5LmNyZWF0ZShyZXN1bHQpO1xuICB9XG5cbiAgYXN5bmMgcXVlcnlPbmUobW9kZWxUeXBlOiBzdHJpbmcsIHF1ZXJ5OiBhbnksIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPE1vZGVsfG51bGw+IHtcbiAgICBkZWJ1ZyhgJHsgbW9kZWxUeXBlIH0gcXVlcnlPbmU6ICR7IHF1ZXJ5IH1gKTtcbiAgICBhc3NlcnQocXVlcnkgIT0gbnVsbCwgYFlvdSBtdXN0IHBhc3MgYSBxdWVyeSB0byBNb2RlbC5xdWVyeU9uZShjb25kaXRpb25zKWApO1xuICAgIGxldCBhZGFwdGVyID0gdGhpcy5sb29rdXBBZGFwdGVyKG1vZGVsVHlwZSk7XG4gICAgbGV0IHJlY29yZCA9IGF3YWl0IGFkYXB0ZXIucXVlcnlPbmUobW9kZWxUeXBlLCBxdWVyeSwgb3B0aW9ucyk7XG4gICAgaWYgKHJlY29yZCkge1xuICAgICAgbGV0IE1vZGVsRmFjdG9yeSA9IHRoaXMuY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KGBtb2RlbDokeyBtb2RlbFR5cGUgfWApO1xuICAgICAgcmV0dXJuIE1vZGVsRmFjdG9yeS5jcmVhdGUocmVjb3JkKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhc3luYyBxdWVyeShtb2RlbFR5cGU6IHN0cmluZywgcXVlcnk6IGFueSwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWxbXT4ge1xuICAgIGRlYnVnKGAkeyBtb2RlbFR5cGUgfSBxdWVyeTogJHsgcXVlcnkgfWApO1xuICAgIGFzc2VydChxdWVyeSAhPSBudWxsLCBgWW91IG11c3QgcGFzcyBhIHF1ZXJ5IHRvIE1vZGVsLnF1ZXJ5KGNvbmRpdGlvbnMpYCk7XG4gICAgbGV0IGFkYXB0ZXIgPSB0aGlzLmxvb2t1cEFkYXB0ZXIobW9kZWxUeXBlKTtcbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgYWRhcHRlci5xdWVyeShtb2RlbFR5cGUsIHF1ZXJ5LCBvcHRpb25zKTtcbiAgICBsZXQgTW9kZWxGYWN0b3J5ID0gdGhpcy5jb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oYG1vZGVsOiR7IG1vZGVsVHlwZSB9YCk7XG4gICAgcmV0dXJuIHJlc3VsdC5tYXAoKHJlY29yZCkgPT4ge1xuICAgICAgcmV0dXJuIE1vZGVsRmFjdG9yeS5jcmVhdGUocmVjb3JkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGFsbChtb2RlbFR5cGU6IHN0cmluZywgb3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWxbXT4ge1xuICAgIGRlYnVnKGAkeyBtb2RlbFR5cGUgfSBhbGxgKTtcbiAgICBsZXQgYWRhcHRlciA9IHRoaXMubG9va3VwQWRhcHRlcihtb2RlbFR5cGUpO1xuICAgIGxldCByZXN1bHQgPSBhd2FpdCBhZGFwdGVyLmFsbChtb2RlbFR5cGUsIG9wdGlvbnMpO1xuICAgIGxldCBNb2RlbEZhY3RvcnkgPSB0aGlzLmNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPihgbW9kZWw6JHsgbW9kZWxUeXBlIH1gKTtcbiAgICByZXR1cm4gcmVzdWx0Lm1hcCgocmVjb3JkKSA9PiB7XG4gICAgICByZXR1cm4gTW9kZWxGYWN0b3J5LmNyZWF0ZShyZWNvcmQpO1xuICAgIH0pO1xuICB9XG5cbiAgY3JlYXRlKG1vZGVsVHlwZTogc3RyaW5nLCBkYXRhOiBhbnksIG9wdGlvbnM/OiBhbnkpOiBNb2RlbCB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KGBtb2RlbDokeyBtb2RlbFR5cGUgfWApLmNyZWF0ZShkYXRhLCBvcHRpb25zKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBsb29rdXBBZGFwdGVyKG1vZGVsVHlwZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmxvb2t1cDxPUk1BZGFwdGVyPihgb3JtLWFkYXB0ZXI6JHsgbW9kZWxUeXBlIH1gLCB7IGxvb3NlOiB0cnVlIH0pIHx8IHRoaXMuY29udGFpbmVyLmxvb2t1cDxPUk1BZGFwdGVyPignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nKTtcbiAgfVxuXG59XG4iXX0=