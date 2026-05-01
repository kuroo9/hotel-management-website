const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  waiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    qty: { type: Number, default: 1 },
    note: { type: String }
  }],
  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
