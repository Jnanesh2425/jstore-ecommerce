import React, { useEffect, useRef, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import summaryAPI from '../common';
import Context from '../context';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(state => state?.user?.user);
    const context = useContext(Context);
    const [loading, setLoading] = useState(false);
    const paymentFinishedRef = useRef(false);

    const { orderId, totalAmount, razorpayOrderId, razorpayKey, checkoutType } = location.state || {};

    const markOrderFailed = async () => {
        if (!orderId || paymentFinishedRef.current) {
            return;
        }

        try {
            await fetch(summaryAPI.cancelOrder.url, {
                method: 'POST',
                credentials: 'include',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            });
        } catch (error) {
            console.error('Error cancelling abandoned order:', error);
        }
    };

    useEffect(() => {
        if (!orderId || !totalAmount) {
            toast.error('Invalid order details');
            navigate('/cart');  
        }
    }, [orderId, totalAmount, navigate]);

    useEffect(() => {
        return () => {
            markOrderFailed();
        };
    }, [orderId]);

    useEffect(() => {
        const handlePageHide = () => {
            markOrderFailed();
        };

        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('beforeunload', handlePageHide);

        return () => {
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('beforeunload', handlePageHide);
        };
    }, [orderId]);

    const handlePayment = async () => {
        if (!window.Razorpay) {
            toast.error('Razorpay not loaded');
            return;
        }

        try {
            setLoading(true);

            const isDirectCheckout = checkoutType === 'direct' && razorpayOrderId && razorpayKey;
            let paymentOrderId = razorpayOrderId;
            let paymentKey = razorpayKey;
            let paymentAmount = totalAmount;

            if (!isDirectCheckout) {
                // Create Razorpay order from cart checkout
                const response = await fetch(summaryAPI.createRazorpayOrder.url, {
                    method: summaryAPI.createRazorpayOrder.method,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ orderId })
                });

                const data = await response.json();

                if (!data.success) {
                    toast.error(data.message || 'Failed to create order');
                    setLoading(false);
                    return;
                }

                paymentOrderId = data.data.razorpayOrderId;
                paymentKey = data.data.key;
                paymentAmount = data.data.amount;
            }

            const options = {
                key: paymentKey,
                amount: paymentAmount * 100, // Razorpay expects paise
                currency: 'INR',
                name: 'E-Commerce Store',
                description: 'Product Purchase',
                order_id: paymentOrderId,
                handler: async (response) => {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch(summaryAPI.verifyPayment.url, {
                            method: summaryAPI.verifyPayment.method,
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                orderId
                            })
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            paymentFinishedRef.current = true;
                            // Refresh cart after successful payment
                            if (context?.refreshCart) {
                                context.refreshCart();
                            }
                            toast.success('Payment successful!');
                            navigate('/order-confirmation', { 
                                state: { orderId, order: verifyData.data } 
                            });
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Verification error:', error);
                        toast.error('Error verifying payment');
                    }
                },
                modal: {
                    ondismiss: async () => {
                        // User closed payment modal - mark order as payment failed
                        paymentFinishedRef.current = false;
                        setLoading(false);
                        await markOrderFailed();
                        paymentFinishedRef.current = true;
                        navigate('/my-orders');
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                theme: {
                    color: '#3399cc'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Error initiating payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Order Summary</h1>
                
                <div className="border-t border-b py-4 mb-6">
                    <div className="flex justify-between mb-2">
                        <span>Order ID:</span>
                        <span className="font-semibold">{orderId?.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Amount:</span>
                        <span className="font-semibold">₹{totalAmount?.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                    {loading ? 'Processing...' : `Pay ₹${totalAmount?.toFixed(2)}`}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                    Use test card: 4111 1111 1111 1111 (exp: 12/25, CVV: 123)
                </p>
            </div>
        </div>
    );
};

export default Payment;