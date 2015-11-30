require(cluster)
require(RJSONIO)

clusterObj <- function(originalData, distanceFunction = daisy, removeFromCluster = NULL){
    if (length(removeFromCluster) > 0){
        toClust = originalData[,-removeFromCluster];
    }else{
        toClust = originalData;
    }
    d = distanceFunction(toClust)
    h = hclust(d)
    
    data = list()
    namesData = names(originalData)
    for (i in 1:length(namesData)){
      data[[i]] = list()
      data[[i]]$dimension = namesData[i]
      if (class(originalData[[namesData[i]]]) == "numeric"){
        data[[i]]$type = "quantitative"
      }else{
        data[[i]]$type = "categorical"
      }
      data[[i]]$values = originalData[[namesData[i]]]
    }

    myObj = list()
    myObj$data = data
    myObj$hclust = h
    return (myObj)
}

data = read.csv("~/Desktop/pvecs/pvecs_small.csv")
o = clusterObj(data)
sink('pvecs_small_cluster.json')
cat(toJSON(o))
sink()

