import React, { useEffect, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { AlertCircle, Lock, ShieldCheck, X } from 'lucide-react';
import {
  auth,
  facebookProvider,
  googleProvider,
  instagramOidcProvider,
} from '../lib/firebase';
import { AuthenticatedAppUser, SocialProviderType } from '../lib/firestoreBookings';
import { AuthModalMode } from '../utils/authGate';

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthModalMode;
  gateMessage: string | null;
  onChangeMode: (mode: AuthModalMode) => void;
  onClose: () => void;
  onAuthenticated: (user: AuthenticatedAppUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  gateMessage,
  onChangeMode,
  onClose,
  onAuthenticated,
}) => {
  const [loadingProvider, setLoadingProvider] = useState<SocialProviderType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setLoadingProvider(null);
    }
  }, [isOpen, mode]);

  // Listen for 3P Instagram Popup OAuth callback postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin || '';
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'instagram') {
        const igUser = event.data.user;
        setLoadingProvider(null);
        setErrorMessage(null);
        onAuthenticated({
          uid: String(igUser?.uid || 'ig_user'),
          displayName: String(igUser?.displayName || 'Pengguna Instagram'),
          email: '',
          provider: 'instagram',
          isFirebaseBacked: false,
        });
      } else if (event.data?.type === 'INSTAGRAM_OAUTH_ERROR') {
        setLoadingProvider(null);
        setErrorMessage(
          String(event.data.error || 'Autentikasi Instagram dibatalkan atau gagal.')
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthenticated]);

  if (!isOpen) return null;

  const mapFirebaseAuthError = (err: unknown, providerName: string): string => {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return `Jendela login ${providerName} ditutup sebelum selesai. Silakan coba kembali.`;
    }
    if (code === 'auth/popup-blocked') {
      return `Popup browser diblokir. Izinkan popup untuk situs ini agar dapat melanjutkan dengan ${providerName}.`;
    }
    if (code === 'auth/operation-not-allowed') {
      return `Metode masuk ${providerName} belum diaktifkan di Firebase Console > Authentication > Sign-in method. Gunakan masuk dengan Google yang sudah aktif otomatis, atau aktifkan provider ${providerName} di konsol proyek Anda.`;
    }
    if (code === 'auth/account-exists-with-different-credential') {
      return `Email akun ini sudah terdaftar dengan metode masuk sosial lain. Silakan masuk menggunakan provider sebelumnya.`;
    }
    return err instanceof Error ? err.message : `Gagal memproses autentikasi ${providerName}.`;
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoadingProvider('google');
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const u = cred.user;
      onAuthenticated({
        uid: u.uid,
        displayName: u.displayName || u.email?.split('@')[0] || 'Pengguna Google',
        email: u.email || '',
        photoURL: u.photoURL || undefined,
        provider: 'google',
        isFirebaseBacked: true,
      });
    } catch (err) {
      setErrorMessage(mapFirebaseAuthError(err, 'Google'));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setErrorMessage(null);
    setLoadingProvider('facebook');
    try {
      const cred = await signInWithPopup(auth, facebookProvider);
      const u = cred.user;
      onAuthenticated({
        uid: u.uid,
        displayName: u.displayName || u.email?.split('@')[0] || 'Pengguna Facebook',
        email: u.email || '',
        photoURL: u.photoURL || undefined,
        provider: 'facebook',
        isFirebaseBacked: true,
      });
    } catch (err) {
      setErrorMessage(mapFirebaseAuthError(err, 'Facebook'));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleInstagramSignIn = async () => {
    setErrorMessage(null);
    setLoadingProvider('instagram');
    try {
      // 1. Check if direct Meta Instagram OAuth 2.0 credentials are configured on server
      const resp = await fetch('/api/auth/instagram/url');
      if (resp.ok) {
        const data = (await resp.json()) as { url?: string };
        if (data.url) {
          const popup = window.open(data.url, 'instagram_oauth_popup', 'width=600,height=720');
          if (!popup) {
            setLoadingProvider(null);
            setErrorMessage(
              'Popup diblokir oleh browser. Izinkan popup untuk melanjutkan login Instagram.'
            );
          }
          return;
        }
      }

      // 2. Fallback to Firebase Auth Custom OIDC Provider ('oidc.instagram') if configured in Firebase Console
      const cred = await signInWithPopup(auth, instagramOidcProvider);
      const u = cred.user;
      onAuthenticated({
        uid: u.uid,
        displayName: u.displayName || 'Pengguna Instagram',
        email: u.email || '',
        photoURL: u.photoURL || undefined,
        provider: 'instagram',
        isFirebaseBacked: true,
      });
      setLoadingProvider(null);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setErrorMessage(
          'Untuk mengaktifkan Login Instagram, tambahkan INSTAGRAM_CLIENT_ID & INSTAGRAM_CLIENT_SECRET dari Meta for Developers pada panel Secrets proyek, atau aktifkan provider oidc.instagram di Firebase Console. Anda juga dapat langsung masuk menggunakan Google.'
        );
      } else {
        setErrorMessage(mapFirebaseAuthError(err, 'Instagram'));
      }
      setLoadingProvider(null);
    }
  };

  const actionVerb = mode === 'login' ? 'Masuk' : 'Daftar';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#00224D]/70 backdrop-blur-xs p-4"
    >
      <div className="bg-white text-[#0A2540] rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Navy Header */}
        <div className="bg-[#00224D] text-white px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#FBBF24] block mb-1">
              Akun Resmi NusaTrip
            </span>
            <h2 id="auth-modal-heading" className="text-xl font-bold font-display text-white">
              {mode === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Tutup jendela login"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode Tabs: Login vs Daftar */}
          <div
            role="tablist"
            aria-label="Pilih Masuk atau Daftar"
            className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => onChangeMode('login')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#0A2540] shadow-xs'
                  : 'text-slate-600 hover:text-[#0A2540]'
              }`}
            >
              Login (Masuk)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => onChangeMode('register')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#0A2540] shadow-xs'
                  : 'text-slate-600 hover:text-[#0A2540]'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Mandatory Login Gate Notice when triggered from Pesan Sekarang */}
          {gateMessage && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5"
            >
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="leading-relaxed font-medium">{gateMessage}</span>
            </div>
          )}

          {/* Error Feedback */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            {mode === 'login'
              ? 'Pilih akun sosial Anda untuk masuk dengan cepat dan melanjutkan pemesanan tiket atau hotel.'
              : 'Daftar instan dalam satu klik menggunakan akun Google, Facebook, atau Instagram Anda tanpa perlu menghafal kata sandi baru.'}
          </p>

          {/* 3 Social Login Buttons: Google, Facebook, Instagram */}
          <div className="space-y-3">
            {/* 1. Google */}
            <button
              type="button"
              disabled={loadingProvider !== null}
              onClick={handleGoogleSignIn}
              className="w-full h-12 px-4 rounded-xl border border-slate-300 hover:border-[#0084FF] hover:bg-slate-50 bg-white text-[#0A2540] font-semibold text-sm transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>
                {loadingProvider === 'google'
                  ? 'Menghubungkan Google...'
                  : `${actionVerb} dengan Google`}
              </span>
            </button>

            {/* 2. Facebook */}
            <button
              type="button"
              disabled={loadingProvider !== null}
              onClick={handleFacebookSignIn}
              className="w-full h-12 px-4 rounded-xl bg-[#1877F2] hover:bg-[#1666D5] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>
                {loadingProvider === 'facebook'
                  ? 'Menghubungkan Facebook...'
                  : `${actionVerb} dengan Facebook`}
              </span>
            </button>

            {/* 3. Instagram */}
            <button
              type="button"
              disabled={loadingProvider !== null}
              onClick={handleInstagramSignIn}
              className="w-full h-12 px-4 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-95 text-white font-semibold text-sm transition-opacity flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>
                {loadingProvider === 'instagram'
                  ? 'Menghubungkan Instagram...'
                  : `${actionVerb} dengan Instagram`}
              </span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#0084FF] shrink-0" aria-hidden="true" />
            <span>Wajib login sebelum memesan · Data E-Tiket tersimpan aman di akun Anda</span>
          </div>
        </div>
      </div>
    </div>
  );
};
