export function aStarTrace(graph, startId, goalId) {
    const open = new Set([startId]);
    const cameFrom = new Map();
    const g = new Map();
    const f = new Map();

    const visited = [];
    const frontier = [];

    g.set(startId, 0);
    f.set(startId, 0);

    while (open.size > 0) {
        const current = [...open].reduce((a, b) =>
            (f.get(a) ?? Infinity) < (f.get(b) ?? Infinity) ? a : b
        );

        open.delete(current);
        visited.push(current);

        if (current === goalId) break;

        for (const edge of graph.nodes.get(current).edges) {
            const tentative = g.get(current) + edge.weight;

            if (tentative < (g.get(edge.to) ?? Infinity)) {
                cameFrom.set(edge.to, current);
                g.set(edge.to, tentative);
                f.set(edge.to, tentative);

                if (!open.has(edge.to)) {
                    open.add(edge.to);
                    frontier.push(edge.to); // ⭐ LƯU FRONTIER
                }
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

    return { path, visited, frontier };
}
