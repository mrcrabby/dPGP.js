importScripts('push.js','pushgp.js','gp_controller.js');


var pushGP;

GPWorker = function () {
	this.gens = 0;
};

GPWorker.prototype.startGPWorker = function(numGens) {
	
    // var numGens = message.data;

    var cases = [];

    var rawData = [ 2,4,6,8,10,12,14,16,18,20];
    
    for (var caseX = -10; caseX < 10; caseX++) {
        cases.push([caseX,/*rawData[caseX]*/ /*Math.pow(caseX,2) + 5*caseX*/ (2*(caseX+1))+2]);
    }
    
    workerDebug(cases);
    
    if (cases.length == 0) {
        alert("Please draw a function first.");
        return;
    }

    pushGP = new PushGP();
    pushGP.startGP(cases);/*[[0,1],[2,5],[3,100]]);*/        
    for (this.gens = 0; this.gens<numGens; this.gens++) {				
		var str = pushGP.getProgramsHTMLString();
			
		postMessage({programsStr : str, bestFitness : pushGP.currentBestFitness});
            

        pushGP.doGeneration();            

    }
};

onmessage = function(message) {
	var worker = new GPWorker();
	
	worker.startGPWorker(message.data);

}

function updateStatus() {
    //do nothing.
}

function alert(str) {
    //no alerts inside of a thread, obviously.
}

function workerDebug(str) {
    postMessage ({'msgtype' : 'debug', 'msg' : str});
}