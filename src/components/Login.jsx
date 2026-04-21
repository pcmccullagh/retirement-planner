import React from 'react'
import { useGoogleAuth } from '../context/GoogleAuthContext.jsx'

export default function Login() {
  const { signIn, error } = useGoogleAuth()

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sage/5 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-slate-editorial mb-2">Our Retirement Plan</h1>
          <p className="text-slate-400 text-sm font-sans">
            A private planning space for Peter & Jennifer
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-card border border-cream-dark p-8">
          <p className="text-sm text-slate-500 text-center mb-6 font-sans leading-relaxed">
            Sign in with your Google account to access your shared financial roadmap. Your data is stored privately in your Google Drive.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-terracotta-light border border-terracotta/20 rounded-xl">
              <p className="text-xs text-terracotta font-sans">{error}</p>
            </div>
          )}

          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-cream border-2 border-cream-dark hover:border-gold/30 text-slate-editorial font-medium py-3 px-6 rounded-xl transition-all duration-150 shadow-sm hover:shadow-md"
          >
            {/* Google logo */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-5 pt-5 border-t border-cream-dark">
            <div className="flex items-start gap-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B9E7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Your data is saved to a private folder in your Google Drive called <strong className="text-slate-500">"Our Retirement Plan"</strong>. Only people you share that folder with can access it.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6 font-sans">
          Personal use only · Not financial advice
        </p>
      </div>
    </div>
  )
}
