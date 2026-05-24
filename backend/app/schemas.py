from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal


class WorkTypeOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class JournalEntryBase(BaseModel):
    date: date
    work_type_id: int = Field(gt=0)
    volume: Decimal = Field(gt=0)
    unit: str = Field(min_length=1, max_length=50)
    executor_name: str = Field(min_length=2, max_length=255)


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntryUpdate(JournalEntryBase):
    pass


class JournalEntryOut(JournalEntryBase):
    id: int
    work_type: WorkTypeOut

    model_config = {"from_attributes": True}
