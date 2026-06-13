import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("RAILWAY DATA/etrain_delays.csv")

df = df.dropna(subset=["average_delay_minutes"])

# Average delay per train
train_delay = (
    df.groupby("train_name")["average_delay_minutes"]
    .mean()
    .sort_values(ascending=False)
    .head(10)
)

plt.figure(figsize=(12,6))

train_delay.plot(kind="bar")

plt.title("Top 10 Most Delayed Trains")
plt.xlabel("Train Name")
plt.ylabel("Average Delay (Minutes)")
plt.xticks(rotation=45)

plt.tight_layout()
plt.show()