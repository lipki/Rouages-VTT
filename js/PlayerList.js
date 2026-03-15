export class PlayerList {

    constructor(bus) {

        this.container = document.querySelector("#players-list");

        this.players = new Map();

        bus.on("player:new", playerData => this.addPlayer(playerData));
        bus.on("player:updated", playerData => this.addPlayer(playerData));
        bus.on("player:remove", wsid => this.removePlayer(wsid));
    }

    addPlayer(playerData) {

        if( this.players.get(playerData.id) ) this.removePlayer(playerData.id);

        const wrapper = document.createElement("div");
        wrapper.className = "player";

        const button = document.createElement("button");
        button.style.anchorName = `--player-${playerData.id}`;

        const avatar = document.createElement("img");
        avatar.className = "avatar";
        avatar.src = playerData.sheet.identity.portrait || "";

        const name = document.createElement("span");
        name.className = "name";
        name.textContent = playerData.sheet.identity.name || "Sans nom";


        button.append(avatar, name);

        const pop = document.createElement("div");
        pop.id = "player-"+playerData.id;
        pop.setAttribute("popover","");
        pop.style.positionAnchor = `--player-${playerData.id}`;

        pop.className = "player-card";

        pop.innerHTML = `
            <img class="avatar" src="${playerData.sheet.identity.portrait || ""}">
            <h3>${playerData.sheet.identity.name || ""}</h3>
            <p>Âge : ${playerData.sheet.identity.age || ""}</p>
            <p>Origine : ${playerData.sheet.identity.people || ""}</p>
            <p>Métier : ${playerData.sheet.identity.occupation || ""}</p>
        `;

        wrapper.append(button, pop);
        this.container.appendChild(wrapper);

        button.addEventListener("mouseenter", () => pop.showPopover());
        button.addEventListener("mouseleave", () => pop.hidePopover());

        this.players.set(playerData.id, {wrapper, pop});
    }

    removePlayer(id) {
        this.players.get(id).wrapper.remove();
        this.players.delete(id);
    }
}