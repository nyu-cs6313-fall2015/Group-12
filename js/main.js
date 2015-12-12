"use strict";

var file;

function makeLayout(){
    var body = d3.select("body");
    var containerFluid = body.append("div").attr("class", "container-fluid");
    var navbarDefault = containerFluid.append("div").attr("class", "navbar navbar-default");
    var navbarHeader = navbarDefault.append("div").attr("class", "navbar-header");
    var navbarBrand = navbarHeader.append("a").attr("class", "navbar-brand").attr("href", "#").append("text").text("ClusterVis").on('click',function(){window.location.reload()});
    var mainBody = containerFluid.append("div").attr("class","body").attr("id", "main")

/*
<div class="container-fluid">
    <div class="navbar navbar-default">
        <div class="navbar-header">
            <a class="navbar-brand" href="#">Clustering
        </div>
    </div>
    <div class="body" id="main">
    </div>
</div>
        */
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
            console.log(JsonObj);
            d3.selectAll(".outerBorder").remove();
            makeLayout();
            var controller = new Controller();
            controller.dataUpdated(JsonObj);
        };
        reader.readAsText(file);


    });
}