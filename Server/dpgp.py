import os
import json

import tornado.httpserver
import tornado.ioloop
import tornado.web

import db

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("templates/main.html", problems=db.getProblems())

class UploadHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("templates/upload.html")

class UploadFormHandler(tornado.web.RequestHandler):
    # TODO: after git merge, switch upload to admin
    def get(self):
        self.render("templates/error.html")
    
    def post(self):
        if db.importProblemJSON(self.get_argument('config_json')) == False:
            self.write ('Invalid JSON.')
        else:
            self.redirect("/")
            
class WorkerHandler(tornado.web.RequestHandler):
    def get(self,worker_id):
        self.render("templates/worker.html", worker_id = worker_id)

class WorkerJSHandler(tornado.web.RequestHandler):
    def get(self,worker_id):
        self.render("templates/gp_worker.js", fitness_cases=db.getFitnessCases(worker_id))

class ResultsUploadHandler(tornado.web.RequestHandler):
    def post(self):
        # uploadedData = json.loads(self.ge)
        print self.request.arguments

class AdminHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("templates/admin/index.html",problems=db.getProblems())

class AdminEditHandler(tornado.web.RequestHandler):
    def get(self,problem_id):
        self.render("templates/admin/edit.html",problem=db.getProblem(problem_id))
    def post(self,problem_id):
        name = self.get_argument('name')
        comments = self.get_argument('comments')
        start_population = self.get_argument('start_population')
        max_population = self.get_argument('max_population')
        tournament_size = self.get_argument('tournament_size')
        crossover_probability = self.get_argument('crossover_probability')
        mutation_probability = self.get_argument('mutation_probability')
        clone_probability = self.get_argument('clone_probability')
        db.updateProblem(problem_id,name,comments,start_population,max_population,tournament_size,crossover_probability,mutation_probability,clone_probability)
        self.render("templates/admin/edit.html", problem=db.getProblem(problem_id))


settings = {"static_path": os.path.join(os.path.dirname(__file__), "static") }

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/upload/", UploadHandler),
    (r"/new_problem", UploadFormHandler),
    (r"/gp_worker([0-9]+)\.js", WorkerJSHandler),
    (r"/worker([0-9]+)", WorkerHandler),
    (r"/uploadresults", ResultsUploadHandler),
    (r"/admin", AdminHandler),
    (r"/admin/edit([0-9]+)", AdminEditHandler)

], **settings)

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(80)
    tornado.ioloop.IOLoop.instance().start()