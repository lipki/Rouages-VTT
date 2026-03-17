export class SkillManager {

    constructor( bus, player ) {
        const localEl = document.querySelector(`#sheet-${player.id}`);
        this.buttons = localEl.querySelectorAll(`.skills-list button`);
        this.container = localEl.querySelector(`.skills-container`);
        this.title = localEl.querySelector(`.technique h4`);
        this.bus = bus;
        this.player = player;

        this.isUpdateMode = false;

        localEl.querySelector(`.skills-update`).addEventListener("click", () => this.toggleUpdateMode());
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
            this.player.partialUpdate(button.dataset.action, false);
        else
            this.player.partialUpdate(button.dataset.action, true);
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