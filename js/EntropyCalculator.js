function EntropyCalculator(data){
    this.description = "Computes cluster entropy per dimension";
    this.data = data;
}

EntropyCalculator.prototype.calcEntropy = function(dimensionId, clusterIds){
    var myData = this.data[dimensionId];
    if (myData.type == "categorical"){
        var hist = {};
        for (var i = 0; i < myData.levels.length; i++){
            hist[myData.levels[i]] = 0;
        }
        for (var i = 0; i < clusterIds.length; i++){
            hist[myData.values[clusterIds[i]]]++;
        }
    }else{

    }
};


function binaryIndexOf(searchElement) {
    'use strict';

    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex];

        if (currentElement < searchElement) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement > searchElement) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }

    return -1;
}

