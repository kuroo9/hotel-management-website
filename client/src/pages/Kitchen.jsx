import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import { Clock, ChefHat, CheckCircle, Flame, Zap, Bell, RefreshCw } from 'lucide-react';

const statusFlow = {
  Pending: { next: 'Preparing', label: 'Start Preparing', color: 'bg-amber-500', btnClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25' },
  Preparing: { next: 'Ready', label: 'Mark as Ready', color: 'bg-indigo-500', btnClass: 'bg-green-500/15 text-green-300 border-green-500/30 hover:bg-green-500/25' },
  Ready: { next: null, label: 'Awaiting Service', color: 'bg-green-500', btnClass: 'bg-white/5 text-zinc-500 border-white/10 cursor-not-allowed' },
};

const categoryEmoji = { Starters: '🥗', 'Main Course': '🍛', Drinks: '🍹', Desserts: '🍰' };

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const socket = useSocket();
  const audioRef = useRef(null);

  useEffect(() => {
    fetchPendingOrders();

    if (socket) {
      socket.on('new_order', (order) => {
        setOrders(prev => [order, ...prev]);
        setLastUpdate(new Date());
        toast.custom((t) => (
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-luxury ${t.visible ? 'animate-slide-up' : ''}`}
            style={{ background: '#131316', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Bell size={20} className="text-gold-400 animate-float" />
            <div>
              <p className="font-bold text-white text-sm">New Order!</p>
              <p className="text-zinc-400 text-xs">Table {order.tableId?.tableNumber} just placed an order</p>
            </div>
          </div>
        ), { duration: 5000 });
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      });

      socket.on('order_status_update', (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        setLastUpdate(new Date());
      });
    }

    return () => {
      if (socket) {
        socket.off('new_order');
        socket.off('order_status_update');
      }
    };
  }, [socket]);

  const fetchPendingOrders = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders`);
      setOrders(data.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status)));
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? data : o));
      toast.success(`Order marked as ${status} ✓`);
    } catch {
      toast.error('Status update failed');
    }
  };

  const getElapsed = (createdAt) => {
    const mins = Math.floor((new Date() - new Date(createdAt)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  const getUrgencyColor = (createdAt) => {
    const mins = Math.floor((new Date() - new Date(createdAt)) / 60000);
    if (mins > 20) return 'text-red-400';
    if (mins > 10) return 'text-amber-400';
    return 'text-zinc-500';
  };

  const statusCounts = {
    Pending: orders.filter(o => o.status === 'Pending').length,
    Preparing: orders.filter(o => o.status === 'Preparing').length,
    Ready: orders.filter(o => o.status === 'Ready').length,
  };

  const SkeletonCard = () => (
    <div className="glass-card p-5 space-y-4">
      <div className="flex justify-between">
        <div className="skeleton w-24 h-7 rounded-xl" />
        <div className="skeleton w-16 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton w-full h-4 rounded" />
        <div className="skeleton w-3/4 h-4 rounded" />
        <div className="skeleton w-1/2 h-4 rounded" />
      </div>
      <div className="skeleton w-full h-10 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} className="text-ember-400" />
            <span className="text-xs text-ember-400/70 uppercase tracking-widest font-semibold">Kitchen Display</span>
          </div>
          <h1 className="page-title text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>Kitchen Queue</h1>
          <p className="page-subtitle">
            Live orders · Updated {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: socket ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${socket ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div className={`live-dot ${!socket && 'bg-red-500'}`} />
            <span className={`text-xs font-semibold ${socket ? 'text-green-400' : 'text-red-400'}`}>
              {socket ? 'Live Feed' : 'Disconnected'}
            </span>
          </div>
          <button
            id="refresh-kitchen"
            onClick={fetchPendingOrders}
            className="btn-ghost"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Status Counter Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'Pending', label: 'Pending', icon: Clock, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { key: 'Preparing', label: 'Preparing', icon: ChefHat, color: 'text-indigo-400', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
          { key: 'Ready', label: 'Ready', icon: CheckCircle, color: 'text-green-400', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
        ].map(({ key, label, icon: Icon, color, bg, border }) => (
          <div key={key} className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className={`text-3xl font-bold ${color}`}>{statusCounts[key]}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card py-24 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(245,158,11,0.06)', border: '2px dashed rgba(245,158,11,0.2)' }}>
            <ChefHat size={40} className="text-zinc-600" />
          </div>
          <p className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Kitchen is Clear
          </p>
          <p className="text-zinc-500 text-sm">No active orders in the queue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {orders.map((order, i) => {
            const sf = statusFlow[order.status] || statusFlow.Ready;
            return (
              <div
                key={order._id}
                id={`kitchen-order-${order._id}`}
                className={`kitchen-card ${order.status.toLowerCase()} animate-slide-up`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Card Header */}
                <div className="px-5 py-4 flex justify-between items-center border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div>
                    <span className="text-2xl font-black text-white"
                      style={{ fontFamily: 'Playfair Display, serif' }}>
                      T{order.tableId?.tableNumber || '?'}
                    </span>
                    <p className="text-xs text-zinc-500">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${order.status === 'Pending' ? 'badge-pending' : order.status === 'Preparing' ? 'badge-preparing' : 'badge-ready'}`}>
                      {order.status}
                    </span>
                    <div className={`flex items-center gap-1 mt-1 justify-end text-xs ${getUrgencyColor(order.createdAt)}`}>
                      <Clock size={10} />
                      {getElapsed(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 p-4 space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-base leading-none mt-0.5">
                          {categoryEmoji[item.menuItem?.category] || '🍽️'}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">
                            {item.menuItem?.name || 'Item'}
                          </p>
                          {item.note && (
                            <p className="text-[11px] text-amber-400/80 italic mt-0.5">
                              ⚠️ {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-zinc-400 font-bold text-sm shrink-0 bg-white/[0.04] px-2 py-0.5 rounded-lg">
                        ×{item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {sf.next ? (
                    <button
                      id={`kitchen-action-${order._id}`}
                      onClick={() => updateStatus(order._id, sf.next)}
                      className={`w-full py-3 rounded-xl text-sm font-bold border transition-all duration-300 flex items-center justify-center gap-2 ${sf.btnClass}`}
                    >
                      {order.status === 'Pending' ? <Zap size={16} /> : <CheckCircle size={16} />}
                      {sf.label}
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-xl text-sm font-bold border text-center text-green-400 bg-green-500/10 border-green-500/20 flex items-center justify-center gap-2">
                      <CheckCircle size={16} />
                      Ready for Service
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Kitchen;
