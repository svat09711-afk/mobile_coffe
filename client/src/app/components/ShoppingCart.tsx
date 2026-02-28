import { X, Minus, Plus, ShoppingCart as CartIcon, Trash2 } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
}

export function ShoppingCart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }: ShoppingCartProps) {
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CartIcon className="w-6 h-6 text-amber-700" />
            <h2 className="text-2xl font-bold text-gray-800">Корзина</h2>
            {totalItems > 0 && (
              <span className="bg-amber-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <CartIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Корзина пуста</p>
              <p className="text-gray-400 text-sm mt-2">Добавьте кофе, чтобы начать заказ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-amber-700 font-bold">{item.price} ₽</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-1.5 bg-white hover:bg-amber-100 rounded-full transition-colors border border-gray-200"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <span className="w-8 text-center font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 bg-white hover:bg-amber-100 rounded-full transition-colors border border-gray-200"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-amber-700">{totalPrice} ₽</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
