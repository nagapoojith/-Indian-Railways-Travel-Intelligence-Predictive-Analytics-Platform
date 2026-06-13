import csv
import os

# Path to the train schedule CSV file
TRAIN_SCHEDULE_PATH = os.path.join(os.path.dirname(__file__), "..", "RAILWAY DATA", "train_schedule.csv")

def _load_schedule():
    """Load train schedule CSV into a list of dicts.

    Returns:
        List[dict]: Each dict represents a row with keys from the header.
    """
    schedule = []
    try:
        with open(TRAIN_SCHEDULE_PATH, "r", encoding="utf-8") as f:
            # Use csv.DictReader which expects the first line to be header
            reader = csv.DictReader(f)
            for row in reader:
                schedule.append(row)
    except Exception as e:
        # In production we might log this error; for now just return empty list
        print(f"Error reading train schedule: {e}")
    return schedule

def get_train_route(train_number):
    """Return the ordered list of station names for a given train number.

    The function reads the ``train_schedule.csv`` file where each row contains the
    ``Train_No`` field (train number) and ``Station_Name`` among other columns.
    It filters rows matching the requested ``train_number`` (ignoring leading zeros)
    and sorts them by the row order, which reflects the travel sequence.

    Args:
        train_number (str|int): Train number identifier.

    Returns:
        dict: ``{"routeStations": ["Station A", "Station B", ...]}``
    """
    if not train_number:
        return {"routeStations": []}

    # Normalise train number to string without leading zeros for comparison
    train_number_str = str(train_number).lstrip("0")

    schedule = _load_schedule()
    route = []
    for row in schedule:
        # Some CSV files may have the header column named "Train_No" or "TrainNo"
        row_train_no = row.get("Train_No") or row.get("TrainNo") or ""
        if str(row_train_no).lstrip("0") == train_number_str:
            station_name = row.get("Station_Name") or row.get("StationName") or ""
            if station_name:
                route.append(station_name)
    # Remove any bogus entries like "BHUTAN"
    route = [s for s in route if "BHUTAN" not in s.upper()]
    return {"routeStations": route}
