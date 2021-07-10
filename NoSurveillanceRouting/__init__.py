import flask
from flask import Flask

app = Flask(__name__)


@app.route("/")
def start_site():
    return flask.render_template("start.html")
