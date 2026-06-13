import os
import json
import pandas as pd
import numpy as np

DATA_DIR = "../RAILWAY DATA"
OUTPUT_FILE = "processed_analytics.json"

def parse_time_to_minutes(val):
    if pd.isna(val):
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    val_str = str(val).strip()
    # If HH:MM:SS
    parts = val_str.split(":")
    if len(parts) == 3:
        try:
            return float(int(parts[0]) * 60 + int(parts[1]) + int(parts[2]) / 60.0)
        except Exception:
            return 0.0
    elif len(parts) == 2:
        try:
            return float(int(parts[0]) * 60 + int(parts[1]))
        except Exception:
            return 0.0
    try:
        return float(val_str)
    except Exception:
        return 0.0

def generate():
    print("Starting data aggregation for all 10 railway files...")
    
    # 1, 2, 3. Train categories from JSON files
    print("Parsing train category JSON files...")
    exp_count = 0
    pass_count = 0
    sf_count = 0
    
    try:
        with open(os.path.join(DATA_DIR, "EXP-TRAINS.json"), "r", encoding="utf-8") as f:
            exp_data = json.load(f)
            exp_count = len(exp_data)
    except Exception as e:
        print(f"Error reading EXP-TRAINS.json: {e}")
        
    try:
        with open(os.path.join(DATA_DIR, "PASS-TRAINS.json"), "r", encoding="utf-8") as f:
            pass_data = json.load(f)
            pass_count = len(pass_data)
    except Exception as e:
        print(f"Error reading PASS-TRAINS.json: {e}")
        
    try:
        with open(os.path.join(DATA_DIR, "SF-TRAINS.json"), "r", encoding="utf-8") as f:
            sf_data = json.load(f)
            sf_count = len(sf_data)
    except Exception as e:
        print(f"Error reading SF-TRAINS.json: {e}")

    # 4. trains.json (GeoJSON paths & class availability)
    print("Parsing trains.json...")
    trains_geojson_count = 0
    trains_by_zone = {}
    class_counts = {
        "First_AC": 0,
        "Second_AC": 0,
        "Third_AC": 0,
        "Sleeper": 0,
        "First_Class": 0,
        "Chair_Car": 0
    }
    try:
        with open(os.path.join(DATA_DIR, "trains.json"), "r", encoding="utf-8") as f:
            trains_geojson = json.load(f)
            features = trains_geojson.get("features", [])
            trains_geojson_count = len(features)
            for feat in features:
                props = feat.get("properties", {})
                zone = props.get("zone", "UNKNOWN")
                if zone:
                    trains_by_zone[zone] = trains_by_zone.get(zone, 0) + 1
                
                # Check class availability
                if props.get("first_ac") == 1 or props.get("first_ac") == "1" or props.get("first_ac") is True:
                    class_counts["First_AC"] += 1
                if props.get("second_ac") == 1 or props.get("second_ac") == "1" or props.get("second_ac") is True:
                    class_counts["Second_AC"] += 1
                if props.get("third_ac") == 1 or props.get("third_ac") == "1" or props.get("third_ac") is True:
                    class_counts["Third_AC"] += 1
                if props.get("sleeper") == 1 or props.get("sleeper") == "1" or props.get("sleeper") is True:
                    class_counts["Sleeper"] += 1
                if props.get("first_class") == 1 or props.get("first_class") == "1" or props.get("first_class") is True:
                    class_counts["First_Class"] += 1
                if props.get("chair_car") == 1 or props.get("chair_car") == "1" or props.get("chair_car") is True:
                    class_counts["Chair_Car"] += 1
    except Exception as e:
        print(f"Error reading trains.json: {e}")

    # 5. stations.json (GeoJSON stations)
    print("Parsing stations.json...")
    total_stations = 0
    stations_by_state = {}
    stations_by_zone = {}
    try:
        with open(os.path.join(DATA_DIR, "stations.json"), "r", encoding="utf-8") as f:
            stations_geojson = json.load(f)
            features = stations_geojson.get("features", [])
            total_stations = len(features)
            for feat in features:
                props = feat.get("properties", {})
                state = props.get("state") or "Other/Unknown"
                zone = props.get("zone") or "Other/Unknown"
                stations_by_state[state] = stations_by_state.get(state, 0) + 1
                stations_by_zone[zone] = stations_by_zone.get(zone, 0) + 1
    except Exception as e:
        print(f"Error reading stations.json: {e}")

    # Sort state and zone stations count
    sorted_states = sorted(stations_by_state.items(), key=lambda x: x[1], reverse=True)[:10]
    sorted_zones = sorted(stations_by_zone.items(), key=lambda x: x[1], reverse=True)[:10]
    
    states_list = [{"state": k, "count": v} for k, v in sorted_states]
    zones_list = [{"zone": k, "count": v} for k, v in sorted_zones]

    # 6. schedules.json (huge file)
    print("Parsing schedules.json...")
    total_schedules = 0
    busy_stations_sched = {}
    try:
        with open(os.path.join(DATA_DIR, "schedules.json"), "r", encoding="utf-8") as f:
            schedules_data = json.load(f)
            total_schedules = len(schedules_data)
            for item in schedules_data:
                st_name = item.get("station_name")
                if st_name:
                    busy_stations_sched[st_name] = busy_stations_sched.get(st_name, 0) + 1
    except Exception as e:
        print(f"Error reading schedules.json: {e}")
        
    sorted_busy_stations_sched = sorted(busy_stations_sched.items(), key=lambda x: x[1], reverse=True)[:10]
    busy_stations_sched_list = [{"station_name": k, "schedule_count": v} for k, v in sorted_busy_stations_sched]

    # 7. train_info.csv
    print("Parsing train_info.csv...")
    train_info_count = 0
    try:
        df_info = pd.read_csv(os.path.join(DATA_DIR, "train_info.csv"))
        train_info_count = len(df_info)
    except Exception as e:
        print(f"Error reading train_info.csv: {e}")

    # 8. train_schedule.csv (route distances)
    print("Parsing train_schedule.csv...")
    total_sched_rows = 0
    max_distance = 0
    avg_distance = 0
    
    try:
        df_sched_csv = pd.read_csv(os.path.join(DATA_DIR, "train_schedule.csv"))
        total_sched_rows = len(df_sched_csv)
        if 'Distance' in df_sched_csv.columns:
            df_sched_csv['Distance'] = pd.to_numeric(df_sched_csv['Distance'], errors='coerce')
            max_distance = float(df_sched_csv['Distance'].max())
            avg_distance = float(df_sched_csv['Distance'].mean())
    except Exception as e:
        print(f"Error reading train_schedule.csv: {e}")

    # 9. etrain_delays.csv
    print("Parsing etrain_delays.csv...")
    avg_delay_1 = 0
    max_delay_1 = 0
    risk_low = 0
    risk_med = 0
    risk_high = 0
    risk_crit = 0
    top_trains_delays = []
    reliable_trains = []
    stations_delays = []
    
    try:
        df_delay1 = pd.read_csv(os.path.join(DATA_DIR, "etrain_delays.csv"))
        df_delay1["average_delay_minutes"] = pd.to_numeric(df_delay1["average_delay_minutes"], errors="coerce")
        df_delay1 = df_delay1.dropna(subset=["average_delay_minutes"])
        
        avg_delay_1 = float(df_delay1["average_delay_minutes"].mean())
        max_delay_1 = float(df_delay1["average_delay_minutes"].max())
        
        risk_low = int((df_delay1["average_delay_minutes"] < 15).sum())
        risk_med = int(((df_delay1["average_delay_minutes"] >= 15) & (df_delay1["average_delay_minutes"] < 30)).sum())
        risk_high = int(((df_delay1["average_delay_minutes"] >= 30) & (df_delay1["average_delay_minutes"] < 60)).sum())
        risk_crit = int((df_delay1["average_delay_minutes"] >= 60).sum())
        
        # Top trains
        top_t = df_delay1.groupby("train_name")["average_delay_minutes"].mean().sort_values(ascending=False).head(10).reset_index()
        top_trains_delays = top_t.to_dict(orient="records")
        
        # Reliable trains
        rel_t = df_delay1.groupby("train_name")["average_delay_minutes"].mean().sort_values().head(10).reset_index()
        rel_t["reliability_score"] = (100 - rel_t["average_delay_minutes"]).round(2)
        reliable_trains = rel_t.to_dict(orient="records")
        
        # Station delays
        st_del = df_delay1.groupby("station_name")["average_delay_minutes"].mean().sort_values(ascending=False).head(10).reset_index()
        stations_delays = st_del.to_dict(orient="records")
        
    except Exception as e:
        print(f"Error reading etrain_delays.csv: {e}")

    # 10. indian_railway_delay_data_.csv
    print("Parsing indian_railway_delay_data_.csv...")
    seasons_delay = {}
    frequency_delay = {}
    distance_vs_delay = []
    avg_delay_2 = 0
    max_delay_2 = 0
    
    try:
        df_delay2 = pd.read_csv(os.path.join(DATA_DIR, "indian_railway_delay_data_.csv"))
        # Parse Dealy_min
        df_delay2["Dealy_min"] = df_delay2["Dealy_min"].apply(parse_time_to_minutes)
        df_delay2["Distance(Km)"] = pd.to_numeric(df_delay2["Distance(Km)"], errors="coerce")
        df_delay2 = df_delay2.dropna(subset=["Dealy_min"])
        
        avg_delay_2 = float(df_delay2["Dealy_min"].mean())
        max_delay_2 = float(df_delay2["Dealy_min"].max())
        
        # Season based delay averages
        season_grouped = df_delay2.groupby("Season")["Dealy_min"].agg(["mean", "count"]).reset_index()
        for idx, row in season_grouped.iterrows():
            seasons_delay[row["Season"]] = {
                "avg_delay": round(float(row["mean"]), 2),
                "count": int(row["count"])
            }
            
        # Frequency based delay averages
        freq_grouped = df_delay2.groupby("Run_frequency")["Dealy_min"].agg(["mean", "count"]).reset_index()
        for idx, row in freq_grouped.iterrows():
            frequency_delay[row["Run_frequency"]] = {
                "avg_delay": round(float(row["mean"]), 2),
                "count": int(row["count"])
            }
            
        # Bin distance and average delay
        df_delay2["distance_bin"] = pd.cut(df_delay2["Distance(Km)"], bins=[0, 200, 500, 1000, 2000, 5000], labels=["0-200 km", "200-500 km", "500-1000 km", "1000-2000 km", "2000+ km"])
        dist_grouped = df_delay2.groupby("distance_bin", observed=False)["Dealy_min"].mean().reset_index()
        for idx, row in dist_grouped.iterrows():
            if not pd.isna(row["distance_bin"]):
                distance_vs_delay.append({
                    "range": str(row["distance_bin"]),
                    "avg_delay": round(float(row["Dealy_min"]), 2) if not pd.isna(row["Dealy_min"]) else 0
                })
    except Exception as e:
        print(f"Error reading indian_railway_delay_data_.csv: {e}")

    # Combine metrics
    avg_delay_combined = round((avg_delay_1 + avg_delay_2) / 2 if avg_delay_1 and avg_delay_2 else (avg_delay_1 or avg_delay_2), 2)
    max_delay_combined = round(max(max_delay_1, max_delay_2), 2)
    health_index = round(max(0.0, min(100.0, 100 - (avg_delay_combined / 1.5))), 2)

    # Format risk summary output
    risk_summary = {
        "low": int(risk_low),
        "medium": int(risk_med),
        "high": int(risk_high),
        "critical": int(risk_crit)
    }

    output = {
        "summary": {
            "total_stations": total_stations,
            "total_schedules": total_schedules,
            "total_train_paths": trains_geojson_count,
            "total_train_info": train_info_count,
            "avg_delay": avg_delay_combined,
            "max_delay": max_delay_combined,
            "health_index": health_index,
            "total_records_analyzed": total_stations + total_schedules + trains_geojson_count + train_info_count + total_sched_rows + exp_count + pass_count + sf_count,
            "risk_summary": risk_summary
        },
        "train_types": {
            "Express": exp_count,
            "Passenger": pass_count,
            "Superfast": sf_count
        },
        "stations_distribution": {
            "by_state": states_list,
            "by_zone": zones_list
        },
        "class_availability": class_counts,
        "delay_by_season": seasons_delay,
        "delay_by_frequency": frequency_delay,
        "delay_vs_distance": distance_vs_delay,
        "top_trains": top_trains_delays,
        "reliable_trains": reliable_trains,
        "stations": stations_delays,
        "busy_stations": busy_stations_sched_list,
        "distances": {
            "max_distance": round(max_distance, 1),
            "avg_distance": round(avg_distance, 1)
        }
    }
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=4)
        
    print(f"Successfully processed all 10 files. Generated {OUTPUT_FILE} successfully!")

if __name__ == "__main__":
    generate()
