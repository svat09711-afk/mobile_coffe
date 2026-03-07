from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


class CoffeeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    composition: str = Field(..., min_length=1, max_length=255)
    recipe: str
    price: int = Field(..., gt=0)
    image_url: str = Field(..., min_length=1, max_length=500)


class CoffeeCreate(CoffeeBase):
    pass


class CoffeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    composition: Optional[str] = Field(None, min_length=1, max_length=255)
    recipe: Optional[str] = None
    price: Optional[int] = Field(None, gt=0)
    image_url: Optional[str] = Field(None, min_length=1, max_length=500)


class CoffeeResponse(CoffeeBase):
    id: int

    class Config:
        from_attributes = True


class OrderItemBase(BaseModel):
    coffee_id: int
    quantity: int = Field(..., ge=1)


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    price_at_order: int

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1, max_length=50)


class OrderResponse(BaseModel):
    id: int
    created_at: datetime
    status: str
    total_price: int
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
