PushGP = function () {
    this.pushPrograms = [];
    this.testCases = [[0,0]];
    this.fitnessFunc = function(a) { return 0; };
    
    this.params = {
        'crossoverPercentile' : 10,
        'mutationProbability' : 2,
        'population' : 20
    };
    
    this.generations = 0;
};

PushGP.prototype.startGP = function (testCases,fitnessFunc,params) {
    if (params != undefined)
         this.params = params;
    
    if (testCases != null) this.testCases = testCases;
    
    updateStatus("Generating random programs.");
    
    for (var x = 0; x < this.params['population']; x++) {
        this.pushPrograms[x] = {code: randomCode(), fitness: 0};
    }

};

PushGP.prototype.doGeneration = function() {
    if (this.generations > 0)
        this.crossoverAndMutate();
    
    for (var programX in this.pushPrograms) {
        updateStatus("Evaluating fitness of program #" + programX + ".");
        
        var code = this.pushPrograms[programX];
        
        if (code.code == undefined)
            continue; //FIXME: why does this happen?
        
        var fitness = 0;
                
        for (var x = 0; x < this.testCases.length; x++) {
            var sub_code = code.code.replace (/ x /g," " + parseFloat(this.testCases[x][0]) + " ");
            
            // console.log("Program? " + sub_code);

            var result = runPush(sub_code);
            
            // console.log(result);
            
            //highly penalize programs that don't do anything with int stack, or just return this.testCases[0]
            var popOffStack = result.intStack.pop();
            
            fitness += isNaN(popOffStack) || popOffStack == this.testCases[0]  ? 9999  : Math.abs(this.testCases[x][1] - popOffStack) ;
        }
        
        this.pushPrograms[programX]['fitness'] = fitness;
        
        // console.log ("Fitness for program  " + programX + " = " + fitness);
        
        // var fitness = this.fitnessFunc(this.pushPrograms[programX])
    }
    
    updateStatus("Sorting programs by fitness.");
    
    this.pushPrograms.sort(function(programA,programB) {
       return programA['fitness'] - programB['fitness'];
    });
    
    alert("Best program = " + this.pushPrograms[0].code + " fitness = " + this.pushPrograms[0].fitness);
    
    this.generations++;
    
    updateStatus("Do another generation?");
};

PushGP.prototype.crossoverAndMutate = function() {
    updateStatus("Doing crossover.");
    
    var crossoverEndIdx = this.pushPrograms.length/100.0*this.params['crossoverPercentile'];
        
     //First, crossover
     for (var programX = 0; programX < /*crossoverEndIdx*/1; programX++) {
         var programArray = pushParseString(this.pushPrograms[programX]['code']);
         
         var crossoverPartnerIdx = parseInt(Math.random() * this.pushPrograms.length/100.0*this.params['crossoverPercentile']);
         var crossoverPartnerArray = pushParseString(this.pushPrograms[crossoverPartnerIdx]['code']);
         
         var codePoints = countPoints(programArray);
         var partnerCodePoints = countPoints(crossoverPartnerArray);
         
         var randomComponent = getRandomComponent(programArray,codePoints);
         var randomComponent2 = getRandomComponent(crossoverPartnerArray,partnerCodePoints);
         
         insertCodeAtPoint(programArray,randomComponent2,parseInt(Math.random()*codePoints));
         insertCodeAtPoint(crossoverPartnerArray,randomComponent,parseInt(Math.random()*partnerCodePoints));
     
         // if (programArray.toString().indexOf("object") != -1 && this.pushPrograms[programX]['code'].indexOf("object") == -1)
         // {
         //     console.log("this is it!\n" + this.pushPrograms[programX]['code']);
         //                  console.log("this is evidence\n" + programArray.toString());
         //                  
         //                  console.log("parner \n" + this.pushPrograms[crossoverPartnerIdx]['code']);
         //                                            console.log("parner array \n" + crossoverPartnerArray.toString());
         // }else {
         //      
         this.pushPrograms[programX]['code'] = programArray.toString();
         this.pushPrograms[crossoverPartnerIdx]['code'] = crossoverPartnerArray.toString();
 
         // console.log(programArray.toString());
     }
     
     return;
     
     updateStatus("Doing mutation.");
    //And mutate the rest
    for (var programX = crossoverEndIdx + 1; programX < this.pushPrograms.length; programX++) {
        if (parseInt(Math.random() * 100) <= this.params['mutationProbability']) {
            var programArray = pushParseString(this.pushPrograms[programX]);
            var codePoints = countPoints(programArray);
         
            insertCodeAtPoint(programArray,randomCode(1,1),parseInt(Math.random()*codePoints));
            
            this.pushPrograms[programX]['code'] = programArray.toString();
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