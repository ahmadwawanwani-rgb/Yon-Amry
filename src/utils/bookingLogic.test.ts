import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAVEL_CATALOG, PAYMENT_METHODS } from '../data/travelCatalog';
import {
  calculateNightsBetween,
  calculatePriceBreakdown,
  filterTravelListings,
  formatRupiah,
  validateBookingInput,
} from './bookingLogic';
import { SearchCriteria } from '../types/travel';

const baseCriteria: SearchCriteria = {
  category: 'hotel',
  hotelSubFilter: 'Semua',
  origin: '',
  destination: '',
  checkInOrDepartDate: '2026-11-10',
  checkOutDate: '2026-11-12',
  quantity: 1,
  keyword: '',
};

test('formatRupiah formats Indonesian currency cleanly with dot separators', () => {
  assert.equal(formatRupiah(2450000), 'Rp 2.450.000');
  assert.equal(formatRupiah(0), 'Rp 0');
  assert.equal(formatRupiah(-150000), '-Rp 150.000');
});

test('calculateNightsBetween returns exact day difference and defaults minimum to 1', () => {
  assert.equal(calculateNightsBetween('2026-11-10', '2026-11-13'), 3);
  assert.equal(calculateNightsBetween('2026-11-10', '2026-11-10'), 1);
  assert.equal(calculateNightsBetween('2026-11-15', '2026-11-10'), 1);
});

test('filterTravelListings filters hotel sub-categories (Hotel, Vila, Apartemen) accurately', () => {
  const allHotels = filterTravelListings(TRAVEL_CATALOG, {
    ...baseCriteria,
    category: 'hotel',
    hotelSubFilter: 'Semua',
  });
  assert.equal(allHotels.length, 6);

  const onlyVillas = filterTravelListings(TRAVEL_CATALOG, {
    ...baseCriteria,
    category: 'hotel',
    hotelSubFilter: 'Vila',
  });
  assert.equal(onlyVillas.length, 2);
  assert.ok(onlyVillas.every((item) => item.hotelType === 'Vila'));

  const onlyApartments = filterTravelListings(TRAVEL_CATALOG, {
    ...baseCriteria,
    category: 'hotel',
    hotelSubFilter: 'Apartemen',
  });
  assert.equal(onlyApartments.length, 2);
  assert.ok(onlyApartments.every((item) => item.hotelType === 'Apartemen'));
});

test('filterTravelListings highlights Whoosh first in train category', () => {
  const trains = filterTravelListings(TRAVEL_CATALOG, {
    ...baseCriteria,
    category: 'train',
  });
  assert.ok(trains.length >= 4);
  assert.equal(trains[0].isWhoosh, true);
});

test('calculatePriceBreakdown computes nights, tax, insurance, payment fee, and promo discount', () => {
  const hotel = TRAVEL_CATALOG[0]; // basePrice: 2,450,000
  const bcaVa = PAYMENT_METHODS.find((m) => m.id === 'va-bca')!; // fee: 2,500

  const breakdown = calculatePriceBreakdown({
    listing: hotel,
    criteria: {
      ...baseCriteria,
      checkInOrDepartDate: '2026-11-10',
      checkOutDate: '2026-11-12', // 2 nights
      quantity: 1,
    },
    addOns: {
      travelInsurance: true, // +45,000
      specialRequests: ['Kasur besar (King Bed)'],
      customNote: '',
    },
    paymentMethod: bcaVa,
    promoCodeInput: 'JELAJAH10', // 10% capped at 350,000
  });

  assert.equal(breakdown.nightsOrUnits, 2);
  assert.equal(breakdown.subtotal, 4900000);
  assert.equal(breakdown.taxAndServiceFee, 539000); // 11% of 4,900,000
  assert.equal(breakdown.insuranceFee, 45000);
  assert.equal(breakdown.paymentFee, 2500);
  assert.equal(breakdown.promoDiscount, 350000); // 10% of 4.9M is 490k -> capped at 350k
  assert.equal(breakdown.promoCodeApplied, 'JELAJAH10');
  assert.equal(breakdown.totalAmount, 4900000 + 539000 + 45000 + 2500 - 350000);
});

test('validateBookingInput enforces contact fields, separate guest toggle, and payment selection', () => {
  const invalidErrors = validateBookingInput({
    contact: { fullName: 'A', phone: '123', email: 'bukan-email' },
    guest: { sameAsContact: false, guestFullName: '', idType: 'KTP', idNumber: '' },
    selectedPayment: null,
  });

  assert.ok(invalidErrors.fullName);
  assert.ok(invalidErrors.phone);
  assert.ok(invalidErrors.email);
  assert.ok(invalidErrors.guestFullName);
  assert.ok(invalidErrors.paymentMethod);

  const validErrors = validateBookingInput({
    contact: {
      fullName: 'Budi Santoso',
      phone: '081234567890',
      email: 'budi.santoso@contoh.id',
    },
    guest: { sameAsContact: true, guestFullName: '', idType: 'KTP', idNumber: '' },
    selectedPayment: PAYMENT_METHODS[0],
  });

  assert.equal(Object.keys(validErrors).length, 0);
});
