from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.models import Generation
from ..dependencies import get_db
from ..schemas import DashboardMetricsResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/metrics", response_model=DashboardMetricsResponse)
async def dashboard_metrics(db: Session = Depends(get_db)) -> DashboardMetricsResponse:
    total = db.query(func.count(Generation.id)).scalar() or 0
    
    # Calculate developer blueprint targets (all engineering-centric tiers)
    dev_categories = [
        "authentication", "database_layers", "api_endpoints", 
        "containerization", "azure_infrastructure", "data_engineering"
    ]
    dev_count = db.query(func.count(Generation.id)).filter(
        Generation.category.in_(dev_categories)
    ).scalar() or 0
    
    user_count = total - dev_count
    distinct_categories = [row[0] for row in db.query(Generation.category).distinct().all()]

    return DashboardMetricsResponse(
        total_generations=total,
        dev_vs_user_split={"dev_count": dev_count, "user_count": user_count},
        unique_categories=distinct_categories,
    )