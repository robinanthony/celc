///// Adresse du geoserver avec son espace de travail
var adresse_geoserver = 'http://192.168.46.196:8080/geoserver/CELC';

///// Fonction permettant de récuperer les informations sur le GeoServeur
var getSource = function(lien, couche){
  // lien = 'adresse_du_geoserver/espace_de_travail'
  // couche = 'entrepot:couche'
          var source = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: function(extent, resolution, projection) {
              var proj = projection.getCode();
              var url = lien + '/ows?service=WFS&' +
                'version=1.0.0&request=GetFeature&typename=' + couche +
                '&outputFormat=application/json&srsname=' + proj + '&' +
                'bbox=' + extent.join(',') + ',' + proj;

              var xhr = new XMLHttpRequest();
              xhr.open('GET', url);
              var onError = function() {
                source.removeLoadedExtent(extent);
              }
              xhr.onerror = onError;
              xhr.onload = function() {
                if (xhr.status == 200) {
                  source.addFeatures(
                  source.getFormat().readFeatures(xhr.responseText));
                } else {
                  onError();
                }
              }
              xhr.send();
            },
            strategy: ol.loadingstrategy.bbox
          })
          return source;
        };


///// Création des différentes couches pour la map
var osm = new ol.layer.Tile({
            extent: ol.proj.transformExtent([1.7, 47.7, 2.1, 48.1],'EPSG:4326','EPSG:3857'),
            source: new ol.source.OSM({opaque:false})
        });

var arrets_tao_tram = new ol.layer.Vector({
          renderMode: 'image',
          source: getSource(adresse_geoserver, 'CELC:arrets_tao_tram'),
          style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({color: 'rgba(0,150,0,0.15)'}),
                    stroke: new ol.style.Stroke({color : 'rgba(0,150,0,1)', width: 2})
                })
            })
        });

var arrets_tao_bus = new ol.layer.Vector({
          renderMode: 'image',
          source: getSource(adresse_geoserver, 'CELC:arrets_tao_bus'),
          style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({color: 'rgba(0,0,150,0.15)'}),
                    stroke: new ol.style.Stroke({color : 'rgba(0,0,150,1)', width: 2})
                })
            })
        });

var lignes_tao = new ol.layer.Vector({
          renderMode: 'image',
          source: getSource(adresse_geoserver, 'CELC:lignes_tao'),
          style: new ol.style.Style({
              fill: new ol.style.Fill({
                  color: 'rgba(205,205,205,0.8)'
              }),
              stroke: new ol.style.Stroke({
                  color: 'rgba(100,205,205, 0.8)',
                  width: 3
              })
          })
        });


///// Création du view pour la carte
var view = new ol.View({
    center: ol.proj.fromLonLat([1.909251,47.902964]),
    zoom: 14
});

///// Création de la carte sur la target "map"
var map = new ol.Map({
    target: 'map',
    layers: [
        osm,
        arrets_tao_bus,
        arrets_tao_tram,
        lignes_tao
    ],
    view: view

});

map.getLayers().array_[1].setVisible($("#bus").is(":checked"))
map.getLayers().array_[2].setVisible($("#tram").is(":checked"))
map.getLayers().array_[3].setVisible($("#tram").is(":checked"))


$("input:checkbox").each(function(){
    $(this).change(function functionName(){
        map.getLayers().array_[1].setVisible($("#bus").is(":checked"));
        map.getLayers().array_[2].setVisible($("#tram").is(":checked"));
        map.getLayers().array_[3].setVisible($("#tram").is(":checked"));

    })
});

// map.on('singleclick', function(evt) {
//     document.getElementById('info').innerHTML = '';
//     var viewResolution = view.getResolution();
//     var url = arrets_tao.getSource().getGetFeatureInfoUrl(
//         evt.coordinate, viewResolution, view.getProjection(),
//         {'INFO_FORMAT': 'text/html'});
//
//     if (url) {
//         fetch(url)
//             .then(function (response) { return response.text(); })
//             .then(function (html) {
//                 document.getElementById('info1').innerHTML = html;
//             });
//     }
// });

var select = null; // ref to currently selected interaction

// select interaction working on "singleclick"
var selectSingleClick = new ol.interaction.Select();

var selectElement = document.getElementById('info');

var changeInteraction = function() {
    if (select !== null) {
        map.removeInteraction(select);
    }
    select = selectSingleClick;
    if (select !== null) {
        map.addInteraction(select);
        select.on('select', function(e) {
            console.log(e);

            let selected = e.target.getFeatures().getArray()[0];
            alert(getInfos(selected));
        });
    }
};

var getInfos = function(elem) {
    console.log("ELEM  ",elem);
    let id = elem.getId().split('.')[0];
    let prop = elem.getProperties();

    switch (id) {
        case 'arrets_tao_bus':
            return `Arret : ${prop["name"]}`;
            break;
        case 'arrets_tao_tram':
            return `Arret : ${prop["name"]}`;
            break;
        default:
            break;
    }
}




/**
 * onchange callback on the select element.
 */
changeInteraction();
