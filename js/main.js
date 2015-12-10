"use strict";
(function() {

    var filename = 'data/processed_large_cluster.json';

    
    var controller = new Controller();

    d3.json(filename, function(data) {
          dataLoaded(data);
        });


    function dataLoaded (data) {
        controller.dataUpdated(data);
    }


})();
