
function DataSummary(data, svg, limits){
    this.description = "Data Summary Object";
    this.data = data;
    this.limits = limits;
    this.svg = svg;
    this.scales = {};
    this.scales.x = d3.scale.ordinal()
        .domain(data.map(function(d) { return d.dimension; }))
        .rangeRoundBands([this.limits.x, this.limits.x + this.limits.width], .1);

    this.svg = this.svg.append("g").attr("class","data_summary_group");

    this.plots = [];
    this.createPlots();

    this.draw()
}

DataSummary.prototype.createPlots = function(){
    var ds = this;
    var plotDimension = createPlot;

    this.data.forEach(plotDimension);

    function createPlot (d){
        var xpos = ds.scales.x(d.dimension);
        var width = ds.scales.x.rangeBand() - 25;
        var limits = {x: xpos, y: ds.limits.y, width : width, height: ds.limits.height };

        var plot_svg = ds.svg.append("g").attr("transform", "translate(" +  xpos + ",0)");

        if (d['type'] == 'categorical'){
            var plot = new StackedBar(d, plot_svg, limits);
            ds.plots.push(plot);
        }
        else if (d['type'] == 'quantitative'){
            var plot = new Box(d, plot_svg, limits);
            ds.plots.push(plot);
        }
    };

};

DataSummary.prototype.draw = function(){
    this.plots.forEach( function(d) { d.draw() });
};

DataSummary.prototype.remove = function(){
    d3.select(".data_summary_group").remove();
};

