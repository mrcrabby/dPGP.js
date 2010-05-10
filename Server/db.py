import tornado.database as database
from time import time

from uuid import uuid4
import json

def getConnection():
    return database.Connection("/tmp/mysql.sock", user="root", database="dpgpjs")

def createClientForProblem(problem_id):
    c=getConnection()
    num_islands = c.query("SELECT num_islands FROM problems WHERE id = %s LIMIT 1" % problem_id)[0]['num_islands']
    island_counts = c.query("SELECT island, COUNT(island) as num_on_island FROM clients WHERE problem_id = %s and last_seen > %s GROUP BY island" % (problem_id,int(time())-60)) # checks that the client has checked in within a minute
    island_list = [[i,0] for i in range(num_islands)]
    
    for count in island_counts:
        island_list[count['island']][1] += count['num_on_island']
        
    island_list.sort(cmp=lambda x,y: cmp(x[1],y[1]))
    
    target_island = island_list[0][0]
    
    new_uuid = uuid4().hex
    insert_sql = "INSERT INTO clients (id,last_seen,island,problem_id) VALUES ('%s', %s, %s, %s)" % (new_uuid, int(time()), target_island, problem_id)
    
    c.execute(insert_sql)
    
    print island_list
    return new_uuid

def getProblems():
    c=getConnection()
    problems = [problem for problem in c.query("SELECT * FROM problems")]
    for problem in problems:
        program = c.query("SELECT * FROM programs WHERE problem = %s ORDER BY fitness LIMIT 1" % problem.id)
        if(len(program) != 0):
            problem.bestFitness = program[0].fitness
            problem.bestProgram = program[0].program_string
        else:
            problem.bestFitness = "none"
            problem.bestProgram = "none"
    return problems

def getGPParams(problem_id):
    c=getConnection()
    problem = c.query("SELECT * FROM problems WHERE id = %s" % problem_id)[0]
    
    return problem

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

def getClientInfo(client_id):
    c=getConnection()
    sql = "SELECT problem_id, island FROM clients WHERE id = '%s' LIMIT 1" % (client_id)
    fetch = c.query(sql)[0]
    return fetch
def updateProblem(problem_id,name,comments,allowed,start_population,max_population,tournament_size,crossover_probability,mutation_probability,clone_probability):
    c=getConnection()
    
    return c.execute("UPDATE problems SET name = \"%s\", comments = \"%s\", allowed = \"%s\" start_population = \"%s\", max_population = \"%s\", tournament_size = \"%s\", crossover_probability = \"%s\", mutation_probability = \"%s\", clone_probability = \"%s\" WHERE id = %s LIMIT 1" % (name, comments, allowed, start_population,max_population,tournament_size,crossover_probability,mutation_probability, clone_probability, problem_id))
    
def getNeighborsForClient(client_id,num_programs):
    if num_programs == 0: return []
    
    c=getConnection()
    
    fetch = getClientInfo(client_id)
    
    results = c.query("SELECT * FROM programs WHERE problem = %s AND island = %s ORDER BY fitness,RAND() DESC LIMIT 0,%s" % (fetch['problem_id'],fetch['island'],num_programs))

    return results

def getStrangersForClient(client_id,num_programs):
    if num_programs == 0: return []

    c=getConnection()
    
    fetch = getClientInfo(client_id)
    
    results = c.query("SELECT * FROM programs WHERE problem = %s AND island <> %s ORDER BY fitness,RAND() DESC LIMIT 0,%s" % (fetch['problem_id'],fetch['island'],num_programs))
    
    if len(results) == 0:
        return []
    
    return results
    
def getProgramArray(dbArray):
    return '[' + ",".join (["\"%s\"" % result['program_string'] for result in dbArray]) + ']'

def getFitnessCases(problem_id):
    c=getConnection()
    
    return [case for case in c.query("SELECT * FROM fitness_cases WHERE problem_id = %s" % problem_id) ]
    
def storeWorkerResults(client_id,program,program_fitness):
    c=getConnection()
    fetch=getClientInfo(client_id)
    
    sql = "INSERT INTO programs (`problem`,`program_string`,`fitness`,`island`,`client_id`) VALUES (%s,\'%s\',%s,%s,\'%s\')" % (fetch['problem_id'],program.replace('%','%%'),program_fitness,fetch['island'],client_id)

    c.execute(sql)
    
def setLastSeenToNow(client_id):
    c=getConnection()
    sql = "UPDATE clients SET last_seen = %s WHERE id = '%s'" % (time(),client_id)
    
    c.execute(sql)

def importProblemJSON(json_txt):
    try:
        json_obj = json.loads(json_txt)
    except ValueError:
        return False
    
    c=getConnection()
    
    fitness_cases = json_obj['fitness_cases']
    
    json_obj['allowed'] =  '[' + ",".join (['"%s"' % str(string) for string in json_obj['allowed']]) + ']'
    
    del json_obj['fitness_cases']
    
    sql = "INSERT INTO problems (%s) VALUES (%s)" % (",".join(["`%s`" % x for x in json_obj.keys()]),  ",".join([ ["'%s'" % x,str(x)][type(x) != str and type(x) != unicode]  for x in json_obj.values()]) )
    
    sql = sql.replace('%','%%')
    
    print "sql = %s" % sql
    
    rowid = c.execute (sql)
    
    for case in fitness_cases[0]:
        initializer = "( %s x INTEGER.DEFINE )" % case['x1'] #for now, assume int stack and only 1 x value.
        c.execute("INSERT INTO fitness_cases (`problem_id`,`initializer`, `ans`) VALUES (%s, \'%s\', \'%s\')" % (rowid, initializer, case['ans']))