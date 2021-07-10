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

L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);

L.rectangle([[90, 180],         [-90, 9.9826]       ], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[90, 9.9604],      [53.5688, 9.9826]   ], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[90, 9.9604],      [-90, -180]         ], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[53.5606, 9.9604], [-90, 9.9826]       ], {color: clr, weight: 0}).addTo(mymap);

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