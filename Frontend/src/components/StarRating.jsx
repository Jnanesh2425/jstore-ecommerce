import React from 'react'
import { FaStar } from 'react-icons/fa'

const StarRating = ({ rating = 0, reviewCount = 0, actualReviewCount = 0, size = 'md', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }

  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  // Badge variant (for search results)
  if (variant === 'badge') {
    return (
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-sm font-semibold'>
          {rating.toFixed(1)}
          <FaStar className='text-white text-xs' />
        </div>
        <span className='text-sm text-gray-600'>
          {reviewCount.toLocaleString()} Ratings & {actualReviewCount.toLocaleString()} Reviews
        </span>
      </div>
    )
  }

  // Default variant (for home page and product cards)
  return (
    <div className='flex items-center gap-2'>
      <div className='flex gap-0.5'>
        {stars.map((star) => (
          <FaStar
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className='text-sm text-gray-600'>
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  )
}

export default StarRating