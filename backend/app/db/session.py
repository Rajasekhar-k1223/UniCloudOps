import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
engine_args = {}

if db_url.startswith("sqlite"):
    engine_args = {"connect_args": {"check_same_thread": False}}
else:
    try:
        # Test connection with a short timeout
        temp_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
        with temp_engine.connect() as conn:
            pass
        temp_engine.dispose()
        engine_args = {
            "pool_pre_ping": True,
            "pool_size": 20,
            "max_overflow": 10,
            "pool_recycle": 1800,
            "pool_timeout": 30
        }
        logger.info("Database Engine: Connected to MySQL successfully.")
    except Exception as e:
        fallback_db_path = os.path.join(os.getcwd(), "unicloudops.db")
        db_url = f"sqlite:///{fallback_db_path}"
        engine_args = {"connect_args": {"check_same_thread": False}}
        logger.warning(f"MySQL connection refused ({e}). Falling back to local SQLite: {db_url}")

engine = create_engine(db_url, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            pass
