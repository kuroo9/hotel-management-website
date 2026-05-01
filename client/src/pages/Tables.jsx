import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus, Users, X, Grid3X3, Wifi, WifiOff, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);
  const [actionTable, setActionTable] = useState(null);
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: 4 });
  const [submitting, setSubmitting] = useState(false);
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Normalize role for consistent checking
  const userRole = user?.role?.toLowerCase();
  const canManageTables = userRole === 'admin' || userRole === 'waiter';

  useEffect(() => {
    fetchTables();
    if (socket) {
      socket.on('table_status_change', (updatedTable) => {
        setTables(prev => prev.map(t => t._id === updatedTable._id ? updatedTable : t));
      });
    }
    return () => { if (socket) socket.off('table_status_change'); };
  }, [socket]);

  const fetchTables = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/tables`);
      setTables(data);
    } catch (error) {
      console.error('Fetch tables error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!canManageTables) {
      toast.error('Permission denied');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/tables`, newTable);
      toast.success('Table added successfully');
      setShowAddModal(false);
      setNewTable({ tableNumber: '', capacity: 4 });
      fetchTables();
    } catch (error) {
      console.error('Add table error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to add table');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTableClick = (table) => {
    setActionTable(table);
  };

  const updateTableStatus = async (status) => {
    if (!canManageTables) {
      toast.error('Permission denied: Only admin and waiter can update tables');
      return;
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/tables/${actionTable._id}`, { status });
      toast.success(`Table marked as ${status}`);
      setActionTable(null);
      fetchTables();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update table status');
    }
  };

  const stats = {
    available: tables.filter(t => t.status === 'Available').length,
    occupied: tables.filter(t => t.status === 'Occupied').length,
    reserved: tables.filter(t => t.status === 'Reserved').length,
  };

  const SkeletonTable = () => (
    <div className="skeleton h-36 rounded-2xl" />
  );

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Grid3X3 size={14} className="text-gold-400" />
            <span className="text-xs text-gold-400/70 uppercase tracking-widest font-semibold">Floor Plan</span>
          </div>
          <h1 className="page-title text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>Table Management</h1>
          <p className="page-subtitle">{tables.length} total tables · Visual floor map</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${socket ? 'text-green-400' : 'text-red-400'}`}
            style={{ background: socket ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${socket ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {socket ? <Wifi size={14} /> : <WifiOff size={14} />}
            {socket ? 'Live Sync' : 'Offline'}
          </div>
          {canManageTables && (
            <button id="add-table-btn" onClick={() => setShowAddModal(true)} className="btn-primary">
              <Plus size={18} />
              Add Table
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Available', count: stats.available, color: 'text-green-400', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', dot: 'bg-green-400' },
          { label: 'Occupied', count: stats.occupied, color: 'text-red-400', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', dot: 'bg-red-400' },
          { label: 'Reserved', count: stats.reserved, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', dot: 'bg-amber-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className={`w-3 h-3 rounded-full ${s.dot}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Floor Map */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-base">Restaurant Floor Plan</h2>
          <span className="text-xs text-zinc-500">Click table to place order or reserve</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {loading ? (
            [1,2,3,4,5,6,7,8].map(i => <SkeletonTable key={i} />)
          ) : tables.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <Grid3X3 size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500 mb-2">No tables added yet</p>
              {canManageTables && (
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                  <Plus size={16} /> Add First Table
                </button>
              )}
            </div>
          ) : (
            tables.map((table, i) => {
              const status = table.status?.toLowerCase() || 'available';
              return (
                <div
                  key={table._id}
                  id={`table-${table.tableNumber}`}
                  className={`table-cell ${status} animate-slide-up`}
                  style={{ animationDelay: `${i * 30}ms` }}
                  onClick={() => handleTableClick(table)}
                  title={`Table ${table.tableNumber} - ${table.status}`}
                >
                  {/* Table Number */}
                  <div className="text-3xl font-black mb-1"
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                    {table.tableNumber}
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-1 text-[11px] opacity-60 mb-3">
                    <Users size={10} />
                    <span>{table.capacity}</span>
                  </div>

                  {/* Status dot */}
                  <div className={`w-1.5 h-1.5 rounded-full mb-2 ${
                    status === 'available' ? 'bg-green-400' :
                    status === 'occupied' ? 'bg-red-400' : 'bg-amber-400'
                  } animate-pulse`} />

                  {/* Status label */}
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    status === 'available' ? 'text-green-400' :
                    status === 'occupied' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {table.status}
                  </span>

                  {/* QR Button */}
                  <button
                    onClick={e => { e.stopPropagation(); setShowQRModal(table); }}
                    className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                    title="Show QR Code"
                  >
                    <QrCode size={12} className="text-zinc-400" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {[
            { color: 'bg-green-400', label: 'Available — Click to order' },
            { color: 'bg-red-400', label: 'Occupied' },
            { color: 'bg-amber-400', label: 'Reserved' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-xs text-zinc-500">
              <div className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal-content max-w-sm">
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <h2 className="font-bold text-white">Add New Table</h2>
                <p className="text-xs text-zinc-500">Configure table settings</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddTable} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Table Number *</label>
                <input
                  id="new-table-number"
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="e.g. 12"
                  value={newTable.tableNumber}
                  onChange={e => setNewTable({ ...newTable, tableNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Seating Capacity *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setNewTable({ ...newTable, capacity: cap })}
                      className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                        newTable.capacity === cap
                          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                          : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08]'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button id="save-table-btn" type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Action Modal */}
      {actionTable && (
        <div className="modal-overlay" onClick={() => setActionTable(null)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <h2 className="font-bold text-white">Table {actionTable.tableNumber}</h2>
                <p className="text-xs text-zinc-500">Current Status: <span className="font-bold text-white">{actionTable.status}</span></p>
              </div>
              <button onClick={() => setActionTable(null)} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => {
                  navigate(`/orders?tableId=${actionTable._id}`);
                  setActionTable(null);
                }}
                className="btn-primary w-full"
              >
                Place New Order
              </button>

              {actionTable.status === 'Available' && (
                <button
                  onClick={() => updateTableStatus('Reserved')}
                  className="w-full py-3 rounded-xl font-bold transition-all text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20"
                >
                  Reserve Table
                </button>
              )}

              {(actionTable.status === 'Reserved' || actionTable.status === 'Occupied') && (
                <button
                  onClick={() => updateTableStatus('Available')}
                  className="w-full py-3 rounded-xl font-bold transition-all text-green-400 bg-green-400/10 hover:bg-green-400/20 border border-green-400/20"
                >
                  Mark as Available
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(null)}>
          <div className="modal-content max-w-xs" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <h2 className="font-bold text-white text-lg mb-1">Table {showQRModal.tableNumber} QR Code</h2>
              <p className="text-zinc-500 text-xs mb-6">Scan to view the menu</p>
              <div className="bg-white p-4 rounded-2xl inline-block">
                <QRCodeSVG
                  value={`${window.location.origin}/public/menu/${showQRModal._id}`}
                  size={180}
                  level="H"
                />
              </div>
              <p className="text-zinc-600 text-xs mt-4 break-all">
                {`${window.location.origin}/public/menu/${showQRModal._id}`}
              </p>
              <button onClick={() => setShowQRModal(null)} className="btn-ghost w-full mt-4">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;