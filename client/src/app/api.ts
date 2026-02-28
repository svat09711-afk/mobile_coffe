const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface Coffee {
  id: number;
  name: string;
  composition: string;
  recipe: string;
  price: number;
  image_url: string;
}

export interface OrderItem {
  id: number;
  coffee_id: number;
  quantity: number;
  price_at_order: number;
}

export interface Order {
  id: number;
  created_at: string;
  status: string;
  total_price: number;
  items: OrderItem[];
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// Coffee API
export async function fetchCoffees(): Promise<Coffee[]> {
  const response = await fetch(`${API_BASE_URL}/coffees`);
  if (!response.ok) {
    throw new Error('Failed to fetch coffees');
  }
  return response.json();
}

export async function fetchCoffee(id: number): Promise<Coffee> {
  const response = await fetch(`${API_BASE_URL}/coffees/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch coffee ${id}`);
  }
  return response.json();
}

export async function createCoffee(coffee: Omit<Coffee, 'id'>): Promise<Coffee> {
  const response = await fetch(`${API_BASE_URL}/coffees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coffee),
  });
  if (!response.ok) {
    throw new Error('Failed to create coffee');
  }
  return response.json();
}

export async function updateCoffee(id: number, coffee: Partial<Coffee>): Promise<Coffee> {
  const response = await fetch(`${API_BASE_URL}/coffees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coffee),
  });
  if (!response.ok) {
    throw new Error('Failed to update coffee');
  }
  return response.json();
}

export async function deleteCoffee(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/coffees/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete coffee');
  }
}

// Order API
export async function createOrder(items: { coffee_id: number; quantity: number }[]): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  return response.json();
}

export async function fetchOrders(token: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

// Coffee API (protected)
export async function createCoffeeAdmin(coffee: Omit<Coffee, 'id'>, token: string): Promise<Coffee> {
  const response = await fetch(`${API_BASE_URL}/coffees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(coffee),
  });
  if (!response.ok) {
    throw new Error('Failed to create coffee');
  }
  return response.json();
}

export async function updateCoffeeAdmin(id: number, coffee: Partial<Coffee>, token: string): Promise<Coffee> {
  const response = await fetch(`${API_BASE_URL}/coffees/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(coffee),
  });
  if (!response.ok) {
    throw new Error('Failed to update coffee');
  }
  return response.json();
}

export async function deleteCoffeeAdmin(id: number, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/coffees/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete coffee');
  }
}

// Auth API
export async function login(username: string, password: string): Promise<AuthToken> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  
  return response.json();
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}
