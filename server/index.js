require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB Connected');
  } catch (err) {
    console.log('Local MongoDB not found. Starting In-Memory MongoDB for demonstration...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('In-Memory MongoDB Connected successfully at', mongoUri);
      
      // Auto-seed users and menu on in-memory db
      try {
        const User = require('./models/User');
        const MenuItem = require('./models/MenuItem');
        const fs = require('fs');
        const path = require('path');
        
        // Always seed users (in-memory DB is fresh on each restart)
        await User.deleteMany({});
        await MenuItem.deleteMany({});
        
        await User.create([
          { name: 'Admin User', email: 'admin@hotel.com', password: 'admin123', role: 'Admin' },
          { name: 'Waiter User', email: 'waiter@hotel.com', password: 'waiter123', role: 'Waiter' },
          { name: 'Chef User', email: 'chef@hotel.com', password: 'chef123', role: 'Chef' }
        ]);
        console.log('Seeded Admin, Waiter, and Chef accounts.');

        // PRIORITY: Load persisted menu from menu.json FIRST (contains user-added items with images)
        // Only fall back to default seed items if no backup exists
        const dataPath = path.join(__dirname, 'data', 'menu.json');
        let loadedFromBackup = false;
        if (fs.existsSync(dataPath)) {
          try {
            const raw = fs.readFileSync(dataPath, 'utf8');
            const persisted = JSON.parse(raw);
            if (Array.isArray(persisted) && persisted.length > 0) {
              await MenuItem.create(persisted.map(item => ({
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                image: item.image,  // may be URL, base64, or filename
                isAvailable: item.isAvailable
              })));
              loadedFromBackup = true;
              console.log(`Restored ${persisted.length} menu items from data/menu.json (user data preserved).`);
            }
          } catch (e) {
            console.warn('Failed to load persisted menu.json, falling back to defaults:', e.message);
          }
        }

        if (!loadedFromBackup) {
          // No backup found — seed with default menu items
          await MenuItem.create([
              // Indian Cuisines
              { name: 'Butter Chicken', description: 'Tender chicken cooked in a rich, creamy tomato sauce.', price: 18.99, category: 'Main Course', image: 'https://images.unsplash.com/photo-1499619912507-3e894b0ecc44?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'Paneer Tikka Masala', description: 'Grilled cottage cheese cubes in a spiced gravy.', price: 15.99, category: 'Main Course', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'Garlic Naan', description: 'Freshly baked flatbread topped with garlic and butter.', price: 4.99, category: 'Starters', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'Vegetable Samosa', description: 'Crispy pastry filled with spiced potatoes and peas.', price: 6.99, category: 'Starters', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'Mango Lassi', description: 'Sweet and creamy yogurt drink blended with ripe mangoes.', price: 5.99, category: 'Drinks', image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'Gulab Jamun', description: 'Deep-fried milk dumplings soaked in sugar syrup.', price: 7.99, category: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              
              // American Cuisines
              { name: 'Classic Cheeseburger', description: 'Juicy beef patty with melted cheddar, lettuce, and tomato.', price: 14.99, category: 'Main Course', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'BBQ Pork Ribs', description: 'Slow-cooked ribs glazed with our signature BBQ sauce.', price: 24.99, category: 'Main Course', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'Buffalo Wings', description: 'Crispy chicken wings tossed in spicy buffalo sauce.', price: 12.99, category: 'Starters', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'Mac & Cheese', description: 'Creamy blend of cheddar and gruyere with a crispy crumb topping.', price: 10.99, category: 'Starters', image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'New York Cheesecake', description: 'Rich, dense vanilla cheesecake with a graham cracker crust.', price: 8.99, category: 'Desserts', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=400', isAvailable: true },
              { name: 'Craft IPA Beer', description: 'Locally brewed hoppy Indian Pale Ale.', price: 6.99, category: 'Drinks', image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=400', isAvailable: true }
          ]);
          console.log('Seeded default Indian and American Menu Items (no backup found).');
        }

        const Table = require('./models/Table');
        await Table.deleteMany({});
        await Table.create([
            { tableNumber: 1, capacity: 2 },
            { tableNumber: 2, capacity: 2 },
          { tableNumber: 3, capacity: 4 },
          { tableNumber: 4, capacity: 4 },
          { tableNumber: 5, capacity: 6 },
          { tableNumber: 6, capacity: 6 },
          { tableNumber: 7, capacity: 4 },
          { tableNumber: 8, capacity: 2 }
        ]);
        console.log('Seeded 8 restaurant tables.');

      } catch (e) {
        console.log('Seeding error:', e.message);
      }
    } catch (memErr) {
      console.error('Failed to start In-Memory MongoDB:', memErr);
    }
  }
};
connectDB();

// Socket.io context
app.set('io', io);

// Serve React frontend static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));

// Fallback route for React Router (SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Socket handlers
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
