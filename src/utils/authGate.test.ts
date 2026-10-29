import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAVEL_CATALOG } from '../data/travelCatalog';
import {
  deriveProviderLabel,
  evaluateBookingAuthGate,
  hasPendingBookingToResume,
  prefillContactFromUser,
} from './authGate';
import { AuthenticatedAppUser } from '../lib/firestoreBookings';

const sampleListing = TRAVEL_CATALOG[0];

const mockGoogleUser: AuthenticatedAppUser = {
  uid: 'usr_google_123',
  displayName: 'Ahmad Wawan',
  email: 'ahmad@contoh.id',
  provider: 'google',
  isFirebaseBacked: true,
};

test('evaluateBookingAuthGate blocks unauthenticated user and opens auth modal with pending listing', () => {
  const res = evaluateBookingAuthGate(null, sampleListing);
  assert.equal(res.allowed, false);
  assert.equal(res.shouldOpenAuthModal, true);
  assert.equal(res.pendingListing?.id, sampleListing.id);
  assert.ok(res.reasonMessage?.includes('masuk atau daftar'));
});

test('evaluateBookingAuthGate allows authenticated user (Google / Facebook / Instagram) to proceed directly', () => {
  const res = evaluateBookingAuthGate(mockGoogleUser, sampleListing);
  assert.equal(res.allowed, true);
  assert.equal(res.shouldOpenAuthModal, false);
  assert.equal(res.pendingListing, null);
});

test('deriveProviderLabel maps Google, Facebook, and Instagram cleanly', () => {
  assert.equal(deriveProviderLabel('google'), 'Google');
  assert.equal(deriveProviderLabel('facebook'), 'Facebook');
  assert.equal(deriveProviderLabel('instagram'), 'Instagram');
});

test('prefillContactFromUser populates name and email while preserving existing phone', () => {
  const contact = prefillContactFromUser(mockGoogleUser, '081288990011');
  assert.equal(contact.fullName, 'Ahmad Wawan');
  assert.equal(contact.email, 'ahmad@contoh.id');
  assert.equal(contact.phone, '081288990011');
});

test('hasPendingBookingToResume returns true only when both user and pendingListing exist', () => {
  assert.equal(hasPendingBookingToResume(null, sampleListing), false);
  assert.equal(hasPendingBookingToResume(mockGoogleUser, null), false);
  assert.equal(hasPendingBookingToResume(mockGoogleUser, sampleListing), true);
});
