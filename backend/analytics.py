import os
import json
import subprocess

ANALYTICS_FILE = os.path.join(os.path.dirname(__file__), "processed_analytics.json")
GENERATOR_SCRIPT = os.path.join(os.path.dirname(__file__), "generate_analytics.py")

def get_dashboard_stats():
    try:
        # If the file does not exist, run the generator script first
        if not os.path.exists(ANALYTICS_FILE):
            print("Analytics cache file missing. Running generate_analytics.py...")
            subprocess.run(["python", GENERATOR_SCRIPT], check=True)
            
        with open(ANALYTICS_FILE, "r", encoding="utf-8") as f:
            stats = json.load(f)
            
        return stats
    except Exception as e:
        return {
            "error": str(e)
        }

if __name__ == "__main__":
    print(json.dumps(get_dashboard_stats(), indent=2))