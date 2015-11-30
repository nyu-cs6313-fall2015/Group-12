function DendrogramLine(controller, canvas, scaleX, scaleY, initialHeight){
    this.description = "DendrogramLine: auxiliar class - Dendrogram cutting height";
    this.controller = controller;
    this.canvas = canvas;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.lines = [];

    //All variables in lines are in the original space (not scaled)
    this.lines.push({height:initialHeight, y0:this.scaleY.domain()[0], y1:this.scaleY.domain()[1]});
    
    var self = this;
    this.d3line = d3.svg.line()
        .x(function(d){ return self.scaleX(d[0]); })
        .y(function(d){ return self.scaleY(d[1]); })
        .interpolate("linear");
    
    this.createDrag();
    this.draw();
}

DendrogramLine.prototype.createDrag = function(){
    var self = this;
    this.drag = d3.behavior.drag()
        .on("drag", function(d){
            var idx = parseInt(d3.select(this).attr("indexArray"));
            var x = d3.mouse(self.canvas.node())[0];
            if (x > self.scaleX.range()[0]){
                x = self.scaleX.range()[0];
            }else if (x < self.scaleX.range()[1]){
                x = self.scaleX.range()[1];
            }

            self.lines[idx].height = self.scaleX.invert(x);

            d3.select(this)
                .attr("transform", function(d) {
                    return "translate(" + ( x - self.scaleX.range()[1])+ ", 0)";
                })

            self.controller.cutTree();
        });
}

DendrogramLine.prototype.draw = function(){
    var self=this;

    var selection = this.canvas.selectAll("path.cutLine")
        .data(self.lines, function(d,i){ return i; });

    selection
        .enter()
        .append("path")
        .style("fill","none")
        .style("stroke","red")
        .style("stroke-width", "5")
        .attr("class", "cutLine")
        .attr("indexArray", function(d,i){return ""+i})
        .attr("transform", function(d, i){return "translate(" + (self.scaleX(d.height) - self.scaleX.range()[1]) + ", 0)";})
        .on("click",function(d){
            if (d3.event.shiftKey) {
                var idx = parseInt(d3.select(this).attr("indexArray"));
                var pos = d3.mouse(self.canvas.node());
                var y = self.scaleY.invert(pos[1]);
                var aux = self.lines[idx].y1;
                self.lines[idx].y1 = y;
                self.lines.push({height:self.lines[idx].height, y0: y, y1: aux});
                self.draw();
            }
        })
        .call(self.drag);

        selection.attr("d", function(d){
            console
            var l = [
                [self.scaleX.domain()[1], d.y0], 
                [self.scaleX.domain()[1], d.y1]
            ]; 
            return self.d3line(l); 
        })
};