importScripts('push.js','pushgp.js','gp_controller.js');


var pushGP;

onmessage = function(message) {
    
        var numGens = message.data;

        var cases = [];

        var rawData = [ 2,4,6,8,10,12,14,16,18,20];
        
        for (var caseX = -10; caseX < 10; caseX++) {
            cases.push([caseX,/*rawData[caseX]*/ Math.pow(caseX,2) + 5*caseX]);
        }
        
        workerDebug(cases);
        
        if (cases.length == 0) {
            alert("Please draw a function first.");
            return;
        }

        pushGP = new PushGP();
        pushGP.startGP(cases);/*[[0,1],[2,5],[3,100]]);*/        
        for (var gens = 0; gens<numGens; gens++) {
            pushGP.doGeneration();            
            postMessage(pushGP.getProgramsHTMLString());
        }
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