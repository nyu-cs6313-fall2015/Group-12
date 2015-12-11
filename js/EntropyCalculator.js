function EntropyCalculator(data){
    this.description = "Computes cluster entropy per dimension";
    this.data = data;
}

EntropyCalculator.prototype.calcEntropy = function(dimensionId, clusterIds){
    var myData = this.data.data[dimensionId];
    var entropy = 0, p;
    var nsamples = clusterIds.length;
    if (myData.type == "categorical"){
        var hist = {};
        var nclass = myData.levels.length;
        for (var i = 0; i < nclass; i++){
            hist[myData.levels[i]] = 0;
        }
        for (var i = 0; i < nsamples; i++){
            hist[myData.values[clusterIds[i]]]++;
        }
        for (var i = 0; i < nclass; i++){
            p = hist[myData.levels[i]]/nsamples;
            if (p > 0)
                entropy = entropy + p * Math.log2(p);
        }
    }else{
        var nBins = myData.breaks.length;
        var hist = [];
        for (var i = 0; i < nBins; i++){
            hist.push(0);
        }
        for (var i = 0; i < nsamples; i++){
            hist[this.searchBin(myData.breaks, myData.values[clusterIds[i]])]++;
        }
        for (var i = 0; i < nBins; i++){
            p = hist[i]/nsamples;
            if (p > 0)
                entropy = entropy + p * Math.log2(p)
        }
    }
    return -entropy;
};

EntropyCalculator.prototype.searchBin = function(breaks, value) {
    var minIndex = 0;
    var maxIndex = breaks.length -2; //do not consider last element
    var i;

    while (minIndex <= maxIndex) {
        i = Math.floor((minIndex + maxIndex) / 2);
        if (value < breaks[i]){
            maxIndex = i - 1;
        }else{
            if (value < breaks[i+1]){
                return i;
            }else{
                minIndex = i + 1;
            }
        }
    }
};