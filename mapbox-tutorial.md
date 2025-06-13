The Mapbox Directions API provide routes, turn instructions, and trip durations between an origin and destination. The response includes a route geometry that can be displayed on a map, as well as turn-by-turn instructions for navigating the route.

This tutorial covers building a minimal web application that uses the Directions API to display a bike route on a map. You will learn how to:

Form a request to the Directions API.
Set up a web map using Mapbox GL JS.
Trigger a directions request when the map loads, and again when the user clicks on the map.
Add the route, origin, and destination to the map using custom sources and layers.
Display the route's turn-by-turn instructions in a sidebar.

Getting started
Here are a few resources you'll need before getting started:

An access token from your account. You will use an access token to associate a map with your account and you can find it on the Account page.
Mapbox Directions API documentation. A reference for all options available when making requests and how to interpret responses.
Mapbox GL JS. The Mapbox JavaScript library that uses WebGL to render interactive maps from Mapbox GL styles.
A code editor like VSCode or Sublime Text. You'll be writing HTML, CSS, and JavaScript in this tutorial.

Build a Directions API request
When making a request to any Mapbox web service, the general structure of the request URL will start like this:

https://api.mapbox.com/{service}/
In this case, the {service} will be directions, but you can also make requests of styles, geocoding, and other Mapbox APIs.

The next part will be the version number. The version number is helpful to know since the API may change over time and provide you with greater capabilities or change how the requests may work. The current version for directions is v5:

https://api.mapbox.com/directions/v5/
Parameters
If you tried to paste this into your browser's address bar, the request would not return anything. You still need to pass in some parameters that will narrow the scope of your request. In the case of the Mapbox Directions API, you are required to supply a profile (a mode of travel) and coordinates (the origin and the destination) for your request:

In this case, use the cycling profile to generate a bike route.
Use -84.518641, 39.134270 as your starting coordinate and -84.512023, 39.102779 as your destination. Note that these coordinates must be separated by a semi-colon ;.
Use the optional parameter geometries=geojson to specify that you would like it to return the route as a GeoJSON feature.
https://api.mapbox.com/directions/v5/mapbox/cycling/-84.518641,39.134270;-84.512023,39.102779?geometries=geojson
Access token
The only required item left is your access token. The access token is required to track the requests you make from your account for this particular service. You can create specific tokens for your requests or use your default token.

When adding this token, use an ampersand (the & symbol) before the token to append this to the request:

https://api.mapbox.com/directions/v5/mapbox/cycling/-84.518641,39.134270;-84.512023,39.102779?geometries=geojson&access_token=pk.eyJ1IjoiY2FyZGlhZGV2IiwiYSI6ImNsd2pzdnlheDE0amYycm13MWd5bHU3dmwifQ.m-orWS4qlHZgqkb50DVUZg
Now that you have a request, paste the full URL into your browser's address bar to get a response.

Review the response
When you make your request, a JSON object will be returned with the following information:

routes: This is an array of Route objects ordered by descending recommendation rank. In this case, you have not requested alternative routes, so only one route will be returned. You will use the geometry property to display the route on a map in the next step.
waypoints: This is an array of Waypoint objects. In this case, this array will include your starting and ending points.
code: This string indicates the state of the response. On normal valid responses, the value will be Ok.
{
    "routes": [
        {
            "weight_name": "bicycle",
            "weight": 2162.465,
            "duration": 809.824,
            "distance": 3995.791,
            "legs": [
                {
                    "via_waypoints": [],
                    "admins": [
                        {
                            "iso_3166_1_alpha3": "USA",
                            "iso_3166_1": "US"
                        }
                    ],
                    "weight": 2162.465,
                    "duration": 809.824,
                    "steps": [],
                    "distance": 3995.791,
                    "summary": "Clifton Avenue, Walnut Street"
                }
            ],
            "geometry": {
                "coordinates": [
                    [ -84.518363, 39.13382 ],
                    [ -84.520156, 39.133627 ],
                    [ -84.520515, 39.12992 ],
                    [ -84.520593, 39.129924 ],
                    [ -84.520796, 39.127929 ],
                    [ -84.52036, 39.127901 ],
                    [ -84.52094, 39.122783 ],
                    [ -84.52022, 39.122713 ],
                    [ -84.520689, 39.120757 ],
                    [ -84.517301, 39.118364 ],
                    [ -84.516928, 39.116836 ],
                    [ -84.514307, 39.114531 ],
                    [ -84.514551, 39.114249 ],
                    [ -84.511692, 39.102682 ],
                    [ -84.511987, 39.102637 ]
                ],
                "type": "LineString"
            }
        }
    ],
    "waypoints": [
        {
            "distance": 55.554,
            "name": "Clifton Court",
            "location": [ -84.518363, 39.13382 ]
        },
        {
            "distance": 16.084,
            "name": "East 6th Street",
            "location": [ -84.511987, 39.102637 ]
        }
    ],
    "code": "Ok",
    "uuid": "wJtSmYTu4Pmqgthc3f-v0yaK3y3pCtBSFNDp_TIOwXqP_3sTb1VT8Q=="
}

Build the map
Now that you understand how Mapbox Directions API requests and responses both work, you can use this API request to add a route to a web map.

Set up your HTML file
Create a new HTML file called index.html and initialize a Mapbox GL JS map using the code below.

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Getting started with the Mapbox Directions API</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
    <link
      href="https://api.tiles.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css"
      rel="stylesheet"
    />
    <style>
      body {
        margin: 0;
        padding: 0;
      }

      #map {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      // add the JavaScript here
    </script>
  </body>
</html>
Next, add the following script to the block of code within the <script> tags to initialize your map, the style, and starting position:

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FyZGlhZGV2IiwiYSI6ImNsd2pzdnlheDE0amYycm13MWd5bHU3dmwifQ.m-orWS4qlHZgqkb50DVUZg';
const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v12', // map style
  center: [-122.662323, 45.523751], // starting position
  zoom: 12 // starting zoom
});
// set the bounds of the map
const bounds = [
  [-123.069003, 45.395273],
  [-122.303707, 45.612333]
];
map.setMaxBounds(bounds);

// an arbitrary start/origin point will always be the same
// only the end/destination will change
const start = [-122.662323, 45.523751];

// this is where the code for the next step will go
Add your route request function
Next, you'll build a function called getRoute to make the API request and add the resulting route as a new layer. You'll then call that function when the map loads.

Within the getRoute function, specify the start and end coordinates. The start was defined outside of this function and the end will be passed in as an argument. Use the Fetch API to make the API request. You can then use the response to get all the relevant objects and use the geometry to add the response as a layer to the map. You can end this part of the code by executing it with a request after the map loads so that it makes a route that begins and ends at the start location.

Add the following code right after the start constant that you declared earlier:

// create a function to make a directions request and update the destination
async function getRoute(end) {
  // make a directions request using cycling profile
  const query = await fetch(
`https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
  );
  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry;
  const geojson = {
    'type': 'Feature',
    'properties': {},
    'geometry': data.geometry
  };
  
  if (map.getSource('route')) {
    // if the route already exists on the map, reset it using setData
    map.getSource('route').setData(geojson);
  }

  // otherwise, add a new layer using this data
  else {
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }
}
Mapbox JavaScript SDK
Mapbox also offers a JavaScript SDK, a node.js and browser JavaScript client, to interact with our web services directly in your web applications. You can use the JavaScript SDK to make the Directions API request directly. For more information on the Mapbox JavaScript SDK see the documentation on GitHub.

Test getRoute() from the console
In the next step, you will add code to call the getRoute() function after the map first loads. If you would like to confirm this functionality works now, follow these steps:

Open the application in your browser
Open the browser's console (Command+Option+J on a Mac, Ctrl+Alt+J on Windows)
In the console, type getRoute([-122.677738,45.522458]) to execute your function and pass in coordinates for a location in downtown Portland, OR.
You may need to enable pasting in console, if so the console will leave instructions when you enter this command on how to do so. Once enabled, you will need to re-paste this command.
If everything is working, you should see a light blue line on the map, representing the route returned by the Directions API.

Add circle layers and trigger the route request
Next, you'll set up code that runs after the map first loads. This code will add two circle layers to the map, a green circle for the origin and a red circle for the destination. It will also call getRoute(), passing in the default destination coordinates. Add the following code below the getRoute() function:

map.on('load', () => {
  const defaultEnd = [-122.61306001669664, 45.52776064404637]
  // add origin circle to the map
  map.addLayer({
    'id': 'origin-circle',
    'type': 'circle',
    'source': {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'Point',
              'coordinates': start
            }
          }
        ]
      }
    },
    'paint': {
      'circle-radius': 10,
      'circle-color': '#4ce05b'
    }
  });

  // add destination circle to the map
  map.addLayer({
    'id': 'destination-circle',
    'type': 'circle',
    'source': {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'Point',
              'coordinates': defaultEnd
            }
          }
        ]
      }
    },
    'paint': {
      'circle-radius': 10,
      'circle-color': '#f30'
    }
  });

  // make an initial directions request on load
  getRoute(defaultEnd);
});


Add interactivity to generate a new route on click
Now that you're displaying the origin, destination, and route on the map, you can add interactivity to allow the user to choose a new destination. Add the next bit of code that allows the user to click the map and update the location of the destination:

map.on('click', (event) => {
  const coords = Object.keys(event.lngLat).map(
    (key) => event.lngLat[key]
  );
  const end = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'Point',
          'coordinates': coords
        }
      }
    ]
  };

  map.getSource('destination-circle').setData(end);

  getRoute(coords);
});


Add turn instructions
In your HTML, add a new div element after the map div. This is where you will display turn-by-turn instructions.

<div id="instructions"></div>
Because you added the steps=true parameter to the initial request, all the instructions for navigating the route are available to parse. Now add these steps to the sidebar in the div element called instructions. Copy the following code into the end of your getRoute function.

// get the sidebar and add the instructions
const instructions = document.getElementById('instructions');
const steps = data.legs[0].steps;

let tripInstructions = '';
for (const step of steps) {
  tripInstructions += `<li>${step.maneuver.instruction}</li>`;
}

instructions.innerHTML = `<p id="prompt">📍 Click the map to get directions to another destination</p><p><strong>Trip duration: ${Math.floor(
  data.duration / 60
)} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;

In the directions response object, turn instructions are stored in the routes property. You can find instructions inside routes > legs > steps > maneuver. Each instruction is a string that describes what the bicycle rider should do next along a route.

Next, add some CSS to style the div to move it to the left side of your map and give it a white background.

#instructions {
  position: absolute;
  margin: 20px;
  width: 25%;
  top: 0;
  bottom: 20%;
  padding: 20px;
  background-color: #fff;
  overflow-y: scroll;
  font-family: sans-serif;
}

