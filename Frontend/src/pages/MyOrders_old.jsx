import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import summaryAPI from '../common';
import { toast } from 'react-toastify';
import displayINRCurrency from '../helpers/displayCurrency';
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import AccountLayout from '../components/AccountLayout';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(summaryAPI.getOrders.url, {
                method: summaryAPI.getOrders.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.data || []);
            } else {
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    // Get status badge color and icon
    const getStatusStyle = (status) => {
        switch (status) {
            case 'confirmed':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                    badge: 'bg-blue-100 text-blue-800',
                    icon: <FaCheckCircle className='text-blue-600' />
                };
            case 'shipped':
                return {
                    bg: 'bg-purple-50',
                    text: 'text-purple-700',
                    border: 'border-purple-200',
                    badge: 'bg-purple-100 text-purple-800',
                    icon: <FaTruck className='text-purple-600' />
                };
            case 'delivered':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    badge: 'bg-green-100 text-green-800',
                    icon: <FaCheckCircle className='text-green-600' />
                };
            case 'pending':
            default:
                return {
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-700',
                    border: 'border-yellow-200',
                    badge: 'bg-yellow-100 text-yellow-800',
                    icon: <FaClock className='text-yellow-600' />
                };
        }
    };

    const LoadingSkeleton = () => (
        <div className='bg-white rounded-lg p-6 animate-pulse border border-gray-200'>
            <div className='space-y-4'>
                <div className='h-6 bg-gray-200 rounded w-1/3'></div>
                <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                <div className='border-t pt-4 space-y-3'>
                    <div className='h-16 bg-gray-200 rounded'></div>
                    <div className='h-16 bg-gray-200 rounded'></div>
                </div>
            </div>
        </div>
    );

    if (!loading && orders.length === 0) {
        return (
            <AccountLayout>
                <div className='container mx-auto px-4 py-12'>
                    <EmptyState type='orders' />
                    <div className='text-center mt-8'>
                        <p className='text-gray-600 mb-4'>You haven't placed any orders yet</p>
                    </div>
                </div>
            </AccountLayout>
        );
    }

    return (
        <AccountLayout>
            <div className='container mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Orders</h1>
                    <p className='text-gray-600'>{loading ? 'Loading...' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}</p>
                </div>

                {loading ? (
                    <div className='space-y-4'>
                        {[1, 2, 3].map((i) => <LoadingSkeleton key={i} />)}
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {orders.map((order) => {
                            const statusStyle = getStatusStyle(order.status);
                            const orderDate = new Date(order.createdAt);
                            const estimatedDelivery = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);

                            return (
                                <Link
                                    key={order._id}
                                    to={`/order-details/${order._id}`}
                                    className='block hover:shadow-lg transition-shadow'
                                >
                                    <div 
                                        className={`${statusStyle.bg} border-2 ${statusStyle.border} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                                    >
                                    {/* Order Header */}
                                    <div className='bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-start gap-4'>
                                        <div className='flex-1'>
                                            <div className='flex items-center gap-3 mb-2'>
                                                <h2 className='text-xl font-bold text-gray-900'>
                                                    Order #{order._id?.slice(-8).toUpperCase()}
                                                </h2>
                                            </div>
                                            <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
                                                <div className='flex items-center gap-1'>
                                                    <FaCalendarAlt className='text-gray-400' />
                                                    <span>{orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <FaMoneyBillWave className='text-green-600' />
                                                    <span className='font-semibold text-gray-900'>{displayINRCurrency(order.totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`${statusStyle.badge} px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 whitespace-nowrap`}>
                                            {statusStyle.icon}
                                            <span className='capitalize'>{order.status}</span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className='px-6 py-4 space-y-4'>
                                        {order.products?.map((product, idx) => (
                                            <div key={idx} className='flex gap-4 pb-4 border-b border-gray-300 last:border-b-0 last:pb-0'>
                                                {/* Product Image */}
                                                <div className='flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center'>
                                                    {product.productImage ? (
                                                        <img 
                                                            src={product.productImage} 
                                                            alt={product.productName}
                                                            className='w-full h-full object-scale-down p-2'
                                                        />
                                                    ) : (
                                                        <FaBox className='text-3xl text-gray-400' />
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className='flex-1'>
                                                    <h3 className='font-semibold text-gray-900 text-base mb-1 line-clamp-2'>
                                                        {product.productName}
                                                    </h3>
                                                    <div className='flex items-center gap-3 text-sm mb-2'>
                                                        <span className='text-gray-600'>Qty: {product.quantity}</span>
                                                        {product.price !== product.sellingPrice && (
                                                            <div className='flex items-center gap-2'>
                                                                <span className='text-gray-400 line-through'>{displayINRCurrency(product.price)}</span>
                                                                <span className='text-green-600 font-semibold'>
                                                                    {Math.round(((product.price - product.sellingPrice) / product.price) * 100)}% off
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='text-lg font-bold text-red-600'>
                                                        {displayINRCurrency(product.sellingPrice * product.quantity)}
                                                    </div>
                                                </div>

                                                {/* Item Total */}
                                                <div className='text-right flex-shrink-0'>
                                                    <div className='text-xs text-gray-500 mb-1'>Subtotal</div>
                                                    <div className='text-lg font-bold text-gray-900'>
                                                        {displayINRCurrency(product.sellingPrice * product.quantity)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Summary */}
                                    <div className='bg-white px-6 py-4 border-t border-gray-200'>
                                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                                            <div>
                                                <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>Subtotal</p>
                                                <p className='font-semibold text-gray-900'>{displayINRCurrency(order.totalAmount + order.totalDiscount)}</p>
                                            </div>
                                            {order.totalDiscount > 0 && (
                                                <div>
                                                    <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>Discount</p>
                                                    <p className='font-semibold text-green-600'>−{displayINRCurrency(order.totalDiscount)}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>Shipping</p>
                                                <p className='font-semibold text-green-600'>FREE</p>
                                            </div>
                                            <div>
                                                <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>Total</p>
                                                <p className='font-bold text-red-600 text-lg'>{displayINRCurrency(order.totalAmount)}</p>
                                            </div>
                                        </div>

                                        {/* Delivery Info */}
                                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3'>
                                            <MdLocalShipping className='text-blue-600 text-xl flex-shrink-0 mt-0.5' />
                                            <div className='text-sm'>
                                                <p className='font-semibold text-blue-900 mb-1'>Estimated Delivery</p>
                                                <p className='text-blue-700'>
                                                    {estimatedDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        {order.razorpayPaymentId && (
                                            <div className='bg-green-50 border border-green-200 rounded-lg p-3 mt-3 flex items-start gap-3'>
                                                <FaCheckCircle className='text-green-600 text-lg flex-shrink-0 mt-0.5' />
                                                <div className='text-sm'>
                                                    <p className='font-semibold text-green-900 mb-1'>Payment Successful</p>
                                                    <p className='text-green-700 font-mono text-xs break-all'>
                                                        ID: {order.razorpayPaymentId}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AccountLayout>
    );
};

export default MyOrders;