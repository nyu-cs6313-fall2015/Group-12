"use strict";

function Controller (){
    this.description = "Class Controller";
    this.clusterVis = new ClusterVis();
    this.dendrogram = undefined;
    this.dataViews = undefined;
    this.entropyCalculator = undefined;
    this.entropyPerCluster = undefined;
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

    this.entropyCalculator = new EntropyCalculator(this.data);

    this.dataViews = new DataViews(this, data.data, this.clusterVis.svg,
        {
            x: .25*this.clusterVis.width + 10,
            y: .15 * this.clusterVis.height,
            width:.55*this.clusterVis.width - 10,
            height:.85 * this.clusterVis.height
        }, this.dendrogram.scales.y);

    this.entropyPerCluster = new EntropyPerCluster(this, data.data, this.clusterVis.svg, {
        x: .80*this.clusterVis.width + 10,
        y: .15 * this.clusterVis.height,
        width:.20 * this.clusterVis.width - 20,
        height:.85 * this.clusterVis.height
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

Controller.prototype.dfs = function(root){
    var merges = this.data.hclust.merge;
    var centers = this.dendrogram.centers;

    var toExplore = [root];
    var children = [];
    var current, curCenter;
    var nElem = this.data.hclust.order.length;
    var minCenter = Infinity, maxCenter = -1;
    while (toExplore.length > 0){
        current = toExplore.pop();
        if (current < 0){
            //is a leaf
            children.push(-current - 1);
            curCenter = centers[nElem + current];
            if (curCenter < minCenter)
                minCenter = curCenter;
            if (curCenter > maxCenter)
                maxCenter = curCenter;
        }else{
            //is not a leaf
            toExplore.push(merges[current-1][0]);
            toExplore.push(merges[current-1][1]);
        }
    }
    return {children: children, minCenter: minCenter, maxCenter: maxCenter};
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
        return centers[nElem + a] - centers[nElem + b];
    });

    var clusters = [];
    var clusterBoxes = [];
    var colors = d3.scale.category10().range();
    for (var i = 0; i < roots.length; i++) {
        var cluster;
        cluster = this.dfs(roots[i]);
        clusters[i] = cluster.children;
        clusterBoxes.push({height:heights[roots[i]-1], y0:cluster.minCenter, y1:cluster.maxCenter, color: colors[i % colors.length]});
    }
    this.dendrogram.drawClusters(clusterBoxes);
    this.entropyViews(clusters);
    this.clusterViews(clusters);
};

Controller.prototype.entropyViews = function(clusters){
    var entropiesDecrease = [];
    for (var clustId = 0; clustId < clusters.length; clustId++){
        entropiesDecrease[clustId] = [];
        for (var dimId = 0; dimId < this.data.data.length; dimId++){
            var entropy = this.entropyCalculator.calcEntropy(dimId, clusters[clustId]);
            var decreaseEntropyPercentage = 1 - entropy / this.data.data[dimId].entropy;
            entropiesDecrease[clustId].push(decreaseEntropyPercentage);
        }
    }
    this.entropyPerCluster.draw(entropiesDecrease);
};

Controller.prototype.clusterViews = function(children) {
    this.dataViews.createViews(children);
};
