"use strict";

function Controller (){
    this.description = "Class Controller";
    this.clusterVis = new ClusterVis();
    this.dendrogram = undefined;
}

Controller.prototype.dataUpdated = function(data){
    this.data = data;
    this.dendrogram = new Dendrogram(this, data, this.clusterVis.svg,
        {   
            x: 10,
            y: .15 * this.clusterVis.height,
            width:.25*this.clusterVis.width - 10 ,
            height:.85 * this.clusterVis.height - 6
        });
    this.cutTree();
};

Controller.prototype.intercepts = function(cutline, dline){
    if (cutline.height > dline.x0) return false;
    if (cutline.height < dline.x1) return false;
    if (dline.y < cutline.y0) return false;
    if (dline.y > cutline.y1) return false;
    return true;
};

Controller.prototype.dfs = function(root, merges){
    //Remember that R indexes are 1-based
    var toExplore = [root];
    var children = [];
    var current;
    while (toExplore.length > 0){
        current = toExplore.pop();
        if (current < 0){
            //is a leaf
            children.push(-current - 1)
        }else{
            //is not a leaf
            toExplore.push(merges[current-1][0]);
            toExplore.push(merges[current-1][1]);
        }
    }
    return children;
};

Controller.prototype.cutTree = function(){
    var dLines = this.dendrogram.dendrogramLine.lines;
    var merges = this.data.hclust.merge;
    var heights = this.data.hclust.height;
    var centers = this.dendrogram.centers;
    var nElem = this.data.hclust.order.length;

    var roots = [];

    for (var iLine = 0; iLine < dLines.length; iLine++){
        var cutline = dLines[iLine];
        for (var iMerge = 0; iMerge < merges.length; iMerge++){
            //Dendrogram line 1 (for each merge)
            var d1 = {
                x0:heights[iMerge], 
                x1:(merges[iMerge][0] < 0? 0: heights[merges[iMerge][0]-1]), 
                y: centers[merges[iMerge][0]+nElem]//iMerge+1+nElem]
            };
            if (this.intercepts(cutline, d1)){
                roots.push(merges[iMerge][0]);
            }

            //Dendrogram line 2
            var d2 = {
                x0:heights[iMerge], 
                x1:(merges[iMerge][1] < 0? 0: heights[merges[iMerge][1]-1]), 
                y: centers[merges[iMerge][1]+nElem]
            };
            if (this.intercepts(cutline, d2)){
                roots.push(merges[iMerge][1]);
            }
        }
    }

    //Sorting the roots (clusters in ascending order)
    roots.sort(function(a,b){
        return heights[a] - heights[b];
    });

    var clusters = [];
    for (var i = 0; i < roots.length; i++) {
        clusters[i] = this.dfs(roots[i], merges);
    }

    this.clusterViews(clusters);
};

Controller.prototype.clusterViews = function(children) {
    var self = this;
    var numClusters = children.length;
    var data = self.data.data;


    if(self.dataSummaryViews)
        d3.selectAll(".data_summary_group").remove();

    self.dataSummaryViews = [];

    children.forEach(createDataSummary);

    function createDataSummary(child, i){
        var childData = [];

        data.forEach( createChildData );
        var limits = {
            x: 5+.25*  self.clusterVis.width,
            y:.15* self.clusterVis.height + i*(.85 * self.clusterVis.height)/numClusters ,
            width: .65* self.clusterVis.width - 5,
            height: (.85 *  self.clusterVis.height)/numClusters - 15
        };

        var view = new DataSummary(childData, self.clusterVis.svg, limits);

        self.dataSummaryViews.push(view);

        function createChildData (d,i) {
            childData[i] = d.constructor(); // give temp the original obj's constructor
            for (var key in d) {
                if (key !== "values") {
                    childData[i][key] = d[key];
                }
                else {
                    childData[i].values = [];
                    child.forEach(function (ci) {
                        childData[i].values.push(d["values"][ci]);
                    });
                }
            }
        }
    }

}