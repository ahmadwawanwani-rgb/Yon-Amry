import React, { useState } from 'react';
import { Building2, Car, Compass, Plane, TrainFront, Bus } from 'lucide-react';
import { ServiceCategory } from '../types/travel';

interface TravelImageProps {
  src?: string;
  alt: string;
  category?: ServiceCategory;
  className?: string;
}

export const TravelImage: React.FC<TravelImageProps> = ({
  src,
  alt,
  category = 'hotel',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  const renderFallbackIcon = () => {
    switch (category) {
      case 'flight':
        return <Plane className="w-8 h-8 text-[#0084FF]" aria-hidden="true" />;
      case 'train':
        return <TrainFront className="w-8 h-8 text-[#F59E0B]" aria-hidden="true" />;
      case 'bus':
        return <Bus className="w-8 h-8 text-[#0084FF]" aria-hidden="true" />;
      case 'airport_transfer':
      case 'car_rental':
        return <Car className="w-8 h-8 text-[#0084FF]" aria-hidden="true" />;
      case 'attraction':
        return <Compass className="w-8 h-8 text-[#F59E0B]" aria-hidden="true" />;
      default:
        return <Building2 className="w-8 h-8 text-[#0084FF]" aria-hidden="true" />;
    }
  };

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#00224D] via-[#0A2540] to-[#133659] text-white p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="mb-2 opacity-90">{renderFallbackIcon()}</div>
        <span className="text-xs font-medium text-slate-300 line-clamp-2 max-w-[200px]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
};
