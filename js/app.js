'use strict';

var Locations = [{
    name: 'Dosa Place',
    lat: 37.548270,
    long: -121.988572,
    street: '41043 Fremont Blvd',
    city: 'Fremont'
}, {
    name: 'Northwestern Polytechnic University ',
    lat: 37.481393,
    long: -121.925175,
    street: '47671 Westinghouse Dr',
    city: 'Fremont'
}, {
    name: 'fremont hindu temple ',
    lat: 37.519730,
    long: -121.952466,
    street: '3676 Delaware Dr',
    city: 'Fremont'
}, {
    name: 'Mission Peaks',
    lat: 37.554876,
    long: -121.967387,
    street: '1401 Red Hawk Cir',
    city: 'Fremont'
}, {
    name: 'Lake Elizabeth ',
    lat: 37.547761,
    long: -121.965438,
    street: '40000 Paseo Padre Pkwy',
    city: 'Fremont'
}, {
    name: 'Cine Grand Fremont 7 ',
    lat: 37.554058,
    long: -121.979611,
    street: '39160 Paseo Padre Pkwy',
    city: 'Fremont'
}];

// Declaring global variables now to satisfy strict mode
var map;
var clientID;
var clientSecret;
var Location = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.URL = "";
    this.street = data.street;
    this.city = data.city;
    //adding google street view URL
    var address = this.street + this.city;
    var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=100x50&location=' + address;
    this.visible = ko.observable(true);

    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;
    $.getJSON(foursquareURL).done(function(data) {
        var results = data.response.venues[0];
        self.URL = results.url;
        if (typeof self.URL === 'undefined') {
            self.URL = "";
        }
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
    }).fail(function() {
        alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
    });

    this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";

    this.infoWindow = new google.maps.InfoWindow({
        content: self.contentString
    });

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.long),
        map: map,
        title: data.name
    });

    this.showMarker = ko.computed(function() {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function() {
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
            '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" +
            '<div class="content">' + self.street + "</div>" +
            '<div class="content">' + self.city + "</div>" +
            '<img class="bgimg" src="' + streetviewUrl + '">';

        self.infoWindow.setContent(self.contentString);

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100);
    });

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function AppViewModel() {
    var self = this;

    this.searchTerm = ko.observable("");

    this.locationList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {
            lat: 37.523480,
            lng: -122.001164
        }
    });

    // Foursquare API settings
    clientID = "LSQD4RFA5YOQQTR3ZMM2DVYOE53NCZ34JLPTOKST5F3OAPGH";
    clientSecret = "IUAY51ITKG2FTNIQCMGBYPIMZ5HFKJTC3CZEVGSUBDXRSYWQ";

    Locations.forEach(function(locationItem) {
        self.locationList.push(new Location(locationItem));
    });

    this.filteredList = ko.computed(function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
    this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}

function errorHandling() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}