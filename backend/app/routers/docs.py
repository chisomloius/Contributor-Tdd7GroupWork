from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.models import Generation, TelemetryLog
from ..dependencies import get_db, get_user_by_token
from ..schemas import GenerateDocRequest, GenerateDocResponse
from ..services.doc_engine import generate_mock_documentation

router = APIRouter(prefix="/api/docs", tags=["docs"])


@router.post("/generate", response_model=GenerateDocResponse)
async def generate_doc(request: GenerateDocRequest, db: Session = Depends(get_db)) -> GenerateDocResponse:
    user = get_user_by_token(request.session_token, db)
    output = generate_mock_documentation(request.prompt)

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
        technical_output=output["technical_output"],
        user_output=output["user_output"],
    )
