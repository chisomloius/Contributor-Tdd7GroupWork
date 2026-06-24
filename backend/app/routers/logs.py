from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.models import TelemetryLog, User
from ..dependencies import get_db, get_user_by_token
from ..schemas import RecentLogsResponse, TelemetryLogEntry

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.get("/recent", response_model=RecentLogsResponse)
async def recent_logs(
    user_id: int = Query(..., gt=0),
    limit: int = Query(5, ge=1, le=20),
    session_token: str = Query(...),
    db: Session = Depends(get_db),
) -> RecentLogsResponse:
    user = get_user_by_token(session_token, db)
    if user.id != user_id:
        raise HTTPException(status_code=401, detail="User token mismatch")

    rows = (
        db.query(TelemetryLog)
        .filter(TelemetryLog.user_id == user.id)
        .order_by(TelemetryLog.created_at.desc())
        .limit(limit)
        .all()
    )

    return RecentLogsResponse(logs=[TelemetryLogEntry(action=row.action, detail=row.detail, created_at=row.created_at) for row in rows])
