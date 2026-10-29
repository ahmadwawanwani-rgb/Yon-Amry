import { SearchCriteria, TravelListing } from '../types/travel';
import { AuthenticatedAppUser } from '../lib/firestoreBookings';

export type AuthModalMode = 'login' | 'register';

export interface AuthGateResult {
  allowed: boolean;
  shouldOpenAuthModal: boolean;
  reasonMessage: string | null;
  pendingListing: TravelListing | null;
}

/**
 * Pure gate function ensuring users MUST log in or register before proceeding to checkout/booking.
 */
export function evaluateBookingAuthGate(
  user: AuthenticatedAppUser | null,
  targetListing: TravelListing
): AuthGateResult {
  if (!user) {
    return {
      allowed: false,
      shouldOpenAuthModal: true,
      reasonMessage: `Silakan masuk atau daftar akun terlebih dahulu sebelum memesan "${targetListing.title}".`,
      pendingListing: targetListing,
    };
  }

  return {
    allowed: true,
    shouldOpenAuthModal: false,
    reasonMessage: null,
    pendingListing: null,
  };
}

export function deriveProviderLabel(provider: AuthenticatedAppUser['provider']): string {
  switch (provider) {
    case 'google':
      return 'Google';
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
  }
}

export function prefillContactFromUser(
  user: AuthenticatedAppUser,
  existingPhone: string
): { fullName: string; email: string; phone: string } {
  return {
    fullName: user.displayName || '',
    email: user.email || '',
    phone: existingPhone || '',
  };
}

export function hasPendingBookingToResume(
  user: AuthenticatedAppUser | null,
  pendingListing: TravelListing | null,
  _criteria?: SearchCriteria
): boolean {
  return Boolean(user && pendingListing);
}
