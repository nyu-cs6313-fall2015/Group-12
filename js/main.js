"use strict";

var file;
var navPlotOptions;

function makeLayout(){
    var body = d3.select("body");
    var containerFluid = body.append("div").attr("class", "container-fluid");
    var navbarDefault = containerFluid.append("div").attr("class", "navbar navbar-default navbar-fixed-top");
    var navbarHeader = navbarDefault.append("div").attr("class", "navbar-header");
    navbarHeader.append("a").attr("class", "navbar-brand").attr("href", "#").append("text").text("ClusterVis").on('click',function(){window.location.reload()});
    var  navPlotForm = navbarHeader.append("form").attr("class","navbar-form navbar-right");
    navPlotOptions = navPlotForm.append("select").attr("class", "form-control").attr("id", "plotOption");
    navPlotOptions.append("option").append("text").text("Data Summary");
    navPlotOptions.append("option").append("text").text("Parallel Coordinates");

    containerFluid.append("div").attr("class","body").attr("id", "main")
}


function main(){
    var fileInput = document.getElementById('fileInput');
    var fileDisplayArea = document.getElementById('textBoxFileName');
    var submitButton  =document.getElementById('submitbutton');
    fileInput.addEventListener('change', function (e) {
        file = fileInput.files[0];
        fileDisplayArea.value = file.name;
    });

    submitButton.addEventListener('click', function(){
        var reader = new FileReader();
        reader.onload = function (e) {
            var JsonObj = JSON.parse(reader.result);
            d3.selectAll(".outerBorder").remove();
            d3.selectAll(".footer_datasets").remove();
            makeLayout();
            var controller = new Controller();
            navPlotOptions.on("change", function(){ return controller.plotOptionUpdated() } );
            controller.dataUpdated(JsonObj);
        };
        reader.readAsText(file);


    });
}