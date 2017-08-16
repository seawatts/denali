"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
const lodash_1 = require("lodash");
/**
 * The Instrumentation class is a low level class for instrumenting your app's code. It allows you
 * to listen to framework level profiling events, as well as creating and firing your own such
 * events.
 *
 * For example, if you wanted to instrument how long a particular action was taking:
 *
 *     import { Instrumentation, Action } from 'denali';
 *     export default class MyAction extends Action {
 *       respond() {
 *         let Post = this.modelFor('post');
 *         return Instrumentation.instrument('post lookup', { currentUser: this.user.id }, () => {
 *           Post.find({ user: this.user });
 *         });
 *       }
 *     }
 *
 * @package metal
 */
class InstrumentationEvent {
    constructor(eventName, data) {
        this.eventName = eventName;
        this.data = data;
        this.startTime = process.hrtime();
    }
    /**
     * Subscribe to be notified when a particular instrumentation block completes.
     */
    static subscribe(eventName, callback) {
        this._emitter.on(eventName, callback);
    }
    /**
     * Unsubscribe from being notified when a particular instrumentation block completes.
     */
    static unsubscribe(eventName, callback) {
        this._emitter.removeListener(eventName, callback);
    }
    /**
     * Run the supplied function, timing how long it takes to complete. If the function returns a
     * promise, the timer waits until that promise resolves. Returns a promise that resolves with the
     * return value of the supplied function. Fires an event with the given event name and event data
     * (the function result is provided as well).
     */
    static instrument(eventName, data) {
        return new InstrumentationEvent(eventName, data);
    }
    /**
     * Emit an InstrumentationEvent to subscribers
     */
    static emit(eventName, event) {
        this._emitter.emit(eventName, event);
    }
    /**
     * Finish this event. Records the duration, and fires an event to any subscribers. Any data
     * provided here is merged with any previously provided data.
     */
    finish(data) {
        this.duration = process.hrtime(this.startTime)[1];
        this.data = lodash_1.merge({}, this.data, data);
        InstrumentationEvent.emit(this.eventName, this);
    }
}
/**
 * The internal event emitter used for notifications
 */
InstrumentationEvent._emitter = new EventEmitter();
exports.default = InstrumentationEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWF3YXR0cy9zcmMvZ2l0aHViLmNvbS9zZWF3YXR0cy9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvbWV0YWwvaW5zdHJ1bWVudGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXVDO0FBQ3ZDLG1DQUErQjtBQUUvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0g7SUEwREUsWUFBWSxTQUFpQixFQUFFLElBQVM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQXZERDs7T0FFRztJQUNILE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBaUIsRUFBRSxRQUErQztRQUNqRixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFpQixFQUFFLFFBQWdEO1FBQ3BGLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQWlCLEVBQUUsSUFBUztRQUM1QyxNQUFNLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFpQixFQUFFLEtBQTJCO1FBQ3hELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBNEJEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxJQUFVO1FBQ2YsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsSUFBSSxHQUFHLGNBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsRCxDQUFDOztBQXRFRDs7R0FFRztBQUNZLDZCQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUwvQyx1Q0EwRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSAnbG9kYXNoJztcblxuLyoqXG4gKiBUaGUgSW5zdHJ1bWVudGF0aW9uIGNsYXNzIGlzIGEgbG93IGxldmVsIGNsYXNzIGZvciBpbnN0cnVtZW50aW5nIHlvdXIgYXBwJ3MgY29kZS4gSXQgYWxsb3dzIHlvdVxuICogdG8gbGlzdGVuIHRvIGZyYW1ld29yayBsZXZlbCBwcm9maWxpbmcgZXZlbnRzLCBhcyB3ZWxsIGFzIGNyZWF0aW5nIGFuZCBmaXJpbmcgeW91ciBvd24gc3VjaFxuICogZXZlbnRzLlxuICpcbiAqIEZvciBleGFtcGxlLCBpZiB5b3Ugd2FudGVkIHRvIGluc3RydW1lbnQgaG93IGxvbmcgYSBwYXJ0aWN1bGFyIGFjdGlvbiB3YXMgdGFraW5nOlxuICpcbiAqICAgICBpbXBvcnQgeyBJbnN0cnVtZW50YXRpb24sIEFjdGlvbiB9IGZyb20gJ2RlbmFsaSc7XG4gKiAgICAgZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICogICAgICAgcmVzcG9uZCgpIHtcbiAqICAgICAgICAgbGV0IFBvc3QgPSB0aGlzLm1vZGVsRm9yKCdwb3N0Jyk7XG4gKiAgICAgICAgIHJldHVybiBJbnN0cnVtZW50YXRpb24uaW5zdHJ1bWVudCgncG9zdCBsb29rdXAnLCB7IGN1cnJlbnRVc2VyOiB0aGlzLnVzZXIuaWQgfSwgKCkgPT4ge1xuICogICAgICAgICAgIFBvc3QuZmluZCh7IHVzZXI6IHRoaXMudXNlciB9KTtcbiAqICAgICAgICAgfSk7XG4gKiAgICAgICB9XG4gKiAgICAgfVxuICpcbiAqIEBwYWNrYWdlIG1ldGFsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluc3RydW1lbnRhdGlvbkV2ZW50IHtcblxuICAvKipcbiAgICogVGhlIGludGVybmFsIGV2ZW50IGVtaXR0ZXIgdXNlZCBmb3Igbm90aWZpY2F0aW9uc1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBiZSBub3RpZmllZCB3aGVuIGEgcGFydGljdWxhciBpbnN0cnVtZW50YXRpb24gYmxvY2sgY29tcGxldGVzLlxuICAgKi9cbiAgc3RhdGljIHN1YnNjcmliZShldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogSW5zdHJ1bWVudGF0aW9uRXZlbnQpID0+IHZvaWQpIHtcbiAgICB0aGlzLl9lbWl0dGVyLm9uKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuc3Vic2NyaWJlIGZyb20gYmVpbmcgbm90aWZpZWQgd2hlbiBhIHBhcnRpY3VsYXIgaW5zdHJ1bWVudGF0aW9uIGJsb2NrIGNvbXBsZXRlcy5cbiAgICovXG4gIHN0YXRpYyB1bnN1YnNjcmliZShldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s/OiAoZXZlbnQ6IEluc3RydW1lbnRhdGlvbkV2ZW50KSA9PiB2b2lkKSB7XG4gICAgdGhpcy5fZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGhlIHN1cHBsaWVkIGZ1bmN0aW9uLCB0aW1pbmcgaG93IGxvbmcgaXQgdGFrZXMgdG8gY29tcGxldGUuIElmIHRoZSBmdW5jdGlvbiByZXR1cm5zIGFcbiAgICogcHJvbWlzZSwgdGhlIHRpbWVyIHdhaXRzIHVudGlsIHRoYXQgcHJvbWlzZSByZXNvbHZlcy4gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZVxuICAgKiByZXR1cm4gdmFsdWUgb2YgdGhlIHN1cHBsaWVkIGZ1bmN0aW9uLiBGaXJlcyBhbiBldmVudCB3aXRoIHRoZSBnaXZlbiBldmVudCBuYW1lIGFuZCBldmVudCBkYXRhXG4gICAqICh0aGUgZnVuY3Rpb24gcmVzdWx0IGlzIHByb3ZpZGVkIGFzIHdlbGwpLlxuICAgKi9cbiAgc3RhdGljIGluc3RydW1lbnQoZXZlbnROYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IEluc3RydW1lbnRhdGlvbkV2ZW50IHtcbiAgICByZXR1cm4gbmV3IEluc3RydW1lbnRhdGlvbkV2ZW50KGV2ZW50TmFtZSwgZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogRW1pdCBhbiBJbnN0cnVtZW50YXRpb25FdmVudCB0byBzdWJzY3JpYmVyc1xuICAgKi9cbiAgc3RhdGljIGVtaXQoZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBJbnN0cnVtZW50YXRpb25FdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChldmVudE5hbWUsIGV2ZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbmFtZSBvZiB0aGlzIGluc3RydW1lbnRhdGlvbiBldmVuXG4gICAqL1xuICBldmVudE5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGR1cmF0aW9uIG9mIHRoZSBpbnN0cnVtZW50YXRpb24gZXZlbnQgKGNhbGN1bGF0ZWQgYWZ0ZXIgY2FsbGluZyBgLmZpbmlzaCgpYClcbiAgICovXG4gIGR1cmF0aW9uOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEFkZGl0aW9uYWwgZGF0YSBzdXBwbGllZCBmb3IgdGhpcyBldmVudCwgZWl0aGVyIGF0IHRoZSBzdGFydCBvciBmaW5pc2ggb2YgdGhlIGV2ZW50LlxuICAgKi9cbiAgZGF0YTogYW55O1xuXG4gIC8qKlxuICAgKiBIaWdoIHJlc29sdXRpb24gc3RhcnQgdGltZSBvZiB0aGlzIGV2ZW50XG4gICAqL1xuICBwcml2YXRlIHN0YXJ0VGltZTogWyBudW1iZXIsIG51bWJlciBdO1xuXG4gIGNvbnN0cnVjdG9yKGV2ZW50TmFtZTogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuc3RhcnRUaW1lID0gcHJvY2Vzcy5ocnRpbWUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5pc2ggdGhpcyBldmVudC4gUmVjb3JkcyB0aGUgZHVyYXRpb24sIGFuZCBmaXJlcyBhbiBldmVudCB0byBhbnkgc3Vic2NyaWJlcnMuIEFueSBkYXRhXG4gICAqIHByb3ZpZGVkIGhlcmUgaXMgbWVyZ2VkIHdpdGggYW55IHByZXZpb3VzbHkgcHJvdmlkZWQgZGF0YS5cbiAgICovXG4gIGZpbmlzaChkYXRhPzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5kdXJhdGlvbiA9IHByb2Nlc3MuaHJ0aW1lKHRoaXMuc3RhcnRUaW1lKVsxXTtcbiAgICB0aGlzLmRhdGEgPSBtZXJnZSh7fSwgdGhpcy5kYXRhLCBkYXRhKTtcbiAgICBJbnN0cnVtZW50YXRpb25FdmVudC5lbWl0KHRoaXMuZXZlbnROYW1lLCB0aGlzKTtcbiAgfVxuXG59XG4iXX0=