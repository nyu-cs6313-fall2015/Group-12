function SimplifiedDendrogram (controller, data, svg, limits){
    this.description = "Simplified dendrogram class.";
    this.controller = controller;
    this.data = data;
    this.svg = svg;
    this.limits = limits;

    this.dataViews = controller.dataViews;
    this.dendrogram = controller.dendrogram;
    this.x = controller.dendrogram.scales.x;
}

SimplifiedDendrogram.prototype.draw = function(roots){ //roots is in R convention. < 0 instance. > 0 cluster
    this.svg.selectAll('.simplifiedDendrogram').remove();
    this.group = this.svg.append('g').attr('class','simplifiedDendrogram');


    var centers = {};
    for (var i = 0; i < roots.length; i++){
        centers[roots[i]] = this.dataViews.limits.y + i* this.dataViews.limits.height/roots.length + (this.dataViews.limits.height/roots.length - 6)/2;
    }


    var XZERO = this.dendrogram.scales.x.domain()[0];
    var toDraw = roots.length;

    while(toDraw > 0){
        var i = +Object.keys(centers)[0];
        var father = +this.dendrogram.fathers[i]; //All iFather > 0
        var child1 = this.data.hclust.merge[father-1][0];
        var child2 = this.data.hclust.merge[father-1][1];
        var centerChild1 = centers[child1];
        var centerChild2 = centers[child2];
        centers[i] = (centerChild1 + centerChild2)/2;
        var heightChild1 = ((roots.indexOf(child1) < 0) || (child1 < 0) ? XZERO : this.data.hclust.height[child1-1]);
        var heightChild2 = ((roots.indexOf(child2) < 0) || (child2 < 0) ? XZERO : this.data.hclust.height[child2-1]);
        var heightFather = this.data.hclust.height[father-1];

        var linexy = [
            [heightChild1, centerChild1],
            [heightFather, centerChild1],
            [heightFather, centerChild2],
            [heightChild2, centerChild2]
        ];

        delete centers[child1];
        delete centers[child2];

        /*
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

         * */


        toDraw--;
    }




    this.group.append("rect")
        .attr("x", this.limits.x)
        .attr("y", this.limits.y)
        .attr("width", this.limits.width)
        .attr("height", this.limits.height)
        .attr("class", "boxrect")
        .attr("fill", "white")
        .style("stroke", "black");
};