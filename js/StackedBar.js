function StackedBar(d, svg, limits, colorScale){

    var sb = this;

    sb.data = d;
    sb.svg = svg;
    sb.limits = limits;

    sb.width = limits.width; // TODO: this width needs to change!!

    sb.y = d3.scale.linear()
        .domain([0, sb.data.values.length])
        .range([limits.y + limits.height, limits.y]);


    sb.data_bins = d3.nest()
        .key(function(d) { return d; })
        .rollup(function(v) { return v.length; })
        .entries(sb.data.values);

    sb.data_bins.sort(function(a, b) { return b.values - a.values; });

    //sb.color =  d3.scale.ordinal()
    //    .range(colorbrewer.Set2[8]);
    //    .domain(sb.data_bins.map(function(d) { return d.key; }));

    sb.color = colorScale;

    var y0 = 0;
    sb.data_bins.forEach(function(d){
        d.y0 = y0;
        d.y1 = y0 += +d["values"];
    });


}

StackedBar.prototype.draw = function(){
    var sb = this;

    sb.svg.selectAll("rect")
        .data(sb.data_bins)
        .enter().append("rect")
        .attr("width", sb.width)//x.rangeBand())
        .attr("y", function(d) { return sb.y(d.y1); })
        .attr("height", function(d) { return sb.y(d.y0) - sb.y(d.y1); })
        .style("fill", function(d){ return sb.color(d.key)});
};