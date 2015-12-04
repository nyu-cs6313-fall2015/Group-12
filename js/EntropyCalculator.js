function EntropyCalculator(data){
    this.description = "Computes cluster entropy per dimension";
    this.data = data;
}

EntropyCalculator.prototype.calcEntropy = function(dimensionId, clusterIds){
    var myData = this.data.data[dimensionId];
    if (myData.type == "categorical"){
        var hist = {};
        for (var i = 0; i < myData.levels.length; i++){
            hist[myData.levels[i]] = 0;
        }
        for (var i = 0; i < clusterIds.length; i++){
            hist[myData.values[clusterIds[i]]]++;
        }
    }else{
        var bin;
        var hist = [];
        for (var i = 0; i < myData.breaks.length; i++){
            hist.push(0);
        }
        for (var i = 0; i < clusterIds.length; i++){
            bin = this.searchBin(myData.breaks, myData.values[clusterIds[i]]);
            hist[bin]++;
        }
    }
    console.log(hist)
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