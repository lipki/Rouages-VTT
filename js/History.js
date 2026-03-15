export class History {

    constructor(bus, maxItems = 30) {
        this.container = document.querySelector("#history ul");
        this.maxItems = maxItems;

        this.items = [];

        bus.on("roll:start", data => this.addEntry(data));
    }

    addEntry(rollData) {
        // data attendu : 
        // { label, dice: [Dice], result, sheet }

        const el = document.createElement("li");
        el.className = "dice-entry";

        // avatar
        const avatar = document.createElement("img");
        avatar.className = "avatar";
        avatar.src = rollData.sheet.identity.portrait || "";
        el.appendChild(avatar);

        // stat
        const title = document.createElement("div");
        title.className = "title";
        title.textContent = ` → ${rollData.label}`;
        el.appendChild(title);

        // dés
        const diceContainer = document.createElement("div");
        diceContainer.className = "dice-list";
        rollData.dice.forEach(d => {
            const dEl = document.createElement("span");
            dEl.className = `dice ${d.color ?? ""} ${d.className ?? ""}`;
            dEl.textContent = d.value;
            diceContainer.appendChild(dEl);
        });
        el.appendChild(diceContainer);

        if( rollData.label !== "Vigueur" ) {
            // résultat
            const result = document.createElement("div");
            result.className = "result";
            result.textContent = `Résultat : ${rollData.result} → ${this.getSuccess(rollData.result)}`;
            el.appendChild(result);
        }

        // ajoute en haut
        this.container.insertBefore(el, this.container.firstChild);
        this.items.unshift(el);

        // limite la taille
        if (this.items.length > this.maxItems) {
            const old = this.items.pop();
            old.remove();
        }
    }

    getSuccess(value) {
        if (value >= 10) return "Légendaire";
        if (value >= 9) return "Improbable";
        if (value >= 7) return "Difficile";
        if (value >= 5) return "Facile";
        if (value >= 3) return "Routine";
        return "Echec";
    }

}