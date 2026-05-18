import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import summaryAPI from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import { FaCheckCircle, FaBox, FaStar, FaRegStar, FaHeadset, FaMapMarkerAlt, FaPhone, FaUser, FaDownload, FaTruck, FaTimesCircle } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import DeliveryDetails from '../components/DeliveryDetails';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratingData, setRatingData] = useState({});
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await fetch(summaryAPI.getOrders.url, {
                method: summaryAPI.getOrders.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' }
            });
            const data = await response.json();
            
            if (data.success) {
                const foundOrder = data.data?.find(o => o._id === orderId);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    toast.error('Order not found');
                    navigate('/orders');
                }
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Error fetching order details');
        } finally {
            setLoading(false);
        }
    };

    const handleRatingSubmit = async (productId, productName) => {
        const rating = ratingData[productId];
        const review = document.getElementById(`review_${productId}`)?.value;

        if (!rating || !review) {
            toast.warning('Please provide both rating and review');
            return;
        }

        setSubmittingRating(true);
        try {
            const response = await fetch(summaryAPI.submitRating.url, {
                method: summaryAPI.submitRating.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    rating,
                    review,
                    comment: review
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Rating submitted successfully!');
                setRatingData(prev => ({ ...prev, [productId]: 0 }));
                document.getElementById(`review_${productId}`).value = '';
            } else {
                toast.error(data.message || 'Failed to submit rating');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error('Error submitting rating');
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) {
        return <div className='container mx-auto px-4 py-8 text-center'>Loading...</div>;
    }

    if (!order) {
        return <div className='container mx-auto px-4 py-8 text-center'>Order not found</div>;
    }

    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    const isDelivered = order.status === 'delivered';
    const isPaymentFailed = order.status === 'payment_failed';
    const deliveryCharge = order.deliveryType === 'express' ? 60 : 10;
    const deliveryFee = 10;
    const handlingFee = Math.max(deliveryCharge - deliveryFee, 0);

    return (
        <div className='bg-gray-50 min-h-screen py-6'>
            <div className='container mx-auto px-4'>
                {/* Breadcrumb Navigation */}
                <div className='text-sm text-gray-600 mb-8 flex items-center gap-3'>
                    <button 
                        onClick={() => navigate('/')}
                        className='hover:text-blue-600 cursor-pointer font-medium'
                    >
                        Home
                    </button>
                    <span className='text-gray-400'>›</span>
                    <button 
                        onClick={() => navigate('/account')}
                        className='hover:text-blue-600 cursor-pointer font-medium'
                    >
                        My Account
                    </button>
                    <span className='text-gray-400'>›</span>
                    <button 
                        onClick={() => navigate('/orders')}
                        className='hover:text-blue-600 cursor-pointer font-medium'
                    >
                        My Orders
                    </button>
                    <span className='text-gray-400'>›</span>
                    <span className='text-gray-900 font-semibold'>{order._id?.slice(-12).toUpperCase()}</span>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Main Content - Left & Center */}
                    <div className='lg:col-span-2 space-y-6'>

                        {/* Product Card */}
                        {order.products?.map((product, idx) => (
                            <div key={idx} className='bg-white rounded-lg shadow-sm p-6'>
                                <div className='flex gap-6 mb-6 pb-6 border-b'>
                                    {/* Product Image */}
                                    <div className='w-32 h-32 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0'>
                                        {product.productImage ? (
                                            <img 
                                                src={product.productImage}
                                                alt={product.productName}
                                                className='w-full h-full object-scale-down p-3'
                                            />
                                        ) : (
                                            <FaBox className='text-4xl text-gray-400' />
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className='flex-1'>
                                        <h2 className='text-lg font-bold text-gray-900 mb-2'>{product.productName}</h2>
                                        <p className='text-gray-600 text-sm mb-3'>Color: {product.color || 'N/A'}</p>
                                        <p className='text-gray-600 text-sm mb-4'>Seller: {product.seller || 'E-Commerce Store'}</p>
                                        
                                        <div className='flex items-center gap-3 mb-2'>
                                            <span className='text-2xl font-bold text-red-600'>{displayINRCurrency(product.sellingPrice)}</span>
                                            {product.price !== product.sellingPrice && (
                                                <>
                                                    <span className='text-lg text-gray-500 line-through'>{displayINRCurrency(product.price)}</span>
                                                    <span className='text-orange-600 font-bold'>
                                                        {Math.round((1 - product.sellingPrice / product.price) * 100)}% off
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {product.offers && <p className='text-green-600 text-sm'>{product.offers}</p>}
                                    </div>
                                </div>

                                {/* Delivery Timeline - Full Detailed View */}
                                <style>{`
                                    @keyframes pulse-ring {
                                        0% {
                                            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.8) !important;
                                        }
                                        50% {
                                            box-shadow: 0 0 0 12px rgba(34, 197, 94, 0.3) !important;
                                        }
                                        100% {
                                            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0) !important;
                                        }
                                    }
                                    @keyframes pulse-scale {
                                        0%, 100% {
                                            opacity: 1;
                                        }
                                        50% {
                                            opacity: 0.7;
                                        }
                                    }
                                    .pulse-ring {
                                        animation: pulse-ring 2s infinite !important;
                                    }
                                    .pulse-scale {
                                        animation: pulse-scale 2s infinite !important;
                                    }
                                `}</style>

                                <div className='mb-6 pb-6 border-b'>
                                    <h2 className='text-2xl font-bold text-gray-800 mb-6'>Order Tracking</h2>
                                    
                                    {/* Timeline */}
                                    <div className='relative'>
                                        {/* Vertical Line */}
                                        <div className={`absolute left-6 top-0 bottom-0 w-1 ${isPaymentFailed ? 'bg-gradient-to-b from-green-500 via-red-400 to-red-500' : 'bg-gradient-to-b from-green-500 via-green-400 to-gray-300'}`}></div>

                                        {/* Steps */}
                                        <div className='space-y-6'>
                                            {(
                                                isPaymentFailed
                                                    ? [
                                                        {
                                                            id: 1,
                                                            title: 'Order Confirmed',
                                                            description: 'Seller has processed your order',
                                                            date: new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
                                                            icon: <FaCheckCircle className='text-xl' />,
                                                            status: 'confirmed'
                                                        },
                                                        {
                                                            id: 2,
                                                            title: 'Payment Failed',
                                                            description: 'Customer left payment without completing it',
                                                            date: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Today',
                                                            icon: <FaTimesCircle className='text-xl' />,
                                                            status: 'payment_failed'
                                                        }
                                                    ]
                                                    : [
                                                        {
                                                            id: 1,
                                                            title: 'Order Confirmed',
                                                            description: 'Seller has processed your order',
                                                            date: new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
                                                            icon: <FaCheckCircle className='text-xl' />,
                                                            status: 'confirmed'
                                                        },
                                                        {
                                                            id: 2,
                                                            title: 'Shipped',
                                                            description: 'Order is on the way to delivery partner',
                                                            date: order.shippedDate ? new Date(order.shippedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Expected Soon',
                                                            icon: <FaTruck className='text-xl' />,
                                                            status: 'shipped'
                                                        },
                                                        {
                                                            id: 3,
                                                            title: 'Out For Delivery',
                                                            description: 'Package is out for delivery',
                                                            date: order.outForDeliveryDate ? new Date(order.outForDeliveryDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Expected Soon',
                                                            icon: <MdLocalShipping className='text-xl' />,
                                                            status: 'out-for-delivery'
                                                        },
                                                        {
                                                            id: 4,
                                                            title: 'Delivered',
                                                            description: 'Package has been delivered',
                                                            date: order.deliveredDate ? new Date(order.deliveredDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Expected Soon',
                                                            icon: <FaMapMarkerAlt className='text-xl' />,
                                                            status: 'delivered'
                                                        }
                                                    ]
                                            ).map((step, idx) => {
                                                const statusMap = isPaymentFailed
                                                    ? { 'confirmed': 0, 'payment_failed': 1 }
                                                    : { 'confirmed': 0, 'shipped': 1, 'out-for-delivery': 2, 'out for delivery': 2, 'delivered': 3 };
                                                const currentIndex = statusMap[order.status] ?? (isPaymentFailed ? 1 : -1);
                                                const isCompleted = idx <= currentIndex;
                                                const isCurrent = idx === currentIndex;
                                                const isFailedStep = isPaymentFailed && step.status === 'payment_failed';
                                                
                                                return (
                                                    <div key={step.id} className='relative pl-20'>
                                                        {/* Circle Indicator */}
                                                        <div className={`absolute left-0 top-0 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                                                            isFailedStep ? 'bg-red-600' : isCompleted ? 'bg-green-600' : 'bg-gray-300'
                                                        } ${isCurrent ? 'pulse-ring' : ''}`}>
                                                            {step.icon}
                                                        </div>

                                                        {/* Content */}
                                                        <div className={`p-4 rounded-lg border-2 transition-all ${
                                                            isFailedStep ? 'border-red-200 bg-red-50' :
                                                            isCompleted ? 'border-green-200 bg-green-50' :
                                                            isCurrent ? 'border-green-500 bg-green-50 shadow-lg' :
                                                            'border-gray-200 bg-gray-50'
                                                        }`}>
                                                            <div className='flex justify-between items-start gap-4'>
                                                                <div className='flex-1'>
                                                                    <h3 className={`font-bold text-lg ${
                                                                        isFailedStep ? 'text-red-700' :
                                                                        isCompleted ? 'text-green-700' :
                                                                        isCurrent ? 'text-green-600' :
                                                                        'text-gray-600'
                                                                    }`}>
                                                                        {step.title}
                                                                    </h3>
                                                                    <p className={`text-sm mt-1 ${
                                                                        isFailedStep ? 'text-red-600' :
                                                                        isCompleted ? 'text-green-600' :
                                                                        isCurrent ? 'text-green-500' :
                                                                        'text-gray-500'
                                                                    }`}>
                                                                        {step.description}
                                                                    </p>
                                                                </div>
                                                                <div className='text-right'>
                                                                    <p className={`text-sm font-semibold ${
                                                                        isFailedStep ? 'text-red-700' :
                                                                        isCompleted ? 'text-green-700' :
                                                                        isCurrent ? 'text-green-600' :
                                                                        'text-gray-500'
                                                                    }`}>
                                                                        {step.date}
                                                                    </p>
                                                                    {isCurrent && (
                                                                        <span className={`inline-block mt-1 px-2 py-1 text-white text-xs font-bold rounded animate-pulse ${
                                                                            isFailedStep ? 'bg-red-500' : 'bg-green-500'
                                                                        }`}>
                                                                            {isFailedStep ? 'Payment Failed' : 'In Progress'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Section - Only if Delivered */}
                                {isDelivered && (
                                    <div className='mb-6 pb-6 border-b'>
                                        <h3 className='font-bold text-gray-900 mb-4 text-lg'>Rate your experience</h3>
                                        
                                        <div className='flex items-center gap-2 mb-4'>
                                            <input type='checkbox' className='w-4 h-4' />
                                            <span className='text-gray-700 font-semibold'>Rate the product</span>
                                        </div>

                                        {/* Star Rating */}
                                        <div className='flex gap-3 mb-4 justify-center'>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRatingData(prev => ({ ...prev, [product.productId]: star }))}
                                                    className='text-4xl transition-colors'
                                                >
                                                    {(ratingData[product.productId] || 0) >= star
                                                        ? <FaStar className='text-yellow-400' />
                                                        : <FaRegStar className='text-gray-300 hover:text-yellow-400' />
                                                    }
                                                </button>
                                            ))}
                                        </div>

                                        {/* Review Text */}
                                        <textarea
                                            id={`review_${product.productId}`}
                                            placeholder='Share your experience with this product'
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3'
                                            rows='3'
                                        />

                                        {/* Submit Button */}
                                        <button
                                            onClick={() => handleRatingSubmit(product.productId, product.productName)}
                                            disabled={submittingRating}
                                            className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors'
                                        >
                                            {submittingRating ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </div>
                                )}

                                {/* Chat with us */}
                                <div className='flex items-center justify-center gap-3 py-4 border-t text-blue-600 hover:text-blue-800 cursor-pointer font-semibold transition-colors'>
                                    <FaHeadset className='text-lg' />
                                    Chat with us
                                </div>
                            </div>
                        ))}

                        {/* Order ID */}
                        <div className='text-gray-600 text-sm mt-4'>
                            Order #{order._id}
                        </div>
                    </div>

                    {/* Sidebar - Right */}
                    <div className='space-y-6'>
                        {/* Delivery Details Component */}
                        <DeliveryDetails order={order} />

                        {/* Price Details */}
                        <div className='bg-white rounded-lg shadow-sm p-6'>
                            <h3 className='text-lg font-bold text-gray-900 mb-4'>Price details</h3>
                            <div className='space-y-3 text-sm border-b pb-3'>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Delivery type</span>
                                    <span className='text-gray-900 capitalize'>{order.deliveryType || 'standard'}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Listing price</span>
                                    <span className='text-gray-900'>{displayINRCurrency(order.totalAmount + order.totalDiscount)}</span>
                                </div>
                                {order.totalDiscount > 0 && (
                                    <div className='flex justify-between text-green-600'>
                                        <span>Discount</span>
                                        <span>−{displayINRCurrency(order.totalDiscount)}</span>
                                    </div>
                                )}
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Handling fee</span>
                                    <span className='text-gray-900'>{displayINRCurrency(handlingFee)}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Delivery fee</span>
                                    <span className='text-gray-900'>{displayINRCurrency(deliveryFee)}</span>
                                </div>
                            </div>
                            <div className='flex justify-between mt-3 text-lg font-bold'>
                                <span>Total amount</span>
                                <span className='text-red-600'>{displayINRCurrency(order.totalAmount)}</span>
                            </div>
                        </div>

                        {/* Payment & Offers */}
                        <div className='bg-white rounded-lg shadow-sm p-6'>
                            <div className='flex justify-between items-center mb-4 pb-4 border-b'>
                                <span className='text-gray-600'>Paid By</span>
                                <span className='font-semibold'>UPI, SuperCoins</span>
                            </div>

                            {order.razorpayPaymentId && (
                                <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-4'>
                                    <p className='text-xs text-gray-600 mb-1'>PAYMENT ID</p>
                                    <p className='font-mono text-xs text-green-700 break-all'>{order.razorpayPaymentId}</p>
                                </div>
                            )}

                            <button className='w-full border border-gray-300 py-2 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2'>
                                <FaDownload className='text-blue-600' />
                                Download Invoice
                            </button>
                        </div>

                        {/* Offers */}
                        <div className='bg-white rounded-lg shadow-sm p-6'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-900 font-semibold'>Offers earned</span>
                                <span className='text-gray-600'>›</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
