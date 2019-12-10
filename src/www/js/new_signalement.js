
var host_api = (typeof api !== 'undefined' && typeof api.host === 'string') ? api.host : "localhost"
var port_api = (typeof api !== 'undefined' && typeof api.port === 'string') ? api.port : "9152"
var adresse_api = 'http://'+host_api+':'+port_api;

$(document).ready(function () {

    // const params = new URLSearchParams(document.location.search);

    const info = sessionStorage.getItem("infoLoc");

    // if(params.get("location")!=null){
    //     $("#location").text(params.get("location"));
    //     $("#location_name_field").val(params.get("location"));
    // }
    // if(params.get("id")!=null){
    //     $("#id").val(params.get("id"));
    //
    // }
    //
    // $("#location").text(extractUrlParams());

    $("#location").text(info);
    // console.log(sessionStorage.getItem("idLoc"));
    // console.log(sessionStorage.getItem("typeLoc"));
    display()

});


// function extractUrlParams () {
//     var t = location.search.substring(1);
//     // console.log(t)
//
//     t = t.replace(/%20/g," ");
//     t = t.replace(/%27/g,"'");
//     t = t.replace(/%C3%82/g,"Â");
//     t = t.replace(/%C3%A9/g,"é");
//     t = t.replace(/%C3%89/g,"E");
//     t = t.replace(/%C3%A8/g,"è");
//     t = t.replace(/%C3%AA/g,"ê");
//     t = t.replace(/%C2%B0/g,"°");
//
//     t = t.split('=')[1];
//     // console.log(t)
//
//     return t;
// }

function display() {
    var v = $("#typeSignal").val();

    if(v == "retard"){
        $( ".other_param" ).html(`
<div class="input-group-prepend">
    <span class="input-group-text" id="basic-addon3"> Durée du retard </span>
</div>
<div class="min_unit unit_input">
    <input type="number" class="form-control" id="delay" placeholder="Retard">
</div>
        `);
    }
    else if(v == "degradation"){
        $( ".other_param" ).html("<div  id=\"img-upload\">\n" +
            "              <input type=\"file\" name=\"img[]\" class=\"file\" accept=\"image/*\">\n" +
            "              <div class=\"input-group mb-3\">\n" +
            "\n" +
            "              <input type=\"text\" class=\"form-control\" disabled placeholder=\"Upload File\" id=\"file\">\n" +
            "              <div class=\"input-group-append\">\n" +
            "                <button type=\"button\" class=\"browse btn btn-primary\">Browse...</button>\n" +
            "              </div>\n" +
            "            </div>\n" +
            "            <div class=\"ml-2 col-sm-6\">\n" +
            "              <img src=\"https://placehold.it/80x80\" id=\"preview\" class=\"img-thumbnail\">\n" +
            "            </div>\n" +
            "          </div>")

    }
    else{
        $( ".other_param" ).html("")
    }

}

function submitSignal() {
    var v = $("#typeSignal").val();
    var r = null;
    var comment = $("#comment").val();
    //envoie du type + lieu/arrêt

    if(v == "retard"){
        r = $("#delay").val();
    }
    else if(v == "degradation"){
        //envoie de l'image
    }

    //envoie du commentaire


    $.ajax({
        type : 'POST',
        url  : 'http://localhost:5050/signalement',
        data : JSON.stringify({
            type_signalement: v,
            retard: r,
            commentaire: comment,
            type_object: sessionStorage.getItem("typeLoc"),
            id_object: sessionStorage.getItem("idLoc"),
            geom_text: sessionStorage.getItem("coordLoc")
        }),
        contentType: "application/json",
        success : function(response) {
            console.log(response);
            alert("Signalement créé")
        },
        error : function(xhr, ajaxOptions, thrownError) {
            console.log(xhr.responseText);
            console.log(thrownError);
        },
    });

}

function returnMap() {
    document.location.href = "map.html";
}



// $(document).on("click", ".browse", function() {
//   var file = $(this).parents().find(".file");
//   file.trigger("click");
//   });
//   $('input[type="file"]').change(function(e) {
//   var fileName = e.target.files[0].name;
//   $("#file").val(fileName);
//
//   var reader = new FileReader();
//   reader.onload = function(e) {
//     // get loaded data and render thumbnail.
//     document.getElementById("preview").src = e.target.result;
//   };
//
//   // read the image file as a data URL.
//   reader.readAsDataURL(this.files[0]);
// });
