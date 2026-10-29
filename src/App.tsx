/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { CheckoutSection } from './components/CheckoutSection';
import { ConfirmationSection } from './components/ConfirmationSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSearchSection } from './components/HeroSearchSection';
import { MyBookingsSection } from './components/MyBookingsSection';
import { PromoAndHighlightsSection } from './components/PromoAndHighlightsSection';
import { SearchResultsSection } from './components/SearchResultsSection';
import { PAYMENT_METHODS, TRAVEL_CATALOG } from './data/travelCatalog';
import {
  BookingAddOns,
  ConfirmedBooking,
  ContactDetails,
  GuestDetails,
  HotelSubFilter,
  PaymentMethodOption,
  SearchCriteria,
  ServiceCategory,
  TravelListing,
} from './types/travel';
import {
  ValidationErrors,
  calculatePriceBreakdown,
  filterTravelListings,
  generateBookingIdentifiers,
  validateBookingInput,
} from './utils/bookingLogic';

type ActiveView = 'home' | 'checkout' | 'confirmation' | 'my_bookings';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // Search state
  const [criteria, setCriteria] = useState<SearchCriteria>({
    category: 'hotel',
    hotelSubFilter: 'Semua',
    origin: '',
    destination: '',
    checkInOrDepartDate: '2026-11-14',
    checkOutDate: '2026-11-16',
    quantity: 1,
    keyword: '',
  });

  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating_desc'>(
    'recommended'
  );

  // Selected listing for checkout
  const [selectedListing, setSelectedListing] = useState<TravelListing>(TRAVEL_CATALOG[0]);

  // Checkout form state
  const [contact, setContact] = useState<ContactDetails>({
    fullName: '',
    phone: '',
    email: '',
  });

  const [guest, setGuest] = useState<GuestDetails>({
    sameAsContact: true,
    guestFullName: '',
    idType: 'KTP',
    idNumber: '',
  });

  const [addOns, setAddOns] = useState<BookingAddOns>({
    travelInsurance: false,
    specialRequests: [],
    customNote: '',
  });

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodOption | null>(
    PAYMENT_METHODS[0] // Default TPayLater selected for smooth UX, user can switch to any of 19 partners
  );

  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Confirmed bookings state
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBooking[]>([]);
  const [activeConfirmedBooking, setActiveConfirmedBooking] = useState<ConfirmedBooking | null>(
    null
  );

  const filteredListings = useMemo(
    () => filterTravelListings(TRAVEL_CATALOG, criteria, sortBy),
    [criteria, sortBy]
  );

  const pricing = useMemo(
    () =>
      calculatePriceBreakdown({
        listing: selectedListing,
        criteria,
        addOns,
        paymentMethod: selectedPayment,
        promoCodeInput,
      }),
    [selectedListing, criteria, addOns, selectedPayment, promoCodeInput]
  );

  const handleUpdateCriteria = (patch: Partial<SearchCriteria>) => {
    setCriteria((prev) => ({ ...prev, ...patch }));
  };

  const handleSelectCategoryAndScroll = (category: ServiceCategory) => {
    setCriteria((prev) => ({
      ...prev,
      category,
      hotelSubFilter: 'Semua',
      destination: '',
      keyword: '',
    }));
    setActiveView('home');
    setTimeout(() => {
      const el = document.getElementById('hasil-pencarian');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView('home');
    const el = document.getElementById('hasil-pencarian');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectListingForBooking = (listing: TravelListing) => {
    setSelectedListing(listing);
    setAddOns({
      travelInsurance: false,
      specialRequests: [],
      customNote: '',
    });
    setValidationErrors({});
    setActiveView('checkout');
    window.scrollTo(0, 0);
  };

  const handleApplyPromoQuick = (code: string) => {
    setPromoCodeInput(code);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateBookingInput({
      contact,
      guest,
      selectedPayment,
    });

    if (Object.keys(errors).length > 0 || !selectedPayment) {
      setValidationErrors(errors);
      window.scrollTo(0, 0);
      return;
    }

    setValidationErrors({});
    const { bookingCode, paymentReference } = generateBookingIdentifiers(selectedPayment);
    const newBooking: ConfirmedBooking = {
      bookingCode,
      createdAt: new Date().toISOString(),
      listing: selectedListing,
      searchCriteria: { ...criteria, quantity: pricing.quantity },
      contact: { ...contact },
      guest: { ...guest },
      addOns: { ...addOns },
      paymentMethod: selectedPayment,
      paymentReference,
      pricing,
      status: 'LUNAS & TERKONFIRMASI',
    };

    setConfirmedBookings((prev) => [newBooking, ...prev]);
    setActiveConfirmedBooking(newBooking);
    setActiveView('confirmation');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0A2540]">
      <Header
        activeView={activeView}
        bookingCount={confirmedBookings.length}
        onSelectCategoryAndScroll={handleSelectCategoryAndScroll}
        onNavigateHome={() => {
          setActiveView('home');
          window.scrollTo(0, 0);
        }}
        onNavigateMyBookings={() => {
          setActiveView('my_bookings');
          window.scrollTo(0, 0);
        }}
      />

      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <HeroSearchSection
              criteria={criteria}
              onUpdateCriteria={handleUpdateCriteria}
              onSearchSubmit={handleSearchSubmit}
              onApplyPromoQuick={handleApplyPromoQuick}
            />

            <SearchResultsSection
              listings={filteredListings}
              criteria={criteria}
              sortBy={sortBy}
              onChangeSort={setSortBy}
              onUpdateHotelFilter={(filter: HotelSubFilter) =>
                handleUpdateCriteria({ hotelSubFilter: filter })
              }
              onResetFilters={() =>
                handleUpdateCriteria({
                  destination: '',
                  origin: '',
                  keyword: '',
                  hotelSubFilter: 'Semua',
                })
              }
              onSelectListing={handleSelectListingForBooking}
            />

            <PromoAndHighlightsSection
              copiedPromoCode={promoCodeInput || null}
              onApplyPromoCode={handleApplyPromoQuick}
              onQuickExploreWhoosh={() => handleSelectCategoryAndScroll('train')}
              onSelectFeaturedListing={handleSelectListingForBooking}
              onSwitchCategory={handleSelectCategoryAndScroll}
            />
          </>
        )}

        {activeView === 'checkout' && (
          <CheckoutSection
            listing={selectedListing}
            criteria={criteria}
            contact={contact}
            guest={guest}
            addOns={addOns}
            selectedPayment={selectedPayment}
            promoCodeInput={promoCodeInput}
            pricing={pricing}
            validationErrors={validationErrors}
            onUpdateContact={(patch) => {
              setContact((prev) => ({ ...prev, ...patch }));
              if (Object.keys(validationErrors).length > 0) setValidationErrors({});
            }}
            onUpdateGuest={(patch) => {
              setGuest((prev) => ({ ...prev, ...patch }));
              if (Object.keys(validationErrors).length > 0) setValidationErrors({});
            }}
            onUpdateAddOns={(patch) => setAddOns((prev) => ({ ...prev, ...patch }))}
            onUpdateQuantity={(qty) => handleUpdateCriteria({ quantity: qty })}
            onSelectPayment={(method) => {
              setSelectedPayment(method);
              if (validationErrors.paymentMethod) {
                setValidationErrors((prev) => ({ ...prev, paymentMethod: undefined }));
              }
            }}
            onChangePromoInput={setPromoCodeInput}
            onBackToResults={() => {
              setActiveView('home');
              window.scrollTo(0, 0);
            }}
            onSubmitBooking={handleSubmitBooking}
          />
        )}

        {activeView === 'confirmation' && activeConfirmedBooking && (
          <ConfirmationSection
            booking={activeConfirmedBooking}
            onExploreAgain={() => {
              setActiveView('home');
              window.scrollTo(0, 0);
            }}
            onViewAllBookings={() => {
              setActiveView('my_bookings');
              window.scrollTo(0, 0);
            }}
          />
        )}

        {activeView === 'my_bookings' && (
          <MyBookingsSection
            bookings={confirmedBookings}
            onSelectBookingDetail={(booking) => {
              setActiveConfirmedBooking(booking);
              setActiveView('confirmation');
              window.scrollTo(0, 0);
            }}
            onNavigateHome={() => {
              setActiveView('home');
              window.scrollTo(0, 0);
            }}
          />
        )}
      </main>

      <Footer onSelectCategory={handleSelectCategoryAndScroll} />
    </div>
  );
}
