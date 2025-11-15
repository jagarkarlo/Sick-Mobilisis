from datetime import datetime, timezone
import random

API_PREFIX = "/api"
WS_PREFIX = "/ws"

def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()

class SimulatedError(Exception):
    def __init__(self, message: str, code: int):
        super().__init__(message)
        self.code = code

def sometimes_fail(every_n: int) -> None:
    if every_n <= 0:
        return
    if random.randint(1, every_n) == 1:
        raise SimulatedError("Simulated error", 500)
