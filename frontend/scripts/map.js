var mymap           = L.map('map').setView([53.5647, 9.9715], 12);
var clr             = "#ff2100";
var apiKey          = "0e10c9e7afbd4a7c9020e4980b3b9619"; //    <-- INSERT YOUR GEOAPIFY-API KEY HERE
var markers         = [];
var url             = '';
var startSet        = false;
var places          = [];
var control;

var surCam          = L.icon({
    iconUrl: 'media/marker_black.png',
    iconSize: [30, 30]
});

var router = (new L.Routing.osrmv1({
    serviceUrl: "https://routing.nsr.em0lar.dev/route/v1"
}));


L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);

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

mymap.on('click', onClick);

autocomplete(document.getElementById("PlaceA"));
autocomplete(document.getElementById("PlaceB"));

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
    if (control) {
        mymap.removeControl(control);
    }

    if (places[0] && places[1]) {
        if (places[0] && places[1]) {
            control = L.Routing.control({
                waypoints: [
                    places[0],
                    places[1]
                ],
                router: router
            });
            
            control.addTo(mymap);
        } else if (places[0]) {
            fetch('https://api.geoapify.com/v1/geocode/autocomplete?text=' + document.getElementById("PlaceB").value + '&apiKey=' + apiKey, {method: 'GET'})
                .then(response => response.json())
                .then(response => {
                    document.getElementById("PlaceB").value = response.features[0].properties.formatted;
                    control = L.Routing.control({
                        waypoints: [
                            places[0],
                            [response.features[0].properties.lat, response.features[0].properties.lon]
                        ],
                        router: router
                    });
                    control.addTo(mymap);
            });
        } else if (places[1]) {
            fetch('https://api.geoapify.com/v1/geocode/autocomplete?text=' + document.getElementById("PlaceA").value + '&apiKey=' + apiKey, {method: 'GET'})
                .then(response => response.json())
                .then(response => {
                    document.getElementById("PlaceA").value = response.features[0].properties.formatted;
                    control = L.Routing.control({
                        waypoints: [
                            [response.features[0].properties.lat, response.features[0].properties.lon],
                            places[1]
                        ],
                        router: router
                    });
                    control.addTo(mymap);
            });
        } else {
            fetch('https://api.geoapify.com/v1/geocode/autocomplete?text=' + document.getElementById("PlaceA").value + '&apiKey=' + apiKey, {method: 'GET'})
                .then(response => response.json())
                .then(response => {
                    document.getElementById("PlaceA").value = response.features[0].properties.formatted;
                    places[0] = [response.features[0].properties.lat, response.features[0].properties.lon];
                    fetch('https://api.geoapify.com/v1/geocode/autocomplete?text=' + document.getElementById("PlaceB").value + '&apiKey=' + apiKey, {method: 'GET'})
                        .then(resp2 => resp2.json())
                        .then(resp2 => {
                            document.getElementById("PlaceB").value = resp2.features[0].properties.formatted;
                            places[1] = [resp2.features[0].properties.lat, resp2.features[0].properties.lon];
                            control = L.Routing.control({
                                waypoints: [
                                    places[0],
                                    places[1]
                                ],
                                router: router
                            });
                            control.addTo(mymap);
                    });
            });
        }
    } else {
        alert("Please enter a start and a endpoint!");
    }
}

function reset() {
    document.getElementById("PlaceA").value = "";
    document.getElementById("PlaceB").value = "";

    if (markers[0]) {
        markers[0].removeFrom(mymap);
    }
    if (markers[1]) {
        markers[1].removeFrom(mymap);
    }
    if (control) {
        mymap.removeControl(control);
    }
}

function getAddress(lat, lng, id) {
    fetch('https://api.geoapify.com/v1/geocode/reverse/?lat=' + lat + '&lon=' + lng + '&apiKey=' + apiKey, {method: 'GET'})
        .then(response => response.json())
        .then(response => {
            document.getElementById(id).value = response.features[0].properties.formatted;
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
    markers[0] = new L.marker([latitude, longitude], { });
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



function autocomplete(inp) {
    var currentFocus;
    var time = new Date();
    var timeCache = time.getTime();
    var isFetching = false;

    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;

        time = new Date();

        if (time.getTime() < timeCache + 1000 && !isFetching) {
            closeAllLists();

            if (!val) { return false;}
            currentFocus = -1;
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autodiv autocomplete-items");
            
            this.parentNode.appendChild(a);    

            isFetching = true;
            setTimeout(function(){
                if (val != inp.value) {
                    val = inp.value;
                }
                
                fetchData();
                isFetching = false;
            }, timeCache+1000-time.getTime());
        } else if (!isFetching) {
            closeAllLists();

            if (!val) { return false;}
            currentFocus = -1;
            
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autodiv autocomplete-items");
            
            this.parentNode.appendChild(a);    

            fetchData();
            isFetching = false;
        }

        timeCache = time.getTime();


        function fetchData() {
            fetch('https://api.geoapify.com/v1/geocode/autocomplete?text=' + val + '&apiKey=' + apiKey, {method: 'GET'})
                .then(response => response.json())
                .then(response => {
                    for (i = 0; i < response.features.length; i++) {
                        b = document.createElement("DIV");
                        b.setAttribute("class", "autodiv");
                        b.innerHTML = response.features[i].properties.formatted;
                        b.innerHTML += "<input type='hidden' value='" + response.features[i].properties.formatted + "' id='" + i + "'>";
                        b.addEventListener("click", function(e) {
                            inp.value = this.getElementsByTagName("input")[0].value;
                            latitude = response.features[this.getElementsByTagName("input")[0].id].properties.lat;
                            longitude = response.features[this.getElementsByTagName("input")[0].id].properties.lon;

                            if (inp.id == "PlaceA") {
                                places[0] = [latitude, longitude];
                                markers[0] = new L.marker([latitude, longitude], { });
                                markers[0].addTo(mymap);
                            } else if (inp.id == "PlaceB") {
                                places[1] = [latitude, longitude];
                                markers[1] = new L.marker([latitude, longitude], { });
                                markers[1].addTo(mymap);
                            }
                            closeAllLists();
                        });
                        a.appendChild(b);
                    }
            });
        }
    });


    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByClassName("autodiv");
        if (e.keyCode == 40) {
          currentFocus++;
          
          addActive(x);
        } else if (e.keyCode == 38) {
          currentFocus--;
          
          addActive(x);
        } else if (e.keyCode == 13) {
    
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
        }
    });

    function addActive(x) {
        if (!x) return false;

        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);

        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        var items = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < items.length; i++) {
            if (elmnt != items[i] && elmnt != inp) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}