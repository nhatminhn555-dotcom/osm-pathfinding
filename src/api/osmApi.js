export async function fetchOSMNamTuLiem() {
    const query = `
  [out:json][timeout:120];
  (
    way["highway"](21.005,105.720,21.060,105.800);
    node(w);
  );
  out body;
  `;

    const res = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
            method: "POST",
            body: query
        }
    );

    const text = await res.text();

    // Debug nếu không phải JSON
    if (!text.trim().startsWith("{")) {
        console.error("Overpass error response:", text);
        throw new Error("Overpass did not return JSON");
    }

    const data = JSON.parse(text);
    return data.elements;
}
