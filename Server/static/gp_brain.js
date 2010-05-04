
var haveStarted = false;
var generations = 0;

var runInWorker = true;

var timeStarted = undefined;

var generationFitnesses = [];

var worker = undefined;

if (!runInWorker) {
	function updateStatus() {};
}

function startGPBrain(problem_id,client_id)
{
	// testGP();
	// start();
	
	function onMessage (a) {
		// alert("Done!");
		
		if (a.data['msgtype'] == 'debug') {
			console.log(a.data.msg);
			return;
		}
		else if (a.data['msgtype'] == 'uploadProgram'){
		    a.data['msg']['problem_id']=problem_id;
		    a.data['msg']['client_id']=client_id;
		    $.ajax({'url':'uploadresults', 'type':'POST', 'data':JSON.stringify(a.data['msg'])});
		    console.log(JSON.stringify(a.data['msg']));
		    console.log("about to upload program!");
		    console.log(a.data['msg']);
		    return;
		}
		else if (a.data['msgtype'] == 'programStr') {
		
    		generations++;
		
    		$('#numGenerations').html(generations);

    		if (a.data['bestFitness'] != undefined) {
    			generationFitnesses.push(a.data['bestFitness'] < 0 ? 0 : a.data['bestFitness']);
    			$('#gpChart').show();
    			$('#gpChart').attr('src','http://chart.apis.google.com/chart?cht=lc&chs=150&chd=t:' + generationFitnesses.reduce(function(a,b) {return a + "," + b; } ) );
    		}
		
    		dumpGPData(a.data['programsStr'],a.data['bestFitness']);
    		
    		worker.postMessage({'msgtype' : "heartbeat"});
		}
		else if(a.data['msgtype'] == 'downloadPrograms') {
		    $.ajax({url:'requestprograms'+problem_id+'&num_programs='+a.data['msg']['numPrograms'],
		            type:'GET',
		            dataType:'json',
		            success:function(json){
		                console.log("from server:"+json);
                        // console.log(JSON.parse(text));
                		worker.postMessage({'msgtype' : "addPrograms", "msg":json});
		            }});
		}
	}
	
	$('#startButton').click(function() {
		$('#startButton').hide();
		
		timeStarted = new Date().getTime();
		// var worker = JsWorker.createWorkerFromUrl("gp_worker.js", onMessage);

		if (runInWorker) {
			worker = new Worker('gp_worker' + problem_id +'.js');

			worker.onmessage = onMessage;
			worker.onerror = function (err) {alert ('Error! ' + err);};
			worker.postMessage("start");
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