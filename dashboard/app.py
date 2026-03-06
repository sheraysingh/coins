"""APEX Dashboard — Flask web server (port 5050)"""
import os
from functools import wraps
from flask import Flask, render_template, request, Response
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

DASH_USER = os.getenv("DASHBOARD_USER", "admin")
DASH_PASS = os.getenv("DASHBOARD_PASS", "apex")


def check_auth(username, password):
    return username == DASH_USER and password == DASH_PASS


def authenticate():
    return Response(
        "Access denied.", 401,
        {"WWW-Authenticate": 'Basic realm="APEX Dashboard"'}
    )


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated


@app.route("/")
@requires_auth
def index():
    mode = "LIVE" if os.getenv("LIVE_TRADING", "false").lower() == "true" else "PAPER"
    return render_template("index.html", mode=mode)


@app.route("/health")
def health():
    return {"status": "ok", "system": "APEX"}
