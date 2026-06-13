import requests

API_KEY = "554fb5c0abf726c3bade69051bcc954c"

def get_weather(city):

    if not city:
        return {
            "city": "Unknown",
            "temperature": 28.0,
            "humidity": 70,
            "weather": "Clear",
            "description": "clear sky"
        }

    # Extract clean city name before any code suffix like - KYJ or - KTYM
    clean_city = city.split("-")[0].strip()
    
    clean_city = clean_city.replace(" JN", "")
    clean_city = clean_city.replace(" Jn", "")
    clean_city = clean_city.replace(" jn", "")
    clean_city = clean_city.replace(" Ctl", "")
    clean_city = clean_city.replace(" Central", "")
    clean_city = clean_city.replace(" Rd", "")
    clean_city = clean_city.replace(" T", "")
    clean_city = clean_city.strip()

    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "q": clean_city,
        "appid": API_KEY,
        "units": "metric"
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
    except Exception:
        data = {}

    if "main" not in data:
        # Pseudo-random but stable weather fallback for the city
        import random
        # Seed with the city name hash to make weather stable per station
        random.seed(hash(clean_city))
        temp = round(24.0 + random.random() * 8.0, 1)
        humidity = random.randint(65, 85)
        conditions = ["Clouds", "Clear", "Haze", "Rain"]
        cond = random.choice(conditions)
        
        return {
            "city": clean_city,
            "temperature": temp,
            "humidity": humidity,
            "weather": cond,
            "description": f"typical {cond.lower()} (fallback)"
        }

    return {
        "city": clean_city,
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "weather": data["weather"][0]["main"],
        "description": data["weather"][0]["description"]
    }