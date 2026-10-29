from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class BootstrapBody(BaseModel):
    model_config = ConfigDict(extra="forbid", json_schema_extra={
        "examples": [{"first_name": "Ada", "last_name": "James", "phone": "+2348012345678"}],
    })
    first_name: str | None = Field(None, max_length=100, description="Optional initial given name; ignored for an existing profile.")
    last_name: str | None = Field(None, max_length=100, description="Optional initial family name.")
    phone: str | None = Field(None, max_length=40, description="Optional contact phone; not an authentication credential.")


class ProfileData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str = Field(description="Neon identity subject. Treat as an opaque string.")
    email: str = Field(description="Verified identity email read from Neon, never from the request body.")
    name: str = Field(description="Display name supplied by the managed identity provider.")
    first_name: str | None = Field(description="Optional initial given name; null if none was supplied.")
    last_name: str | None = Field(description="Optional initial family name; null if none was supplied.")
    phone: str | None = Field(description="Optional contact number; null if none was supplied.")
    role: Literal["customer", "admin", "super_admin"] = Field(description="Application database role; clients cannot set it.")
    created_at: datetime = Field(description="UTC creation timestamp, ISO 8601.")
    updated_at: datetime = Field(description="UTC last update timestamp, ISO 8601.")
