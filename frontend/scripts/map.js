var mymap           = L.map('map').setView([53.5647, 9.9715], 15);
var clr             = "#ff2100";
var SurveillData    = [];
var markers         = [];
var url             = '';
var startSet        = false;
var places          = [];
var control;

// NOT FORGET TO MENTION ARTIST; AND THE CHANGES (https://creativecommons.org/licenses/by/3.0/)
var surCam          = L.icon({
    //iconUrl: 'media/surcam_Alexandr-Cherkinsky.png',
    iconUrl: 'media/marker_black.png',
    iconSize: [30, 30]
});

var router = (new L.Routing.osrmv1({
    serviceUrl: "https://routing.nsr.em0lar.dev/route/v1"
}));


L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);

/*L.rectangle([[90,      180   ], [-90,       9.9826]  ], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[90,      9.9604], [ 53.5688,  9.9826]  ], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[90,      9.9604], [-90,      -180   ]  ], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[53.5606, 9.9604], [-90,       9.9826]  ], {color: clr, weight: 0}).addTo(mymap);*/

fetch('https://nsr.em0lar.dev/cameras.json', {method: 'GET'})
    .then(response => response.json())
    .then(response => {
        var marks = L.markerClusterGroup();
        for (var i = 0; i < response.length; i++) {
            marks.addLayer(L.marker([response[i].lat, response[i].lon], {
                icon: surCam
            }));
        }
        marks.addTo(mymap);
 });

for (var i in SurveillData) {
    L.marker(SurveillData[i], {
        icon: surCam
    }).addTo(mymap);
}

mymap.on('click', onClick);

function onClick(ev) {
    var i = markers.length;

    if (i == 2 && !startSet) {
        markers[0].removeFrom(mymap);
        i = 0;
        startSet = true;
        places[i] = {lat: ev.latlng.lat, lng: ev.latlng.lng};

        getAddress(ev.latlng.lat, ev.latlng.lng, "PlaceA");
    } else if (i == 2 && startSet) {
        markers[1].removeFrom(mymap);
        i = 1;
        startSet = false;

        places[i] = {lat: ev.latlng.lat, lng: ev.latlng.lng};
        getAddress(ev.latlng.lat, ev.latlng.lng, "PlaceB");
    } else if (i == 1) {
        places[i] = {lat: ev.latlng.lat, lng: ev.latlng.lng};
        getAddress(ev.latlng.lat, ev.latlng.lng, "PlaceB");
    } else {
        places[i] = {lat: ev.latlng.lat, lng: ev.latlng.lng};
        getAddress(ev.latlng.lat, ev.latlng.lng, "PlaceA");
    }

    markers[i] = new L.marker(ev.latlng);
    markers[i].addTo(mymap);
}

function getRoute() {
    if (document.getElementById("PlaceA") && document.getElementById("PlaceB")) {
        control = L.Routing.control({
            waypoints: [
                places[0],
                places[1]
            ],
            router: router
        });
        control.addTo(mymap);
    }
}

function reset() {
    document.getElementById("PlaceA").value = "";
    document.getElementById("PlaceB").value = "";

    markers[0].removeFrom(mymap);
    markers[1].removeFrom(mymap);
    
    mymap.removeControl(control);
}

function getAddress(lat, lng, id) {
    fetch('https://nominatim.openstreetmap.org/reverse/?lat=' + lat + '&lon=' + lng + '&format=json', {method: 'GET'})
        .then(response => response.json())
        .then(response => {
            //document.getElementById(id).value = response.address.road + ' ' + response.address.house_number + ', ' + response.address.postcode + ', ' + response.address.village;
            document.getElementById(id).value = response.display_name;
    });
}

function geolocate() {
    if (window.navigator && window.navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onGeolocateSuccess, onGeolocateError);
    }
}

function onGeolocateSuccess(coordinates) {
    const { latitude, longitude } = coordinates.coords;
    
    getAddress(latitude, longitude, "PlaceA");

    places[0] = {lat: latitude, lng: longitude};
    markers[0] = new L.marker([latitude, longitude], {
        draggable: true
    });
    markers[0].addTo(mymap);
}

function onGeolocateError(error) {
    console.warn(error.code, error.message);

    if (error.code === 1) {
      alert("Location unavailable due to missing priveleges!");
    } else if (error.code === 2) {
      alert("Unknown error");
    } else if (error.code === 3) {
      alert("Locating timed out!")
    }
}