
function DataSummary(data, svg, limits, dataDimensionScales, boxColor){
    this.description = "Data Summary Object";
    this.data = data;
    this.limits = limits;
    this.svg = svg;
    this.scales = {};
    this.scales.x = d3.scale.ordinal()
        .domain(data.map(function(d) { return d.dimension; }))
        .rangeRoundBands([this.limits.x, this.limits.x + this.limits.width],.1, .1);
    this.scales.y = dataDimensionScales;

    this.svg = this.svg.append("g").attr("class","data_summary_group");
    this.plots = [];

    this.boxColor = boxColor;

    this.createPlots();
    this.draw()
}

DataSummary.prototype.createPlots = function(){
    var self = this;

    makeBox();
    self.limits.y = self.limits.y + 8;
    self.limits.height = self.limits.height-16;

    self.data.forEach(plotDimension);


    function makeBox(){
        self.svg.append("rect")
            .attr("class","boxrect")
            .attr("x", self.limits.x)
            .attr("y", self.limits.y)
            .attr("width", self.limits.width)
            .attr("height", self.limits.height)
            .style("stroke", self.boxColor);
    }

    function plotDimension (d, i){
        var minWidth = 50;
        var xpos = self.scales.x(d.dimension);
        var width = self.scales.x.rangeBand() - 5;

        if (self.scales.x.rangeBand() > minWidth) {
            xpos += (self.scales.x.rangeBand() - minWidth) / 2;
            width = minWidth;
        }

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

