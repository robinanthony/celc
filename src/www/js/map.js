
///// Adresse du geoserver avec son espace de travail
///// ip fac : 192.168.46.196:8080
var host = (typeof geoserver !== 'undefined' && typeof geoserver.host === 'string') ? geoserver.host : "192.168.46.196"
var port = (typeof geoserver !== 'undefined' && typeof geoserver.port === 'string') ? geoserver.port : "8080"
var adresse_geoserver = 'http://'+host+':'+port+'/geoserver/CELC';

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
            fill: new ol.style.Fill({color: 'rgb(150,9,11)'}),
            stroke: new ol.style.Stroke({color : 'rgb(150,9,11)', width: 2})
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
            stroke: new ol.style.Stroke({color : 'rgb(26,52,150)', width: 2})
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
            color: 'rgba(103,156,200,0.8)',
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
            color: 'rgba(255,45,23,0.8)',
            width: 5
        })
    })
});

var lignes_velo = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:lignes_velo'),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(205,205,205,0.8)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(15,255,233,0.8)',
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
            fill: new ol.style.Fill({color: 'rgba(34,230,32,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgb(10,164,0)', width: 5})
        })
    })
});

var parcs_relais_velo = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:parcs_relais_velo'),
    style: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({color: 'rgba(34,230,32,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgb(164,39,150)', width: 5})
        })
    })
});

var parkings_velo = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:parkings_velo'),
    style: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({color: 'rgba(34,230,32,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgb(164,133,23)', width: 2})
        })
    })
});

///// Création du view pour la carte
var view = new ol.View({
    center: ol.proj.fromLonLat([1.909251,47.902964]),
    minZoom: 13,
    maxZoom: 20,
    zoom: 14
});


/** ----- Création de la carte sur la target "map" ----- **/
var map = new ol.Map({
    target: 'map',
    layers: [
        osm,
        lignes_velo,
        lignes_tao_bus,
        lignes_tao_tram,
        arrets_tao_bus,
        arrets_tao_tram,
        stations_velo,
        parcs_relais_velo,
        parkings_velo

    ],
    view: view

});

/** ----- Affichage couches ----- **/

map.getView().on('change:resolution', function(evt) {
    var zoom = map.getView().getZoom();
    console.log(zoom);
    var radius;
    var radiusParking = 4;
    var widthb = 3;
    var widtht = 5;
    var widthParking = 2;

    if(zoom <= 13){
        radius = 2;
        radiusParking = 0;
    }

    else if(zoom >= 16){
        radius = 10;
        widthb = 6;
        widtht = 9;
        radiusParking = 7;
        if(zoom >=18){
            radiusParking = 10
            widthParking = 4
        }

    }
    else{
        radius = 7;
        radiusParking = 4
    }

    var newStyle_bus = new ol.style.Style({
        image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({color: 'rgba(0,0,150,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgb(26,52,150)', width: 2})
        })
    });

    var newStyle_tram = new ol.style.Style({
        image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({color: 'rgb(150,9,11)'}),
            stroke: new ol.style.Stroke({color : 'rgb(150,9,11)', width: 2})
        })
    });


    var newStyle_velo_station = new ol.style.Style({
        image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({color: 'rgba(34,230,32,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgb(10,164,0)', width: 5})
        })
    });

    var newStyle_velo_parc_relais = new ol.style.Style({
        image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({color: 'rgba(34,230,32,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgb(164,39,150)', width: 5})
        })
    });

    var newStyle_velo_parkings = new ol.style.Style({
        image: new ol.style.Circle({
            radius: radiusParking,
            fill: new ol.style.Fill({color: 'rgba(34,230,32,0.15)'}),
            stroke: new ol.style.Stroke({color : 'rgb(164,133,23)', width: widthParking})
        })
    });


    var newStyle_ligne_bus= new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(205,205,205,0.8)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(103,156,200,0.8)',
            width: widthb
        })
    });

    var newStyle_ligne_tram = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(205,205,205,0.8)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255,45,23,0.8)',
            width: widtht
        })
    });

    var newStyle_ligne_velo = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(205,205,205,0.8)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(15,255,233,0.8)',
            width: widthb
        })
    });

    arrets_tao_bus.setStyle(newStyle_bus);
    arrets_tao_tram.setStyle(newStyle_tram);
    stations_velo.setStyle(newStyle_velo_station);
    lignes_tao_bus.setStyle(newStyle_ligne_bus);
    lignes_tao_tram.setStyle(newStyle_ligne_tram);
    parcs_relais_velo.setStyle(newStyle_velo_parc_relais);
    parkings_velo.setStyle(newStyle_velo_parkings);
    lignes_velo.setStyle(newStyle_ligne_velo)

});

var init_map = function() {
    // Geolocalisation

    var geolocation = new ol.Geolocation({
        // enableHighAccuracy must be set to true to have the heading value.
        trackingOptions: {
          enableHighAccuracy: true
        },
        projection: view.getProjection()
      });

    // handle geolocation error.
    geolocation.on('error', function(error) {
        alert(error.message);
      });

    var accuracyFeature = new ol.Feature();
    geolocation.on('change:accuracyGeometry', function() {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    var positionFeature = new ol.Feature();
    positionFeature.setStyle(new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          color: '#3399CC'
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 2
        })
      })
    }));

    geolocation.on('change:position', function() {
      var coordinates = geolocation.getPosition();
      positionFeature.setGeometry(coordinates ?
        new ol.geom.Point(coordinates) : null);
    });

    new ol.layer.Vector({
      map: map,
      source: new ol.source.Vector({
        features: [accuracyFeature, positionFeature]
      })
    });

    geolocation.setTracking(true);

    geolocation.once('change:position', function() {
        var coordinates = geolocation.getPosition();
        positionFeature.setGeometry(coordinates ?
            new ol.geom.Point(coordinates) : null);
        var newPosition=ol.proj.transform(geolocation.getPosition(), 'EPSG:3857','EPSG:4326');
        map.getView().setCenter(ol.proj.fromLonLat([newPosition[0], newPosition[1]]));
    });

    map.getLayers().array_[2].setVisible($("#bus").is(":checked"));
    map.getLayers().array_[4].setVisible($("#bus").is(":checked"));
    map.getLayers().array_[3].setVisible($("#tram").is(":checked"));
    map.getLayers().array_[5].setVisible($("#tram").is(":checked"));
    map.getLayers().array_[6].setVisible($("#station_velo").is(":checked"));
    map.getLayers().array_[7].setVisible($("#parc_relais_velo").is(":checked"));
    map.getLayers().array_[8].setVisible($("#parkings_velo").is(":checked"));
    map.getLayers().array_[1].setVisible($("#piste_velo").is(":checked"));



    $("input:checkbox").each(function(){
        $(this).change(function functionName(){
            map.getLayers().array_[2].setVisible($("#bus").is(":checked"));
            map.getLayers().array_[4].setVisible($("#bus").is(":checked"));
            map.getLayers().array_[3].setVisible($("#tram").is(":checked"));
            map.getLayers().array_[5].setVisible($("#tram").is(":checked"));
            map.getLayers().array_[6].setVisible($("#station_velo").is(":checked"));
            map.getLayers().array_[7].setVisible($("#parc_relais_velo").is(":checked"));
            map.getLayers().array_[8].setVisible($("#parkings_velo").is(":checked"));
            map.getLayers().array_[1].setVisible($("#piste_velo").is(":checked"));

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
    var selectSingleClick = new ol.interaction.Select({multi: false});

    var selectElement = document.getElementById('info');

    var changeInteraction = function() {
        var currZoom = map.getView().getZoom();
        console.log(currZoom)
        if (select !== null) {
            map.removeInteraction(select);
        }
        select = selectSingleClick;
        if (select !== null) {
            map.addInteraction(select);
            select.on('select', function(e) {
                console.log(e.target.getFeatures().getArray());

                let selected = e.target.getFeatures().getArray()[0];
                // alert(getInfos(selected));

                console.log(selected.getId())
                var id = selected.getId().split('.')[1];
                var type = selected.getId().split('.')[0];
                var info = getInfos(selected);

                $("#modalInfoTitle").text(info);
                getSignalementInfo(type,id);

                $('#modalInfo').modal('show');

                setTimeout(() => {
                  sessionStorage.setItem("infoLoc",info);
                  sessionStorage.setItem("idLoc",id);
                  sessionStorage.setItem("typeLoc",type);
                }, 0)
            });
        }
    };

    var getInfos = function(elem) {
        console.log("ELEM  ",elem);
        let id = elem.getId().split('.')[0];
        let prop = elem.getProperties();

        switch (id) {
            case 'arrets_tao_bus':
                return `Arret de bus : ${prop["name"]}`;
            case 'arrets_tao_tram':
                return `Arret de tram : ${prop["name"]}`;
            case 'lignes_tao_bus':
                return `Ligne de bus ${prop["short_name"]} ${prop["long_name"]}`;
            case 'lignes_tao_tram':
                return `Ligne de tram ${prop["short_name"]} ${prop["long_name"]}`;
            case 'stations_velo':
                return `Arrêt vélo ${prop["name"]}`;
            case 'parcs_relais_velo':
                return `Parc relais vélo ${prop["name"]}`;
            case 'parkings_velo':
                return `${prop["name"]}`;
            case 'lignes_velo':
                return `${prop["name"]}`;
            default:
                return "";
        }
    };

    var getSignalementInfo = function (type, id) {
        // Create a request variable and assign a new XMLHttpRequest object to it.
        var request = new XMLHttpRequest()
        console.log("id : "+ id)
        // Open a new connection, using the GET request on the URL endpoint
        request.open('GET', 'http://localhost:5050/signalement/id_object/' + id, true)

        request.onload = function() {
            // Begin accessing JSON data here
            var data = JSON.parse(this.response)
            console.log("ca passe")
            console.log(data)

            // if (request.status >= 200 && request.status < 400){
            //     console.log("coucou")
            // }
            console.log(request.status)
        };

// Send request
        request.send()
    };

    $(document).ready(function () {

    // function getSignalementInfo(type,id){
      $.ajax({
  			type : 'GET',
  			url  : 'test.json',
  			success : function(response){
  				response = JSON.parse(response);
          $("#modal-body").text(response)
        }
      });
    // }
});
    $("#newSignalement").on("click",function(){
      document.location.href = "new_signalement.html";
    })

    /**
     * onchange callback on the select element.
     */
    changeInteraction();
}
