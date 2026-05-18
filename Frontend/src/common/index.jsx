const backendDomain = 'http://localhost:3000'

const summaryAPI = {
    signUp: {
        url: `${backendDomain}/api/signup`, //defining a custom JavaScript object.
        method: "post"
    },
    signIn: {
        url: `${backendDomain}/api/signin`,
        method: "post"
    },
    current_user: {
        url: `${backendDomain}/api/user-details`,
        method: "get"
    },
    logout_user: {
        url: `${backendDomain}/api/userLogout`,
        method: "get"
    },
    allUser: {
        url: `${backendDomain}/api/all-user`,
        method: "get"
    },
    updateUser: {
        url: `${backendDomain}/api/update-user`,
        method: "post"
    },
    uploadProduct: {
        url: `${backendDomain}/api/upload-product`,
        method: "post"
    },
    allProduct: {
        url: `${backendDomain}/api/all-products`,
        method: "get"
    },
    updateProduct: {
        url: `${backendDomain}/api/update-product`,
        method: 'post'
    },
    categoryProduct: {
        url: `${backendDomain}/api/get-categoryProduct`,
        method: 'get'
    },
    getCategoryWiseProduct: {
        url: `${backendDomain}/api/category-product`,
        method: 'post'
    },
    productDetails: {
        url: `${backendDomain}/api/product-details`,
        method: 'post'
    },
    addToCartProduct: {
        url: `${backendDomain}/api/addtocart`,
        method: 'post'
    },
    addToCartProductCount: {
        url: `${backendDomain}/api/count-cart-items`,
        method: 'get'
    },
    viewCart: {
        url: `${backendDomain}/api/view-cart`,
        method: 'get'
    },
    updateCartQuantity: {
        url: `${backendDomain}/api/update-cart-quantity`,
        method: 'post'
    },
    deleteCartItem: {
        url: `${backendDomain}/api/delete-cart-item`,
        method: 'post'
    },
    submitRating: {
        url: `${backendDomain}/api/submit-rating`,
        method: 'post'
    },
    getProductRatings: {
        url: `${backendDomain}/api/get-product-ratings`,
        method: 'post'
    },
    placeOrder: {
        url: `${backendDomain}/api/place-order`,
        method: 'post'
    },
    checkPurchase: {
        url: `${backendDomain}/api/check-purchase`,
        method: 'post'
    },
    searchProduct: {
        url: `${backendDomain}/api/search`,
        method: 'get'
    },
    uploadImageS3: {
        url: `${backendDomain}/api/upload-image-s3`,
        method: 'post'
    },
    addToWishlist: {
        url: `${backendDomain}/api/add-to-wishlist`,
        method: 'post'
    },
    getWishlist: {
        url: `${backendDomain}/api/get-wishlist`,
        method: 'get'
    },
    removeFromWishlist: {
        url: `${backendDomain}/api/remove-from-wishlist`,
        method: 'post'
    },
    addAddress: {
        url: `${backendDomain}/api/add-address`,
        method: "post"
    },
    getAddresses: {
        url: `${backendDomain}/api/get-addresses`,
        method: "get"
    },
    updateAddress: {
        url: `${backendDomain}/api/update-address`,
        method: "post"
    },
    deleteAddress: {
        url: `${backendDomain}/api/delete-address`,
        method: "post"
    },
    getOrders: {
        url: `${backendDomain}/api/get-orders`,
        method: "get"
    },
    createRazorpayOrder: {
        url: `${backendDomain}/api/create-razorpay-order`,
        method: "post"
    },
    verifyPayment: {
        url: `${backendDomain}/api/verify-payment`,
        method: "post"
    },
    directBuyRazorpayOrder: {
        url: `${backendDomain}/api/create-direct-razorpay-order`,
        method: "post"
    },
    cancelOrder: {
        url: `${backendDomain}/api/cancel-order`,
        method: "post"
    },
}

export default summaryAPI;