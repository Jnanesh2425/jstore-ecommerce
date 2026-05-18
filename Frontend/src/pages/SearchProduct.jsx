import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import summaryAPI from '../common'
import displayINRCurrency from '../helpers/displayCurrency'
import EmptyState from '../components/EmptyState'
import StarRating from '../components/StarRating'
import { FaHeart } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const SearchProduct = () => {
  const query = useLocation().search
  const queryText = new URLSearchParams(query).get('q') || ''
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const user = useSelector(state => state?.user?.user)
  const loadingList = new Array(5).fill(null)
  
  // All available categories
  const allCategories = ['mobiles', 'watches', 'airpodes', 'mouse', 'television', 'Camera', 'earphones', 'printers', 'refrigerator', 'speakers', 'trimmers', 'processor'];
  
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [minRating, setMinRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('relevance')

  const fetchSearchProduct = async () => {
    setLoading(true)
    try {
      const response = await fetch(summaryAPI.searchProduct.url + query)
      const dataResponse = await response.json()
      if (dataResponse.success) {
        setData(dataResponse.data || [])
      }
    } catch (error) {
      console.error('Error fetching search results:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // Apply filters and sorting to data
  const getFilteredAndSortedData = () => {
    let filtered = data

    // Category filter - show if ANY selected category matches
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.some(cat => 
          product?.category?.toLowerCase() === cat.toLowerCase()
        )
      )
    }

    // Price filter
    filtered = filtered.filter(product => 
      product?.sellingPrice >= priceRange.min && 
      product?.sellingPrice <= priceRange.max
    )

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(product => 
        (product?.avgRating || 0) >= minRating
      )
    }

    // Sorting
    const sorted = [...filtered]
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.sellingPrice - b.sellingPrice)
        break
      case 'price-high':
        sorted.sort((a, b) => b.sellingPrice - a.sellingPrice)
        break
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'popularity':
        sorted.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))
        break
      case 'discount':
        sorted.sort((a, b) => {
          const discountA = a?.price > a?.sellingPrice ? ((a.price - a.sellingPrice) / a.price) * 100 : 0
          const discountB = b?.price > b?.sellingPrice ? ((b.price - b.sellingPrice) / b.price) * 100 : 0
          return discountB - discountA
        })
        break
      case 'relevance':
      default:
        // Keep original order
        break
    }

    return sorted
  }

  const filteredData = getFilteredAndSortedData()

  useEffect(() => {
    fetchSearchProduct()
  }, [query])

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!user?._id) return
    try {
      const response = await fetch(summaryAPI.fetchWishlist.url, {
        method: summaryAPI.fetchWishlist.method,
        credentials: 'include'
      })
      const responseData = await response.json()
      if (responseData.success) {
        setWishlist(responseData.data.map(item => item.productId._id))
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [user?._id])

  // Handle wishlist add/remove
  const handleWishlist = async (productId) => {
    if (!user?._id) {
      toast.error('Please login to add to wishlist')
      return
    }
    try {
      const response = await fetch(summaryAPI.addToWishlist.url, {
        method: summaryAPI.addToWishlist.method,
        credentials: 'include',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ productId })
      })
      const responseData = await response.json()
      if (responseData.success) {
        setWishlist(prev => 
          prev.includes(productId) 
            ? prev.filter(id => id !== productId)
            : [...prev, productId]
        )
        toast.success(responseData.message)
      }
    } catch (error) {
      toast.error('Error updating wishlist')
    }
  }

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
    setSortBy('relevance');
    setSelectedCategories([]);
  };

  // Loading skeleton matching the horizontal layout
  const LoadingSkeleton = () => (
    <div className='flex flex-col sm:flex-row gap-6 p-6 border-b border-gray-200 bg-white items-start animate-pulse'>
      <div className='w-full sm:w-[200px] h-48 bg-slate-200 rounded flex-shrink-0'></div>
      <div className='flex-1 w-full'>
        <div className='h-6 bg-slate-200 rounded w-3/4 mb-3'></div>
        <div className='h-4 bg-slate-200 rounded w-1/4 mb-4'></div>
        <div className='space-y-2 mt-4'>
           <div className='h-3 bg-slate-200 rounded w-full'></div>
           <div className='h-3 bg-slate-200 rounded w-5/6'></div>
           <div className='h-3 bg-slate-200 rounded w-4/6'></div>
        </div>
      </div>
      <div className='w-full sm:w-[240px] flex-shrink-0'>
         <div className='h-8 bg-slate-200 rounded w-1/2 mb-2'></div>
         <div className='h-4 bg-slate-200 rounded w-1/3'></div>
      </div>
    </div>
  )

  return (
    <div className='min-h-[calc(100vh-200px)] bg-slate-50'>
      <div className='container mx-auto px-4 py-4 md:py-6'>
        <div className='flex flex-col lg:flex-row gap-4'>
          
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

                {/* Price Range Filter */}
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

          {/* Right Content Area */}
          <div className='flex-1 flex flex-col gap-4'>
            <div className='bg-white px-6 py-4 border-b border-gray-200'>
                {/* Breadcrumbs */}
                <div className='flex items-center gap-2 text-[12px] text-gray-500 mb-2'>
                    <Link to='/' className='hover:text-blue-600'>Home</Link>
                    <span>›</span>
                    <span>Search Results</span>
                </div>

                {/* Title */}
                <div className='flex items-center gap-2 mb-4'>
                    <h1 className='text-[16px] font-medium text-black m-0'>
                        {loading ? 'Searching...' : `Showing 1 – ${filteredData.length} results for "${queryText}"`}
                    </h1>
                </div>

                {/* Sort Options */}
                <div className='flex items-center text-[14px] mt-2'>
                    <span className='font-medium text-black mr-6'>Sort By</span>
                    <div className='flex gap-6 overflow-x-auto'>
                        {[
                            { value: 'relevance', label: 'Relevance' },
                            { value: 'popularity', label: 'Popularity' },
                            { value: 'price-low', label: 'Price -- Low to High' },
                            { value: 'price-high', label: 'Price -- High to Low' },
                            { value: 'newest', label: 'Newest First' },
                            { value: 'discount', label: 'Discount' }
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

            {/* Results Output */}
            {loading ? (
              <div className='bg-white flex flex-col'>
                {loadingList.map((_, index) => (
                  <LoadingSkeleton key={index} />
                ))}
              </div>
            ) : filteredData.length === 0 ? (
              <div className='bg-white p-8 flex justify-center items-center'>
                 <EmptyState type='search' />
              </div>
            ) : (
              <div className='bg-white flex flex-col'>
                {filteredData.map((product) => {
                  const discount =
                    product?.price > product?.sellingPrice
                      ? Math.round(
                          ((product.price - product.sellingPrice) / product.price) * 100
                        )
                      : 0

                  return (
                    <Link
                      key={product._id}
                      to={'/product-details/' + product._id}
                      className='group flex flex-col sm:flex-row gap-6 p-6 border-b border-gray-200 hover:shadow-[0_3px_16px_0_rgba(0,0,0,0.11)] transition-shadow bg-white items-start relative'
                    >
                      {/* Left: Highlight Image */}
                      <div className='w-full sm:w-[200px] flex-shrink-0 flex flex-col items-center justify-center relative'>
                        <div className='w-full h-48 flex items-center justify-center p-2 mb-2 relative'>
                           <img
                             src={product?.productImage[0]}
                             alt={product?.productName}
                             className='h-full object-contain group-hover:scale-105 transition-transform duration-300'
                           />
                           {/* Wishlist Heart Button */}
                           <button
                             onClick={(e) => {
                               e.preventDefault()
                               e.stopPropagation()
                               handleWishlist(product._id)
                             }}
                             className='absolute top-2 right-2 text-2xl cursor-pointer transition-colors hover:scale-110'
                           >
                             <FaHeart 
                               className={wishlist.includes(product._id) ? 'text-red-600' : 'text-gray-300'}
                             />
                           </button>
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className='flex-1 w-full'>
                        <h2 className='text-[18px] text-black group-hover:text-blue-600 transition-colors font-medium line-clamp-2 leading-tight mb-2'>
                          {product?.brandName ? `${product.brandName} ` : ''}{product?.ProductName || product?.productName}
                        </h2>
                        
                        {(product?.avgRating !== undefined || product?.totalRatings !== undefined || true) ? (
                          <div className='flex items-center gap-2 mt-1 mb-4'>
                            <StarRating rating={product?.avgRating || 0} reviewCount={product?.totalRatings || 0} actualReviewCount={product?.reviewCount || 0} size='sm' variant='badge' />
                          </div>
                        ) : <div className='mt-1 mb-4 h-4'></div>}

                        {/* Specs Bullets */}
                        <ul className='space-y-1.5 mt-2'>
                          {product?.brandName && (
                            <li className='text-[14px] text-gray-700 flex gap-3 items-start'>
                              <span className='text-gray-300 mt-1 min-w-[6px] text-xs'>•</span>
                              <span className='line-clamp-1'>Brand: {product?.brandName}</span>
                            </li>
                          )}
                          {product?.category && (
                            <li className='text-[14px] text-gray-700 flex gap-3 items-start'>
                              <span className='text-gray-300 mt-1 min-w-[6px] text-xs'>•</span>
                              <span className='line-clamp-1'>Category: {product?.category}</span>
                            </li>
                          )}
                          {product?.description && (
                            <li className='text-[14px] text-gray-700 flex gap-3 items-start'>
                              <span className='text-gray-300 mt-1 min-w-[6px] text-xs'>•</span>
                              <span className='line-clamp-2'>{product?.description}</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Right: Price & Offers */}
                      <div className='w-full sm:w-[240px] flex-shrink-0 flex flex-col sm:pl-6 sm:border-l sm:border-gray-100'>
                        <div className='text-[24px] xl:text-[28px] font-medium text-black mb-1'>
                          {displayINRCurrency(product?.sellingPrice)}
                        </div>
                        
                        <div className='flex items-center gap-2 mb-2'>
                          {product?.price > product?.sellingPrice && (
                            <span className='text-[14px] text-gray-500 line-through'>
                              {displayINRCurrency(product?.price)}
                            </span>
                          )}
                          {discount > 0 && (
                            <span className='text-[13px] text-green-600 font-medium tracking-wide'>
                              {discount}% off
                            </span>
                          )}
                        </div>

                        {product?.hotDeal || discount > 20 ? (
                           <div className='text-[11px] text-green-700 font-bold border border-green-300 bg-green-50 px-1.5 py-0.5 mt-1 w-max rounded-sm uppercase tracking-wide'>
                              Hot Deal
                           </div>
                        ) : null}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchProduct