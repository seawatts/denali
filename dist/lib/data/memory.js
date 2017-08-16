"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const orm_adapter_1 = require("./orm-adapter");
const assert = require("assert");
const inflection_1 = require("inflection");
let guid = 0;
/**
 * An in-memory ORM adapter for getting started quickly, testing, and debugging. Should **not** be
 * used for production data.
 *
 * @package data
 */
class MemoryAdapter extends orm_adapter_1.default {
    constructor() {
        super(...arguments);
        /**
         * An in-memory cache of records. Top level objects are collections of records by type, indexed
         * by record id.
         */
        this._cache = {};
    }
    /**
     * Get the collection of records for a given type, indexed by record id. If the collection doesn't
     * exist yet, create it and return the empty collection.
     */
    _cacheFor(type) {
        if (!this._cache[type]) {
            this._cache[type] = {};
        }
        return this._cache[type];
    }
    // tslint:disable:completed-docs
    find(type, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this._cacheFor(type)[id] || null;
        });
    }
    queryOne(type, query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return lodash_1.find(this._cacheFor(type), query) || null;
        });
    }
    all(type) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return lodash_1.values(this._cacheFor(type));
        });
    }
    query(type, query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return lodash_1.filter(this._cacheFor(type), query);
        });
    }
    buildRecord(type, data = {}) {
        this._cacheFor(type);
        return data;
    }
    idFor(model) {
        return model.record.id;
    }
    setId(model, value) {
        let collection = this._cacheFor(model.type);
        delete collection[model.record.id];
        model.record.id = value;
        collection[value] = model.record;
    }
    getAttribute(model, property) {
        return model.record[property];
    }
    setAttribute(model, property, value) {
        model.record[property] = value;
        return true;
    }
    deleteAttribute(model, property) {
        model.record[property] = null;
        return true;
    }
    getRelated(model, relationship, descriptor, query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relatedCollection = this._cacheFor(descriptor.type);
            if (descriptor.mode === 'hasMany') {
                let related = lodash_1.filter(relatedCollection, (relatedRecord) => {
                    let relatedIds = model.record[`${inflection_1.singularize(relationship)}_ids`];
                    return relatedIds && relatedIds.includes(relatedRecord.id);
                });
                if (query) {
                    related = lodash_1.filter(related, query);
                }
                return related;
            }
            return this.queryOne(descriptor.type, { id: model.record[`${relationship}_id`] });
        });
    }
    setRelated(model, relationship, descriptor, relatedModels) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(relatedModels)) {
                assert(descriptor.mode === 'hasMany', `You tried to set ${relationship} to an array of related records, but it is a hasOne relationship`);
                model.record[`${inflection_1.singularize(relationship)}_ids`] = lodash_1.map(relatedModels, 'record.id');
            }
            else {
                model.record[`${relationship}_id`] = relatedModels.record.id;
            }
        });
    }
    addRelated(model, relationship, descriptor, relatedModel) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relatedIds = model.record[`${inflection_1.singularize(relationship)}_ids`];
            if (!relatedIds) {
                relatedIds = model.record[`${inflection_1.singularize(relationship)}_ids`] = [];
            }
            relatedIds.push(relatedModel.id);
        });
    }
    removeRelated(model, relationship, descriptor, relatedModel) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            lodash_1.remove(model.record[`${inflection_1.singularize(relationship)}_ids`], (id) => id === relatedModel.id);
        });
    }
    saveRecord(model) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let collection = this._cacheFor(model.type);
            if (model.record.id == null) {
                guid += 1;
                model.record.id = guid;
            }
            collection[model.record.id] = model.record;
            return model.record;
        });
    }
    deleteRecord(model) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let collection = this._cacheFor(model.type);
            delete collection[model.record.id];
        });
    }
}
exports.default = MemoryAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvZGF0YS9tZW1vcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBTWdCO0FBQ2hCLCtDQUF1QztBQUd2QyxpQ0FBaUM7QUFDakMsMkNBQXlDO0FBRXpDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztBQUViOzs7OztHQUtHO0FBQ0gsbUJBQW1DLFNBQVEscUJBQVU7SUFBckQ7O1FBR0U7OztXQUdHO1FBQ0gsV0FBTSxHQUE4QyxFQUFFLENBQUM7SUFnSHpELENBQUM7SUE5R0M7OztPQUdHO0lBQ0gsU0FBUyxDQUFDLElBQVk7UUFDcEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELGdDQUFnQztJQUUxQixJQUFJLENBQUMsSUFBWSxFQUFFLEVBQVU7O1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUMxQyxDQUFDO0tBQUE7SUFFSyxRQUFRLENBQUMsSUFBWSxFQUFFLEtBQVU7O1lBQ3JDLE1BQU0sQ0FBQyxhQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDbkQsQ0FBQztLQUFBO0lBRUssR0FBRyxDQUFDLElBQVk7O1lBQ3BCLE1BQU0sQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENB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QUFDO1lBQzVDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksSUFBSSxDQUFDLENBQUM7Z0JBQ1YsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLENBQUM7WUFDRCxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3RCLENBQUM7S0FBQTtJQUVLLFlBQVksQ0FBQyxLQUFZOztZQUM3QixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7S0FBQTtDQUVGO0FBdkhELGdDQXVIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGZpbmQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICByZW1vdmUsXG4gIHZhbHVlc1xufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IE9STUFkYXB0ZXIgZnJvbSAnLi9vcm0tYWRhcHRlcic7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQgeyBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yIH0gZnJvbSAnLi9kZXNjcmlwdG9ycyc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IHNpbmd1bGFyaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5cbmxldCBndWlkID0gMDtcblxuLyoqXG4gKiBBbiBpbi1tZW1vcnkgT1JNIGFkYXB0ZXIgZm9yIGdldHRpbmcgc3RhcnRlZCBxdWlja2x5LCB0ZXN0aW5nLCBhbmQgZGVidWdnaW5nLiBTaG91bGQgKipub3QqKiBiZVxuICogdXNlZCBmb3IgcHJvZHVjdGlvbiBkYXRhLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVtb3J5QWRhcHRlciBleHRlbmRzIE9STUFkYXB0ZXIge1xuXG5cbiAgLyoqXG4gICAqIEFuIGluLW1lbW9yeSBjYWNoZSBvZiByZWNvcmRzLiBUb3AgbGV2ZWwgb2JqZWN0cyBhcmUgY29sbGVjdGlvbnMgb2YgcmVjb3JkcyBieSB0eXBlLCBpbmRleGVkXG4gICAqIGJ5IHJlY29yZCBpZC5cbiAgICovXG4gIF9jYWNoZTogeyBbdHlwZTogc3RyaW5nXTogeyBbaWQ6IG51bWJlcl06IGFueSB9IH0gPSB7fTtcblxuICAvKipcbiAgICogR2V0IHRoZSBjb2xsZWN0aW9uIG9mIHJlY29yZHMgZm9yIGEgZ2l2ZW4gdHlwZSwgaW5kZXhlZCBieSByZWNvcmQgaWQuIElmIHRoZSBjb2xsZWN0aW9uIGRvZXNuJ3RcbiAgICogZXhpc3QgeWV0LCBjcmVhdGUgaXQgYW5kIHJldHVybiB0aGUgZW1wdHkgY29sbGVjdGlvbi5cbiAgICovXG4gIF9jYWNoZUZvcih0eXBlOiBzdHJpbmcpOiB7IFtpZDogbnVtYmVyXTogYW55IH0ge1xuICAgIGlmICghdGhpcy5fY2FjaGVbdHlwZV0pIHtcbiAgICAgIHRoaXMuX2NhY2hlW3R5cGVdID0ge307XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jYWNoZVt0eXBlXTtcbiAgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzXG5cbiAgYXN5bmMgZmluZCh0eXBlOiBzdHJpbmcsIGlkOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9jYWNoZUZvcih0eXBlKVtpZF0gfHwgbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHF1ZXJ5T25lKHR5cGU6IHN0cmluZywgcXVlcnk6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGZpbmQodGhpcy5fY2FjaGVGb3IodHlwZSksIHF1ZXJ5KSB8fCBudWxsO1xuICB9XG5cbiAgYXN5bmMgYWxsKHR5cGU6IHN0cmluZyk6IFByb21pc2U8YW55W10+IHtcbiAgICByZXR1cm4gdmFsdWVzKHRoaXMuX2NhY2hlRm9yKHR5cGUpKTtcbiAgfVxuXG4gIGFzeW5jIHF1ZXJ5KHR5cGU6IHN0cmluZywgcXVlcnk6IGFueSk6IFByb21pc2U8YW55W10+IHtcbiAgICByZXR1cm4gZmlsdGVyKHRoaXMuX2NhY2hlRm9yKHR5cGUpLCBxdWVyeSk7XG4gIH1cblxuICBidWlsZFJlY29yZCh0eXBlOiBzdHJpbmcsIGRhdGE6IGFueSA9IHt9KTogYW55IHtcbiAgICB0aGlzLl9jYWNoZUZvcih0eXBlKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIGlkRm9yKG1vZGVsOiBNb2RlbCkge1xuICAgIHJldHVybiBtb2RlbC5yZWNvcmQuaWQ7XG4gIH1cblxuICBzZXRJZChtb2RlbDogTW9kZWwsIHZhbHVlOiBudW1iZXIpIHtcbiAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMuX2NhY2hlRm9yKG1vZGVsLnR5cGUpO1xuICAgIGRlbGV0ZSBjb2xsZWN0aW9uW21vZGVsLnJlY29yZC5pZF07XG4gICAgbW9kZWwucmVjb3JkLmlkID0gdmFsdWU7XG4gICAgY29sbGVjdGlvblt2YWx1ZV0gPSBtb2RlbC5yZWNvcmQ7XG4gIH1cblxuICBnZXRBdHRyaWJ1dGUobW9kZWw6IE1vZGVsLCBwcm9wZXJ0eTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gbW9kZWwucmVjb3JkW3Byb3BlcnR5XTtcbiAgfVxuXG4gIHNldEF0dHJpYnV0ZShtb2RlbDogTW9kZWwsIHByb3BlcnR5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB0cnVlIHtcbiAgICBtb2RlbC5yZWNvcmRbcHJvcGVydHldID0gdmFsdWU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBkZWxldGVBdHRyaWJ1dGUobW9kZWw6IE1vZGVsLCBwcm9wZXJ0eTogc3RyaW5nKTogdHJ1ZSB7XG4gICAgbW9kZWwucmVjb3JkW3Byb3BlcnR5XSA9IG51bGw7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhc3luYyBnZXRSZWxhdGVkKG1vZGVsOiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHF1ZXJ5OiBhbnkpOiBQcm9taXNlPGFueXxhbnlbXT4ge1xuICAgIGxldCByZWxhdGVkQ29sbGVjdGlvbiA9IHRoaXMuX2NhY2hlRm9yKGRlc2NyaXB0b3IudHlwZSk7XG4gICAgaWYgKGRlc2NyaXB0b3IubW9kZSA9PT0gJ2hhc01hbnknKSB7XG4gICAgICBsZXQgcmVsYXRlZCA9IGZpbHRlcihyZWxhdGVkQ29sbGVjdGlvbiwgKHJlbGF0ZWRSZWNvcmQ6IGFueSkgPT4ge1xuICAgICAgICBsZXQgcmVsYXRlZElkcyA9IG1vZGVsLnJlY29yZFtgJHsgc2luZ3VsYXJpemUocmVsYXRpb25zaGlwKSB9X2lkc2BdO1xuICAgICAgICByZXR1cm4gcmVsYXRlZElkcyAmJiByZWxhdGVkSWRzLmluY2x1ZGVzKHJlbGF0ZWRSZWNvcmQuaWQpO1xuICAgICAgfSk7XG4gICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgcmVsYXRlZCA9IGZpbHRlcihyZWxhdGVkLCBxdWVyeSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVsYXRlZDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucXVlcnlPbmUoZGVzY3JpcHRvci50eXBlLCB7IGlkOiBtb2RlbC5yZWNvcmRbYCR7IHJlbGF0aW9uc2hpcCB9X2lkYF0gfSk7XG4gIH1cblxuICBhc3luYyBzZXRSZWxhdGVkKG1vZGVsOiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbHM6IE1vZGVsfE1vZGVsW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZWxhdGVkTW9kZWxzKSkge1xuICAgICAgYXNzZXJ0KGRlc2NyaXB0b3IubW9kZSA9PT0gJ2hhc01hbnknLCBgWW91IHRyaWVkIHRvIHNldCAkeyByZWxhdGlvbnNoaXAgfSB0byBhbiBhcnJheSBvZiByZWxhdGVkIHJlY29yZHMsIGJ1dCBpdCBpcyBhIGhhc09uZSByZWxhdGlvbnNoaXBgKTtcbiAgICAgIG1vZGVsLnJlY29yZFtgJHsgc2luZ3VsYXJpemUocmVsYXRpb25zaGlwKSB9X2lkc2BdID0gbWFwKHJlbGF0ZWRNb2RlbHMsICdyZWNvcmQuaWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbW9kZWwucmVjb3JkW2AkeyByZWxhdGlvbnNoaXAgfV9pZGBdID0gcmVsYXRlZE1vZGVscy5yZWNvcmQuaWQ7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgYWRkUmVsYXRlZChtb2RlbDogTW9kZWwsIHJlbGF0aW9uc2hpcDogc3RyaW5nLCBkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCByZWxhdGVkTW9kZWw6IE1vZGVsKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHJlbGF0ZWRJZHMgPSBtb2RlbC5yZWNvcmRbYCR7IHNpbmd1bGFyaXplKHJlbGF0aW9uc2hpcCkgfV9pZHNgXTtcbiAgICBpZiAoIXJlbGF0ZWRJZHMpIHtcbiAgICAgIHJlbGF0ZWRJZHMgPSBtb2RlbC5yZWNvcmRbYCR7IHNpbmd1bGFyaXplKHJlbGF0aW9uc2hpcCkgfV9pZHNgXSA9IFtdO1xuICAgIH1cbiAgICByZWxhdGVkSWRzLnB1c2gocmVsYXRlZE1vZGVsLmlkKTtcbiAgfVxuXG4gIGFzeW5jIHJlbW92ZVJlbGF0ZWQobW9kZWw6IE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcmVsYXRlZE1vZGVsOiBNb2RlbCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJlbW92ZShtb2RlbC5yZWNvcmRbYCR7IHNpbmd1bGFyaXplKHJlbGF0aW9uc2hpcCkgfV9pZHNgXSwgKGlkKSA9PiBpZCA9PT0gcmVsYXRlZE1vZGVsLmlkKTtcbiAgfVxuXG4gIGFzeW5jIHNhdmVSZWNvcmQobW9kZWw6IE1vZGVsKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLl9jYWNoZUZvcihtb2RlbC50eXBlKTtcbiAgICBpZiAobW9kZWwucmVjb3JkLmlkID09IG51bGwpIHtcbiAgICAgIGd1aWQgKz0gMTtcbiAgICAgIG1vZGVsLnJlY29yZC5pZCA9IGd1aWQ7XG4gICAgfVxuICAgIGNvbGxlY3Rpb25bbW9kZWwucmVjb3JkLmlkXSA9IG1vZGVsLnJlY29yZDtcbiAgICByZXR1cm4gbW9kZWwucmVjb3JkO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlUmVjb3JkKG1vZGVsOiBNb2RlbCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy5fY2FjaGVGb3IobW9kZWwudHlwZSk7XG4gICAgZGVsZXRlIGNvbGxlY3Rpb25bbW9kZWwucmVjb3JkLmlkXTtcbiAgfVxuXG59XG4iXX0=