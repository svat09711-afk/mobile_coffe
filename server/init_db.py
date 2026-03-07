import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

from database import DATABASE_URL, Base
from models import Coffee, User
from auth import get_password_hash

COFFEES_DATA = [
    {
        "id": 1,
        "name": "Американо",
        "composition": "Эспрессо с горячей водой",
        "recipe": "1. Приготовьте двойную порцию эспрессо (60 мл)\n2. Нагрейте 90-120 мл воды до 92-96°C\n3. Влейте горячую воду в чашку\n4. Добавьте эспрессо\n5. По желанию добавьте сахар",
        "price": 150,
        "image_url": "https://images.unsplash.com/photo-1622465413095-2ee67c192522?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbm8lMjBjb2ZmZWUlMjBjdXB8ZW58MXx8fHwxNzcwOTY1MjI3fDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        "id": 2,
        "name": "Капучино",
        "composition": "Эспрессо, молоко, молочная пена",
        "recipe": "1. Приготовьте порцию эспрессо (30 мл)\n2. Нагрейте 150 мл молока до 60-65°C\n3. Взбейте молоко капучинатором до образования плотной пены\n4. Влейте эспрессо в чашку\n5. Добавьте молоко с пеной\n6. Украсьте корицей по желанию",
        "price": 180,
        "image_url": "https://images.unsplash.com/photo-1643909618082-d916d591c2a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBwdWNjaW5vJTIwY29mZmVlJTIwZm9hbXxlbnwxfHx8fDE3NzEwNDAzMzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        "id": 3,
        "name": "Раф",
        "composition": "Эспрессо, сливки, ванильный сахар",
        "recipe": "1. Приготовьте порцию эспрессо (30 мл)\n2. Добавьте 100 мл сливок 10-15%\n3. Добавьте 1-2 чайные ложки ванильного сахара\n4. Взбейте все ингредиенты капучинатором\n5. Нагрейте смесь до 60-65°C во время взбивания\n6. Перелейте в чашку",
        "price": 220,
        "image_url": "https://images.unsplash.com/photo-1605361866435-2ab38a637a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjcmVhbSUyMHZhbmlsbGF8ZW58MXx8fHwxNzcxMDU0MTM0fDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        "id": 4,
        "name": "Кофе с шоколадом",
        "composition": "Эспрессо, горячий шоколад, молоко",
        "recipe": "1. Приготовьте порцию эспрессо (30 мл)\n2. Растопите 30 г темного шоколада\n3. Нагрейте 100 мл молока до 60°C\n4. Смешайте шоколад с молоком\n5. Добавьте эспрессо\n6. Взбейте венчиком\n7. Украсьте тертым шоколадом",
        "price": 200,
        "image_url": "https://images.unsplash.com/photo-1619286310410-a95de97b0aec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBtb2NoYSUyMGNvZmZlZXxlbnwxfHx8fDE3NzEwNTQxMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        "id": 5,
        "name": "Латте",
        "composition": "Эспрессо, молоко, тонкий слой пены",
        "recipe": "1. Приготовьте порцию эспрессо (30 мл)\n2. Нагрейте 200 мл молока до 60-65°C\n3. Взбейте молоко до образования легкой пены\n4. Влейте эспрессо в высокий стакан\n5. Медленно добавьте молоко\n6. Сверху добавьте тонкий слой пены\n7. Создайте латте-арт по желанию",
        "price": 190,
        "image_url": "https://images.unsplash.com/photo-1631155989916-4aabcabcce8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGNvZmZlZSUyMG1pbGt8ZW58MXx8fHwxNzcwOTY1OTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
]

USERS_DATA = [
    {
        "username": "admin",
        "email": "admin@coffee.com",
        "password": "admin123"
    },
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "password123"
    },
    {
        "username": "jane_smith",
        "email": "jane@example.com",
        "password": "password123"
    },
]


async def init_db():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as session:
        for coffee_data in COFFEES_DATA:
            result = await session.execute(select(Coffee).where(Coffee.id == coffee_data["id"]))
            existing = result.scalar_one_or_none()

            if not existing:
                coffee = Coffee(**coffee_data)
                session.add(coffee)
                print(f"Added: {coffee_data['name']}")
            else:
                print(f"Exists: {coffee_data['name']}")

        for user_data in USERS_DATA:
            result = await session.execute(select(User).where(User.username == user_data["username"]))
            existing_user = result.scalar_one_or_none()

            if not existing_user:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"])
                )
                session.add(user)
                print(f"Added user: {user_data['username']}")
            else:
                # Update password if changed
                existing_user.hashed_password = get_password_hash(user_data["password"])
                print(f"Updated password for: {user_data['username']}")

        await session.commit()

    await engine.dispose()
    print("\nDatabase initialized successfully!")


if __name__ == "__main__":
    asyncio.run(init_db())
