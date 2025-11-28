from flask import Flask
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.exceptions import NotFound

# Import the two existing Flask apps
# Note: These imports assume the files are in the same directory
from interview_agent import app as interview_app
from resume_ranker import app as ranker_app

# Create a main Flask app (can be used for health checks or root routing)
app = Flask(__name__)

@app.route('/')
def index():
    return "Agentic AI Recruitment Manager Backend is Running!"

@app.route('/health')
def health():
    return {"status": "ok", "service": "unified-backend"}

# Merge the apps using DispatcherMiddleware
# We mount resume_ranker at root because it handles /generate-jd and /rank directly
# We mount interview_agent at /api/interview (but it already has that prefix in its routes?)
# Wait, if interview_agent has routes like @app.route('/api/interview/start'),
# and we mount it at '/', it will work fine.
# If we mount it at '/interview', the route becomes '/interview/api/interview/start'.

# Since both apps have distinct routes (except maybe /health), we can try to mount them both at root?
# DispatcherMiddleware doesn't support multiple apps at root.
# It takes (app, mounts). 'app' is the default.

# Strategy:
# Use resume_ranker as the default app (handling /generate-jd, /rank).
# Mount interview_agent at /api/interview? 
# BUT interview_agent routes are ALREADY /api/interview/...
# So if we mount at /api/interview, the URL must be /api/interview/api/interview/... (WRONG).

# Better Strategy:
# Since we can't easily strip prefixes without changing code, 
# and we can't have two default apps...
# We will use a custom WSGI middleware to dispatch based on path prefix.

class MergedApp:
    def __init__(self, app1, app2):
        self.app1 = app1 # interview_agent (routes start with /api/interview)
        self.app2 = app2 # resume_ranker (routes are /rank, /generate-jd)

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        
        # Dispatch logic
        if path.startswith('/api/interview'):
            return self.app1(environ, start_response)
        else:
            # Default to resume_ranker for everything else (including /rank, /generate-jd)
            return self.app2(environ, start_response)

# Create the merged application
# Note: We use the WSGI interface of the Flask apps
application = MergedApp(interview_app.wsgi_app, ranker_app.wsgi_app)

# For Gunicorn, we usually expose 'app' or 'application'
# But Flask's 'run' method expects a Flask object, not a WSGI callable directly for dev.
# However, Gunicorn can run WSGI callables.

if __name__ == "__main__":
    from werkzeug.serving import run_simple
    print("Starting Unified Backend on port 8000...")
    run_simple('0.0.0.0', 8000, application, use_reloader=True)
