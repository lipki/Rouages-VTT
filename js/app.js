import { PlayerManager } from "./PlayerManager.js";
import { Sheet } from "./Sheet.js";

window.addEventListener("DOMContentLoaded", () => window.app = new App());

class App {

    constructor() {
        this.bus = new EventBus();

        new NetworkManager(this.bus, 'ws://localhost:8080');

        this.bus.on("network:welcome", ws => this.wsConnected( ws ));
    }

    wsConnected(wsid) {
        console.log("network:welcome", wsid);

        const PM = new PlayerManager(this.bus, wsid);
        new Sheet(this.bus, PM);
        new DataStore(this.bus, wsid);
        
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
        console.log("emit", event, data);
        (this.events[event] || []).forEach(cb => cb(data));
    }

}

class DataStore {

    constructor(bus, wsid) {
        this.wsid = wsid;
        bus.emit("player:new", {id:wsid, role:"player", sheet:this.getAll()});
        bus.on("player:updated", playerData => this.setAll(playerData));

        document.getElementById("clear").addEventListener("click", () => localStorage.clear());
    }

    getAll() {
        try {
            return JSON.parse(localStorage.getItem("rouageLocalPlayerv1.0") || "[]");
        } catch {
            return [];
        }
    }

    setAll( playerData ) {
        if( playerData.id == this.wsid ) localStorage.setItem("rouageLocalPlayerv1.0", JSON.stringify(playerData.sheet));
    }

}

class NetworkManager {

    constructor(bus, url) {
        this.bus = bus;
        this.wsid = null;

        this.ws = new WebSocket(url);

        this.ws.addEventListener("open", () => console.log("WS connected"));
        this.ws.addEventListener("message", e => this.receive(JSON.parse(e.data)));
        this.ws.addEventListener("close", () => console.log("WS disconnected"));
    }
    
    send(type, payload) {

        if (this.ws.readyState !== WebSocket.OPEN) return;

        const msg = { type, payload };

        this.ws.send(JSON.stringify(msg));
    }
    
    sendPlayer(playerData) {
        if( !(playerData.id == this.wsid) ) return; // seul les données local sont envoyées
        console.log("send : local player : ", playerData)
        this.send("player:new", playerData);
    }
    
    sendRoll(rollData) {
        if( !(rollData.id == this.wsid) ) return; // seul les données local sont envoyées
        console.log("send : roll dice : ", rollData)
        this.send("roll:start", rollData);
    }

    receive(msg) {

        switch (msg.type) {

            case "network:welcome":
                console.log("receive : ", msg.type, "your id");
                this.wsid = msg.id;
                this.bus.on("player:ready", playerData => this.sendPlayer( playerData ));
                this.bus.on("player:full", playerData => this.sendPlayer( playerData ));
                this.bus.on("player:updated", playerData => this.sendPlayer( playerData ));
                this.bus.on("roll:start", rollData => this.sendRoll(rollData));
                this.bus.emit("network:welcome", msg.id);
                break;

            case "network:join":
                console.log("receive : ", msg.type, "other WS connected");
                this.bus.emit("network:request");
                break;

            case "network:leave":
                console.log("receive : ", msg.type, "other WS disconnected");
                this.bus.emit("player:remove", msg.id);
                break;

            case "player:new":
                console.log("receive : ", msg.type, msg.payload)
                this.bus.emit("player:new", msg.payload);
                break;

            case "roll:start":
                this.bus.emit("roll:start", msg.payload);
                break;

            default:
                console.warn("Unknown WS message", msg);
        }
    }

}