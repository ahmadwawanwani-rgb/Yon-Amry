import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PROMO_CODES, TRAVEL_CATALOG } from '../data/travelCatalog';
import { ServiceCategory, TravelListing } from '../types/travel';
import { TravelImage } from './TravelImage';

interface PromoAndHighlightsSectionProps {
  copiedPromoCode: string | null;
  onApplyPromoCode: (code: string) => void;
  onQuickExploreWhoosh: () => void;
  onSelectFeaturedListing: (listing: TravelListing) => void;
  onSwitchCategory: (cat: ServiceCategory) => void;
}

export const PromoAndHighlightsSection: React.FC<PromoAndHighlightsSectionProps> = ({
  copiedPromoCode,
  onApplyPromoCode,
  onQuickExploreWhoosh,
  onSelectFeaturedListing,
  onSwitchCategory,
}) => {
  const whooshFeatured = TRAVEL_CATALOG.find((item) => item.id === 'trn-whoosh-premium')!;
  const promoList = Object.values(PROMO_CODES);

  return (
    <section
      aria-labelledby="highlights-heading"
      className="bg-slate-100/80 border-y border-slate-200 py-14 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-[#0084FF] mb-1.5">
              Keunggulan Perjalanan Terpadu & Promo Eksklusif
            </p>
            <h2 id="highlights-heading" className="text-2xl sm:text-3xl font-bold text-[#0A2540]">
              Lebih hemat dengan Kereta Cepat Whoosh & kode promo resmi
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Setiap kode promo yang dipilih otomatis aktif saat Anda melanjutkan ke halaman
            pemesanan dan pembayaran.
          </p>
        </div>

        {/* Asymmetric 2-Column Split: Featured Whoosh Card (Left) + Gold Promo Vouchers & Journey Steps (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Span 7: Kereta Cepat Whoosh Spotlight */}
          <div className="lg:col-span-7 bg-[#00224D] text-white rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-12 h-full">
              <div className="sm:col-span-5 min-h-[220px] sm:min-h-full">
                <TravelImage
                  src={whooshFeatured.imageUrl}
                  alt="Kereta Cepat Whoosh Jakarta Bandung"
                  category="train"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#FBBF24] mb-2">
                    01. Highlight Tiket Kereta Api · KCIC Whoosh
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-3">
                    Jakarta ke Bandung hanya 30–46 menit dengan Kereta Cepat Whoosh
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">
                    Nikmati perjalanan bebas macet kecepatan 350 km/jam dari Stasiun Halim menuju
                    Padalarang atau Tegalluar, sudah termasuk layanan KA Feeder menuju Stasiun
                    Bandung.
                  </p>
                  <div className="text-xs text-slate-300 space-y-1.5 mb-6">
                    <p>Jadwal keberangkatan reguler setiap 30 menit sepanjang hari</p>
                    <p>Tersedia kelas Premium Economy, Business Class, dan First Class</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => onSelectFeaturedListing(whooshFeatured)}
                    className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#00224D] font-bold text-xs sm:text-sm rounded-xl transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Pesan Tiket Whoosh</span>
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={onQuickExploreWhoosh}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Lihat Semua Rute Kereta
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Span 5: Promo Khusus Gold/Yellow Vouchers */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-semibold text-amber-700">
                  02. Voucher & Kode Promo Aktif
                </span>
                <span className="text-xs text-slate-500">Klik untuk gunakan otomatis</span>
              </div>

              <div className="divide-y divide-slate-200">
                {promoList.map((promo) => {
                  const isApplied = copiedPromoCode === promo.code;
                  return (
                    <div key={promo.code} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#0A2540]">{promo.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {promo.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onApplyPromoCode(promo.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {isApplied ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            {promo.code}
                          </span>
                        ) : (
                          promo.code
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0084FF] shrink-0" aria-hidden="true" />
                <span>Jaminan E-Tiket & Voucher resmi terbit instan</span>
              </div>
              <button
                type="button"
                onClick={() => onSwitchCategory('airport_transfer')}
                className="font-semibold text-[#0084FF] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cek Jemputan Bandara
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
