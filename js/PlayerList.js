export class PlayerList {

    constructor(bus, playerManager) {

        this.container = document.querySelector("#players-list");
        this.playerManager = playerManager;
        this.players = new Map();

        bus.on("player:updated", player => this.addPlayer(player));
        bus.on("player:remove", id => this.removePlayer(id));
        bus.on("player:partialupdate", playerData => this.addPlayer(playerData.player));

        playerManager.getAll().forEach(player => this.addPlayer(player));
    }

    addPlayer(player) {

        if( this.players.get(player.id) ) this.removePlayer(player.id);

        const template = document.getElementById('playerslist-template');
        const playerEl = template.content.cloneNode(true).querySelector('.player');
        const button = playerEl.querySelector("button");
        const avatar = button.querySelector("img");
        const name = button.querySelector("span");
        const pop = playerEl.querySelector("div");
        const popAvatar = pop.querySelector("img");
        const popName = pop.querySelector("h3");
        const popAge = pop.querySelector(".age");
        const popPeople = pop.querySelector(".people");
        const popWorks = pop.querySelector(".works");


        if( this.playerManager.playerLocalID == player.id )
            playerEl.classList.add("me");

        playerEl.dataset.name = name.textContent = popName.textContent = player.sheet?.identity?.name || "Nom oublié";

        pop.id = "player-"+player.id;
        button.style.anchorName = pop.style.positionAnchor = `--player-${player.id}`;

        avatar.src = popAvatar.src = player.sheet.identity.portrait || "img/ghost.png";

        popAge.textContent = "Âge : " + (player.sheet?.identity?.age || "Hors du temps");
        popPeople.textContent = "Peuple : " + (player.sheet?.identity?.people || "Née du vent");
        popWorks.textContent = "Métier : " + (player.sheet?.identity?.occupation || "Tisseuse de rêves");


        this.container.appendChild(playerEl);

        button.addEventListener("mouseenter", () => pop.showPopover());
        button.addEventListener("mouseleave", () => pop.hidePopover());

        this.players.set(player.id, {playerEl, pop});
    }

    removePlayer(id) {
        this.players.get(id)?.playerEl.remove();
        this.players.delete(id);
    }
}