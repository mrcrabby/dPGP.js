/* TODO: make sure that this.pushPrograms is really being spliced after each generation.
*/


PushGP = function () {
    this.pushPrograms = [];
    
    this.newPushPrograms = [];
    this.testCases = [[0,0]];
    this.fitnessFunc = function(a) { return 0; };

	this.currentBestFitness = undefined;
    
    this.params = {
        'crossoverPercentile' : 20,
        'mutationProbability' : 25,
        'startPopulation' : 20,
        'tournamentSize' : 10,
        'maxPopulation' : 25
    };
    
	this.favorSmaller = true;
	
    this.generations = 0;
};

PushGP.prototype.startGP = function (testCases,fitnessFunc,params) {
    if (params != undefined)
         this.params = params;
    
    if (testCases != null) this.testCases = testCases;
    
    updateStatus("Generating random programs.");
    
    for (var x = 0; x < this.params['startPopulation']; x++) {
		var randomProgram = randomCode();
        this.pushPrograms[x] = {code: randomProgram, fitness: 0, programArray : pushParseString(randomProgram)};
    }
    
    // for (var caseX = 0; caseX < this.testCases.length; caseX++)
    //     workerDebug( this.testCases[caseX][0] + " " + this.testCases[caseX][1]);
        // workerDebug (caseX + " " + (2*(caseX+1)));

    // if (this.generations == 0)
        // this.pushPrograms[0].code = "( 1337 x 1 INTEGER.+ 2 INTEGER.* )";

};

PushGP.prototype.doGeneration = function() {    
    
    this.pushPrograms = this.pushPrograms.concat(this.newPushPrograms);
    this.newPushPrograms = [];
    
    for (var programX in this.pushPrograms) {
        updateStatus("Evaluating fitness of program #" + programX + ".");
        
        var code = this.pushPrograms[programX];
                
        if (code.code == undefined)
            continue; //FIXME: why does this happen?
            
        if (typeof (code.code) == "number") {
            this.pushPrograms[programX]['fitness'] = 999999; //Strongly penalize "programs" that are just a number
            continue;
        }
        
        var fitness = 0;
                
        for (var x = 0; x < this.testCases.length; x++) {
            
            // var sub_code = code.code.replace (/x/g, /*" " + */parseFloat(this.testCases[x][0])/* + " "*/);

			//Uses name stack
			var sub_code = " ( (" + this.testCases[x][0] + " x INTEGER.DEFINE) " + code.code + " ) "; 

            var result = runPush(sub_code);
            
            //highly penalize programs that don't do anything with int stack, or just return this.testCases[0]
            var popOffStack = result.intStack.pop();
            
            fitness += isNaN(popOffStack) /*|| popOffStack == this.testCases[x][0]*/  ? 9999  : Math.abs(this.testCases[x][1] - popOffStack) ;
        }
        
        if (this.favorSmaller && fitness == 0) fitness = -1 * (1000 - countPoints(pushParseString(code.code)));
        
        this.pushPrograms[programX]['fitness'] = fitness;
        
        // console.log ("Fitness for program  " + programX + " = " + fitness);
        
        // var fitness = this.fitnessFunc(this.pushPrograms[programX])
    }
    
    updateStatus("Sorting programs by fitness.");
    
    this.pushPrograms.sort(function(programA,programB) {
       return programA['fitness'] - programB['fitness'];
    });

	this.currentBestFitness = this.pushPrograms[0]['fitness'];
	// workerDebug(this.pushPrograms[0]['fitness']);
    
    // alert("Best program = " + this.pushPrograms[0].code + " fitness = " + this.pushPrograms[0].fitness + " out of " + this.pushPrograms.length);
    
    this.generations++;
    
    // if (this.generations > 0)
        this.crossoverAndMutate();
        
    if (this.pushPrograms.length > this.params.maxPopulation) {
        //Cull the most unfit            
        this.pushPrograms.splice(this.params.maxPopulation, this.pushPrograms.length - this.params.maxPopulation);
    }

	//Pregenerate programArray for the most fit
	//This is experimental - I think this will be faster
	
	// for (var programX in this.pushPrograms) {
	// 	if (this.pushPrograms[programX]['programArray'] == undefined)
	// 		this.pushPrograms[programX]['programArray'] = pushParseString(this.pushPrograms[programX]['code']);
	// }
	
	// This also might not work, if crossover or mutation functions modify what's passed in!
		
    
    updateStatus("Do another generation?");
};

PushGP.prototype.tournamentSelect = function() {
    var tSize = Math.min(this.params.tournamentSize,this.pushPrograms.length);
    var best = null;
    for(var i = 0;i < tSize; i++){
        var rand = parseInt(Math.random() * this.pushPrograms.length);
        if (best == null || this.pushPrograms[rand].fitness < best.fitness)
            best = this.pushPrograms[rand];
    }
    return best;
};

//Pass in a program *array*
PushGP.prototype.doCrossover = function(program1Array) {
    var crossoverPartner = this.tournamentSelect(); //parseInt(Math.random() * this.pushPrograms.length/100.0*this.params['crossoverPercentile']);
    var crossoverPartnerArray = pushParseString(crossoverPartner['code']);
    
    // var copyOfOld = pushParseString(crossoverPartner['code']);

    var codePoints = countPoints(program1Array);// program1);
    
    var randomComponent = getRandomComponent(program1Array,codePoints);    

    return insertCodeAtPoint(crossoverPartnerArray, randomComponent,parseInt(Math.random() * countPoints(crossoverPartnerArray)));
};

PushGP.prototype.crossoverAndMutate = function() {
	
	for (var programX = 0; programX < this.pushPrograms.length; programX++) {
		//Offspring is a mutant
		if ( parseInt(Math.random() * 100) < this.params['mutationProbability']) {
			var programArray = pushParseString(this.pushPrograms[programX]['code']);
			// var programArray = this.pushPrograms[programX]['programArray'] == undefined ? pushParseString(this.pushPrograms[programX]['code']) : this.pushPrograms[programX]['programArray'];

            var codePoints = countPoints(programArray);

            insertCodeAtPoint(programArray,randomCode(1,1),parseInt(Math.random()*codePoints));
            
            this.newPushPrograms.push({'code' : programArray.toString(), 'fitness' : 0});
		}
		else //Or result of crossover
		{
			var programArray = pushParseString(this.pushPrograms[programX]['code']);
			// var programArray = this.pushPrograms[programX]['programArray'] == undefined ? pushParseString(this.pushPrograms[programX]['code']) : this.pushPrograms[programX]['programArray'];

			var newProgramArray = this.doCrossover(programArray);

			this.newPushPrograms.push({'code' : newProgramArray.toString(), 'fitness' : 0});
		}
	}
}

PushGP.prototype.crossoverAndMutate2 = function() {
    updateStatus("Doing crossover.");
        
    var crossoverEndIdx = parseInt(this.pushPrograms.length*this.params['crossoverPercentile']/100.0);
        
     // //First, crossover
     for (var programX = 0; programX < crossoverEndIdx; programX++) {
         var programArray = this.pushPrograms[programX]['programArray'] == undefined ? pushParseString(this.pushPrograms[programX]['code']) : this.pushPrograms[programX]['programArray'];
            // var programArray = pushParseString(this.pushPrograms[programX]['code']);
     
         var newProgramArray = this.doCrossover(programArray);
     
         this.newPushPrograms.push({'code' : newProgramArray.toString(), 'fitness' : 0});
 
         // console.log(programArray.toString());
     }
        
     updateStatus("Doing mutation.");

    //And mutate the rest     
     var currentLength = this.pushPrograms.length;
    for (var programX = crossoverEndIdx; programX < currentLength; programX++) {
        if (parseInt(Math.random() * 100) <= this.params['mutationProbability']) {
            var programArray = pushParseString(this.pushPrograms[programX]['code']);
			// var programArray = this.pushPrograms[programX]['programArray'] == undefined ? pushParseString(this.pushPrograms[programX]['code']) : this.pushPrograms[programX]['programArray'];

            var codePoints = countPoints(programArray);
         
            // workerDebug("!" + programArray.toString());
            
            // workerDebug("Before : " + programArray.toString());
            insertCodeAtPoint(programArray,randomCode(1,1),parseInt(Math.random()*codePoints));

            // workerDebug("mutated to " + programArray.toString());
            
            this.newPushPrograms.push({'code' : programArray.toString(), 'fitness' : 0});
            // alert(programArray.toString());

        }
    }
}

PushGP.prototype.getProgramsHTMLString = function() {
  var str = "";
    
  for (var x in this.pushPrograms)  {
      str += "<br><br>" + this.pushPrograms[x]['code'] + "<br> fitness = " + this.pushPrograms[x]['fitness'];
  }
  
  return str;
};

//Util functions

function getRandomComponent(programArray,points) {
    return codeAtPoint(programArray,parseInt(Math.random()*points));
}

function countPoints(programArray) {
    
    if (programArray instanceof Array) {        
        return 1 + programArray.map(function (p) {
                return countPoints(p);
            }).reduce (function (a,b){
                return a+b;
            });
    }
    else
        return 1;
}

function codeAtPoint(programArray,index) {
    var i2 = index % countPoints(programArray);
    
    if (i2 == 0) {
        return programArray;
    } else {
        return codeAtPointR(programArray,i2-1);
    }
}

function codeAtPointR(programArray,index) {
    
    if (index == 0 ) return aOrFirstElement(programArray);

    var points = countPoints(aOrFirstElement(programArray));
    
    if (index >= points) {    
        return codeAtPointR(programArray.slice(1),index-points);
    } else
        return codeAtPointR(programArray[0],index-1);
}

 // function insertCodeAtPoint(programArray,replacementProgram,index) {
 //    var i2 = index % countPoints(programArray);
 //    
 //    if (i2 == 0) {
 //        return replacementProgram;
 //    } else {
 //        return insertCodeAtPoint(programArray,replacementProgram,i2-1,[]);
 //    }
// }
// insertCodeAtPoint([1,2,[3,4],5],42,3)


 function insertCodeAtPoint(programArray,replacementProgram,index) {
  
  // console.log("insert called with program " + programArray + " and index " + index);
  
  if (index == 0)
    return replacementProgram;

  index--;
  
  var idx = 0;
  
  for (var x = 0; x < programArray.length; x++)   {
      // console.log ("idx = " + idx + " index = " + index);
      if (idx == index) {
          programArray[x] = replacementProgram;
          return programArray;
      }
      
      if (programArray[x] instanceof Array) {
          var points = countPoints(programArray[x]);
          
          if (index >= idx+points) {
              // console.log ("idx+points = " + parseInt(idx+points));
              idx+=points-1;
          }
          else {
              // console.log ("index-idx = " + parseInt(index-idx));
              programArray[x] = /*index-idx < 0 ? replacementProgram :*/ insertCodeAtPoint(programArray[x],replacementProgram,index-idx);
              return programArray;
          }

      }
      
      idx++;
  }
  
  return programArray;
  
 }
    //  console.log("index = " + index + " newP = " + newProgram);
    // 
    // if (index == 0 ) return newProgram.push(replacementProgram);/*aOrFirstElement(programArray);*/
    // 
    // var points = countPoints(aOrFirstElement(programArray));
    // 
    // if (index >= points) {    
    //     console.log("1 newProgram = " + newProgram);
    //     
    //     newProgram.push(programArray[0]);
    //     return insertCodeAtPoint(programArray.slice(1),replacementProgram,index-points,newProgram);
    // } else {
    //             console.log("2");
    //     return insertCodeAtPoint(programArray[0],replacementProgram,index-1,newProgram).push(programArray.slice(1));
    // }


// function insertCodeAtPoint(programArray,replacementProgram,index) {
//     var idx = index;
// 
//     for (var x = 0; x < programArray.length; x++) {
//         var points = countPoints(programArray[x]);
//         
//         if (idx == 0)
//             return;
//         
//         
//         if (idx-x < points) {
//             insertCodeAtPoint ()
//         }
//         
//         idx -= points;
//     }    
// }

// 
// function codeAtPoint2(programArray,index) {    
//     var idx = index;
//     
//     for (var x = 0; x < programArray.length; x++) {
//         if (idx == 0) return programArray;
// 
//             console.log ("x = " + x + " programArray[x] = " + programArray[x] );        
//         if (programArray[x] instanceof Array) {
// 
//              
//             var points = countPoints(programArray[x]);
//             if (idx >= points) {
//                 idx -= points;
//             }
//             else {
//                 return codeAtPoint2(programArray[x],index-1);
//             }
//         }
//         
//         idx--;
//     }
// }

// function replaceCodeAtPoint(programArray,)

function aOrFirstElement(a) {
    if (a instanceof Array)
        return a[0];
    else
        return a;
}