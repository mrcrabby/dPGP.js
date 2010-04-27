
var haveStarted = false;
var generations = 0;

var runInWorker = true;

var timeStarted = undefined;

var generationFitnesses = [];

if (!runInWorker) {
	function updateStatus() {};
}

function startGPBrain(worker_id)
{
	// testGP();
	// start();
	
	function onMessage (a) {
		// alert("Done!");
		
		if (a.data['msgtype'] == 'debug') {
			console.log(a.data.msg);
			return;
		}		
		
		generations++;
		
		$('#numGenerations').html(generations);

		if (a.data['bestFitness'] != undefined) {
			generationFitnesses.push(a.data['bestFitness'] < 0 ? 0 : a.data['bestFitness']);
			$('#gpChart').show();
			$('#gpChart').attr('src','http://chart.apis.google.com/chart?cht=lc&chs=150&chd=t:' + generationFitnesses.reduce(function(a,b) {return a + "," + b; } ) );
		}
		
		dumpGPData(a.data['programsStr'],a.data['bestFitness']);
	}
	
	$('#startButton').click(function() {
		$('#startButton').hide();
		
		timeStarted = new Date().getTime();
		// var worker = JsWorker.createWorkerFromUrl("gp_worker.js", onMessage);

		if (runInWorker) {
			var worker = new Worker('gp_worker' + worker_id +'.js');

			worker.onmessage = onMessage;
			worker.onerror = function (err) {alert ('Error! ' + err);};
			worker.postMessage(100000);
			// worker.postMessage("start");
		}
		else
		{
			//TODO: GP_worker run in serial
			//I want to do this so that I can profile the code in PushGP.js
			//Unfortunately, I can't access gp_worker directly from this code
			//without spawning a worker.
			
			//Unfortunately, this will have to do for now
			//Although it reimplements much of GP_worker
			
			var cases = [];

		    var rawData = [ 2,4,6,8,10,12,14,16,18,20];

				// this.pushPrograms.push ({code : "( x 1 INTEGER.+ 2 INTEGER.* 2 INTEGER.+)", fitness: 0});

		    for (var caseX = -10; caseX < 10; caseX++) {
		        cases.push([caseX,/*rawData[caseX]*/ /*Math.pow(caseX,2) + 5*caseX*/ (2*(caseX))]);
		    }

            // console.log(cases);

		    pushGP = new PushGP();
		    pushGP.startGP(cases);/*[[0,1],[2,5],[3,100]]);*/        
		    for (var gens = 0; gens<2; gens++) {				
				var str = pushGP.getProgramsHTMLString();

				dumpGPData(str);
				

		        pushGP.doGeneration();            

		    }
			alert('finished');
		}

		
		haveStarted = true;
		
					// stop();
	});
}


function dumpGPData(pushGPStr,bestFitness) {
	$('#programDump').html(pushGPStr);

	if (bestFitness <= 0 && $('#doneMsg').html() == '') {
		$('#doneMsg').html ("Solved problem in " + ((new Date().getTime() -  timeStarted) /1000) + " seconds.");
	}
}