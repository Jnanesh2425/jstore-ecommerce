import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom';
import summaryAPI from '../common';
import Context from '../context';
import EmptyState from '../components/EmptyState';
import StarRating from '../components/StarRating';
import displayINRCurrency from '../helpers/displayCurrency';
import addToCart from '../helpers/addToCart';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const CategoryProduct = () => {
    const params = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { refreshCart, cartItems } = useContext(Context);

    // All available categories
    const allCategories = ['mobiles', 'watches', 'airpodes', 'mouse', 'television', 'Camera', 'earphones', 'printers', 'refrigerator', 'speakers', 'trimmers', 'processor'];

    // Filter states
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [minRating, setMinRating] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([params.categoryName]);
    const [sortBy, setSortBy] = useState('newest');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12;

    const getProductQuantity = (productId) => {
        const item = cartItems?.find(item => item.ProductId === productId);
        return item ? item.quantity : 0;
    };

    useEffect(() => {
        if (params.categoryName) {
            setCurrentPage(1);
            fetchCategoryProduct(1);
        }
    }, [params.categoryName, priceRange, minRating, selectedCategories, sortBy]);

    const fetchCategoryProduct = async (page = 1) => {
        try {
            setLoading(true);
            
            // Use selected categories or default to params.categoryName
            const categoriesToFetch = selectedCategories.length > 0 ? selectedCategories : [params.categoryName];
            
            const response = await fetch(summaryAPI.getCategoryWiseProduct.url, {
                method: summaryAPI.getCategoryWiseProduct.method,
                credentials: 'include',
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    category: categoriesToFetch,
                    page,
                    limit: itemsPerPage
                })
            });

            const responseData = await response.json();

            if (responseData.success) {
                let filteredProducts = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
                
                // Apply price filter
                filteredProducts = filteredProducts.filter(product => {
                    const price = product?.sellingPrice || 0;
                    return price >= priceRange.min && price <= priceRange.max;
                });

                // Apply rating filter
                filteredProducts = filteredProducts.filter(product => {
                    const rating = product?.avgRating || 0;
                    return rating >= minRating;
                });

                // Apply sorting
                if (sortBy === 'price-low') {
                    filteredProducts.sort((a, b) => a.sellingPrice - b.sellingPrice);
                } else if (sortBy === 'price-high') {
                    filteredProducts.sort((a, b) => b.sellingPrice - a.sellingPrice);
                } else if (sortBy === 'rating') {
                    filteredProducts.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
                } else if (sortBy === 'discount') {
                    filteredProducts.sort((a, b) => {
                        const discountA = a?.price > a?.sellingPrice ? ((a.price - a.sellingPrice) / a.price) * 100 : 0;
                        const discountB = b?.price > b?.sellingPrice ? ((b.price - b.sellingPrice) / b.price) * 100 : 0;
                        return discountB - discountA;
                    });
                }

                setProducts(filteredProducts);
                setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
            } else {
                setProducts([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.log("Error fetching category products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (e, productId) => {
        await addToCart(e, productId, refreshCart);
    };

    const handleUpdateQuantity = async (e, productId, newQuantity) => {
        e?.stopPropagation();
        e?.preventDefault();
        try {
            await fetch(summaryAPI.updateCartQuantity.url, {
                method: summaryAPI.updateCartQuantity.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ productId, quantity: newQuantity })
            });
            refreshCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const clearAllFilters = () => {
        setPriceRange({ min: 0, max: 100000 });
        setMinRating(0);
        setSortBy('newest');
        setSelectedCategories([params.categoryName]);
    };

    // Pagination calculations
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    const generatePageNumbers = () => {
        const pages = [];
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className='min-h-[calc(100vh-200px)] bg-slate-50'>
            <div className='container mx-auto px-4 py-4 md:py-6'>
                <div className='flex flex-col md:flex-row gap-4'>
                {/* Filters Sidebar */}
                <div className='w-full md:w-64 lg:w-64 flex-shrink-0'>
                    <div className='bg-white rounded-sm shadow-sm p-4 sticky top-20 border-b border-r border-l border-gray-200'>
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='font-medium text-[16px] text-black tracking-wide'>Filters</h3>
                            <button 
                                onClick={clearAllFilters}
                                className='text-blue-600 text-[12px] font-medium tracking-wide hover:underline uppercase'
                            >
                                CLEAR ALL
                            </button>
                        </div>

                        {/* Price Range Filter - Flipkart Style */}
                        <div className='mb-6 pb-6 border-b'>
                            <h4 className='font-[500] text-black text-[12px] uppercase mb-4 tracking-wider'>Price</h4>
                            
                            {/* Graphic Slider */}
                            <div className='px-2 mb-6 relative w-full group'>
                                <div className='h-[2px] w-full bg-gray-200 rounded relative'>
                                    <div 
                                        className='absolute h-full bg-blue-600 rounded'
                                        style={{
                                            left: `${(priceRange.min / 100000) * 100}%`,
                                            right: `${100 - (priceRange.max / 100000) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                
                                <input
                                    type="range"
                                    min="0"
                                    max="100000"
                                    step="500"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Math.min(parseInt(e.target.value), prev.max) }))}
                                    className="absolute top-[-5px] left-0 w-full h-[12px] opacity-0 cursor-pointer pointer-events-auto z-20"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="100000"
                                    step="500"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Math.max(parseInt(e.target.value), prev.min) }))}
                                    className="absolute top-[-5px] left-0 w-full h-[12px] opacity-0 cursor-pointer pointer-events-auto z-20"
                                />
                                
                                {/* Thumbs visual */}
                                <div 
                                    className='absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white border border-gray-300 shadow-sm rounded-full z-10 pointer-events-none group-hover:block transition-all'
                                    style={{ left: `calc(${(priceRange.min / 100000) * 100}% - 7px)` }}
                                ></div>
                                <div 
                                    className='absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white border border-gray-300 shadow-sm rounded-full z-10 pointer-events-none group-hover:block transition-all'
                                    style={{ left: `calc(${(priceRange.max / 100000) * 100}% - 7px)` }}
                                ></div>
                                
                                {/* Dots */}
                                <div className='flex justify-between w-full mt-3 px-1'>
                                    {[1,2,3,4,5,6].map(i => <div key={i} className='w-[3px] h-[3px] bg-gray-300 rounded-full'></div>)}
                                </div>
                            </div>

                            <div className='flex items-center gap-2'>
                                <select
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Math.min(parseInt(e.target.value), prev.max) }))}
                                    className='flex-1 border border-slate-300 rounded px-2 py-2 text-xs focus:outline-none focus:border-blue-500'
                                >
                                    <option value="0">Min</option>
                                    <option value="500">₹500</option>
                                    <option value="1000">₹1,000</option>
                                    <option value="5000">₹5,000</option>
                                    <option value="10000">₹10,000</option>
                                    <option value="25000">₹25,000</option>
                                    <option value="50000">₹50,000</option>
                                </select>
                                <span className='text-slate-400'>to</span>
                                <select
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Math.max(parseInt(e.target.value), prev.min) }))}
                                    className='flex-1 border border-slate-300 rounded px-2 py-2 text-xs focus:outline-none focus:border-blue-500'
                                >
                                    <option value="1000">₹1,000</option>
                                    <option value="5000">₹5,000</option>
                                    <option value="10000">₹10,000</option>
                                    <option value="25000">₹25,000</option>
                                    <option value="50000">₹50,000</option>
                                    <option value="100000">₹1,00,000+</option>
                                </select>
                            </div>
                        </div>

                        {/* Customer Ratings Filter */}
                        <div className='mb-6 pb-6 border-b'>
                            <h4 className='font-semibold text-black mb-3'>Customer Ratings</h4>
                            <div className='space-y-2'>
                                {[4, 3, 2].map((rating) => (
                                    <label key={rating} className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={minRating === rating}
                                            onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                                            className='w-4 h-4 accent-blue-600 rounded'
                                        />
                                        <span className='text-sm text-slate-700'>
                                            {rating}★ & above
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <h4 className='font-semibold text-black mb-3'>Categories</h4>
                            <div className='space-y-2 max-h-64 overflow-y-auto'>
                                {allCategories.map((category) => (
                                    <label key={category} className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => handleCategoryToggle(category)}
                                            className='w-4 h-4 accent-blue-600 rounded'
                                        />
                                        <span className='text-sm text-slate-700 capitalize'>
                                            {category}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className='flex-1 flex flex-col gap-4'>
                    <div className='bg-white px-6 py-4 border-b border-gray-200'>
                        {/* Breadcrumbs */}
                        <div className='flex items-center gap-2 text-[12px] text-gray-500 mb-2'>
                            <Link to='/' className='hover:text-blue-600'>Home</Link>
                            <span>›</span>
                            <span className='capitalize'>{params.categoryName?.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>

                        {/* Category Title */}
                        <div className='flex items-center gap-2 mb-4'>
                            <h1 className='text-[16px] font-medium text-black capitalize m-0'>
                                {params.categoryName?.replace(/([A-Z])/g, ' $1').trim()}
                            </h1>
                            <p className='text-gray-500 text-[12px] m-0'>
                                {loading ? 'Loading...' : `(Showing ${products.length > 0 ? startIndex + 1 : 0} – ${Math.min(endIndex, products.length)} products of ${products.length} products)`}
                            </p>
                        </div>

                        {/* Sort Options */}
                        <div className='flex items-center text-[14px] mt-2'>
                            <span className='font-medium text-black mr-6'>Sort By</span>
                            <div className='flex gap-6 overflow-x-auto'>
                                {[
                                    { value: 'newest', label: 'Newest First' },
                                    { value: 'price-low', label: 'Price -- Low to High' },
                                    { value: 'price-high', label: 'Price -- High to Low' },
                                    { value: 'rating', label: 'Highest Rated' },
                                    { value: 'discount', label: 'Highest Discount' }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSortBy(option.value)}
                                        className={`font-medium whitespace-nowrap transition-all border-b-2 tracking-wide pb-1 ${
                                            sortBy === option.value
                                                ? 'text-blue-600 border-blue-600'
                                                : 'text-black hover:text-blue-600 border-transparent'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {
                    loading ? (
                        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-0'>
                            {[...Array(12)].map((_, index) => (
                                <div key={`loading-${index}`} className='bg-white rounded-lg shadow overflow-hidden'>
                                    <div className='bg-slate-200 h-32 sm:h-40 md:h-48 animate-pulse'></div>
                                    <div className='p-3 sm:p-4 flex flex-col gap-2'>
                                        <div className='h-4 bg-slate-200 rounded animate-pulse'></div>
                                        <div className='h-3 bg-slate-200 rounded w-2/3 animate-pulse'></div>
                                        <div className='h-4 bg-slate-200 rounded w-1/2 animate-pulse'></div>
                                        <div className='h-6 bg-slate-200 rounded animate-pulse mt-2'></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : paginatedProducts.length > 0 ? (
                        <>
                            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-0'>
                                {paginatedProducts.map((product, index) => {
                                    const discount = product?.price > product?.sellingPrice ? Math.round(((product.price - product.sellingPrice) / product.price) * 100) : 0;

                                    return (
                                        <Link
                                            to={'/product-details/' + product?._id}
                                            key={product?._id || `product-${index}`}
                                            className='bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow flex flex-col'
                                        >
                                            {/* Image Container */}
                                            <div className='relative'>
                                                <div className='bg-slate-200 w-full h-32 sm:h-40 md:h-48 p-2 sm:p-4 flex justify-center items-center overflow-hidden'>
                                                    {product?.hotDeal && (
                                                        <span className='absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded z-10'>
                                                            🔥 Hot Deal
                                                        </span>
                                                    )}
                                                    {discount > 0 && (
                                                        <span className='absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded z-10'>
                                                            {discount}% OFF
                                                        </span>
                                                    )}
                                                    <img
                                                        src={product?.productImage[0]}
                                                        alt={product?.productName}
                                                        className='object-scale-down h-full hover:scale-110 transition-all mix-blend-multiply'
                                                    />
                                                </div>
                                            </div>

                                            {/* Details Container */}
                                            <div className='p-3 sm:p-4 flex-1 flex flex-col gap-2'>
                                                <h2 className='font-semibold text-xs sm:text-sm text-black line-clamp-2'>
                                                    {product?.ProductName}
                                                </h2>
                                                <p className='capitalize text-slate-500 text-xs'>
                                                    {product?.category}
                                                </p>

                                                {/* Rating */}
                                                <div className='h-6'>
                                                    {product?.avgRating > 0 && (
                                                        <StarRating rating={product?.avgRating || 0} reviewCount={product?.totalRatings || 0} size='sm' />
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className='flex items-center gap-1 flex-wrap'>
                                                    <p className='text-red-600 font-bold text-sm md:text-base'>
                                                        {displayINRCurrency(product?.sellingPrice)}
                                                    </p>
                                                    {product?.price > product?.sellingPrice && (
                                                        <p className='text-slate-400 line-through text-xs'>
                                                            {displayINRCurrency(product?.price)}
                                                        </p>
                                                    )}
                                                </div>

                                                {discount > 0 && (
                                                    <span className='text-green-600 text-xs font-semibold'>
                                                        {discount}% off
                                                    </span>
                                                )}

                                                {/* Actions */}
                                                <div className='mt-auto pt-2'>
                                                    {getProductQuantity(product?._id) > 0 ? (
                                                        <div className='flex items-center justify-center gap-2'>
                                                            <button
                                                                className='bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold cursor-pointer text-xs'
                                                                onClick={(e) => handleUpdateQuantity(e, product?._id, getProductQuantity(product?._id) - 1)}
                                                            >
                                                                −
                                                            </button>
                                                            <span className='font-semibold text-sm min-w-[20px] text-center'>
                                                                {getProductQuantity(product?._id)}
                                                            </span>
                                                            <button
                                                                className='bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold cursor-pointer text-xs'
                                                                onClick={(e) => handleUpdateQuantity(e, product?._id, getProductQuantity(product?._id) + 1)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className='bg-red-600 hover:bg-red-700 text-white cursor-pointer text-xs sm:text-sm font-semibold px-4 py-2 rounded-full w-full transition-all'
                                                            onClick={(e) => handleAddToCart(e, product?._id)}
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className='flex items-center justify-center gap-2 mt-12 mb-8'>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className='flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                                    >
                                        <FaChevronLeft size={14} /> PREVIOUS
                                    </button>

                                    <div className='flex items-center gap-1'>
                                        <span className='text-slate-600 text-sm'>Page {currentPage} of {totalPages}</span>
                                    </div>

                                    <div className='flex gap-1'>
                                        {generatePageNumbers().map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 rounded-lg font-semibold transition-all ${
                                                    currentPage === page
                                                        ? 'bg-blue-600 text-white'
                                                        : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className='flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                                    >
                                        NEXT <FaChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className='flex justify-center items-center min-h-[400px]'>
                            <EmptyState type='search' />
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default CategoryProduct;