/*!
 * jQuery easyLocator v2.0
 * https://github.com/SaulBurgos/easyLocator
 *
 * Copyright Saul Burgos
 * http://saulburgos.com/
 *
 * Date: 1/11/2016
 */

(function($) {
    var self = this;
    var deferEvents = $.Deferred();

    this.easyLocatorMethods = {
        element: null,
        locations: [],
        onEvents: deferEvents.promise(),
        locationActive: null,
        htmlPlug: '<div class="locator-map-loading"></div>' +
            '<div id="locator-map" class="locator-map-map"></div>' +
            '<div class="locator-map-template"></div>',
        options: {
            mapContainer: undefined,
            map: undefined,
            mapOptions: undefined,
            isAPIloaded: false,
            myLocations: [],
            defaultMarkerIcon: '',
            centerMapOnLocation: true,
            infoWindowFields: [],
            infoWindowCustomClass: 'locator-map-infowindow',
            openInfowindowAfterClick: false,
            contentTemplate: '',
            useMarkerCluster: false,
            markerClustererOptions: {
                maxZoom: 12
            }
        },
        loadScripts: function(container) {
            this.showHideLoader('show');
            var scriptMapUrl = 'https://maps.googleapis.com/maps/api/js?libraries=places' +
                '&callback=window.easyLocatorMethods.loadMap';

            if (typeof google === 'object' && typeof google.maps === 'object') {
                self.easyLocatorMethods.options.isAPIloaded = true;
                this.loadMap();
            } else {

                if (typeof this.options.apiKey !== 'undefined') {
                    scriptMapUrl = 'https://maps.googleapis.com/maps/api/js?libraries=places' +
                        '&key=' + this.options.apiKey + '&callback=window.easyLocatorMethods.loadMap';
                }
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = scriptMapUrl
                document.body.appendChild(script);
            }

        },
        loadMap: function() {

            self.easyLocatorMethods.triggerEvent({
                eventName: 'loadingMap',
                data: {}
            });

            this.options.isAPIloaded = true;
            var mapOptions;

            if (typeof this.options.mapOptions === 'undefined') {
                mapOptions = {
                    zoom: 8,
                    center: new google.maps.LatLng(-34.397, 150.644),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
            } else {
                mapOptions = this.options.mapOptions;
            }

            this.options.map = new google.maps.Map(document.getElementById('locator-map'), mapOptions);

            this.options.markerClusterer = new MarkerClusterer(this.options.map, null, this.options.markerClustererOptions);

            google.maps.event.addListenerOnce(this.options.map, 'idle', function() {

                self.easyLocatorMethods.triggerEvent({
                    eventName: 'mapLoaded',
                    data: {}
                });

                if (typeof self.easyLocatorMethods.options.spreadsheetId !== 'undefined') {
                    self.easyLocatorMethods.getJsonData();
                    return;
                }

                if (self.easyLocatorMethods.options.myLocations.length > 0) {
                    self.easyLocatorMethods.loadMyLocations();
                }

            });

            if (this.options.contentTemplate === '') {
                this.options.infoWindow = new google.maps.InfoWindow({ maxWidth: 400 });

                google.maps.event.addListener(this.options.infoWindow, 'closeclick', function() {
                    self.easyLocatorMethods.triggerEvent({
                        eventName: 'infoWindowClosed',
                        data: {}
                    });
                });
            }

        },
        showHideLoader: function(action) {
            if (action === 'show') {
                $('.locator-map-loading').show();
            } else {
                $('.locator-map-loading').hide();
            }
        },
        getJsonData: function() {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://spreadsheets.google.com/feeds/list/' + this.options.spreadsheetId + '/od6/public/values?hl=en_US&alt=json' +
                '&callback=window.easyLocatorMethods.successGetJsonData';
            script.async = true;
            document.body.appendChild(script);
        },
        createLocation: function(info) {

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(info.lat, info.lng),
                map: this.options.map,
                title: info.title
            });

            if ((info.markerIcon && info.markerIcon !== '') || this.options.defaultMarkerIcon !== '') {
                marker.setIcon({
                    url: (info.markerIcon && info.markerIcon !== '') ? info.markerIcon : this.options.defaultMarkerIcon,
                    scaledSize: new google.maps.Size(32, 32)
                });
            }

            var newLocation = {
                index: info.index,
                marker: marker,
                active: false
            };

            if (this.options.useMarkerCluster) {
                this.options.markerClusterer.addMarker(marker);
            }

            return {
                location: newLocation,
            };
        },
        successGetJsonData: function(json) {

            for (var i = 0; i < json.feed.entry.length; i++) {
                var entry = json.feed.entry[i];

                var newLocation = this.createLocation({
                    index: i,
                    lat: entry.gsx$lat.$t,
                    lng: entry.gsx$lng.$t,
                });

                if (this.options.infoWindowFields.length > 0) {
                    this.options.infoWindowFields.forEach(function(element, index) {
                        if (entry.hasOwnProperty('gsx$' + element)) {
                            newLocation.location[element] = entry['gsx$' + element].$t;
                        }
                    });
                }

                this.locations.push(newLocation.location);
            }

            this.loadItemsOnList();

            self.easyLocatorMethods.triggerEvent({
                eventName: 'getDataDone',
                data: this.locations
            });
        },
        loadMyLocations: function() {
            for (var i = 0; i < this.options.myLocations.length; i++) {
                var entry = this.options.myLocations[i];

                entry.index = i;
                var newLocation = this.createLocation(entry);
                //to keep the original properties
                $.extend(newLocation.location, entry);

                this.locations.push(newLocation.location);
            }

            this.loadItemsOnList();

            self.easyLocatorMethods.triggerEvent({
                eventName: 'getDataDone',
                data: this.locations
            });
        },
        loadItemsOnList: function() {
            this.attachEventLocations();
            this.showHideLoader('hide');

            if (this.options.centerMapOnLocation) {
                this.centerMapOnLocations();
            }
        },
        centerMapOnLocations: function() {
            var bounds = new google.maps.LatLngBounds();

            for (var i = 0; i < this.locations.length; i++) {
                bounds.extend(this.locations[i].marker.getPosition());
            }

            this.options.map.fitBounds(bounds);
        },
        attachEventLocations: function() {
            function createEvent(location) {
                google.maps.event.addListener(location.marker, 'click', function() {

                    if (self.easyLocatorMethods.options.contentTemplate === '') {
                        self.easyLocatorMethods.openInfoWindow(location);
                    } else {
                        self.easyLocatorMethods.openTemplate(location);
                    }

                    self.easyLocatorMethods.triggerEvent({
                        eventName: 'locationClicked',
                        data: location
                    });
                });
            }

            for (var i = 0; i < this.locations.length; i++) {
                createEvent(this.locations[i]);
            }

            $(this.options.mapContainer).on('click', '.close', function() {
                self.easyLocatorMethods.closeTemplate();
            });
        },
        openTemplate: function(location) {
            var compiled = _.template(this.options.contentTemplate);
            var containerTemplate = $(this.options.mapContainer).find('.locator-map-template');
            containerTemplate.html(compiled(location));
            containerTemplate.show();
        },
        triggerEvent: function(data) {
            deferEvents.notify(data);
        },
        closeTemplate: function() {
            $(this.options.mapContainer).find('.locator-map-template').hide();

            self.easyLocatorMethods.triggerEvent({
                eventName: 'templateClosed',
                data: {}
            });
        },
        openInfoWindow: function(location) {
            this.locationActive = location;

            var innerHtml = '';

            if (this.options.infoWindowFields.length > 0) {
                this.options.infoWindowFields.forEach(function(element, index) {
                    if (location.hasOwnProperty(element)) {
                        innerHtml += '<div class="' + element + '">' + location[element] + '</div>';
                    }
                });
            }

            var contentHTML = '<div id="locator-map-infowindow" class="' + self.easyLocatorMethods.options.infoWindowCustomClass + '">' + innerHtml + '</div>';
            this.options.infoWindow.setContent(contentHTML);
            this.options.infoWindow.open(this.options.map, location.marker);
        },
        getMapInstance: function() {
            return this.options.map;
        },
        cleanMap: function() {
            for (var i = 0; i < this.locations.length; i++) {
                this.locations[i].marker.setMap(null);
            }

            if (this.options.useMarkerCluster) {
                this.options.markerClusterer.clearMarkers();
            }
        },
        rebuild: function(newLocations) {
            this.cleanMap();

            this.locations = [];

            for (var i = 0; i < newLocations.length; i++) {
                var entry = newLocations[i];
                var currentPosition;

                if (entry.marker) {
                    currentPosition = entry.marker.getPosition();
                } else {
                    currentPosition = new google.maps.LatLng(entry.lat, entry.lng)
                }

                var marker = new google.maps.Marker({
                    position: currentPosition,
                    map: this.options.map,
                    title: entry.title
                });

                if (typeof entry.iconMarker !== 'undefined' && entry.iconMarker !== '') {
                    marker.setOptions({
                        icon: {
                            url: entry.iconMarker,
                            scaledSize: new google.maps.Size(32, 32)
                        }
                    });
                }

                var newItem = {
                    index: i,
                    active: false
                };

                $.extend(newItem, entry);
                newItem.marker = marker;

                if (this.options.useMarkerCluster) {
                    this.options.markerClusterer.addMarker(marker);
                }

                this.locations.push(newItem);
            }

            self.easyLocatorMethods.triggerEvent({
                eventName: 'rebuildDone',
                data: {}
            });

        }
    };

    $.fn.easyLocator = function(options) {
        //custom contain selector to convert to handle Case-Insensitive
        jQuery.expr[':'].contains_ = function(a, i, m) {
            return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
        };

        self.easyLocatorMethods.element = this;

        self.easyLocatorMethods.element.addClass('locator-map');

        self.easyLocatorMethods.onEvents.progress(function(e) {
            self.easyLocatorMethods.element.trigger({
                type: e.eventName,
                params: e.data
            });
        });

        self.easyLocatorMethods.element.html(self.easyLocatorMethods.htmlPlug);
        // This is the easiest way to have default options.
        self.easyLocatorMethods.options = $.extend(self.easyLocatorMethods.options, options);
        self.easyLocatorMethods.options.mapContainer = this;
        self.easyLocatorMethods.loadScripts();

        return self.easyLocatorMethods;
    };

}(jQuery));
