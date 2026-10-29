import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { PAYMENT_METHODS, TRAVEL_CATALOG } from '../data/travelCatalog';
import { ConfirmedBooking, ServiceCategory } from '../types/travel';
import { OperationType, db, handleFirestoreError } from './firebase';

export type SocialProviderType = 'google' | 'facebook' | 'instagram';

export interface AuthenticatedAppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: SocialProviderType;
  isFirebaseBacked: boolean;
}

const sanitizeString = (val: string, maxLen: number, fallback: string): string => {
  const trimmed = (val || '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
};

export async function ensureUserProfileInFirestore(user: AuthenticatedAppUser): Promise<void> {
  if (!user.isFirebaseBacked) return;

  const userDocRef = doc(db, 'users', user.uid);
  const privateDocRef = doc(db, 'users', user.uid, 'private', 'info');

  try {
    const existingSnap = await getDoc(userDocRef);
    const safeName = sanitizeString(user.displayName, 100, 'Pengguna NusaTrip');
    const safeEmail = sanitizeString(user.email, 160, 'pengguna@nusatrip.id');

    if (!existingSnap.exists()) {
      const batch = writeBatch(db);
      const publicPayload: Record<string, unknown> = {
        uid: user.uid,
        displayName: safeName,
        provider: user.provider,
        createdAt: serverTimestamp(),
      };
      if (user.photoURL) {
        publicPayload.photoURL = user.photoURL.slice(0, 500);
      }

      batch.set(userDocRef, publicPayload);
      batch.set(privateDocRef, {
        uid: user.uid,
        email: safeEmail,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function saveBookingToFirestore(
  user: AuthenticatedAppUser,
  booking: ConfirmedBooking
): Promise<void> {
  if (!user.isFirebaseBacked) return;

  const path = `bookings/${booking.bookingCode}`;
  try {
    // Ensure user profile exists first (satisfies Master Gate invariant)
    await ensureUserProfileInFirestore(user);

    const effectiveGuestName = booking.guest.sameAsContact
      ? booking.contact.fullName
      : booking.guest.guestFullName;

    const specialSummary = [
      ...booking.addOns.specialRequests,
      booking.addOns.customNote,
    ]
      .filter(Boolean)
      .join(', ')
      .slice(0, 300);

    const payload: Record<string, unknown> = {
      bookingCode: booking.bookingCode.slice(0, 32),
      ownerId: user.uid,
      listingId: booking.listing.id.slice(0, 64),
      listingTitle: sanitizeString(booking.listing.title, 160, 'Layanan Perjalanan'),
      listingSubtitle: sanitizeString(booking.listing.subtitle, 200, 'Indonesia'),
      category: booking.listing.category,
      checkInOrDepartDate: sanitizeString(
        booking.searchCriteria.checkInOrDepartDate,
        20,
        '2026-11-14'
      ),
      quantity: Math.min(20, Math.max(1, Math.round(booking.pricing.quantity))),
      nightsOrUnits: Math.min(60, Math.max(1, Math.round(booking.pricing.nightsOrUnits))),
      unitLabel: sanitizeString(booking.listing.unitLabel, 32, 'tiket'),
      scheduleInfo: sanitizeString(booking.listing.scheduleInfo, 160, 'Sesuai jadwal'),
      contactFullName: sanitizeString(booking.contact.fullName, 100, 'Pemesan'),
      contactPhone: sanitizeString(booking.contact.phone, 25, '081200000000'),
      contactEmail: sanitizeString(booking.contact.email, 160, 'pemesan@email.com'),
      guestFullName: sanitizeString(effectiveGuestName, 100, 'Tamu Utama'),
      travelInsurance: Boolean(booking.addOns.travelInsurance),
      paymentMethodId: sanitizeString(booking.paymentMethod.id, 40, 'ewallet-qris'),
      paymentMethodName: sanitizeString(booking.paymentMethod.name, 80, 'QRIS'),
      paymentReference: sanitizeString(booking.paymentReference, 64, 'REF-0001'),
      totalAmount: Math.min(500000000, Math.max(0, Math.round(booking.pricing.totalAmount))),
      status: 'LUNAS & TERKONFIRMASI',
      createdAt: serverTimestamp(),
    };

    if (booking.searchCriteria.checkOutDate) {
      payload.checkOutDate = booking.searchCriteria.checkOutDate.slice(0, 20);
    }
    if (specialSummary) {
      payload.specialRequestsSummary = specialSummary;
    }

    await setDoc(doc(db, 'bookings', booking.bookingCode), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserBookings(
  user: AuthenticatedAppUser,
  onBookingsLoaded: (bookings: ConfirmedBooking[]) => void
): () => void {
  if (!user.isFirebaseBacked) {
    return () => {};
  }

  const q = query(collection(db, 'bookings'), where('ownerId', '==', user.uid));
  return onSnapshot(
    q,
    (snap) => {
      const mapped: ConfirmedBooking[] = snap.docs.map((d) => {
        const data = d.data();
        const catalogMatch =
          TRAVEL_CATALOG.find((item) => item.id === data.listingId) || TRAVEL_CATALOG[0];
        const paymentMatch =
          PAYMENT_METHODS.find((m) => m.id === data.paymentMethodId) || PAYMENT_METHODS[0];

        return {
          bookingCode: String(data.bookingCode || d.id),
          createdAt: new Date().toISOString(),
          listing: {
            ...catalogMatch,
            id: String(data.listingId || catalogMatch.id),
            title: String(data.listingTitle || catalogMatch.title),
            subtitle: String(data.listingSubtitle || catalogMatch.subtitle),
            category: (data.category as ServiceCategory) || catalogMatch.category,
            unitLabel: String(data.unitLabel || catalogMatch.unitLabel),
            scheduleInfo: String(data.scheduleInfo || catalogMatch.scheduleInfo),
          },
          searchCriteria: {
            category: (data.category as ServiceCategory) || catalogMatch.category,
            hotelSubFilter: 'Semua',
            origin: '',
            destination: '',
            checkInOrDepartDate: String(data.checkInOrDepartDate || '2026-11-14'),
            checkOutDate: String(data.checkOutDate || '2026-11-16'),
            quantity: Number(data.quantity || 1),
            keyword: '',
          },
          contact: {
            fullName: String(data.contactFullName || ''),
            phone: String(data.contactPhone || ''),
            email: String(data.contactEmail || ''),
          },
          guest: {
            sameAsContact: data.contactFullName === data.guestFullName,
            guestFullName: String(data.guestFullName || ''),
            idType: 'KTP',
            idNumber: '',
          },
          addOns: {
            travelInsurance: Boolean(data.travelInsurance),
            specialRequests: data.specialRequestsSummary
              ? String(data.specialRequestsSummary).split(', ')
              : [],
            customNote: '',
          },
          paymentMethod: {
            ...paymentMatch,
            id: String(data.paymentMethodId || paymentMatch.id),
            name: String(data.paymentMethodName || paymentMatch.name),
          },
          paymentReference: String(data.paymentReference || ''),
          pricing: {
            unitPrice: catalogMatch.basePrice,
            quantity: Number(data.quantity || 1),
            nightsOrUnits: Number(data.nightsOrUnits || 1),
            subtotal: Number(data.totalAmount || 0),
            taxAndServiceFee: 0,
            insuranceFee: 0,
            paymentFee: 0,
            promoDiscount: 0,
            promoCodeApplied: null,
            totalAmount: Number(data.totalAmount || 0),
          },
          status:
            data.status === 'MENUNGGU PEMBAYARAN'
              ? 'MENUNGGU PEMBAYARAN'
              : 'LUNAS & TERKONFIRMASI',
        };
      });

      onBookingsLoaded(mapped);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    }
  );
}
