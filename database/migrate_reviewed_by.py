import psycopg2

conn = psycopg2.connect(
    dbname='elimDatabase',
    user='postgres',
    password='1234',
    host='localhost',
    port='5432'
)
conn.autocommit = True
cur = conn.cursor()
cur.execute("""
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS reviewed_by INT REFERENCES users(id) ON DELETE SET NULL
""")
print("Column 'reviewed_by' added to bookings table.")
cur.close()
conn.close()
