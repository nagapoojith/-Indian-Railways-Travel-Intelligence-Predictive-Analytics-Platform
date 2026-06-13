import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

csv_path = os.path.join(
    BASE_DIR,
    "..",
    "RAILWAY DATA",
    "train_schedule.csv"
)

df = pd.read_csv(csv_path)

df.columns = df.columns.str.strip()

def predict_crowd(station):

    station = station.upper().strip()

    station_df = df[
        df["Station_Name"]
        .astype(str)
        .str.upper()
        == station
    ]

    if station_df.empty:

        station_df = df[
            df["Station_Name"]
            .astype(str)
            .str.upper()
            .str.contains(station, na=False)
        ]

    if station_df.empty:

        return {
            "station": station,
            "crowd": "Medium",
            "score": 50,
            "peakTraffic": 8,
            "waitingTime": "8 Minutes",
            "peakHours": ["18:00 - 19:00"],
            "bestTime": "12:00 - 13:00",
            "forecast": [3, 2, 1, 1, 2, 4, 5, 7, 8, 6, 5, 4, 3, 4, 5, 6, 7, 8, 8, 7, 6, 5, 4, 3]
        }

    station_name = station_df.iloc[0]["Station_Name"]

    hourly_count = [0] * 24

    for _, row in station_df.iterrows():

        try:

            arrival = str(row["Arrival_time"]).strip()

            if ":" in arrival:

                hour = int(arrival.split(":")[0])

                if 0 <= hour <= 23:

                    hourly_count[hour] += 1

        except:
            pass

    max_hourly = max(hourly_count)

    peak_hour_index = hourly_count.index(max_hourly)

    peak_hours = [
        f"{peak_hour_index:02d}:00 - {(peak_hour_index + 1) % 24:02d}:00"
    ]

    min_hourly = min(hourly_count)

    best_index = hourly_count.index(min_hourly)

    best_time = (
        f"{best_index:02d}:00 - {(best_index + 1) % 24:02d}:00"
    )

    score = min(
        100,
        int((max_hourly / 150) * 100)
    )

    if score >= 70:

        crowd = "High"
        waiting_time = "15 Minutes"

    elif score >= 40:

        crowd = "Medium"
        waiting_time = "8 Minutes"

    else:

        crowd = "Low"
        waiting_time = "2 Minutes"

    return {

        "station": station_name,

        "crowd": crowd,

        "score": score,

        "peakTraffic": int(max_hourly),

        "waitingTime": waiting_time,

        "peakHours": peak_hours,

        "bestTime": best_time,

        "forecast": hourly_count
    }