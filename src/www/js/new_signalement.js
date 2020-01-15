
var host_api = (typeof api !== 'undefined' && typeof api.host === 'string') ? api.host : "localhost"
var port_api = (typeof api !== 'undefined' && typeof api.port === 'string') ? api.port : "9152"
var adresse_api = 'http://'+host_api+':'+port_api;

$(document).ready(function () {

    const info = sessionStorage.getItem("infoLoc");

    $("#location").text(info);

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
var fileName;

var toHexString = function(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

var loadFile = function(event) {
    var output = document.getElementById('preview');
    output.src = URL.createObjectURL(event.target.files[0]);
    fileName = event.target.files[0].name;
    $("#file").val(fileName);

    var reader = new FileReader();
    reader.onload = function(){
        var arrayBuffer = this.result;
        array = new Uint8Array(arrayBuffer);

        byteImg = toHexString(array);

    }
    reader.readAsArrayBuffer(event.target.files[0])

};

function submitSignal() {
    var typeSignal = $("#typeSignal").val();
    var r = null;
    var comment = $("#comment").val();
    //envoie du type + lieu/arrêt

    if(typeSignal == "retard"){
        r = $("#delay").val();
    }


    if(byteImg !== undefined){
        $.ajax({
            type: 'POST',
            url: adresse_api+'/image',
            data: JSON.stringify({
                bytecode: byteImg,
                filename: fileName
            }),
            contentType: "application/json",
            success : function (response) {
                console.log(response);
                console.log(response.image);
                ajaxInsert(typeSignal,r,response.image,comment)
            },
            error : function(xhr, ajaxOptions, thrownError) {
                console.log(xhr.responseText);
                console.log(thrownError);
            },
        });
    }
    else{
        ajaxInsert(typeSignal,r,null,comment)
    }


}

function ajaxInsert(typeSignal,r,idImage,comment) {
    $.ajax({
        type : 'POST',
        url  : adresse_api+'/signalement',
        data : JSON.stringify({
            type_signalement: typeSignal,
            retard: r,
            commentaire: comment,
            type_object: sessionStorage.getItem("typeLoc"),
            id_object: sessionStorage.getItem("idLoc"),
            geom_text: sessionStorage.getItem("coordLoc"),
            id_image: idImage
        }),
        contentType: "application/json",
        success : function(response) {
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
