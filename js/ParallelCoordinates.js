
function ParallelCoordinates(data, svg, limits, dataDimensionScales, boxColor, tooltip){
  var self = this;
  this.description = "Data Summary Object";
  this.data = data;
  this.processed_data = d3.transpose(this.data.map( function(d){return d.values}));
  this.limits = limits;
  this.boxColor = boxColor;
  this.tooltip = tooltip;



  this.svg = svg.append("g").attr("class","data_summary_group");;//.attr("transform", "translate(" +  limits.x + ","+ limits.y + ")");
  this.dimensions = data.map(function(d) { return d.dimension; });
  this.order = d3.range(this.dimensions.length);

  this.makeBox();

  this.limits.y = this.limits.y + 6;
  this.limits.height = this.limits.height-12;
  this.scales = {};
  this.scales.x = d3.scale.ordinal()
    .domain(this.dimensions)
    .rangePoints([this.limits.x, this.limits.x + this.limits.width], 1);

  this.scales.y = dataDimensionScales;
  this.scales.y.forEach(function(d,i) {
    if (self.data[i].type == 'quantitative')
      d.range([ self.limits.y + self.limits.height, self.limits.y]);
    else
      d.rangePoints([ self.limits.y + self.limits.height, self.limits.y]);
  });

  //this.data.map(function(d){
  //  if (d.type == "quantitative") {
  //    return d3.scale.linear()
  //      .domain(d3.extent(d.values))
  //      .range([self.limits.y, self.limits.y + self.limits.height]);
  //  }else if (d.type == "categorical") {
  //    return d3.scale.ordinal()
  //      .domain(d.levels)
  //      .range([self.limits.y, self.limits.y + self.limits.height]);
  //  }
  //});


  this.minWidth = 50;

  this.plots = [];


  this.draw();
}

ParallelCoordinates.prototype.makeBox = function (){
  var self = this;
  self.svg.append("rect")
    .attr("class","boxrect")
    .attr("x", self.limits.x)
    .attr("y", self.limits.y)
    .attr("width", self.limits.width)
    .attr("height", self.limits.height)
    .style("stroke", self.boxColor);

}

ParallelCoordinates.prototype.draw = function(){

  var self = this;

  var axis = d3.svg.axis().orient("left");

  // Add grey background lines for context.
  //background = self.svg.append("g")
  //  .attr("class", "background")
  //  .selectAll("path")
  //.data(self.processed_data)
  //  .enter().append("path")
  //  .attr("d", function(d){ return self.path(d)})

  //// Add blue foreground lines for focus.
  self.foreground = self.svg.append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(self.processed_data)
    .enter().append("path")
    .attr("d", function(d){ return self.path(d)})
    .style("stroke", self.boxColor);


  // Add an axis and title.
  // Add a group element for each dimension.
  self.g = self.svg.selectAll(".dimension")
    .data(self.dimensions)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) { return "translate(" + self.scales.x(d) + ")"; })
    .append("g")
    .attr("class", "axis")
    .each(function(d,i) {
      d3.select(this)
        .call(axis.scale(self.scales.y[self.order[i]])); // self.scales.y[this.order[i]] needs to be a function
    });
};

ParallelCoordinates.prototype.remove = function(){
  d3.select(".data_summary_group").remove();
};

ParallelCoordinates.prototype.path = function(d){
  var self = this;
  var line = d3.svg.line();
  var coordinates = d.map(function(p, i) {
    return [self.position(p,i),  self.scales.y[self.order[i]](p)];//self.scales.y[self.order[i]](p)]; //  needs to be a function
  });
  return line(coordinates);
}

ParallelCoordinates.prototype.reorderDimensions = function(newOrder){
  var self = this;

  self.order = newOrder;
  self.scales.x.domain( d3.permute(self.dimensions, self.order) );

  var delay = function(d, i) { return i * 50; };


  var transitionf = self.foreground.transition().duration(750);
  transitionf.attr("d", function(d){ return  self.path(d3.permute(d, self.order)); });
  var transitiong =self.svg.transition().duration(750)
  transitiong.selectAll(".dimension")
    .delay(delay)
    .attr("transform", function(d, i) {
      return "translate(" + self.scales.x(d) + ")";
    });

  //transition.selectAll(".data_summary")
  //  .delay(delay)
  //  .attr("transform", function(d,i) {  return "translate(" + (x0(i)+self.xposInc) + ", 0)"; });
};

ParallelCoordinates.prototype.position = function (d,i) {
  var self = this;
  return self.scales.x(self.data[self.order[i]]['dimension']);
}

