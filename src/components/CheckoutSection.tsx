import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import {
  PAYMENT_METHODS,
  PROMO_CODES,
  SPECIAL_REQUEST_OPTIONS,
} from '../data/travelCatalog';
import {
  BookingAddOns,
  ContactDetails,
  GuestDetails,
  PaymentCategoryGroup,
  PaymentMethodOption,
  PriceBreakdown,
  SearchCriteria,
  TravelListing,
} from '../types/travel';
import {
  INSURANCE_FEE_PER_QTY,
  ValidationErrors,
  formatRupiah,
} from '../utils/bookingLogic';

interface CheckoutSectionProps {
  listing: TravelListing;
  criteria: SearchCriteria;
  contact: ContactDetails;
  guest: GuestDetails;
  addOns: BookingAddOns;
  selectedPayment: PaymentMethodOption | null;
  promoCodeInput: string;
  pricing: PriceBreakdown;
  validationErrors: ValidationErrors;
  onUpdateContact: (patch: Partial<ContactDetails>) => void;
  onUpdateGuest: (patch: Partial<GuestDetails>) => void;
  onUpdateAddOns: (patch: Partial<BookingAddOns>) => void;
  onUpdateQuantity: (quantity: number) => void;
  onSelectPayment: (method: PaymentMethodOption) => void;
  onChangePromoInput: (code: string) => void;
  onBackToResults: () => void;
  onSubmitBooking: (e: React.FormEvent) => void;
}

const PAYMENT_GROUPS: { key: PaymentCategoryGroup; title: string; subtitle: string }[] = [
  {
    key: 'paylater',
    title: 'PayLater / Cicilan',
    subtitle: 'Pesan sekarang, bayar fleksibel dengan cicilan bulanan',
  },
  {
    key: 'card',
    title: 'Kartu Kredit / Debit',
    subtitle: 'Mendukung VISA, Mastercard, JCB, dan American Express (Amex)',
  },
  {
    key: 'ewallet',
    title: 'E-Wallet / QRIS',
    subtitle: 'Pembayaran instan melalui QRIS, GoPay, dan OVO',
  },
  {
    key: 'va',
    title: 'Transfer Bank (Virtual Account)',
    subtitle: 'Verifikasi otomatis BCA, Mandiri, BRI, BNI, CIMB Niaga, Permata Bank',
  },
  {
    key: 'atm',
    title: 'Jaringan ATM',
    subtitle: 'Mendukung transfer melalui jaringan ATM Bersama, PRIMA, dan ALTO',
  },
  {
    key: 'retail',
    title: 'Gerai Retail (Over the Counter)',
    subtitle: 'Bayar langsung di kasir Alfamart atau Indomaret terdekat',
  },
];

export const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  listing,
  criteria,
  contact,
  guest,
  addOns,
  selectedPayment,
  promoCodeInput,
  pricing,
  validationErrors,
  onUpdateContact,
  onUpdateGuest,
  onUpdateAddOns,
  onUpdateQuantity,
  onSelectPayment,
  onChangePromoInput,
  onBackToResults,
  onSubmitBooking,
}) => {
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);
  const availableRequests = SPECIAL_REQUEST_OPTIONS[listing.category] || [];

  const handleToggleSpecialRequest = (reqLabel: string) => {
    const exists = addOns.specialRequests.includes(reqLabel);
    const updated = exists
      ? addOns.specialRequests.filter((r) => r !== reqLabel)
      : [...addOns.specialRequests, reqLabel];
    onUpdateAddOns({ specialRequests: updated });
  };

  const handleCheckPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoFeedback('Masukkan kode promo terlebih dahulu (contoh: JELAJAH10).');
      return;
    }
    if (PROMO_CODES[code]) {
      setPromoFeedback(
        `Kode ${code} berhasil diterapkan: hemat ${formatRupiah(pricing.promoDiscount)}.`
      );
    } else {
      setPromoFeedback(
        'Kode promo tidak ditemukan. Coba JELAJAH10, WHOOSHHEMAT, atau TPAYLATER15.'
      );
    }
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Stepper Header Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToResults}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0A2540] transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Kembali ke Hasil Pencarian</span>
          </button>

          {/* 4-Step User Journey Indicator */}
          <ol
            aria-label="Tahapan Pemesanan"
            className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold"
          >
            <li className="flex items-center gap-1.5 text-[#0084FF]">
              <span className="w-5 h-5 rounded-full bg-[#0084FF] text-white inline-flex items-center justify-center tabular-nums">
                1
              </span>
              <span>Detail Pemesan</span>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li className="flex items-center gap-1.5 text-[#0084FF]">
              <span className="w-5 h-5 rounded-full bg-[#0084FF] text-white inline-flex items-center justify-center tabular-nums">
                2
              </span>
              <span>Rincian Biaya</span>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li className="flex items-center gap-1.5 text-[#0A2540]">
              <span className="w-5 h-5 rounded-full bg-[#0A2540] text-white inline-flex items-center justify-center tabular-nums">
                3
              </span>
              <span>Metode Pembayaran</span>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li className="flex items-center gap-1.5 text-slate-400">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 inline-flex items-center justify-center tabular-nums">
                4
              </span>
              <span>E-Tiket & Voucher</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Main Checkout Form & Order Summary */}
      <form
        onSubmit={onSubmitBooking}
        noValidate
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
      >
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540]">
            Form Pemesanan & Pembayaran Modern
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Lengkapi data pemesan dengan benar untuk pengiriman E-Tiket dan voucher resmi secara
            instan.
          </p>
        </div>

        {hasValidationErrors && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
          >
            <p className="font-bold mb-1">Mohon periksa kembali data pemesanan Anda:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs sm:text-sm">
              {Object.values(validationErrors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (Span 7): Card-based Booking Form & Payment Gateways */}
          <div className="lg:col-span-7 space-y-6">
            {/* CARD 1: Data Pemesan (Contact Details) */}
            <section
              aria-labelledby="contact-card-heading"
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7"
            >
              <div className="mb-5 pb-4 border-b border-slate-100">
                <span className="text-xs font-semibold text-[#0084FF]">Langkah 1 · Bagian A</span>
                <h2 id="contact-card-heading" className="text-lg font-bold text-[#0A2540] mt-0.5">
                  1. Data Pemesan (Contact Details)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  E-Tiket, voucher, dan bukti pembayaran resmi akan dikirimkan ke kontak di bawah
                  ini.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="contact-fullname"
                    className="block text-xs font-semibold text-[#0A2540] mb-1.5"
                  >
                    Nama Lengkap <span className="font-normal text-slate-500">(Sesuai KTP/Paspor)</span> *
                  </label>
                  <input
                    id="contact-fullname"
                    type="text"
                    required
                    value={contact.fullName}
                    onChange={(e) => onUpdateContact({ fullName: e.target.value })}
                    placeholder="Contoh: Nadia Pratama Putri"
                    className={`w-full h-11 px-3.5 rounded-xl border text-sm text-[#0A2540] focus:outline-none ${
                      validationErrors.fullName
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-slate-300 focus:border-[#0084FF]'
                    }`}
                  />
                  {validationErrors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-semibold text-[#0A2540] mb-1.5"
                    >
                      Nomor HP / WhatsApp *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={contact.phone}
                      onChange={(e) => onUpdateContact({ phone: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm text-[#0A2540] tabular-nums focus:outline-none ${
                        validationErrors.phone
                          ? 'border-red-400 bg-red-50/30'
                          : 'border-slate-300 focus:border-[#0084FF]'
                      }`}
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Untuk pengiriman notifikasi & E-Tiket instan
                    </p>
                    {validationErrors.phone && (
                      <p className="text-xs text-red-600 mt-0.5">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-[#0A2540] mb-1.5"
                    >
                      Alamat Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contact.email}
                      onChange={(e) => onUpdateContact({ email: e.target.value })}
                      placeholder="Contoh: nadia.putri@email.com"
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm text-[#0A2540] focus:outline-none ${
                        validationErrors.email
                          ? 'border-red-400 bg-red-50/30'
                          : 'border-slate-300 focus:border-[#0084FF]'
                      }`}
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Untuk pengiriman bukti pembayaran resmi
                    </p>
                    {validationErrors.email && (
                      <p className="text-xs text-red-600 mt-0.5">{validationErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* CARD 2: Rincian Tamu / Penumpang (Guest Details) */}
            <section
              aria-labelledby="guest-card-heading"
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7"
            >
              <div className="mb-4 pb-4 border-b border-slate-100">
                <h2 id="guest-card-heading" className="text-lg font-bold text-[#0A2540]">
                  2. Rincian Tamu / Penumpang (Guest Details)
                </h2>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  checked={guest.sameAsContact}
                  onChange={(e) => onUpdateGuest({ sameAsContact: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-[#0084FF] focus:ring-[#0084FF]"
                />
                <span className="text-sm font-semibold text-[#0A2540]">
                  Pemesan adalah Tamu/Penumpang utama
                </span>
              </label>

              {!guest.sameAsContact && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label
                      htmlFor="guest-fullname"
                      className="block text-xs font-semibold text-[#0A2540] mb-1.5"
                    >
                      Nama Lengkap Tamu / Penumpang Utama (Sesuai KTP/Paspor) *
                    </label>
                    <input
                      id="guest-fullname"
                      type="text"
                      value={guest.guestFullName}
                      onChange={(e) => onUpdateGuest({ guestFullName: e.target.value })}
                      placeholder="Masukkan nama lengkap tamu atau penumpang yang berangkat"
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm text-[#0A2540] focus:outline-none ${
                        validationErrors.guestFullName
                          ? 'border-red-400 bg-red-50/30'
                          : 'border-slate-300 focus:border-[#0084FF]'
                      }`}
                    />
                    {validationErrors.guestFullName && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.guestFullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="guest-idtype"
                        className="block text-xs font-semibold text-[#0A2540] mb-1.5"
                      >
                        Jenis Identitas
                      </label>
                      <select
                        id="guest-idtype"
                        value={guest.idType}
                        onChange={(e) =>
                          onUpdateGuest({ idType: e.target.value as 'KTP' | 'Paspor' })
                        }
                        className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0A2540] focus:border-[#0084FF] focus:outline-none"
                      >
                        <option value="KTP">KTP (NIK)</option>
                        <option value="Paspor">Paspor</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="guest-idnumber"
                        className="block text-xs font-semibold text-[#0A2540] mb-1.5"
                      >
                        Nomor Identitas (Opsional untuk Akomodasi)
                      </label>
                      <input
                        id="guest-idnumber"
                        type="text"
                        value={guest.idNumber}
                        onChange={(e) => onUpdateGuest({ idNumber: e.target.value })}
                        placeholder="Contoh: 3174051209940001"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-[#0A2540] tabular-nums focus:border-[#0084FF] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* CARD 3: Tambahan Layanan (Add-ons / Optional) */}
            <section
              aria-labelledby="addons-card-heading"
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7"
            >
              <div className="mb-4 pb-4 border-b border-slate-100">
                <h2 id="addons-card-heading" className="text-lg font-bold text-[#0A2540]">
                  3. Tambahan Layanan (Add-ons / Opsional)
                </h2>
              </div>

              {/* Asuransi Perjalanan Checkbox */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
                <label className="flex items-start justify-between gap-4 cursor-pointer select-none">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={addOns.travelInsurance}
                      onChange={(e) => onUpdateAddOns({ travelInsurance: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-[#0084FF] focus:ring-[#0084FF]"
                    />
                    <div>
                      <span className="block text-sm font-bold text-[#0A2540]">
                        Asuransi Perjalanan Lengkap
                      </span>
                      <span className="block text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Perlindungan keterlambatan jadwal, pembatalan darurat medis, dan perlindungan
                        bagasi selama perjalanan.
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#0A2540] font-mono tabular-nums whitespace-nowrap">
                    +{formatRupiah(INSURANCE_FEE_PER_QTY)} / {listing.unitLabel}
                  </span>
                </label>
              </div>

              {/* Permintaan Khusus */}
              <div>
                <p className="text-xs font-semibold text-[#0A2540] mb-2.5">
                  Permintaan Khusus (Berdasarkan ketersediaan saat kedatangan):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {availableRequests.map((reqOption) => {
                    const checked = addOns.specialRequests.includes(reqOption);
                    return (
                      <label
                        key={reqOption}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleSpecialRequest(reqOption)}
                          className="w-4 h-4 rounded border-slate-300 text-[#0084FF] focus:ring-[#0084FF]"
                        />
                        <span>{reqOption}</span>
                      </label>
                    );
                  })}
                </div>

                <label
                  htmlFor="custom-request-note"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Catatan Tambahan Lainnya (Opsional)
                </label>
                <input
                  id="custom-request-note"
                  type="text"
                  value={addOns.customNote}
                  onChange={(e) => onUpdateAddOns({ customNote: e.target.value })}
                  placeholder="Misal: Perkiraan tiba pukul 19:00 atau permintaan kasur bayi..."
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm text-[#0A2540] focus:border-[#0084FF] focus:outline-none"
                />
              </div>
            </section>

            {/* CARD 4: Partner Pembayaran Modern (Payment Gateways) */}
            <section
              aria-labelledby="payment-card-heading"
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7"
            >
              <div className="mb-5 pb-4 border-b border-slate-100">
                <span className="text-xs font-semibold text-[#0084FF]">Langkah 3 · Pembayaran</span>
                <h2 id="payment-card-heading" className="text-lg font-bold text-[#0A2540] mt-0.5">
                  Pilih Metode Pembayaran Modern
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh transaksi dilindungi enkripsi standar perbankan dengan verifikasi otomatis.
                </p>
              </div>

              {validationErrors.paymentMethod && (
                <p className="text-xs font-semibold text-red-600 mb-4">
                  {validationErrors.paymentMethod}
                </p>
              )}

              <div className="space-y-6">
                {PAYMENT_GROUPS.map((group) => {
                  const methods = PAYMENT_METHODS.filter((m) => m.group === group.key);
                  return (
                    <div key={group.key} className="pb-5 last:pb-0 border-b last:border-b-0 border-slate-100">
                      <div className="mb-3">
                        <h3 className="text-sm font-bold text-[#0A2540]">{group.title}</h3>
                        <p className="text-xs text-slate-500">{group.subtitle}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {methods.map((method) => {
                          const isSelected = selectedPayment?.id === method.id;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => onSelectPayment(method)}
                              aria-pressed={isSelected}
                              className={`text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? 'border-[#0084FF] bg-sky-50/70 text-[#0A2540]'
                                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                              }`}
                            >
                              <div>
                                <span className="block text-sm font-bold text-[#0A2540]">
                                  {method.name}
                                </span>
                                <span className="block text-[11px] text-slate-500 mt-0.5">
                                  {method.fee === 0
                                    ? 'Bebas biaya layanan'
                                    : `Biaya admin ${formatRupiah(method.fee)}`}
                                </span>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-[#0084FF] border-[#0084FF] text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" aria-hidden="true" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPayment && (
                <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-[#0084FF] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold text-[#0A2540]">
                      Metode Terpilih: {selectedPayment.name}
                    </span>
                    <p className="text-slate-600 mt-0.5">{selectedPayment.processingNote}</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN (Span 5): Sticky Ringkasan Pesanan (Order Summary Card) */}
          <aside className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Top Navy Banner */}
              <div className="bg-[#00224D] text-white p-5">
                <span className="text-xs font-semibold text-[#FBBF24]">
                  Langkah 2 · Ringkasan Pesanan
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5 leading-snug">
                  {listing.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1">{listing.subtitle}</p>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/*Tanggal & Jumlah Stepper*/}
                <div className="space-y-2.5 text-xs sm:text-sm pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Tanggal Perjalanan</span>
                    <span className="font-semibold text-[#0A2540] tabular-nums text-right">
                      {criteria.checkInOrDepartDate}
                      {(listing.category === 'hotel' || listing.category === 'car_rental') &&
                      criteria.checkOutDate
                        ? ` s/d ${criteria.checkOutDate} (${pricing.nightsOrUnits} malam/hari)`
                        : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Jadwal / Ketentuan</span>
                    <span className="font-medium text-slate-700 text-right">
                      {listing.scheduleInfo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <label htmlFor="checkout-qty" className="text-slate-500">
                      Jumlah ({listing.unitLabel})
                    </label>
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Kurangi jumlah"
                        onClick={() => onUpdateQuantity(Math.max(1, pricing.quantity - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-300 text-[#0A2540] font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span
                        id="checkout-qty"
                        className="w-6 text-center font-bold text-[#0A2540] tabular-nums"
                      >
                        {pricing.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Tambah jumlah"
                        onClick={() => onUpdateQuantity(Math.min(10, pricing.quantity + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-300 text-[#0A2540] font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="pb-4 border-b border-slate-100">
                  <label
                    htmlFor="promo-code-input"
                    className="block text-xs font-semibold text-[#0A2540] mb-1.5"
                  >
                    Kode Promo / Diskon
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag
                        className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        id="promo-code-input"
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => onChangePromoInput(e.target.value.toUpperCase())}
                        placeholder="Misal: JELAJAH10"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs font-mono font-semibold uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal text-[#0A2540] focus:border-[#0084FF] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCheckPromo}
                      className="h-10 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>
                  {promoFeedback && (
                    <p className="text-xs text-slate-600 mt-1.5">{promoFeedback}</p>
                  )}
                </div>

                {/* Rincian Biaya */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-600">
                      Biaya Tiket/Kamar ({pricing.quantity} ×{' '}
                      {pricing.nightsOrUnits > 1 ? `${pricing.nightsOrUnits} × ` : ''}
                      {formatRupiah(pricing.unitPrice)})
                    </span>
                    <span className="font-semibold text-[#0A2540] font-mono tabular-nums">
                      {formatRupiah(pricing.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-600">Biaya Layanan / Pajak (11%)</span>
                    <span className="font-semibold text-[#0A2540] font-mono tabular-nums">
                      {formatRupiah(pricing.taxAndServiceFee)}
                    </span>
                  </div>

                  {pricing.insuranceFee > 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600">Asuransi Perjalanan</span>
                      <span className="font-semibold text-[#0A2540] font-mono tabular-nums">
                        {formatRupiah(pricing.insuranceFee)}
                      </span>
                    </div>
                  )}

                  {pricing.paymentFee > 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600">Biaya Layanan Pembayaran</span>
                      <span className="font-semibold text-[#0A2540] font-mono tabular-nums">
                        {formatRupiah(pricing.paymentFee)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-600">
                      Kode Promo / Diskon{' '}
                      {pricing.promoCodeApplied ? `(${pricing.promoCodeApplied})` : ''}
                    </span>
                    <span
                      className={`font-semibold font-mono tabular-nums ${
                        pricing.promoDiscount > 0 ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {pricing.promoDiscount > 0
                        ? formatRupiah(-pricing.promoDiscount)
                        : '-Rp 0'}
                    </span>
                  </div>

                  <div className="pt-3.5 mt-2 border-t border-slate-200 flex items-baseline justify-between gap-4">
                    <span className="text-base font-bold text-[#0A2540]">Total Pembayaran</span>
                    <span className="text-xl font-bold text-[#0084FF] font-mono tabular-nums">
                      {formatRupiah(pricing.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Primary Submit Action */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 bg-[#0084FF] hover:bg-[#006CE0] text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A2540]"
                >
                  <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Konfirmasi & Terbitkan E-Tiket</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Pembayaran aman & E-Tiket terbit seketika</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};
