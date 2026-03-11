export class PlayerManager {

    constructor(bus) {

        this.bus = bus
        this.players = new Map();
        this.localPlayers = null;

        bus.on("ws:hello", data => this.addPlayer(data))
        bus.on("ws:disconnect", id => this.removePlayer(id))
        bus.on("ws:sheet:update", data => this.updateSheet(data))
        bus.on("ws:roll", data => this.updateRoll(data))

    }

    addPlayer(data = null) {
        const player = new Player(data);
        this.players.set(player.id, player);
        this.bus.emit("players:changed", this.players);
        return player;
    }

    addPlayerLocal( data ) {
        const player = this.addPlayer( data );
        player.localPlayer = true;
        return player;
    }

    removePlayer(id) {
        this.players.delete(id);
        this.bus.emit("players:changed", this.players);
    }

    updateSheet(data) {
        const player = this.players.get(data.id);
        if (!player) return
        //player.sheet ??= {}
        //player.sheet[data.key] = data.value
        //TODO
    }

    updateRoll(data) {
        //const player = this.players.get(data.id)
        //if(!player) return
        //player.lastRoll = data
    }

    get(id) {
        return this.players.get(id);
    }

    getAll() {
        return [...this.players.values()];
    }

    getGM() {
        return this.getAll().find(p => p.role === "gm");
    }

    getPlayers() {
        return this.getAll().find(p => p.role === "player");
    }

}

export class Player {

    constructor(data) {
        this.id = data?.id; //randomUUID();
        this.localPlayer = false;

        if( data ) this.updateData(data);
    }

    updateData(data) {

        this.identity = Object.assign(
            { name: "", people: "", age: "", occupation: "", portrait: "" },
            data?.identity
        );

        this.role = data?.role ?? "player";

        this.stats = Object.assign(
            { mus: 0, dex: 0, per: 0, edu: 0, int: 0, vol: 0 },
            data?.identity
        );

        this.derivedStats = {};
        this.derivedStats.stamina = 0;
        this.derivedStats.injuries = 0;
        this.derivedStats.armor = 0;
        this.derivedStats.weakness = 0;
        this.derivedStats.penetration = 0;
        this.derivedStats.pi = 0;
        this.derivedStats.ingredients = 0;

        this.abilities = {};

        this.skills = {};
        this.skills.tinkering = false;
        this.skills.brigandage = false;
        this.skills.stealth = false;
        this.skills.eloquence = false;
        this.skills.intrigue = false;
        this.skills.legends = false;
        this.skills.medicine = false;
        this.skills.mobility = false;
        this.skills.nature = false;
        this.skills.politics = false;
        this.skills.psychology = false;
        this.skills.resistance = false;
        this.skills.abstractSciences = false;
        this.skills.martialTraining = "";

        this.techSkills = {};
        this.techSkills.apothecary = "";
        this.techSkills.apothecary = "";
        this.techSkills.alchemy = "";
        this.techSkills.armormaking = "";
        this.techSkills.mechanics = "";
        this.techSkills.electricity = "";
        this.techSkills.explosives = "";

        this.equipment = "";

        this.contacts = {};

        this.log = {};

        this.notes = "";
    }

}

/*
Atout
pénalité

Légendaire
Improbable
Difficile
Facile
Routine
Echec
*/