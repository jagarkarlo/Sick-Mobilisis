from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime, timezone
import asyncio
import json
import psutil
import random

from .config import iso_now

router = APIRouter()

@router.websocket("/memory")
async def memory_ws(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({
        "type": "welcome",
        "serverTime": iso_now(),
    })

    forced_disconnect_after = 30
    start_time = datetime.now(timezone.utc)

    try:
        while True:
            elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
            if elapsed > forced_disconnect_after:
                await websocket.close(code=4000)
                break

            vm = psutil.virtual_memory()
            payload = {
                "type": "data",
                "usagePercent": vm.percent,
                "usedMB": int(vm.used / (1024 * 1024)),
                "totalMB": int(vm.total / (1024 * 1024)),
                "capturedAt": iso_now(),
            }
            await websocket.send_text(json.dumps(payload))

            if random.random() < 0.05:
                raise RuntimeError("Simulated WebSocket send error")

            await asyncio.sleep(1.5)
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(exc),
            })
        finally:
            await websocket.close(code=1011)