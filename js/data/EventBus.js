export class EventBus {

    constructor() {
        this.events = {};
    }

    on(event, callback) {
        (this.events[event] ??= []).push(callback);
    }

    emit(event, data = null) {
        console.log("emit", event, data);
        (this.events[event] || []).forEach(cb => {
            console.log(event, "lsten by", cb);
            cb(data)
        });
    }

}