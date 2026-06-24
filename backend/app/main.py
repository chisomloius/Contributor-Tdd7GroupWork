from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.database import init_db
from .routers import dashboard, docs, logs, users

app = FastAPI(title="SassyDoc Generator", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users)
app.include_router(dashboard)
app.include_router(docs)
app.include_router(logs)

@app.get("/", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event() -> None:
    init_db()
