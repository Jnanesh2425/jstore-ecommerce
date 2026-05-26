import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import summaryAPI from '../common'
import displayINRCurrency from '../helpers/displayCurrency'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import addToCart from '../helpers/addToCart'
import Context from '../context'
import { toast } from 'react-toastify'
import { FaThumbsUp, FaThumbsDown, FaCheckCircle } from 'react-icons/fa'

const ProductDetails = () => {  
  const navigate = useNavigate()
  const [data, setData] = useState({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
    sellingPrice: "",
    hotDeal: false
  })
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const { refreshCart, cartItems } = useContext(Context)
  const user = useSelector(state => state?.user?.user)

  // Rating states - DISPLAY customer reviews to everyone
  // Rating FORM is in OrderDetails only for delivered orders
  const [ratings, setRatings] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  
  const handleAddToCart = async (e, id) => {
    await addToCart(e, id, refreshCart)
  }

  const handleBuyNow = async (e) => {
    e?.preventDefault()
    e?.stopPropagation()

    try {
      const addressResponse = await fetch(summaryAPI.getAddresses.url, {
        method: summaryAPI.getAddresses.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' }
      })

      const addressData = await addressResponse.json()
      const defaultAddress = addressData.data?.find(a => a.isDefault) || addressData.data?.[0] || null

      const response = await fetch(summaryAPI.directBuyRazorpayOrder.url, {
        method: summaryAPI.directBuyRazorpayOrder.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          productId: data?._id,
          quantity: 1,
          deliveryType: 'standard',
          address: defaultAddress ? {
            name: defaultAddress.name,
            address: defaultAddress.address,
            city: defaultAddress.city,
            state: defaultAddress.state,
            pincode: defaultAddress.pincode,
            mobile: defaultAddress.mobile
          } : null
        })
      })

      const result = await response.json()

      if (result.success) {
        navigate('/payment', {
          state: {
            orderId: result.data.orderId,
            totalAmount: result.data.amount,
            razorpayOrderId: result.data.razorpayOrderId,
            razorpayKey: result.data.key,
            checkoutType: 'direct'
          }
        })
      } else {
        toast.error(result.message || 'Failed to start checkout')
      }
    } catch (error) {
      console.error('Buy Now error:', error)
      toast.error('Error starting checkout')
    }
  }

  const getProductQuantity = (productId) => {
    const item = cartItems?.find(item => item.ProductId === productId)
    return item ? item.quantity : 0
  }

  const handleUpdateQuantity = async (e, productId, newQuantity) => {
    e?.stopPropagation()
    e?.preventDefault()
    try {
      await fetch(summaryAPI.updateCartQuantity.url, {
        method: summaryAPI.updateCartQuantity.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity })
      })
      refreshCart()
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }
  const [activeImage, setActiveImage] = useState("")
  const [zoomImageCoordinate, setZoomImageCoordinate] = useState({
    x: 0,
    y: 0
  })
  const [zoomImage, setZoomImage] = useState(false)
  const productImageListLoading = Array(4).fill(null)

  // Review sorting and filtering
  const [sortBy, setSortBy] = useState('helpful')
  const [expandedReviews, setExpandedReviews] = useState({})

  // Fetch and display customer ratings and reviews
  const fetchProductRatings = useCallback(async () => {
    if (!params?.id) return
    try {
      const response = await fetch(summaryAPI.getProductRatings.url, {
        method: summaryAPI.getProductRatings.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: params.id })
      })
      const result = await response.json()
      if (result.success) {
        setRatings(result.data.ratings || [])
        setAvgRating(result.data.averageRating || 0)
        setTotalRatings(result.data.totalRatings || 0)
        setDistribution(result.data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }, [params?.id])

  // Sort reviews based on selection
  const getSortedReviews = () => {
    let sorted = [...ratings]
    if (sortBy === 'latest') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'positive') {
      sorted.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'negative') {
      sorted.sort((a, b) => a.rating - b.rating)
    } else {
      // helpful - default
      sorted.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
    }
    return sorted
  }

  const toggleReviewExpand = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  const truncateText = (text, limit = 200) => {
    if (!text) return ''
    if (text.length <= limit) return text
    return text.substring(0, limit) + '...'
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Rating submission moved to OrderDetails page - only available after delivery
  // const handleSubmitRating = async () => { ... }
  
  const fetchProductDetails = async () => {
    setLoading(true)
    const response = await fetch(summaryAPI.productDetails.url, {
      method: summaryAPI.productDetails.method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        productId: params?.id
      })
    })
    setLoading(false)
    const dataResponse = await response.json()
    setData(dataResponse?.data)
    setActiveImage(dataResponse?.data?.productImage[0])
  }
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchProductDetails()
    fetchProductRatings()
  }, [params?.id])

  // Purchase check moved to OrderDetails - only allow rating after delivery
  // useEffect(() => {
  //   const checkPurchase = async () => {
  //     if (!user?._id || !params?.id) {
  //       setHasPurchased(false)
  //       return
  //     }
  //     try {
  //       const response = await fetch(summaryAPI.checkPurchase.url, {
  //         method: summaryAPI.checkPurchase.method,
  //         credentials: 'include',
  //         headers: { 'content-type': 'application/json' },
  //         body: JSON.stringify({ productId: params.id })
  //       })
  //       const result = await response.json()
  //       if (result.success) {
  //         setHasPurchased(result.data.purchased)
  //       }
  //     } catch (error) {
  //       console.error('Error checking purchase:', error)
  //     }
  //   }
  //   checkPurchase()
  // }, [params?.id, user?._id])

  const handleMouseEnterProduct = (imgURL) => {
    setActiveImage(imgURL)
  }

  const handleZoomImage = (e) => {
    setZoomImage(true)
    const { left, top, width, height } = e.target.getBoundingClientRect()

    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomImageCoordinate({
      x: x,
      y: y
    })
  }

  const handleLeaveImageZoom = () => {
    setZoomImage(false)
  }
  return (
    <div className='container mx-auto p-4'>
      <div className='min-h-[200px] flex flex-col lg:flex-row gap-2'>
        {/*product image*/}
        <div className='h-96 flex flex-col lg:flex-row-reverse gap-2'>
          <div className='h-[300px] w-[300px] lg:h-96 lg:w-96 bg-slate-200 relative p-2 cursor-zoom-in'>
            <img
              src={activeImage}
              className='h-full w-full object-scale-down mix-blend-multiply'
              onMouseMove={handleZoomImage}
              onMouseLeave={handleLeaveImageZoom}
            />
            {data?.hotDeal && (
              <span className='absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10'>🔥 Hot Deal</span>
            )}
            {data?.price > data?.sellingPrice && (
              <span className='absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10'>
                {Math.round(((data.price - data.sellingPrice) / data.price) * 100)}% OFF
              </span>
            )}
            {/*For zooming an img*/}
            {
              zoomImage && (
                <div className='hidden lg:block absolute min-w-[500px] overflow-hidden min-h-[400px] bg-slate-200 p-1 -right-[520px] top-0 border border-gray-300 shadow-lg'>
                  <div
                    className='w-full h-full min-h-[400px] min-w-[500px] mix-blend-multiply scale-[2]'
                    style={{
                      backgroundImage: `url(${activeImage})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: `${zoomImageCoordinate.x}% ${zoomImageCoordinate.y}%`,
                      backgroundSize: 'contain'
                    }}
                  >
                  </div>
                </div>
              )
            }
          </div>
          <div className='h-full'>
            {
              loading ? (
                <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full'>
                  {
                    productImageListLoading.map((el, index) => {
                      return (
                        <div
                          key={index}
                          className='h-20 w-20 bg-slate-200 rounded animate-pulse'
                        ></div>
                      )
                    })
                  }
                </div>
              ) : (
                <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full'>
                  {
                    data.productImage.map((imgURL, index) => {
                      return (
                        <div className='h-20 w-20 bg-slate-200 rounded p-1' key={imgURL}>
                          <img
                            src={imgURL}
                            className='w-full h-full object-scale-down mix-blend-multiply cursor-pointer'
                            onMouseEnter={() => handleMouseEnterProduct(imgURL)}
                            onClick={() => handleMouseEnterProduct(imgURL)}
                          />
                        </div>
                      )
                    })
                  }
                </div>
              )
            }
          </div>
        </div>
        {/*product details*/}
        {
          loading ? (
            <div className='grid w-full gap-1'>
              <p className='bg-slate-200 animate-pulse h-6 lg:h-8 w-full rounded-full inline-block'></p>
              <h2 className='bg-slate-200 animate-pulse h-6 lg:h-8 w-full rounded-full font-medium'></h2>
              <p className='capitalize text-slate-400 bg-slate-200 rounded-full min-w-[100px] animate-pulse h-6 lg:h-8 w-full'></p>
              <div className='text-red-600 bg-slate-200 h-6 lg:h-8 rounded-full animate-pulse flex itmes-center gap-0.5 w-full'>
              </div>
              <div className='flex items-center gap-2 text-2xl lg:text-3xl font-medium bg-slate-200 my-1 h-6 lg:h-8 animate-pulse w-ful'>
                <p className='text-red-600 bg-slate-200 w-full'></p>
                <p className='text-slate-400 line-through bg-slate-200 w-full'></p>
              </div>
              <div className='flex items-center gap-3 my-2 w-full'>
                <button className='h-6 lg:h-8  bg-slate-200 w-full rounded animate-pulse'></button>
                <button className='h-6 lg:h-8  bg-slate-200 w-full rounded animate-pulse'></button>
              </div>
              <div>
                <p className='text-slate-600 font-medium my-1 h-6 lg:h-8 bg-slate-200  rounded animate-pulse'></p>
                <p className='h-10 lg:h-12 bg-slate-200 rounded animate-pulse'></p>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-1'>
              <p className='bg-red-200 text-red-600 px-2 rounded-full w-fit'>{data?.brandName}</p>
              <h2 className='text-2xl lg:text-4xl font-medium'>{data?.productName}</h2>
              <p className='capitalize text-slate-600'>{data?.category}</p>

              <div className='flex items-center gap-2 text-2xl lg:text-3xl font-medium my-1 '>
                <p className='text-red-600'>{displayINRCurrency(data?.sellingPrice)}</p>
                <p className='text-slate-400 line-through text-lg'>{displayINRCurrency(data?.price)}</p>
                {data?.price > data?.sellingPrice && (
                  <span className='text-green-600 text-base font-semibold'>
                    {Math.round(((data.price - data.sellingPrice) / data.price) * 100)}% off
                  </span>
                )}
              </div>
              <div className='flex items-center gap-3 my-2'>
                <button
                  className='border-2 border-red-600 rounded px-3 py-1 min-w-[120px] text-red-600 font-medium hover:bg-red-600 hover:text-white cursor-pointer transition-all'
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
                {
                  getProductQuantity(data?._id) > 0 ? (
                    <div className='flex items-center gap-3 border-2 border-red-600 rounded px-3 py-1 min-w-[120px] justify-center'>
                      <button className='bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold cursor-pointer' onClick={(e) => handleUpdateQuantity(e, data?._id, getProductQuantity(data?._id) - 1)}>−</button>
                      <span className='font-semibold text-lg min-w-[20px] text-center'>{getProductQuantity(data?._id)}</span>
                      <button className='bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold cursor-pointer' onClick={(e) => handleUpdateQuantity(e, data?._id, getProductQuantity(data?._id) + 1)}>+</button>
                    </div>
                  ) : (
                    <button 
                      className='border-2 border-red-600 rounded px-3 py-1 min-w-[120px] font-medium text-white bg-red-600 hover:text-red-600 hover:bg-white cursor-pointer transition-all'
                      onClick={(e) => handleAddToCart(e, data?._id)}
                    >
                      Add to Cart
                    </button>
                  )
                }
              </div>
              <div>
                <p className='text-slate-600 font-medium my-1'>Description :</p>
                <p>{data?.description}</p>
              </div>
            </div>
          )
        }
      </div>

      {/* Ratings & Reviews Section - Flipkart Professional Style */}
      <div className='mt-10 border-t pt-8'>
        <h2 className='text-2xl font-bold mb-6 text-gray-900'>Ratings & Reviews</h2>

        {totalRatings > 0 ? (
          <div className='space-y-8'>
            {/* Rating Summary Card - Flipkart Style */}
            <div className='bg-white rounded-lg border border-gray-200 p-6 md:p-8'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {/* Left: Overall Rating */}
                <div className='flex flex-col items-center md:items-start md:border-r md:border-gray-200 md:pr-8'>
                  <div className='flex items-baseline gap-2 mb-2'>
                    <span className='text-5xl font-bold text-green-600'>{avgRating.toFixed(1)}</span>
                    <span className='text-2xl text-yellow-500'>★</span>
                  </div>
                  <div className='text-gray-600 text-sm font-medium'>
                    {avgRating >= 4 && 'Excellent'}
                    {avgRating >= 3 && avgRating < 4 && 'Very Good'}
                    {avgRating >= 2 && avgRating < 3 && 'Good'}
                    {avgRating < 2 && 'Average'}
                  </div>
                  <div className='text-gray-500 text-xs mt-2'>
                    {totalRatings.toLocaleString()} {totalRatings === 1 ? 'rating' : 'ratings'} & {Math.ceil(totalRatings * 0.7).toLocaleString()} {Math.ceil(totalRatings * 0.7) === 1 ? 'review' : 'reviews'}
                  </div>
                </div>

                {/* Middle: Distribution Bars - Green like Flipkart */}
                <div className='col-span-1 md:col-span-2 space-y-2.5'>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percentage = totalRatings > 0 ? ((distribution[stars] || 0) / totalRatings) * 100 : 0
                    return (
                      <div key={stars} className='flex items-center gap-3'>
                        <button className='text-sm font-medium text-gray-700 hover:text-blue-600 w-12 text-right'>
                          {stars} ★
                        </button>
                        <div className='flex-1 bg-gray-200 rounded-full h-3 overflow-hidden'>
                          <div
                            className='bg-green-500 h-3 rounded-full transition-all duration-500'
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className='text-sm font-medium text-gray-700 w-12 text-right'>
                          {distribution[stars] || 0}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Review Sorting - Flipkart Style */}
            <div className='border-b pb-4'>
              <h4 className='text-sm font-bold text-gray-900 mb-4'>Reviews sorted by</h4>
              <div className='flex flex-wrap gap-3'>
                {[
                  { label: 'Most Helpful', value: 'helpful'},
                  { label: 'Latest', value: 'latest' },
                  { label: 'Positive', value: 'positive' },
                  { label: 'Negative', value: 'negative' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-5 py-2 rounded-full border-2 font-medium transition-all cursor-pointer ${
                      sortBy === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Reviews - Flipkart Professional Cards */}
            {getSortedReviews().length > 0 ? (
              <div className='space-y-4'>
                {getSortedReviews().map((review) => {
                  const isExpanded = expandedReviews[review._id]
                  const reviewText = review.review || ''
                  const isLongReview = reviewText.length > 200
                  
                  return (
                    <div key={review._id} className='border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow duration-200'>
                      {/* Review Header */}
                      <div className='flex justify-between items-start gap-3 mb-3'>
                        <div className='flex-1'>
                          {/* Rating and Title */}
                          <div className='flex items-center gap-2 mb-2'>
                            <span className={`text-lg font-bold ${getRatingColor(review.rating)}`}>
                              {'★'.repeat(review.rating)}{('☆'.repeat(5 - review.rating))}
                            </span>
                            <span className='text-sm font-semibold text-gray-900'>
                              {review.rating}.0 - {review.review?.split('\n')[0] || 'Customer Review'}
                            </span>
                          </div>
                          {/* Reviewer Info with Verified Purchase Badge */}
                          <div className='text-xs text-gray-600 flex items-center gap-2 flex-wrap'>
                            <span className='font-medium'>{review.userName || 'Verified Buyer'}</span>
                            <span>•</span>
                            <div className='flex items-center gap-1 text-gray-600'>
                              <FaCheckCircle size={12} className='text-green-600' />
                              <span>Verified Purchase</span>
                            </div>
                            <span>•</span>
                            <span>
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review Text */}
                      {reviewText && (
                        <div className='mb-4'>
                          <p className='text-gray-800 text-sm leading-relaxed'>
                            {isExpanded ? reviewText : truncateText(reviewText)}
                            {isLongReview && (
                              <button
                                onClick={() => toggleReviewExpand(review._id)}
                                className='text-blue-600 hover:text-blue-800 font-medium ml-1'
                              >
                                {isExpanded ? 'less' : 'more'}
                              </button>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Helpful Buttons - Professional Style with Icons */}
                      <div className='flex items-center gap-3 pt-3 border-t border-gray-100'>
                        <button className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>
                          <FaThumbsUp size={14} className='text-gray-600' />
                          <span className='text-sm font-medium'>Helpful ({review.helpfulCount || 0})</span>
                        </button>
                        <button className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>
                          <FaThumbsDown size={14} className='text-gray-600' />
                          <span className='text-sm font-medium'>({review.unhelpfulCount || 0})</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='bg-gray-50 rounded-lg p-8 text-center border border-gray-200'>
                <div className='text-gray-300 text-5xl mb-3'>★</div>
                <p className='text-gray-700 font-medium mb-1'>No reviews in this category</p>
                <p className='text-gray-600 text-sm'>Check reviews in other categories or be the first to share your experience!</p>
              </div>
            )}

            {/* Write Review CTA - Professional Banner */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mt-6'>
              <div className='flex items-start gap-4'>
                <div className='text-3xl text-blue-600'>✍️</div>
                <div>
                  <h5 className='font-bold text-gray-900 mb-1'>Share Your Review</h5>
                  <p className='text-gray-700 text-sm mb-3'>Purchased this product? Share your experience with other customers to help them make better decisions.</p>
                  <p className='text-gray-600 text-xs'>Head to <span className='font-semibold'>"My Orders"</span> and write a detailed review after you receive and verify your delivery.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='bg-gray-50 rounded-lg p-12 text-center border border-gray-200'>
            <div className='text-gray-300 text-7xl mb-4'>★</div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>No Ratings Yet</h3>
            <p className='text-gray-600 mb-4'>Be the first to rate and review this product!</p>
            <p className='text-gray-500 text-sm'>Purchase this item and share your feedback after delivery. Your review helps other customers.</p>
          </div>
        )}
      </div>

      <CategoryWiseProductDisplay category={data.category} heading={'Recommended products'} />
    </div>
  )
}

export default ProductDetails