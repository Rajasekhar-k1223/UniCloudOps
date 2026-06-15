from app.db.session import engine
from sqlalchemy import text

def update_schema():
    with engine.connect() as conn:
        print("Ensuring columns exist in cloud_accounts...")
        
        cols = [
            ("status", 'VARCHAR(50) DEFAULT "pending"'),
            ("last_sync", 'DATETIME'),
            ("error_message", 'TEXT')
        ]
        
        for col_name, col_type in cols:
            try:
                # Simple check and add for MySQL
                conn.execute(text(f"ALTER TABLE cloud_accounts ADD COLUMN {col_name} {col_type}"))
                print(f"Added column: {col_name}")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    print(f"Column {col_name} already exists.")
                else:
                    print(f"Error adding {col_name}: {e}")
        
        print("Ensuring columns exist in deployments...")
        dep_cols = [
            ("has_drift", 'INT DEFAULT 0'),
            ("drift_summary", 'TEXT')
        ]
        
        for col_name, col_type in dep_cols:
            try:
                conn.execute(text(f"ALTER TABLE deployments ADD COLUMN {col_name} {col_type}"))
                print(f"Added column: {col_name} to deployments")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    print(f"Column {col_name} already exists in deployments.")
                else:
                    print(f"Error adding {col_name} to deployments: {e}")
                    
        conn.commit()
    print("Schema update completed.")

if __name__ == "__main__":
    update_schema()
