export class DicePool {

    constructor(bus, sheet) {

        this.bus = bus;
        this.sheet = sheet;
        this.container = document.querySelector(`.dice-box`);
        this.atoutCounter = sheet.sheetEl.querySelector(`.icon-box.atoutpenalite .atoutCounter`);
        this.skillCounter = sheet.sheetEl.querySelector(`.icon-box.atoutpenalite .skillCounter`);
        this.dice = [];
        this.atout = 0;
        this.skills = 0;

        this.bus.on("skills:changed", nb => this.updateSkills(nb));

        sheet.sheetEl.querySelector(`.comp_atout`)?.addEventListener("click", e => {
            this.atout++;
            this.updateAtoutLabel();
        });

        sheet.sheetEl.querySelector(`.comp_penalite`)?.addEventListener("click", e => {
            this.atout--;
            this.updateAtoutLabel();
        });

        sheet.sheetEl.querySelector(`.icon-box.vigueur span`)?.addEventListener("click", e => {
            this.clear();
            this.add({ className: "dice10", maxValue: 10, color: "vigueur" });

            this.bus.emit("dicepool:roll", { id: sheet.player.id, label: "Vigueur", dice: this.dice, result: this.highest().value });
        });

        sheet.sheetEl.querySelectorAll(`.stats-list span`)?.forEach(label => {
            label.addEventListener("click", () => {
                const input = label.parentNode.querySelector("input");
                this.roll(label.innerText, input.value);
            });
        });

    }

    roll(stats, value) {
        this.clear();
        this.add({ className: "dice6", value: value });
        this.add({ className: "dice10", maxValue: 10 });

        const penaltyDice = Math.max(0, -this.atout - this.skills);
        const bonusDice = Math.max(0, this.atout);
        const competenceDice = this.atout < 0 ? this.skills + this.atout : this.skills;

        Array.from({ length: competenceDice }).forEach(() =>
            this.add({ className: "dice10", maxValue: 10, color: "competence" })
        );

        Array.from({ length: penaltyDice }).forEach(() =>
            this.add({ className: "dice10", maxValue: 10, color: "penalite" })
        );

        Array.from({ length: bonusDice }).forEach(() =>
            this.add({ className: "dice10", maxValue: 10, color: "atout" })
        );

        this.sortAtout();

        this.bus.emit("dicepool:roll", { id: this.sheet.player.id, label: stats, dice: this.dice, result: this.resultAtout().value });

        this.atout = 0;
        this.updateAtoutLabel();
    }

    updateAtoutLabel() {
        const n = Math.abs(this.atout);

        if (this.atout < 0)
            this.atoutCounter.textContent = `${n} Pénalité${n > 1 ? "s" : ""}`;
        else
            this.atoutCounter.textContent = `${n} Atout${n > 1 ? "s" : ""}`;
    }

    updateSkills(nb) {
        this.skills = nb;
        this.skillCounter.textContent = `${this.skills} Comp.`;
    }

    add(options) {
        const dice = new Dice(this.container, options);
        this.dice.push({...options, dice, value:dice.value});
        return dice;
    }

    clear() {
        this.dice.forEach(d => d.dice.remove());
        this.dice = [];
    }

    values() { return this.dice.map(d => d.dice.value); }

    highest() { return this.dice?.reduce((a, b) => a.dice.value > b.dice.value ? a : b); }

    lowest() { return this.dice?.reduce((a, b) => a.dice.value < b.dice.value ? a : b); }

    resultAtout() {
        if (this.atout < 0) return this.lowest();
        else return this.highest();
    }

    sortDesc() {
        this.dice
            .sort((a, b) => b.dice.value - a.dice.value)
            .forEach(d => this.container.appendChild(d.dice.diceEl));
    }

    sortAsc() {
        this.dice
            .sort((a, b) => a.dice.value - b.dice.value)
            .forEach(d => this.container.appendChild(d.dice.diceEl));
    }

    sortAtout() {
        if (this.atout < 0) this.sortAsc();
        else this.sortDesc();
    }

}

class Dice {

    constructor(container, options) {

        const template = document.getElementById('dice-template');
        this.diceEl = template.content.cloneNode(true).querySelector('.dice');
        this.value = Number(options.value ?? Math.ceil(Math.random() * options.maxValue ?? 6));
        this.diceEl.querySelector('span').textContent = this.value;

        if (options.className) this.diceEl.classList.add(options.className);
        if (options.color) this.diceEl.classList.add(options.color);

        container.appendChild(this.diceEl);
    }

    remove() { this.diceEl.remove(); }
}