import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def _env(name: str, default: str = ""):
    return os.getenv(name, default)


def make_db_url():
    host = _env('DB_HOST', 'localhost')
    port = _env('DB_PORT', '5434')
    user = _env('DB_USER', 'upwork')
    pw = _env('DB_PASS', 'upwork')
    db = _env('DB_NAME', 'upwork')
    return f"postgresql+psycopg2://{user}:{pw}@{host}:{port}/{db}"


engine = create_engine(make_db_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

