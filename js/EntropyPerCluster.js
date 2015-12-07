function EntropyPerCluster(controller, data, svg, limits){
    this.description = 'EntropyPerCluster Class. Displayed on the right of DataViews';
    this.tooltip = new Tooltip();
    this.controller = controller;
    this.data = data;
    this.svg = svg;
    this.limits = limits;
}


EntropyPerCluster.prototype.draw = function(entropiesDecrease, colors){
    var numClusters = entropiesDecrease.length;
    var numDimensions = entropiesDecrease[0].length;


    this.svg.selectAll(".EntropyPerClusterGroup").remove();
    this.group = this.svg.append("g").attr("class", "EntropyPerClusterGroup");

    var xMargin = 5;
    var yMargin = 3;
    var usableWidth = this.limits.width - 2*xMargin;
    var binSize = (usableWidth)/numDimensions;

    for (var i = 0; i < numClusters; i++){

        var mylimits = {
            x: this.limits.x,
            y: this.limits.y + i* this.limits.height/numClusters ,
            width: this.limits.width,
            height: this.limits.height/numClusters - 10
        };

        this.group.append("rect")
            .attr("x", mylimits.x)
            .attr("y", mylimits.y)
            .attr("width", mylimits.width)
            .attr("height", mylimits.height)
            .attr("class", "boxrect")
            .style("stroke", colors[i % colors.length])

        var x = d3.scale.linear()
            .domain([0, numDimensions-1])
            .range([mylimits.x + xMargin, mylimits.x+mylimits.width - xMargin - binSize]);

        var y = d3.scale.linear()
            .domain([0,1])
            .range([mylimits.y + mylimits.height -yMargin, mylimits.y +yMargin]);

        var dataCluster = entropiesDecrease[i];

        var histogram = this.group.selectAll("histBin").data(dataCluster);
        var _this = this;
        histogram.enter().append("rect")
            .attr("x", function(d,i){return x(i)})
            .attr("y", function(d,i){return y(d)})
            .attr("width", binSize-xMargin)
            .attr("height", function(d,i){return mylimits.y+mylimits.height - y(d)})
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

    }

};
