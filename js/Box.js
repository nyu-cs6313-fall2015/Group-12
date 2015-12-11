function Box(d, svg, limits, scaleY, tooltip) {

    var self = this;

    self.data = d.values;
    self.dimension = d.dimension;
    self.svg = svg;
    self.limits = limits;
    self.tooltip = tooltip;

    self.width = limits.width;

    //self.y = d3.scale.linear()
    //    .domain(d3.extent(self.data))
    //    .range([limits.y + limits.height, limits.y]);

    self.y = scaleY
      .range([limits.y + limits.height, limits.y]);

    var whiskers = boxWhiskers;
    var quartiles = boxQuartiles;

    self.data.sort(function(a, b) { return a - b; });
    var n = self.data.length;
    var min = self.data[0];
    var max = self.data[n - 1];

    var tickFormat = null;

    // Compute quartiles. Must return exactly 3 elements.
    self.quartileData = self.data.quartiles = quartiles(self.data);

    // Compute whiskers. Must return exactly 2 elements, or null.
    self.whiskerIndices = whiskers && whiskers(self.data);
    self.whiskerData = self.whiskerIndices && self.whiskerIndices.map(function (i) {
          return self.data[i];
      });

    // Compute outliers. If no whiskers are specified, all data are "outliers".
    // We compute the outliers as indices, so that we can join across transitions!
    self.outlierIndices = self.whiskerIndices
      ? d3.range(0, self.whiskerIndices[0]).concat(d3.range(self.whiskerIndices[1] + 1, n))
      : d3.range(n);
}

Box.prototype.draw = function(){

    var self = this;

    //// Compute the new x-scale.
    //var x1 = d3.scale.linear()
    //    .domain(domain && domain.call(this, d, i) || [min, max])
    //    .range([height, 0]);
    //
    //// Retrieve the old x-scale, if this is an update.
    //var x0 = this.__chart__ || d3.scale.linear()
    //        .domain([0, Infinity])
    //        .range(x1.range());
    //
    //// Stash the new scale.
    //this.__chart__ = x1;

    // Note: the box, median, and box tick elements are fixed in number,
    // so we only have to handle enter and update. In contrast, the outliers
    // and other elements are variable, so we need to exit them! Variable
    // elements also fade in and out.

    // Update center line: the vertical line spanning the whiskers.
    var center = self.svg.selectAll("line.center")
      .data(self.whiskerData ? [self.whiskerData] : []);


    center.enter().insert("line", "rect")
      .attr("class", "center")
      .attr("x1", self.width / 2)
      .attr("y1", function (d) {
          return  self.y(d[0]);
      })
      .attr("x2", self.width / 2)
      .attr("y2", function (d) {
          return self.y(d[1]);
      })
      .on("mouseover", function (d,i) {
          self.tooltip.show(self.dimension + ":  median " + d[1]);
      })
      .on("mouseout", function (d) {
          self.tooltip.hide();
      })
      .on("mousemove", function(d){
          self.tooltip.updatePosition();
      });


    // Update innerquartile box.
    var box = self.svg.selectAll("rect.box")
      .data([self.quartileData]);

    box.enter().append("rect")
      .attr("class", "box")
      .attr("x", 0)
      .attr("y", function (d) {
          return self.y(d[2]);
      })
      .attr("width", self.width)
      .attr("height", function (d) {
          return self.y(d[0]) - self.y(d[2]);
      })
      .on("mouseover", function (d,i) {
          self.tooltip.show(self.dimension + ":  median " + d[1]);
      })
      .on("mouseout", function (d) {
          self.tooltip.hide();
      })
      .on("mousemove", function(d){
          self.tooltip.updatePosition();
      });

    //// Update median line.
    var medianLine = self.svg.selectAll("line.median")
      .data([self.quartileData[1]])
      .enter().append("line")
      .attr("class", "median")
      .attr("x1", 0)
      .attr("y1", self.y)
      .attr("x2", self.width)
      .attr("y2", self.y);

    // Update whiskers.
    var whisker = self.svg.selectAll("line.whisker")
      .data(self.whiskerData || [])
      .enter().insert("circle", "circle, text")
      .attr("class", "whisker")
      .attr("cx", self.width/2)
      .attr("cy",  self.y)
      .attr("r", 3)
      .on("mouseover", function (d,i) {
          self.tooltip.show(self.dimension + ":  whisker value " + d);
      })
      .on("mouseout", function (d) {
          self.tooltip.hide();
      })
      .on("mousemove", function(d){
          self.tooltip.updatePosition();
      });

    //// Update outliers.
    var outlier = self.svg.selectAll("circle.outlier")
      .data(self.outlierIndices, Number)
      .enter().insert("circle", "text")
      .attr("class", "outlier")
      .attr("r", 5)
      .attr("cx", self.width / 2)
      .attr("cy", function (i) {
          return self.y(d[i]);
      });

    //
    ////// Compute the tick format.
    //var format = self.tickFormat || self.y.tickFormat(8);
    //
    //// Update box ticks.
    //var boxTick = self.svg.selectAll("text.box")
    //    .data(self.quartileData);
    //
    //boxTick.enter().append("text")
    //    .attr("class", "boxtext")
    //    .attr("dy", ".3em")
    //    .attr("dx", function (d, i) {
    //        return i & 1 ? 6 : -6
    //    })
    //    .attr("x", function (d, i) {
    //        return i & 1 ? self.width : 0
    //    })
    //    .attr("y", self.y)
    //    .attr("text-anchor", function (d, i) {
    //        return i & 1 ? "start" : "end";
    //    })
    //    .text(format);
    ////
    ////// Update whisker ticks. These are handled separately from the box
    ////// ticks because they may or may not exist, and we want don't want
    ////// to join box ticks pre-transition with whisker ticks post-.
    //var whiskerTick =  self.svg.selectAll("text.whisker")
    //    .data(self.whiskerData || []);
    //
    //whiskerTick.enter().append("text")
    //    .attr("class", "boxtext")
    //    .attr("dy", ".3em")
    //    .attr("dx", 6)
    //    .attr("x", self.width)
    //    .attr("y", self.y)
    //    .text(format);
}
//
//        box.width = function(x) {
//            if (!arguments.length) return width;
//            width = x;
//            return box;
//        };
//
//        box.height = function(x) {
//            if (!arguments.length) return height;
//            height = x;
//            return box;
//        };
//
//        box.tickFormat = function(x) {
//            if (!arguments.length) return tickFormat;
//            tickFormat = x;
//            return box;
//        };
//
//        box.duration = function(x) {
//            if (!arguments.length) return duration;
//            duration = x;
//            return box;
//        };
//
//        box.domain = function(x) {
//            if (!arguments.length) return domain;
//            domain = x == null ? x : d3.functor(x);
//            return box;
//        };
//
//        box.value = function(x) {
//            if (!arguments.length) return value;
//            value = x;
//            return box;
//        };
//
//        box.whiskers = function(x) {
//            if (!arguments.length) return whiskers;
//            whiskers = x;
//            return box;
//        };
//
//        box.quartiles = function(x) {
//            if (!arguments.length) return quartiles;
//            quartiles = x;
//            return box;
//        };
//
//        return box;
//    };

function boxWhiskers(d) {
    return [0, d.length - 1];
}

function boxQuartiles(d) {
    return [
        d3.quantile(d, .25),
        d3.quantile(d, .5),
        d3.quantile(d, .75)
    ];
}