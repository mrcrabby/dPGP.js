import os

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
        self.render("templates/worker.html", worker_id = worker_id)

class WorkerJSHandler(tornado.web.RequestHandler):
    def get(self,worker_id):
        self.render("templates/gp_worker.js", fitness_cases=db.getFitnessCases(worker_id))

settings = {"static_path": os.path.join(os.path.dirname(__file__), "static") }

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/upload/", UploadHandler),
    (r"/new_problem", UploadFormHandler),
    (r"/gp_worker([0-9]+)\.js", WorkerJSHandler),
    (r"/worker([0-9]+)", WorkerHandler)

], **settings)

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(80)
    tornado.ioloop.IOLoop.instance().start()