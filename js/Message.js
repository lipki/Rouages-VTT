export class Message {

    static initPlayer(id, sheet, role) {

        if (!id) throw "Missing player id";
        if (!sheet) throw "Missing key";
        if (!role) throw "Missing role";

        return {
            type: "player:init",
            payload: {
                id,
                sheet,
                role
            }
        };
    }

}