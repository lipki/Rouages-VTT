export class DicePool {

    constructor(bus) {

        this.bus = bus;
        this.container = document.querySelector(".dice-box");
        this.buttonAtout = document.getElementById("comp_atout");
        this.buttonPenalite = document.getElementById("comp_penalite");
        this.atoutCounter = document.querySelector(".icon-box.atoutpenalite .atoutCounter");
        this.skillCounter = document.querySelector(".icon-box.atoutpenalite .skillCounter");
        this.historical = document.querySelector(".historical ul");
        this.buttonVigueur = document.querySelector(".icon-box.vigueur span");
        this.dice = [];
        this.atout = 0;
        this.skills = 0;
        this.MAX_HISTORY = 40;

        this.bus.on("skills:changed", nb => this.updateSkills(nb));

        this.bus.on("roll:start", data => this.roll(data));

        this.buttonAtout.addEventListener("click", e => {
            this.atout ++;
            this.updateAtoutLabel();
        });

        this.buttonPenalite.addEventListener("click", e => {
            this.atout --;
            this.updateAtoutLabel();
        });

        this.buttonVigueur.addEventListener("click", e => {
            this.clear();
            this.add({className:"dice10", maxValue:10, color:"vigueur"});
            this.addHistoryVigueur("Vigueur");
        });
    }

    roll(data) {
        this.clear();
        this.add({className:"dice6", value:data.value});
        this.add({className:"dice10", maxValue:10});

        const penaltyDice = Math.max(0, -this.atout - this.skills);
        const bonusDice = Math.max(0, this.atout);
        const competenceDice = this.atout < 0 ? this.skills + this.atout : this.skills;

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
        const txt = `${this.atout < 0 ? 'min' : 'max'}( ${this.values().join(", ")} ) = ${result} : ${this.getSuccess(result)}`;

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

    addHistoryVigueur(label) {

        const result = this.highest().value;

        const dt_carac = document.createElement('dt');
        dt_carac.className = 'title';
        dt_carac.textContent = label + " : " + result;

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