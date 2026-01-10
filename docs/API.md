# 📚 Store Commerce API Documentation

Complete reference for the Store Commerce REST API.

**Base URL:** `http://localhost:5000/api/v1`

**Content-Type:** `application/json`

---

## 🔐 Authentication

All authenticated routes require a valid JWT access token sent via HTTP-only cookies.

### Sign Up
Create a new user account.

**Endpoint:** `POST /auth/sign-up`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (201):**
```json
{
  "user": {
    "_id": "65f3c8a9b1d2e3f4a5b6c7d8",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Sets Cookies:**
- `accessToken` - JWT access token (15 minutes)
- `refreshToken` - JWT refresh token (7 days)

---

### Sign In
Authenticate existing user.

**Endpoint:** `POST /auth/sign-in`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "user": {
    "_id": "65f3c8a9b1d2e3f4a5b6c7d8",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### Sign Out
Logout current user.

**Endpoint:** `POST /auth/sign-out`

**Access:** Public

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Clears Cookies:** `accessToken`, `refreshToken`

---

### Refresh Token
Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh-token`

**Access:** Public (requires refresh token cookie)

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully"
}
```

**Sets Cookie:** New `accessToken`

---

### Get Profile
Get current user profile.

**Endpoint:** `GET /auth/profile`

**Access:** Protected (requires authentication)

**Success Response (200):**
```json
{
  "user": {
    "_id": "65f3c8a9b1d2e3f4a5b6c7d8",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "cartItems": []
  }
}
```

---

## 👕 Products

### Get All Products
Retrieve all products (admin only).

**Endpoint:** `GET /products`

**Access:** Protected + Admin

**Success Response (200):**
```json
{
  "products": [
    {
      "_id": "65f3c8a9b1d2e3f4a5b6c7d9",
      "name": "Classic White T-Shirt",
      "description": "Premium cotton t-shirt",
      "price": 29.99,
      "image": "https://res.cloudinary.com/.../tshirt.jpg",
      "category": "t-shirts",
      "isFeatured": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Get Featured Products
Get products marked as featured.

**Endpoint:** `GET /products/featured`

**Access:** Public

**Success Response (200):**
```json
{
  "products": [
    {
      "_id": "65f3c8a9b1d2e3f4a5b6c7d9",
      "name": "Premium Hoodie",
      "price": 79.99,
      "image": "https://res.cloudinary.com/.../hoodie.jpg",
      "isFeatured": true
    }
  ]
}
```

---

### Get Recommended Products
Get personalized product recommendations.

**Endpoint:** `GET /products/recommendations`

**Access:** Public

**Success Response (200):**
```json
{
  "products": [
    {
      "_id": "65f3c8a9b1d2e3f4a5b6c7da",
      "name": "Summer Dress",
      "price": 59.99,
      "image": "https://res.cloudinary.com/.../dress.jpg"
    }
  ]
}
```

---

### Get Products by Category
Filter products by category.

**Endpoint:** `GET /products/category/:categoryName`

**Parameters:**
- `categoryName` - Category slug (e.g., "t-shirts", "jeans", "dresses")

**Access:** Public

**Example:** `GET /products/category/t-shirts`

**Success Response (200):**
```json
{
  "products": [
    {
      "_id": "65f3c8a9b1d2e3f4a5b6c7d9",
      "name": "Classic White T-Shirt",
      "price": 29.99,
      "category": "t-shirts"
    }
  ]
}
```

---

### Create Product
Add new product to inventory.

**Endpoint:** `POST /products`

**Access:** Protected + Admin

**Request Body:**
```json
{
  "name": "Classic White T-Shirt",
  "description": "Premium cotton t-shirt in classic white",
  "price": 29.99,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "category": "t-shirts"
}
```

**Success Response (201):**
```json
{
  "product": {
    "_id": "65f3c8a9b1d2e3f4a5b6c7d9",
    "name": "Classic White T-Shirt",
    "description": "Premium cotton t-shirt in classic white",
    "price": 29.99,
    "image": "https://res.cloudinary.com/.../tshirt.jpg",
    "category": "t-shirts",
    "isFeatured": false
  }
}
```

**Notes:**
- Image should be base64 encoded
- Image is automatically uploaded to Cloudinary
- Maximum image size: 10MB

---

### Toggle Featured Product
Mark/unmark product as featured.

**Endpoint:** `PATCH /products/:productId`

**Parameters:**
- `productId` - Product MongoDB ObjectId

**Access:** Protected + Admin

**Example:** `PATCH /products/65f3c8a9b1d2e3f4a5b6c7d9`

**Success Response (200):**
```json
{
  "product": {
    "_id": "65f3c8a9b1d2e3f4a5b6c7d9",
    "name": "Classic White T-Shirt",
    "isFeatured": true
  }
}
```

---

### Delete Product
Remove product from inventory.

**Endpoint:** `DELETE /products/:productId`

**Parameters:**
- `productId` - Product MongoDB ObjectId

**Access:** Protected + Admin

**Example:** `DELETE /products/65f3c8a9b1d2e3f4a5b6c7d9`

**Success Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

**Notes:**
- Product image is automatically deleted from Cloudinary
- Removes product from all user carts

---

## 🛒 Shopping Cart

### Get Cart Products
Retrieve current user's cart.

**Endpoint:** `GET /cart`

**Access:** Protected

**Success Response (200):**
```json
{
  "cartItems": [
    {
      "product": {
        "_id": "65f3c8a9b1d2e3f4a5b6c7d9",
        "name": "Classic White T-Shirt",
        "price": 29.99,
        "image": "https://res.cloudinary.com/.../tshirt.jpg"
      },
      "quantity": 2
    }
  ]
}
```

---

### Add to Cart
Add product to cart or increase quantity.

**Endpoint:** `POST /cart`

**Access:** Protected

**Request Body:**
```json
{
  "productId": "65f3c8a9b1d2e3f4a5b6c7d9"
}
```

**Success Response (200):**
```json
{
  "cartItems": [
    {
      "product": "65f3c8a9b1d2e3f4a5b6c7d9",
      "quantity": 1
    }
  ]
}
```

---

### Update Quantity
Change product quantity in cart.

**Endpoint:** `PATCH /cart/:productId`

**Parameters:**
- `productId` - Product MongoDB ObjectId

**Access:** Protected

**Request Body:**
```json
{
  "quantity": 3
}
```

**Success Response (200):**
```json
{
  "cartItems": [
    {
      "product": "65f3c8a9b1d2e3f4a5b6c7d9",
      "quantity": 3
    }
  ]
}
```

**Notes:**
- Setting quantity to 0 removes the product from cart

---

### Remove from Cart
Delete product from cart.

**Endpoint:** `DELETE /cart/:productId`

**Parameters:**
- `productId` - Product MongoDB ObjectId

**Access:** Protected

**Success Response (200):**
```json
{
  "cartItems": []
}
```

---

## 🎟️ Coupons

### Get Coupon
Get active coupon for user (if available).

**Endpoint:** `GET /coupons`

**Access:** Protected

**Success Response (200):**
```json
{
  "coupon": {
    "_id": "65f3c8a9b1d2e3f4a5b6c7db",
    "code": "SAVE20",
    "discountPercentage": 20,
    "expirationDate": "2024-12-31T23:59:59.000Z",
    "isActive": true
  }
}
```

**No Coupon Response (200):**
```json
{
  "coupon": null
}
```

---

### Validate Coupon
Check if coupon code is valid.

**Endpoint:** `POST /coupons/validate`

**Access:** Protected

**Request Body:**
```json
{
  "code": "SAVE20"
}
```

**Success Response (200):**
```json
{
  "message": "Coupon is valid",
  "code": "SAVE20",
  "discountPercentage": 20
}
```

**Error Response (404):**
```json
{
  "message": "Coupon not found"
}
```

**Error Response (400):**
```json
{
  "message": "Coupon expired"
}
```

---

## 💳 Payments

### Create Checkout Session
Initialize Stripe payment session.

**Endpoint:** `POST /payments/create-checkout-session`

**Access:** Protected

**Request Body:**
```json
{
  "products": [
    {
      "product": "65f3c8a9b1d2e3f4a5b6c7d9",
      "quantity": 2
    }
  ],
  "couponCode": "SAVE20"
}
```

**Success Response (200):**
```json
{
  "id": "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  "totalAmount": 4799
}
```

**Notes:**
- `totalAmount` is in cents (e.g., 4799 = $47.99)
- Redirect user to Stripe Checkout with `sessionId`
- Coupon code is optional

---

### Checkout Success
Process successful payment.

**Endpoint:** `POST /payments/checkout-success`

**Access:** Protected

**Request Body:**
```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "orderId": "65f3c8a9b1d2e3f4a5b6c7dc",
  "message": "Payment successful, order created"
}
```

**Actions Performed:**
- Creates order in database
- Clears user's cart
- Deactivates used coupon
- May create new coupon for user (10% chance)

---

## 📊 Analytics

### Get Analytics Data
Retrieve admin dashboard statistics.

**Endpoint:** `GET /analytics`

**Access:** Protected + Admin

**Success Response (200):**
```json
{
  "analyticsData": {
    "users": 150,
    "products": 45,
    "totalSales": 12580.50,
    "totalRevenue": 125805.00
  },
  "dailySalesData": [
    {
      "date": "2024-01-15",
      "sales": 1250.00,
      "revenue": 12500.00
    }
  ]
}
```

**Notes:**
- Cached in Redis for 5 minutes

---

## 🔒 Authentication Details

### JWT Token Strategy

**Access Token:**
- Stored in HTTP-only cookie
- Expires in 15 minutes

**Refresh Token:**
- Stored in HTTP-only cookie
- Expires in 7 days

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |