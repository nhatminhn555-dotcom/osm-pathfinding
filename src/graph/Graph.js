import { Node } from "./Node";
import { Edge } from "./Edge";

export class Graph {
    constructor() {
        this.nodes = new Map();
    }

    addNode(id, lat, lon) {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, new Node(id, lat, lon));
        }
    }

    addEdge(from, to, weight) {
        this.nodes.get(from).edges.push(
            new Edge(to, weight)
        );
    }
}
