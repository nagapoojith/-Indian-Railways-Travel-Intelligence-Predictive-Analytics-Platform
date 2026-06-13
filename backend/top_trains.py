import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'RAILWAY DATA')
paths = [
    os.path.join(DATA_DIR, 'SF-TRAINS.json'),
    os.path.join(DATA_DIR, 'EXP-TRAINS.json'),
    os.path.join(DATA_DIR, 'PASS-TRAINS.json')
]
trains = []
for p in paths:
    try:
        with open(p, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        continue
    for t in data:
        if not isinstance(t, dict):
            continue
        name = str(t.get('trainName','')).strip()
        num = str(t.get('trainNumber','')).strip()
        route = str(t.get('route','')).strip()
        uname = name.upper()
        if 'SF' in uname:
            typ='Superfast'; score=90
        elif 'EXP' in uname:
            typ='Express'; score=75
        elif 'PASS' in uname:
            typ='Passenger'; score=50
        else:
            typ='Special'; score=60
        trains.append({'score':score,'type':typ,'number':num,'name':name,'route':route})

trains.sort(key=lambda x:(x['score'], x['name']), reverse=True)

for i,tr in enumerate(trains[:50], start=1):
    print(f"{i}. {tr['name']} ({tr['number']}) - {tr['type']} - Score: {tr['score']} - Route: {tr['route']}")
