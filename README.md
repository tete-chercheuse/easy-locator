# Easy Locator


Easy Locator is a jquery plugin to load locations with Google Maps in any website using a google spreadsheet or an array of objects.

Dependencies : 

1. [markerclusterer](https://github.com/googlemaps/js-marker-clusterer)
2. [Jquery](https://jquery.com/)
3. [lodash](https://lodash.com/) (Only if you want use templates)

Add easy-locator in your web

    <script src="easy-locator.js"></script>

How to use it.
--------------

1. Create a Google spreadsheet like [this](https://docs.google.com/spreadsheets/d/1GsuoK3XyWJoiie1eq0qrd-2DxRVSQ0Ut7DkGI23Gq0s/edit?usp=sharing) , columns names need to be the same.
2. Go to:  "file > publish to the web" and verify the following fields 

	![spreadsheet](http://i.imgur.com/0GIrxtA.jpg?1) 
	
3. Copy the url and extract the spreadsheetId:

     Example: 
     
     docs.google.com/spreadsheets/d/**1QM92ghpvJpRBryStWI-PWcRhpBSsYPva4XCXUxieXNU**/pubhtml
     
     (bold text is the spreadsheetId)
     
4. Call easyLocator with your selector and pass your spreadsheetId and teh google maps apiKey
	```javascript
	$(yourContainer).easyLocator({
          spreadsheetId: '1QM92ghpvJpRBryStWI-PWcRhpBSsYPva4XCXUxieXNU',
          apiKey: 'YOUR GOOGLE MAP API KEY'
   	})
	```

5. Done.

After the call, the plugin will return the instance plugin created and you can use the method  **getMapInstance** to get the google map created. example: 

```javascript
var easyLocatorPlugin = $(yourContainer).easyLocator({
	  spreadsheetId: '1QM92ghpvJpRBryStWI-PWcRhpBSsYPva4XCXUxieXNU',
	  apiKey: 'YOUR GOOGLE MAP API KEY'
})
var currentGoogleMap = easyLocatorPlugin.getMapInstance();
```

You can use **currentGoogleMap** to do whatever you want.


**Note:   before of using this plugin, you must insert the CSS and dependencies**

    <link rel="stylesheet" type="text/css" href="easyLocator.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-marker-clusterer/1.0.0/markerclusterer_compiled.js"></script>


SpreadSheet columns:
--------------------

**title:**   Title of each locations, this will be use in the list.

**description:**  Description,it will only appear inside the infowindow.

**lat *(mandatory)*:**  Coordinate use by google maps (latitude).

**lng *(mandatory)*:**  Coordinate use by google maps (longitude).

*The most important part  when you add a location  in your spreadsheet, are the coordinates (lat, lng) together describe the exact location of a place in Google map.*

*If you want to know these coordinates,  you can use [this example](http://jsfiddle.net/kjy112/QvNUF/), just drag the marker and you will see the coordinates lat, lng*

easyLocator methods:
-----------------------
**getMapInstance:** return the google map instance created

**rebuild:** clean map and list with the new elements. These elements should have the same structure that the array of object

easyLocator properties:
-----------------------
**spreadsheetId (string):**  Google spreadsheetId 

**useMarkerCluster (boolean):**  If you want use the [cluster marker](https://github.com/googlemaps/js-marker-clusterer)

**markerClustererOptions (object):**  Marker clusterer options

**openInfowindowAfterClick (boolean):**  If you want open the infowindows after click on ine item in the list.

**myLocations (array objects):**  array of object with your locations instead of the Google Spreadsheed.

example array : 
	
```javascript
var data = [{
	title: '',
	description: '',
	image: '', 
	link: '',
	iconMarker: '',
	iconMarkerActive: '',
	lat: 12.9232,
	lng: -85.9206
}];
```
**showListOnDesktop (boolean):** If you want hide the left list items on desktop version, The map will get width 100% automatically

**infoWindowFields (array):** by default easyLocator will only set the properties that are needed by the plugin, the rest of columns will be ignore. But if you have more columns in the spreadsheet and you want them in the array of locations you can set the names of these columns in this property and each element of the array will have these properties with the corresponding values.

Example: 
```javascript
$('#locatorList').easyLocator({
   spreadsheetId: '1GsuoK3XyWJoiie1eq0qrd-2DxRVSQ0Ut7DkGI23Gq0s',   
   infoWindowFields: ['address','timeopen','timeclosed']   
}); 
```

**infoWindowCustomClass (string):** This class will be added in the infoWindow container. You can use it to customize the element.

**contentTemplate (string):** template underscorejs with the correct format according to [lodash](https://lodash.com/)

**mapOptions (Object):** Object with options of google maps.  For more info about what options use, please visit: [Google Maps](https://developers.google.com/maps/documentation/javascript/reference)

**centerMapOnLocation (boolean):** By default the map is centered in all markers, set false if you want use your own location with the  "mapOptions" property

**apiKey (string and Mandatory):** You need create an api key and put it here. Follow these [steps](https://developers.google.com/maps/documentation/javascript/get-api-key)

If you do not add the apiKey the map won't load and you will get this error:
![error api key](http://i.imgur.com/IRYSwVt.png?1)

Events:
-----------------------

You can listen all events in this way:
```javascript
var easyLocatorPlugin = $(yourContainer).easyLocator({
	  spreadsheetId: '1QM92ghpvJpRBryStWI-PWcRhpBSsYPva4XCXUxieXNU',
	  apiKey: 'YOUR GOOGLE MAP API KEY'
});

easyLocatorPlugin.element.on('event', function(e){
	  console.log(e);
});
```
 You will receive an object with all details about the event.

**loadingMap:** loading the map.

**templateClosed:** the template was closed

**locationClicked:** location was clicked, in the list or marker on the map.

**infoWindowClosed:** infowindow was closed

**mapLoaded:** map was loaded correctly.

**rebuildDone:** rebuild done

**getDataDone:** When the data were successfully load from the spreadsheet, return the array of locations


How to use templates:
-----------------------

1. Add [lodash](https://lodash.com/) dependency
2. Set your template in the property "contentTemplate" with the correct format. When you set this, easyLocator will not use the infowindow anymore, instead will give you an empty container element with the class "locator-map-template".
3. All the content of you template will be inserted inside of "locator-map-template" element. Is your job add all the styles and media queries needed.
4. You need always add an element with the class "close", this will be used by easyLocator to closed the template.
5. Add you own styles.
6. Done


If you have problems, please see the examples
