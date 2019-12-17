
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
            "              <input type=\"file\" name=\"img[]\" class=\"file\" accept=\"image/*\" onchange=\"loadFile(event)\" id='img'> \n" +
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

var byteImg;

var loadFile = function(event) {
    var output = document.getElementById('preview');
    output.src = URL.createObjectURL(event.target.files[0]);
    var fileName = event.target.files[0].name;
    $("#file").val(fileName);

    var reader = new FileReader();
    reader.onload = function(){
        var arrayBuffer = this.result,
        array = new Uint8Array(arrayBuffer),
            img = String.fromCharCode.apply(null,array);

        byteImg = img

    }
    reader.readAsArrayBuffer(event.target.files[0])

};

function submitSignal() {
    var typeSignal = $("#typeSignal").val();
    var r = null;
    var comment = $("#comment").val();
    //envoie du type + lieu/arrêt

    if(v == "retard"){
        r = $("#delay").val();
    }


    if(byteImg !== undefined){
        $.ajax({
            type: 'POST',
            url: adresse_api+'/image',
            data: JSON.stringify({
                bytecode: byteImg
            }),
            contentType: "application/json",
            success : function (response) {
               ajaxInsert(typeSignal,r,byteImg,comment)
            },
            error : function(xhr, ajaxOptions, thrownError) {
                console.log(xhr.responseText);
                console.log(thrownError);
            },
        });
    }
    else{
        ajaxInsert(v,r,null,comment)
    }


}

function ajaxInsert(typeSignal,r,image,comment) {
    $.ajax({
        type : 'POST',
        url  : adresse_api+'/signalement',
        data : JSON.stringify({
            type_signalement: typeSignal,
            retard: r,
            commentaire: comment,
            type_object: sessionStorage.getItem("typeLoc"),
            id_object: sessionStorage.getItem("idLoc"),
            geom_text: sessionStorage.getItem("coordLoc")
        }),
        contentType: "application/json",
        success : function(response) {
            console.log(response);
            alert("Signalement créé");
            returnMap();
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



$(document).on("click", ".browse", function() {
  var file = $(this).parents().find(".file");
  file.trigger("click");
  });
