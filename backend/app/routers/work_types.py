from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import WorkType
from ..schemas import WorkTypeOut

router = APIRouter(prefix="/work-types", tags=["work-types"])


@router.get("/", response_model=list[WorkTypeOut])
def list_work_types(db: Session = Depends(get_db)):
    return db.query(WorkType).order_by(WorkType.name).all()
