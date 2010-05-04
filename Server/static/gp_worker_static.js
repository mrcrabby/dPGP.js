
var pushGP;

var worker = null;

GPWorker = function () {
	this.gens = 0;
};

GPWorker.prototype.startGPWorker = function(msg) {
	
    // var numGens = message.data;

    // var cases = [];
    // 
    // var rawData = [ 2,4,6,8,10,12,14,16,18,20];
    // 
    // for (var caseX = -10; caseX < 10; caseX++) {
    //     cases.push([caseX,/*rawData[caseX]*/ /*Math.pow(caseX,2) + 5*caseX*/ (2*(caseX))]);
    // }
    
    // var cases = [
    //     
    //     {% for case in fitness_cases %}
    //         ["{{ case.initializer }}", {{ case.ans }} ],
    //     
    //     {% end %}
    //     
    //     ];
    //     
    
    // cases =  //fibonacci sequence
    //  [ [0,0], [1,1], [2,1], [3,2], [4,3], [5,5], [6,8], [7,13], [8,21]  ];
    
    workerDebug(cases);
    
    if (cases.length == 0) {
        alert("Please draw a function first.");
        return;
    }

    pushGP = new PushGP(gp_params);  
    pushGP.startGP(cases);/*[[0,1],[2,5],[3,100]]);*/        
    // for (this.gens = 0; this.gens<numGens; this.gens++) {                

			
        doPushGen();
        // postMessage("did one!")         ;

    // }
};

onmessage = function(message) {
    if (worker == undefined) {
        worker = new GPWorker();

        worker.startGPWorker(message.data);
    }
    else if (message.data['msgtype'] == "heartbeat")
    // workerDebug(pushGP);
    {
        doPushGen();
        
    }
    else if (message.data['msgtype'] == "addPrograms"){
        pushGP.addPrograms(message.data['msg']);
    }
        
        
}

function doPushGen(){
    pushGP.doGeneration();
    
    var str = pushGP.getProgramsHTMLString();        
	postMessage({msgtype:"programStr", programsStr : str, bestFitness : pushGP.currentBestFitness});
}

function reportUp(msg) {
    postMessage(msg);
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