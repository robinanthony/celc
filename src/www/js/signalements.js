
var host_api = (typeof api !== 'undefined' && typeof api.host === 'string') ? api.host : "localhost"
var port_api = (typeof api !== 'undefined' && typeof api.port === 'string') ? api.port : "9152"
var adresse_api = 'http://'+host_api+':'+port_api;

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

var getSignalDOM = function (signalement,type_display,degradation_image,objet,type_list="") {
    return `<div class="row text-center" id="signal_list_${type_list}${signalement.id}">
                 <div class="col-12">
                   <div class="card">
                     <div class="card-header" 
                          id="headingOne_${type_list}${signalement.id}">
                       <h2 class="row mb-0">
                         <button class="btn col" type="button" 
                                 data-toggle="collapse"
                                 data-target="#collapseOne_${type_list}${signalement.id}" 
                                 aria-expanded="true" 
                                 aria-controls="collapseOne_${type_list}${signalement.id}">
                           <div class="row">
                             <div class="col mb-0">${type_display} sur ${getTypeObjetDisplay(signalement.type_object, objet)}</div>
                           </div>
                         </button>
                         <button id="delete_signal_button_${type_list}${signalement.id}" class="btn" type="button">
                           <i class="fas fa-trash"></i>
                         </button>
                       </h2>
                     </div>
                     <div id="collapseOne_${type_list}${signalement.id}" class="collapse ${(signalement.commentaire == "" || signalement.commentaire === null) && signalement.image_filename === null ? '' : 'show'}" aria-labelledby="headingOne_${type_list}${signalement.id}" data-parent="#signal_list_${type_list}${signalement.id}">
                       ${signalement.image_filename !== null ? degradation_image : ''}
                       <div class="card-body">
                         ${(signalement.commentaire == "" || signalement.commentaire === null) ? 'Pas de commentaire' : signalement.commentaire.replace(/\n/g,"<br>")}
                       </div>
                     </div>
                   </div>
                 </div>
                </div>`
}

var addSignalementToDOM = function(signalement, objet) {

    let type_display = "";
    switch(signalement.type_signalement) {
        case "retard":
            type_display = `Retard de ${signalement.retard} mins`;
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
    
    let degradation_image = `<img class="signalement_image" src="${adresse_api}/static/img/${signalement.image_filename}" alt="Image montrant la dégradation">`

    $(`#nav-tous`).append(getSignalDOM(signalement,type_display,degradation_image,objet,"tous"));
    $(`#nav-${signalement.type_signalement}`).append(getSignalDOM(signalement,type_display,degradation_image,objet));

    $(`#delete_signal_button_${signalement.id}, #delete_signal_button_tous${signalement.id}`).click(function() {
        deleteSignal(signalement.id, function(response) {
            $(`#signal_list_${signalement.id}`).remove();
            $(`#signal_list_tous${signalement.id}`).remove();

        })
    });
}

var deleteSignal = function(id, success=function(a){}, error=function(a, b, c){}) {
    $.ajax({
        type : 'DELETE',
        url  : adresse_api+'/signalement/'+id,
        success : function(response) {
            alert("Signalement supprimé");
            success(response);
        },
        error : function(xhr, ajaxOptions, thrownError) {
            console.log(xhr.responseText);
            console.log(thrownError);
            success(xhr, ajaxOptions, thrownError);
        },
    });
}

$(document).ready(function () {
    $.ajax({
        type : 'GET',
        url  : `${adresse_api}/signalement`,
        success : function(response) {
            for (let s of response.signalements) {
                $.ajax({
                    type : 'GET',
                    url  : `${adresse_api}/signalement/${s.id}/object`,
                    success : function(response) {
                        addSignalementToDOM(s, response.objet);
                    }
                });
            }
        }
    });
});