import React from 'react'
import { Link } from 'react-router-dom'
import { FaExclamationTriangle } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50'>
      <div className='text-center'>
        <FaExclamationTriangle className='text-6xl text-red-600 mb-4 mx-auto' />
        <h1 className='text-5xl md:text-6xl font-bold text-gray-800 mb-2'>
          404
        </h1>
        <p className='text-xl md:text-2xl text-gray-600 mb-4'>
          Page Not Found
        </p>
        <p className='text-gray-500 mb-8 max-w-md'>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className='flex gap-4 justify-center flex-col sm:flex-row'>
          <Link
            to='/'
            className='bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition-colors'
          >
            Go Home
          </Link>
          <Link
            to='/all-products'
            className='bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-medium transition-colors'
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound