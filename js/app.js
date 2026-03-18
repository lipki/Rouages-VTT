import { EventBus } from "./data/EventBus.js";
import { NetworkManager } from "./data/NetworkManager.js";
import { DataStore } from "./data/DataStore.js";
import { PlayerManager } from "./data/PlayerManager.js";
import { DicePool } from "./dom/DicePool.js";
import { History } from "./dom/History.js";

window.addEventListener("DOMContentLoaded", () => window.app = new App());

class App {

    constructor() {
        const BUS = new EventBus();
        
        if( window.location.search == "?GM" ) this.GM = true;

        //new NetworkManager(BUS, 'ws://localhost:8080');
        new NetworkManager(BUS, this.GM, 'https://rouages-vtt.onrender.com/');
        BUS.on("network:connected", wsid => this.wsConnected(BUS, wsid));
    }

    wsConnected(BUS, wsid) {
        console.log("network:connected - id :", wsid);

        document.querySelectorAll(".preload-hide").forEach(el => el.classList.toggle("preload-hide"));
        document.getElementById("network-wait").style.display = "none";

        const DS = new DataStore();
        const PM = new PlayerManager(BUS, DS, wsid, this.GM);
        new History(BUS, PM, 11);

    }

}