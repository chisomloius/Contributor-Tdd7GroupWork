from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..core.models import Generation, TelemetryLog
from ..dependencies import get_db, get_user_by_token
from ..schemas import GenerateDocRequest, GenerateDocResponse, HistoricalDocItem
# Ensure this exact module matching string path is active
from ..services.doc_engine import generate_mock_documentation

router = APIRouter(prefix="/api/docs", tags=["docs"])

@router.post("/generate", response_model=GenerateDocResponse)
async def generate_doc(request: GenerateDocRequest, db: Session = Depends(get_db)) -> GenerateDocResponse:
    user = get_user_by_token(request.session_token, db)
    output = generate_mock_documentation(request.prompt, selected_category=request.category)

    generation = Generation(
        user_id=user.id,
        category=request.category,
        prompt_text=request.prompt,
        technical_output=output["technical_output"],
        user_output=output["user_output"],
    )
    db.add(generation)
    db.commit()

    db.add(
        TelemetryLog(
            user_id=user.id,
            action="generate_document",
            detail=f"category={request.category}",
        )
    )
    db.commit()

    return GenerateDocResponse(
        title=output["title"],
        technical_output=output["technical_output"],
        user_output=output["user_output"],
    )

@router.get("/search", response_model=List[HistoricalDocItem])
async def search_historical_docs(
    session_token: str = Query(...),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> List[HistoricalDocItem]:
    user = get_user_by_token(session_token, db)
    
    query = db.query(Generation).filter(Generation.user_id == user.id)
    
    if q and q.strip():
        search_term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                Generation.prompt_text.like(search_term),
                Generation.technical_output.like(search_term),
                Generation.user_output.like(search_term),
                Generation.category.like(search_term)
            )
        )
        
    results = query.order_by(Generation.created_at.desc()).all()
    
    # Quick title generator fallback for list view modeling
    for r in results:
        r.title = f"{r.category.replace('_', ' ').title()} Spec Blueprint"
        
    return results