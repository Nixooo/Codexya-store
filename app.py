import os
import psycopg2
from flask import Flask, send_from_directory, jsonify
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')

# Configuración de la base de datos
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT'),
            sslmode=os.getenv('DB_SSLMODE')
        )
        return conn
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

# Ruta principal (index.html)
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Servir archivos estáticos y otras páginas HTML
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# API de prueba de conexión
@app.route('/api/test-db')
def test_db():
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute('SELECT version();')
            db_version = cur.fetchone()
            cur.close()
            conn.close()
            return jsonify({
                "status": "success", 
                "message": "Conexión exitosa a PostgreSQL", 
                "version": db_version[0]
            })
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    else:
        return jsonify({"status": "error", "message": "No se pudo conectar a la base de datos"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
