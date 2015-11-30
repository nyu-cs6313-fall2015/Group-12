"use strict";

(function() {

    var filename = 'data/iris_cluster.json';
    
    var controller = new Controller();

    d3.json(filename, function(data) {
          dataLoaded(data);
        });


    function dataLoaded (data) {
        controller.dataUpdated(data);
    }


})();
