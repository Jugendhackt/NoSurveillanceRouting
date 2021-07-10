var mymap           = L.map('map').setView([53.5647, 9.9715], 14);
var clr             = "#ff2100";
var SurveillData    = [];
var url             = '';

// NOT FORGET TO MENTION ARTIST; AND THE CHANGES (https://creativecommons.org/licenses/by/3.0/)
var surCam          = L.icon({
    iconUrl: 'media/surcam_Alexandr-Cherkinsky.png',
    iconSize: [30, 30]
});

const params        = {
    'content-type': 'application/json'
};

L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);

L.rectangle([[90,      180   ], [-90,       9.9826]  ], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[90,      9.9604], [ 53.5688,  9.9826]  ], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[90,      9.9604], [-90,      -180   ]  ], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[53.5606, 9.9604], [-90,       9.9826]  ], {color: clr, weight: 0}).addTo(mymap);

/*fetch(url, {method: 'GET', body: JSON.stringify(params)})
    .then(response => response.json())
    .then(console.log(response));*/

for (var i = 0; i <= 10; i++) {
    SurveillData.push([
        Math.random()*0.0082+53.5606, 
        Math.random()*0.0222+9.9604
    ]);
}

for (var i in SurveillData) {
    L.marker(SurveillData[i], {
        icon: surCam
    }).addTo(mymap);
}

function geolocate() {
    if (window.navigator && window.navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onGeolocateSuccess, onGeolocateError);
    }
}

function onGeolocateSuccess(coordinates) {
    const { latitude, longitude } = coordinates.coords;
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