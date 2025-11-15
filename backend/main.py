from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pc_status.ping import router as ping_router
from pc_status.cpu import router as cpu_router
from pc_status.memory_ws import router as memory_ws_router
from pc_status.config import API_PREFIX, WS_PREFIX

app = FastAPI(title="PC Status Backend")

origins = [
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ping_router, prefix=API_PREFIX)
app.include_router(cpu_router, prefix=API_PREFIX)
app.include_router(memory_ws_router, prefix=WS_PREFIX)
