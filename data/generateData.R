require(cluster)
require(RJSONIO)

clusterObj <- function(originalData, distanceFunction = daisy, removeFromCluster = NULL){
    namesData = names(originalData)
    for (i in 1:ncol(originalData)){ #transform integer to categorical
      if ((class(originalData[,i]) == "integer") && (length(unique(originalData[,i])) < 10)){
        originalData[,i] = as.factor(originalData[,i])
      }
    }
  
    if (length(removeFromCluster) > 0){ #remove columns not used for clustering
      toClust = originalData[,-removeFromCluster];
    }else{
      toClust = originalData;
    }
    
    for (j in 1:ncol(toClust)){ #normalize quantitative data
      if (class(toClust[,j]) %in% c("numeric", "integer")){
        minimum = min(toClust[,j])
        maximum = max(toClust[,j])
        toClust[,j] = (toClust[,j] - minimum)/(maximum-minimum)
      }
    }
    
    d = distanceFunction(toClust)
    h = hclust(d)
    
    data = list()
    for (i in 1:length(namesData)){
      data[[i]] = list()
      data[[i]]$dimension = namesData[i]
      if (class(originalData[,i]) %in% c("numeric", "integer")){
        data[[i]]$type = "quantitative"
        #compute bins here
        histogram = hist(originalData[,i])
        data[[i]]$breaks = histogram$breaks
        prob = histogram$counts/sum(histogram$counts)
        data[[i]]$entropy = -sum(prob * log2(prob), na.rm = T)
      }else{
        data[[i]]$type = "categorical"
        #list labels
        data[[i]]$levels = levels(originalData[,i])
      }
      data[[i]]$values = originalData[,i]
      count = table(originalData[,i])
      prob = count/sum(count)
      data[[i]]$entropy = -sum(prob * log2(prob), na.rm = T)
    }

    myObj = list()
    myObj$data = data
    myObj$hclust = h
    return (myObj)
}

 
#clustering medical dataset small
data = read.csv("OriginalMedical/processed_small.csv"); data[,"info__county"] = as.factor(data[,"info__county"])
o = clusterObj(data[,2:ncol(data)])
sink('processed_small_cluster.json')
cat(toJSON(o))
sink()

#clustering medical dataset
data = read.csv("OriginalMedical/processed_large.csv"); data[,"info__county"] = as.factor(data[,"info__county"])
o = clusterObj(data[,2:ncol(data)])
sink('processed_large_cluster.json')
cat(toJSON(o))
sink()


#clustering iris dataset
# o = clusterObj(iris, removeFromCluster = c(5))
# sink('iris_cluster.json')
# cat(toJSON(o))
# sink()
