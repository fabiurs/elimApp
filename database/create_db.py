import os
import psycopg2

DB_NAME = os.getenv('DB_NAME', 'elimcbs')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')

def create_db():
    conn = psycopg2.connect(dbname='postgres', user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(f"CREATE DATABASE {DB_NAME};")
    cur.close()
    conn.close()
    print(f"Database {DB_NAME} created.")

def apply_schema():
    with open(SCHEMA_PATH, 'r') as f:
        schema_sql = f.read()
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
    cur = conn.cursor()
    cur.execute(schema_sql)
    conn.commit()
    cur.close()
    conn.close()
    print("Schema applied.")

def main():
    create_db()
    apply_schema()

if __name__ == '__main__':
    main()
