function Box(d, svg, limits, scaleY) {

    var bp = this;

    bp.data = d.values;
    bp.svg = svg;
    bp.limits = limits;

    bp.width = limits.width;

    //bp.y = d3.scale.linear()
    //    .domain(d3.extent(bp.data))
    //    .range([limits.y + limits.height, limits.y]);

    bp.y = scaleY
        .range([limits.y + limits.height, limits.y]);

    var whiskers = boxWhiskers;
    var quartiles = boxQuartiles;

    bp.data.sort(); //function(a, b) { return b - a; }
    var n = bp.data.length;
    var min = bp.data[0];
    var max = bp.data[n - 1];

    var tickFormat = null;

    // Compute quartiles. Must return exactly 3 elements.
    bp.quartileData = bp.data.quartiles = quartiles(bp.data);

    // Compute whiskers. Must return exactly 2 elements, or null.
    bp.whiskerIndices = whiskers && whiskers(bp.data);
    bp.whiskerData = bp.whiskerIndices && bp.whiskerIndices.map(function (i) {
                return bp.data[i];
            });

    // Compute outliers. If no whiskers are specified, all data are "outliers".
    // We compute the outliers as indices, so that we can join across transitions!
    bp.outlierIndices = bp.whiskerIndices
        ? d3.range(0, bp.whiskerIndices[0]).concat(d3.range(bp.whiskerIndices[1] + 1, n))
        : d3.range(n);
}

Box.prototype.draw = function(){

    var bp = this;

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
    var center = bp.svg.selectAll("line.center")
        .data(bp.whiskerData ? [bp.whiskerData] : []);


    center.enter().insert("line", "rect")
        .attr("class", "center")
        .attr("x1", bp.width / 2)
        .attr("y1", function (d) {
            return  bp.y(d[0]);
        })
        .attr("x2", bp.width / 2)
        .attr("y2", function (d) {
            return bp.y(d[1]);
        });


    // Update innerquartile box.
    var box = bp.svg.selectAll("rect.box")
        .data([bp.quartileData]);

    box.enter().append("rect")
        .attr("class", "box")
        .attr("x", 0)
        .attr("y", function (d) {
            return bp.y(d[2]);
        })
        .attr("width", bp.width)
        .attr("height", function (d) {
            return bp.y(d[0]) - bp.y(d[2]);
        });

    //// Update median line.
    var medianLine = bp.svg.selectAll("line.median")
        .data([bp.quartileData[1]])
        .enter().append("line")
        .attr("class", "median")
        .attr("x1", 0)
        .attr("y1", bp.y)
        .attr("x2", bp.width)
        .attr("y2", bp.y);

    // Update whiskers.
    var whisker = bp.svg.selectAll("line.whisker")
        .data(bp.whiskerData || [])
        .enter().insert("line", "circle, text")
        .attr("class", "whisker")
        .attr("x1", 0)
        .attr("y1",  bp.y)
        .attr("x2", bp.width)
        .attr("y2",  bp.y);

    //// Update outliers.
    var outlier = bp.svg.selectAll("circle.outlier")
        .data(bp.outlierIndices, Number)
        .enter().insert("circle", "text")
        .attr("class", "outlier")
        .attr("r", 5)
        .attr("cx", bp.width / 2)
        .attr("cy", function (i) {
            return bp.y(d[i]);
        });

    //
    //// Compute the tick format.
    var format = bp.tickFormat || bp.y.tickFormat(8);

    // Update box ticks.
    var boxTick = bp.svg.selectAll("text.box")
        .data(bp.quartileData);

    boxTick.enter().append("text")
        .attr("class", "boxtext")
        .attr("dy", ".3em")
        .attr("dx", function (d, i) {
            return i & 1 ? 6 : -6
        })
        .attr("x", function (d, i) {
            return i & 1 ? bp.width : 0
        })
        .attr("y", bp.y)
        .attr("text-anchor", function (d, i) {
            return i & 1 ? "start" : "end";
        })
        .text(format);
    //
    //// Update whisker ticks. These are handled separately from the box
    //// ticks because they may or may not exist, and we want don't want
    //// to join box ticks pre-transition with whisker ticks post-.
    var whiskerTick =  bp.svg.selectAll("text.whisker")
        .data(bp.whiskerData || []);

    whiskerTick.enter().append("text")
        .attr("class", "boxtext")
        .attr("dy", ".3em")
        .attr("dx", 6)
        .attr("x", bp.width)
        .attr("y", bp.y)
        .text(format);
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