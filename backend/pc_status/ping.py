from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from time import perf_counter

from .config import iso_now, sometimes_fail, SimulatedError

router = APIRouter()

class PingResponse(BaseModel):
    status: str
    serverTime: str
    latencyMs: int

@router.get("/ping", response_model=PingResponse)
async def ping():
    start = perf_counter()
    try:
        sometimes_fail(every_n=5)
    except SimulatedError as exc:
        raise HTTPException(status_code=500, detail={"message": str(exc), "code": exc.code})

    latency_ms = int((perf_counter() - start) * 1000)
    return PingResponse(
        status="OK",
        serverTime=iso_now(),
        latencyMs=latency_ms,
    )
