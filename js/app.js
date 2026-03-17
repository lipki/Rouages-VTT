import { EventBus } from "./EventBus.js";
import { NetworkManager } from "./NetworkManager.js";
import { DataStore } from "./DataStore.js";
import { PlayerManager } from "./PlayerManager.js";
import { PlayerList } from "./PlayerList.js";
import { DicePool } from "./DicePool.js";
import { History } from "./History.js";

window.addEventListener("DOMContentLoaded", () => window.app = new App());

class App {

    constructor() {
        const BUS = new EventBus();

        //new NetworkManager(BUS, 'ws://localhost:8080');
        new NetworkManager(BUS, 'https://rouages-vtt.onrender.com/');
        BUS.on("network:connected", wsid => this.wsConnected(BUS, wsid));
    }

    wsConnected(BUS, wsid) {
        console.log("network:connected - id :", wsid);

        document.querySelectorAll(".preload-hide").forEach(el => el.classList.toggle("preload-hide"));
        document.getElementById("network-wait").style.display = "none";

        const DS = new DataStore();
        const PM = new PlayerManager(BUS, DS, wsid);
        new PlayerList(BUS, PM);
        new DicePool(BUS, PM);
        new History(BUS, PM, 11);

    }

}