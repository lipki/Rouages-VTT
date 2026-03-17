import { Message } from "./Message.js";
import { Sheet } from "./Sheet.js";

export class PlayerManager {

    constructor(bus, dataStore, wsid) {

        this.bus = bus;
        this.dataStore = dataStore;
        this.players = new Map();
        this.playerLocalID = wsid;

        this.playerLocal = this.addPlayer(Message.initPlayer(wsid, dataStore.getAll(), "player"));
        bus.on("network:partialupdate", playerData => {
            if (this.get(playerData.id) && playerData.id != wsid)
                this.get(playerData?.id).partialNetUpdate(playerData);
        });

        bus.on("network:initplayer", playerData => this.addPlayer(Message.initPlayer(playerData.id, playerData.sheet, "player")));
        bus.on("network:requestfull", () => this.bus.emit("player:updated", this.getLocal()));
        bus.on("network:playerremove", id => this.removePlayer(id));

    }

    addPlayer(initPlayer = null) {

        let player = null;
        let payload = initPlayer.payload;

        if (!this.players.get(payload.id)) {
            player = new Player(this.bus, payload.sheet, payload.id, payload.role);
            this.players.set(player.id, player);
            if (this.playerLocalID === player.id) {
                player.local = true;
                player.dataStore = this.dataStore;
                player.dom = new Sheet(this.bus, player);
            }
        }

        player = this.players.get(payload.id);
        player.updateData(payload.sheet);

        return player;
    }

    removePlayer(id) {
        this.players.delete(id);
        this.bus.emit("player:remove", id);
    }

    get(id) {
        return this.players.get(id);
    }

    getLocal() {
        return this.players.get(this.playerLocalID);
    }

    getAll() {
        return [...this.players.values()];
    }

    /*getPlayers() {
        return this.getAll().find(p => p.role === "player");
    }*/

}

class Player {

    constructor(bus, sheet, id, role) {
        this.bus = bus;
        this.id = id;
        this.role = role ?? "player";
        this.local = false;
        this.dataStore = null;
        this.sheet = sheet;
        this.dom = null;
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

        this.dom?.loadDatas();
        this.bus.emit("player:updated", this);
    }

    partialUpdate(key, value) {

        if (key == undefined) return;

        let minisheet = key.split("_").reverse().reduce((acc, part) => ({ [part]: acc }), value);
        this.sheet = mergeDeep(this.sheet, minisheet);

        if(minisheet.abilities) this.sheet.abilities = minisheet.abilities;
        if(minisheet.contacts) this.sheet.contacts = minisheet.contacts;

        this.dataStore?.setAll(this.sheet);
        this.bus.emit("player:partialupdate", { id: this.id, player: this, minisheet });
    }

    partialNetUpdate(playerData) {

        if (playerData.key == undefined && playerData.minisheet == undefined) return;

        let minisheet = playerData.minisheet ?? playerData.key.split("_").reverse().reduce((acc, part) => ({ [part]: acc }), playerData.value);
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