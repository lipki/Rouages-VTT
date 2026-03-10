const DOM = {
    statsInputs: document.querySelectorAll(".stats-list input"),
    statsLabels: document.querySelectorAll(".stats-list span"),
    iconsInputs: document.querySelectorAll(".icons-grid input"),
    textareas: document.querySelectorAll("textarea"),
    skillButtons: document.querySelectorAll(".skills-list button"),
    avatar: document.getElementById("avatarimage"),
    historical: document.querySelector(".historical ul"),
    diceBox: document.querySelector(".dice-box"),
    portrait: document.getElementById("portrait")
};

window.addEventListener("pageshow", init);

function init() {
    load();
    systemInput();
    systemPortrait();
    systemSKills();
    systemStats();
}

function load() {

    DOM.statsInputs.forEach(input => {
        input.value = localStorage.getItem(input.name);
        input.dataset.value = input.value;
    });
    DOM.iconsInputs.forEach(input => input.value = localStorage.getItem(input.name));
    DOM.textareas.forEach(textarea => textarea.value = localStorage.getItem(textarea.name));
    DOM.skillButtons.forEach(button => {
        if(localStorage.getItem(button.id)) button.classList.add('active')
    });
    DOM.avatar.src = localStorage.getItem("attr_character_avatar");
}

function systemInput() {

    DOM.statsInputs.forEach(input => input.addEventListener("input", e => {
        localStorage.setItem(e.target.name, e.target.value);
        input.dataset.value = input.value;
    }));
    DOM.iconsInputs.forEach(input => input.addEventListener("input", e => localStorage.setItem(e.target.name, e.target.value)));
    DOM.textareas.forEach(textarea => textarea.addEventListener("input", e => localStorage.setItem(e.target.name, e.target.value)));

}

function systemPortrait() {

    const MAX_SIZE = 1 * 1024 * 1024; // 1MB

    DOM.portrait.addEventListener("dragover", e => {
        e.preventDefault();
        DOM.portrait.classList.add("dragover");
    });

    DOM.portrait.addEventListener("dragleave", e => DOM.portrait.classList.remove("dragover"));

    DOM.portrait.addEventListener("drop", e => {
        e.preventDefault();
        DOM.portrait.classList.remove("dragover");

        const file = e.dataTransfer.files[0];

        // Vérifie que c'est un fichier
        if (!file) return;

        // Vérifie que c'est une image
        if (!file.type.startsWith("image/")) {
            alert("Dépose une image valide.");
            return;
        }

        // Vérifie la taille
        if (file.size > MAX_SIZE) {
            alert("L'image est trop lourde (max 1MB).");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            const base64 = event.target.result;

            DOM.avatar.src = base64;
            localStorage.setItem("attr_character_avatar", base64);
        };

        reader.readAsDataURL(file);
    });
}

function systemSKills() {

    const skillsUpdate = document.querySelector("#skills-update");
    const skillsContainer = document.querySelector(".skills-container");
    const h4 = document.querySelector(".technique h4");
    let isSkillsUpdate = false;

    skillsUpdate.addEventListener("click", e => {
        DOM.skillButtons.forEach(button => button.classList.toggle("show"))
        h4.classList.toggle("show");
        skillsContainer.classList.toggle("show");
        isSkillsUpdate = !isSkillsUpdate;
    });

    DOM.skillButtons.forEach(button => {
        button.addEventListener("click", e => {
            if( isSkillsUpdate ) {
                e.target.classList.toggle("active");
                if( !e.target.classList.contains("active") ) {
                    e.target.classList.remove("selected");
                    localStorage.removeItem(e.target.id);
                } else
                    localStorage.setItem(e.target.id, true);
            } else
                e.target.classList.toggle("selected");
        });
    });
}

function systemStats() {

    DOM.statsLabels.forEach(stat => {
        stat.addEventListener("click", e => {
            roll(e.target.innerText, e.target.parentNode.querySelector("input").value);
        });
    });

}

function roll(title, value) {

    Dice.removeAll();

    const skillsSelected = document.querySelectorAll(".skills-list .selected");

    new Dice(DOM.diceBox, {className:"dice10", maxValue:10});
    new Dice(DOM.diceBox, { className:"dice6", value: value });

    skillsSelected.forEach(() => new Dice(DOM.diceBox, {className:"dice10", maxValue:10}));

    const dt_carac = createEl('dt', 'title', title);

    let maxElement = Dice.highest();
    maxElement.el.classList.add("atout");

    let txt = `max(${Dice.diceList.map(d => d.value).join(", ")}) = ${maxElement.value} : ${getSuccess(maxElement.value)}`;
    const dl_dice_max = createEl('dl', 'dice', txt);

    let minElement = Dice.lowest();
    minElement.el.classList.add("penalite");

    txt = `min(${Dice.diceList.map(d => d.value).join(", ")}) = ${minElement.value} : ${getSuccess(minElement.value)}`;
    const dl_dice_min = createEl('dl', 'dice', txt);

    DOM.historical.insertBefore(dl_dice_min, DOM.historical.firstChild);
    DOM.historical.insertBefore(dl_dice_max, DOM.historical.firstChild);
    DOM.historical.insertBefore(dt_carac, DOM.historical.firstChild);

    const MAX_HISTORY = 30;

    while (DOM.historical.children.length > MAX_HISTORY)
        DOM.historical.lastChild.remove();
}

function createEl(tag, className = "", text = "") {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
}

function getSuccess(value) {
    if (value >= 10) return "Légendaire";
    if (value >= 9) return "Improbable";
    if (value >= 7) return "Difficile";
    if (value >= 5) return "Facile";
    if (value >= 3) return "Routine";
    return "Echec";
}

class Dice {
    static diceList = [];

    constructor(container, options) {
        this.container = container;
        this.className = options.className ?? "dice";
        this.maxValue = options.maxValue ?? 6;
        this.value = options.value ?? Math.ceil(Math.random() * this.maxValue);
        this.color = options.color ?? null;

        this.el = createEl(`div`, this.className);
        if (this.color) this.el.classList.add(this.color);

        this.span = createEl("span", "", this.value);
        this.el.appendChild(this.span);
        this.container.appendChild(this.el);

        Dice.diceList.push(this);
    }

    remove() { this.el.remove(); }

    static removeAll() {
        this.diceList.forEach(d => d.remove());
        this.diceList = [];
    }

    static highest() {
        return this.diceList.reduce((a, b) => a.value > b.value ? a : b );
    }

    static lowest() {
        return this.diceList.reduce((a, b) => a.value < b.value ? a : b );
    }
}

/*

SCORE
inconsistant [0]
faible [1,3]
ordinaire [4,5]
haut [6,8]
exceptionnel [9]

Caractéristiques / Approches
MUSCULATURE [MUS] [0,9]
DEXTÉRITÉ [DEX] [0,9]
PERCEPTION [PER] [0,9]
ÉDUCATION [EDU] [0,9]
INTUITION [INT] [0,9]
ÉLOQUENCE [ELO] [0,9]
VOLONTÉ [VOL] [0,9]

Caractéristiques Dérivées
VIGUEUR [VIGU] 10+[MUS]+[VOL]
BLESSURES [BLES] [0,3]
PÉNÉTRATION [PENE] ([MUS] | [DEX]) /2

Compétences
Bricolage 🛠
Brigandage 🗡
Discrétion 🕶
Eloquence 🗣
Intrigues 🕸
Légendes 🕮 
Médecine ☤
Mobilité ☈
Nature ☘☙
Politique 🏛
Psychologie ⚿
Résistance 🛡
Sciences Abstraites ⛁

Disciplines techniques
Apothicairerie ☘
Alchimie ⚗
Armurerie 🛡
Mécanique ⚙
Electricité ⚡
Explosifs ☢




*/
