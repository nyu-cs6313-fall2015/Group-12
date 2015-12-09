function StackedBar(d, svg, limits, colorScale, tooltip){

    var self = this;

    self.data = d;
    self.svg = svg;
    self.limits = limits;
    self.tooltip = tooltip;

    self.width = limits.width; // TODO: this width needs to change!!

    self.y = d3.scale.linear()
      .domain([0, self.data.values.length])
      .range([limits.y + limits.height, limits.y]);


    self.data_bins = d3.nest()
      .key(function(d) { return d; })
      .rollup(function(v) { return v.length; })
      .entries(self.data.values);

    self.data_bins.sort(function(a, b) { return b.values - a.values; });

    //self.color =  d3.scale.ordinal()
    //    .range(colorbrewer.Set2[8]);
    //    .domain(self.data_bins.map(function(d) { return d.key; }));

    self.color = colorScale;

    var y0 = 0;
    self.data_bins.forEach(function(d){
        d.y0 = y0;
        d.y1 = y0 += +d["values"];
        d.dimension = self.data.dimension;
    });


}

StackedBar.prototype.draw = function(){
    var self = this;

    self.svg.selectAll("rect")
      .data(self.data_bins)
      .enter().append("rect")
      .attr("width", self.width)//x.rangeBand())
      .attr("y", function(d) { return self.y(d.y1); })
      .attr("height", function(d) { return self.y(d.y0) - self.y(d.y1); })
      .style("fill", function(d){ return self.color(d.key)})
      .on("mouseover", function (d,i) {
          self.tooltip.show(d.dimension + ":  " + d.key);
      })
      .on("mouseout", function (d) {
          self.tooltip.hide();
      })
      .on("mousemove", function(d){
          self.tooltip.updatePosition();
      });
    ;
};