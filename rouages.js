window.addEventListener("pageshow", () => new App());

const sheet = document.querySelector(".sheet");
const corner = document.querySelector(".page-corner");

corner.addEventListener("click", () => {
    sheet.classList.toggle("flipped");
});

class App {

    constructor(){
        const bus = new EventBus();

        this.dicePool = new DicePool(bus);
        this.skillManager = new SkillManager(bus);
        this.statsManager = new StatsManager(".stats-list", bus);

        new PortraitManager();
        new StorageInputManager(".identity input");
        new StorageInputManager("textarea");
        new StorageInputManager(".icons-grid input");

        new DrawerManager("#zone_capa");
        new DrawerManager("#zone_contacts");
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

class Dice {

    constructor(container, options) {

        this.container = container;
        this.className = options.className ?? "dice";
        this.maxValue = options.maxValue ?? 6;
        this.value = options.value ?? Math.ceil(Math.random() * this.maxValue);
        this.color = options.color ?? null;

        this.el = document.createElement("div");
        this.el.classList.add(this.className, "dice");

        if (this.color) this.el.classList.add(this.color);

        this.span = document.createElement('span');
        this.span.textContent = this.value;
        this.el.appendChild(this.span);


        this.container.appendChild(this.el);
    }

    remove() { this.el.remove(); }
}

class DicePool {

    constructor(bus) {

        this.bus = bus;
        this.container = document.querySelector(".dice-box");
        this.buttonAtout = document.getElementById("comp_atout");
        this.buttonPenalite = document.getElementById("comp_penalite");
        this.atoutCounter = document.querySelector(".icon-box.atoutpenalite .atoutCounter");
        this.skillCounter = document.querySelector(".icon-box.atoutpenalite .skillCounter");
        this.historical = document.querySelector(".historical ul");
        this.dice = [];
        this.atout = 0;
        this.skills = 0;
        this.MAX_HISTORY = 40;

        this.bus.on("skills:changed", nb => this.updateSkills(nb));

        this.bus.on("roll:start", data => {
            this.clear();
            this.add({className:"dice6", value:data.value});
            this.add({className:"dice10", maxValue:10});

            const penalty = Math.max(0, -this.atout);
            const bonus = Math.max(0, this.atout);

            const competenceDice = Math.max(0, this.skills - penalty);
            let penaltyDice = Math.max(0, penalty - this.skills);
            const bonusDice = Math.max(0, bonus - this.skills);

            penaltyDice = penalty > 0 && penaltyDice == 0 && competenceDice ==0 ? 1 : penaltyDice;

            Array.from({length: competenceDice}).forEach(() =>
                this.add({className:"dice10", maxValue:10, color:"competence"})
            );

            Array.from({length: penaltyDice}).forEach(() =>
                this.add({className:"dice10", maxValue:10, color:"penalite"})
            );

            Array.from({length: bonusDice}).forEach(() =>
                this.add({className:"dice10", maxValue:10, color:"atout"})
            );

            this.sortAtout();

            this.addHistory(data.label);

        });

        this.buttonAtout.addEventListener("click", e => {
            this.atout ++;
            this.updateAtoutLabel();
        });

        this.buttonPenalite.addEventListener("click", e => {
            this.atout --;
            this.updateAtoutLabel();
        });
    }

    updateAtoutLabel() {
        const n = Math.abs(this.atout);

        if (this.atout < 0)
            this.atoutCounter.textContent = `${n} Pénalité${n>1?"s":""}`;
        else
            this.atoutCounter.textContent = `${n} Atout${n>1?"s":""}`;
    }

    addHistory(label) {

        const result = this.resultAtout().value;
        const txt = `${this.atout < 0 ? 'min' : 'max'}(${this.values().join(", ")}) = ${result} : ${this.getSuccess(result)}`;

        const dt_carac = document.createElement('dt');
        dt_carac.className = 'title';
        dt_carac.textContent = label;

        const dl_dice = document.createElement('dl');
        dl_dice.className = 'dice';
        dl_dice.textContent = txt;

        this.historical.insertBefore(dl_dice, this.historical.firstChild);
        this.historical.insertBefore(dt_carac, this.historical.firstChild);

        while (this.historical.children.length > this.MAX_HISTORY)
            this.historical.lastChild.remove();

    }

    getSuccess(value) {
        if (value >= 10) return "Légendaire";
        if (value >= 9) return "Improbable";
        if (value >= 7) return "Difficile";
        if (value >= 5) return "Facile";
        if (value >= 3) return "Routine";
        return "Echec";
    }

    updateSkills(nb) {
        this.skills = nb;
        this.skillCounter.textContent = `${this.skills} Comp.`;
    }

    add(options) {
        const dice = new Dice(this.container, options);
        this.dice.push(dice);
        return dice;
    }

    clear() {
        this.dice.forEach(d => d.remove());
        this.dice = [];
    }

    values() { return this.dice.map(d => d.value); }

    highest() { return this.dice?.reduce((a, b) => a.value > b.value ? a : b); }

    lowest() { return this.dice?.reduce((a, b) => a.value < b.value ? a : b); }

    resultAtout() {
        if (this.atout < 0) return this.lowest();
        else return this.highest();
    }

    sortDesc() {
        this.dice
            .sort((a, b) => b.value - a.value)
            .forEach(d => this.container.appendChild(d.el));
    }

    sortAsc() {
        this.dice
            .sort((a, b) => a.value - b.value)
            .forEach(d => this.container.appendChild(d.el));
    }

    sortAtout() {
        if (this.atout < 0) this.sortAsc();
        else this.sortDesc();
    }

}

class StorageInputManager {

    constructor(selector) {
        this.inputs = document.querySelectorAll(selector);

        this.load();
        this.bindEvents();
    }

    load() {
        this.inputs.forEach(input => {
            const value = localStorage.getItem(input.name);

            if (value !== null) {
                input.value = value;
                input.dataset.value = value;
            }
        });
    }

    bindEvents() {
        this.inputs.forEach(input => {
            input.addEventListener("input", e => {
                const value = e.target.value;
                localStorage.setItem(e.target.name, value);
                e.target.dataset.value = value;
            });
        });
    }
}

class StatsManager extends StorageInputManager {

    constructor(selector, bus) {
        super(selector+" input");
        this.bus = bus;
        this.labels = document.querySelectorAll(selector+" span");
        this.bindRoll();
    }

    bindRoll() {
        this.labels.forEach(label => {
            label.addEventListener("click", () => {
                const input = label.parentNode.querySelector("input");
                this.bus.emit("roll:start", { label: label.innerText, value: input.value });
            });
        });
    }

}

class SkillManager {

    constructor( bus ) {
        this.buttons = document.querySelectorAll(".skills-list button");
        this.updateBtn = document.querySelector("#skills-update");
        this.container = document.querySelector(".skills-container");
        this.title = document.querySelector(".technique h4");
        this.bus = bus;

        this.isUpdateMode = false;

        this.load();
        this.bindEvents();
    }

    load() {
        this.buttons.forEach(button => { if (localStorage.getItem(button.id)) button.classList.add("active") });
    }

    bindEvents() {
        this.updateBtn.addEventListener("click", () => this.toggleUpdateMode());
        this.buttons.forEach(button => button.addEventListener("click", e => this.clickSkill(e.target)));
    }

    toggleUpdateMode() {
        this.isUpdateMode = !this.isUpdateMode;
        this.buttons.forEach(b => b.classList.toggle("show"));
        this.title.classList.toggle("show");
        this.container.classList.toggle("show");
        
        this.buttons.forEach(b => b.classList.remove("selected"));
    }

    clickSkill(button) {
        if (this.isUpdateMode)
            this.updateSkill(button);
        else this.selectSkill(button);
    }

    updateSkill(button) {
        button.classList.toggle("active");
        if (!button.classList.contains("active"))
            localStorage.removeItem(button.id);
        else
            localStorage.setItem(button.id, true);
    }

    selectSkill(button) {
        if (!button.classList.contains("active")) return;
        button.classList.toggle("selected");
        const selected = this.getSelected();
        this.bus.emit("skills:changed", selected.length);
    }

    getSelected() {
        return [...this.buttons].filter(b => b.classList.contains("selected"));
    }

}

class PortraitManager {

    constructor() {
        this.portrait = document.getElementById("portrait");
        this.avatar = document.getElementById("avatarimage");
        this.MAX_SIZE = 1 * 1024 * 1024; // 1MB

        this.avatar.src = localStorage.getItem("attr_character_avatar");
        this.init();
    }

    init() {
        this.portrait.addEventListener("dragover", this.dragover.bind(this));
        this.portrait.addEventListener("dragleave", this.dragleave.bind(this));
        this.portrait.addEventListener("drop", this.drop.bind(this));
    }

    dragover(e) {
        e.preventDefault();
        this.portrait.classList.add("dragover");
    }

    dragleave() {
        this.portrait.classList.remove("dragover");
    }

    drop(e) {
        e.preventDefault();
        this.portrait.classList.remove("dragover");

        const file = e.dataTransfer.files[0];

        if (!file) return; // Vérifie que c'est un fichier

        if (!file.type.startsWith("image/")) { // Vérifie que c'est une image
            alert("Dépose une image valide.");
            return;
        }

        if (file.size > this.MAX_SIZE) { // Vérifie la taille
            alert("L'image est trop lourde (max 1MB).");
            return;
        }

        const reader = new FileReader();
        const avatar = this.avatar;

        reader.onload = function (event) {
            const base64 = event.target.result;

            avatar.src = base64;
            localStorage.setItem("attr_character_avatar", base64);
        };

        reader.readAsDataURL(file);
    }

}

class DrawerManager {

    constructor(containerSelector) {
        this.selector = containerSelector;
        this.container = document.querySelector(this.selector);
        this.drawerContainer = document.querySelector(this.selector+" .drawers-container");
        this.load();
        this.bindAddButton();
    }

    bindAddButton() {
        const btn = this.container.querySelector(".add-drawer");
        btn.addEventListener("click", () => this.addDrawer());
    }

    createDrawer(title = "Titre", content = "") {
        const drawer = document.createElement("div");
        drawer.className = "drawer";

        const header = document.createElement("div");
        header.className = "drawer-header";

        const inputTitle = document.createElement("input");
        inputTitle.type = "text";
        inputTitle.value = title;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "✕";
        removeBtn.style.marginLeft = "0.5rem";

        header.appendChild(inputTitle);
        header.appendChild(removeBtn);

        const contentDiv = document.createElement("div");
        contentDiv.className = "drawer-content";

        const textarea = document.createElement("textarea");
        textarea.value = content;
        contentDiv.appendChild(textarea);

        drawer.appendChild(header);
        drawer.appendChild(contentDiv);

        // Toggle ouverture
        header.addEventListener("click", e => {
            if (e.target !== removeBtn) {
                contentDiv.style.display = contentDiv.style.display === "block" ? "none" : "block";
            }
        });

        // Supprimer
        removeBtn.addEventListener("click", () => {
            drawer.remove();
            this.save();
        });

        // Sauvegarde locale
        inputTitle.addEventListener("input", () => this.save());
        textarea.addEventListener("input", () => this.save());

        return drawer;
    }

    addDrawer(title, content) {
        const drawer = this.createDrawer(title, content);
        this.drawerContainer.insertBefore(drawer, this.drawerContainer.querySelector(".add-drawer"));
        this.save();
    }

    save() {
        const data = [...this.drawerContainer.querySelectorAll(".drawer")].map(d => {
            const title = d.querySelector("input").value;
            const content = d.querySelector("textarea").value;
            return { title, content };
        });
        localStorage.setItem(this.selector, JSON.stringify(data));
    }

    load() {
        const saved = JSON.parse(localStorage.getItem(this.selector) || "[]");
        saved.forEach(d => this.addDrawer(d.title, d.content));
    }
}