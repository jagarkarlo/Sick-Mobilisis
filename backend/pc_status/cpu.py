from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from time import sleep
import random
import psutil

from .config import iso_now

router = APIRouter()

class CpuResponse(BaseModel):
    usagePercent: float
    capturedAt: str

@router.get("/cpu", response_model=CpuResponse)
def get_cpu():
    delay = random.uniform(2.0, 3.0)
    sleep(delay)

    if random.random() < 0.2:
        raise HTTPException(
            status_code=503,
            detail={"message": "Simulated CPU endpoint failure", "code": 503},
        )

    usage = psutil.cpu_percent(interval=None)
    return CpuResponse(usagePercent=usage, capturedAt=iso_now())
