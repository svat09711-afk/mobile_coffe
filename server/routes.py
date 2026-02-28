from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from jose import jwt

from database import get_db
from models import Coffee, Order, OrderItem
from schemas import (
    CoffeeCreate,
    CoffeeResponse,
    CoffeeUpdate,
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
)
from auth import (
    authenticate_user,
    create_access_token,
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
    ALGORITHM,
)

router = APIRouter()


# Auth endpoints
class Token(BaseModel):
    access_token: str
    token_type: str


@router.post("/auth/login", response_model=Token)
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    """Authenticate user and return JWT token."""
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me")
async def get_current_user(token: str = Depends(lambda: None)):
    """Verify current user token."""
    # Token is extracted from Authorization header by dependency
    pass


async def get_current_user_from_token(authorization: Optional[str] = None) -> dict:
    """Extract and validate JWT token from Authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"username": username}


# Coffee endpoints
@router.get("/coffees", response_model=List[CoffeeResponse])
async def get_all_coffees(db: AsyncSession = Depends(get_db)):
    """Get all coffee products."""
    result = await db.execute(select(Coffee))
    coffees = result.scalars().all()
    return coffees


@router.get("/coffees/{coffee_id}", response_model=CoffeeResponse)
async def get_coffee(coffee_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific coffee by ID."""
    result = await db.execute(select(Coffee).where(Coffee.id == coffee_id))
    coffee = result.scalar_one_or_none()
    
    if not coffee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coffee with id {coffee_id} not found"
        )
    return coffee


@router.post("/coffees", response_model=CoffeeResponse, status_code=status.HTTP_201_CREATED)
async def create_coffee(
    coffee: CoffeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Create a new coffee product. Requires authentication."""
    db_coffee = Coffee(
        name=coffee.name,
        composition=coffee.composition,
        recipe=coffee.recipe,
        price=coffee.price,
        image_url=coffee.image_url,
    )
    db.add(db_coffee)
    await db.commit()
    await db.refresh(db_coffee)
    return db_coffee


@router.put("/coffees/{coffee_id}", response_model=CoffeeResponse)
async def update_coffee(
    coffee_id: int,
    coffee_update: CoffeeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Update a coffee product. Requires authentication."""
    result = await db.execute(select(Coffee).where(Coffee.id == coffee_id))
    db_coffee = result.scalar_one_or_none()
    
    if not db_coffee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coffee with id {coffee_id} not found"
        )
    
    update_data = coffee_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_coffee, field, value)
    
    await db.commit()
    await db.refresh(db_coffee)
    return db_coffee


@router.delete("/coffees/{coffee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coffee(
    coffee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Delete a coffee product. Requires authentication."""
    result = await db.execute(select(Coffee).where(Coffee.id == coffee_id))
    db_coffee = result.scalar_one_or_none()
    
    if not db_coffee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coffee with id {coffee_id} not found"
        )
    
    await db.delete(db_coffee)
    await db.commit()
    return None


# Order endpoints
@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: OrderCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new order."""
    db_order = Order(status="pending", total_price=0)
    db.add(db_order)
    await db.flush()
    
    total_price = 0
    for item in order.items:
        coffee_result = await db.execute(
            select(Coffee).where(Coffee.id == item.coffee_id)
        )
        coffee = coffee_result.scalar_one_or_none()
        
        if not coffee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Coffee with id {item.coffee_id} not found"
            )
        
        item_total = coffee.price * item.quantity
        total_price += item_total
        
        db_order_item = OrderItem(
            order_id=db_order.id,
            coffee_id=item.coffee_id,
            quantity=item.quantity,
            price_at_order=coffee.price,
        )
        db.add(db_order_item)
    
    db_order.total_price = total_price
    await db.commit()
    await db.refresh(db_order)
    return db_order


@router.get("/orders", response_model=List[OrderResponse])
async def get_all_orders(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get all orders. Requires authentication."""
    result = await db.execute(select(Order))
    orders = result.scalars().all()
    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get a specific order by ID. Requires authentication."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    return order


@router.patch("/orders/{order_id}", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Update order status. Requires authentication."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    db_order = result.scalar_one_or_none()
    
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    
    db_order.status = status_update.status
    await db.commit()
    await db.refresh(db_order)
    return db_order
