"use strict";

function DataViews (controller, data, svg, limits, scaleY, plot){
    var self = this;
    this.description = "Data Views Controller";
    this.data = data;
    this.controller = controller;
    this.limits = limits;
    this.svg = svg;
    this.colors = undefined;
    this.numClusters = undefined;
    this.childData = undefined;
    this.plot = plot;

    this.svg = this.svg.append("g").attr("class","data_views");
}

DataViews.prototype.createViews = function(children, clusterColors) {
    var self = this;
    self.numClusters = children.length;
    self.colors = clusterColors;

    self.childData = [];

    children.forEach(createDataSummary);

    self.createDataSummaryViews();

    function createDataSummary(child, i) {
        self.childData[i] = [];

        self.data.forEach(function (d, j) {
            self.childData[i][j] = d.constructor(); // give temp the original obj's constructor
            for (var key in d) {
                if (key !== "values") {
                    self.childData[i][j][key] = d[key];
                }
                else {
                    self.childData[i][j].values = [];
                    child.forEach(function (ci) {
                        self.childData[i][j].values.push(d["values"][ci]);
                    });
                }
            }
        });
    }
}


DataViews.prototype.updatePlot = function(plot) {
    var self = this;
    self.plot = plot;
    self.createDataSummaryViews();
}

DataViews.prototype.createDataSummaryViews = function(){
    var self = this;

    d3.selectAll(".data_summary_group").remove();

    self.dataSummaryViews = [];
    self.childData.forEach(createDataViews);

    function createDataViews(child, i){
        var dimensionsScales = self.data.map(function(d){return buildScale(d, self.plot);}); // change for object dimension:scale ??


        var limits = {
            x: self.limits.x,
            y: self.limits.y + i* self.limits.height/self.numClusters ,
            width: self.limits.width,
            height: self.limits.height/self.numClusters - 6
        };

        if (self.plot === 'Data Summary') {
            var view = new DataSummary(child, self.svg, limits,
              dimensionsScales, self.colors[i % self.colors.length],
              self.controller.tooltip);
        }
        else if (self.plot === 'Parallel Coordinates') {
            var view = new ParallelCoordinates(child, self.svg, limits,
              dimensionsScales, self.colors[i % self.colors.length],
              self.controller.tooltip);
        }

        self.dataSummaryViews.push(view);

    }

};

DataViews.prototype.reorderDimensions = function(newOrder){
    this.dataSummaryViews.forEach( function(d) { d.reorderDimensions(newOrder); } );
};

function buildScale(d, plot){
    if (d.type == "quantitative") {
        return d3.scale.linear()
          .domain(d3.extent(d.values));
    }else if (d.type == "categorical") {
        if (plot === 'Data Summary'){
            return d3.scale.category20()
              .domain(d.levels);
        }
        else if (plot === 'Parallel Coordinates'){
            return d3.scale.ordinal()
              .domain(d.levels);
        }
    }
}

