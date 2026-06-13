import json
import pandas as pd

TRAIN_INFO_PATH = "../RAILWAY DATA/train_info.csv"

def search_train(query):

    query = str(query).upper()

    info_df = pd.read_csv(TRAIN_INFO_PATH)

    all_files = [
        "../RAILWAY DATA/PASS-TRAINS.json",
        "../RAILWAY DATA/EXP-TRAINS.json",
        "../RAILWAY DATA/SF-TRAINS.json"
    ]

    for file in all_files:

        with open(file, "r", encoding="utf-8") as f:
            trains = json.load(f)

        for train in trains:

            train_no = str(train["trainNumber"])
            train_name = train["trainName"].upper()

            if query in train_no or query in train_name:

                stations = [
                    stop["stationName"]
                    for stop in train["trainRoute"]
                ]

                running_days = []

                for day, status in train.get("runningDays", {}).items():

                    if status:
                        running_days.append(day)

                train_info = info_df[
                    info_df["Train_No"].astype(str) == train_no.lstrip("0")
                ]

                source_station = "Not Available"
                destination_station = "Not Available"
                train_day = "Not Available"

                if not train_info.empty:

                    source_station = str(
                        train_info.iloc[0]["Source_Station_Name"]
                    )

                    destination_station = str(
                        train_info.iloc[0]["Destination_Station_Name"]
                    )

                    train_day = str(
                        train_info.iloc[0]["days"]
                    )

                return {

                    "trainNumber": train_no,
                    "trainName": train["trainName"],

                    "source": source_station,
                    "destination": destination_station,
                    "day": train_day,

                    "route": train["route"],

                    "runningDays": running_days,

                    "stations": stations,

                    "totalStations": len(stations)

                }

    return {
        "message": "Train Not Found"
    }