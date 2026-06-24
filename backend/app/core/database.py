from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import text

SQLITE_URL = "sqlite:///./local_mvp.db"

engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False}, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def init_db() -> None:
    from .models import Generation, TelemetryLog, User

    Base.metadata.create_all(bind=engine)
    # Ensure new columns exist for backward-compatible schema upgrades
    with engine.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in res.fetchall()]
        except Exception:
            cols = []

        if "full_name" not in cols:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(100)"))
            except Exception:
                pass
        if "job_role" not in cols:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN job_role VARCHAR(100)"))
            except Exception:
                pass
