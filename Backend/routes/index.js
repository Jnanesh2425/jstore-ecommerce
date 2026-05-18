// this is for routing 
const express = require('express')
const router = express.Router()

const userSignUpController = require('../controller/user/userSignUp.js')
const userSignInController = require('../controller/user/userSignIn.js')
const authToken = require('../middleware/authToken.js')
const userDetailsController = require('../controller/user/userDetails.js')
const userLogout = require('../controller/user/userLogout.js')
const allUsers = require('../controller/user/allUsers.js')
const updateUser = require('../controller/user/updateUser.js')
const uploadProductController = require('../controller/product/uploadProduct.js')
const getProductController = require('../controller/product/getProduct.js')
const updateProductController = require('../controller/product/updateProduct.js')
const getCategoryProduct = require('../controller/product/getCategoryProduct.js')
const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct.js')
const getProductDetail = require('../controller/product/getProductDetail.js')
const addToCartController = require('../controller/user/addToCartController.js')
const countAddToCartProduct = require('../controller/user/countAddToCartProduct.js')
const viewCartController = require('../controller/user/viewCartController.js')
const updateCartQuantityController = require('../controller/user/updateCartQuantityController.js')
const deleteCartItemController = require('../controller/user/deleteCartItemController.js')
const submitRatingController = require('../controller/product/submitRatingController.js')
const getProductRatingsController = require('../controller/product/getProductRatingsController.js')
const placeOrderController = require('../controller/user/placeOrderController.js')
const checkPurchaseController = require('../controller/user/checkPurchaseController.js')
const searchProduct = require('../controller/product/searchProduct.js')
const upload = require('../middleware/multerConfig.js')
const uploadImageS3Controller = require('../controller/product/uploadImageS3.js')
const wishlistController = require('../controller/user/wishlistController.js')
const addressController = require('../controller/user/addressController.js')
const createRazorpayOrder = require('../controller/payment/createOrder.js')
const verifyPayment = require('../controller/payment/verifyPayment.js')
const getOrders = require('../controller/user/getOrders.js')
const updateOrderStatus = require('../controller/order/updateOrderStatus.js')
const createDirectOrder = require('../controller/payment/createDirectOrder.js')
const cancelOrder = require('../controller/payment/cancelOrder.js')

router.post('/signup',userSignUpController) //When a POST request is made to '/signup', the userSignUpController will handle it
router.post('/signin',userSignInController)
router.get('/user-details',authToken,userDetailsController)
router.get('/userlogout', userLogout)
//adminpanel
router.get('/all-user',authToken,allUsers)
router.post('/update-user',authToken,updateUser)

//product
router.post('/upload-product',authToken,uploadProductController)

//All products
router.get('/all-products',getProductController)

//Update product
router.post('/update-product', authToken,updateProductController)
router.post('/upload-image-s3', authToken, upload.single('image'), uploadImageS3Controller)

//to get category products
router.get('/get-categoryProduct', getCategoryProduct)
router.post('/category-product', getCategoryWiseProduct)

router.post('/product-details', getProductDetail)

//users addtocart
router.post("/addtocart", authToken,addToCartController)
//count addtocart items
router.get('/count-cart-items', authToken,countAddToCartProduct)
//view cart items
router.get('/view-cart', authToken, viewCartController)
//update cart quantity
router.post('/update-cart-quantity', authToken, updateCartQuantityController)
//delete cart item
router.post('/delete-cart-item', authToken, deleteCartItemController)
//search product
router.get('/search', searchProduct)

//orders
router.post('/place-order', authToken, placeOrderController)
router.post('/check-purchase', authToken, checkPurchaseController)

//ratings
router.post('/submit-rating', authToken, submitRatingController)
router.post('/get-product-ratings', getProductRatingsController)

// Wishlist routes
router.post('/add-to-wishlist', authToken, wishlistController.addToWishlist)
router.get('/get-wishlist', authToken, wishlistController.getWishlist)
router.post('/remove-from-wishlist', authToken, wishlistController.removeFromWishlist)

// Address routes
router.post('/add-address', authToken, addressController.addAddress)
router.get('/get-addresses', authToken, addressController.getAddresses)
router.post('/update-address', authToken, addressController.updateAddress)
router.post('/delete-address', authToken, addressController.deleteAddress)
router.post('/set-default-address', authToken, addressController.setDefaultAddress)

//Payment routes
router.post('/create-razorpay-order', authToken, createRazorpayOrder)
router.post('/verify-payment', authToken, verifyPayment)

//Get user orders
router.get('/get-orders', authToken, getOrders)

//Update order status (Admin)
router.post('/update-order-status', authToken, updateOrderStatus)

// Direct buy routes
router.post('/create-direct-razorpay-order', authToken, createDirectOrder);
router.post('/cancel-order', authToken, cancelOrder);

// Test route - Cron job schedule info (optional)
router.get('/test-cron', async (req, res) => {
  try {
    res.json({ 
      message: 'Cron jobs are running automatically',
      schedule: {
        'cron7AM': '7:00 AM - Update to "out for delivery"',
        'cron10AM': '10:00 AM - Update "shipped" & "delivered" statuses'
      },
      deliveryTypes: {
        'standard': { days: 5, charge: '₹10' },
        'express': { days: 2, charge: '₹60' }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router