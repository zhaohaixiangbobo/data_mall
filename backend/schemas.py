from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class AppBase(BaseModel):
    name: str
    unit: str
    domain: str
    description: Optional[str] = None
    img_url: Optional[str] = None
    link: Optional[str] = None
    features: Optional[str] = None
    visits: int = 0
    data_amount: int = 0

class AppCreate(AppBase):
    pass

class App(AppBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
