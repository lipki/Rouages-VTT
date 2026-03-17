export class NetworkManager {

    constructor(bus, url) {
        this.bus = bus;
        this.wsid = null;

        this.ws = new WebSocket(url);

        this.ws.addEventListener("open", () => console.log("WS connected"));
        this.ws.addEventListener("message", e => this.receive(JSON.parse(e.data)));
        this.ws.addEventListener("close", () => console.log("WS disconnected"));
    }

    send(type, payload) {

        if (this.ws.readyState !== WebSocket.OPEN) return;

        const msg = { type, payload };

        this.ws.send(JSON.stringify(msg));
    }

    sendPlayer(player) {
        if (!(player.id == this.wsid)) return; // seul les données local sont envoyées
        const playerData = { id: player.id, sheet: player.sheet };
        console.log("Présentation du joueur local : ", playerData)
        this.send("network:userupdate", playerData);
    }

    sendPartialPlayer(playerData) {
        if (!(playerData.id == this.wsid)) return; // seul les données local sont envoyées
        playerData = { id: playerData.id, minisheet: playerData.minisheet };
        console.log("Update partiel d'un joueur : ", playerData)
        this.send("network:userpartialupdate", playerData);
    }

    sendRoll(rollData) {
        if (!(rollData.id == this.wsid)) return; // seul les données local sont envoyées
        console.log("send : roll dice : ", rollData)
        this.send("network:roll", rollData);
    }

    sendImage(avatarData) {
        if (!(avatarData.id == this.wsid)) return; // seul les données local sont envoyées
        console.log("send : avatar : ", avatarData)
        this.send("avatar:change", avatarData);
    }

    receive(msg) {

        switch (msg.type) {

            /*
             La connexion est effective, Préparez vous, et présentez vous.
            */
            case "server:welcome":
                console.log("receive :", msg.type, msg.id);
                console.log("La connexion est effective, Préparez vous, et présentez vous.");

                this.wsid = msg.id;

                this.bus.on("player:updated", player => this.sendPlayer(player));
                this.bus.on("player:partialupdate", playerData => this.sendPartialPlayer(playerData));
                this.bus.on("dicepool:roll", rollData => this.sendRoll(rollData));

                this.bus.emit("network:connected", msg.id);

                break;

            /*
             Un nouvel utilisateur ces connecté le server vous demande de vous présenter.
            */
            case "server:newuser":
                console.log("receive : ", msg.type, "other WS connected");
                console.log("Un nouvel utilisateur c'est connecté le server vous demande de vous présenter.");
                this.bus.emit("network:requestfull");
                break;

            case "server:leave":
                console.log("receive : ", msg.type, "other WS disconnected");
                console.log("Un utilisateur c'est deconnecté, il faut le suprimmer");
                this.bus.emit("network:playerremove", msg.id);
                break;

            case "network:userupdate":
                console.log("receive : ", msg.type, msg.payload)
                this.bus.emit("network:initplayer", msg.payload);
                break;

            case "network:userpartialupdate":
                this.bus.emit("network:partialupdate", msg.payload);
                break;

            case "network:roll":
                this.bus.emit("network:roll", msg.payload);
                break;

            default:
                console.warn("Unknown WS message", msg);
        }
    }

}