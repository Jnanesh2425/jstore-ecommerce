import React from 'react'

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  const spinnerClasses = fullScreen
    ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
    : 'flex items-center justify-center py-8'

  return (
    <div className={spinnerClasses}>
      <div className='flex flex-col items-center gap-3'>
        <div className='w-12 h-12 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin'></div>
        <p className='text-white text-lg font-medium'>{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner