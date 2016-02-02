function Violin(d, svg, limits, scaleY, tooltip) {

  var self = this;

  self.data = d.values;
  self.dimension = d.dimension;
  self.svg = svg;
  self.limits = limits;
  self.tooltip = tooltip;

  self.width = limits.width;

  var resolution = 10;
  //self.y = d3.scale.linear()
  //    .domain(d3.extent(self.data))
  //    .range([limits.y + limits.height, limits.y]);

  self.y = scaleY
    .range([limits.y + limits.height, limits.y]);


  var whiskers = boxWhiskers;
  var quartiles = boxQuartiles;

  self.data.sort(d3.ascending);
  var n = self.data.length;
  var min = self.data[0];
  var max = self.data[n - 1];

  var tickFormat = null;

  self.layout = d3.layout.histogram()
    .bins(resolution)
    .frequency(0)
    (self.data);

  self.x = d3.scale.linear()
    .range([self.width / 2, 0])
    .domain([0, d3.max(self.layout, function(d) { return d.y; })]);

}

Violin.prototype.draw = function() {

  var self = this;
  var interpolation='monotone';
  var violinColor = "#cccccc";

  var area = d3.svg.area()
    .interpolate(interpolation)
    .x(function(d) {
      if(interpolation=="step-before")
        return self.y(d.x+d.dx/2)
      return self.y(d.x);
    })
    .y0(self.width/2)
    .y1(function(d) { return self.x(d.y); });

  var line=d3.svg.line()
    .interpolate(interpolation)
    .x(function(d) {
      if(interpolation=="step-before")
        return self.y(d.x+d.dx/2)
      return self.y(d.x);
    })
    .y(function(d) { return self.x(d.y); });

  var gPlus = self.svg.append("g")
  var gMinus = self.svg.append("g")

  gPlus.append("path")
    .datum(self.layout)
    .attr("class", "area")
    .attr("d", area)
    .style("fill", violinColor);

  gPlus.append("path")
    .datum(self.layout)
    .attr("class", "violin")
    .attr("d", line)
    .style("stroke", violinColor)
    .style("fill", "none");

  gMinus.append("path")
    .datum(self.layout)
    .attr("class", "area")
    .attr("d", area)
    .style("fill", violinColor);

  gMinus.append("path")
    .datum(self.layout)
    .attr("class", "violin")
    .attr("d", line)
    .style("stroke", violinColor)
    .style("fill", "none");

  var x= self.width;

  gMinus.attr("transform", "rotate(90,0,0)  translate(0,-"+self.width+")");//translate(0,-200)");
  gPlus.attr("transform", "rotate(90,0,0) scale(1,-1)");
}