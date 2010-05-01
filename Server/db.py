import tornado.database as database

import json

def getConnection():
    return database.Connection("/tmp/mysql.sock", user="root", database="dpgpjs")

def getProblems():
    c=getConnection()
    
    return [problem for problem in c.query("SELECT * FROM problems")]
        
def getFitnessCases(problem_id):
    c=getConnection()
    
    return [case for case in c.query("SELECT * FROM fitness_cases WHERE problem_id = %s" % problem_id) ]
    
def storeWorkerResults(problem_id,program,program_fitness):
    pass

def importProblemJSON(json_txt):
    try:
        json_obj = json.loads(json_txt)
    except ValueError:
        return False
    
    c=getConnection()
    
    fitness_cases = json_obj['fitness_cases']
    
    del json_obj['fitness_cases']
    
    rowid = c.execute ("INSERT INTO problems (%s) VALUES (%s)" % (",".join(["`%s`" % x for x in json_obj.keys()]),  ",".join([ ["'%s'" % x,str(x)][type(x) != str and type(x) != unicode]  for x in json_obj.values()]) ) )
    
    for case in fitness_cases[0]:
        initializer = "( %s x INTEGER.DEFINE )" % case['x1'] #for now, assume int stack and only 1 x value.
        c.execute("INSERT INTO fitness_cases (`problem_id`,`initializer`, `ans`) VALUES (%s, \'%s\', \'%s\')" % (rowid, initializer, case['ans']))
    
    """" { "name": "Symbolic Regression Test", "comments" : "y=2x", "evaluated_stack" : "int", "start_population" : 20, "max_population" : 75, "tournament_size" : 5, "crossover_probability" : 10, "mutation_probability" : 80, "clone_probability" : 10, "fitness_cases" : [ [ { "x1" : 2, "ans" : 4 }, { "x1" : 3, "ans" : 6 }, { "x1" : 4, "ans" : 8 }, { "x1" : -1, "ans" : -2 }, { "x1" : -2, "ans" : -4 }, { "x1" : -3, "ans" : -6 } ] ] }"""