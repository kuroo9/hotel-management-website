import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Receipt, CreditCard, Printer, X, CheckCircle, Clock,
  ChevronDown, BadgeIndianRupee, FileText, Eye
} from 'lucide-react';

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(null);
  const [taxRate, setTaxRate] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('flat'); // flat | percent
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const printRef = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, billsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/orders`),
        axios.get(`${import.meta.env.VITE_API_URL}/bills`),
      ]);
      setOrders(ordersRes.data.filter(o => ['Ready', 'Served'].includes(o.status)));
      setBills(billsRes.data);
    } catch {
      toast.error('Failed to load billing data');
    }
  };

  const calcDiscount = (subtotal) => {
    if (discountType === 'percent') return (subtotal * discount) / 100;
    return discount;
  };

  const calcTotal = (subtotal) => {
    const taxAmt = (subtotal * taxRate) / 100;
    const discAmt = calcDiscount(subtotal);
    return subtotal + taxAmt - discAmt;
  };

  const generateBill = async () => {
    setGenerating(true);
    try {
      const discountFlat = discountType === 'percent'
        ? (selectedOrder.totalAmount * discount) / 100
        : discount;

      await axios.post(`${import.meta.env.VITE_API_URL}/bills/generate/${selectedOrder._id}`, {
        taxRate,
        discount: discountFlat
      });
      toast.success('Invoice generated successfully! 🎉');
      setShowBillModal(false);
      setSelectedOrder(null);
      setDiscount(0);
      fetchData();
    } catch {
      toast.error('Failed to generate bill');
    } finally {
      setGenerating(false);
    }
  };

  const updatePayment = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/bills/${id}/payment`, { paymentStatus: status });
      toast.success(`Payment marked as ${status}`);
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Invoice</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 400px; margin: 0 auto; }
        h1 { font-size: 24px; text-align: center; margin-bottom: 4px; }
        p { margin: 2px 0; font-size: 12px; color: #666; }
        .center { text-align: center; }
        hr { border: 0; border-top: 1px dashed #ccc; margin: 16px 0; }
        .row { display: flex; justify-content: space-between; margin: 6px 0; }
        .bold { font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; }
      </style>
      </head><body>${content}</body></html>
    `);
    w.document.close();
    w.print();
  };

  const stats = {
    totalRevenue: bills.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + b.total, 0),
    paid: bills.filter(b => b.paymentStatus === 'Paid').length,
    unpaid: bills.filter(b => b.paymentStatus === 'Unpaid').length,
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BadgeIndianRupee size={14} className="text-gold-400" />
          <span className="text-xs text-gold-400/70 uppercase tracking-widest font-semibold">Finance</span>
        </div>
        <h1 className="page-title text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>Billing & Invoices</h1>
        <p className="page-subtitle">Generate bills, manage payments, and track revenue</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: BadgeIndianRupee, color: 'text-gold-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Paid Bills', value: stats.paid, icon: CheckCircle, color: 'text-green-400', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
          { label: 'Unpaid Bills', value: stats.unpaid, icon: Clock, color: 'text-red-400', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <s.icon size={22} className={s.color} />
            </div>
            <div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { key: 'pending', label: `Ready to Bill (${orders.length})`, icon: Receipt },
          { key: 'history', label: `Bill History (${bills.length})`, icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`tab-${key}`}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === key
                ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' ? (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-white flex items-center gap-2">
              <Receipt size={18} className="text-gold-400" />
              Orders Ready for Billing
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Orders marked as Ready or Served</p>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <Receipt size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">No orders ready for billing</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {orders.map((order, i) => (
                <div key={order._id} className="flex items-center gap-4 px-6 py-5 hover:bg-white/[0.02] transition-colors animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                    <span className="font-black text-gold-400" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {order.tableId?.tableNumber || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">Table {order.tableId?.tableNumber}</p>
                    <p className="text-xs text-zinc-500">
                      {order.items?.length} items · {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">₹{order.totalAmount.toFixed(2)}</p>
                    <span className={`badge ${order.status === 'Ready' ? 'badge-ready' : 'badge-completed'}`}>{order.status}</span>
                  </div>
                  <button
                    id={`generate-bill-${order._id}`}
                    onClick={() => { setSelectedOrder(order); setShowBillModal(true); }}
                    className="btn-primary shrink-0"
                  >
                    Generate Invoice
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-white flex items-center gap-2">
              <CreditCard size={18} className="text-gold-400" />
              Invoice History
            </h2>
          </div>

          {bills.length === 0 ? (
            <div className="py-20 text-center">
              <FileText size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">No bills generated yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {bills.map((bill, i) => (
                <div key={bill._id} className="flex items-center gap-4 px-6 py-5 hover:bg-white/[0.02] transition-colors animate-slide-up"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">Bill #{bill._id?.slice(-8).toUpperCase()}</p>
                      <span className={bill.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-unpaid'}>
                        {bill.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Table {bill.tableId?.tableNumber} · {new Date(bill.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-white text-xl">₹{bill.total?.toFixed(2)}</p>
                    <p className="text-xs text-zinc-600">Subtotal ₹{bill.subtotal?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id={`view-bill-${bill._id}`}
                      onClick={() => setShowViewModal(bill)}
                      className="btn-ghost p-2.5"
                      title="View invoice"
                    >
                      <Eye size={16} />
                    </button>
                    {bill.paymentStatus === 'Unpaid' && (
                      <button
                        id={`mark-paid-${bill._id}`}
                        onClick={() => updatePayment(bill._id, 'Paid')}
                        className="btn-primary py-2"
                      >
                        <CheckCircle size={16} />
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generate Bill Modal */}
      {showBillModal && selectedOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowBillModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <h2 className="font-bold text-white">Generate Invoice</h2>
                <p className="text-xs text-zinc-500">Table {selectedOrder.tableId?.tableNumber}</p>
              </div>
              <button onClick={() => setShowBillModal(false)} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Items list */}
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-300">{item.menuItem?.name || 'Item'} ×{item.qty}</span>
                    <span className="text-white font-semibold">₹{(item.menuItem?.price * item.qty) || 0}</span>
                  </div>
                ))}
              </div>

              <div className="gold-divider" />

              {/* Tax Rate */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">GST Rate</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 12, 18].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setTaxRate(rate)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                        taxRate === rate
                          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                          : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08]'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Discount</label>
                  <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {['flat', 'percent'].map(type => (
                      <button
                        key={type}
                        onClick={() => setDiscountType(type)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${discountType === type ? 'bg-gold-500/20 text-gold-300' : 'text-zinc-500'}`}
                      >
                        {type === 'flat' ? '₹' : '%'}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="discount-input"
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder={discountType === 'flat' ? 'e.g. 50' : 'e.g. 10'}
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                />
              </div>

              {/* Bill Summary */}
              <div className="p-4 rounded-xl space-y-3"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                {[
                  { label: 'Subtotal', value: `₹${selectedOrder.totalAmount.toFixed(2)}` },
                  { label: `GST (${taxRate}%)`, value: `+₹${((selectedOrder.totalAmount * taxRate) / 100).toFixed(2)}` },
                  { label: 'Discount', value: `-₹${calcDiscount(selectedOrder.totalAmount).toFixed(2)}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className="text-zinc-300 font-medium">{row.value}</span>
                  </div>
                ))}
                <div className="gold-divider" />
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total Payable</span>
                  <span className="text-gradient-gold text-xl">₹{calcTotal(selectedOrder.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowBillModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button
                  id="confirm-generate-bill"
                  onClick={generateBill}
                  disabled={generating}
                  className="btn-primary flex-1"
                >
                  {generating ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Receipt size={16} />
                      Generate Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {showViewModal && (
        <div className="modal-overlay" onClick={() => setShowViewModal(null)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="font-bold text-white">Invoice #{showViewModal._id?.slice(-8).toUpperCase()}</h2>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="btn-ghost p-2.5" title="Print">
                  <Printer size={16} />
                </button>
                <button onClick={() => setShowViewModal(null)} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06]">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div ref={printRef} className="p-6 space-y-4">
              <div className="text-center pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-lg font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Grand Hotel</p>
                <p className="text-xs text-zinc-500 mt-1">Table {showViewModal.tableId?.tableNumber} · {new Date(showViewModal.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Subtotal', value: `₹${showViewModal.subtotal?.toFixed(2)}` },
                  { label: 'Tax', value: `₹${showViewModal.tax?.toFixed(2)}` },
                  { label: 'Discount', value: `-₹${showViewModal.discount?.toFixed(2)}` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{r.label}</span>
                    <span className="text-zinc-300">{r.value}</span>
                  </div>
                ))}
                <div className="gold-divider" />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-white">Total</span>
                  <span className="text-gradient-gold">₹{showViewModal.total?.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-center">
                <span className={showViewModal.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-unpaid'}>
                  {showViewModal.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
