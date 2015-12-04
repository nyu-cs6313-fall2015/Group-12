
function DataSummary(data, svg, limits, dataDimensionScales){
    this.description = "Data Summary Object";
    this.data = data;
    this.limits = limits;
    this.svg = svg;
    this.scales = {};
    this.scales.x = d3.scale.ordinal()
        .domain(data.map(function(d) { return d.dimension; }))
        .rangeRoundBands([this.limits.x, this.limits.x + this.limits.width], .1);
    this.scales.y = dataDimensionScales;

    this.svg = this.svg.append("g").attr("class","data_summary_group");

    this.plots = [];
    this.createPlots();

    this.draw()
}

DataSummary.prototype.createPlots = function(){
    var self = this;
    var plotDimension = createPlot;

    this.data.forEach(plotDimension);

    function createPlot (d, i){
        var xpos = self.scales.x(d.dimension);
        var width = d3.min([self.scales.x.rangeBand() - 25, 50]);
        var limits = {x: xpos, y: self.limits.y, width : width, height: self.limits.height };

        var plot_svg = self.svg.append("g").attr("transform", "translate(" +  xpos + ",0)");

        if (d['type'] == 'categorical'){
            var plot = new StackedBar(d, plot_svg, limits, self.scales.y[i]);
            self.plots.push(plot);
        }
        else if (d['type'] == 'quantitative'){
            var plot = new Box(d, plot_svg, limits, self.scales.y[i]);
            self.plots.push(plot);
        }
    };

};

DataSummary.prototype.draw = function(){
    this.plots.forEach( function(d) { d.draw() });
};

DataSummary.prototype.remove = function(){
    d3.select(".data_summary_group").remove();
};

