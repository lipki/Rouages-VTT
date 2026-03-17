export class EventBus {

    constructor() {
        this.events = {};
    }

    on(event, callback) {
        (this.events[event] ??= []).push(callback);
    }

    emit(event, data = null) {
        console.log("emit", event, data);
        (this.events[event] || []).forEach(cb => cb(data));
    }

}