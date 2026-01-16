export class Node {
    constructor(id, lat, lon) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.edges = [];
    }
}
