import { PortraitManager } from "./PortraitManager.js";
import { SkillManager } from "./SkillManager.js";
import { DrawerManager } from "./DrawerManager.js";

export class Sheet {

    constructor (bus, player) {
        this.bus = bus;
        this.player = player;
        this.init = false;

        const template = document.getElementById('sheet-template');
        this.sheetEl = template.content.cloneNode(true).querySelector('.sheet-container');
        this.sheetEl.id = "sheet-"+player.id;
        document.getElementById('sheets-container').appendChild(this.sheetEl);

        this.sheetEl.querySelector(`.page-corner`)?.addEventListener("click", 
            () => this.sheetEl.querySelector(`.sheet`).classList.toggle("flipped"));

        this.sheetEl.querySelector(`.clear`).addEventListener("click", () => {
            localStorage.clear();
            location.reload();
        });

    }

    loadDatas() {

        if( this.init ) return ;
        this.init = true;

        new PortraitManager(this.bus, this.player);
        new SkillManager(this.bus, this.player);
        new DrawerManager(this.bus, this.player, "abilities");
        new DrawerManager(this.bus, this.player, "contacts");

        /* Storage Input Manager */
        this.sheetEl.querySelectorAll(`[data-action]`).forEach(element => {
            element.addEventListener("input", e => {
                this.player.partialUpdate(e.target.dataset.action, e.target.value);
                if( e.target.tagName == "INPUT") e.target.dataset.value = e.target.value;
            });
        });

        /* load input */

        for (const [key, value] of Object.entries(this.player.sheet)) {
            let selector = key;

            if( value.length || typeof value !== "object" )
                this.loadData(selector, value);
            else for (const [key2, value2] of Object.entries(value))
                this.loadData(selector+"_"+key2, value2);
        }
    }

    loadData( selector, value ) {
        const el = this.sheetEl.querySelector(`[data-action="${selector}"]`);
        if( el ) el.value = value;
        if( el && el.tagName == "IMG" ) el.src = value || "img/ghost.png";
        if( el && el.tagName == "BUTTON" ) value ? el.classList.add("active") : el.classList.remove("active");
        if( el && el.tagName == "DIV" ) value.forEach(d => el.addDrawer(d.title, d.content, false));

        if( el && el.tagName == "INPUT") el.dataset.value = value;
    }

}