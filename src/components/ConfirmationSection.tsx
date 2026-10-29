import React from 'react';
import { ArrowLeft, CheckCircle2, Printer, Ticket } from 'lucide-react';
import { ConfirmedBooking } from '../types/travel';
import { formatRupiah } from '../utils/bookingLogic';

interface ConfirmationSectionProps {
  booking: ConfirmedBooking;
  onExploreAgain: () => void;
  onViewAllBookings: () => void;
}

export const ConfirmationSection: React.FC<ConfirmationSectionProps> = ({
  booking,
  onExploreAgain,
  onViewAllBookings,
}) => {
  const effectiveGuestName = booking.guest.sameAsContact
    ? booking.contact.fullName
    : booking.guest.guestFullName;

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-[#00224D] text-white rounded-t-2xl p-6 sm:p-8 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <CheckCircle2
                className="w-8 h-8 text-[#F59E0B] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-[#FBBF24] mb-1">
                  Langkah 4 · Konfirmasi & E-Tiket / Voucher Resmi
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Pemesanan Berhasil Dikonfirmasi
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Salinan E-Tiket telah dikirimkan ke WhatsApp{' '}
                  <span className="font-mono text-white">{booking.contact.phone}</span> dan email{' '}
                  <span className="font-medium text-white">{booking.contact.email}</span>.
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-white/10 rounded-xl px-4 py-3 shrink-0">
              <span className="block text-[11px] text-slate-300">Kode Booking NusaTrip</span>
              <span className="text-xl font-bold font-mono tracking-wider text-[#FBBF24] tabular-nums">
                {booking.bookingCode}
              </span>
            </div>
          </div>
        </div>

        {/* E-Ticket / Voucher Details Card */}
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          {/* Primary Service Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold text-[#0084FF]">
                E-Tiket / Voucher Perjalanan
              </span>
              <h2 className="text-xl font-bold text-[#0A2540] mt-1">{booking.listing.title}</h2>
              <p className="text-sm font-medium text-slate-700 mt-0.5">
                {booking.listing.subtitle}
              </p>
              <p className="text-xs text-slate-500 mt-1">{booking.listing.scheduleInfo}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-semibold text-emerald-700">
                Status: {booking.status}
              </span>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                Tanggal Perjalanan: {booking.searchCriteria.checkInOrDepartDate}
              </p>
              <p className="text-xs text-slate-500 tabular-nums">
                Jumlah: {booking.pricing.quantity}{' '}
                {booking.listing.category === 'hotel'
                  ? `kamar × ${booking.pricing.nightsOrUnits} malam`
                  : booking.listing.category === 'car_rental'
                    ? `unit × ${booking.pricing.nightsOrUnits} hari`
                    : booking.listing.unitLabel}
              </p>
            </div>
          </div>

          {/* Passenger / Guest & Payment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200 text-sm">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500">Data Pemesan & Tamu Utama</h3>
              <p className="font-bold text-[#0A2540]">{effectiveGuestName}</p>
              <p className="text-xs text-slate-600">
                Pemesan: {booking.contact.fullName} · {booking.contact.phone}
              </p>
              {booking.addOns.travelInsurance && (
                <p className="text-xs font-semibold text-[#0084FF]">
                  Dilindungi Asuransi Perjalanan Lengkap
                </p>
              )}
              {(booking.addOns.specialRequests.length > 0 || booking.addOns.customNote) && (
                <p className="text-xs text-slate-600">
                  Permintaan Khusus:{' '}
                  {[...booking.addOns.specialRequests, booking.addOns.customNote]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500">Rincian Metode Pembayaran</h3>
              <p className="font-bold text-[#0A2540]">{booking.paymentMethod.name}</p>
              <p className="text-xs text-slate-600 font-mono tabular-nums">
                Nomor Referensi / VA: {booking.paymentReference}
              </p>
              <p className="text-xs text-slate-600">
                Total Dibayar:{' '}
                <span className="font-bold text-[#0A2540] font-mono tabular-nums">
                  {formatRupiah(booking.pricing.totalAmount)}
                </span>
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onExploreAgain}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0A2540] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Pesan Layanan Lainnya</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#0A2540] inline-flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Cetak E-Tiket</span>
              </button>

              <button
                type="button"
                onClick={onViewAllBookings}
                className="px-5 py-2.5 rounded-xl bg-[#0084FF] hover:bg-[#006CE0] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" aria-hidden="true" />
                <span>Lihat Daftar Pesanan Saya</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
