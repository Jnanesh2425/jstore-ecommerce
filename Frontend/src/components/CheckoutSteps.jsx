import React from 'react'
import { FaShoppingCart, FaTruck, FaCreditCard, FaCheckCircle } from 'react-icons/fa'

const CheckoutSteps = ({ currentStep = 1 }) => {
  // Step 1: Cart, Step 2: Shipping, Step 3: Payment, Step 4: Confirmation
  const steps = [
    { id: 1, label: 'Cart', icon: FaShoppingCart },
    { id: 2, label: 'Shipping', icon: FaTruck },
    { id: 3, label: 'Payment', icon: FaCreditCard },
    { id: 4, label: 'Confirmation', icon: FaCheckCircle }
  ]

  return (
    <div className='bg-white shadow-sm rounded-lg p-6 mb-6'>
      <div className='flex items-center justify-between'>
        {steps.map((step, index) => {
          const IconComponent = step.icon
          const isCompleted = step.id < currentStep
          const isActive = step.id === currentStep

          return (
            <div key={step.id} className='flex items-center flex-1'>
              {/* Step circle */}
              <div className='flex flex-col items-center'>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <IconComponent className='text-lg' />
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium mt-2 ${
                    isActive ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 sm:mx-4 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CheckoutSteps