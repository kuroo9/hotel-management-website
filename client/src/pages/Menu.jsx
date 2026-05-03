import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Search, Filter, ImageOff, Check, ChevronDown, UtensilsCrossed, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const CATEGORIES = ['Starters', 'Main Course', 'Drinks', 'Desserts'];

const categoryEmoji = {
  Starters: '🥗',
  'Main Course': '🍛',
  Drinks: '🍹',
  Desserts: '🍰',
};

const Menu = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [failedImages, setFailedImages] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Starters', description: '', isAvailable: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      setFailedImages(new Set()); // Reset failed images when fetching menu
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/menu`);
      const itemsWithImages = data.map(item => {
        let imageUrl = null;
        if (item.image) {
          // If image is a full URL (http/https) or base64 data URL, use as-is
          if (item.image.startsWith('http') || item.image.startsWith('data:')) {
            imageUrl = item.image;
          } else {
            // If it's just a filename, prepend the server URL
            imageUrl = `${import.meta.env.VITE_SOCKET_URL}/uploads/${item.image}`;
          }
        }
        return { ...item, image: imageUrl };
      });
      setItems(itemsWithImages);
    } catch {
      toast.error('Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageError = (itemId) => {
    setFailedImages(prev => new Set([...prev, itemId]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'price') {
        data.append(key, parseFloat(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });
    if (imageFile) data.append('image', imageFile);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      if (currentItem) {
        await axios.put(`${import.meta.env.VITE_API_URL}/menu/${currentItem._id}`, data, config);
        toast.success('Menu item updated');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/menu`, data, config);
        toast.success('New item added to menu');
      }
      setShowModal(false);
      resetForm();
      fetchMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: 'Starters', description: '', isAvailable: true });
    setCurrentItem(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({ name: item.name, price: item.price, category: item.category, description: item.description, isAvailable: item.isAvailable });
    setImagePreview(item.image ? item.image : null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this item from the menu?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/menu/${id}`);
      toast.success('Item removed');
      fetchMenu();
    } catch {
      toast.error('Deletion failed');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const data = new FormData();
      data.append('isAvailable', !item.isAvailable);
      await axios.put(`${import.meta.env.VITE_API_URL}/menu/${item._id}`, data);
      toast.success(`Item marked as ${!item.isAvailable ? 'available' : 'unavailable'}`);
      fetchMenu();
    } catch {
      toast.error('Update failed');
    }
  };

  const generateQRUrl = () => {
    // For GitHub Pages deployment, use the base URL
    // For local dev, use localhost
    const isProduction = window.location.hostname !== 'localhost';
    const baseUrl = isProduction 
      ? 'https://kuroo9.github.io' 
      : window.location.origin;
    return `${baseUrl}/`;
  };

  const filtered = items.filter(item => {
    const matchCat = filterCategory === 'All' || item.category === filterCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const SkeletonCard = () => (
    <div className="glass-card">
      <div className="skeleton h-44" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="flex justify-between">
          <div className="skeleton h-6 w-16 rounded" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-7 animate-fade-in">
      {/* QR Code Section */}
      <div className="glass-card p-4 bg-gradient-to-r from-gold-500/5 to-transparent border border-gold-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gold-500/10">
              <QrCode size={32} className="text-gold-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Digital Menu QR Code</h3>
              <p className="text-xs text-zinc-400">Scan to view menu with prices on mobile</p>
              <p className="text-xs text-gold-400 mt-1">{items.length} items available</p>
            </div>
          </div>
          <button
            onClick={() => setShowQRModal(true)}
            className="btn-primary px-6 py-2.5 text-sm"
          >
            <QrCode size={16} />
            Show QR
          </button>
        </div>
      </div>

      {/* 
  );

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-px h-4" style={{ background: 'linear-gradient(180deg, #B87333, transparent)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'rgba(184,115,51,0.7)', fontFamily: 'Cinzel, serif' }}>Culinary</span>
          </div>
          <h1 className="page-title text-3xl" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Menu Management</h1>
          <p className="page-subtitle">{items.length} items across {CATEGORIES.length} categories</p>
        </div>
        {user?.role === 'Admin' && (
          <button id="add-menu-btn" onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary shrink-0">
            <Plus size={18} />
            Add New Item
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(245,237,216,0.25)' }} />
          <input
            id="menu-search"
            type="text"
            className="input-field pl-11"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                filterCategory === cat
                  ? 'text-amber-100'
                  : 'hover:text-ivory'
              }`}
              style={filterCategory === cat ? {
                background: 'rgba(184,115,51,0.15)',
                border: '1px solid rgba(184,115,51,0.35)',
                color: '#D4956A',
              } : {
                background: 'rgba(255,240,220,0.03)',
                border: '1px solid rgba(255,240,220,0.06)',
                color: 'rgba(245,237,216,0.4)',
              }}
            >
              {cat !== 'All' ? `${categoryEmoji[cat]} ` : ''}{cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(cat => {
          const count = items.filter(i => i.category === cat).length;
          const available = items.filter(i => i.category === cat && i.isAvailable).length;
          return (
            <div key={cat} className="glass-card p-4 flex items-center gap-3 shrink-0 min-w-[160px]">
              <span className="text-2xl">{categoryEmoji[cat]}</span>
              <div>
                <p className="font-bold text-white text-sm">{cat}</p>
                <p className="text-xs text-zinc-500">{available}/{count} available</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading ? (
          [1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <UtensilsCrossed size={48} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500">No items found</p>
          </div>
        ) : (
          filtered.map((item, i) => (
            <div
              key={item._id}
              className="menu-card group animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Image */}
              <div className="menu-image relative">
                {item.image && !failedImages.has(item._id) ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={() => handleImageError(item._id)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <ImageOff size={32} className="text-zinc-700" />
                    <span className="text-zinc-600 text-xs">No image</span>
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="gold-badge text-[10px]">
                    {categoryEmoji[item.category]} {item.category}
                  </span>
                </div>

                {/* Unavailable overlay */}
                {!item.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}>
                    <span className="badge-occupied text-[11px]">Unavailable</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-base leading-tight">{item.name}</h3>
                  <span className="text-gold-400 font-bold text-lg">₹{item.price}</span>
                </div>
                <p className="text-zinc-500 text-xs line-clamp-2 mb-4 leading-relaxed">{item.description}</p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                      item.isAvailable
                        ? 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
                        : 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
                    }`}
                    title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                  >
                    {item.isAvailable ? <Check size={12} /> : <X size={12} />}
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </button>

                  {user?.role === 'Admin' && (
                    <div className="flex gap-1">
                      <button
                        id={`edit-menu-${item._id}`}
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-gold-400 hover:bg-gold-400/10 transition-all duration-200"
                        title="Edit item"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        id={`delete-menu-${item._id}`}
                        onClick={() => handleDelete(item._id)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                        title="Delete item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content max-w-lg w-full" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <h2 className="text-lg font-bold text-white">{currentItem ? 'Edit Menu Item' : 'Add New Item'}</h2>
                <p className="text-xs text-zinc-500">{currentItem ? 'Update item details' : 'Add to the menu'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">Item Image</label>
                <div
                  className="relative h-36 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-white/10 hover:border-gold-500/30 transition-all group"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <ImageOff size={28} className="text-zinc-600 group-hover:text-zinc-500" />
                      <span className="text-zinc-600 text-xs group-hover:text-zinc-500">Click to upload image</span>
                    </div>
                  )}
                  <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Item Name *</label>
                  <input
                    id="menu-item-name"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Butter Chicken"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Price (₹) *</label>
                  <input
                    id="menu-item-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    placeholder="299"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Category *</label>
                  <select
                    id="menu-item-category"
                    className="input-field"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{categoryEmoji[c]} {c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea
                    id="menu-item-description"
                    className="input-field h-24 resize-none"
                    placeholder="Describe the dish..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Availability Toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
                <div
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${formData.isAvailable ? '' : 'bg-zinc-700'}`}
                  style={formData.isAvailable ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)' } : {}}
                  onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${formData.isAvailable ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium text-zinc-300">Available for orders</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button id="save-menu-item" type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : currentItem ? 'Update Item' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b flex items-center justify-between"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <h2 className="text-lg font-bold text-white">Digital Menu QR</h2>
                <p className="text-xs text-zinc-500">Scan to view all items with prices</p>
              </div>
              <button onClick={() => setShowQRModal(false)} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl mb-4">
                <QRCodeSVG
                  value={generateQRUrl()}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <h3 className="text-white font-semibold mb-1">Menu Display</h3>
              <p className="text-zinc-400 text-xs mb-4">Shows all items with prices</p>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateQRUrl());
                  toast.success('Menu URL copied!');
                }}
                className="btn-ghost w-full text-sm"
              >
                Copy Menu URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
