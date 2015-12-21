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

    var transitionText = this.group.transition().duration(750);
    transitionText.selectAll(".histLabel")
        .delay(delay)
        .attr("transform", function(d,i){return "translate("+
            (x0(i) + self.xposInc + self.width/2) + "," +
            (self.limits.y + self.limits.height - 5) + ")"})
};

TopEntropy.prototype.draw = function(averageEntropies){
    this.averageEntropies = averageEntropies;
    this.x = d3.scale.ordinal()
        .domain(d3.range(averageEntropies.length))
        .rangeRoundBands([this.limits.x, this.limits.x + this.limits.width], 0.1, 0.1);

    this.y = d3.scale.linear()
        .domain([0,1])
        .range([this.limits.y + this.limits.height - this.ymargin, this.limits.y + this.ymargin]);

    this.xposInc = 0;
    this.width = this.x.rangeBand() - 5;

    if (this.x.rangeBand() > this.minWidth) {
        this.xposInc += (this.x.rangeBand() - this.minWidth) / 2;
        this.width = this.minWidth;
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

    var histogram = this.group.selectAll("histRect").data(averageEntropies);
    var _this = this;
    histogram.enter().append("rect")
        .attr("x", function(d,i){return _this.x(i) + _this.xposInc})
        .attr("y", function(d,i){return _this.y(d)})
        .attr("width", _this.width)
        .attr("height", function(d,i){return Math.max(_this.limits.y+_this.limits.height - _this.y(d),0)})
        .attr("class","histRect");

    var labels = this.group.selectAll("histLabel").data(d3.range(_this.data.length));
    labels.enter().append("g")
        .attr("transform", function(d,i){return "translate("+
            (_this.x(i) + _this.xposInc + _this.width/2) + "," +
            (_this.limits.y + _this.limits.height - 5) + ")"})
        .attr("class","histLabel")
        .append("text")
        .text(function(d){return _this.data[d].dimension})
        .attr("transform", "rotate(-45)");

    this.group.append("text").attr("x",this.limits.x).attr("y",this.limits.y+20).text("Average Entropy").attr("class","borderText");


    this.group.on("click", function(){
        _this.controller.reorderDimensions(d3.range(_this.averageEntropies.length).sort(function (a, b) {
            return (_this.averageEntropies[b] - _this.averageEntropies[a])
        }));
    });
};
