import React from 'react'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const OrderStatusTimeline = ({ order }) => {
  const isPaymentFailed = order?.status === 'payment_failed'

  // Status timeline steps
  const steps = isPaymentFailed
    ? [
        { key: 'confirmed', label: 'Order Confirmed', date: order?.createdAt },
        { key: 'payment_failed', label: 'Payment Failed', date: order?.updatedAt || order?.createdAt }
      ]
    : [
        { key: 'confirmed', label: 'Order Confirmed', date: order?.createdAt },
        { key: 'shipped', label: 'Shipped', date: order?.shippedDate },
        { key: 'out for delivery', label: 'Out For Delivery', date: order?.outForDeliveryDate },
        { key: 'delivered', label: 'Delivered', date: order?.deliveredDate }
      ]

  // Get current step index
  const currentStepIndex = isPaymentFailed ? 1 : steps.findIndex(step => step.key === order?.status)
  const isCompleted = (index) => index <= currentStepIndex

  // Format date
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const options = { weekday: 'short', month: 'short', day: '2-digit' }
    return d.toLocaleDateString('en-IN', options)
  }

  return (
    <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
      {/* Header - Order Confirmed */}
      <div className='mb-6 pb-4 border-b border-gray-200'>
        <div className='flex items-start gap-3'>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isPaymentFailed ? 'bg-red-100' : 'bg-green-100'}`}>
            {isPaymentFailed ? <FaTimesCircle className='text-red-600 text-lg' /> : <FaCheckCircle className='text-green-600 text-lg' />}
          </div>
          <div>
            <h3 className={`font-bold text-base ${isPaymentFailed ? 'text-red-700' : 'text-gray-900'}`}>
              {isPaymentFailed ? 'Payment Failed' : 'Order Confirmed'}
            </h3>
            <p className={`text-sm mt-0.5 ${isPaymentFailed ? 'text-red-600' : 'text-gray-600'}`}>
              {isPaymentFailed
                ? `Customer left payment without completing it. ${formatDate(order?.updatedAt || order?.createdAt) || 'Today'}`
                : `Seller has processed your order. ${formatDate(order?.createdAt) || 'Today'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className='relative pl-6'>
        {/* Vertical Line */}
        <div className={`absolute left-3 top-0 bottom-0 w-1 ${isPaymentFailed ? 'bg-gradient-to-b from-green-500 via-red-400 to-red-500' : 'bg-gradient-to-b from-green-500 to-green-300'}`}></div>

        {/* Timeline Steps */}
        <div className='space-y-5'>
          {steps.map((step, index) => (
            <div key={index} className='flex items-start gap-3'>
              {/* Circle */}
              <div className={`w-6 h-6 rounded-full -ml-6 flex-shrink-0 border-2 ${
                isCompleted(index)
                  ? (isPaymentFailed && index === 1 ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50')
                  : 'border-gray-300 bg-gray-50'
              }`}>
                <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                  isCompleted(index)
                    ? (isPaymentFailed && index === 1 ? 'bg-red-500' : 'bg-green-500')
                    : 'bg-gray-300'
                }`}></div>
              </div>

              {/* Step Label */}
              <div className={`${isCompleted(index) ? 'text-gray-900' : 'text-gray-400'}`}>
                <p className={`font-semibold text-sm ${isCompleted(index) ? (isPaymentFailed && index === 1 ? 'text-red-700' : 'text-gray-900') : 'text-gray-500'}`}>
                  {step.label}
                </p>
                {step.date && (
                  <p className={`text-xs ${isCompleted(index) ? (isPaymentFailed && index === 1 ? 'text-red-600' : 'text-gray-600') : 'text-gray-400'}`}>
                    Expected By {formatDate(step.date)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* See All Updates */}
      <div className='mt-6 pt-4 border-t border-gray-200'>
        <a href='#' className='text-blue-600 font-semibold text-sm hover:text-blue-800'>
          See All Updates ›
        </a>
      </div>
    </div>
  )
}

export default OrderStatusTimeline
