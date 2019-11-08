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


/** ----- Création des différentes couches pour la map ----- **/

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

var lignes_tao_bus = new ol.layer.Vector({
          renderMode: 'image',
          source: getSource(adresse_geoserver, 'CELC:lignes_tao_bus'),
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

var lignes_tao_tram = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:lignes_tao_tram'),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(205,205,205,0.8)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(205,100,205, 0.8)',
            width: 3
        })
    })
});

var stations_velo = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:stations_velo'),
    style: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({color: 'rgba(230,0,0,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgba(255,0,0,1)', width: 2})
        })
    })
});

///// Création du view pour la carte
var view = new ol.View({
    center: ol.proj.fromLonLat([1.909251,47.902964]),
    minZoom: 13,
    zoom: 14
});

///// Création de la carte sur la target "map"
var map = new ol.Map({
    target: 'map',
    layers: [
        osm,
        lignes_tao_bus,
        lignes_tao_tram,
        //piste_cyclable
        arrets_tao_bus,
        arrets_tao_tram,
        stations_velo
    ],
    view: view

});

/** ----- Affichage couches ----- **/
 var currZoom = map.getView().getZoom();

map.getView().on('change:resolution', function(evt) {
    var zoom = map.getView().getZoom();
    var radius;
    var widthb = 3;
    var widtht = 4
    if(zoom <= 13)
        radius = 2;
    else if(zoom >= 16){
        radius = 10;
        widthb = 6
        widtht = 8
    }
    else
        radius = 7;

    var newStyle_bus = new ol.style.Style({
        image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({color: 'rgba(0,0,150,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgba(0,0,150,1)', width: 2})
        })
    });

    var newStyle_tram = new ol.style.Style({
        image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({color: 'rgba(0,150,0,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgba(0,150,0,1)', width: 2})
        })
    });

    var newStyle_velo = new ol.style.Style({
        image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({color: 'rgba(230,0,0,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgba(255,0,0,1)', width: 2})
        })
    });

    var newStyle_ligne_bus= new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(205,205,205,0.8)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(100,205,205, 0.8)',
            width: widthb
        })
    });

    var newStyle_ligne_tram = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(205,205,205,0.8)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(205,100,205, 0.8)',
            width: widtht
        })
    });
    arrets_tao_bus.setStyle(newStyle_bus);
    arrets_tao_tram.setStyle(newStyle_tram);
    stations_velo.setStyle(newStyle_velo);
    lignes_tao_bus.setStyle(newStyle_ligne_bus);
    lignes_tao_tram.setStyle(newStyle_ligne_tram);


});


map.getLayers().array_[1].setVisible($("#bus").is(":checked"));
map.getLayers().array_[3].setVisible($("#bus").is(":checked"));
map.getLayers().array_[2].setVisible($("#tram").is(":checked"));
map.getLayers().array_[4].setVisible($("#tram").is(":checked"));
map.getLayers().array_[5].setVisible($("#station_velo").is(":checked"));


$("input:checkbox").each(function(){
    $(this).change(function functionName(){
        map.getLayers().array_[1].setVisible($("#bus").is(":checked"));
       map.getLayers().array_[3].setVisible($("#bus").is(":checked"));
        map.getLayers().array_[2].setVisible($("#tram").is(":checked"));
        map.getLayers().array_[4].setVisible($("#tram").is(":checked"));
        map.getLayers().array_[5].setVisible($("#station_velo").is(":checked"));
    })
});

// if (currZoom <= 13) {
//     map.getLayers().array_[3].setVisible(false);
//     map.getLayers().array_[4].setVisible(false);
// }
// else{
//     map.getLayers().array_[3].setVisible($("#bus").is(":checked"));
//     map.getLayers().array_[4].setVisible($("#tram").is(":checked"));
// }
//
// map.on('moveend', function(e) {
//     currZoom = map.getView().getZoom();
//     console.log(currZoom)
//     if (currZoom <= 13) {
//         map.getLayers().array_[3].setVisible(false);
//         map.getLayers().array_[4].setVisible(false);
//     }
//     else{
//         if ($("#bus").is(":checked")){
//             map.getLayers().array_[3].setVisible(true);
//         }
//         else{
//             map.getLayers().array_[3].setVisible(false);
//         }
//         if($("#tram").is(":checked")){
//             map.getLayers().array_[4].setVisible(true);
//         }
//         else{
//             map.getLayers().array_[4].setVisible(false);
//         }
//     }
//
// });


/** ------ Récupération infos ----- **/

var select = null; // ref to currently selected interaction

// select interaction working on "singleclick"
var selectSingleClick = new ol.interaction.Select();

var selectElement = document.getElementById('info');

var changeInteraction = function() {
    console.log(currZoom)
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
            return `Arret bus : ${prop["name"]}`;
        case 'arrets_tao_tram':
            return `Arret tram : ${prop["name"]}`;
        case 'lignes_tao_bus':
            return `Ligne bus ${prop["short_name"]} ${prop["long_name"]}`;
        case 'lignes_tao_tram':
            return `Ligne tram ${prop["short_name"]} ${prop["long_name"]}`;
        default:
            break;
    }
}




/**
 * onchange callback on the select element.
 */
changeInteraction();
