import pandas as pd
import json

df = pd.read_csv('c:/COLLEGE PROJECT/Datasets/india_housing_prices.csv')

# Let's get the top 20 localities for each city
top_localities_per_city = {}
for city in df['City'].unique():
    if pd.isna(city): continue
    city_data = df[df['City'] == city]
    # Get top 20 localities by frequency
    top_localities = city_data['Locality'].value_counts().head(20).index.tolist()
    # Ensure they are strings
    top_localities_per_city[str(city)] = [str(loc) for loc in top_localities]

with open('c:/COLLEGE PROJECT/Backend/localities.json', 'w') as f:
    json.dump(top_localities_per_city, f, indent=4)

print("Saved localities.json")
