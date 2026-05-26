import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import summaryAPI from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import { toast } from 'react-toastify';
import { FaTrash, FaHeart, FaShoppingCart } from 'react-icons/fa';
import AccountLayout from '../components/AccountLayout';
import Context from '../context';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [particles, setParticles] = useState([]);
    const { refreshCart, cartItems } = useContext(Context);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await fetch(summaryAPI.getWishlist.url, {
                method: summaryAPI.getWishlist.method,
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setWishlist(data.data || []);
            }
        } catch (error) {
            toast.error('Error fetching wishlist');
        } finally {
            setLoading(false);
        }
    };

    const createHeartParticles = (e) => {
        const newParticles = [];
        for (let i = 0; i < 8; i++) {
            newParticles.push({
                id: Math.random(),
                x: e.clientX,
                y: e.clientY,
                angle: (i / 8) * Math.PI * 2,
                distance: 0
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => setParticles([]), 1000);
    };

    const removeFromWishlist = async (productId, e) => {
        createHeartParticles(e);
        setRemovingId(productId);
        
        try {
            const response = await fetch(summaryAPI.removeFromWishlist.url, {
                method: summaryAPI.removeFromWishlist.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ productId })
            });
            const data = await response.json();
            if (data.success) {
                setTimeout(() => {
                    setWishlist(wishlist.filter(item => item.productId !== productId));
                    setRemovingId(null);
                    toast.success('Removed from wishlist');
                }, 300);
            }
        } catch (error) {
            setRemovingId(null);
            toast.error('Error removing from wishlist');
        }
    };

    const addToCart = async (productId) => {
        try {
            const response = await fetch(summaryAPI.addToCartProduct.url, {
                method: summaryAPI.addToCartProduct.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ productId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                toast.success(data.message || 'Added to cart');
                refreshCart();
            } else {
                toast.error(data.message || 'Error adding to cart');
                console.error('Backend error:', data);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Error adding to cart: ' + error.message);
        }
    };

    const getProductQuantity = (productId) => {
        const item = cartItems?.find(item => item.ProductId === productId);
        return item ? item.quantity : 0;
    };

    const handleUpdateQuantity = async (e, productId, newQuantity) => {
        e?.stopPropagation();
        e?.preventDefault();
        try {
            if (newQuantity <= 0) {
                // Delete from cart if quantity becomes 0
                const response = await fetch(summaryAPI.deleteCartItem.url, {
                    method: summaryAPI.deleteCartItem.method,
                    credentials: 'include',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ productId })
                });
                const data = await response.json();
                if (data.success) {
                    toast.success('Removed from cart');
                    refreshCart();
                }
            } else {
                // Update quantity
                const response = await fetch(summaryAPI.updateCartQuantity.url, {
                    method: summaryAPI.updateCartQuantity.method,
                    credentials: 'include',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ productId, quantity: newQuantity })
                });
                const data = await response.json();
                if (data.success) {
                    refreshCart();
                }
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Error updating quantity');
        }
    };

    return (
        <AccountLayout>
            {/* Particle Animation Container */}
            <div className='fixed inset-0 pointer-events-none overflow-hidden'>
                {particles.map(particle => (
                    <ParticleHeart key={particle.id} particle={particle} />
                ))}
            </div>

            <div className='p-8'>
                <div className='mb-6'>
                    <h1 className='text-3xl font-bold text-gray-800'>My Wishlist</h1>
                    <p className='text-gray-500 mt-2'>
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>

                {loading ? (
                    <div className='bg-gradient-to-br from-pink-50 to-red-50 rounded-lg shadow p-12 text-center'>
                        <div className='flex justify-center mb-4'>
                            <div className='animate-bounce'>
                                <FaHeart className='text-4xl text-red-500' />
                            </div>
                        </div>
                        <p className='text-gray-600 text-lg'>Loading your wishlist...</p>
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className='bg-gradient-to-br from-pink-50 to-red-50 rounded-lg shadow p-12 text-center border-2 border-dashed border-red-200'>
                        <div className='mb-4 animate-pulse'>
                            <FaHeart className='text-6xl text-gray-300 mx-auto mb-4' />
                        </div>
                        <p className='text-gray-600 text-lg mb-2'>Your wishlist is empty</p>
                        <p className='text-gray-500 mb-6'>Start adding your favorite items to your wishlist!</p>
                        <Link to='/' className='inline-block bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105'>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {wishlist.map((item) => (
                            <div
                                key={item.productId}
                                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                                    removingId === item.productId ? 'opacity-50 scale-95' : 'opacity-100'
                                }`}
                            >
                                <div className='relative group'>
                                    <div className='relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center'>
                                        <img
                                            src={item.productImage && item.productImage.trim() ? item.productImage : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E'}
                                            alt={item.productName}
                                            className='h-full w-full object-scale-down group-hover:scale-105 transition-transform duration-300'
                                            onError={(e) => {
                                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E'
                                            }}
                                        />
                                        <div className='absolute top-2 right-2'>
                                            <div className='bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold'>
                                                <FaHeart size={12} /> Saved
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='p-4'>
                                    <div className='flex items-start justify-between gap-2 mb-2'>
                                        <h3 className='font-semibold text-sm line-clamp-2 hover:text-blue-600 transition-colors'>
                                            {item.productName}
                                        </h3>
                                        <Link 
                                            to={`/product-details/${item.productId}`}
                                            className='text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded whitespace-nowrap hover:bg-blue-200 transition-colors'
                                            title='View product details'
                                        >
                                            View
                                        </Link>
                                    </div>

                                    <div className='mb-4'>
                                        <p className='text-red-600 font-bold text-lg'>{displayINRCurrency(item.sellingPrice || 0)}</p>
                                        {item.price && item.price > item.sellingPrice && (
                                            <p className='text-gray-400 line-through text-sm'>{displayINRCurrency(item.price)}</p>
                                        )}
                                    </div>

                                    <div className='space-y-2'>
                                        {
                                            getProductQuantity(item.productId) > 0 ? (
                                                <div className='flex items-center justify-center gap-3 mt-1'>
                                                    <button className='bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold cursor-pointer text-sm' onClick={(e) => handleUpdateQuantity(e, item.productId, getProductQuantity(item.productId) - 1)}>−</button>
                                                    <span className='font-semibold text-base min-w-[20px] text-center'>{getProductQuantity(item.productId)}</span>
                                                    <button className='bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold cursor-pointer text-sm' onClick={(e) => handleUpdateQuantity(e, item.productId, getProductQuantity(item.productId) + 1)}>+</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => addToCart(item.productId)}
                                                    className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all transform hover:scale-105'
                                                >
                                                    <FaShoppingCart size={14} /> Add to Cart
                                                </button>
                                            )
                                        }
                                        <button
                                            onClick={(e) => removeFromWishlist(item.productId, e)}
                                            disabled={removingId === item.productId}
                                            className='w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all border border-red-200'
                                        >
                                            <FaTrash size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AccountLayout>
    );
};

// Particle Heart Component for Animation
const ParticleHeart = ({ particle }) => {
    const [position, setPosition] = useState({ x: particle.x, y: particle.y });

    useEffect(() => {
        const interval = setInterval(() => {
            setPosition(prev => ({
                x: prev.x + Math.cos(particle.angle) * 3,
                y: prev.y + Math.sin(particle.angle) * 3 - 2
            }));
        }, 16);
        return () => clearInterval(interval);
    }, [particle.angle]);

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                animation: 'fadeOut 1s ease-out forwards',
                pointerEvents: 'none'
            }}
        >
            <FaHeart className='text-red-500 text-xl' />
            <style>{`
                @keyframes fadeOut {
                    0% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0); }
                }
            `}</style>
        </div>
    );
};

export default Wishlist;