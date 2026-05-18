import React from 'react'
import { FaMapMarkerAlt, FaPhone, FaUser } from 'react-icons/fa'

const DeliveryDetails = ({ order }) => {
  return (
    <div className='bg-white rounded-lg shadow-sm p-6 space-y-5'>
      <h3 className='text-lg font-bold text-gray-900 mb-6'>Delivery details</h3>
      
      {/* Location */}
      <div className='flex gap-4'>
        <FaMapMarkerAlt className='text-blue-600 text-xl flex-shrink-0 mt-0.5' />
        <div>
          <p className='font-semibold text-gray-900 mb-1'>
            {order?.address?.address || 'Address not set'}
          </p>
          {order?.address?.city && (
            <p className='text-gray-600 text-sm'>
              {order.address.city}{order.address.state ? `, ${order.address.state}` : ''} {order.address.pincode}
            </p>
          )}
        </div>
      </div>

      {/* User Contact */}
      <div className='border-t pt-5 flex gap-4'>
        <FaUser className='text-blue-600 text-xl flex-shrink-0 mt-0.5' />
        <div>
          <p className='font-semibold text-gray-900 mb-1'>{order?.address?.name || order?.userId?.name || 'User'}</p>
          <p className='text-gray-600 text-sm flex items-center gap-2'>
            <FaPhone className='text-xs' />
            {order?.address?.mobile || order?.userId?.mobile || order?.userId?.phone || 'Phone not available'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DeliveryDetails
