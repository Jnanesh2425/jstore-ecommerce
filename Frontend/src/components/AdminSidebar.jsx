import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBox, FaUsers, FaBars, FaTimes } from 'react-icons/fa'

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { label: 'All Products', path: '/admin-panel/all-products', icon: FaBox },
    { label: 'All Users', path: '/admin-panel/all-users', icon: FaUsers }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='fixed bottom-6 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg z-40 md:hidden'
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static left-0 top-16 h-screen md:h-auto w-64 bg-gray-900 text-white shadow-lg transform transition-transform md:transform-none z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <nav className='p-4 flex flex-col gap-2'>
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-red-600'
                    : 'hover:bg-gray-800'
                }`}
              >
                <IconComponent />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className='fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden'
        />
      )}
    </>
  )
}

export default AdminSidebar