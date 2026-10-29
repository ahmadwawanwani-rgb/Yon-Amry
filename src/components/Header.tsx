import React from 'react';
import { ServiceCategory } from '../types/travel';

interface HeaderProps {
  activeView: 'home' | 'checkout' | 'confirmation' | 'my_bookings';
  bookingCount: number;
  onSelectCategoryAndScroll: (category: ServiceCategory) => void;
  onNavigateHome: () => void;
  onNavigateMyBookings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  bookingCount,
  onSelectCategoryAndScroll,
  onNavigateHome,
  onNavigateMyBookings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#00224D] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="text-xl font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0084FF] cursor-pointer"
        >
          NusaTrip
        </button>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-200">
          <button
            type="button"
            onClick={() => onSelectCategoryAndScroll('hotel')}
            className="hover:text-white hover:underline underline-offset-8 decoration-[#0084FF] decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Hotel
          </button>
          <button
            type="button"
            onClick={() => onSelectCategoryAndScroll('flight')}
            className="hover:text-white hover:underline underline-offset-8 decoration-[#0084FF] decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Tiket Pesawat
          </button>
          <button
            type="button"
            onClick={() => onSelectCategoryAndScroll('train')}
            className="hover:text-white hover:underline underline-offset-8 decoration-[#F59E0B] decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Kereta Whoosh
          </button>
          <button
            type="button"
            onClick={() => onSelectCategoryAndScroll('car_rental')}
            className="hover:text-white hover:underline underline-offset-8 decoration-[#0084FF] decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Transportasi
          </button>
          <button
            type="button"
            onClick={() => onSelectCategoryAndScroll('attraction')}
            className="hover:text-white hover:underline underline-offset-8 decoration-[#0084FF] decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Atraksi
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNavigateMyBookings}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              activeView === 'my_bookings'
                ? 'bg-[#F59E0B] text-[#00224D]'
                : 'bg-[#0084FF] hover:bg-[#006CE0] text-white'
            }`}
          >
            {bookingCount > 0 ? `Pesanan Saya (${bookingCount})` : 'Cek Pesanan'}
          </button>
        </div>
      </div>
    </header>
  );
};
