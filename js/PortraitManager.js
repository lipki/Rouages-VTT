export class PortraitManager {

    constructor(bus, playerID) {
        this.image = document.querySelector("[data-action=identity_portrait]");
        this.portrait = this.image.parentElement;
        this.MAX_SIZE = 1 * 1024 * 1024; // 1MB
        this.bus = bus;
        this.playerID = playerID;

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
        const image = this.image;
        const bus = this.bus;
        const playerID = this.playerID;

        reader.onload = function (event) {
            const base64 = event.target.result;
            image.src = base64 || "img/ghost.png";
            bus.emit("sheet:change", { id: playerID, key: "identity_portrait", value: base64 });
        };

        reader.readAsDataURL(file);
    }

}