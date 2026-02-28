import { X, ShoppingCart, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Coffee } from '../api';

interface CoffeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  coffee: Coffee | null;
  onAddToCart: () => void;
}

export function CoffeeDetailModal({ isOpen, onClose, coffee, onAddToCart }: CoffeeDetailModalProps) {
  if (!isOpen || !coffee) return null;

  const handleAddToCart = () => {
    onAddToCart();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Image */}
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <ImageWithFallback
            src={coffee.image_url}
            alt={coffee.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <h2 className="absolute bottom-6 left-6 text-4xl font-bold text-white">
            {coffee.name}
          </h2>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Composition */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Composition</h3>
            <p className="text-orange-600 text-base leading-relaxed">{coffee.composition}</p>
          </div>

          {/* Recipe */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Recipe</h3>
            <pre className="text-gray-600 text-sm whitespace-pre-wrap font-sans">{coffee.recipe}</pre>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Price</p>
              <p className="text-3xl font-bold text-amber-700">{coffee.price} ₽</p>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}