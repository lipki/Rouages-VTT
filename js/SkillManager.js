export class SkillManager {

    constructor( store, bus ) {
        this.buttons = document.querySelectorAll(".skills-list button");
        this.updateBtn = document.getElementById("skills-update");
        this.container = document.getElementById("skills-container");
        this.title = document.querySelector(".technique h4");
        this.store = store;
        this.bus = bus;

        this.isUpdateMode = false;

        this.load();
        this.bindEvents();
    }

    load() {
        this.buttons.forEach(button => { if (this.store.get(button.id)) button.classList.add("active") });
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
            this.store.remove(button.id);
        else
            this.store.set(button.id, true);
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