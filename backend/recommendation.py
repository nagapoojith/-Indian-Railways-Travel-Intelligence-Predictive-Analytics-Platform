import json


def get_train_type(train_name):
    name = train_name.upper()
    if "SF" in name or "SUPERFAST" in name or "RAJDHANI" in name or "SHATABDI" in name:
        return "Superfast"
    elif "EXP" in name or "EXPRESS" in name or "INTERCITY" in name or "JAN SHATABDI" in name:
        return "Express"
    elif "PASS" in name or "PASSENGER" in name:
        return "Passenger"
    else:
        return "Special"


def compute_score(train_type, src_idx, dst_idx, total_stops, src_dep, dst_arr):
    """
    Smart scoring:
    - Base score by type
    - Bonus for fewer stops between src and dst (more direct)
    - Bonus for early departure
    - Small variation so trains of same type get different scores
    """
    base = {
        "Superfast": 85,
        "Express": 70,
        "Special": 55,
        "Passenger": 40,
    }.get(train_type, 50)

    # Number of intermediate stops between source and destination
    segment_stops = dst_idx - src_idx - 1  # stops in between
    # Fewer stops = more direct = higher score (max +12 for direct, 0 for many stops)
    directness_bonus = max(0, 12 - segment_stops * 2)

    # Departure time bonus: prefer morning/afternoon departures (6 AM - 4 PM)
    time_bonus = 0
    if src_dep and ":" in src_dep:
        try:
            h = int(src_dep.split(":")[0])
            if 5 <= h <= 16:
                time_bonus = 5
            elif 17 <= h <= 21:
                time_bonus = 2
        except Exception:
            pass

    score = base + directness_bonus + time_bonus
    return min(score, 99)  # cap at 99


def search_trains(source, destination):
    all_files = [
        "../RAILWAY DATA/SF-TRAINS.json",
        "../RAILWAY DATA/EXP-TRAINS.json",
        "../RAILWAY DATA/PASS-TRAINS.json",
    ]

    results = []
    source_upper = source.upper().strip()
    destination_upper = destination.upper().strip()

    for file in all_files:
        try:
            with open(file, "r", encoding="utf-8") as f:
                trains = json.load(f)
        except Exception:
            continue

        for train in trains:
            route_stops = train.get("trainRoute", [])
            stations = [stop["stationName"].upper() for stop in route_stops]

            src_idx = -1
            dst_idx = -1

            for i, station in enumerate(stations):
                if source_upper in station and src_idx == -1:
                    src_idx = i
                if destination_upper in station and dst_idx == -1:
                    dst_idx = i

            if src_idx != -1 and dst_idx != -1 and src_idx < dst_idx:
                train_type = get_train_type(train["trainName"])

                src_stop = route_stops[src_idx]
                dst_stop = route_stops[dst_idx]

                # Departure from source
                src_dep = src_stop.get("departs", src_stop.get("arrives", ""))
                if src_dep in ("Source", "Destination", "", None):
                    src_dep = src_stop.get("arrives", "")
                if src_dep in ("Source", "Destination", "", None):
                    src_dep = "--:--"

                # Arrival at destination
                dst_arr = dst_stop.get("arrives", dst_stop.get("departs", ""))
                if dst_arr in ("Source", "Destination", "", None):
                    dst_arr = dst_stop.get("departs", "")
                if dst_arr in ("Source", "Destination", "", None):
                    dst_arr = "--:--"

                # Distance from source to destination
                try:
                    src_dist = int(route_stops[src_idx]["distance"].replace(" kms", "").replace(",", "").strip())
                    dst_dist = int(route_stops[dst_idx]["distance"].replace(" kms", "").replace(",", "").strip())
                    segment_distance = dst_dist - src_dist
                except Exception:
                    segment_distance = 0

                # Day offset for arrival (for overnight trains)
                try:
                    src_day = int(src_stop.get("day", "1"))
                    dst_day = int(dst_stop.get("day", "1"))
                    day_offset = dst_day - src_day
                except Exception:
                    day_offset = 0

                score = compute_score(
                    train_type, src_idx, dst_idx,
                    len(stations), src_dep, dst_arr
                )

                results.append({
                    "trainNumber": train["trainNumber"],
                    "trainName": train["trainName"],
                    "route": train["route"],
                    "type": train_type,
                    "score": score,
                    "departure": src_dep,
                    "arrival": dst_arr,
                    "dayOffset": day_offset,
                    "segmentDistance": segment_distance,
                    "intermediateStops": dst_idx - src_idx - 1,
                    "runningDays": train.get("runningDays", ""),
                })

    # Sort by score descending, then by departure time as tiebreaker
    def sort_key(x):
        time_val = 0
        dep = x.get("departure", "--:--")
        if dep and ":" in dep:
            try:
                h, m = dep.split(":")
                time_val = int(h) * 60 + int(m)
            except Exception:
                pass
        return (-x["score"], time_val)

    results.sort(key=sort_key)
    return results


if __name__ == "__main__":
    source = input("Source : ")
    destination = input("Destination : ")
    trains = search_trains(source, destination)
    print(f"\nFound {len(trains)} trains\n")
    for rank, train in enumerate(trains, start=1):
        print(f"\n⭐ Rank {rank}")
        print("Train No  :", train["trainNumber"])
        print("Train Name:", train["trainName"])
        print("Type      :", train["type"])
        print("Score     :", train["score"])
        print("Route     :", train["route"])
        print("Departure :", train["departure"])
        print("Arrival   :", train["arrival"])
        print("Stops     :", train["intermediateStops"])