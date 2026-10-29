export type ServiceCategory =
  | 'hotel'
  | 'flight'
  | 'train'
  | 'bus'
  | 'airport_transfer'
  | 'car_rental'
  | 'attraction';

export type HotelSubFilter = 'Semua' | 'Hotel' | 'Vila' | 'Apartemen';

export interface TravelListing {
  id: string;
  category: ServiceCategory;
  hotelType?: 'Hotel' | 'Vila' | 'Apartemen';
  isWhoosh?: boolean;
  title: string;
  subtitle: string; // e.g. Location or Route
  providerOrArea: string; // e.g. "Ubud, Bali" or "Garuda Indonesia · Langsung" or "KCIC Whoosh · 46 Menit"
  rating: number;
  reviewCount: number;
  basePrice: number; // Price per unit/night/ticket in IDR
  unitLabel: string; // e.g. "malam", "penumpang", "hari", "tiket", "perjalanan"
  highlights: string[];
  scheduleInfo: string; // e.g. Check-in 14:00 or 08:00 -> 08:46
  imageUrl?: string;
  promoTag?: string; // Optional subtle text kicker e.g. "Hemat Khusus Hari Ini"
}

export interface SearchCriteria {
  category: ServiceCategory;
  hotelSubFilter: HotelSubFilter;
  origin: string;
  destination: string;
  checkInOrDepartDate: string;
  checkOutDate: string;
  quantity: number; // rooms, passengers, or days
  keyword: string;
}

export type PaymentCategoryGroup =
  | 'paylater'
  | 'card'
  | 'ewallet'
  | 'va'
  | 'atm'
  | 'retail';

export interface PaymentMethodOption {
  id: string;
  name: string;
  group: PaymentCategoryGroup;
  groupLabel: string;
  processingNote: string;
  fee: number;
  codePrefix: string;
}

export interface ContactDetails {
  fullName: string;
  phone: string;
  email: string;
}

export interface GuestDetails {
  sameAsContact: boolean;
  guestFullName: string;
  idType: 'KTP' | 'Paspor';
  idNumber: string;
}

export interface BookingAddOns {
  travelInsurance: boolean;
  specialRequests: string[];
  customNote: string;
}

export interface PriceBreakdown {
  unitPrice: number;
  quantity: number;
  nightsOrUnits: number;
  subtotal: number;
  taxAndServiceFee: number;
  insuranceFee: number;
  paymentFee: number;
  promoDiscount: number;
  promoCodeApplied: string | null;
  totalAmount: number;
}

export interface ConfirmedBooking {
  bookingCode: string;
  createdAt: string;
  listing: TravelListing;
  searchCriteria: SearchCriteria;
  contact: ContactDetails;
  guest: GuestDetails;
  addOns: BookingAddOns;
  paymentMethod: PaymentMethodOption;
  paymentReference: string;
  pricing: PriceBreakdown;
  status: 'LUNAS & TERKONFIRMASI' | 'MENUNGGU PEMBAYARAN';
}
