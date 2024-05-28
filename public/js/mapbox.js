



export const displayMap = (locations) => {

mapboxgl.accessToken = 'pk.eyJ1IjoiZ2l0aXRpcG90IiwiYSI6ImNsdXJhMTk3ZTA0enYya3BnMHJlcDhlNDcifQ.5mLiaumMXF_bzkt_MjoDxg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/gititipot/clus4bzs700b201mphg9ofxbg',
    scrollZoom: false,
    // center: [-118.133648, 34.115151],// lng, lat
    // zoom : 6
});


const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    //creat mearker
    const el = document.createElement('div');
    el.className = 'marker';
    //add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
    .setLngLat(loc.coordinates).addTo(map);

    //Add popup
    new mapboxgl.Popup({
        offset: 30
    })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);


    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, { padding: {
    top: 250,
    bottom: 150,
    left: 100,
    right: 100
} });


};








// const locations = JSON.parse(document.getElementById('map').dataset.locations);


// mapboxgl.accessToken = 'pk.eyJ1IjoiZ2l0aXRpcG90IiwiYSI6ImNsdXJhMTk3ZTA0enYya3BnMHJlcDhlNDcifQ.5mLiaumMXF_bzkt_MjoDxg';

// var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/gititipot/clus4bzs700b201mphg9ofxbg',
//     scrollZoom: false,
//     // center: [-118.133648, 34.115151],// lng, lat
//     // zoom : 6
// });


// const bounds = new mapboxgl.LngLatBounds();

// locations.forEach(loc => {
//     //creat mearker
//     const el = document.createElement('div');
//     el.className = 'marker';
//     //add marker
//     new mapboxgl.Marker({
//         element: el,
//         anchor: 'bottom'
//     })
//     .setLngLat(loc.coordinates).addTo(map);

//     //Add popup
//     new mapboxgl.Popup({
//         offset: 30
//     })
//     .setLngLat(loc.coordinates)
//     .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
//     .addTo(map);


//     bounds.extend(loc.coordinates);
// });

// map.fitBounds(bounds, { padding: {
//     top: 250,
//     bottom: 150,
//     left: 100,
//     right: 100
// } });

