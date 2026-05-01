import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Users,
  Clock,
  ShoppingCart,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Utensils,
  Crown,
  Flame,
  Star,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeTables: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, tablesRes, billsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/orders`),
        axios.get(`${import.meta.env.VITE_API_URL}/tables`),
        axios.get(`${import.meta.env.VITE_API_URL}/bills`),
      ]);
      const revenue = billsRes.data.reduce((sum, b) => sum + (b.total || 0), 0);
      const active  = tablesRes.data.filter(t => t.status === 'Occupied').length;
      const pending = ordersRes.data.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
      setStats({ totalOrders: ordersRes.data.length, activeTables: active, totalRevenue: revenue, pendingOrders: pending, totalTables: tablesRes.data.length });
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      sub: 'All time earnings',
      positive: true,
      accent: '#B87333',
      accentBg: 'rgba(184,115,51,0.1)',
      accentBorder: 'rgba(184,115,51,0.2)',
      glow: 'rgba(184,115,51,0.08)',
    },
    {
      title: 'Active Tables',
      value: `${stats.activeTables} / ${stats.totalTables || 8}`,
      icon: Users,
      sub: `${stats.activeTables} occupied right now`,
      positive: true,
      accent: '#6EE7B7',
      accentBg: 'rgba(110,231,183,0.08)',
      accentBorder: 'rgba(110,231,183,0.2)',
      glow: 'rgba(52,211,153,0.05)',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Flame,
      sub: 'Kitchen queue depth',
      positive: stats.pendingOrders < 5,
      accent: stats.pendingOrders >= 5 ? '#F97D45' : '#6EE7B7',
      accentBg: stats.pendingOrders >= 5 ? 'rgba(249,125,69,0.09)' : 'rgba(110,231,183,0.08)',
      accentBorder: stats.pendingOrders >= 5 ? 'rgba(249,125,69,0.22)' : 'rgba(110,231,183,0.2)',
      glow: stats.pendingOrders >= 5 ? 'rgba(249,125,69,0.05)' : 'rgba(52,211,153,0.05)',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      sub: 'Orders served today',
      positive: true,
      accent: '#C4B5FD',
      accentBg: 'rgba(196,181,253,0.08)',
      accentBorder: 'rgba(196,181,253,0.2)',
      glow: 'rgba(196,181,253,0.05)',
    },
  ];

  const getStatusBadge = (status) => {
    const map = {
      Pending:   'badge-pending',
      Preparing: 'badge-preparing',
      Ready:     'badge-ready',
      Completed: 'badge-completed',
      Served:    'badge-completed',
    };
    return map[status] || 'badge-completed';
  };

  const SkeletonCard = () => (
    <div className="glass-card p-6">
      <div className="flex justify-between items-start mb-5">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="skeleton w-16 h-5 rounded-lg" />
      </div>
      <div className="skeleton w-24 h-8 rounded-lg mb-2" />
      <div className="skeleton w-36 h-4 rounded" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-px h-4" style={{ background: 'linear-gradient(180deg, #B87333, transparent)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'rgba(184,115,51,0.7)', fontFamily: 'Cinzel, serif' }}>
              Command Center
            </span>
          </div>
          <h1 className="text-4xl font-light leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F5EDD8' }}>
            {greet()},&nbsp;
            <span className="font-bold text-gradient-copper">
              {user?.name?.split(' ')[0] || 'Chef'}
            </span>
          </h1>
          <p className="text-sm mt-1 font-light" style={{ color: 'rgba(245,237,216,0.35)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <div className="live-dot" />
            <span className="text-xs font-semibold" style={{ color: '#34D399' }}>All Systems Live</span>
          </div>
          {/* Stars */}
          <div className="hidden md:flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={11} fill="#B87333" style={{ color: '#B87333', opacity: 0.6 + i * 0.08 }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i} />)
        ) : (
          statCards.map((stat, i) => (
            <div
              key={i}
              className="glass-card p-6 flex flex-col justify-between animate-slide-up cursor-default relative overflow-hidden"
              style={{
                animationDelay: `${i * 70}ms`,
                minHeight: 140,
                background: `linear-gradient(135deg, ${stat.glow} 0%, rgba(30,21,16,0.7) 100%)`,
                border: `1px solid ${stat.accentBorder}`,
              }}
            >
              {/* Ambient glow */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${stat.accentBg}, transparent)`, filter: 'blur(16px)' }} />

              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: stat.accentBg, border: `1px solid ${stat.accentBorder}` }}>
                  <stat.icon size={21} style={{ color: stat.accent }} />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: stat.positive ? '#6EE7B7' : '#F97D45' }}>
                  <ArrowUpRight size={14} />
                  {stat.positive ? 'Good' : 'Busy'}
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F5EDD8' }}>
                  {stat.value}
                </p>
                <p className="text-sm font-medium" style={{ color: 'rgba(245,237,216,0.55)' }}>{stat.title}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(245,237,216,0.3)' }}>{stat.sub}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card animate-slide-up" style={{ animationDelay: '220ms' }}>
          <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,240,220,0.05)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(184,115,51,0.12)', border: '1px solid rgba(184,115,51,0.2)' }}>
                  <Activity size={17} style={{ color: '#D4956A' }} />
                </div>
                <div>
                  <h2 className="font-bold text-base" style={{ color: '#F5EDD8', fontFamily: 'Cormorant Garamond, serif' }}>
                    Recent Orders
                  </h2>
                  <p className="text-xs" style={{ color: 'rgba(245,237,216,0.35)' }}>Live activity feed</p>
                </div>
              </div>
              <div className="live-dot" />
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgba(255,240,220,0.04)' }}>
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton w-32 h-4 rounded" />
                    <div className="skeleton w-48 h-3 rounded" />
                  </div>
                  <div className="skeleton w-20 h-6 rounded-full" />
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order, i) => (
                <div key={order._id}
                  className="px-6 py-4 flex items-center gap-4 transition-colors duration-200 animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,240,220,0.015)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(184,115,51,0.08)', border: '1px solid rgba(184,115,51,0.15)' }}>
                    <Utensils size={15} style={{ color: '#B87333' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#F5EDD8' }}>
                      Table {order.tableId?.tableNumber || 'N/A'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'rgba(245,237,216,0.35)' }}>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} ·{' '}
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-sm" style={{ color: '#D4956A', fontFamily: 'Cormorant Garamond, serif' }}>
                      ₹{order.totalAmount?.toFixed(2)}
                    </span>
                    <span className={getStatusBadge(order.status)}>{order.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-16 text-center">
                <ShoppingCart size={36} className="mx-auto mb-3" style={{ color: 'rgba(255,240,220,0.1)' }} />
                <p className="text-sm" style={{ color: 'rgba(245,237,216,0.3)' }}>No orders yet today</p>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Status */}
        <div className="glass-card animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,240,220,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(184,115,51,0.12)', border: '1px solid rgba(184,115,51,0.2)' }}>
                <Crown size={17} style={{ color: '#D4956A' }} />
              </div>
              <div>
                <h2 className="font-bold text-base" style={{ color: '#F5EDD8', fontFamily: 'Cormorant Garamond, serif' }}>
                  Operations
                </h2>
                <p className="text-xs" style={{ color: 'rgba(245,237,216,0.35)' }}>Real-time status</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {[
              { label: 'Rush Hour Status', value: stats.pendingOrders > 8 ? 'BUSY' : 'NORMAL', ok: stats.pendingOrders <= 8 },
              { label: 'Kitchen Queue',    value: `${stats.pendingOrders} orders`, ok: stats.pendingOrders < 10 },
              { label: 'Tables Occupied', value: `${stats.activeTables} / ${stats.totalTables || 8}`, ok: true },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-3.5 rounded-xl"
                style={{ background: 'rgba(255,240,220,0.025)', border: '1px solid rgba(255,240,220,0.05)' }}>
                <span className="text-sm" style={{ color: 'rgba(245,237,216,0.5)' }}>{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.ok
                    ? <CheckCircle2 size={13} style={{ color: '#34D399' }} />
                    : <AlertCircle  size={13} style={{ color: '#F97D45' }} />
                  }
                  <span className="text-xs font-bold" style={{ color: item.ok ? '#34D399' : '#F97D45' }}>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}

            {/* Revenue Meter */}
            <div className="px-4 py-4 rounded-xl mt-2"
              style={{
                background: 'linear-gradient(135deg, rgba(184,115,51,0.1) 0%, rgba(184,115,51,0.03) 100%)',
                border: '1px solid rgba(184,115,51,0.2)',
              }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-3"
                style={{ color: 'rgba(184,115,51,0.6)', fontFamily: 'Cinzel, serif' }}>
                Today's Revenue
              </p>
              <p className="text-3xl font-bold text-gradient-copper"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                ₹{stats.totalRevenue.toFixed(2)}
              </p>
              <div className="mt-3 h-1.5 rounded-full" style={{ background: 'rgba(255,240,220,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((stats.totalRevenue / 50000) * 100, 100)}%`,
                    background: 'linear-gradient(90deg, #D4956A, #B87333)',
                    boxShadow: '0 0 8px rgba(184,115,51,0.4)',
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: 'rgba(245,237,216,0.25)' }}>Target: ₹50,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
