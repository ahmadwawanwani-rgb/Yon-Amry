import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ServiceCategory } from '../types/travel';

interface FooterProps {
  onSelectCategory: (category: ServiceCategory) => void;
}

type SupportModalTopic = 'faq' | 'privacy' | 'terms' | 'contact' | null;

const PAYMENT_PARTNER_LIST = [
  'TPayLater',
  'VISA',
  'Mastercard',
  'JCB',
  'Amex',
  'QRIS',
  'GoPay',
  'OVO',
  'BCA',
  'Mandiri',
  'BRI',
  'BNI',
  'CIMB Niaga',
  'Permata Bank',
  'ATM Bersama',
  'PRIMA',
  'ALTO',
  'Alfamart',
  'Indomaret',
];

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const [activeModal, setActiveModal] = useState<SupportModalTopic>(null);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'faq':
        return {
          title: 'Pusat Bantuan (FAQ)',
          body: [
            '1. Kapan E-Tiket atau Voucher Hotel saya terbit? E-Tiket dan voucher resmi diterbitkan secara otomatis dalam hitungan detik setelah pembayaran terverifikasi.',
            '2. Bagaimana cara naik Kereta Cepat Whoosh & KA Feeder? Tunjukkan QR E-Tiket NusaTrip langsung di gerbang pemindaian Stasiun Halim, Padalarang, atau Tegalluar.',
            '3. Apakah bisa mengajukan pengembalian dana (Refund) atau perubahan jadwal (Reschedule)? Layanan bertanda Pembatalan Gratis atau Jadwal Fleksibel dapat diubah langsung melalui menu Pesanan Saya.',
          ],
        };
      case 'privacy':
        return {
          title: 'Kebijakan Privasi',
          body: [
            'Data identitas pemesan dan penumpang (nama lengkap sesuai KTP/Paspor, nomor WhatsApp, dan email) hanya digunakan untuk penerbitan E-Tiket resmi maskapai, operator kereta, dan properti akomodasi.',
            'Seluruh transaksi pembayaran diproses melalui gerbang pembayaran berlisensi dengan enkripsi penuh.',
          ],
        };
      case 'terms':
        return {
          title: 'Syarat & Ketentuan Layanan',
          body: [
            'Pastikan penulisan nama lengkap tamu atau penumpang sesuai dengan identitas resmi (KTP/SIM/Paspor) yang masih berlaku saat check-in.',
            'Kode promo khusus memiliki kuota harian dan nilai potongan maksimum sesuai ketentuan masing-masing program.',
          ],
        };
      case 'contact':
        return {
          title: 'Hubungi Kami 24/7',
          body: [
            'Pusat Layanan Pelanggan 24 Jam: 0804-1-500-888 (Seluruh Indonesia)',
            'WhatsApp Resmi Terverifikasi: +62 811-9500-888',
            'Email Bantuan Pemesanan: cs@nusatrip-travel.id',
          ],
        };
      default:
        return null;
    }
  };

  const modalData = renderModalContent();

  return (
    <footer className="bg-[#00224D] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Summary */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-2xl font-bold text-white font-display tracking-tight block">
              NusaTrip
            </span>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Pilihan utama untuk jelajahi dunia. Platform pemesanan akomodasi, transportasi
              antarkota, kereta cepat Whoosh, hingga aktivitas wisata dalam satu pengalaman bersih
              dan terpercaya.
            </p>
            <p className="text-xs text-[#FBBF24] font-medium pt-1">
              Layanan Pelanggan Siaga 24/7 · Konfirmasi E-Tiket Instan
            </p>
          </div>

          {/* Menu Produk */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold text-white mb-4">Menu Produk</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('hotel')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Hotel, Vila & Apartemen
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('flight')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tiket Pesawat
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('train')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tiket Kereta Api (Whoosh)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('bus')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tiket Bus & Travel
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('airport_transfer')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Antar Jemput Bandara
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('car_rental')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Rental Mobil
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('attraction')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Atraksi & Aktivitas
                </button>
              </li>
            </ul>
          </div>

          {/* Layanan Pelanggan */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-white mb-4">Layanan Pelanggan</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('faq')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Pusat Bantuan (FAQ)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Syarat & Ketentuan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Hubungi Kami 24/7
                </button>
              </li>
            </ul>
          </div>

          {/* Partner Pembayaran */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold text-white mb-4">Partner Pembayaran Resmi</h2>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_PARTNER_LIST.map((partner) => (
                <div
                  key={partner}
                  className="bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white whitespace-nowrap"
                >
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NusaTrip Indonesia. Seluruh hak cipta dilindungi.</p>
          <p>Terdaftar & diawasi sesuai standar transaksi elektronik nasional.</p>
        </div>
      </div>

      {/* Accessible Support Info Dialog */}
      {modalData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="bg-white text-[#0A2540] rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200">
              <h3 id="support-modal-title" className="text-lg font-bold text-[#0A2540]">
                {modalData.title}
              </h3>
              <button
                type="button"
                aria-label="Tutup jendela informasi"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0A2540] cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              {modalData.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#0084FF] hover:bg-[#006CE0] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
