function DimensionList(controller, data, limits){
    this.description = "Dimension List";
    this.data = data;
    this.controller = controller;
    this.container = d3.select("#main").append("div")
        .style("width", limits.width+"px")
        .style("height", limits.height + "px")
        .style("position","absolute")
        .style("left", limits.x + "px")
        .style("top",limits.y+"px")
        .style("float", "left");

    this.titleContainer = this.container.append("div")
        .attr("class","titleContainer")
        .style("width", limits.width+"px")
        .style("text-align","center")
        .text("Available dimensions");

    this.dimensionsContainer = this.container.append("div")
        .attr("class","dimensionsContainer")
        .style("width", limits.width+"px");

    for (var i = 0; i < data.data.length; i++){
        var div_i =  this.dimensionsContainer.append("div")
            .attr("class","dimension_i")
            .style("width", limits.width + "px");

        div_i.append('label')
            .text(data.data[i].dimension)
            .append("input")
            .attr("checked", true)
            .attr("type", "checkbox")
            .on("click",function(){

            });


    }
}