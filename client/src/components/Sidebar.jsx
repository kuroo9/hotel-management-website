import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid3X3,
  ShoppingCart,
  ChefHat,
  Receipt,
  LogOut,
  Crown,
  Menu,
  X,
  Flame,
} from 'lucide-react';

const navItems = [
  {
    group: 'Overview',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Waiter', 'Chef'] },
    ]
  },
  {
    group: 'Operations',
    items: [
      { path: '/menu',    icon: UtensilsCrossed, label: 'Menu',    roles: ['Admin', 'Waiter', 'Chef'] },
      { path: '/tables',  icon: Grid3X3,         label: 'Tables',  roles: ['Admin', 'Waiter'] },
      { path: '/orders',  icon: ShoppingCart,    label: 'Orders',  roles: ['Admin', 'Waiter'] },
      { path: '/kitchen', icon: ChefHat,         label: 'Kitchen', roles: ['Admin', 'Chef'] },
      { path: '/bills',   icon: Receipt,         label: 'Billing', roles: ['Admin', 'Waiter'] },
    ]
  }
];

const roleConfig = {
  Admin:  { label: 'Administrator', dot: '#B87333', icon: Crown },
  Waiter: { label: 'Floor Staff',   dot: '#34D399', icon: UtensilsCrossed },
  Chef:   { label: 'Head Chef',     dot: '#F97D45', icon: Flame },
};

// Animated copper flame / candle icon for logo
const CandleIcon = () => (
  <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
    style={{
      background: 'linear-gradient(135deg, #D4956A 0%, #B87333 50%, #7D4A1E 100%)',
      boxShadow: '0 4px 20px rgba(184,115,51,0.45), 0 0 40px rgba(184,115,51,0.12)',
    }}>
    <Crown size={19} className="text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
    {/* Animated glow ring */}
    <span className="absolute inset-0 rounded-xl animate-pulse-gold" style={{ boxShadow: '0 0 0 0 rgba(184,115,51,0.5)' }} />
  </div>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  // Live clock in sidebar
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const role = user?.role || 'Admin';
  const rc = roleConfig[role] || roleConfig.Admin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full relative">

      {/* ── Logo Area ── */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,240,220,0.06)' }}>
        <div className="flex items-center gap-3">
          <CandleIcon />
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <p className="font-bold text-sm tracking-wide leading-tight"
                style={{ fontFamily: 'Cinzel, serif', color: '#F5EDD8', letterSpacing: '0.06em' }}>
                Grand Hotel
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] mt-0.5"
                style={{ color: 'rgba(184,115,51,0.6)' }}>
                Management Suite
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── User Card ── */}
      {!collapsed && (
        <div className="mx-3 my-4 animate-fade-in">
          <div className="rounded-xl px-4 py-3.5"
            style={{
              background: 'linear-gradient(135deg, rgba(184,115,51,0.1) 0%, rgba(184,115,51,0.04) 100%)',
              border: '1px solid rgba(184,115,51,0.2)',
            }}>
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #D4956A, #B87333)',
                  color: '#FFF8F0',
                  boxShadow: '0 2px 12px rgba(184,115,51,0.35)',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1rem',
                }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#F5EDD8' }}>{user?.name || 'Guest'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: rc.dot }} />
                  <p className="text-[10px]" style={{ color: 'rgba(184,115,51,0.7)' }}>{rc.label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto scrollbar-hide pb-4">
        {navItems.map((group) => {
          const filteredItems = group.items.filter(item => item.roles.includes(role));
          if (filteredItems.length === 0) return null;

          return (
            <div key={group.group}>
              {!collapsed && (
                <p className="section-label px-3 mb-2">{group.group}</p>
              )}
              <div className="space-y-0.5">
                {filteredItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={17} className="shrink-0" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Live Clock (only expanded) ── */}
      {!collapsed && (
        <div className="mx-3 mb-4 animate-fade-in">
          <div className="px-4 py-3 rounded-xl text-center"
            style={{ background: 'rgba(255,240,220,0.03)', border: '1px solid rgba(255,240,220,0.05)' }}>
            <p className="text-xs font-light" style={{ color: 'rgba(245,237,216,0.35)', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
              {time.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xl font-bold mt-0.5" style={{
              color: 'rgba(184,115,51,0.8)',
              fontFamily: 'Cormorant Garamond, serif',
              letterSpacing: '0.05em',
            }}>
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      )}

      {/* ── Logout ── */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(255,240,220,0.05)' }}>
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full mt-3 hover:text-red-400 hover:bg-red-500/10 ${collapsed ? 'justify-center px-3' : ''}`}
          style={{ color: 'rgba(252,165,165,0.55)' }}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Decorative ambient glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(184,115,51,0.08) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }} />
    </div>
  );

  return (
    <>
      {/* ── Mobile Hamburger ── */}
      <button
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl lg:hidden"
        style={{ background: 'rgba(255,240,220,0.06)', border: '1px solid rgba(255,240,220,0.08)' }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} style={{ color: '#D4956A' }} /> : <Menu size={20} style={{ color: '#D4956A' }} />}
      </button>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(8,5,3,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: '#120E0B',
          borderRight: '1px solid rgba(184,115,51,0.12)',
          boxShadow: '8px 0 40px rgba(0,0,0,0.6)',
        }}
      >
        {renderSidebarContent()}
      </aside>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col h-full flex-shrink-0 transition-all duration-300 relative ${collapsed ? 'w-[72px]' : 'w-64'}`}
        style={{
          background: 'linear-gradient(180deg, #120E0B 0%, #0D0A08 100%)',
          borderRight: '1px solid rgba(184,115,51,0.1)',
        }}
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(184,115,51,0.4), transparent)' }} />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 z-10"
          style={{
            background: '#1A1310',
            border: '1px solid rgba(184,115,51,0.25)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
          aria-label="Toggle sidebar"
        >
          <Menu size={11} style={{ color: '#B87333' }} />
        </button>

        {renderSidebarContent()}
      </aside>
    </>
  );
}
