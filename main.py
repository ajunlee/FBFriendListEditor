#!/usr/bin/python2.5
#coding=utf-8

#import cgi
import os
import cfg
#import webapp2

from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
#from django.conf import settings
#from django.core.handlers import wsgi

#settings._target = None
#os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

class MainPage(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'Templates/default.html')
        template_values = {
                           'cfg':cfg
                           }
        self.response.out.write(template.render(path, template_values))
    def post(self):
        path = os.path.join(os.path.dirname(__file__), 'Templates/default.html')
        template_values = {
                           'cfg':cfg
                           }
        self.response.out.write(template.render(path, template_values))
   
class Error(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'Templates/404.html')        

        errorMsg = self.request.get("msg")
        if (errorMsg == '511'):
            strMsg = 'Record not found'
        else:
            strMsg = 'Page not found'
        
        template_values = {
                           'cfg':cfg,
                           'error_message':strMsg
                           }
        self.response.out.write(template.render(path, template_values))




application = webapp.WSGIApplication(
                                     [('/', MainPage)],
                                     debug=True)

            
def main():
    #application = wsgi.WSGIHandler()
    #util.run_wsgi_app(application)
    run_wsgi_app(application)

if __name__ == "__main__":
    main()