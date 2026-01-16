export function aStar(graph, startId, goalId) {
    const open = new Set([startId]);
    const cameFrom = new Map();

    const g = new Map();
    const f = new Map();

    g.set(startId, 0);
    f.set(startId, 0);

    while (open.size > 0) {
        const current = [...open].reduce((a, b) =>
            f.get(a) < f.get(b) ? a : b
        );

        if (current === goalId) break;

        open.delete(current);

        for (const edge of graph.nodes.get(current).edges) {
            const tentative = g.get(current) + edge.weight;

            if (tentative < (g.get(edge.to) ?? Infinity)) {
                cameFrom.set(edge.to, current);
                g.set(edge.to, tentative);
                f.set(edge.to, tentative);
                open.add(edge.to);
            }
        }
    }

    // reconstruct path
    const path = [];
    let cur = goalId;
    while (cur !== undefined) {
        path.unshift(cur);
        cur = cameFrom.get(cur);
    }

    return path;
}
