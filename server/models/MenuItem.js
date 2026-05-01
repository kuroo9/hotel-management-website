const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Starters', 'Main Course', 'Drinks', 'Desserts'], 
    required: true 
  },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
