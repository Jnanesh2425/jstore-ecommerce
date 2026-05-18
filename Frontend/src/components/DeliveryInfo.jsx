import React from 'react'
import { FaMapMarkerAlt, FaCalendarAlt, FaShoppingBag, FaStar } from 'react-icons/fa'
import displayINRCurrency from '../helpers/displayCurrency'

const DeliveryInfo = ({ order }) => {
  const deliveryCharge = order?.deliveryType === 'express' ? 60 : 10
  const deliveryFee = 10
  const handlingFee = Math.max(deliveryCharge - deliveryFee, 0)

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'TBA'
    const d = new Date(date)
    const options = { weekday: 'short', day: '2-digit', month: 'short' }
    return d.toLocaleDateString('en-IN', options)
  }

  const getDeliveryType = () => {
    return order?.deliveryType === 'express' ? 'Express Delivery (2 days)' : 'Standard Delivery (5 days)'
  }

  return (
    <div className='bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6'>
      <h3 className='font-bold text-gray-900 text-base mb-4'>Delivery Details</h3>

      <div className='space-y-4'>
        {/* Location */}
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <FaMapMarkerAlt className='text-blue-600 text-sm' />
            <p className='text-xs font-semibold text-gray-700 uppercase'>Delivery Location</p>
          </div>
          <p className='text-gray-900 font-semibold text-sm ml-6'>
            {order?.address?.address || 'Address not set'}
          </p>
        </div>

        {/* Delivery By */}
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <FaCalendarAlt className='text-green-600 text-sm' />
            <p className='text-xs font-semibold text-gray-700 uppercase'>Delivery By</p>
          </div>
          <p className='text-gray-900 font-semibold text-sm ml-6'>{formatDate(order?.deliveredDate)}</p>
          <p className='text-orange-600 text-xs font-medium ml-6 mt-1'>{getDeliveryType()}</p>
        </div>

        {/* Fulfilled By */}
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <FaShoppingBag className='text-purple-600 text-sm' />
            <p className='text-xs font-semibold text-gray-700 uppercase'>Fulfilled By</p>
          </div>
          <p className='text-gray-900 font-semibold text-sm ml-6'>E-Commerce Store</p>
          <div className='flex items-center gap-1 mt-1 ml-6'>
            <FaStar className='text-yellow-400 text-xs' />
            <span className='text-gray-600 text-xs'>4.5 • 2k+ Orders</span>
          </div>
        </div>

        {/* Delivery Charge */}
        <div className='border-t border-blue-200 pt-3 mt-3'>
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-700 text-sm font-medium'>Handling fee</span>
              <span className='text-red-600 font-bold text-sm'>{displayINRCurrency(handlingFee)}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-700 text-sm font-medium'>Delivery fee</span>
              <span className='text-red-600 font-bold text-sm'>{displayINRCurrency(deliveryFee)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info message */}
      <p className='text-blue-700 text-xs mt-4 pt-3 border-t border-blue-200'>
        Delivery executive details will be available once the order is out for delivery
      </p>
    </div>
  )
}

export default DeliveryInfo
