export class SkillManager {

    constructor( bus, playerID ) {
        this.buttons = document.querySelectorAll(".skills-list button");
        this.container = document.getElementById("skills-container");
        this.title = document.querySelector(".technique h4");
        this.bus = bus;
        this.playerID = playerID;

        this.isUpdateMode = false;

        document.getElementById("skills-update").addEventListener("click", () => this.toggleUpdateMode());
        this.buttons.forEach(button => button.addEventListener("click", e => this.clickSkill(e.target)));

        this.bus.on("dicepool:roll", () => this.buttons.forEach(b => b.classList.remove("selected")));
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
        else
            this.selectSkill(button);
    }

    updateSkill(button) {
        button.classList.toggle("active");
        if (!button.classList.contains("active"))
            this.bus.emit("sheet:change", { id: this.playerID, key: button.dataset.action, value: false });
        else
            this.bus.emit("sheet:change", { id: this.playerID, key: button.dataset.action, value: true });
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