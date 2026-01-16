import { Graph } from "./Graph";

// ==========================
// Distance helper
// ==========================
function distance(a, b) {
    const R = 6371; // km
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    return R * Math.sqrt(dLat * dLat + dLon * dLon);
}

// ==========================
// Build full graph from OSM
// ==========================
export function buildGraph(osmElements) {
    const graph = new Graph();

    // 1️⃣ Add nodes
    for (const el of osmElements) {
        if (el.type === "node") {
            graph.addNode(el.id, el.lat, el.lon);
        }
    }

    // 2️⃣ Add edges
    for (const el of osmElements) {
        if (el.type === "way") {
            for (let i = 0; i < el.nodes.length - 1; i++) {
                const a = graph.nodes.get(el.nodes[i]);
                const b = graph.nodes.get(el.nodes[i + 1]);
                if (!a || !b) continue;

                const w = distance(a, b);
                graph.addEdge(a.id, b.id, w);
                graph.addEdge(b.id, a.id, w);
            }
        }
    }

    return graph;
}

// ==========================
// Sub-graph by bounding box
// ==========================
export function subGraphFromBBox(graph, box) {
    const sub = new Graph();

    // 1️⃣ copy nodes in bbox
    for (const [id, n] of graph.nodes) {
        if (
            n.lat >= box.minLat &&
            n.lat <= box.maxLat &&
            n.lon >= box.minLon &&
            n.lon <= box.maxLon
        ) {
            sub.addNode(id, n.lat, n.lon);
        }
    }

    // 2️⃣ copy edges if both endpoints exist
    for (const [id, n] of sub.nodes) {
        const orig = graph.nodes.get(id);
        for (const e of orig.edges) {
            if (sub.nodes.has(e.to)) {
                sub.addEdge(id, e.to, e.weight);
            }
        }
    }

    return sub;
}
