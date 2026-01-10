import os
import psycopg2
from flask import Flask, send_from_directory, jsonify, request
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

# Inicializar tabla de usuarios
def init_db():
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    photo_url TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            cur.close()
            conn.close()
            print("Tabla 'users' verificada/creada exitosamente.")
        except Exception as e:
            print(f"Error inicializando DB: {e}")

# Ejecutar inicialización al inicio (si es posible)
# Nota: En producción esto podría requerir un script de migración separado, 
# pero para este caso lo intentamos al cargar la app.
if os.getenv('DB_HOST'):
    init_db()

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

# API para guardar usuario
@app.route('/api/save-user', methods=['POST'])
def save_user():
    data = request.json
    uid = data.get('uid')
    email = data.get('email')
    name = data.get('displayName')
    photo_url = data.get('photoURL')

    if not uid or not email:
        return jsonify({"status": "error", "message": "Faltan datos requeridos"}), 400

    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            # Upsert: Insertar o actualizar si ya existe el email/uid
            cur.execute("""
                INSERT INTO users (firebase_uid, email, name, photo_url, last_login)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (email) 
                DO UPDATE SET 
                    name = EXCLUDED.name, 
                    photo_url = EXCLUDED.photo_url,
                    last_login = CURRENT_TIMESTAMP,
                    firebase_uid = EXCLUDED.firebase_uid;
            """, (uid, email, name, photo_url))
            
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"status": "success", "message": "Usuario guardado exitosamente"})
        except Exception as e:
            print(f"Error guardando usuario: {e}")
            return jsonify({"status": "error", "message": str(e)}), 500
    else:
        return jsonify({"status": "error", "message": "Error de conexión a BD"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
