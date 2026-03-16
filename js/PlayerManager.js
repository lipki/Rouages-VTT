export class PlayerManager {

    constructor(bus, playerLocalID) {

        this.bus = bus
        this.players = new Map();
        this.playerLocalID = playerLocalID;

        /*bus.on("avatar:change", avatarChangeData => this.dispatchChangeToPlayer(avatarChangeData));*/

        bus.on("datastore:initplayer", playerData => this.addPlayer(playerData));
        bus.on("network:initplayer", playerData => this.addPlayer(playerData));
        bus.on("network:requestfull", () => this.bus.emit("player:updated", this.getLocal()));
        bus.on("network:playerremove", id => this.removePlayer(id));
        bus.on("network:partialupdate", playerData => this.dispatchChangeToPlayer(playerData));

        bus.on("sheet:change", sheetChangeData => this.dispatchChangeToPlayer(sheetChangeData));

        this.playerListEl = document.getElementById("players-list");

    }

    addPlayer(playerData = null) {

        let player = null;

        if (!this.players.get(playerData.id)) {
            player = new Player(this.bus, playerData.sheet, playerData.id, playerData.role);
            this.players.set(player.id, player);
            if (this.playerLocalID == player.id) player.local = true;
        } else {
            player = this.players.get(playerData.id);
            player.updateData(playerData.sheet);
        }

        return player;
    }

    removePlayer(id) {
        this.players.delete(id);
        this.bus.emit("player:remove", id);
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
        this.sheet = null;

        if (sheet) this.updateData(sheet);
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

        this.bus.emit("player:updated", this);
    }

    partialUpdate(sheetChangeData) {

        if (sheetChangeData.key == undefined && sheetChangeData.minisheet == undefined) return;

        let minisheet = sheetChangeData.minisheet ?? sheetChangeData.key.split("_").reverse().reduce((acc, part) => ({ [part]: acc }), sheetChangeData.value);
        this.sheet = mergeDeep(this.sheet, minisheet);

        this.bus.emit("player:partialupdate", { id: this.id, player: this, minisheet });
    }

}

function mergeDeep(...objects) {
  const isObject = obj => obj && typeof obj === 'object';
  
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];
      
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      }
      else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      }
      else {
        prev[key] = oVal;
      }
    });
    
    return prev;
  }, {});
}