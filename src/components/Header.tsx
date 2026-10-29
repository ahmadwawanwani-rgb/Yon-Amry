import React from 'react';
import { LogOut, UserCheck } from 'lucide-react';
import { AuthenticatedAppUser } from '../lib/firestoreBookings';
import { ServiceCategory } from '../types/travel';
import { AuthModalMode, deriveProviderLabel } from '../utils/authGate';

interface HeaderProps {
  activeView: 'home' | 'checkout' | 'confirmation' | 'my_bookings';
  bookingCount: number;
  currentUser: AuthenticatedAppUser | null;
  onSelectCategoryAndScroll: (category: ServiceCategory) => void;
  onNavigateHome: () => void;
  onNavigateMyBookings: () => void;
  onOpenAuthModal: (mode: AuthModalMode) => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  bookingCount,
  currentUser,
  onSelectCategoryAndScroll,
  onNavigateHome,
  onNavigateMyBookings,
  onOpenAuthModal,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#00224D] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="text-xl font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0084FF] cursor-pointer"
        >
          NusaTrip
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-200"
        >
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
            onClick={onNavigateMyBookings}
            className={`hover:text-white hover:underline underline-offset-8 decoration-[#F59E0B] decoration-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'my_bookings' ? 'text-[#FBBF24] font-semibold' : ''
            }`}
          >
            {bookingCount > 0 ? `Pesanan Saya (${bookingCount})` : 'Pesanan Saya'}
          </button>
        </nav>

        {/* Zone 3: Auth Actions (Login & Daftar when signed out; Account & Keluar when signed in) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!currentUser ? (
            <>
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white border border-white/25 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal('register')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold bg-[#0084FF] hover:bg-[#006CE0] text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Daftar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onNavigateMyBookings}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title={`Masuk via ${deriveProviderLabel(currentUser.provider)}`}
              >
                <UserCheck className="w-4 h-4 text-[#FBBF24] shrink-0" aria-hidden="true" />
                <span className="max-w-[120px] truncate">{currentUser.displayName}</span>
                {bookingCount > 0 && (
                  <span className="font-mono text-[#FBBF24] tabular-nums">({bookingCount})</span>
                )}
              </button>
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Keluar akun"
                className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
