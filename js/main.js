"use strict";

var file;

function makeLayout(){
    var body = d3.select("body");
    var containerFluid = body.append("div").attr("class", "container-fluid");
    var navbarDefault = containerFluid.append("div").attr("class", "navbar navbar-default");
    var navbarHeader = navbarDefault.append("div").attr("class", "navbar-header");
    navbarHeader.append("a").attr("class", "navbar-brand").attr("href", "#").append("text").text("ClusterVis").on('click',function(){window.location.reload()});
    containerFluid.append("div").attr("class","body").attr("id", "main")
}


function main(){
    var fileInput = document.getElementById('fileInput');
    var fileDisplayArea = document.getElementById('textBoxFileName');
    var submitButton  =document.getElementById('submitbutton')
    fileInput.addEventListener('change', function (e) {
        file = fileInput.files[0];
        fileDisplayArea.value = file.name;
    });

    submitButton.addEventListener('click', function(){
        var reader = new FileReader();
        reader.onload = function (e) {
            var JsonObj = JSON.parse(reader.result);
            d3.selectAll(".outerBorder").remove();
            makeLayout();
            var controller = new Controller();
            controller.dataUpdated(JsonObj);
        };
        reader.readAsText(file);


    });
}