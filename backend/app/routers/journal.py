from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc
from datetime import date as DateType
from typing import Optional
from ..database import get_db
from ..models import JournalEntry
from ..schemas import JournalEntryCreate, JournalEntryUpdate, JournalEntryOut

router = APIRouter(prefix="/journal", tags=["journal"])


def _load(db: Session, entry_id: int) -> JournalEntry:
    return (
        db.query(JournalEntry)
        .options(joinedload(JournalEntry.work_type))
        .filter(JournalEntry.id == entry_id)
        .first()
    )


@router.get("/", response_model=list[JournalEntryOut])
def list_entries(
    date_from: Optional[DateType] = Query(None),
    date_to: Optional[DateType] = Query(None),
    sort: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    q = db.query(JournalEntry).options(joinedload(JournalEntry.work_type))
    if date_from:
        q = q.filter(JournalEntry.date >= date_from)
    if date_to:
        q = q.filter(JournalEntry.date <= date_to)
    order_fn = desc if sort == "desc" else asc
    return q.order_by(order_fn(JournalEntry.date)).all()


@router.post("/", response_model=JournalEntryOut, status_code=201)
def create_entry(data: JournalEntryCreate, db: Session = Depends(get_db)):
    entry = JournalEntry(**data.model_dump())
    db.add(entry)
    db.commit()
    return _load(db, entry.id)


@router.put("/{entry_id}", response_model=JournalEntryOut)
def update_entry(entry_id: int, data: JournalEntryUpdate, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(404, "Запись не найдена")
    for k, v in data.model_dump().items():
        setattr(entry, k, v)
    db.commit()
    return _load(db, entry.id)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(404, "Запись не найдена")
    db.delete(entry)
    db.commit()
