// Function to interpolate color from yellow to purple
function interpolateColor(factor) {
    const r = Math.round(255 - 127 * factor).toString(16).padStart(2, '0');
    const g = Math.round(255 - 128 * factor).toString(16).padStart(2, '0');
    const b = Math.round(255 * factor).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

// Function to assign color based on depth
function getColor(d) {
    if (d > 100) {
        d = 100;
    }
    return interpolateColor(d / 100);
}

// Fetch earthquake data and visualize it
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(d => {
    const data = d.features;

    // Create initial map
    const map = L.map('map').setView([0, 0], 1);

    // Add base map layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Define base properties for circle markers
    const geojsonMarkerOptions = {
        weight: 1,
        opacity: 1,
        fillOpacity: 1,
        radius: 5
    };

    // Create circle markers based on features' coordinates and properties
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            const radius = feature.properties.mag * 5;
            geojsonMarkerOptions.radius = radius;
            geojsonMarkerOptions.fillColor = getColor(feature.geometry.coordinates[2]);
            
            // Create circle markers and their popup information
            const marker = L.circleMarker(latlng, geojsonMarkerOptions).bindPopup(
                `<p>
                Mag: ${feature.properties.mag} ${feature.properties.magType}</br>
                Depth: ${feature.geometry.coordinates[2]}</br>
                Type: ${feature.properties.type}</br>
                Place: ${feature.properties.place}</br>
                Time: ${new Date(feature.properties.time)}</br>
                Link: ${feature.properties.detail}</br></p></div>`, { maxWidth: 500 });
            
            return marker;
        }
    }).addTo(map);

    // Create legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 20, 40, 60, 80, 100];
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                `<ul style="background:${interpolateColor(grades[i] / 100)}"></i> ${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'}`;
        }
        return div;
    };
    legend.addTo(map);
});
