# 🛍️ Store Commerce - Full-Stack E-Commerce Platform

A modern, full-featured e-commerce platform for clothing retail built with the MERN stack, featuring secure payments, real-time analytics, and an intuitive admin dashboard.

![Store Commerce Banner](screenshots/banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen.svg)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Customer Features
- 🔐 **Secure Authentication** - JWT-based authentication with access/refresh tokens
- 👤 **User Profiles** - Manage personal information and order history
- 🛒 **Shopping Cart** - Add, update, and remove items with real-time price calculations
- 💳 **Stripe Integration** - Secure payment processing with Stripe Checkout
- 🎟️ **Discount Coupons** - Apply promotional codes at checkout
- ⭐ **Featured Products** - Browse highlighted items and recommendations
- 📂 **Category Browsing** - Filter products by clothing categories
- 📱 **Responsive Design** - Seamless experience across all devices

### Admin Features
- 📊 **Analytics Dashboard** - Real-time sales, revenue, and user statistics
- 📦 **Product Management** - Full CRUD operations for inventory
- 🎯 **Featured Products** - Toggle featured status for promotional items
- 🖼️ **Image Upload** - Cloudinary integration for product images
- 👥 **Role-Based Access Control** - Separate admin and customer permissions
- 💰 **Revenue Tracking** - Monitor sales performance and trends

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Redis** - Caching layer for performance

### Security & Authentication
- **JWT** - JSON Web Tokens (access & refresh)
- **bcrypt.js** - Password hashing
- **HTTP-only cookies** - Secure token storage

### External Services
- **Stripe** - Payment processing
- **Cloudinary** - Image hosting and optimization

## 📚 API Documentation

Comprehensive API documentation is available in the [`docs/API.md`](docs/API.md) file.

**Quick Links:**
- [Authentication Endpoints](docs/API.md#authentication)
- [Products Endpoints](docs/API.md#products)
- [Cart Endpoints](docs/API.md#cart)
- [Payment Endpoints](docs/API.md#payments)
- [Coupons Endpoints](docs/API.md#coupons)
- [Analytics Endpoints](docs/API.md#analytics)

**Base URL:** `http://localhost:5000/api/v1`

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Stripe account
- Cloudinary account

### Clone Repository
```bash
git clone https://github.com/rasathelamedude/store-commerce.git
cd store-commerce
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file (see Environment Variables section)
touch .env

# Start backend server
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install

# Start frontend dev server
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 🔐 Environment Variables

Create a `.env.development.local` file in the `root` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_CONNECTION_URI=mongodb://localhost:27017/store-commerce
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/store-commerce

# JWT Secrets
ACCESS_SECRET_KEY=your_access_secret_here
REFRESH_SECRET_KEY=your_refresh_secret_here

# Redis
REDIS_URI=redis://localhost:6379
# Or use Redis Cloud: redis://username:password@host:port

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Client URL
CLIENT_URL=http://localhost:5173
```

### Getting API Keys

**MongoDB Atlas:**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster and get connection string

**Redis Cloud:**
1. Create account at [redis.com/try-free](https://redis.com/try-free/)
2. Create database and get connection URI

**Cloudinary:**
1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Get credentials from dashboard

**Stripe:**
1. Create account at [stripe.com](https://stripe.com/)
2. Get test API keys from developers section

## 📁 Project Structure

```
store-commerce/
├── backend/
│   ├── controllers/       # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── lib/              # Utility functions
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── env.js
│   ├── app.js            # Express app setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand stores
│   │   ├── lib/          # Utilities
│   │   └── App.jsx
│   ├── public/           # Static assets
│   └── package.json
│
├── docs/
│   └── API.md            # API documentation
│
└── README.md
```

## 📸 Screenshots

### Customer View
![Homepage](screenshots/homepage.png)
*Browse featured products and categories*

![Product Page](screenshots/product-page.png)
*Detailed product information and add to cart*

![Shopping Cart](screenshots/cart.png)
*Review items and apply discount coupons*

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)
*Real-time analytics and sales metrics*

![Product Management](screenshots/admin-products.png)
*Manage inventory with full CRUD operations*

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Access and refresh token strategy
- **HTTP-Only Cookies** - Prevents XSS attacks
- **CORS Configuration** - Controlled cross-origin requests
- **Input Validation** - Server-side validation for all inputs
- **Rate Limiting** - Protection against brute force attacks
- **Secure Headers** - Helmet.js for HTTP headers

## 🎯 API Features

- **RESTful Design** - Following REST principles
- **Error Handling** - Consistent error responses
- **Authentication Middleware** - Protected routes
- **Role-Based Access** - Admin-only endpoints
- **Redis Caching** - Improved performance for frequent queries
- **Image Optimization** - Cloudinary transformations

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Rasyar Safin Mustafa**
- GitHub: [@rasathelamedude](https://github.com/rasathelamedude)
- LinkedIn: [Rasyar Safin](https://linkedin.com/in/rasyar-safin-1b103b29)
- Portfolio: [rasyar.netlify.app](https://rasyar.netlify.app)

## 🙏 Acknowledgments

- Stripe for payment processing infrastructure
- Cloudinary for image hosting solution
- MongoDB for flexible data storage
- The MERN stack community

---

**⭐ If you found this project useful, please consider giving it a star!**
