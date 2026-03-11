export class DrawerManager {

    constructor( store, containerSelector ) {
        this.selector = containerSelector;
        this.container = document.querySelector(this.selector);
        this.drawerContainer = document.querySelector(this.selector+" .drawers-container");
        this.store = store;
        this.load();
        this.bindAddButton();
    }

    bindAddButton() {
        const btn = this.container.querySelector(".add-drawer");
        btn.addEventListener("click", () => this.addDrawer());
    }

    createDrawer(title = "Titre", content = "") {
        const drawer = document.createElement("div");
        drawer.className = "drawer";

        const header = document.createElement("div");
        header.className = "drawer-header";

        const inputTitle = document.createElement("input");
        inputTitle.type = "text";
        inputTitle.value = title;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "✕";
        removeBtn.style.marginLeft = "0.5rem";

        header.appendChild(inputTitle);
        header.appendChild(removeBtn);

        const contentDiv = document.createElement("div");
        contentDiv.className = "drawer-content";

        const textarea = document.createElement("textarea");
        textarea.value = content;
        contentDiv.appendChild(textarea);

        drawer.appendChild(header);
        drawer.appendChild(contentDiv);

        // Toggle ouverture
        header.addEventListener("click", e => {
            if (e.target !== removeBtn) {
                contentDiv.style.display = contentDiv.style.display === "block" ? "none" : "block";
            }
        });

        // Supprimer
        removeBtn.addEventListener("click", () => {
            drawer.remove();
            this.save();
        });

        // Sauvegarde locale
        inputTitle.addEventListener("input", () => this.save());
        textarea.addEventListener("input", () => this.save());

        return drawer;
    }

    addDrawer(title, content) {
        const drawer = this.createDrawer(title, content);
        this.drawerContainer.insertBefore(drawer, this.drawerContainer.querySelector(".add-drawer"));
        this.save();
    }

    save() {
        const data = [...this.drawerContainer.querySelectorAll(".drawer")].map(d => {
            const title = d.querySelector("input").value;
            const content = d.querySelector("textarea").value;
            return { title, content };
        });
        this.store.set(this.selector, JSON.stringify(data));
    }

    load() {
        const saved = JSON.parse(this.store.get(this.selector) || "[]");
        saved.forEach(d => this.addDrawer(d.title, d.content));
    }
}