import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

try:
    print("Intentando conectar a la base de datos...")
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=os.getenv('DB_PORT'),
        sslmode=os.getenv('DB_SSLMODE')
    )
    print("¡Conexión EXITOSA!")
    
    cur = conn.cursor()
    cur.execute('SELECT version();')
    version = cur.fetchone()
    print(f"Versión de PostgreSQL: {version[0]}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"ERROR de conexión: {e}")
