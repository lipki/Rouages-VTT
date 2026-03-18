export class DataStore {

    constructor() {}

    getAll() {
        return JSON.parse(localStorage.getItem("rouageLocalPlayerv1.0") || "[]");
    }

    setAll(sheet) {
        localStorage.setItem("rouageLocalPlayerv1.0", JSON.stringify(sheet));
    }

}