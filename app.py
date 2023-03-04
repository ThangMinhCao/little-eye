import os
from flask import Flask
app = Flask(__name__)

@app.route("/", methods=["GET"])
def main():
    return "Main page"

@app.route('/test', methods=['GET'])
def hello():
    return 'Test page'

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
