/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { AuthModal } from './components/AuthModal';
import { CheckoutSection } from './components/CheckoutSection';
import { ConfirmationSection } from './components/ConfirmationSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSearchSection } from './components/HeroSearchSection';
import { MyBookingsSection } from './components/MyBookingsSection';
import { PromoAndHighlightsSection } from './components/PromoAndHighlightsSection';
import { SearchResultsSection } from './components/SearchResultsSection';
import { PAYMENT_METHODS, TRAVEL_CATALOG } from './data/travelCatalog';
import { auth } from './lib/firebase';
import {
  AuthenticatedAppUser,
  SocialProviderType,
  ensureUserProfileInFirestore,
  saveBookingToFirestore,
  subscribeUserBookings,
} from './lib/firestoreBookings';
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
  AuthModalMode,
  evaluateBookingAuthGate,
  prefillContactFromUser,
} from './utils/authGate';
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

  // Authentication & Mandatory Gate State
  const [currentUser, setCurrentUser] = useState<AuthenticatedAppUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [authGateMessage, setAuthGateMessage] = useState<string | null>(null);
  const pendingListingRef = useRef<TravelListing | null>(null);

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
    PAYMENT_METHODS[0]
  );

  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Confirmed bookings state
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBooking[]>([]);
  const [activeConfirmedBooking, setActiveConfirmedBooking] = useState<ConfirmedBooking | null>(
    null
  );

  // Track Firebase Auth session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const providerId = fbUser.providerData[0]?.providerId || 'google.com';
        let mappedProvider: SocialProviderType = 'google';
        if (providerId.includes('facebook')) mappedProvider = 'facebook';
        else if (providerId.includes('instagram')) mappedProvider = 'instagram';

        const appUser: AuthenticatedAppUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna NusaTrip',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
          provider: mappedProvider,
          isFirebaseBacked: true,
        };
        setCurrentUser(appUser);
        setContact((prev) => prefillContactFromUser(appUser, prev.phone));
        ensureUserProfileInFirestore(appUser).catch((err) =>
          console.error('Failed syncing user profile:', err)
        );
      } else {
        setCurrentUser((prev) => (prev && !prev.isFirebaseBacked ? prev : null));
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to user's Firestore bookings when authenticated
  useEffect(() => {
    if (!isAuthReady || !currentUser || !currentUser.isFirebaseBacked) {
      return;
    }
    const unsubscribe = subscribeUserBookings(currentUser, (loaded) => {
      setConfirmedBookings(loaded);
    });
    return () => unsubscribe();
  }, [isAuthReady, currentUser]);

  // Extra protection: if user logs out while on checkout, return to home immediately
  useEffect(() => {
    if (isAuthReady && !currentUser && activeView === 'checkout') {
      setActiveView('home');
    }
  }, [isAuthReady, currentUser, activeView]);

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

  const proceedToCheckoutWithListing = (listing: TravelListing) => {
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

  // MANDATORY LOGIN BEFORE BOOKING GATE
  const handleSelectListingForBooking = (listing: TravelListing) => {
    const gate = evaluateBookingAuthGate(currentUser, listing);
    if (!gate.allowed) {
      pendingListingRef.current = gate.pendingListing;
      setAuthGateMessage(gate.reasonMessage);
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    proceedToCheckoutWithListing(listing);
  };

  const handleOpenAuthModal = (mode: AuthModalMode) => {
    pendingListingRef.current = null;
    setAuthGateMessage(null);
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleUserAuthenticated = (user: AuthenticatedAppUser) => {
    setCurrentUser(user);
    setContact((prev) => prefillContactFromUser(user, prev.phone));
    setAuthModalOpen(false);
    setAuthGateMessage(null);

    if (user.isFirebaseBacked) {
      ensureUserProfileInFirestore(user).catch((err) =>
        console.error('Profile sync error:', err)
      );
    }

    // Resume pending booking automatically after login/register!
    if (pendingListingRef.current) {
      const target = pendingListingRef.current;
      pendingListingRef.current = null;
      proceedToCheckoutWithListing(target);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setCurrentUser(null);
    setConfirmedBookings([]);
    if (activeView === 'checkout' || activeView === 'confirmation') {
      setActiveView('home');
    }
  };

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

  const handleApplyPromoQuick = (code: string) => {
    setPromoCodeInput(code);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce auth check on submit as well
    if (!currentUser) {
      pendingListingRef.current = selectedListing;
      setAuthGateMessage(
        'Sesi login diperlukan untuk menyelesaikan pemesanan dan menerbitkan E-Tiket.'
      );
      setAuthModalOpen(true);
      return;
    }

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

    if (currentUser.isFirebaseBacked) {
      try {
        await saveBookingToFirestore(currentUser, newBooking);
      } catch (err) {
        console.error('Failed saving booking to Firestore:', err);
      }
    } else {
      setConfirmedBookings((prev) => [newBooking, ...prev]);
    }

    setActiveConfirmedBooking(newBooking);
    setActiveView('confirmation');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0A2540]">
      <Header
        activeView={activeView}
        bookingCount={confirmedBookings.length}
        currentUser={currentUser}
        onSelectCategoryAndScroll={handleSelectCategoryAndScroll}
        onNavigateHome={() => {
          setActiveView('home');
          window.scrollTo(0, 0);
        }}
        onNavigateMyBookings={() => {
          if (!currentUser) {
            setAuthGateMessage(
              'Silakan masuk ke akun Anda untuk melihat daftar pesanan dan E-Tiket tersimpan.'
            );
            setAuthModalMode('login');
            setAuthModalOpen(true);
            return;
          }
          setActiveView('my_bookings');
          window.scrollTo(0, 0);
        }}
        onOpenAuthModal={handleOpenAuthModal}
        onSignOut={handleSignOut}
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

        {activeView === 'checkout' && currentUser && (
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

      <AuthModal
        isOpen={authModalOpen}
        mode={authModalMode}
        gateMessage={authGateMessage}
        onChangeMode={setAuthModalMode}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthGateMessage(null);
        }}
        onAuthenticated={handleUserAuthenticated}
      />
    </div>
  );
}
