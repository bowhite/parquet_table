import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from datetime import datetime, timedelta
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

# Generate 50000 rows
num_rows = 50000

# Generate dates starting from 2024-01-01
start_date = datetime(2024, 1, 1)
dates = [start_date + timedelta(minutes=i) for i in range(num_rows)]

# Extract date and time components
date_strings = [d.strftime('%Y-%m-%d') for d in dates]
time_strings = [d.strftime('%H:%M:%S') for d in dates]

# Generate energy values (cumulative kWh, increasing trend)
base_energy = 1000
energy = base_energy + np.cumsum(np.random.uniform(0.5, 2.0, num_rows))

# Generate power values (kW, fluctuating around 50-100)
power = np.random.uniform(40, 120, num_rows) + np.sin(np.arange(num_rows) / 100) * 20

# Create DataFrame
df = pd.DataFrame({
    'date': date_strings,
    'time': time_strings,
    'energy': energy.round(2),
    'power': power.round(2)
})

# Convert to PyArrow Table
table = pa.Table.from_pandas(df)

# Write to Parquet file
pq.write_table(table, 'frontend/public/data/sample_data.parquet')

print(f"Generated parquet file with {num_rows} rows")
print(f"Columns: {df.columns.tolist()}")
print(f"\nFirst 5 rows:")
print(df.head())
print(f"\nLast 5 rows:")
print(df.tail())
