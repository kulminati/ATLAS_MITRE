"""Deep-dive educational content API routes."""

from fastapi import APIRouter, HTTPException

from app.models.atlas import DeepDiveResponse
from app.services.deepdive_content import get_deepdive

router = APIRouter(tags=["deepdives"])


@router.get("/techniques/{technique_id}/deepdive", response_model=DeepDiveResponse)
def get_technique_deepdive(technique_id: str):
    """Get deep-dive educational content for a technique."""
    content = get_deepdive(technique_id)
    if content is None:
        raise HTTPException(
            status_code=404,
            detail=f"No deep-dive content available for {technique_id}",
        )
    return content
