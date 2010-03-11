//FIXME: push.js seems to have bug on INTEGER.FROMBOOLEAN

var pushScriptFuncs = [/*"FLOAT.+","FLOAT.-","FLOAT./","FLOAT.*","FLOAT.%","FLOAT.>","FLOAT.<","FLOAT.=","FLOAT.COS","FLOAT.DEFINE","FLOAT.DUP","FLOAT.FLUSH" *//*,"FLOAT.FROMBOOLEAN"*//*,"FLOAT.FROMINTEGER","FLOAT.MAX","FLOAT.MIN","FLOAT.POP","FLOAT.RAND","FLOAT.ROT","FLOAT.SHOVE","FLOAT.SIN","FLOAT.STACKDEPTH","FLOAT.SWAP","FLOAT.TAN","FLOAT.YANK","FLOAT.YANKDUP",*/"INTEGER.+","INTEGER.-","INTEGER./","INTEGER.*","INTEGER.%","INTEGER.>","INTEGER.<","INTEGER.=","INTEGER.DEFINE","INTEGER.DUP","INTEGER.FLUSH",/*,"INTEGER.FROMBOOLEAN",*/"INTEGER.FROMFLOAT","INTEGER.MAX","INTEGER.MIN","INTEGER.POP","INTEGER.RAND","INTEGER.ROT","INTEGER.SHOVE","INTEGER.STACKDEPTH","INTEGER.SWAP","INTEGER.YANK","INTEGER.YANKDUP"

/*,"BOOLEAN.=","BOOLEAN.AND","BOOLEAN.DEFINE","BOOLEAN.DUP","BOOLEAN.FLUSH","BOOLEAN.FROMFLOAT","BOOLEAN.FROMINTEGER","BOOLEAN.NOT","BOOLEAN.OR","BOOLEAN.POP","BOOLEAN.RAND","BOOLEAN.ROT","BOOLEAN.SHOVE","BOOLEAN.STACKDEPTH","BOOLEAN.SWAP","BOOLEAN.YANK","BOOLEAN.YANKDUP","CODE.=","CODE.ATOM","CODE.CAR","CODE.CDR","CODE.CONS","CODE.CONTAINS","CODE.DEFINE","CODE.DO","CODE.DO*","CODE.DO*COUNT","CODE.DO*RANGE","CODE.DO*TIMES","CODE.DUP","CODE.FLUSH","CODE.IF","CODE.LENGTH","CODE.LIST","CODE.NOOP","CODE.NTH","CODE.NULL","CODE.SHOVE","CODE.POP","CODE.QUOTE","CODE.ROT","CODE.SHOVE","CODE.STACKDEPTH","CODE.SWAP","CODE.YANK","CODE.YANKDUP","EXEC.=","EXEC.DEFINE","EXEC.DO*COUNT","EXEC.DO*RANGE","EXEC.DO*TIMES","EXEC.DUP","EXEC.FLUSH","EXEC.IF","EXEC.K","EXEC.POP","EXEC.ROT","EXEC.S","EXEC.SHOVE","EXEC.STACKDEPTH","EXEC.SWAP","EXEC.Y","EXEC.YANK","EXEC.YANKDUP"/*,"NAME.=","NAME.DUP","NAME.FLUSH","NAME.POP","NAME.RAND","NAME.ROT","NAME.SHOVE","NAME.STACKDEPTH","NAME.SWAP","NAME.YANK","NAME.YANKDUP"*/];

function testGP() {
    startGP(function(){});
}

function runPush(program_str) {
    var program = pushParseString(program_str);
	var interpreter = new pushInterpreter();

	var info = pushRunProgram( interpreter, pushParseString(program_str) );
	return interpreter;

}

function doFitness(code,fitness_func) {
    var error = 0;

    for (var x = 0; x < 10; x++) {
        var sub_code = code.replace ("x",parseFloat(x));

        var result = runPush(sub_code);
    }
}

// function startGP(fitness_func) {
//     var programs = new Array();
//     
//     for (var x = 0; x < 10; x++) {
//         programs[x] = {code: randomCode(), fitness: 0};
//     }
// 
//     doGeneration(programs,fitness_func);
// }

function doGeneration(programs,fitness_func) {

    //Run programs
    for (var x = 0; x < programs.length; x++)
        programs[x].fitness = doFitness(programs[x].code,fitness_func);
        
    //Sort functions by fitness
    programs.sort(function(programA,programB) {
       return programA['fitness'] - programB['fitness'];
    });

    // console.log("Best program: " + programs[0].['code'] + " \n fitness = " + programs[0]['fitness']);
}

function randomCode(depth,max_depth) {
    var num_pieces = Math.random()*5 + 5;
    var code_string = "( ";
    
    if (max_depth == undefined)
        max_depth = 5;
    
    for (var x = 0; x < num_pieces; x++) {
        switch (parseInt(Math.random()* 7) + 1)
        {
            case 0:
            case 1:
            case 2:
            case 3:
                    code_string += randomPushFunction() + " ";
                    break;
            case 4:
                    if (depth == undefined || depth < max_depth)
                        code_string += randomCode(depth+1) + " ";
                    break;
            case 5:
            case 6:
                code_string += randomConstant() + " ";
                break;
            case 7:
                code_string += "x ";
                break;
        }

    }

    code_string += ")";
    
    if (code_string == undefined) alert('code_string is undefined!');
    
    return code_string;
}

function randomConstant() {
    return parseInt(Math.random()*100.0);
}

function randomPushFunction() {
    var idx = parseInt(Math.random() * pushScriptFuncs.length);
    
    return pushScriptFuncs[idx];
}
