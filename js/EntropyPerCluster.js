function EntropyPerCluster(controller, data, svg, limits){
    this.description = 'EntropyPerCluster Class. Displayed on the right of DataViews';
    this.controller = controller;
    this.tooltip = controller.tooltip;
    this.data = data;
    this.svg = svg;
    this.limits = limits;
}


EntropyPerCluster.prototype.draw = function(entropiesDecrease, colors){
    this.numClusters = entropiesDecrease.length;
    this.numDimensions = entropiesDecrease[0].length;


    this.svg.selectAll(".EntropyPerClusterGroup").remove();
    this.group = this.svg.append("g").attr("class", "EntropyPerClusterGroup");

    var xMargin = 5;
    var yMargin = 3;

    for (var i = 0; i < this.numClusters; i++){
        var g_i = this.group.append("g").attr("class", "EntropyClusterI");

        var mylimits = {
            x: this.limits.x,
            y: this.limits.y + i* this.limits.height/this.numClusters ,
            width: this.limits.width,
            height: this.limits.height/this.numClusters - 6
        };

        g_i.append("rect")
            .attr("x", mylimits.x)
            .attr("y", mylimits.y)
            .attr("width", mylimits.width)
            .attr("height", mylimits.height)
            .attr("class", "boxrect")
            .attr("fill", "white")
            .style("stroke", colors[i % colors.length]);

                var guidelines = [mylimits.y +.25*mylimits.height,
            mylimits.y +.5*mylimits.height,
            mylimits.y +.75*mylimits.height];

        g_i.selectAll("line")
          .data(guidelines)
          .enter().append("line")
          .attr("class","boxline")
          .attr("x1", mylimits.x)
          .attr("x2", mylimits.x + mylimits.width)
          .attr("y1", function(d){return d;})
          .attr("y2", function(d){return d;})
          .style("stroke", colors[i % colors.length]);

        this.x = d3.scale.ordinal()
            .domain(d3.range(this.numDimensions))
            .rangeBands([mylimits.x + xMargin, mylimits.x+mylimits.width - xMargin],0.3);

        this.y = d3.scale.linear()
            .domain([0,1])
            .range([mylimits.y + mylimits.height -yMargin, mylimits.y +yMargin]);


        var dataCluster = entropiesDecrease[i];

        var histogram = g_i.selectAll("histRect").data(dataCluster);
        var _this = this;
        histogram.enter().append("rect")
            .attr("x", function(d,i){return _this.x(i)})
            .attr("y", function(d,i){return _this.y(d)})
            .attr("width", _this.x.rangeBand())
            .attr("height", function(d,i){return Math.max(mylimits.y+mylimits.height - _this.y(d),0)})
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

        (function(i) {
            g_i.on("click", function () {
                _this.controller.reorderDimensions(d3.range(_this.numDimensions).sort(function (a, b) {
                    return (entropiesDecrease[i][b] - entropiesDecrease[i][a])
                }));
            });
        })(i);
        
        g_i.append("text").attr("x", mylimits.x).attr("y", (mylimits.y+10)).text("Entropy Cluster " + (i+1)).style("stroke",colors[i % colors.length]);
    }

};


EntropyPerCluster.prototype.reorderDimensions = function(newOrder){
    var entropyGroups = this.svg.selectAll(".EntropyClusterI");

    var x0 = this.x.domain(newOrder);

    entropyGroups.each(function(d,i){
        var g_i = d3.select(this);
        var transition = g_i.transition().duration(750);
        var delay = function(d, i) { return i * 50; };
        transition.selectAll(".histRect")
            .delay(delay)
            .attr("x", function(d,i) { return x0(i); });
    });

};
