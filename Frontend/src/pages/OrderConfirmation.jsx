import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import displayINRCurrency from '../helpers/displayCurrency';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const { orderId, order: orderData } = location.state || {};
        if (orderData) {
            setOrder(orderData);
        } else if (!orderId) {
            navigate('/cart');
        }
    }, [location, navigate]);

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-16 px-4">
            <div className="container mx-auto max-w-2xl">
                {/* Big Green Checkmark - Payment Successful */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
                            <FaCheckCircle className="text-8xl text-green-500 relative z-10" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-green-600 mb-3">Payment Successful!</h1>
                    <p className="text-xl text-gray-600 mb-8">Your order has been confirmed</p>
                </div>

                {/* Order Summary Box */}
                <div className="bg-gray-50 p-8 rounded-lg mb-8 border border-gray-200">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-2">Order ID</p>
                            <p className="text-2xl font-bold text-gray-800">#{order._id?.toString().slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-2">Order Date</p>
                            <p className="text-2xl font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-2">Total Amount</p>
                            <p className="text-2xl font-bold text-green-600">{displayINRCurrency(order.totalAmount)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-2">Delivery Type</p>
                            <p className="text-2xl font-bold text-gray-800 capitalize">{order.deliveryType}</p>
                        </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="border-t border-gray-300 pt-6">
                        <p className="text-sm text-gray-500 font-semibold mb-4">Items ({order.products?.length})</p>
                        <div className="space-y-3">
                            {order.products?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-gray-700">
                                    <span>{item.productName} x {item.quantity}</span>
                                    <span className="font-semibold">{displayINRCurrency(item.sellingPrice * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Messages */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <p className="text-blue-800">
                        <strong>Email Confirmation:</strong> Order confirmation has been sent to your email.
                    </p>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
                    <p className="text-green-800">
                        <strong>What's Next:</strong> Your order will be shipped soon. Track order status in "View My Orders".
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/orders')}
                        className="px-12 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-lg"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-12 py-4 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-colors text-lg"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;