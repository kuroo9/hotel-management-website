import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ShoppingCart, Plus, Minus, Trash2, Send, Search,
  UtensilsCrossed, Table2, ChevronDown, Star
} from 'lucide-react';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Drinks', 'Desserts'];
const categoryEmoji = { Starters: '🥗', 'Main Course': '🍛', Drinks: '🍹', Desserts: '🍰', All: '🍽️' };

const Orders = () => {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(tableId || '');
  const [search, setSearch] = useState('');
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenu();
    fetchTables();
  }, []);

  const fetchMenu = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/menu`);
      const itemsWithImages = data.filter(item => item.isAvailable).map(item => {
        let imageUrl = null;
        if (item.image) {
          if (item.image.startsWith('http') || item.image.startsWith('data:')) {
            imageUrl = item.image;
          } else {
            imageUrl = `${import.meta.env.VITE_SOCKET_URL}/uploads/${item.image}`;
          }
        }
        return { ...item, image: imageUrl };
      });
      setMenu(itemsWithImages);
    } catch {
      toast.error('Failed to load menu');
    }
  };

  const fetchTables = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/tables`);
      setTables(data);
    } catch {
      toast.error('Failed to load tables');
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1, note: '' }];
    });
    toast.success(`${item.name} added to order`, { duration: 1500, icon: '✨' });
  };

  const updateQty = (id, change) => {
    setCart(prev => prev
      .map(i => i._id === id ? { ...i, qty: Math.max(1, i.qty + change) } : i)
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i._id !== id));
  };

  const updateNote = (id, note) => {
    setCart(prev => prev.map(i => i._id === id ? { ...i, note } : i));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const placeOrder = async () => {
    if (!selectedTable) return toast.error('Please select a table first');
    if (cart.length === 0) return toast.error('Your cart is empty');

    setPlacing(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/orders`, {
        tableId: selectedTable,
        items: cart.map(i => ({ menuItem: i._id, qty: i.qty, note: i.note })),
        totalAmount
      });
      toast.success('Order sent to kitchen! 🍳');
      setCart([]);
      navigate('/tables');
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const filteredMenu = menu.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCartQty = (id) => cart.find(i => i._id === id)?.qty || 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={14} className="text-gold-400" />
            <span className="text-xs text-gold-400/70 uppercase tracking-widest font-semibold">Place Order</span>
          </div>
          <h1 className="page-title text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>New Order</h1>
          <p className="page-subtitle">Select table, browse menu, add to cart</p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* LEFT: Menu Panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Table Selector + Search */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <Table2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                id="table-select"
                className="input-field pl-11 appearance-none"
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value)}
              >
                <option value="">Select Table</option>
                {tables.map(t => (
                  <option key={t._id} value={t._id}>
                    Table {t.tableNumber} · {t.capacity} seats ({t.status})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="order-search"
                type="text"
                className="input-field pl-11"
                placeholder="Search dishes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${selectedCategory === cat
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                    : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06]'
                  }`}
              >
                <span>{categoryEmoji[cat]}</span>
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredMenu.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                <UtensilsCrossed size={48} className="mb-4 opacity-40" />
                <p>No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMenu.map((item, i) => {
                  const qtyInCart = getCartQty(item._id);
                  return (
                    <div
                      key={item._id}
                      id={`menu-item-${item._id}`}
                      className="glass-card flex gap-3 p-4 cursor-pointer group hover:border-gold-500/20 animate-slide-up"
                      style={{ animationDelay: `${i * 30}ms` }}
                      onClick={() => addToCart(item)}
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0"
                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {categoryEmoji[item.category]}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm leading-tight mb-1">{item.name}</h3>
                        <p className="text-zinc-500 text-[11px] line-clamp-2 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-gold-400 font-bold">₹{item.price}</span>
                          {qtyInCart > 0 ? (
                            <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-black"
                              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                              {qtyInCart}
                            </span>
                          ) : (
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-all">
                              <Plus size={14} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart Panel */}
        <div className="w-80 flex flex-col shrink-0 rounded-2xl overflow-hidden"
          style={{ background: '#0f0f12', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Cart Header */}
          <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-white flex items-center gap-2">
                <ShoppingCart size={18} className="text-gold-400" />
                Your Order
              </h2>
              {totalItems > 0 && (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  {totalItems}
                </span>
              )}
            </div>
            {selectedTable && (
              <p className="text-xs text-zinc-500">
                Table {tables.find(t => t._id === selectedTable)?.tableNumber || '—'}
              </p>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-10">
                <ShoppingCart size={48} className="mb-3 opacity-20" />
                <p className="text-sm">Add items to begin</p>
                <p className="text-xs mt-1 opacity-60">Click any menu item</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item._id} className="cart-item animate-slide-up">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                      <p className="text-gold-400 text-xs font-bold">₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="qty-control">
                        <button
                          id={`qty-minus-${item._id}`}
                          className="qty-btn"
                          onClick={() => updateQty(item._id, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-white font-bold text-sm min-w-[20px] text-center">{item.qty}</span>
                        <button
                          id={`qty-plus-${item._id}`}
                          className="qty-btn"
                          onClick={() => updateQty(item._id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        id={`remove-${item._id}`}
                        onClick={() => removeFromCart(item._id)}
                        className="p-1.5 rounded-lg text-red-500/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Special instructions (optional)..."
                    className="w-full bg-transparent text-xs text-zinc-400 placeholder-zinc-600 border-b border-dashed border-white/10 focus:border-gold-500/30 focus:outline-none py-1 transition-colors"
                    value={item.note}
                    onChange={e => updateNote(item._id, e.target.value)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
            {cart.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                  <span className="text-zinc-400">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-gradient-gold text-xl">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
            <button
              id="place-order-btn"
              onClick={placeOrder}
              disabled={cart.length === 0 || placing}
              className="btn-primary w-full py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {placing ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Send to Kitchen
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
