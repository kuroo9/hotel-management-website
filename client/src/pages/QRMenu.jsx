import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Crown, Search, Star, Info } from 'lucide-react';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Drinks', 'Desserts'];
const categoryEmoji = { Starters: '🥗', 'Main Course': '🍛', Drinks: '🍹', Desserts: '🍰', All: '✨' };

const QRMenu = () => {
  const { tableId } = useParams();
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/menu/public/${tableId}`);
      setMenu(data);
    } catch (error) {
      console.error('Error fetching menu');
    } finally {
      setLoading(false);
    }
  };

  const filtered = menu.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0c' }}>
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto animate-float"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 30px rgba(245,158,11,0.4)' }}>
          <Crown size={28} className="text-black" />
        </div>
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-500 text-sm">Loading menu...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0a0a0c 0%, #0f0e16 40%, #0a0a0c 100%)' }}>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 backdrop-blur-xl"
        style={{ background: 'rgba(10,10,12,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Brand Bar */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Crown size={18} className="text-black" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
                Grand Hotel
              </h1>
              <p className="text-[10px] text-gold-500/60 uppercase tracking-widest">Fine Dining Menu</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
            <Star size={11} fill="currentColor" />
            Table {tableId?.slice(-4) || 'QR'}
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fafafa',
                outline: 'none',
              }}
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300"
              style={selectedCategory === cat ? {
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))',
                color: '#fbbf24',
                border: '1px solid rgba(245,158,11,0.3)',
              } : {
                background: 'rgba(255,255,255,0.04)',
                color: '#71717a',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {categoryEmoji[cat]} {cat}
            </button>
          ))}
        </div>
      </header>

      {/* ── Menu Items ── */}
      <main className="px-5 py-6 max-w-2xl mx-auto space-y-4 pb-32">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-zinc-500">No items found</p>
          </div>
        ) : (
          filtered.map((item, i) => (
            <div
              key={item._id}
              className="flex gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer animate-slide-up"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                animationDelay: `${i * 30}ms`,
              }}
              onClick={() => setSelectedItem(item)}
            >
              {/* Image */}
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                {item.image ? (
                  <img
                    src={
                      item.image.startsWith('http') || item.image.startsWith('data:')
                        ? item.image
                        : `${import.meta.env.VITE_SOCKET_URL}${item.image}`
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {categoryEmoji[item.category]}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-base leading-tight">{item.name}</h3>
                  <span className="text-gold-400 font-bold text-lg whitespace-nowrap">₹{item.price}</span>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg text-zinc-500"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {categoryEmoji[item.category]} {item.category}
                  </span>
                  <button className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-gold-400 transition-colors">
                    <Info size={12} /> Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* ── Item Detail Modal ── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up"
            style={{ background: '#131316', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            {selectedItem.image && (
              <div className="h-56 overflow-hidden">
                <img
                  src={
                    selectedItem.image.startsWith('http') || selectedItem.image.startsWith('data:')
                      ? selectedItem.image
                      : `${import.meta.env.VITE_SOCKET_URL}${selectedItem.image}`
                  }
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {selectedItem.name}
                </h2>
                <span className="text-gold-400 font-bold text-xl">₹{selectedItem.price}</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">{selectedItem.description}</p>
              <div className="flex gap-3">
                <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 rounded-xl text-zinc-400 font-semibold transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom CTA ── */}
      <div className="fixed bottom-0 inset-x-0 p-5"
        style={{ background: 'linear-gradient(to top, rgba(10,10,12,1) 60%, transparent)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))',
              border: '1px solid rgba(245,158,11,0.2)'
            }}>
            <Crown size={20} className="text-gold-400 animate-float shrink-0" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Ready to order?</p>
              <p className="text-zinc-400 text-xs">Wave for your waiter or call us</p>
            </div>
            <div className="text-2xl animate-float">🛎️</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRMenu;
