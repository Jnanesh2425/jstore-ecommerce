import React from 'react'
import { FaShoppingCart, FaSearch, FaBox } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const EmptyState = ({ type = 'cart' }) => {
  const configs = {
    cart: {
      icon: FaShoppingCart,
      title: 'Your cart is empty!',
      message: 'Looks like you haven\'t added anything yet.',
      buttonText: 'Start Shopping',
      buttonLink: '/'
    },
    search: {
      icon: FaSearch,
      title: 'No products found',
      message: 'Try searching with different keywords.',
      buttonText: 'Browse All Products',
      buttonLink: '/all-products'
    },
    orders: {
      icon: FaBox,
      title: 'No orders yet',
      message: 'You haven\'t placed any orders.',
      buttonText: 'Start Shopping',
      buttonLink: '/'
    }
  }

  const config = configs[type]
  const IconComponent = config.icon

  return (
    <div className='flex flex-col items-center justify-center py-16 px-4'>
      <IconComponent className='text-6xl text-slate-300 mb-4' />
      <h2 className='text-xl font-semibold text-slate-600 mb-2'>
        {config.title}
      </h2>
      <p className='text-slate-400 mb-6 text-center max-w-sm'>
        {config.message}
      </p>
      <Link
        to={config.buttonLink}
        className='bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-full font-medium transition-colors'
      >
        {config.buttonText}
      </Link>
    </div>
  )
}

export default EmptyState