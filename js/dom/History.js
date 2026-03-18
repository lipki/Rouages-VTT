export class History {

    constructor(bus, playerManager, maxItems = 30) {
        this.container = document.querySelector("#history ul");
        this.maxItems = maxItems;
        this.playerManager = playerManager;

        this.items = [];

        bus.on("dicepool:roll", rollData => this.addEntry(rollData));
        bus.on("network:roll", rollData => this.addEntry(rollData));
    }

    addEntry(rollData) {
        // data attendu : 
        // {id, label, dice: [Dice], result }

        const template = document.getElementById('history-template');
        const entryEl = template.content.cloneNode(true).querySelector('.dice-entry');
        const avatar = entryEl.querySelector("img");
        const title = entryEl.querySelector("h1");
        const diceContainer = entryEl.querySelector("div");
        const result = entryEl.querySelector("span");

        avatar.src = this.playerManager.get(rollData.id).sheet.identity.portrait || "img/ghost.png";
        title.textContent = ` → ${rollData.label}`;

        rollData.dice.forEach(data => {
            const dEl = document.createElement("span");
            dEl.className = `dice ${data.color ?? ""} ${data.className ?? ""}`;
            dEl.textContent = data.dice.value;
            diceContainer.appendChild(dEl);
        });

        if( rollData.label !== "Vigueur" )
            result.textContent = `Résultat : ${rollData.result} → ${this.getSuccess(rollData.result)}`;

        this.container.insertBefore(entryEl, this.container.firstChild);
        this.items.unshift(entryEl);

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