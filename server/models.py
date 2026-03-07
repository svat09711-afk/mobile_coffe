from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class Coffee(Base):
    __tablename__ = "coffees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    composition = Column(String(255), nullable=False)
    recipe = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)
    image_url = Column(String(500), nullable=False)
    
    order_items = relationship("OrderItem", back_populates="coffee", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Coffee(id={self.id}, name='{self.name}', price={self.price})>"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(50), default="pending", nullable=False)
    total_price = Column(Integer, default=0, nullable=False)
    
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Order(id={self.id}, status='{self.status}', total={self.total_price})>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    coffee_id = Column(Integer, ForeignKey("coffees.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    price_at_order = Column(Integer, nullable=False)
    
    order = relationship("Order", back_populates="items")
    coffee = relationship("Coffee", back_populates="order_items")

    def __repr__(self):
        return f"<OrderItem(id={self.id}, coffee_id={self.coffee_id}, quantity={self.quantity})>"
