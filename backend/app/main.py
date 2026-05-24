import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base
from .models import WorkType
from .routers.journal import router as journal_router
from .routers.work_types import router as work_types_router

INITIAL_WORK_TYPES = [
    "Армирование",
    "Бетонирование",
    "Кладка перегородок",
    "Монтаж кровли",
    "Штукатурные работы",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    for attempt in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except Exception:
            if attempt == 9:
                raise
            await asyncio.sleep(2)

    with Session(engine) as db:
        if db.query(WorkType).count() == 0:
            db.add_all([WorkType(name=n) for n in INITIAL_WORK_TYPES])
            db.commit()
    yield


app = FastAPI(title="Malevich — Журнал работ", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(journal_router, prefix="/api")
app.include_router(work_types_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
