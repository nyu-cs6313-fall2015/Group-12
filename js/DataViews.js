"use strict";

function DataViews (controller, data, svg, limits, scaleY){
    var self = this;
    this.description = "Data Views Controller";
    this.data = data;
    this.controller = controller;
    this.limits = limits;
    this.svg = svg;
    this.colors = undefined;

    this.dimensionsScales = this.data.map(buildScale); // change for object dimension:scale ??
    this.svg = this.svg.append("g").attr("class","data_views");
}

DataViews.prototype.createViews = function(children, clusterColors){
    var self = this;
    var numClusters = children.length;
    self.colors = clusterColors;

    d3.selectAll(".data_summary_group").remove();

    self.dataSummaryViews = [];

    children.forEach(createDataSummary);

    function createDataSummary(child, i){
        var childData = [];

        self.data.forEach( createChildData );
        var limits = {
            x: self.limits.x,
            y: self.limits.y + i* self.limits.height/numClusters ,
            width: self.limits.width,
            height: self.limits.height/numClusters - 6
        };

        var view = new DataSummary(childData, self.svg, limits,
          self.dimensionsScales, self.colors[i % self.colors.length],
          self.controller.tooltip);

        self.dataSummaryViews.push(view);

        function createChildData (d,i) {
            childData[i] = d.constructor(); // give temp the original obj's constructor
            for (var key in d) {
                if (key !== "values") {
                    childData[i][key] = d[key];
                }
                else {
                    childData[i].values = [];
                    child.forEach(function (ci) {
                        childData[i].values.push(d["values"][ci]);
                    });
                }
            }
        }
    }

};

DataViews.prototype.reorderDimensions = function(newOrder){
    this.dataSummaryViews.forEach( function(d) { d.reorderDimensions(newOrder); } );
};

function buildScale(d){
    if (d.type == "quantitative") {
        return d3.scale.linear()
          .domain(d3.extent(d.values));
    }else if (d.type == "categorical") {
        return d3.scale.category20()
          .domain(d.levels)
         ;
    }
}

