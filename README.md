# E-Commerce Platform

A production-grade e-commerce platform built with modern web technologies, featuring secure payment processing, automated order management, and a comprehensive admin dashboard.

## Technology Stack

**Frontend:**
- React 19 with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Router for navigation
- Razorpay integration for payments

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- AWS S3 for image storage
- AWS SES for email notifications
- Docker containerization
- Jenkins CI/CD pipeline

## Features

### Core Features
- 50+ RESTful APIs with JWT-based authentication
- Email OTP verification for account security
- Role-based access control (User, Admin)
- Product catalog with ratings and reviews
- Shopping cart and wishlist functionality
- Complete order management system
- Admin dashboard for product and order management

### Payment Processing
- Razorpay integration with HMAC-SHA256 verification
- Secure order creation and verification
- Order cancellation support
- Direct order checkout

### Order Pipeline
- Automated 5-stage order status management via cron jobs
- Order status transitions: Pending → Confirmed → Shipped → Out for Delivery → Delivered
- Automated delivery date calculations
- Order tracking and history

### User Features
- User authentication (Sign Up, Sign In, Sign Out)
- Password reset with email verification
- User profile management
- Address management
- Purchase history
- Product search and filtering by category
- Product ratings and reviews submission

### Admin Features
- User management and role assignment
- Product upload and management
- Image upload to AWS S3
- Product editing and deletion
- Order status monitoring and updates
- Admin-only dashboard access

### Email Notifications
- Order confirmation emails
- Delivery status alerts
- Password reset notifications
- OTP verification emails

## Database Schema

MongoDB Collections:
- Users (userModel)
- Products (productModel)
- Orders (orderModel)
- Shopping Cart (addToCart)
- Wishlist (wishlistModel)
- Ratings & Reviews (ratingModel)
- User Addresses (addressModel)
- Email OTPs (emailOtpModel)
- Password Reset Tokens (passwordResetModel)

## Project Structure

```
e_commerce/
├── Backend/
│   ├── controller/          # Business logic controllers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Authentication, file uploads
│   ├── helpers/             # Utilities (email, OTP, cron jobs)
│   ├── config/              # Database configuration
│   ├── index.js             # Express server setup
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   ├── context/         # React context
│   │   ├── routes/          # Route definitions
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
│
└── Jenkinsfile              # CI/CD pipeline definition
```

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/signin` - User login
- `GET /api/userlogout` - User logout
- `POST /api/send-email-otp` - Send OTP to email
- `POST /api/verify-email-otp` - Verify OTP
- `POST /api/forgot-password` - Password recovery
- `POST /api/reset-password` - Reset password

### Products
- `GET /api/all-products` - Get all products
- `POST /api/upload-product` - Upload new product (Admin)
- `POST /api/update-product` - Update product (Admin)
- `GET /api/get-categoryProduct` - Get products by category
- `POST /api/product-details` - Get product details
- `POST /api/submit-rating` - Submit product rating
- `POST /api/get-product-ratings` - Get product ratings
- `GET /api/search` - Search products

### Shopping Cart
- `POST /api/addtocart` - Add item to cart
- `GET /api/count-cart-items` - Get cart item count
- `GET /api/view-cart` - View cart items
- `POST /api/update-cart-quantity` - Update item quantity
- `POST /api/delete-cart-item` - Remove from cart

### Orders
- `POST /api/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment
- `POST /api/check-purchase` - Check user purchase history
- `GET /api/get-orders` - Get user orders
- `POST /api/update-order-status` - Update order status (Admin)

### Wishlist
- `POST /api/add-to-wishlist` - Add to wishlist
- `GET /api/get-wishlist` - Get wishlist items
- `POST /api/remove-from-wishlist` - Remove from wishlist

### Addresses
- `POST /api/add-address` - Add delivery address
- `GET /api/get-addresses` - Get saved addresses

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- AWS Account (for S3, SES, EC2)
- Razorpay Account

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd Backend
   npm install
   ```

2. Create `.env` file with required variables:
   ```
   PORT=8080
   MONGODB_URI=your_mongodb_uri
   TOKEN_SECRET_KEY=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=your_aws_region
   S3_BUCKET_NAME=your_bucket_name
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   FRONTEND_URL=http://localhost:5173
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_email_password
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd Frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

### Docker

Build and run the backend:
```bash
docker build -t ecommerce-backend .
docker run -p 8080:8080 ecommerce-backend
```

### AWS Deployment

- Backend deployed on EC2 instance
- Database hosted on MongoDB Atlas or EC2
- Static assets stored on S3
- Email notifications via SES
- Docker for containerization
- Jenkins for CI/CD automation

### CI/CD Pipeline

Jenkins pipeline automates:
- Code checkout from GitHub
- Dependency installation
- Building Docker images
- Pushing to registry
- Deploying to EC2
- Health checks

## Security Features

- JWT token-based authentication with 8-hour expiration
- HMAC-SHA256 payment verification
- Email OTP for account verification
- Password hashing with bcryptjs
- Role-based access control
- CORS configuration
- HTTPOnly cookies for token storage
- MongoDB TTL indexes for automatic cleanup of expired OTPs and reset tokens

## Development Scripts

**Backend:**
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run lint` - Run ESLint

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm test` - Run tests with Vitest

## Performance Optimizations

- Lazy loading of components
- Image optimization via S3
- Automated cron jobs for order pipeline efficiency
- TTL indexes on temporary collections
- Efficient database queries with proper indexing
- Tailwind CSS for minimal CSS output

## Future Enhancements

- Advanced product filtering and sorting
- Inventory management system
- Customer reviews with moderation
- Promotional codes and discounts
- Real-time order tracking notifications
- Mobile application
- Analytics dashboard
