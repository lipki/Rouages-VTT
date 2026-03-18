export class DrawerManager {

    constructor( bus, player, containerSelector ) {
        
        const container = document.querySelector(`#sheet-${player.id} [data-action="${containerSelector}"]`);
        
        this.selector = containerSelector;
        this.drawerContainer = document.querySelector(`#sheet-${player.id} [data-action="${containerSelector}"] .drawers-container`);
        this.bus = bus;
        this.player = player;

        container.querySelector(".add-drawer").addEventListener("click", () => this.addDrawer());
        container.addDrawer = (title, content, saved) => this.addDrawer(title, content, saved);
    }

    createDrawer(title = "Titre", content = "") {

        const template = document.getElementById('drawer-template');
        const drawer = template.content.cloneNode(true).querySelector('.drawer');
        const header = drawer.querySelector(".drawer-header");
        const rang = header.querySelector(".rang");
        const inputTitle = header.querySelector("input");
        const removeBtn = header.querySelector(".close");
        const contentDiv = drawer.querySelector(".drawer-content");
        const textarea = contentDiv.querySelector("textarea");

        rang.textContent = "𑙠"; // 𑙠𑙢𑙣
        inputTitle.value = title;
        textarea.value = content;

        document.getElementById('sheets-container').appendChild(drawer);

        // Toggle ouverture
        header.addEventListener("click", e => {
            if (e.target !== removeBtn)
                contentDiv.style.display = ( contentDiv.style.display === "block" ) ? "none" : "block";
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
        this.player.partialUpdate(this.selector, data);
    }
}