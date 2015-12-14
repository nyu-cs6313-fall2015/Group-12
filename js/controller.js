"use strict";

function Controller (){
    this.description = "Class Controller";
    this.clusterVis = new ClusterVis();
    this.dendrogram = undefined;
    this.dataViews = undefined;
    this.entropyCalculator = undefined;
    this.entropyPerCluster = undefined;
    this.topEntropy = undefined;
    this.tooltip = new Tooltip();
}

Controller.prototype.reorderDimensions = function(newOrder){
    this.entropyPerCluster.reorderDimensions(newOrder);
    this.topEntropy.reorderDimensions(newOrder);
    this.dataViews.reorderDimensions(newOrder);
};


Controller.prototype.dataUpdated = function(data){
    this.data = data;

    this.entropyCalculator = new EntropyCalculator(this.data);

    this.dendrogram = new Dendrogram(this, data, this.clusterVis.svg,
        {
            x: 10,
            y: 5,
            width: .25 * this.clusterVis.width -10,
            height:.15 * this.clusterVis.height -10
        });

    this.dataViews = new DataViews(this, data.data, this.clusterVis.svg,
        {
            x: .25*this.clusterVis.width + 10,
            y: .15 * this.clusterVis.height,
            width:.75*this.clusterVis.width - 20,
            height:.85 * this.clusterVis.height
        }, this.dendrogram.scales.y);


    this.entropyPerCluster = new EntropyPerCluster(this, data.data, this.clusterVis.svg, {
        x: 10,
        y: .15 * this.clusterVis.height,
        width:.25 * this.clusterVis.width -10,
        height:.85 * this.clusterVis.height
    });

    this.topEntropy = new TopEntropy(this, data.data, this.clusterVis.svg,
        {
            x: .25*this.clusterVis.width + 10,
            y: 5,
            width: .75*this.clusterVis.width - 20,
            height:.15 * this.clusterVis.height -10
        });


    /*this.dimensionList = new DimensionList(this, data, {
        x: 10,
        y: .15 * this.clusterVis.height+50, //dont ask why... :(
        width: .25 * this.clusterVis.width -10,
        height: .85 * this.clusterVis.height - 6
    });*/


    /*this.simplifiedDendrogram = new SimplifiedDendrogram(this, data, this.clusterVis.svg,
        {
            x: 10,
            y: .15 * this.clusterVis.height,
            width: .25 * this.clusterVis.width ,
            height: .85 * this.clusterVis.height - 6
        });*/

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
    var nClass = this.data.hclust.order.length;
    var minCenter = Infinity, maxCenter = -1;
    while (toExplore.length > 0){
        current = toExplore.pop();
        if (current < 0){
            //is a leaf
            children.push(-current - 1);
            curCenter = centers[nClass + current];
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
    var nClass = this.data.hclust.order.length;

    var roots = [];
    for (var iLine = 0; iLine < dLines.length; iLine++){
        var cutline = dLines[iLine];
        for (var iMerge = 0; iMerge < merges.length; iMerge++){
            //Dendrogram line 1 (for each merge)
            var d1 = {
                x0:heights[iMerge], 
                x1:(merges[iMerge][0] < 0? 0: heights[merges[iMerge][0]-1]), 
                y: centers[merges[iMerge][0]+nClass]//iMerge+1+nClass]
            };
            if (this.intercepts(cutline, d1)){
                roots.push(merges[iMerge][0]);
            }

            //Dendrogram line 2
            var d2 = {
                x0:heights[iMerge], 
                x1:(merges[iMerge][1] < 0? 0: heights[merges[iMerge][1]-1]), 
                y: centers[merges[iMerge][1]+nClass]
            };
            if (this.intercepts(cutline, d2)){
                roots.push(merges[iMerge][1]);
            }
        }
    }

    //Sorting the roots (clusters in ascending order)
    roots.sort(function(a,b){
        return centers[nClass + a] - centers[nClass + b];
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
    this.entropyViews(clusters, colors);
    this.clusterViews(clusters, colors);
};

Controller.prototype.entropyViews = function(clusters, colors){
    var averageEntropyDecrease = [];
    var entropiesDecrease = [];
    for (var i = 0; i < this.data.data.length; i++){averageEntropyDecrease.push(0)}

    for (var clustId = 0; clustId < clusters.length; clustId++){
        entropiesDecrease[clustId] = [];
        for (var dimId = 0; dimId < this.data.data.length; dimId++){
            var normalization = 1;
            if (this.data.data[dimId].type == "quantitative"){
                normalization = Math.log2(this.data.data[dimId].breaks.length -1);
            }else{
                normalization = Math.log2(this.data.data[dimId].levels.length);
            }
            var entropy = this.entropyCalculator.calcEntropy(dimId, clusters[clustId]);
            var decreaseEntropyPercentage = Math.min(1,Math.max(0, this.data.data[dimId].entropy/normalization - entropy/normalization));
            entropiesDecrease[clustId].push(decreaseEntropyPercentage);
            averageEntropyDecrease[dimId] += decreaseEntropyPercentage/clusters.length;
        }
    }
    this.entropyPerCluster.draw(entropiesDecrease, colors);
    this.topEntropy.draw(averageEntropyDecrease);
};


Controller.prototype.clusterViews = function(children, colors) {
    this.dataViews.createViews(children, colors);
};
