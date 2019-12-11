
var host_api = (typeof api !== 'undefined' && typeof api.host === 'string') ? api.host : "localhost"
var port_api = (typeof api !== 'undefined' && typeof api.port === 'string') ? api.port : "9152"
var adresse_api = 'http://'+host_api+':'+port_api;

// "type_signalement" : request.json.get("type_signalement"),
// "retard" : request.json.get("retard", None),
// "commentaire" : request.json.get("commentaire", None),
// "type_object" : request.json.get("type_object"),
// "id_object" : request.json.get("id_object")

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

var addSignalementToDOM = function(signalement, objet) {
    console.log(signalement, objet);

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

    let signalDOM = `<div class="row text-center">
 <div class="col-12" id="signal_list_${signalement.id}">
   <div class="card">
     <div class="card-header" id="headingOne_${signalement.id}" data-toggle="collapse"
       data-target="#collapseOne_${signalement.id}" aria-expanded="true" aria-controls="collapseOne_${signalement.id}">
       <h2 class="mb-0">
         <button class="btn col-12 " type="button">
           <div class="row">
             <div class="col mb-0">${type_display} sur ${getTypeObjetDisplay(signalement.type_object, objet)}</div>
           </div>
         </button>
       </h2>
     </div>
     <div id="collapseOne_${signalement.id}" class="collapse ${(signalement.commentaire == "" || signalement.commentaire === null) ? '' : 'show'}" aria-labelledby="headingOne_${signalement.id}" data-parent="#signal_list_${signalement.id}">
       <div class="card-body">
         ${(signalement.commentaire == "" || signalement.commentaire === null) ? 'Pas de commentaire' : signalement.commentaire.replace(/\n/g,"<br>")}
       </div>
     </div>
   </div>
 </div>
</div>`

    $(`#nav-${signalement.type_signalement}`).append(signalDOM);
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