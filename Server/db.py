import tornado.database as database

from uuid import uuid4
import json

def getFreshUUID():
    return uuid4().hex

def getConnection():
    return database.Connection("/tmp/mysql.sock", user="root", database="dpgpjs")


def getProblems():
    c=getConnection()
    problems = [problem for problem in c.query("SELECT * FROM problems")]
    for problem in problems:
        program = c.query("SELECT * FROM programs WHERE problem = %s ORDER BY fitness DESC LIMIT 1" % problem.id)
        if(len(program) != 0):
            problem.bestFitness = program[0].fitness
            problem.bestProgram = program[0].program_string
        else:
            problem.bestFitness = "none"
            problem.bestProgram = "none"
    return problems

def getProblem(problem_id):
    c=getConnection()
    problem = c.query("SELECT * FROM problems WHERE id = %s" % problem_id)[0]
    program = c.query("SELECT * FROM programs WHERE problem = %s ORDER BY fitness DESC LIMIT 1" % problem.id)
    if(len(program) < 0):
        problem.bestFitness = program.fitness
        problem.bestProgram = program[0].program_string
    else:    
            problem.bestFitness = "none"
            problem.bestProgram = "none"
    return problem

def updateProblem(problem_id,name,comments,start_population,max_population,tournament_size,crossover_probability,mutation_probability,clone_probability):
    c=getConnection()
    
    return c.execute("UPDATE problems SET name = \"%s\", comments = \"%s\", start_population = \"%s\", max_population = \"%s\", tournament_size = \"%s\", crossover_probability = \"%s\", mutation_probability = \"%s\", clone_probability = \"%s\" WHERE id = %s LIMIT 1" % (name, comments, start_population,max_population,tournament_size,crossover_probability,mutation_probability, clone_probability, problem_id))
    
def getProgramsForProblem(problem_id,num_programs):
    c=getConnection()
    
    sql = "SELECT * FROM programs WHERE problem = %s ORDER BY fitness,RAND() DESC LIMIT 0,%s" % (problem_id,num_programs)
    
    results = c.query(sql)

    return [result['program_string'] for result in results]

def getFitnessCases(problem_id):
    c=getConnection()
    
    return [case for case in c.query("SELECT * FROM fitness_cases WHERE problem_id = %s" % problem_id) ]
    
def storeWorkerResults(problem_id,program,program_fitness,client_id):
    c=getConnection()
    
    print problem_id 
    print program
    print program_fitness
    print client_id
    
    sql = "INSERT INTO programs (`problem`,`program_string`,`fitness`,`client_id`) VALUES (%s,\'%s\',%s,\'%s\')" % (problem_id,program.replace('%','%%'),program_fitness,client_id)

    c.execute(sql)

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