import React from 'react';
import { ArrowLeft, Calendar, Ticket } from 'lucide-react';
import { ConfirmedBooking } from '../types/travel';
import { formatRupiah } from '../utils/bookingLogic';

interface MyBookingsSectionProps {
  bookings: ConfirmedBooking[];
  onSelectBookingDetail: (booking: ConfirmedBooking) => void;
  onNavigateHome: () => void;
}

export const MyBookingsSection: React.FC<MyBookingsSectionProps> = ({
  bookings,
  onSelectBookingDetail,
  onNavigateHome,
}) => {
  return (
    <div className="bg-slate-50 min-h-[70vh] py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0084FF] hover:underline mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Kembali ke Halaman Utama</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540]">
              Pesanan & E-Tiket Saya
            </h1>
          </div>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            Total {bookings.length} pesanan tersimpan
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <Ticket className="w-10 h-10 text-[#0084FF] mx-auto mb-3" aria-hidden="true" />
            <h2 className="text-lg font-bold text-[#0A2540] mb-1.5">
              Belum ada E-Tiket atau voucher aktif
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Pilih hotel, tiket pesawat, kereta cepat Whoosh, bus, rental mobil, atau atraksi di
              halaman utama untuk memulai pemesanan.
            </p>
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-5 py-2.5 bg-[#0084FF] hover:bg-[#006CE0] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Mulai Jelajahi Layanan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <article
                key={b.bookingCode}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-[#0A2540]">{b.bookingCode}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-emerald-700">{b.status}</span>
                    <span aria-hidden="true">·</span>
                    <span>{b.paymentMethod.name}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0A2540]">
                    {b.listing.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">{b.listing.subtitle}</p>
                  <p className="text-xs text-slate-500 inline-flex items-center gap-1.5 pt-1 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 text-[#0084FF]" aria-hidden="true" />
                    <span>
                      Tanggal: {b.searchCriteria.checkInOrDepartDate} · {b.pricing.quantity}{' '}
                      {b.listing.unitLabel}
                    </span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="sm:text-right">
                    <span className="block text-[11px] text-slate-500">Total Pembayaran</span>
                    <span className="text-base sm:text-lg font-bold text-[#0A2540] font-mono tabular-nums">
                      {formatRupiah(b.pricing.totalAmount)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectBookingDetail(b)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0A2540] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Buka E-Tiket
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
