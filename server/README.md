# Coffee Shop Server

FastAPI + SQLAlchemy + SQLite backend for the coffee shop application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize the database with sample data:
```bash
python init_db.py
```

3. Run the server:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Public Endpoints
- `GET /api/v1/coffees` - Get all coffee products
- `GET /api/v1/coffees/{id}` - Get a specific coffee
- `POST /api/v1/orders` - Create a new order

### Protected Endpoints (Require Authentication)
- `POST /api/v1/coffees` - Create a new coffee product
- `PUT /api/v1/coffees/{id}` - Update a coffee product
- `DELETE /api/v1/coffees/{id}` - Delete a coffee product
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/{id}` - Get a specific order
- `PATCH /api/v1/orders/{id}` - Update order status

### Authentication
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Verify current token

## Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Change these credentials in production!** Edit `auth.py` to modify.

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

The SQLite database file (`coffee_shop.db`) will be created automatically in the server directory.
