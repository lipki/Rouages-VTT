import { PortraitManager } from "./PortraitManager.js";
import { SkillManager } from "./SkillManager.js";
import { DrawerManager } from "./DrawerManager.js";
import { DicePool } from "./DicePool.js";

export class SheetManager {

    constructor(bus, GM) {
        this.bus = bus;
        this.sheets = new Map();
        this.GM = GM;

        if (this.GM) document.querySelector('body').className = "GM";

        bus.on("player:remove", id => this.removePlayer(id));
    }

    checkSheet( player ) {
        if (!player) return null;

        let sheet = this.sheets.get(player.id);

        if (!sheet)
            this.sheets.set(player.id, sheet = new Sheet(this.bus, player, this.GM));

        return sheet;
    }

    removePlayer(id) {
        this.sheets.get(id)?.sheetEl.remove();
        this.sheets.get(id)?.itemEl.remove();
        this.sheets.delete(id);
    }
}

export class Sheet {

    constructor(bus, player, GM) {
        this.bus = bus;
        this.player = player;
        this.GM = GM;

        this.createSheetEl();
        this.createItemEl();

        if( !this.GM || this.player.role === "GM" ) new PortraitManager(this.bus, this.player);
        
        if (this.player.role !== "GM") {
            new SkillManager(this.bus, this.player);
            new DrawerManager(this.bus, this.player, "abilities");
            new DrawerManager(this.bus, this.player, "contacts");
            new DicePool(this.bus, this);
        }

        /* Storage Input Manager */
        if( !this.GM || this.player.role === "GM" ) {
            this.sheetEl.querySelectorAll(`[data-action]`).forEach(element => {
                element.addEventListener("input", e => {
                    this.player.partialUpdate(e.target.dataset.action, e.target.value);
                    if (e.target.tagName == "INPUT") e.target.dataset.value = e.target.value;
                });
            });
        } else this.sheetEl.querySelectorAll(`input[data-action]`).forEach(el => el.disabled = true);


    }

    createSheetEl() {

        const template = document.getElementById(this.player.role == "GM" ? 'sheetGM-template' : 'sheet-template');
        this.sheetEl = template.content.cloneNode(true).querySelector('.sheet-container');
        this.sheetEl.id = "sheet-" + this.player.id;
        if(this.player.role === "GM") this.sheetEl.classList.add("GM");

        if(!this.player.local) this.sheetEl.classList.add("hide");

        this.playerListEl = document.querySelector("#players-list");

        document.getElementById('sheets-container').appendChild(this.sheetEl);

        this.sheetEl.querySelector(`.page-corner`)?.addEventListener("click",
            () => this.sheetEl.querySelector(`.sheet`).classList.toggle("flipped"));

        this.sheetEl.querySelector(`.clear`).addEventListener("click", () => {
            if ( confirm("Tout Supprimer ?") ) {
                localStorage.clear();
                location.reload();
            }
        });

    }

    createItemEl() {

        const template = document.getElementById('playerslist-template');
        this.itemEl = template.content.cloneNode(true).querySelector('.player');
        const button = this.itemEl.querySelector("button");
        this.avatar = button.querySelector("img");
        this.name = button.querySelector("span");
        this.pop = this.itemEl.querySelector("div");
        this.popAvatar = this.pop.querySelector("img");
        this.popName = this.pop.querySelector("h3");
        this.popAge = this.pop.querySelector(".age");
        this.popPeople = this.pop.querySelector(".people");
        this.popWorks = this.pop.querySelector(".works");


        if( this.player.local )
            this.itemEl.classList.add("me");

        this.itemEl.classList.add(this.player.role);

        this.pop.id = "player-"+this.player.id;
        button.style.anchorName = this.pop.style.positionAnchor = `--player-${this.player.id}`;


        this.playerListEl.appendChild(this.itemEl);

        if( this.player.role !== "GM" ) {
            button.addEventListener("mouseenter", () => this.pop.showPopover());
            button.addEventListener("mouseleave", () => this.pop.hidePopover());
        }
        if( this.GM )
            button.addEventListener("click", () => {
                document.querySelectorAll(".sheet-container").forEach(el => el.classList.add("hide"));
                document.getElementById("sheet-"+this.player.id).classList.remove("hide");
            });
    }


    loadDatas() {

        for (const [key, value] of Object.entries(this.player.sheet)) {
            let selector = key;

            if (value.length || typeof value !== "object") {
                this.loadData(this.sheetEl, selector, value);
                this.loadData(this.itemEl, selector, value);
            } else for (const [key2, value2] of Object.entries(value)) {
                this.loadData(this.sheetEl, selector + "_" + key2, value2);
                this.loadData(this.itemEl, selector + "_" + key2, value2);
            }
        }

    }

    loadData(container, selector, value) {
        console.log(container, selector, value)

        container.querySelectorAll(`[data-action="${selector}"]`).forEach( el => {
            if (el.tagName == "IMG") el.src = value || "img/ghost.png";
            else if (el.tagName == "BUTTON") value ? el.classList.add("active") : el.classList.remove("active");
            else if (el.tagName == "SPAN") el.textContent = value;
            else if (el.tagName == "H3") el.textContent = value;
            else if (el.tagName == "DIV") {
                el.querySelector(".drawers-container").innerHTML = "";
                value.forEach(d => {
                    el.addDrawer(d.title, d.content, false);
                    if(this.GM) el.querySelectorAll(`input, textarea`).forEach(el => el.disabled = true);
                });
            }
            else el.value = value;

            if (el && el.tagName == "INPUT") el.dataset.value = value;
        });
        
    }

}