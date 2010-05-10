import os
import json

import tornado.httpserver
import tornado.ioloop
import tornado.web

from random import random

import db

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("templates/main.html", problems=db.getProblems())
            
class HeartbeatHandler(tornado.web.RequestHandler):
    def get(self,client_id):
        print "receieved heartbeat from client %s" % client_id
        db.setLastSeenToNow(client_id)

class WorkerHandler(tornado.web.RequestHandler):
    def get(self,problem_id):
        self.render("templates/worker.html", client_id = db.createClientForProblem(problem_id))

class WorkerJSHandler(tornado.web.RequestHandler):
    def get(self,client_id):
        problem_id=db.getClientInfo(client_id)['problem_id']
        self.render("templates/gp_worker.js", fitness_cases=db.getFitnessCases(problem_id), gp_params=db.getGPParams(problem_id))

class ResultsUploadHandler(tornado.web.RequestHandler):
    def post(self):
        uploadedData = json.loads(self.request.body)
        # print uploadedData
        db.storeWorkerResults(uploadedData['client_id'],uploadedData['program']['code'],uploadedData['program']['fitness'])
        
class RequestProgramsHandler(tornado.web.RequestHandler):
    def get(self,client_id,num_programs):
        client_info = db.getClientInfo(client_id)

        problem_info = db.getProblem(client_info['problem_id'])

        if random() < problem_info['local_fetch_probability']/100.0:
            program_string = str(db.getProgramArray(db.getNeighborsForClient(client_id,num_programs)))
        else:
            strangers = db.getStrangersForClient(client_id,num_programs)
            programs = strangers + db.getNeighborsForClient(client_id,int(num_programs) - len(strangers))
            program_string = str(db.getProgramArray(programs))
        self.write(program_string)
        print "gave programs to client"
class AdminHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("templates/admin/index.html",problems=db.getProblems())
class AdminUploadHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("templates/admin/upload.html")    
    def post(self):
        if db.importProblemJSON(self.get_argument('config_json')) == False:
            self.write ('Invalid JSON.')
        else:
            self.redirect("/")
class AdminEditHandler(tornado.web.RequestHandler):
    def get(self,problem_id):
        self.render("templates/admin/edit.html",problem=db.getProblem(problem_id))
    def post(self,problem_id):
        name = self.get_argument('name')
        comments = self.get_argument('comments')
        allowed_commands = self.get_argument('allowed_commands')
        start_population = self.get_argument('start_population')
        max_population = self.get_argument('max_population')
        tournament_size = self.get_argument('tournament_size')
        crossover_probability = self.get_argument('crossover_probability')
        mutation_probability = self.get_argument('mutation_probability')
        clone_probability = self.get_argument('clone_probability')
        num_programs_to_download = self.get_argument('num_programs_to_download')
        stagnant_generations = self.get_argument('stagnant_generations')
        db.updateProblem(problem_id,name,comments,allowed_commands,start_population,max_population,tournament_size,crossover_probability,mutation_probability,clone_probability,stagnant_generations,num_programs_to_download)
        self.render("templates/admin/edit.html", problem=db.getProblem(problem_id))


settings = {"static_path": os.path.join(os.path.dirname(__file__), "static") }

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/gp_worker([A-Za-z0-9]+)\.js", WorkerJSHandler),
    (r'/heartbeat([A-Za-z0-9]+)',HeartbeatHandler),
    (r"/worker([0-9]+)", WorkerHandler),
    (r"/uploadresults", ResultsUploadHandler),
    (r"/requestprograms([A-Za-z0-9]+)\&num_programs\=([0-9]+)", RequestProgramsHandler),
    (r"/admin", AdminHandler),
    (r"/admin/upload/", AdminUploadHandler),
    (r"/admin/edit([0-9]+)", AdminEditHandler)

], **settings)

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(80)
    tornado.ioloop.IOLoop.instance().start()