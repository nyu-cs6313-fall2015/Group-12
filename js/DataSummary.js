
function DataSummary(data, svg, limits, dataDimensionScales, boxColor, tooltip){
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
    this.tooltip = tooltip;

    this.createPlots();
    this.draw()
}

DataSummary.prototype.createPlots = function(){
    var self = this;
    self.quartiles = [self.limits.y +.25*self.limits.height,
        self.limits.y +.5*self.limits.height,
        self.limits.y +.75*self.limits.height];

    console.log(self.quartiles);

    makeBox();
    self.limits.y = self.limits.y + 3;
    self.limits.height = self.limits.height- 6;

    self.data.forEach(plotDimension);


    function makeBox(){
        self.svg.append("rect")
          .attr("class","boxrect")
          .attr("x", self.limits.x)
          .attr("y", self.limits.y)
          .attr("width", self.limits.width)
          .attr("height", self.limits.height)
          .style("stroke", self.boxColor);

        self.svg.selectAll("line")
          .data(self.quartiles)
          .enter().append("line")
          .attr("class","boxline")
          .attr("x1", self.limits.x)
          .attr("x2", self.limits.x + self.limits.width)
          .attr("y1", function(d){ console.log(d);  return d;})
          .attr("y2", function(d){return d;})
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
            var plot = new StackedBar(d, plot_svg, limits, self.scales.y[i], self.tooltip);
            self.plots.push(plot);
        }
        else if (d['type'] == 'quantitative'){
            var plot = new Box(d, plot_svg, limits, self.scales.y[i], self.tooltip);
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

