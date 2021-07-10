var mymap           = L.map('map').setView([53.5647, 9.9715], 15);
var clr             = "#ff2100";
var SurveillData    = [];
var markers         = [];
var url             = '';
var startSet         = false;

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

mymap.on('click', onClick);

function onClick(ev) {
    var i = markers.length;

    if (i == 2 && !startSet) {
        markers[0].removeFrom(mymap);
        i = 0;
        startSet = true;
    } else if (i == 2 && startSet) {
        markers[1].removeFrom(mymap);
        i = 1;
        startSet = false;
    }

    markers[i] = new L.marker(ev.latlng, {
        draggable: true
    });
    markers[i].addTo(mymap);

    if (markers.length == 2) {
        fetch('https://routing.nsr.em0lar.dev/route/v1/driving/9.977163,53.564343;9.965500831604004,53.56399281658592?overview=false&alternatives=true&steps=true', {method: 'GET', body: JSON.stringify(params)})
            .then(response => response.json())
            .then(console.log(response));
    }
}




function geolocate() {
    if (window.navigator && window.navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onGeolocateSuccess, onGeolocateError);
    }
}

function onGeolocateSuccess(coordinates) {
    var addr;
    const { latitude, longitude } = coordinates.coords;
    fetch('https://nominatim.openstreetmap.org/reverse/?lat=' + latitude + '&lon=' + longitude + '&format=json', {method: 'GET'})
        .then(response => response.json())
        .then(response => {
            document.getElementById("PlaceA").value = response.address.road + ' ' + response.address.house_number + ', ' + response.address.postcode + ', ' + response.address.village;
    });

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