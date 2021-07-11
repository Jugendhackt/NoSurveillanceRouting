var mymap           = L.map('map').setView([53.5647, 9.9715], 15);
var clr             = "#ff2100";
var SurveillData    = [];
var markers         = [];
var url             = '';
var startSet        = false;
var places          = [];

// NOT FORGET TO MENTION ARTIST; AND THE CHANGES (https://creativecommons.org/licenses/by/3.0/)
var surCam          = L.icon({
    iconUrl: 'media/surcam_Alexandr-Cherkinsky.png',
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
        for (var i = 0; i < response.length; i++) {
            L.marker([response[i].lat, response[i].lon], {
                icon: surCam
            }).addTo(mymap);
        }
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
        //https://routing.nsr.em0lar.dev/route/v1/driving/9.977163,53.564343;9.965500831604004,53.56399281658592?overview=false&alternatives=true&steps=true
        
        L.Routing.control({
            waypoints: [
                places[0],
                places[1]
            ],
            router: router
        }).addTo(mymap);
    }
}

window.addEventListener("load", function(){
	document.getElementById('PlaceA').addEventListener("keyup", function(event){hinter(event)});
	window.hinterXHR = new XMLHttpRequest();
});

function hinter(event) {
	var input = event.target;
	var huge_list = document.getElementById('PlaceA');

	var min_characters = 3;

	if (!isNaN(input.value) || input.value.length < min_characters ) { 
		return;
	} else { 
		window.hinterXHR.abort();
		window.hinterXHR.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var response = JSON.parse( this.responseText ); 
				huge_list.innerHTML = "";

				response.forEach(function(item) {
                    // Create a new <option> element.
                    var option = document.createElement('option');
                    option.value = item;
                    huge_list.appendChild(option);
                });
			}
		};
		window.hinterXHR.open("GET", "/query.php?query=" + input.value, true);
		window.hinterXHR.send()
	}
}


function reset() {
    document.getElementById("PlaceA").value = "";
    document.getElementById("PlaceB").value = "";
    window.location.reload();
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
    var addr;
    
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