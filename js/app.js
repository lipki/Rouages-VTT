import { DicePool } from "./DicePool.js";
import { DrawerManager } from "./DrawerManager.js";
import { PortraitManager } from "./PortraitManager.js";
import { SkillManager } from "./SkillManager.js";
import { StorageInputManager, StatsManager } from "./StorageInputManager.js";

window.addEventListener("pageshow", () => new App());

class App {

    constructor() {
        const bus = new EventBus();
        this.store = new DataStore(bus);

        console.log(playerLocal);

        this.dicePool = new DicePool(bus);
        this.skillManager = new SkillManager(this.store, bus);
        this.statsManager = new StatsManager(this.store, bus, "#stats-list");

        new PortraitManager(this.store);
        new StorageInputManager(this.store, "#zone-identity input");
        new StorageInputManager(this.store, "textarea");
        new StorageInputManager(this.store, "#stats-grid input");

        new DrawerManager(this.store, "#zone-capa");
        new DrawerManager(this.store, "#zone-contacts");

        document.querySelector(".page-corner").addEventListener("click", 
            () => document.querySelector(".sheet").classList.toggle("flipped"));
    }

}

class EventBus {

    constructor() {
        this.events = {};
    }

    on(event, callback) {
        (this.events[event] ??= []).push(callback);
    }

    emit(event, data = null) {
        (this.events[event] || []).forEach(cb => cb(data));
    }

}

class DataStore {

    constructor(bus) {
        this.bus = bus;
    }

    get(key) {
        return localStorage.getItem(key);
    }

    set(key, value) {

        console.log(key, value);

        localStorage.setItem(key, value);

        this.bus.emit("data:changed", {
            key,
            value
        });

        // futur websocket
        // this.ws.send(...)
    }

    remove(key) {
        localStorage.removeItem(key);

        this.bus.emit("data:changed", {
            key,
            value:null
        });
    }

}