function createFeatures(earthquakeData) {
    // Create an array to hold the earthquake markers
    let earthquakeMarkers = [];

    // Loop through the earthquake data
    earthquakeData.forEach(function(feature) {
        // Extract the relevant properties
        let coords = feature.geometry.coordinates;
        let lat = coords[1];
        let lng = coords[0];
        let mag = feature.properties.mag;
        let depth = coords[2];

        // Create marker and add it to the array
        let marker = createMarker(lat, lng, mag, depth);
        earthquakeMarkers.push(marker);
    });

    // Create a layer group for the earthquake markers
    let earthquakes = L.layerGroup(earthquakeMarkers);

    // Send the earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMarker(lat, lng, mag, depth) {
    // Calculate marker size based on magnitude
    let size = Math.sqrt(mag) * 5;

    // Calculate marker color based on depth
    let color;
    if (depth > 90) {
        color = '#8B0000'; // Dark red
    } else if (depth > 70) {
        color = '#FFA500'; // Orange
    } else if (depth > 50) {
        color = '#FFC733'; // Light Orange
    } else if (depth > 30) {
        color = '#FFFA33'; // Yellow
    } else if (depth > 10) {
        color = '#B5FF33'; // Light Green
    } else {
        color = '#3CFF33'; // Green
    }

    // Create marker with custom size and color
    return L.circleMarker([lat, lng], {
        radius: size,
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }).bindPopup(`<strong>Magnitude:</strong> ${mag}<br><strong>Depth:</strong> ${depth} km`);
}

function createMap(earthquakes) {
    // Create the base layers
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object
    let baseMaps = {
        "Topographic Map": topo
    };

    // Create an overlay object to hold our overlay
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    let myMap = L.map("map", {
        center: [61.21, -149.8],
        zoom: 5,
        layers: [topo, earthquakes] // Include both base layer and overlay layer here
    });

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create a legend
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [0, 10, 30, 50, 70, 90];
        let colors = ['#3CFF33', '#B5FF33', '#FFFA33', '#FFC733', '#FFA500', '#8B0000'];

        // Loop through depth ranges and generate a label with a colored square for each range
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<div><i style="background:' + colors[i] + '"></i> ' +
                (depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+')) +
                '</div>';
        }

        // Add background color and padding to the legend
        div.style.backgroundColor = '#fff';
        div.style.padding = '10px';

        return div;
    };

    legend.addTo(myMap);
}

// Store API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});
