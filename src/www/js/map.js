
var view = new ol.View({
    center: ol.proj.fromLonLat([1.909251,47.902964]),
    zoom: 14
});


var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            extent: ol.proj.transformExtent([1.7,47.7,2.1,48.1],'EPSG:4326','EPSG:3857'),
            source: new ol.source.OSM()
        })
    ],
    view: view

});