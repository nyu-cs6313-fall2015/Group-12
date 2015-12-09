"use strict";

function ClusterVis(){
    this.description = "Class ClusterVis";
    this.width = document.getElementById('main').offsetWidth;
    this.height = document.getElementById('main').offsetHeight - 60;
    this.svg = d3.select('#main')
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)

}