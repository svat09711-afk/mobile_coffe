import { ImageWithFallback } from './figma/ImageWithFallback';

interface CoffeeCardProps {
  name: string;
  composition: string;
  price: number;
  imageUrl: string;
  onCardClick: () => void;
}

export function CoffeeCard({ name, composition, price, imageUrl, onCardClick }: CoffeeCardProps) {
  return (
    <div
      onClick={onCardClick}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full max-w-[280px] cursor-pointer"
    >
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>
        <p className="text-sm text-orange-600 mb-3 leading-relaxed">{composition}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-700">{price} ₽</span>
        </div>
      </div>
    </div>
  );
}