from secrets import token_urlsafe

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.models import User
from ..dependencies import get_db
from ..schemas import UserLoginRequest, UserLoginResponse

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/login", response_model=UserLoginResponse)
async def login_user(request: UserLoginRequest, db: Session = Depends(get_db)) -> UserLoginResponse:
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        user = User(username=request.username, access_key=request.access_key, full_name=request.full_name, job_role=request.job_role)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # update profile fields if provided
        changed = False
        if request.full_name and request.full_name != user.full_name:
            user.full_name = request.full_name
            changed = True
        if request.job_role and request.job_role != user.job_role:
            user.job_role = request.job_role
            changed = True
        if changed:
            db.add(user)
            db.commit()
            db.refresh(user)

    session_token = token_urlsafe(32)
    user.session_token = session_token
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserLoginResponse(user_id=user.id, username=user.username, session_token=user.session_token, full_name=user.full_name, job_role=user.job_role)
