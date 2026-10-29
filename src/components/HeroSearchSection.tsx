import React from 'react';
import {
  Building2,
  Bus,
  Car,
  Compass,
  Plane,
  PlaneLanding,
  Search,
  TrainFront,
} from 'lucide-react';
import { HERO_IMAGE_PATH, SERVICE_CATEGORIES } from '../data/travelCatalog';
import { HotelSubFilter, SearchCriteria, ServiceCategory } from '../types/travel';
import { TravelImage } from './TravelImage';

interface HeroSearchSectionProps {
  criteria: SearchCriteria;
  onUpdateCriteria: (patch: Partial<SearchCriteria>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onApplyPromoQuick: (code: string) => void;
}

const HOTEL_FILTERS: HotelSubFilter[] = ['Semua', 'Hotel', 'Vila', 'Apartemen'];

export const HeroSearchSection: React.FC<HeroSearchSectionProps> = ({
  criteria,
  onUpdateCriteria,
  onSearchSubmit,
  onApplyPromoQuick,
}) => {
  const renderCategoryIcon = (id: ServiceCategory) => {
    const cls = 'w-4 h-4 shrink-0';
    switch (id) {
      case 'hotel':
        return <Building2 className={cls} aria-hidden="true" />;
      case 'flight':
        return <Plane className={cls} aria-hidden="true" />;
      case 'train':
        return <TrainFront className={cls} aria-hidden="true" />;
      case 'bus':
        return <Bus className={cls} aria-hidden="true" />;
      case 'airport_transfer':
        return <PlaneLanding className={cls} aria-hidden="true" />;
      case 'car_rental':
        return <Car className={cls} aria-hidden="true" />;
      case 'attraction':
        return <Compass className={cls} aria-hidden="true" />;
    }
  };

  const isRouteBased =
    criteria.category === 'flight' ||
    criteria.category === 'train' ||
    criteria.category === 'bus' ||
    criteria.category === 'airport_transfer';

  const getDestinationLabel = () => {
    switch (criteria.category) {
      case 'hotel':
        return 'Kota, Tujuan, atau Nama Properti';
      case 'flight':
        return 'Kota atau Bandara Tujuan';
      case 'train':
        return 'Stasiun Tujuan (misal: Bandung / Padalarang)';
      case 'bus':
        return 'Kota atau Titik Tujuan';
      case 'airport_transfer':
        return 'Tujuan Pengantaran (Hotel / Area Kota)';
      case 'car_rental':
        return 'Kota atau Lokasi Sewa Mobil';
      case 'attraction':
        return 'Destinasi atau Nama Aktivitas';
    }
  };

  const getQuantityLabel = () => {
    switch (criteria.category) {
      case 'hotel':
        return 'Jumlah Kamar';
      case 'car_rental':
        return 'Jumlah Unit Mobil';
      case 'airport_transfer':
        return 'Jumlah Kendaraan / Tiket';
      case 'attraction':
        return 'Jumlah Tiket';
      default:
        return 'Jumlah Penumpang';
    }
  };

  return (
    <section className="relative bg-[#00224D] text-white overflow-hidden">
      {/* Background Photography with Measured Contrast Scrim */}
      <div className="absolute inset-0">
        <TravelImage
          src={HERO_IMAGE_PATH}
          alt="Panorama teluk pesisir Nusa Penida Indonesia saat matahari terbenam"
          className="w-full h-full object-cover opacity-35"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#00224D]/90 via-[#0A2540]/80 to-[#0A2540]"
          aria-hidden="true"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-14 lg:pb-18">
        {/* Hero Headline & Gold Promo Accent */}
        <div className="max-w-3xl mb-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-medium text-[#FBBF24] mb-3">
            <span>Eksplorasi Domestik & Internasional</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onApplyPromoQuick('JELAJAH10')}
              className="underline decoration-[#F59E0B] underline-offset-4 hover:text-white transition-colors cursor-pointer text-left"
            >
              Gunakan kode JELAJAH10 hemat hingga Rp 350.000
            </button>
          </div>
          <h1
            className="font-display font-bold tracking-tight text-white leading-[1.12] mb-3"
            style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
          >
            Pilihan utama untuk jelajahi dunia
          </h1>
          <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl">
            Pesan hotel, tiket pesawat, kereta cepat Whoosh, bus & travel, antar jemput bandara,
            rental mobil, hingga tiket atraksi dalam satu alur pemesanan modern.
          </p>
        </div>

        {/* Main Interactive Search Card */}
        <div className="bg-white text-[#0A2540] rounded-2xl shadow-xl border border-slate-200/80 p-4 sm:p-6">
          {/* 1. Pilih Kategori Layanan (7 Products) */}
          <div
            role="tablist"
            aria-label="Kategori Layanan Perjalanan"
            className="flex flex-wrap items-center gap-1.5 pb-4 mb-5 border-b border-slate-200"
          >
            {SERVICE_CATEGORIES.map((cat) => {
              const isSelected = criteria.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() =>
                    onUpdateCriteria({
                      category: cat.id,
                      destination: '',
                      origin: isRouteBased ? criteria.origin : '',
                      keyword: '',
                    })
                  }
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0084FF] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0A2540]'
                  }`}
                >
                  {renderCategoryIcon(cat.id)}
                  <span>{cat.label}</span>
                  {cat.highlightNote && (
                    <span
                      className={`text-[11px] font-bold tracking-tight px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-[#F59E0B] text-[#00224D]'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {cat.highlightNote}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-filter khusus Hotel: Hotel, Vila, Apartemen + Highlight Info untuk Kereta Whoosh */}
          {criteria.category === 'hotel' && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Tipe Akomodasi:</span>
                <div
                  role="group"
                  aria-label="Filter Tipe Akomodasi Hotel"
                  className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg"
                >
                  {HOTEL_FILTERS.map((sub) => {
                    const active = criteria.hotelSubFilter === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => onUpdateCriteria({ hotelSubFilter: sub })}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#0A2540] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0A2540]'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Harga transparan · Konfirmasi voucher instan ke WhatsApp & Email
              </p>
            </div>
          )}

          {criteria.category === 'train' && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-100">
              <div className="text-xs sm:text-sm text-[#0A2540] font-medium">
                <span className="font-bold text-amber-700">Layanan Unggulan Whoosh:</span> Jakarta
                (Halim) ke Bandung (Padalarang / Tegalluar) hanya 30–46 menit, gratis KA Feeder.
              </div>
              <button
                type="button"
                onClick={() => onUpdateCriteria({ destination: 'Whoosh' })}
                className="text-xs font-semibold text-[#0084FF] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Tampilkan Jadwal Whoosh Saja
              </button>
            </div>
          )}

          {/* 2. Form Pencarian Singkat & 3. Tombol Cari */}
          <form onSubmit={onSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
            {isRouteBased ? (
              <>
                <div className="md:col-span-3">
                  <label
                    htmlFor="search-origin"
                    className="block text-xs font-semibold text-slate-600 mb-1.5"
                  >
                    Kota / Titik Keberangkatan
                  </label>
                  <input
                    id="search-origin"
                    type="text"
                    value={criteria.origin}
                    onChange={(e) => onUpdateCriteria({ origin: e.target.value })}
                    placeholder="Misal: Jakarta / Halim"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-[#0A2540] placeholder:text-slate-400 focus:bg-white focus:border-[#0084FF] focus:outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <label
                    htmlFor="search-destination"
                    className="block text-xs font-semibold text-slate-600 mb-1.5"
                  >
                    {getDestinationLabel()}
                  </label>
                  <input
                    id="search-destination"
                    type="text"
                    value={criteria.destination}
                    onChange={(e) => onUpdateCriteria({ destination: e.target.value })}
                    placeholder="Misal: Bali, Bandung, Yogyakarta"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-[#0A2540] placeholder:text-slate-400 focus:bg-white focus:border-[#0084FF] focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div className="md:col-span-4">
                <label
                  htmlFor="search-destination"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  {getDestinationLabel()}
                </label>
                <input
                  id="search-destination"
                  type="text"
                  value={criteria.destination}
                  onChange={(e) => onUpdateCriteria({ destination: e.target.value })}
                  placeholder="Misal: Bali, Ubud, Jakarta, Borobudur..."
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-[#0A2540] placeholder:text-slate-400 focus:bg-white focus:border-[#0084FF] focus:outline-none"
                />
              </div>
            )}

            {/* Tanggal Berangkat / Check-in */}
            <div className={isRouteBased ? 'md:col-span-2' : 'md:col-span-2'}>
              <label
                htmlFor="search-checkin"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                {criteria.category === 'hotel'
                  ? 'Check-in'
                  : criteria.category === 'car_rental'
                    ? 'Mulai Sewa'
                    : 'Tanggal Pergi'}
              </label>
              <input
                id="search-checkin"
                type="date"
                value={criteria.checkInOrDepartDate}
                onChange={(e) => onUpdateCriteria({ checkInOrDepartDate: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-[#0A2540] tabular-nums focus:bg-white focus:border-[#0084FF] focus:outline-none"
              />
            </div>

            {/* Tanggal Check-out (untuk Hotel & Rental Mobil) */}
            {(criteria.category === 'hotel' || criteria.category === 'car_rental') && (
              <div className="md:col-span-2">
                <label
                  htmlFor="search-checkout"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  {criteria.category === 'hotel' ? 'Check-out' : 'Selesai Sewa'}
                </label>
                <input
                  id="search-checkout"
                  type="date"
                  value={criteria.checkOutDate}
                  min={criteria.checkInOrDepartDate}
                  onChange={(e) => onUpdateCriteria({ checkOutDate: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-[#0A2540] tabular-nums focus:bg-white focus:border-[#0084FF] focus:outline-none"
                />
              </div>
            )}

            {/* Jumlah Kamar / Penumpang / Tiket */}
            <div className="md:col-span-2">
              <label
                htmlFor="search-quantity"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                {getQuantityLabel()}
              </label>
              <select
                id="search-quantity"
                value={criteria.quantity}
                onChange={(e) => onUpdateCriteria({ quantity: Number(e.target.value) })}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-[#0A2540] tabular-nums focus:bg-white focus:border-[#0084FF] focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}{' '}
                    {criteria.category === 'hotel'
                      ? 'Kamar'
                      : criteria.category === 'car_rental'
                        ? 'Unit'
                        : 'Orang / Tiket'}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Klik "Cari" (Tombol Kaca Pembesar / Search) */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full h-11 px-5 bg-[#0084FF] hover:bg-[#006CE0] text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A2540]"
              >
                <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Cari</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
