
///// Adresse du geoserver avec son espace de travail
///// ip fac : 192.168.46.196:8080
var host_geoserver = (typeof geoserver !== 'undefined' && typeof geoserver.host === 'string') ? geoserver.host : "192.168.46.196"
var port_geoserver = (typeof geoserver !== 'undefined' && typeof geoserver.port === 'string') ? geoserver.port : "8080"
var adresse_geoserver = 'http://'+host_geoserver+':'+port_geoserver+'/geoserver/CELC';

var host_api = (typeof api !== 'undefined' && typeof api.host === 'string') ? api.host : "localhost"
var port_api = (typeof api !== 'undefined' && typeof api.port === 'string') ? api.port : "9152"
var adresse_api = 'http://'+host_api+':'+port_api;

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

var getMarkerImage = function(colorFill, colorText, text, colorStroke = null) {
    if (colorStroke === null) {
        colorStroke = colorFill;
    }

    var svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     version="1.1"
     viewBox="0 0 9.5249996 13.229167"
     height="50"
     width="36">
    <path d="m 4.7625116,13.015004 
             c -0.758055,0 
             -4.54833704,-4.8944398 
             -4.54833704,-8.2828998 
             0,-2.44722 
             2.08465404,-4.51795005 
             4.54833704,-4.51795005 
             2.463684,0 
             4.548337,2.07073005 
             4.548337,4.51795005 
             0,3.38846 
             -3.790281,8.2828998 
             -4.548337,8.2828998 z"
          style="fill:${colorFill};
                 fill-opacity:1;
                 stroke:${colorStroke};
                 stroke-width:0.4283258;
                 stroke-linecap:butt;
                 stroke-linejoin:miter;
                 stroke-miterlimit:4;
                 stroke-dasharray:none;
                 stroke-opacity:1;
                 paint-order:normal" />
    <text y="6.6367936"
          x="4.746572"
          style="font-style:normal;
                 font-weight:normal;
                 font-size:5.03679419px;
                 line-height:1.25;
                 font-family:sans-serif;
                 letter-spacing:0px;
                 word-spacing:0px;
                 text-anchor:middle;
                 fill:${colorText};
                 fill-opacity:1;
                 stroke:none;
                 stroke-width:0.03777595">
        ${text}
    </text>
</svg>`;

    return "data:image/svg+xml," + escape(svg);
}

var getSignalementStyle = function(type_signalement, color = "#ef5646") {
    return [
        new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 1],
                src: getMarkerImage(color, "#ffffff", type_signalement.substring(0,1).toUpperCase())
            }))
        })
    ]
}

var getSelectedStyle = function(feature, resolution) {
    if (feature.getKeys().includes("type_signalement")) {
        type_signalement = feature.get('type_signalement');
        return [
            new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 1],
                    src: getMarkerImage("#0099FF", "#ffffff", type_signalement.substring(0,1).toUpperCase(), "#ffffff")
                }))
            })
        ]
    } else {
        return (new ol.interaction.Select().getOverlay().getStyleFunction())(feature, resolution);
    }
}

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

var signalements_arrets_tao_tram = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:signalements_arrets_tao_tram'),
    style: (feature, resolution) => getSignalementStyle(feature.get('type_signalement'), 'rgba(255,45,23,0.95)')
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

var signalements_arrets_tao_bus = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:signalements_arrets_tao_bus'),
    style: (feature, resolution) => getSignalementStyle(feature.get('type_signalement'), 'rgba(103,156,200,0.95)')
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

var signalements_lignes_tao_bus = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:signalements_lignes_tao_bus'),
    style: (feature, resolution) => getSignalementStyle(feature.get('type_signalement'), 'rgba(103,156,200,0.95)')
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

var signalements_lignes_tao_tram = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:signalements_lignes_tao_tram'),
    style: (feature, resolution) => getSignalementStyle(feature.get('type_signalement'), 'rgba(255,45,23,0.95)')
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

var signalements_lignes_velo = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:signalements_lignes_velo'),
    style: (feature, resolution) => getSignalementStyle(feature.get('type_signalement'), 'rgba(15,255,233,0.95)')
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

var signalements_stations_velo = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:signalements_stations_velo'),
    style: (feature, resolution) => getSignalementStyle(feature.get('type_signalement'), 'rgba(51, 178, 41, 0.95)')
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

var signalements_parcs_relais_velo = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:signalements_parcs_relais_velo'),
    style: (feature, resolution) => getSignalementStyle(feature.get('type_signalement'), 'rgba(176, 49, 162, 0.95)')
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

var signalements_parkings_velo = new ol.layer.Vector({
    renderMode: 'image',
    source: getSource(adresse_geoserver, 'CELC:signalements_parkings_velo'),
    style: (feature, resolution) => getSignalementStyle(feature.get('type_signalement'), 'rgba(209, 172, 43, 0.95)')
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
        parkings_velo,
        signalements_lignes_velo,
        signalements_lignes_tao_bus,
        signalements_lignes_tao_tram,
        signalements_arrets_tao_bus,
        signalements_arrets_tao_tram,
        signalements_stations_velo,
        signalements_parcs_relais_velo,
        signalements_parkings_velo,
    ],
    view: view

});

/** ----- Affichage couches ----- **/

map.getView().on('change:resolution', function(evt) {
    var zoom = map.getView().getZoom();
    // console.log(zoom);
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


/** ------ Récupération infos ----- **/

var select = new ol.interaction.Select({style: getSelectedStyle});
map.addInteraction(select);
select.on('select', function(e) {
    layers_features = [
        arrets_tao_bus, 
        arrets_tao_tram, 
        lignes_tao_bus, 
        lignes_tao_tram, 
        lignes_velo, 
        parcs_relais_velo, 
        parkings_velo, 
        stations_velo
    ];
    layers_signalements = [
        signalements_arrets_tao_bus, 
        signalements_arrets_tao_tram, 
        signalements_lignes_tao_bus, 
        signalements_lignes_tao_tram, 
        signalements_lignes_velo, 
        signalements_parcs_relais_velo, 
        signalements_parkings_velo, 
        signalements_stations_velo
    ];
    console.log(e, e.selected);

    let selected = e.selected[0];

    if (layers_features.includes(e.target.getLayer(selected))) {
        var id = selected.getId().split('.')[1];
        var type = selected.getId().split('.')[0];
        var info = getInfosFeature(selected);

        var coord = ol.proj.toLonLat(e.mapBrowserEvent.coordinate, map.getView().getProjection())

        console.log(getGeoPoint(coord), type, id);

        getSignalementInfo(type, id, modalInfoGetEmptyContent());

        modalInfoSetTitle(info);
        modalInfoSetButtons(['newSignal', 'close'])

        modalInfoShow();

        setTimeout(() => {
            sessionStorage.setItem("infoLoc",info);
            sessionStorage.setItem("idLoc",id);
            sessionStorage.setItem("typeLoc",type);
            sessionStorage.setItem("coordLoc",getGeoPoint(coord));
        }, 0)
    }

    else if (layers_signalements.includes(e.target.getLayer(selected))) {
        console.log(selected);

        objet = getSignalementObjet(selected.getId().split('.')[1])

        info = getInfosSignalement(selected, objet);

        modalInfoSetTitle(info);
        modalInfoSetContent((selected.get('commentaire') == "" || selected.get('commentaire') === null) ? 'Pas de commentaire' : selected.get('commentaire'))
        modalInfoSetButtons(['close'])

        modalInfoShow();
    }

});

var modalInfoSetTitle = function(title) {
    $("#modalInfoTitle").text(title);
}

var modalInfoSetContent = function(content) {
    $("#modalInfoBody").html(content);
}

var modalInfoGetEmptyContent = function(content) {
    $("#modalInfoBody").empty();
    return $("#modalInfoBody");
}

var modalInfoSetButtons = function(buttons) {
    $("#modalInfoButtons").empty();
    for (button of buttons) {
        switch(button) {
            case 'close':
                $("#modalInfoButtons").append('<button type="button" class="btn btn-secondary" data-dismiss="modal">Fermer</button>');
                break;
            case 'newSignal':
                $("#modalInfoButtons").append('<button type="button" id="newSignalement" class="btn btn-primary">Nouveau signalement</button>');
                break;
        }
    }
}

var modalInfoShow = function() {
    $('#modalInfo').modal('show');
}

var getInfosFeature = function(elem) {
    console.log("ELEM  ",elem);
    let id = elem.getId().split('.')[0];
    let prop = elem.getProperties();

    switch (id) {
        case 'arrets_tao_bus':
            return `Arret de bus : ${prop["name"]}`;
        case 'arrets_tao_tram':
            return `Arret de tram : ${prop["name"]}`;
        case 'lignes_tao_bus':
            return `Ligne de bus ${prop["name"]} ${prop["long_name"]}`;
        case 'lignes_tao_tram':
            return `Ligne de tram ${prop["name"]} ${prop["long_name"]}`;
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

var getTypeObjetDisplay = function(type_objet, objet) {
    switch (type_objet) {
        case 'arrets_tao_bus':
            return `l'arrêt de bus ${objet["name"]}`;
        case 'arrets_tao_tram':
            return `l'arrêt de tram ${objet["name"]}`;
        case 'lignes_tao_bus':
            return `la ligne de bus ${objet["name"]} ${objet["long_name"]}`;
        case 'lignes_tao_tram':
            return `la ligne de tram ${objet["name"]} ${objet["long_name"]}`;
        case 'stations_velo':
            return `l'arrêt vélo ${objet["name"]}`;
        case 'parcs_relais_velo':
            return `le parc relais vélo ${objet["name"]}`;
        case 'parkings_velo':
            return `le parking vélo ${objet["name"]}`;
        case 'lignes_velo':
            return `la piste cyclable ${objet["name"]}`;
    }
}

var getInfosSignalement = function(elem, objet) {
    let id = elem.getId().split('.')[0];
    let signalement = elem.getProperties();

    let infos = "";

    switch(signalement.type_signalement) {
        case "retard":
            infos = `Retard de ${signalement.retard} min`;
            break;
        case "accident":
            infos = "Accident";
            break;
        case "travaux":
            infos = "Travaux";
            break;
        case "baree":
            infos = "Route barée";
            break;
        case "degradation":
            infos = "Dégradation";
            break;
    }

    infos += ` sur ${getTypeObjetDisplay(signalement.type_object, objet)}`;

    return infos;
};

var getGeoPoint = function(coord) {
    return `Point(${coord[0]} ${coord[1]})`
}

var getSignalementInfo = function (type, id, divContent) {

    $.ajax({
        type : 'GET',
        url  : `${adresse_api}/signalement/type_object/${type}/id_object/${id}`,
        success : function(response) {
            // Begin accessing JSON data here
            console.log("ca passe")
            var data = response;
            console.log(data)
            if(data["signalements"] !== undefined){

                // for(const sign in data["signalements"]){
                //     console.log(data[sign])
                // }

                let type_display = "";
                (data["signalements"]).forEach(signalement => {

                    switch(signalement.type_signalement) {
                        case "retard":
                            type_display = `Retard`;
                            break;
                        case "accident":
                            type_display = "Accident";
                            break;
                        case "travaux":
                            type_display = "Travaux";
                            break;
                        case "baree":
                            type_display = "Route barée";
                            break;
                        case "degradation":
                            type_display = "Dégradation";
                            break;
                    }

                    var delay = ""
                    if(signalement.type_signalement == "retard")
                        delay = signalement.retard + "mins"

                    var contenu = `
<div class="row">
    <div class="col-12" id="signal_list_${signalement.id}">
        <div class="card">
            <div class="card-header" 
                 id="headingOne_${signalement.id}" 
                 data-toggle="collapse"
                 data-target="#collapseOne_${signalement.id}" 
                 aria-expanded="true" 
                 aria-controls="collapseOne_${signalement.id}">
                <h2 class="mb-0">
                    <button class="btn col-12 " type="button">
                        <div class="row">
                            <div class="col col-sm-9 text-left mb-0">
                                ${type_display}
                            </div>
                            <div class="col col-sm-3 text-right mb-0">
                                <span>${delay}</span>
                            </div>
                        </div>
                    </button>
                </h2>
            </div>
            <div id="collapseOne_${signalement.id}" 
                 class="collapse" 
                 aria-labelledby="headingOne_${signalement.id}" 
                 data-parent="#signal_list_${signalement.id}">
                <div class="card-body">
                    ${(signalement.commentaire == "" || signalement.commentaire === null) ? 'Pas de commentaire' : signalement.commentaire}
                </div>
            </div>
        </div>
    </div>
</div>`

                    divContent.append(contenu);
                });
            }
        },
        error : function(xhr, ajaxOptions, thrownError) {
            console.log(xhr.responseText);
            console.log(thrownError);
        },
    });
};

var getSignalementObjet = function (id) {
    objet = null;

    $.ajax({
        type : 'GET',
        url  : `${adresse_api}/signalement/${id}/object`,
        async: false,
        timeout: 2000,
        success : function(response) {
            objet = response.objet;
        },
        error : function(xhr, ajaxOptions, thrownError) {
            console.log(xhr.responseText);
            console.log(thrownError);
        },
    });

    return objet;
};

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
    signalements_arrets_tao_bus.setVisible($("#signal_check").is(":checked") && $("#bus").is(":checked"));
    signalements_lignes_tao_bus.setVisible($("#signal_check").is(":checked") && $("#bus").is(":checked"));
    map.getLayers().array_[3].setVisible($("#tram").is(":checked"));
    map.getLayers().array_[5].setVisible($("#tram").is(":checked"));
    signalements_arrets_tao_tram.setVisible($("#signal_check").is(":checked") && $("#tram").is(":checked"));
    signalements_lignes_tao_tram.setVisible($("#signal_check").is(":checked") && $("#tram").is(":checked"));
    map.getLayers().array_[6].setVisible($("#station_velo").is(":checked"));
    signalements_stations_velo.setVisible($("#signal_check").is(":checked") && $("#station_velo").is(":checked"));
    map.getLayers().array_[7].setVisible($("#parc_relais_velo").is(":checked"));
    signalements_parcs_relais_velo.setVisible($("#signal_check").is(":checked") && $("#parc_relais_velo").is(":checked"));
    map.getLayers().array_[8].setVisible($("#parkings_velo").is(":checked"));
    signalements_parkings_velo.setVisible($("#signal_check").is(":checked") && $("#parkings_velo").is(":checked"));
    map.getLayers().array_[1].setVisible($("#piste_velo").is(":checked"));
    signalements_lignes_velo.setVisible($("#signal_check").is(":checked") && $("#piste_velo").is(":checked"));



    $("input:checkbox").each(function(){
        $(this).change(function functionName(){
            map.getLayers().array_[2].setVisible($("#bus").is(":checked"));
            map.getLayers().array_[4].setVisible($("#bus").is(":checked"));
            signalements_arrets_tao_bus.setVisible($("#signal_check").is(":checked") && $("#bus").is(":checked"));
            signalements_lignes_tao_bus.setVisible($("#signal_check").is(":checked") && $("#bus").is(":checked"));
            map.getLayers().array_[3].setVisible($("#tram").is(":checked"));
            map.getLayers().array_[5].setVisible($("#tram").is(":checked"));
            signalements_arrets_tao_tram.setVisible($("#signal_check").is(":checked") && $("#tram").is(":checked"));
            signalements_lignes_tao_tram.setVisible($("#signal_check").is(":checked") && $("#tram").is(":checked"));
            map.getLayers().array_[6].setVisible($("#station_velo").is(":checked"));
            signalements_stations_velo.setVisible($("#signal_check").is(":checked") && $("#station_velo").is(":checked"));
            map.getLayers().array_[7].setVisible($("#parc_relais_velo").is(":checked"));
            signalements_parcs_relais_velo.setVisible($("#signal_check").is(":checked") && $("#parc_relais_velo").is(":checked"));
            map.getLayers().array_[8].setVisible($("#parkings_velo").is(":checked"));
            signalements_parkings_velo.setVisible($("#signal_check").is(":checked") && $("#parkings_velo").is(":checked"));
            map.getLayers().array_[1].setVisible($("#piste_velo").is(":checked"));
            signalements_lignes_velo.setVisible($("#signal_check").is(":checked") && $("#piste_velo").is(":checked"));

        })
    });

    // $(document).ready(function () {

    // function getSignalementInfo(type,id){
    //   $.ajax({
  	// 		type : 'GET',
  	// 		url  : 'test.json',
  	// 		success : function(response){
  	// 			response = JSON.parse(response);
    //       $("#modal-body").text(response)
    //     }
    //   });
    // }
    // });
    $("#newSignalement").on("click",function(){
      document.location.href = "new_signalement.html";
    })
}
