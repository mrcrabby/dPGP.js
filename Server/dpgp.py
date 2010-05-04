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
    def get(self):
        self.render("templates/error.html")
    
    def post(self):
        if db.importProblemJSON(self.get_argument('config_json')) == False:
            self.write ('Invalid JSON.')
        else:
            self.redirect("/")
            
class WorkerHandler(tornado.web.RequestHandler):
    def get(self,worker_id):
        self.render("templates/worker.html", worker_id = worker_id, client_id = db.getFreshUUID())

class WorkerJSHandler(tornado.web.RequestHandler):
    def get(self,problem_id):
        self.render("templates/gp_worker.js", fitness_cases=db.getFitnessCases(problem_id))
        
class ResultsUploadHandler(tornado.web.RequestHandler):
    def post(self):
        uploadedData = json.loads(self.request.body)
        # print uploadedData
        db.storeWorkerResults(uploadedData['problem_id'],uploadedData['program']['code'],uploadedData['program']['fitness'],uploadedData['client_id'])
        
class RequestProgramsHandler(tornado.web.RequestHandler):
    def get(self,problem_id,num_programs):
        self.write(str(db.getProgramsForProblem(problem_id,num_programs)))
        # self.write('hi?')   

settings = {"static_path": os.path.join(os.path.dirname(__file__), "static") }

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/upload/", UploadHandler),
    (r"/new_problem", UploadFormHandler),
    (r"/gp_worker([0-9]+)\.js", WorkerJSHandler),
    (r"/worker([0-9]+)", WorkerHandler),
    (r"/uploadresults", ResultsUploadHandler),
    (r"/requestprograms([0-9]+)\&num_programs\=([0-9]+)", RequestProgramsHandler)

], **settings)

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(80)
    tornado.ioloop.IOLoop.instance().start()