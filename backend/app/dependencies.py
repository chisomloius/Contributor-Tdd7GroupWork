from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from .core.database import SessionLocal
from .core.models import User


async def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_by_token(session_token: str, db: Session) -> User:
    user = db.query(User).filter(User.session_token == session_token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")
    return user
