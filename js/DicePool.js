export class DicePool {

    constructor(bus, playerManager) {

        this.bus = bus;
        this.playerManager = playerManager;
        this.container = document.querySelector(".dice-box");
        this.atoutCounter = document.querySelector(".icon-box.atoutpenalite .atoutCounter");
        this.skillCounter = document.querySelector(".icon-box.atoutpenalite .skillCounter");
        this.dice = [];
        this.atout = 0;
        this.skills = 0;

        this.bus.on("skills:changed", nb => this.updateSkills(nb));

        document.getElementById("comp_atout").addEventListener("click", e => {
            this.atout ++;
            this.updateAtoutLabel();
        });

        document.getElementById("comp_penalite").addEventListener("click", e => {
            this.atout --;
            this.updateAtoutLabel();
        });

        document.querySelector(".icon-box.vigueur span").addEventListener("click", e => {
            this.clear();
            this.add({className:"dice10", maxValue:10, color:"vigueur"});

            const sheet = this.playerManager.getLocal().sheet;
            this.bus.emit("dicepool:roll", {id: this.playerManager.playerLocalID ,label: "Vigueur", dice: this.dice, result:this.highest().value});
        });

        document.querySelectorAll("#stats-list span").forEach(label => {
            label.addEventListener("click", () => {
                const input = label.parentNode.querySelector("input");
                this.roll( label.innerText, input.value );
            });
        });

    }

    roll(stats, value) {
        this.clear();
        this.add({className:"dice6", value:value});
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

        const sheet = this.playerManager.getLocal().sheet;
        this.bus.emit("dicepool:roll", {id: this.playerManager.playerLocalID ,label: stats, dice: this.dice, result:this.resultAtout().value});

        this.atout = 0;
        this.updateAtoutLabel();
    }

    updateAtoutLabel() {
        const n = Math.abs(this.atout);

        if (this.atout < 0)
            this.atoutCounter.textContent = `${n} Pénalité${n>1?"s":""}`;
        else
            this.atoutCounter.textContent = `${n} Atout${n>1?"s":""}`;
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