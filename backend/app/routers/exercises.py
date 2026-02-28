from fastapi import APIRouter, HTTPException

from app.models.atlas import ExerciseDetail, ExerciseSummary
from app.services.exercises import EXERCISES

router = APIRouter(tags=["exercises"])


@router.get("/exercises", response_model=list[ExerciseSummary])
def get_exercises():
    return [
        {
            "id": ex["id"],
            "title": ex["title"],
            "difficulty": ex["difficulty"],
            "technique_ids": ex["technique_ids"],
        }
        for ex in EXERCISES
    ]


@router.get("/exercises/{exercise_id}", response_model=ExerciseDetail)
def get_exercise(exercise_id: str):
    for ex in EXERCISES:
        if ex["id"] == exercise_id:
            return ex
    raise HTTPException(status_code=404, detail="Exercise not found")
