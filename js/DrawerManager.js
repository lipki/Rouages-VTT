export class DrawerManager {

    constructor( bus, playerID, containerSelector ) {
        
        const container = document.querySelector("[data-action="+containerSelector+"]");
        
        this.selector = containerSelector;
        this.drawerContainer = document.querySelector("[data-action="+containerSelector+"] .drawers-container");
        this.bus = bus;
        this.playerID = playerID;

        container.querySelector(".add-drawer").addEventListener("click", () => this.addDrawer());
        container.addDrawer = (title, content, saved) => this.addDrawer(title, content, saved);
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
        removeBtn.addEventListener("click", () => {addDrawer
            drawer.remove();
            this.save();
        });

        // Sauvegarde locale
        inputTitle.addEventListener("input", () => this.save());
        textarea.addEventListener("input", () => this.save());

        return drawer;
    }

    addDrawer(title, content, saved = true) {
        const drawer = this.createDrawer(title, content);
        this.drawerContainer.insertBefore(drawer, this.drawerContainer.querySelector(".add-drawer"));
        if( saved ) this.save();
    }

    save() {
        const data = [...this.drawerContainer.querySelectorAll(".drawer")].map(d => {
            const title = d.querySelector("input").value;
            const content = d.querySelector("textarea").value;
            return { title, content };
        });
        this.bus.emit("sheet:change", { id: this.playerID, key: this.selector, value: data });
    }
}