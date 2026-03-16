export class PlayerList {

    constructor(bus, playerManager) {

        this.container = document.querySelector("#players-list");
        this.playerManager = playerManager;
        this.players = new Map();


        bus.on("player:updated", player => this.addPlayer(player));
        bus.on("player:remove", id => this.removePlayer(id));
        bus.on("player:partialupdate", playerData => this.addPlayer(playerData.player));
    }

    addPlayer(player) {

        if( this.players.get(player.id) ) this.removePlayer(player.id);

        const wrapper = document.createElement("div");
        wrapper.className = "player";
        wrapper.dataset.name = player.sheet?.identity?.name || "Sans nom";

        if( this.playerManager.playerLocalID == player.id )
            wrapper.classList.add("me");

        const button = document.createElement("button");
        button.style.anchorName = `--player-${player.id}`;

        const avatar = document.createElement("img");
        avatar.className = "avatar";
        avatar.src = player.sheet.identity.portrait || "img/ghost.png";

        const name = document.createElement("span");
        name.className = "name";
        name.textContent = player.sheet?.identity?.name || "Nom oublié";

        button.append(avatar, name);

        const pop = document.createElement("div");
        pop.id = "player-"+player.id;
        pop.setAttribute("popover","");
        pop.style.positionAnchor = `--player-${player.id}`;

        pop.className = "player-card";

        pop.innerHTML = `
            <img class="avatar" src="${player.sheet.identity.portrait || "img/ghost.png"}">
            <h3>${player.sheet?.identity?.name || "Nom oublié"}</h3>
            <p>Âge : ${player.sheet?.identity?.age || "Hors du temps"}</p>
            <p>Peuple : ${player.sheet?.identity?.people || "Née du vent"}</p>
            <p>Métier : ${player.sheet?.identity?.occupation || "Tisseuse de rêves"}</p>
        `;

        wrapper.append(button, pop);
        this.container.appendChild(wrapper);

        button.addEventListener("mouseenter", () => pop.showPopover());
        button.addEventListener("mouseleave", () => pop.hidePopover());

        this.players.set(player.id, {wrapper, pop});
    }

    removePlayer(id) {
        this.players.get(id)?.wrapper.remove();
        this.players.delete(id);
    }
}