// Create the 'basemap' tile layer that will be the background of our map.
let myStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

let myTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


let myBaseMaps = {
  Street: myStreet,
  Topography: myTopo
};

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
// Created above as myStreet.

// Create the map object with center and zoom options.
let myChiMap = L.map("map", {
  center: [41.8781, -87.6298],
  zoom: 7,
  layers: [myStreet]
});

// Then add the 'basemap' tile layer to the map.
L.control.layers(myBaseMaps).addTo(myChiMap);
// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.


// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
   return {
      opacity: 0.5,
      fillOpacity: 0.65,
      fillColor: getColor(feature.geometry.coordinates[2]), // depth is the 3rd value
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.425
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth > 90 ? "#ea2c2c" :
    depth > 70 ? "#ea822c" :
    depth > 50 ? "#ee9c00" :
    depth > 30 ? "#eecc00" :
    depth > 10 ? "#d4ee00" :
                 "#98ee00";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4.75;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `Magnitude: <strong>${feature.properties.mag}</strong><br>` +
        `Depth: <strong>${feature.geometry.coordinates[2]}</strong><br>` +
        `Location: ${feature.properties.place}`
      );
    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(myChiMap);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
    }

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(myChiMap);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson(plate_data, {
      
      style: {
        color: "#ff7800",  
        weight: 2,         
        opacity: 0.7       
      },
      
      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          `<strong>Plate:</strong> ${feature.properties.PlateName || "Unknown"}`
        );
      }
    }).addTo(myChiMap);
    // Then add the tectonic_plates layer to the map.

  });
});
