# server.py: run with  ATMOSPORE_API_KEY=your-key python server.py
import os, time
import requests
from flask import Flask, jsonify, send_file

app = Flask(__name__)
cached, fetched_at = None, 0.0

# Ask Atmospore for fresh tile links at most once an hour.
# Each call counts as one API request; the tiles themselves are free.
def pollen_tiles():
    global cached, fetched_at
    if cached is None or time.time() - fetched_at > 3600:
        res = requests.get(
            "https://pollenapi.com/v1/map-tiles",
            headers={"x-api-key": os.environ["ATMOSPORE_API_KEY"]},
            timeout=10,
        )
        res.raise_for_status()
        cached, fetched_at = res.json(), time.time()
    return cached

@app.get("/pollen-tiles")
def tiles():
    return jsonify(pollen_tiles())

@app.get("/")
def index():
    return send_file("index.html")

if __name__ == "__main__":
    app.run(port=3000)
