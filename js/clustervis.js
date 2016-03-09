"use strict";

function ClusterVis(){
    this.DATASUMMARYHEIGHT = 170;
    this.description = "Class ClusterVis";
    this.width = document.getElementById('main').offsetWidth;
    this.height = document.getElementById('main').offsetHeight - 60;
    this.svgFixedHeight = .15 * this.height 
    this.svgSummaryHeight = .85 * this.height
    this.svgFixed = d3.select('#main')
        .append("svg")
        .style("z-index","1000")
        .style("width", this.width)
        .style("height", this.svgFixedHeight)
        .style("top", "50px")
        .style("position","fixed");

    this.svgFixed.append("rect").attr("width",this.width).attr("height",this.svgFixedHeight).attr("fill","white")

    this.svgSummary = d3.select('#main')
        .append("svg")
        .style("position","relative")
        .style("top",this.svgFixedHeight)
        .style("width", this.width)
        .style("height", this.svgSummaryHeight);
}

ClusterVis.prototype.setSummaryHeight = function(height){
    this.svgSummaryHeight = height;
    this.svgSummary.style("height",height)
}
