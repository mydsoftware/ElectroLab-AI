"""Pydantic models for component catalog."""
from typing import Any
from pydantic import BaseModel, Field

class Category(BaseModel):
    id: str
    name_fa: str
    name_en: str
    parent_id: str | None = None
    icon: str = ""

class Platform(BaseModel):
    id: str
    name_fa: str
    name_en: str
    family: str
    package: str | None = None
    mcu: str | None = None

class PinDef(BaseModel):
    id: str
    name: str
    function: str | None = None

class Component(BaseModel):
    id: str
    name_fa: str
    name_en: str
    category_id: str
    component_kind: str
    compatible_platforms: list[str] = Field(default_factory=list)
    defaults: dict[str, Any] = Field(default_factory=dict)
    spice: dict[str, Any] | None = None
    breadboard: dict[str, Any] | None = None
    pins: list[PinDef] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    description_fa: str = ""
    datasheet_url: str | None = None
