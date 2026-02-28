import { useState, useEffect } from 'react';
import { CoffeeCard } from './components/CoffeeCard';
import { CoffeeDetailModal } from './components/CoffeeDetailModal';
import { ShoppingCart } from './components/ShoppingCart';
import { Coffee as CoffeeIcon, ShoppingCart as CartIcon } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { fetchCoffees, createOrder, Coffee } from './api';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function App() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCoffees();
  }, []);

  const loadCoffees = async () => {
    try {
      const data = await fetchCoffees();
      setCoffees(data);
    } catch (error) {
      console.error('Failed to load coffees:', error);
      toast.error('Failed to load coffee menu', {
        description: 'Please make sure the server is running',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (coffee: Coffee) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === coffee.id);

      if (existingItem) {
        toast.success(`${coffee.name} added to cart`, {
          description: `Quantity: ${existingItem.quantity + 1}`,
          duration: 2000,
        });
        return prevItems.map((item) =>
          item.id === coffee.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      toast.success(`${coffee.name} added to cart`, {
        description: 'Item successfully added',
        duration: 2000,
      });
      return [...prevItems, { ...coffee, quantity: 1 }];
    });
  };

  const handleCardClick = (coffee: Coffee) => {
    setSelectedCoffee(coffee);
    setIsDetailModalOpen(true);
  };

  const handleAddToCartFromModal = () => {
    if (selectedCoffee) {
      addToCart(selectedCoffee);
      setIsDetailModalOpen(false);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    try {
      const orderItems = cartItems.map((item) => ({
        coffee_id: item.id,
        quantity: item.quantity,
      }));
      
      await createOrder(orderItems);
      
      toast.success('Order placed successfully!', {
        description: 'Your coffee is being prepared',
        duration: 3000,
      });
      
      setCartItems([]);
      setIsCartOpen(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to place order', {
        description: 'Please try again later',
        duration: 3000,
      });
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <CoffeeIcon className="w-16 h-16 text-amber-700 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <Toaster position="top-center" richColors />
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4 relative">
            <CoffeeIcon className="w-12 h-12 text-amber-700" />
            <h1 className="text-5xl font-bold text-gray-800">Coffee</h1>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="absolute right-4 bg-white hover:bg-amber-50 p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-2"
            >
              <CartIcon className="w-6 h-6 text-amber-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          <p className="text-gray-600 text-lg">Choose your favorite coffee</p>
        </div>

        {/* Coffee Cards Grid */}
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {coffees.map((coffee) => (
            <CoffeeCard
              key={coffee.id}
              name={coffee.name}
              composition={coffee.composition}
              price={coffee.price}
              imageUrl={coffee.image_url}
              onCardClick={() => handleCardClick(coffee)}
            />
          ))}
        </div>

        {/* Admin Link */}
        <div className="text-center mt-12">
          <a
            href="/admin"
            className="text-amber-600 hover:text-amber-700 text-sm"
          >
            Admin Panel
          </a>
        </div>
      </div>

      {/* Coffee Detail Modal */}
      <CoffeeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        coffee={selectedCoffee}
        onAddToCart={handleAddToCartFromModal}
      />

      {/* Shopping Cart */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
