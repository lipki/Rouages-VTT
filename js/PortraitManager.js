export class PortraitManager {

    constructor( store ) {
        this.portrait = document.getElementById("zone-portrait");
        this.avatar = document.getElementById("avatarimage");
        this.store = store;
        this.MAX_SIZE = 1 * 1024 * 1024; // 1MB

        this.avatar.src = this.store.get("attr_character_avatar");
        this.init();
    }

    init() {
        this.portrait.addEventListener("dragover", this.dragover.bind(this));
        this.portrait.addEventListener("dragleave", this.dragleave.bind(this));
        this.portrait.addEventListener("drop", this.drop.bind(this));
    }

    dragover(e) {
        e.preventDefault();
        this.portrait.classList.add("dragover");
    }

    dragleave() {
        this.portrait.classList.remove("dragover");
    }

    drop(e) {
        e.preventDefault();
        this.portrait.classList.remove("dragover");

        const file = e.dataTransfer.files[0];

        if (!file) return; // Vérifie que c'est un fichier

        if (!file.type.startsWith("image/")) { // Vérifie que c'est une image
            alert("Dépose une image valide.");
            return;
        }

        if (file.size > this.MAX_SIZE) { // Vérifie la taille
            alert("L'image est trop lourde (max 1MB).");
            return;
        }

        const reader = new FileReader();
        const avatar = this.avatar;
        const store = this.store;

        reader.onload = function (event) {
            const base64 = event.target.result;

            avatar.src = base64;
            store.set("attr_character_avatar", base64);
        };

        reader.readAsDataURL(file);
    }

}