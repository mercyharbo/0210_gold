from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, Field

TData = TypeVar("TData")


class ErrorDetail(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    code: str
    message: str
    field_errors: dict[str, list[str]] | None = Field(
        default=None,
        alias="fieldErrors",
    )


class ApiSuccess(BaseModel, Generic[TData]):
    success: Literal[True] = True
    status: int
    data: TData
    message: str | None = None


class ApiFailure(BaseModel):
    success: Literal[False] = False
    status: int
    error: ErrorDetail
