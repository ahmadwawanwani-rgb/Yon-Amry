# Security Specification — NusaTrip Travel & Booking Platform

## 1. Data Invariants & Master Source of Truth

1. **Default-Deny Catch-All**: Every path not explicitly matched is strictly denied (`allow read, write: if false`).
2. **Verified Identity Invariant**: All write operations require `request.auth != null` and `request.auth.token.email_verified == true`.
3. **PII Split Isolation (`/users/{userId}` vs `/users/{userId}/private/{docId}`)**:
   - `/users/{userId}` stores only non-PII public profile fields (`uid`, `displayName`, `provider`, `photoURL`, `createdAt`) and is readable/writable strictly by `request.auth.uid == userId`.
   - `/users/{userId}/private/{docId}` stores PII (`email`, `phone`) where `docId == 'info'`, requires parent `/users/$(userId)` existence (Master Gate), and restricts `get`/`create`/`update` strictly to `request.auth.uid == userId`. `list` and `delete` are forbidden.
4. **Booking Ownership & Relational Consistency (`/bookings/{bookingId}`)**:
   - A booking can only be created if `incoming().ownerId == request.auth.uid`, `bookingId == incoming().bookingCode`, `exists(/databases/$(database)/documents/users/$(request.auth.uid))` is true, and `incoming().createdAt == request.time`.
   - `get` and `list` on `/bookings` strictly enforce `resource.data.ownerId == request.auth.uid` (no blanket `isSignedIn()` reads, no `get()` inside `allow list`).
   - Terminal State Locking: Once `resource.data.status == 'DIBATALKAN'`, no subsequent updates are allowed. Updates from `'LUNAS & TERKONFIRMASI'` can only transition `status` to `'DIBATALKAN'` with `updatedAt == request.time`, keeping `ownerId`, `bookingCode`, and `createdAt` immutable.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Attack Vectors)

1. **Unauthenticated Booking Creation**: `auth = null` attempting `create` on `/bookings/NT-100001` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoofing**: `auth = { uid: 'userA', token: { email: 'victim@mail.com', email_verified: false } }` attempting `create` on `/users/userA` -> `PERMISSION_DENIED`.
3. **Identity Spoofing on Booking (`ownerId` Mismatch)**: `userA` creating `/bookings/NT-100001` with `ownerId: 'userB'` -> `PERMISSION_DENIED`.
4. **Orphaned Booking Without User Profile**: `userNoProfile` creating `/bookings/NT-100002` before `/users/userNoProfile` exists -> `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: `userA` creating `/users/userA` with `{ ..., isAdmin: true }` -> `PERMISSION_DENIED` (`hasOnly` check rejects extra key).
6. **Cross-User PII Leak (`get` on `/users/userB/private/info`)**: `userA` reading `userB`'s private PII document -> `PERMISSION_DENIED`.
7. **Unauthorized Blanket List Scraping on `/bookings`**: `userA` running an unfiltered `collection(db, 'bookings')` query -> `PERMISSION_DENIED` (`resource.data.ownerId == request.auth.uid` blocks unscoped list).
8. **ID Poisoning Attack**: `userA` creating `/bookings/bad..id$%` or >128 char ID -> `PERMISSION_DENIED` (`isValidId` regex/length guard).
9. **Denial-of-Wallet Oversized String**: `userA` writing a 5,000-character `listingTitle` -> `PERMISSION_DENIED` (`.size() <= 160` guard).
10. **Client Timestamp Forgery**: `userA` creating `/bookings/NT-100003` with a past `Timestamp` instead of `serverTimestamp()` (`request.time`) -> `PERMISSION_DENIED`.
11. **Value Poisoning on Update**: `userA` updating `/bookings/NT-100001` with `totalAmount: -1` or `status: 'HACKED'` -> `PERMISSION_DENIED` (`affectedKeys().hasOnly` + `isValidBookingRecord`).
12. **Terminal State Unlocking**: `userA` attempting to update a booking whose `status` is already `'DIBATALKAN'` back to `'LUNAS & TERKONFIRMASI'` -> `PERMISSION_DENIED`.
