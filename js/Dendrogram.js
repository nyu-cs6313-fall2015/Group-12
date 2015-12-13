function Dendrogram(controller, data, svg, limits, initialHeight){
    this.description = "Dendrogram Object";
    //this.maxDendrogramMerges = 400;
    this.data = data;
    this.controller = controller;
    this.limits = limits;
    this.svg = svg;
    this.scales = {};
    this.fathers = [];
    this.group = this.svg.append("g")
        .attr("class","dendrogram_group");

    this.boxesGroup = this.svg.append("g")
        .attr("class", "dendrogram_boxes_group");


    if (initialHeight === undefined) {
        var range = d3.extent(data.hclust.height);
        initialHeight = range[0] + (range[0] + range[1]) *0.85;
    }

    this.scales.x = d3.scale.linear()
        .domain(d3.extent(data.hclust.height))
        .range([limits.x + limits.width, limits.x])
        .clamp(true);

    this.scales.y = d3.scale.linear()
        .domain([0, this.data.hclust.order.length-1])
        .range([limits.y, limits.y + limits.height])
        .clamp(true);

    this.draw();
    this.dendrogramLine = new DendrogramLine(controller, this.group, this.scales.x, this.scales.y, initialHeight);
}

Dendrogram.prototype.drawClusters = function(clusterBoxes){
    this.svg.selectAll(".clusterBox").remove();
    for (var i = 0; i < clusterBoxes.length; i++){
        this.boxesGroup.append("rect")
            .attr("class","clusterBox")
            .attr("x", this.scales.x(clusterBoxes[i].height))
            .attr("y", this.scales.y(clusterBoxes[i].y0)+1) //1px margin
            .attr("width", this.scales.x.range()[0] - this.scales.x(clusterBoxes[i].height))
            .attr("height", this.scales.y(clusterBoxes[i].y1) - this.scales.y(clusterBoxes[i].y0) -1)//1 px margin
            .style("fill", clusterBoxes[i].color)
            .style("opacity", "0.3");
    }
};

Dendrogram.prototype.draw = function(){
    var nElem = this.data.hclust.order.length;
    var nMerge = this.data.hclust.merge.length;
    this.centers = [];

    for (var i = 0; i < nElem; i++){
        //y-centers for the original elements
        //store them in reverse order to make computation easier
        this.centers[nElem - this.data.hclust.order[i]] = i;
    }


    var height = this.data.hclust.height;
    var merge = this.data.hclust.merge;


    var XZERO = this.scales.x.domain()[0];
    var self = this;
    var line = d3.svg.line()
        .x(function(d){ return (self.scales.x(d[0])); })
        .y(function(d){ return (self.scales.y(d[1])); })
        .interpolate("linear");


    //var drawAfterNIters  = nMerge - this.maxDendrogramMerges;

    for (var i = 0; i < nMerge; i++){
        //store centers from merges in nElem + index (there is an undefined in centers[nElem])
        var child1 = merge[i][0];
        var child2 = merge[i][1];
        var centerChild1 = this.centers[nElem + child1];
        var centerChild2 = this.centers[nElem + child2];
        this.centers[i+1+nElem] = (centerChild1 + centerChild2)/2;
        this.fathers[child1] = i + 1;
        this.fathers[child2] = i + 1;

        var heightChild1 = (child1>0?height[child1-1]:XZERO);
        var heightChild2 = (child2>0?height[child2-1]:XZERO);


        var linexy = [
            [heightChild1, centerChild1],
            [height[i], centerChild1],
            [height[i], centerChild2],
            [heightChild2, centerChild2]
        ];

        this.group.append("path")
            .attr("d", line(linexy))
            .attr("class","dendrogramConnector");

    }
};