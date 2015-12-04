require(cluster)
require(RJSONIO)

clusterObj <- function(originalData, distanceFunction = daisy, removeFromCluster = NULL){
    if (length(removeFromCluster) > 0){
        toClust = originalData[,-removeFromCluster];
    }else{
        toClust = originalData;
    }
    namesData = names(originalData)
    for (i in 1:length(namesData)){ #transform integer to categorical
      if (class(originalData[[namesData[i]]]) == "integer"){
        originalData[[namesData[i]]] = as.factor(originalData[[namesData[i]]])
      }
    }
  
    d = distanceFunction(toClust)
    h = hclust(d)
    
    data = list()
    for (i in 1:length(namesData)){
      data[[i]] = list()
      data[[i]]$dimension = namesData[i]
      if (class(originalData[[namesData[i]]]) == "numeric"){
        data[[i]]$type = "quantitative"
        #compute bins here
        histogram = hist(originalData[[namesData[i]]])
        data[[i]]$breaks = histogram$breaks
        prob = histogram$counts/sum(histogram$counts)
        data[[i]]$entropy = -sum(prob * log2(prob), na.rm = T)
      }else{
        data[[i]]$type = "categorical"
        #list labels
        data[[i]]$levels = levels(originalData[[namesData[i]]])
      }
      data[[i]]$values = originalData[[namesData[i]]]
      count = table(originalData[[namesData[i]]])
      prob = count/sum(count)
      data[[i]]$entropy = -sum(prob * log2(prob), na.rm = T)
    }

    myObj = list()
    myObj$data = data
    myObj$hclust = h
    return (myObj)
}


#clustering medical dataset
#data = read.csv("~/Downloads/pvecs/pvecs_small.csv")
#o = clusterObj(data)
#sink('pvecs_small_cluster.json')
#cat(toJSON(o))
#sink()

#clustering iris dataset
o = clusterObj(iris, removeFromCluster = c(5))
sink('iris_cluster.json')
cat(toJSON(o))
sink()
