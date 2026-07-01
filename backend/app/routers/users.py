from secrets import token_urlsafe
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.models import User, TelemetryLog
from ..dependencies import get_db
from ..schemas import UserLoginRequest, UserLoginResponse

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/login", response_model=UserLoginResponse)
async def login_user(request: UserLoginRequest, db: Session = Depends(get_db)) -> UserLoginResponse:
    user = db.query(User).filter(User.username == request.username.strip()).first()
    
    if request.is_signup:
        if user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        user = User(
            username=request.username.strip(),
            access_key=request.access_key,
            full_name=request.full_name,
            job_role=request.job_role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        db.add(TelemetryLog(user_id=user.id, action="registration", detail=f"role={user.job_role}"))
        db.commit()
    else:
        if not user:
            raise HTTPException(status_code=404, detail="Username not found. Please register first.")
        
        # Sync profile fields if provided on login
        if request.full_name:
            user.full_name = request.full_name
        if request.job_role:
            user.job_role = request.job_role

    session_token = token_urlsafe(32)
    user.session_token = session_token
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserLoginResponse(
        user_id=user.id,
        username=user.username,
        session_token=user.session_token,
        full_name=user.full_name,
        job_role=user.job_role
    )