const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  items: [Object],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true }, // GST 5% or 18%
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Unpaid', 'Pending'], 
    default: 'Unpaid' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
