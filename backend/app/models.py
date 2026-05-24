from sqlalchemy import Column, Integer, String, Date, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from .database import Base


class WorkType(Base):
    __tablename__ = "work_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)

    entries = relationship("JournalEntry", back_populates="work_type")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    work_type_id = Column(Integer, ForeignKey("work_types.id"), nullable=False)
    volume = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(50), nullable=False)
    executor_name = Column(String(255), nullable=False)

    work_type = relationship("WorkType", back_populates="entries")
