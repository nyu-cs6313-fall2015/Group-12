function TopEntropy(controller, data, svg, limits){
    this.description = 'TopEntropy Class. Displayed on top of DataViews. Has to be aligned with dataviews';
    this.controller = controller;
    this.tooltip = controller.tooltip;
    this.data = data;
    this.svg = svg;
    this.group = this.svg.append("g").attr("class", "topEntropy");
    this.limits = limits;
    this.ymargin = 0.5;
}

TopEntropy.prototype.draw = function(averageEntropies){
    var self = this;

    this.x = d3.scale.ordinal()
        .domain(d3.range(averageEntropies.length))
        .rangeRoundBands([this.limits.x, this.limits.x + this.limits.width], 0.1, 0.1);

    this.y = d3.scale.linear()
        .domain([0,1])
        .range([this.limits.y + this.limits.height - this.ymargin, this.limits.y + this.ymargin]);

    var minWidth = 50;
    var xposInc = 0;
    var width = this.x.rangeBand() - 5;

    if (this.x.rangeBand() > minWidth) {
        xposInc += (this.x.rangeBand() - minWidth) / 2;
        width = minWidth;
    }

    this.group.remove();
    this.group = this.svg.append("g").attr("class", "topEntropy");

    var histogram = this.group.selectAll("histBin").data(averageEntropies);
    var _this = this;
    histogram.enter().append("rect")
        .attr("x", function(d,i){return _this.x(i) + xposInc})
        .attr("y", function(d,i){return _this.y(d)})
        .attr("width", width)
        .attr("height", function(d,i){return Math.max(_this.limits.y+_this.limits.height - _this.y(d),0)})
        .attr("class","histRect")
        .on("mouseover", function (d,i) {
            _this.tooltip.show(_this.data[i].dimension);
        })
        .on("mouseout", function (d) {
            _this.tooltip.hide();
        })
        .on("mousemove", function(d){
            _this.tooltip.updatePosition();
        });

    this.group.append("rect")
        .attr("x", self.limits.x)
        .attr("y", self.limits.y)
        .attr("width", self.limits.width)
        .attr("height", self.limits.height)
        .attr("class", "boxrect")
        .style("stroke","#cccccc");
};