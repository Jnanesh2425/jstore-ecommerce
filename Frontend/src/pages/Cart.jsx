import React, { useState, useEffect, useContext } from 'react'
import summaryAPI from '../common'
import Context from '../context'
import displayINRCurrency from '../helpers/displayCurrency'
import { MdDelete } from 'react-icons/md'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

const Cart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [deliveryType, setDeliveryType] = useState('standard')
  const context = useContext(Context)
  const navigate = useNavigate()

  const deliveryCharges = {
    standard: 10,
    express: 60
  }
  const handlingCharge = deliveryCharges[deliveryType] || 10

  // Calculate delivery dates for each type
  const getDeliveryDatesByType = (type) => {
    const today = new Date()
    let daysToAdd = 4
    let timeHour = 10
    
    if (type === 'express') {
      daysToAdd = 2
      timeHour = 10
    }
    
    const deliveryDate = new Date(today)
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd)
    deliveryDate.setHours(timeHour, 0, 0, 0)
    return deliveryDate
  }

  const formatDeliveryDateFlipkart = (date) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short' }
    const dateStr = date.toLocaleDateString('en-IN', options)
    const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return `Delivery by ${dateStr} by ${time}`
  }

  const standardDate = getDeliveryDatesByType('standard')
  const expressDate = getDeliveryDatesByType('express')
  
  const standardFormatted = formatDeliveryDateFlipkart(standardDate)
  const expressFormatted = formatDeliveryDateFlipkart(expressDate)

  const fetchCartData = async () => {
    setLoading(true)
    try {
      const response = await fetch(summaryAPI.viewCart.url, {
        method: summaryAPI.viewCart.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' }
      })
      const responseData = await response.json()
      if (responseData.success) {
        setData(responseData.data || [])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartData()
  }, [])

  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      const response = await fetch(summaryAPI.updateCartQuantity.url, {
        method: summaryAPI.updateCartQuantity.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity })
      })
      const responseData = await response.json()
      if (responseData.success) {
        fetchCartData()
        context?.refreshCart()
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleDeleteItem = async (productId) => {
    try {
      const response = await fetch(summaryAPI.deleteCartItem.url, {
        method: summaryAPI.deleteCartItem.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      const responseData = await response.json()
      if (responseData.success) {
        toast.success(responseData.message)
        fetchCartData()
        context?.refreshCart()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleBuyNow = async (item) => {
    try {
      // Fetch user's default address
      const addressResponse = await fetch(summaryAPI.getAddresses.url, {
        method: summaryAPI.getAddresses.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' }
      })
      const addressData = await addressResponse.json()
      const defaultAddress = addressData.data?.find(a => a.isDefault) || addressData.data?.[0] || null

      // Create direct order for this item
      const response = await fetch(summaryAPI.directBuyRazorpayOrder.url, {
        method: summaryAPI.directBuyRazorpayOrder.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          productId: item.ProductId,
          quantity: item.quantity,
          deliveryType: deliveryType,
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

  // Calculate totals
  const totalOriginalPrice = data.reduce((acc, item) => {
    return acc + (item?.productDetails?.price || 0) * (item?.quantity || 0)
  }, 0)

  const totalSellingPrice = data.reduce((acc, item) => {
    return acc + (item?.productDetails?.sellingPrice || 0) * (item?.quantity || 0)
  }, 0)

  const totalDiscount = totalOriginalPrice - totalSellingPrice
  const totalItems = data.reduce((acc, item) => acc + (item?.quantity || 0), 0)
  const totalWithDelivery = totalSellingPrice + handlingCharge

  const handlePlaceOrder = async () => {
    setPlacingOrder(true)
    try {
      // Fetch user's default address
      const addressResponse = await fetch(summaryAPI.getAddresses.url, {
        method: summaryAPI.getAddresses.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' }
      })
      const addressData = await addressResponse.json()
      
      // Get the default address or first address
      const defaultAddress = addressData.data?.find(a => a.isDefault) || addressData.data?.[0] || null

      // Create order (with pending payment status)
      const response = await fetch(summaryAPI.createRazorpayOrder.url, {
        method: summaryAPI.createRazorpayOrder.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ 
          deliveryType,
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
      const responseData = await response.json()
      
      if (responseData.success) {
        // Redirect to payment page with order details
        navigate('/payment', {
          state: {
            orderId: responseData.data.orderId,
            totalAmount: responseData.data.amount
          }
        })
      } else {
        toast.error(responseData.message || 'Failed to create order')
      }
    } catch (error) {
      toast.error('Error creating order')
      console.error('Error creating order:', error)
    } finally {
      setPlacingOrder(false)
    }
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className='bg-white rounded-lg shadow-sm p-4 flex gap-4 animate-pulse'>
      <div className='w-28 h-28 bg-slate-200 rounded'></div>
      <div className='flex-1 grid gap-2'>
        <div className='h-5 bg-slate-200 rounded w-3/4'></div>
        <div className='h-4 bg-slate-200 rounded w-1/4'></div>
        <div className='h-5 bg-slate-200 rounded w-1/2'></div>
        <div className='h-8 bg-slate-200 rounded w-1/3'></div>
      </div>
    </div>
  )

  // Empty cart view
  if (!loading && data.length === 0) {
    return (
      <div className='container mx-auto px-2 sm:p-4'>
        <EmptyState type='cart' />
      </div>
    )
  }

  return (
    <div className='container mx-auto px-2 sm:p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-lg sm:text-2xl font-semibold'>
          Shopping Cart
          {!loading && <span className='text-xs sm:text-base font-normal text-slate-500 ml-2'>({totalItems})</span>}
        </h1>
      </div>
      {placingOrder && <LoadingSpinner fullScreen={true} message="Processing your order..." />}

      <div className='flex flex-col lg:flex-row gap-4 sm:gap-6'>
        {/* Left - Cart Items */}
        <div className='flex-1'>
          <div className='grid gap-3'>
            {loading ? (
              Array(3).fill(null).map((_, i) => <LoadingSkeleton key={i} />)
            ) : (
              data.map((item) => {
                const product = item?.productDetails
                if (!product) return null

                const discount = Math.round(((product.price - product.sellingPrice) / product.price) * 100)
                const productDetailsPath = '/product-details/' + (product?._id || item.ProductId)

                return (
                  <div
                    key={item._id}
                    className='bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden'
                  >
                    {/* Clickable Upper Half - Image + Details */}
                    <div
                      className='p-4 cursor-pointer hover:bg-slate-50 transition-colors'
                      onClick={() => navigate(productDetailsPath)}
                      role='link'
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(productDetailsPath)
                        }
                      }}
                    >
                      <div className='flex gap-4'>
                        {/* Product Image */}
                        <div className='w-40 h-40 flex-shrink-0'>
                          <div className='w-40 h-40 bg-slate-50 rounded flex items-center justify-center p-2'>
                            {product?.productImage?.[0] && (
                              <img
                                src={product?.productImage?.[0]}
                                alt={product?.ProductName}
                                className='h-full w-full object-scale-down mix-blend-multiply'
                              />
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className='flex-1'>
                          <div>
                            <h3 className='font-medium text-xl text-ellipsis line-clamp-2'>{product?.ProductName}</h3>
                            <p className='text-slate-400 text-sm capitalize mt-0.5'>{product?.category}</p>
                            
                            {/* Ratings */}
                            {product?.productRating > 0 && (
                              <div className='flex items-center gap-1 mt-1'>
                                <span className='text-sm bg-green-600 text-white px-1.5 py-0.5 rounded font-medium'>{product?.productRating?.toFixed(1)} ★</span>
                                <span className='text-sm text-slate-500'>({product?.productRating})</span>
                              </div>
                            )}
                            
                            {product?.brandName && (
                              <p className='text-slate-500 text-sm mt-1'>Brand: <span className='font-medium'>{product?.brandName}</span></p>
                            )}
                          </div>

                          {/* Price */}
                          <div className='flex items-center gap-2 mt-2 mb-2'>
                            <span className='text-2xl font-bold text-slate-900'>{displayINRCurrency(product?.sellingPrice)}</span>
                            {product?.price !== product?.sellingPrice && (
                              <>
                                <span className='text-sm text-slate-400 line-through'>{displayINRCurrency(product?.price)}</span>
                                <span className='text-sm text-green-600 font-bold bg-green-50 px-1 py-0.5 rounded'>{discount}% off</span>
                              </>
                            )}
                          </div>

                          {/* Delivery Info */}
                          <div className='flex items-center gap-1 mb-3 text-sm'>
                            {deliveryType === 'express' ? (
                              <>
                                <span className='font-semibold text-blue-600 text-base'>EXPRESS</span>
                                <span className='text-slate-600 text-sm'>{expressFormatted}</span>
                              </>
                            ) : (
                              <>
                                <span className='text-slate-600 text-sm'>{standardFormatted}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          className='text-slate-400 hover:text-red-600 transition-colors self-start p-1 cursor-pointer'
                          onClick={(e) => { e.stopPropagation(); handleDeleteItem(product?._id || item.ProductId) }}
                          title='Remove item'
                        >
                          <MdDelete className='text-xl' />
                        </button>
                      </div>
                    </div>

                    {/* Static Lower Half - Quantity Controls */}
                    <div className='flex items-center justify-between p-4 border-t border-slate-100'>
                      <div className='flex items-center gap-1'>
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${item.quantity <= 1
                              ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                              : 'border-slate-300 text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
                            }`}
                          onClick={(e) => { e.stopPropagation(); handleQuantityUpdate(product?._id || item.ProductId, item.quantity - 1) }}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus className='text-xs' />
                        </button>
                        <span className='w-12 text-center font-semibold text-lg select-none'>{item.quantity}</span>
                        <button
                          className='w-8 h-8 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors cursor-pointer'
                          onClick={(e) => { e.stopPropagation(); handleQuantityUpdate(product?._id || item.ProductId, item.quantity + 1) }}
                        >
                          <FaPlus className='text-xs' />
                        </button>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBuyNow(item) }}
                        className='text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer'
                      >
                        Buy this now
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right - Price Summary */}
        {!loading && data.length > 0 && (
          <div className='lg:w-96'>
            <div className='bg-white rounded-lg shadow-sm border border-slate-100 sticky top-20'>
              <h2 className='font-semibold p-4 border-b border-slate-100 text-slate-700 uppercase tracking-wide text-sm'>
                Price Details
              </h2>
              <div className='p-4 grid gap-3'>
                <div className='bg-slate-50 p-3 rounded border border-slate-200 mb-2'>
                  <h3 className='text-lg font-semibold text-slate-700 mb-2'>Choose Delivery:</h3>
                  <div className='grid gap-2'>
                    <label className='flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-100 rounded' onClick={() => setDeliveryType('standard')}>
                      <input type='radio' name='delivery' value='standard' checked={deliveryType === 'standard'} onChange={(e) => setDeliveryType(e.target.value)} className='w-5 h-5 cursor-pointer' />
                      <div className='flex-1'>
                        <p className='text-base font-medium text-slate-800'>Standard (5 days)</p>
                        <p className='text-sm text-slate-600'>{standardFormatted}</p>
                      </div>
                    </label>
                    <label className='flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-100 rounded' onClick={() => setDeliveryType('express')}>
                      <input type='radio' name='delivery' value='express' checked={deliveryType === 'express'} onChange={(e) => setDeliveryType(e.target.value)} className='w-5 h-5 cursor-pointer' />
                      <div className='flex-1'>
                        <p className='text-base font-medium text-slate-800'>Express (2 days)</p>
                        <p className='text-sm text-slate-600'>{expressFormatted}</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className='border-t border-slate-200 pt-3'></div>
                <div className='flex justify-between text-slate-600 text-base'>
                  <span>Price ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                  <span>{displayINRCurrency(totalOriginalPrice)}</span>
                </div>
                <div className='flex justify-between text-green-600 text-base'>
                  <span>Discount</span>
                  <span>− {displayINRCurrency(totalDiscount)}</span>
                </div>
                <div className='flex justify-between text-slate-600 text-base'>
                  <span>Delivery Charges</span>
                  <span className={deliveryType === 'express' ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                    {deliveryType === 'express' ? displayINRCurrency(50) : 'FREE'}
                  </span>
                </div>
                <div className='flex justify-between text-slate-600 text-base'>
                  <span>Handling Fee</span>
                  <span className='text-slate-800 font-medium'>{displayINRCurrency(10)}</span>
                </div>
                <div className='border-t border-dashed border-slate-200 pt-3 flex justify-between text-xl font-bold text-slate-900'>
                  <span>Total Amount</span>
                  <span>{displayINRCurrency(totalWithDelivery)}</span>
                </div>
                {totalDiscount > 0 && (
                  <p className='text-green-600 text-sm font-medium'>
                    You will save {displayINRCurrency(totalDiscount)} on this order
                  </p>
                )}
              </div>
              <div className='p-4 border-t border-slate-100'>
                <button
                  className='w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-sm font-semibold text-base transition-colors cursor-pointer uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed'
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                >
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart