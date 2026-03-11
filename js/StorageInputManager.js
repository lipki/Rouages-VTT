export class StorageInputManager {

    constructor( store, selector ) {
        this.inputs = document.querySelectorAll(selector);
        this.store = store;

        this.load();
        this.bindEvents();
    }

    load() {
        this.inputs.forEach(input => {
            const value = this.store.get(input.name);

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
                this.store.set(e.target.name, value);
                e.target.dataset.value = value;
            });
        });
    }
}

export class StatsManager extends StorageInputManager {

    constructor( store, bus, selector ) {
        super(store, selector+" input");
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