const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, default: 4 },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Reserved'], 
    default: 'Available' 
  },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
});

module.exports = mongoose.model('Table', tableSchema);
