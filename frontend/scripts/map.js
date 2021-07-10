var mymap = L.map('map').setView([53.55, 9.99], 12);

L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);

var clr = "#ff2100";
L.rectangle([[90, 180], [-90, 9.9826]], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[90, 9.9604], [53.5688, 9.9826]], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[90, 9.9604], [-90, -180]], {color: clr, weight: 0}).addTo(mymap);
L.rectangle([[53.5606, 9.9604], [-90, 9.9826]], {color: clr, weight: 0}).addTo(mymap);