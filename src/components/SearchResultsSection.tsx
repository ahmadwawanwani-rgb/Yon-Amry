import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/travelCatalog';
import { HotelSubFilter, SearchCriteria, TravelListing } from '../types/travel';
import { formatRupiah } from '../utils/bookingLogic';
import { TravelImage } from './TravelImage';

interface SearchResultsSectionProps {
  listings: TravelListing[];
  criteria: SearchCriteria;
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc';
  onChangeSort: (sort: 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc') => void;
  onUpdateHotelFilter: (filter: HotelSubFilter) => void;
  onResetFilters: () => void;
  onSelectListing: (listing: TravelListing) => void;
}

export const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  listings,
  criteria,
  sortBy,
  onChangeSort,
  onUpdateHotelFilter,
  onResetFilters,
  onSelectListing,
}) => {
  const activeCatInfo =
    SERVICE_CATEGORIES.find((c) => c.id === criteria.category) || SERVICE_CATEGORIES[0];

  return (
    <section
      id="hasil-pencarian"
      aria-labelledby="results-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
    >
      {/* Header Row & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0084FF] mb-1.5">
            <span>Hasil Pencarian & Pilihan Terbaik</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{listings.length} opsi tersedia</span>
          </div>
          <h2 id="results-heading" className="text-2xl sm:text-3xl font-bold text-[#0A2540]">
            {activeCatInfo.label}
            {criteria.category === 'hotel' && criteria.hotelSubFilter !== 'Semua'
              ? ` — ${criteria.hotelSubFilter}`
              : ''}
            {criteria.category === 'train' ? ' & Kereta Cepat Whoosh' : ''}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {criteria.category === 'hotel' && (
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
              {(['Semua', 'Hotel', 'Vila', 'Apartemen'] as HotelSubFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => onUpdateHotelFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    criteria.hotelSubFilter === filter
                      ? 'bg-white text-[#0A2540] shadow-xs'
                      : 'text-slate-600 hover:text-[#0A2540]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Urutkan:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) =>
                onChangeSort(
                  e.target.value as 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc'
                )
              }
              className="h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[#0A2540] focus:border-[#0084FF] focus:outline-none"
            >
              <option value="recommended">Rekomendasi Utama</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="rating_desc">Ulasan Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-xl mx-auto">
          <h3 className="text-lg font-bold text-[#0A2540] mb-2">
            Tidak ada layanan yang cocok dengan kata kunci pencarian
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Coba hapus filter kata kunci atau periksa destinasi populer lainnya seperti Bali,
            Jakarta, Bandung, atau Yogyakarta.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-5 py-2.5 bg-[#0084FF] hover:bg-[#006CE0] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tampilkan Semua {activeCatInfo.label}
          </button>
        </div>
      ) : (
        /* 3-Column Uniform Product Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {listings.map((item) => (
            <article
              key={item.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                {/* Media 4:3 */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <TravelImage
                    src={item.imageUrl}
                    alt={item.title}
                    category={item.category}
                    className="w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                {/* Card Content — Zero Pill Metadata Discipline */}
                <div className="p-5">
                  {/* Quiet 1-line unboxed text metadata */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-[#0084FF]">
                      {item.hotelType
                        ? item.hotelType
                        : item.isWhoosh
                          ? 'Kereta Cepat Whoosh'
                          : activeCatInfo.shortLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#0A2540] tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                      {item.rating.toFixed(1)}
                    </span>
                    <span className="text-slate-400 tabular-nums">({item.reviewCount} ulasan)</span>
                    {item.promoTag && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-amber-700">{item.promoTag}</span>
                      </>
                    )}
                  </div>

                  {/* Primary Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#0A2540] leading-snug mb-1.5">
                    {item.title}
                  </h3>

                  {/* Location / Route */}
                  <p className="text-sm font-medium text-slate-700 mb-1">{item.subtitle}</p>
                  <p className="text-xs text-slate-500 mb-3">{item.providerOrArea}</p>

                  {/* Schedule & Unboxed Highlights */}
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <p className="font-medium text-slate-700">{item.scheduleInfo}</p>
                    <p className="text-slate-500 line-clamp-1">
                      {item.highlights.join(' · ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Primary Action Footer */}
              <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-[11px] text-slate-500">Mulai dari</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#0A2540] font-mono tabular-nums">
                      {formatRupiah(item.basePrice)}
                    </span>
                    <span className="text-xs text-slate-500">/ {item.unitLabel}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectListing(item)}
                  aria-label={`Pesan Sekarang ${item.title}`}
                  className="px-4 py-2.5 bg-[#0084FF] hover:bg-[#006CE0] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A2540]"
                >
                  <span>Pesan Sekarang</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
