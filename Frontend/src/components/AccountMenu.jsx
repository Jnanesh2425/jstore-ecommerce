import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaRegUserCircle, FaHeart, FaUser, FaBox, FaMapMarkerAlt, FaCog, FaSignOutAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { setUserDetails } from '../store/userSlice'
import summaryAPI from '../common'

const AccountMenu = () => {
  const user = useSelector(state => state?.user?.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch(summaryAPI.logout_user.url, {
        method: summaryAPI.logout_user.method,
        credentials: 'include'
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Logged out successfully!')
        dispatch(setUserDetails(null))
        setIsOpen(false)
        navigate('/')
      } else {
        toast.error(data.message || 'Logout failed')
      }
    } catch (error) {
      toast.error('Error logging out')
      console.error('Logout error:', error)
    }
  }

  const menuItems = [
    {
      icon: FaUser,
      label: 'My Profile',
      path: '/profile',
      color: 'text-blue-600'
    },
    {
      icon: FaBox,
      label: 'My Orders',
      path: '/orders',
      color: 'text-purple-600'
    },
    {
      icon: FaHeart,
      label: 'Wishlist',
      path: '/wishlist',
      color: 'text-red-600'
    },
    {
      icon: FaMapMarkerAlt,
      label: 'Saved Addresses',
      path: '/addresses',
      color: 'text-green-600'
    },
    {
      icon: FaCog,
      label: 'Settings',
      path: '/settings',
      color: 'text-gray-600'
    }
  ]

  if (!user?._id) {
    return null
  }

  return (
    <div className="relative">
      {/* User Avatar/Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-2xl text-gray-600 hover:text-red-600 transition-colors p-2"
        aria-label="Account menu"
        title={user?.name}
      >
        {user?.profilePic ? (
          <img
            src={user.profilePic}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-red-600 transition-all"
          />
        ) : (
          <FaRegUserCircle />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <FaRegUserCircle className="text-lg" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              {user?.role === 'ADMIN' && (
                <p className="text-xs font-bold text-red-600">Admin</p>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="py-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                >
                  <IconComponent className={`${item.color}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Admin Panel Link (if admin) */}
          {user?.role === 'ADMIN' && (
            <>
              <Link
                to="/admin-panel/all-products"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 font-semibold hover:text-red-700"
              >
                📊 Admin Panel
              </Link>
              <div className="border-t border-gray-200"></div>
            </>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600 font-semibold text-left hover:text-red-700"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default AccountMenu