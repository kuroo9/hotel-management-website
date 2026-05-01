require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing users
    await User.deleteMany();

    const users = [
      { name: 'Admin User', email: 'admin@hotel.com', password: 'admin123', role: 'Admin' },
      { name: 'Waiter User', email: 'waiter@hotel.com', password: 'waiter123', role: 'Waiter' },
      { name: 'Chef User', email: 'chef@hotel.com', password: 'chef123', role: 'Chef' },
    ];

    for (let u of users) {
      await User.create(u);
    }

    console.log('Demo users created successfully');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();
