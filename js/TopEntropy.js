function TopEntropy(controller, data, svg, limits){
    this.description = 'TopEntropy Class. Displayed on top of DataViews. Has to be aligned with dataviews';
    this.controller = controller;
    this.tooltip = controller.tooltip;
    this.data = data;
    this.svg = svg;
    this.group = this.svg.append("g").attr("class", "topEntropy");
    this.limits = limits;
    this.ymargin = 0.5;
    this.minWidth = 50;
}

TopEntropy.prototype.reorderDimensions = function(newOrder){
    var self = this;
    var x0 = this.x.domain(newOrder);

    var transition = this.group.transition().duration(750);
    var delay = function(d, i) { return i * 50; };
    transition.selectAll(".histRect")
        .delay(delay)
        .attr("x", function(d,i) { return (x0(i) +self.xposInc); });
};

TopEntropy.prototype.draw = function(averageEntropies){
    var self = this;
    this.averageEntropies = averageEntropies;
    this.x = d3.scale.ordinal()
        .domain(d3.range(averageEntropies.length))
        .rangeRoundBands([this.limits.x, this.limits.x + this.limits.width], 0.1, 0.1);

    this.y = d3.scale.linear()
        .domain([0,1])
        .range([this.limits.y + this.limits.height - this.ymargin, this.limits.y + this.ymargin]);

    this.xposInc = 0;
    var width = this.x.rangeBand() - 5;

    if (this.x.rangeBand() > this.minWidth) {
        this.xposInc += (this.x.rangeBand() - this.minWidth) / 2;
        width = this.minWidth;
    }

    this.group.remove();
    this.group = this.svg.append("g").attr("class", "topEntropy");
    this.group.append("rect").attr("x", this.limits.x).attr("y", this.limits.y).attr("width",this.limits.width).attr("height",this.limits.height).attr("class","invisibleBox");

    var guidelines = [this.limits.y +.25*this.limits.height,
        this.limits.y +.5*this.limits.height,
        this.limits.y +.75*this.limits.height];

    this.group.selectAll("line")
      .data(guidelines)
      .enter().append("line")
      .attr("class","boxline")
      .attr("x1", this.limits.x)
      .attr("x2", this.limits.x + this.limits.width)
      .attr("y1", function(d){return d;})
      .attr("y2", function(d){return d;})
      .style("stroke", '#bbb');

    var histogram = this.group.selectAll("histBin").data(averageEntropies);
    var _this = this;
    histogram.enter().append("rect")
        .attr("x", function(d,i){return _this.x(i) + _this.xposInc})
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

    this.group.on("click", function(){
        _this.controller.reorderDimensions(d3.range(_this.averageEntropies.length).sort(function (a, b) {
            return (_this.averageEntropies[b] - _this.averageEntropies[a])
        }));
    });
};