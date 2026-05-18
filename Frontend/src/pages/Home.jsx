import React, { useState } from 'react'
import CategoryList from '../components/CategoryList'
import BannerProduct from '../components/BannerProduct'
import HorizontalCardProduct from '../components/HorizontalCardProduct'
import VerticalCardProduct from '../components/VerticalCardProducts'

const Home = () => {
  const [expandedCategories, setExpandedCategories] = useState(false)

  // Featured categories - show only these on homepage
  const featuredCategories = [
    { category: 'mobiles', heading: 'Featured Mobiles' },
    { category: 'watches', heading: 'Popular Watches' },
    { category: 'airpodes', heading: 'Top Airpods' }
  ]

  // All categories - show when "View More" is clicked
  const allCategories = [
    { category: 'mouse', heading: 'Mice' },
    { category: 'television', heading: 'Televisions' },
    { category: 'Camera', heading: 'Cameras' },
    { category: 'earphones', heading: 'Earphones' },
    { category: 'printers', heading: 'Printers' },
    { category: 'refrigerator', heading: 'Refrigerators' },
    { category: 'speakers', heading: 'Speakers' },
    { category: 'trimmers', heading: 'Trimmers' },
    { category: 'processor', heading: 'Processors' }
  ]

  return (
    <div>
      <CategoryList />
      <BannerProduct />
      
      {/* Featured Categories */}
      {featuredCategories.map((item) => (
        <VerticalCardProduct
          key={item.category}
          category={item.category}
          heading={item.heading}
        />
      ))}

      {/* Expandable All Categories Section */}
      {expandedCategories && (
        <div>
          {allCategories.map((item) => (
            <VerticalCardProduct
              key={item.category}
              category={item.category}
              heading={item.heading}
            />
          ))}
        </div>
      )}

      {/* View More / Show Less Button */}
      <div className='flex justify-center py-8'>
        <button
          onClick={() => setExpandedCategories(!expandedCategories)}
          className='bg-red-600 hover:bg-red-700 text-white px-12 py-3 rounded-full font-semibold transition-colors cursor-pointer'
        >
          {expandedCategories ? 'Show Less' : 'View More Categories'}
        </button>
      </div>
    </div>
  )
}

export default Home