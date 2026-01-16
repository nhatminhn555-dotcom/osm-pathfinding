import L from "leaflet";
import { fetchOSMNamTuLiem } from "./api/osmApi";
import { buildGraph } from "./graph/buildGraph";
import { aStar } from "./algorithms/aStar";
import { aStarTrace } from "./algorithms/aStarTrace";
let runId = 0;

// ==========================
// 1️⃣ INIT MAP
// ==========================
const map = L.map("map").setView([21.03, 105.78], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

console.log("🗺 Map loaded");
// ==========================
// LAYERS FOR CLEAN UI
// ==========================
const visitedLayer = L.layerGroup().addTo(map);
const frontierLayer = L.layerGroup().addTo(map);
const pathLayer = L.layerGroup().addTo(map);
const markerLayer = L.layerGroup().addTo(map);

// ==========================
// 2️⃣ HELPERS
// ==========================
function pathToLatLng(path, graph) {
  return path.map(id => {
    const n = graph.nodes.get(id);
    return [n.lat, n.lon];
  });
}

function nearestNode(lat, lon, nodes) {
  let best = null;
  let bestDist = Infinity;

  for (const n of nodes) {
    const d =
      Math.abs(n.lat - lat) +
      Math.abs(n.lon - lon);

    if (d < bestDist) {
      best = n;
      bestDist = d;
    }
  }

  return best;
}
function makeBoundingBox(a, b, padding = 0.002) {
  return {
    minLat: Math.min(a.lat, b.lat) - padding,
    maxLat: Math.max(a.lat, b.lat) + padding,
    minLon: Math.min(a.lng, b.lng) - padding,
    maxLon: Math.max(a.lng, b.lng) + padding
  };
}

function inBBox(n, box) {
  return (
    n.lat >= box.minLat &&
    n.lat <= box.maxLat &&
    n.lon >= box.minLon &&
    n.lon <= box.maxLon
  );
}
function subGraphFromBBox(graph, box) {
  const sub = {
    nodes: new Map()
  };

  // 1️⃣ copy node trong bbox
  for (const [id, n] of graph.nodes) {
    if (inBBox(n, box)) {
      sub.nodes.set(id, {
        ...n,
        edges: []
      });
    }
  }

  // 2️⃣ copy edge nếu cả 2 đầu đều tồn tại
  for (const [id, n] of sub.nodes) {
    const orig = graph.nodes.get(id);
    for (const e of orig.edges) {
      if (sub.nodes.has(e.to)) {
        sub.nodes.get(id).edges.push(e);
      }
    }
  }

  return sub;
}


// ==========================
// 3️⃣ DRAW FULL ROAD GRAPH
// ==========================
function drawGraph(graph, map) {
  const drawn = new Set();

  for (const node of graph.nodes.values()) {
    for (const edge of node.edges) {
      const key = `${node.id}-${edge.to}`;
      const reverseKey = `${edge.to}-${node.id}`;
      if (drawn.has(key) || drawn.has(reverseKey)) continue;

      const a = node;
      const b = graph.nodes.get(edge.to);
      if (!b) continue;

      L.polyline(
        [
          [a.lat, a.lon],
          [b.lat, b.lon]
        ],
        {
          color: "#999",
          weight: 1,
          opacity: 0.6
        }
      ).addTo(map);

      drawn.add(key);
    }
  }
}

// ==========================
// 4️⃣ MAIN LOGIC
// ==========================
async function run() {
  console.log("📡 Fetching OSM...");
  const osm = await fetchOSMNamTuLiem();

  console.log("🧠 Building graph...");
  const graph = buildGraph(osm);
  const graphNodes = [...graph.nodes.values()];

  console.log("🛣 Drawing road graph...");
  drawGraph(graph, map);

  let clickPoints = [];


  map.on("click", e => {
    if (clickPoints.length === 0) {
      runId++;
      visitedLayer.clearLayers();
      frontierLayer.clearLayers();
      pathLayer.clearLayers();
      markerLayer.clearLayers();
    }

    clickPoints.push(e.latlng);
    L.marker(e.latlng).addTo(markerLayer);

    if (clickPoints.length === 2) {
      const a = nearestNode(
        clickPoints[0].lat,
        clickPoints[0].lng,
        graphNodes
      );

      const b = nearestNode(
        clickPoints[1].lat,
        clickPoints[1].lng,
        graphNodes
      );

      // 🔥 CHẠY A* CÓ TRACE
      const box = makeBoundingBox(
        clickPoints[0],
        clickPoints[1]
      );

      const subGraph = subGraphFromBBox(graph, box);

      const { path, visited, frontier } =
        aStarTrace(subGraph, a.id, b.id);
      console.log("A* visited:", visited.length);


      // 1️⃣ Animate visited (màu cam)
      const currentRun = runId;

      visited.forEach((id, i) => {
        const n = subGraph.nodes.get(id);
        setTimeout(() => {
          if (runId !== currentRun) return; // ⛔ animation cũ bị chặn

          L.circleMarker([n.lat, n.lon], {
            radius: 3,
            color: "orange",
            opacity: 0.5
          }).addTo(visitedLayer);
        }, i * 10);
      });


      // 2️⃣ Animate frontier (màu vàng)


      frontier.forEach((id, i) => {
        const n = subGraph.nodes.get(id);
        setTimeout(() => {
          if (runId !== currentRun) return;

          L.circleMarker([n.lat, n.lon], {
            radius: 3,
            color: "yellow",
            opacity: 0.6
          }).addTo(frontierLayer);
        }, i * 10);
      });


      // 2️⃣ Vẽ đường đi cuối cùng
      const latlngs = pathToLatLng(path, subGraph);

      const visitedTime = visited.length * 10;
      const frontierTime = frontier.length * 10;
      const totalTime = Math.max(visitedTime, frontierTime);

      setTimeout(() => {
        if (runId !== currentRun) return;

        L.polyline(latlngs, {
          color: "blue",
          weight: 5
        }).addTo(pathLayer);
      }, visited.length * 10 + 50);




      clickPoints = [];
    }
  });

  console.log("✅ Ready: click 2 points to run A*");



}

run();
