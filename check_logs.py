import pymysql
import os
import re

def get_db_params():
    env_path = os.path.join("backend", ".env")
    if not os.path.exists(env_path):
        return None
    
    with open(env_path, "r") as f:
        content = f.read()
        # Extract MySQL URL: mysql+pymysql://user:pass@host:port/db
        match = re.search(r"DATABASE_URL=mysql\+pymysql://(.*?):(.*?)@(.*?):(.*?)/(.*)", content)
        if match:
            return {
                "user": match.group(1),
                "password": match.group(2).replace("%23", "#"), # Handle URL encoding for #
                "host": "localhost", # Connecting from host to mapped docker port
                "port": int(match.group(4)),
                "database": match.group(5)
            }
    return None

params = get_db_params()
if not params:
    print("Could not parse database credentials from backend/.env")
else:
    try:
        connection = pymysql.connect(
            host=params['host'],
            user=params['user'],
            password=params['password'],
            database=params['database'],
            port=params['port']
        )
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM audit_logs")
            count = cursor.fetchone()[0]
            print(f"Successfully connected to MySQL. Total audit logs: {count}")
            
            cursor.execute("SELECT action, message, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 5")
            print("\nRecent Tactical Audit Events:")
            for action, msg, ts in cursor.fetchall():
                print(f"[{ts}] {action}: {msg}")
                
        connection.close()
    except Exception as e:
        print(f"Connection Failed: {e}")
        print("Note: Ensure the unicloudops_mysql container is running (docker ps).")
