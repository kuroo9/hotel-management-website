# Hotel Management System (MERN Stack)

A production-ready Hotel Management System built with React, Node.js, MongoDB, and Socket.io.

## Features
- **Real-time Kitchen Display**: Orders appear instantly for chefs.
- **Role-based Access**: Admin, Waiter, and Chef roles with specific permissions.
- **Menu Management**: Full CRUD for menu items with image support.
- **Table Management**: Visual status of all restaurant tables.
- **Billing System**: Auto-generate invoices with tax and discount calculation.
- **QR Code Menu**: Public menu access for customers via table-specific QR codes.
- **Real-time Notifications**: Toast alerts for new orders and status updates.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Socket.io-client, React Hot Toast.
- **Backend**: Node.js, Express, MongoDB/Mongoose, Socket.io, JWT, Multer.

## Setup Instructions

### Backend
1. Go to `server` folder: `cd server`
2. Install dependencies: `npm install`
3. Create `.env` file with your MongoDB URI:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```
4. Start server: `npm run dev`

### Frontend
1. Go to `client` folder: `cd client`
2. Install dependencies: `npm install`
3. Create `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```
4. Start app: `npm run dev`

## Roles & Credentials (Demo)
- **Admin**: admin@hotel.com / admin123
- **Waiter**: waiter@hotel.com / waiter123
- **Chef**: chef@hotel.com / chef123
