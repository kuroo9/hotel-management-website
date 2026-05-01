import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Crown, Eye, EyeOff, LogIn, Flame, Utensils, Star } from 'lucide-react';

// Floating particle component for ambiance
const FloatingParticle = ({ style }) => (
  <div
    className="absolute w-1 h-1 rounded-full pointer-events-none"
    style={{
      background: 'rgba(184,115,51,0.5)',
      animation: `float ${3 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
      ...style,
    }}
  />
);

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) navigate('/');
  };

  const demoCredentials = [
    {
      label: 'Admin',
      email: 'admin@hotel.com',
      pass: 'admin123',
      role: 'Administrator',
      icon: Crown,
      color: 'rgba(184,115,51,0.12)',
      border: 'rgba(184,115,51,0.25)',
      dot: '#B87333',
      textColor: '#D4956A',
    },
    {
      label: 'Waiter',
      email: 'waiter@hotel.com',
      pass: 'waiter123',
      role: 'Floor Staff',
      icon: Utensils,
      color: 'rgba(52,211,153,0.08)',
      border: 'rgba(52,211,153,0.2)',
      dot: '#34D399',
      textColor: '#6EE7B7',
    },
    {
      label: 'Chef',
      email: 'chef@hotel.com',
      pass: 'chef123',
      role: 'Head Chef',
      icon: Flame,
      color: 'rgba(249,125,69,0.1)',
      border: 'rgba(249,125,69,0.22)',
      dot: '#F97D45',
      textColor: '#FCA87C',
    },
  ];

  const particles = Array.from({ length: 12 }, (_, i) => ({
    top:  `${10 + Math.random() * 80}%`,
    left: `${5 + Math.random() * 90}%`,
    animationDelay: `${i * 0.4}s`,
  }));

  return (
    <div className="min-h-screen flex" style={{ background: '#0D0A08' }}>

      {/* ── Left Panel — Atmospheric Brand ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden">

        {/* Layered background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(150deg, #120E0B 0%, #1A1310 40%, #231A15 80%, #1A1310 100%)',
        }} />

        {/* Warm ambient orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none animate-breathe"
          style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.15) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none animate-breathe"
          style={{ background: 'radial-gradient(circle, rgba(232,96,28,0.1) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <FloatingParticle key={i} style={p} />
        ))}

        {/* Decorative vertical line */}
        <div className="absolute right-0 top-0 bottom-0 w-px"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(184,115,51,0.25) 30%, rgba(184,115,51,0.4) 50%, rgba(184,115,51,0.25) 70%, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #D4956A 0%, #B87333 50%, #7D4A1E 100%)',
                boxShadow: '0 8px 32px rgba(184,115,51,0.4)',
              }}>
              <Crown size={26} className="text-white" />
              <span className="absolute inset-0 rounded-2xl animate-pulse"
                style={{ boxShadow: '0 0 0 0 rgba(184,115,51,0.5)', animationDuration: '2.5s' }} />
            </div>
            <div>
              <p className="font-bold text-xl tracking-widest" style={{ fontFamily: 'Cinzel, serif', color: '#F5EDD8' }}>
                Grand Hotel
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] mt-0.5" style={{ color: 'rgba(184,115,51,0.6)' }}>
                Premium Suite
              </p>
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="divider-warm flex-1 max-w-[40px]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: '#B87333', fontFamily: 'Cinzel, serif' }}>
                Luxury Hospitality
              </span>
            </div>

            <h1 className="leading-none" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              <span className="block text-6xl font-light" style={{ color: 'rgba(245,237,216,0.7)' }}>Where every</span>
              <span className="block text-7xl font-bold mt-1 text-gradient-copper">
                Meal Tells
              </span>
              <span className="block text-6xl font-light mt-1" style={{ color: 'rgba(245,237,216,0.7)' }}>a Story</span>
            </h1>

            <p className="text-base mt-6 leading-relaxed" style={{ color: 'rgba(245,237,216,0.4)', fontWeight: 300 }}>
              The complete management platform for world-class restaurants and fine dining establishments. Orchestrate every service with elegance.
            </p>
          </div>

          {/* Feature items */}
          <div className="space-y-3">
            {[
              { icon: '🕯️', label: 'Real-Time Orders',    sub: 'Live kitchen display system' },
              { icon: '🍷', label: 'Smart Table Management', sub: 'Occupancy & reservations' },
              { icon: '🧾', label: 'Instant Billing',     sub: 'GST, split bills & receipts' },
              { icon: '📱', label: 'QR Digital Menu',     sub: 'Guest self-service ordering' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}>
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#D4956A' }}>{f.label}</p>
                  <p className="text-xs" style={{ color: 'rgba(245,237,216,0.35)' }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10">
          <div className="divider-warm mb-4" />
          <div className="flex items-center gap-2">
            <Star size={12} style={{ color: 'rgba(184,115,51,0.5)' }} />
            <p className="text-xs italic" style={{ color: 'rgba(245,237,216,0.25)' }}>
              "Where technology meets the art of hospitality."
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">

        {/* Subtle bg texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(184,115,51,0.04) 0%, transparent 70%)' }} />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #D4956A, #B87333)', boxShadow: '0 4px 16px rgba(184,115,51,0.35)' }}>
            <Crown size={19} className="text-white" />
          </div>
          <div>
            <p className="font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif', color: '#F5EDD8' }}>Grand Hotel</p>
            <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(184,115,51,0.6)' }}>Management</p>
          </div>
        </div>

        <div className="w-full max-w-sm animate-slide-up relative z-10">

          {/* Form header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(184,115,51,0.2), rgba(184,115,51,0.08))',
                border: '1px solid rgba(184,115,51,0.25)',
              }}>
              <Crown size={22} style={{ color: '#D4956A' }} />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F5EDD8' }}>
              Welcome back
            </h2>
            <p className="text-sm font-light" style={{ color: 'rgba(245,237,216,0.4)' }}>
              Sign in to access the management suite
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(184,115,51,0.7)', fontFamily: 'Cinzel, serif' }}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="you@grandhotel.com"
                value={email}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(184,115,51,0.7)', fontFamily: 'Cinzel, serif' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(245,237,216,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#D4956A'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,237,216,0.3)'}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="gold-divider flex-1" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(184,115,51,0.5)', fontFamily: 'Cinzel, serif' }}>
                Demo Access
              </span>
              <div className="gold-divider flex-1" />
            </div>

            <div className="space-y-2">
              {demoCredentials.map((cred) => (
                <button
                  key={cred.label}
                  type="button"
                  id={`demo-${cred.label.toLowerCase()}`}
                  onClick={() => { setEmail(cred.email); setPassword(cred.pass); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: cred.color,
                    border: `1px solid ${cred.border}`,
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${cred.dot}22`, border: `1px solid ${cred.dot}44` }}>
                    <cred.icon size={15} style={{ color: cred.dot }} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: '#F5EDD8' }}>{cred.label}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(245,237,216,0.4)' }}>{cred.role} · {cred.email}</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ background: cred.dot }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
