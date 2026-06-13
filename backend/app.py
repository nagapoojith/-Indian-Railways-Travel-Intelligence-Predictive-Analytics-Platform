from flask import Flask, request, jsonify
from flask_cors import CORS

from weather import get_weather
from live_status import get_live_status
from crowd_prediction import predict_crowd
from recommendation import search_trains
from analytics import get_dashboard_stats
from train_search import search_train
from crowd_prediction import predict_crowd
from train_route import get_train_route

app = Flask(__name__)
CORS(app)
@app.route("/weather")
def weather():

    city = request.args.get("city")

    return jsonify(
        get_weather(city)
    )
@app.route("/live-status")
def live_status():

    train_number = request.args.get("trainNumber")

    result = get_live_status(
        train_number
    )

    return jsonify(result)

@app.route("/")
def home():
    return {
        "message": "Indian Railways API Running"
    }

@app.route("/recommend")
def recommend():

    source = request.args.get("source")
    destination = request.args.get("destination")

    trains = search_trains(
        source,
        destination
    )

    return jsonify(trains)

@app.route("/analytics")
def analytics():

    return jsonify(
        get_dashboard_stats()
    )

@app.route("/train-search")
def train_search():

    query = request.args.get("query")

    result = search_train(query)

    return jsonify(result)

@app.route("/crowd-prediction")
def crowd_prediction():

    station = request.args.get("station", "")

    result = predict_crowd(station)

    return jsonify(result)

@app.route("/train-route")
def train_route():
    train_number = request.args.get("trainNumber")
    if not train_number:
        return jsonify({"error": "trainNumber query parameter required"}), 400
    route = get_train_route(train_number)
    return jsonify(route)


if __name__ == "__main__":
    
    app.run(
        debug=True
    )