export class PlayerManager {

    constructor(bus, playerLocalID) {

        this.bus = bus
        this.players = new Map();
        this.playerLocalID = playerLocalID;

        bus.on("player:new", playerData => this.addPlayer(playerData));
        bus.on("player:remove", wsid => this.removePlayer(wsid));
        bus.on("sheet:change", sheetChangeData => this.dispatchChangeToPlayer(sheetChangeData));

        this.playerListEl = document.getElementById("players-list");

    }

    addPlayer(playerData = null) {

        let player = null;

        if( !this.players.get(playerData.id) ) {
            player = new Player(this.bus, playerData.sheet, playerData.id, playerData.role);
            this.players.set(player.id, player);
            if( this.playerLocalID == player.id ) player.local = true;
        } else {
            player = this.players.get(playerData.id);
            player.updateData(playerData.sheet);
        }

        return player;
    }

    removePlayer(id) {
        this.players.delete(id);
    }

    dispatchChangeToPlayer(sheetChangeData) {
        if (this.get(sheetChangeData?.id))
            this.get(sheetChangeData?.id).partialUpdate(sheetChangeData);
    }

    get(id) {
        return this.players.get(id);
    }

    getLocal() {
        return this.players.get(this.playerLocalID);
    }

    /*

    updateRoll(data) {
        //const player = this.players.get(data.id)
        //if(!player) return
        //player.lastRoll = data
    }

    getAll() {
        return [...this.players.values()];
    }

    getGM() {
        return this.getAll().find(p => p.role === "gm");
    }

    getPlayers() {
        return this.getAll().find(p => p.role === "player");
    }*/

}

class Player {

    constructor(bus, sheet, id, role) {
        this.bus = bus;
        this.id = id;
        this.role = role ?? "player";
        this.local = false;

        if (sheet) this.updateData(sheet);

        this.bus.on("network:request", () => this.bus.emit("player:full", {id:this.id, sheet:sheet}));
    }

    updateData(sheet_) {

        const sheet = this.sheet = {};

        sheet.identity = Object.assign(
            {
                name: "",
                people: "",
                age: "",
                occupation: "",
                portrait: ""
            },
            sheet_?.identity
        );

        sheet.stats = Object.assign(
            {
                mus: 0,
                dex: 0,
                per: 0,
                edu: 0,
                int: 0,
                vol: 0
            },
            sheet_?.stats
        );

        sheet.derivedStats = Object.assign(
            {
                stamina: 0,
                injuries: 0,
                armor: 0,
                weakness: 0,
                penetration: 0,
                pi: 0,
                ingredients: 0
            },
            sheet_?.derivedStats
        );

        sheet.abilities = sheet_?.abilities ?? [];

        sheet.skills = Object.assign(
            {
                tinkering: false,
                brigandage: false,
                stealth: false,
                eloquence: false,
                intrigue: false,
                legends: false,
                medicine: false,
                mobility: false,
                nature: false,
                politics: false,
                psychology: false,
                resistance: false,
                abstractSciences: false,
                martialTraining: ""
            },
            sheet_?.skills
        );

        sheet.techSkills = Object.assign(
            {
                apothecary: "",
                apothecary: "",
                alchemy: "",
                armormaking: "",
                mechanics: "",
                electricity: "",
                explosives: ""
            },
            sheet_?.techSkills
        );

        sheet.equipment = sheet_?.equipment ?? "";

        sheet.contacts = sheet_?.contacts ?? [];

        sheet.notes = sheet_?.notes ?? "";

        this.bus.emit("player:ready", {id:this.id, sheet:sheet});
    }

    partialUpdate(sheetChangeData) {

        if( sheetChangeData.key == undefined ) return;
        sheetChangeData.id = undefined;
        const keys = sheetChangeData.key.split("_");
        const last = keys.pop();
        const target = keys.reduce((o, k) => o[k], this.sheet);
        target[last] = sheetChangeData.value;

        this.bus.emit("player:updated", {id:this.id, sheet:this.sheet});
    }

}