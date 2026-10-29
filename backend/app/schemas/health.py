from typing import Literal

from pydantic import BaseModel


class DatabaseHealth(BaseModel):
    status: Literal["connected"]


class HealthData(BaseModel):
    service: str
    version: str
    environment: str
    database: DatabaseHealth
