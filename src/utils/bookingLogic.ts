import { PROMO_CODES } from '../data/travelCatalog';
import {
  BookingAddOns,
  ContactDetails,
  GuestDetails,
  PaymentMethodOption,
  PriceBreakdown,
  SearchCriteria,
  TravelListing,
} from '../types/travel';

export const INSURANCE_FEE_PER_QTY = 45000;
export const TAX_AND_SERVICE_RATE = 0.11; // 11% Pajak & Biaya Layanan

export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const absFormatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return rounded < 0 ? `-Rp ${absFormatted}` : `Rp ${absFormatted}`;
}

export function calculateNightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 1 ? diffDays : 1;
}

export function filterTravelListings(
  listings: TravelListing[],
  criteria: SearchCriteria,
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc' = 'recommended'
): TravelListing[] {
  const isRouteBased =
    criteria.category === 'flight' ||
    criteria.category === 'train' ||
    criteria.category === 'bus' ||
    criteria.category === 'airport_transfer';

  const originQuery = isRouteBased ? criteria.origin.trim().toLowerCase() : '';
  const destQuery = [criteria.destination, criteria.keyword]
    .filter(Boolean)
    .join(' ')
    .trim()
    .toLowerCase();

  let filtered = listings.filter((item) => {
    if (item.category !== criteria.category) return false;

    if (criteria.category === 'hotel' && criteria.hotelSubFilter !== 'Semua') {
      if (item.hotelType !== criteria.hotelSubFilter) return false;
    }

    const searchable = `${item.title} ${item.subtitle} ${item.providerOrArea} ${item.highlights.join(' ')}`.toLowerCase();

    if (originQuery.length >= 2) {
      if (!searchable.includes(originQuery)) return false;
    }

    if (destQuery.length > 0) {
      const tokens = destQuery.split(/\s+/).filter((t) => t.length >= 2);
      if (tokens.length > 0) {
        const matchesAny = tokens.some((token) => searchable.includes(token));
        if (!matchesAny) return false;
      }
    }

    return true;
  });

  filtered = [...filtered];
  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => b.basePrice - a.basePrice);
  } else if (sortBy === 'rating_desc') {
    filtered.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  } else {
    // Recommended: prioritize Whoosh in train, promoTag items, then rating
    filtered.sort((a, b) => {
      const aBoost = (a.isWhoosh ? 2 : 0) + (a.promoTag ? 1 : 0);
      const bBoost = (b.isWhoosh ? 2 : 0) + (b.promoTag ? 1 : 0);
      if (bBoost !== aBoost) return bBoost - aBoost;
      return b.rating - a.rating;
    });
  }

  return filtered;
}

export function calculatePriceBreakdown(params: {
  listing: TravelListing;
  criteria: SearchCriteria;
  addOns: BookingAddOns;
  paymentMethod: PaymentMethodOption | null;
  promoCodeInput: string;
}): PriceBreakdown {
  const { listing, criteria, addOns, paymentMethod, promoCodeInput } = params;
  const quantity = Math.max(1, Math.floor(criteria.quantity || 1));

  const nightsOrUnits =
    listing.category === 'hotel' || listing.category === 'car_rental'
      ? calculateNightsBetween(criteria.checkInOrDepartDate, criteria.checkOutDate)
      : 1;

  const subtotal = listing.basePrice * quantity * nightsOrUnits;
  const taxAndServiceFee = Math.round(subtotal * TAX_AND_SERVICE_RATE);
  const insuranceFee = addOns.travelInsurance ? INSURANCE_FEE_PER_QTY * quantity : 0;
  const paymentFee = paymentMethod ? paymentMethod.fee : 0;

  const normalizedPromo = promoCodeInput.trim().toUpperCase();
  const promoRule = normalizedPromo ? PROMO_CODES[normalizedPromo] : undefined;

  let promoDiscount = 0;
  let promoCodeApplied: string | null = null;
  if (promoRule) {
    const rawDiscount = Math.round((subtotal * promoRule.discountPercent) / 100);
    promoDiscount = Math.min(rawDiscount, promoRule.maxDiscount);
    promoCodeApplied = promoRule.code;
  }

  const totalAmount = Math.max(
    0,
    subtotal + taxAndServiceFee + insuranceFee + paymentFee - promoDiscount
  );

  return {
    unitPrice: listing.basePrice,
    quantity,
    nightsOrUnits,
    subtotal,
    taxAndServiceFee,
    insuranceFee,
    paymentFee,
    promoDiscount,
    promoCodeApplied,
    totalAmount,
  };
}

export interface ValidationErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  guestFullName?: string;
  paymentMethod?: string;
}

export function validateBookingInput(params: {
  contact: ContactDetails;
  guest: GuestDetails;
  selectedPayment: PaymentMethodOption | null;
}): ValidationErrors {
  const { contact, guest, selectedPayment } = params;
  const errors: ValidationErrors = {};

  if (!contact.fullName || contact.fullName.trim().length < 3) {
    errors.fullName = 'Masukkan nama lengkap sesuai KTP/Paspor (minimal 3 karakter).';
  }

  const cleanedPhone = contact.phone.replace(/[\s\-()]/g, '');
  if (!/^(\+62|62|0)[0-9]{8,13}$/.test(cleanedPhone)) {
    errors.phone = 'Masukkan nomor HP / WhatsApp aktif yang valid (contoh: 081234567890).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!contact.email || !emailRegex.test(contact.email.trim())) {
    errors.email = 'Masukkan alamat email yang valid untuk pengiriman E-Tiket & bukti bayar.';
  }

  if (!guest.sameAsContact) {
    if (!guest.guestFullName || guest.guestFullName.trim().length < 3) {
      errors.guestFullName = 'Masukkan nama lengkap tamu atau penumpang utama.';
    }
  }

  if (!selectedPayment) {
    errors.paymentMethod = 'Pilih salah satu metode pembayaran modern terlebih dahulu.';
  }

  return errors;
}

export function generateBookingIdentifiers(paymentMethod: PaymentMethodOption, seedNumber?: number): {
  bookingCode: string;
  paymentReference: string;
} {
  const num = seedNumber ?? Math.floor(100000 + Math.random() * 899999);
  const bookingCode = `NT-${num}`;
  const isNumericPrefix = /^[0-9]+$/.test(paymentMethod.codePrefix);
  const paymentReference = isNumericPrefix
    ? `${paymentMethod.codePrefix}0812${num}`
    : `${paymentMethod.codePrefix}-${num}-ID`;
  return { bookingCode, paymentReference };
}
