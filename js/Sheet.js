import { PortraitManager } from "./PortraitManager.js";
import { SkillManager } from "./SkillManager.js";
import { DrawerManager } from "./DrawerManager.js";
import { DicePool } from "./DicePool.js";
import { PlayerList } from "./PlayerList.js";
import { History } from "./History.js";

export class Sheet {

    constructor (bus, playerManager) {
        this.bus = bus;
        this.playerManager = playerManager;
        this.init = false;
        
        new PlayerList(bus);

        bus.on("player:ready", playerData => this.loadDatas( playerData ));

        document.querySelector(".page-corner").addEventListener("click", 
            () => document.querySelector(".sheet").classList.toggle("flipped"));
        
        document.querySelectorAll(".preload-hide").forEach(el => el.classList.toggle("preload-hide"));
        document.getElementById("network-wait").style.display = "none";

    }

    loadDatas(playerData) {

        if( this.init ) return ;

        this.init = true;
        this.playerID = playerData.id;

        new PortraitManager(this.bus, this.playerID);
        new SkillManager(this.bus, this.playerID);
        new DrawerManager(this.bus, this.playerID, "abilities");
        new DrawerManager(this.bus, this.playerID, "contacts");
        new DicePool(this.bus, this.playerManager);
        new History(this.bus, 11);

        /* Storage Input Manager */
        document.querySelectorAll("[data-action]").forEach(element => {
            element.addEventListener("input", e => 
                this.bus.emit("sheet:change", {id:this.playerID, key:e.target.dataset.action, value:e.target.value})
            );
        });

        /* load input */

        for (const [key, value] of Object.entries(playerData.sheet)) {
            let selector = key;

            if( value.length || typeof value !== "object" )
                this.loadData(selector, value);
            else for (const [key2, value2] of Object.entries(value))
                this.loadData(selector+"_"+key2, value2);
        }
    }

    loadData( selector, value ) {
        const el = document.querySelector(`[data-action="${selector}"]`);
        if( el ) el.value = value;
        if( el && el.tagName == "IMG" ) el.src = value || "";
        if( el && el.tagName == "BUTTON" ) value ? el.classList.add("active") : el.classList.remove("active");
        if( el && el.tagName == "DIV" ) value.forEach(d => el.addDrawer(d.title, d.content, false));

        el.dataset.value = value;
    }

}