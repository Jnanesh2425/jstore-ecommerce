import React, { useContext, useState, useRef } from 'react';
import Logo from './Logo';
import { GrSearch } from "react-icons/gr";
import {
    FaShoppingCart,
    FaBars,
    FaChevronDown,
    FaHeadset,
    FaRobot,
    FaTags,
    FaBox,
    FaStore,
    FaUser,
    FaHeart,
    FaMapMarkerAlt,
    FaCog,
    FaSignOutAlt
} from "react-icons/fa";

import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Context from '../context/index.jsx';
import { toast } from 'react-toastify';

const Header = () => {

    const user = useSelector(state => state?.user?.user)
    const navigate = useNavigate()
    const context = useContext(Context)

    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    const userMenuTimeoutRef = useRef(null)
    const moreMenuTimeoutRef = useRef(null)

    const handleUserMenuLeave = () => {
        userMenuTimeoutRef.current = setTimeout(() => {
            setShowUserMenu(false)
        }, 200)
    }

    const handleUserMenuEnter = () => {
        if (userMenuTimeoutRef.current) {
            clearTimeout(userMenuTimeoutRef.current)
        }
        setShowUserMenu(true)
    }

    const handleMoreMenuLeave = () => {
        moreMenuTimeoutRef.current = setTimeout(() => {
            setShowMoreMenu(false)
        }, 200)
    }

    const handleMoreMenuEnter = () => {
        if (moreMenuTimeoutRef.current) {
            clearTimeout(moreMenuTimeoutRef.current)
        }
        setShowMoreMenu(true)
    }

    const handleSearch = (e) => {
        const { value } = e.target

        if (value) {
            navigate(`/search?q=${value}`)
        } else {
            navigate(`/search`)
        }
    }

    const moreMenuItems = [
        {
            icon: FaHeadset,
            label: 'Customer Care',
            action: () => toast.info('Customer Care: Contact us at support@ecommerce.com')
        },
        {
            icon: FaRobot,
            label: 'AI Chat',
            action: () => toast.info('AI Chat coming soon!')
        },
        {
            icon: FaTags,
            label: 'Offers & Deals',
            path: '/all-products'
        },
        user?._id
            ? {
                icon: FaBox,
                label: 'My Orders',
                path: '/orders'
            }
            : null,
        {
            icon: FaStore,
            label: 'Become a Seller',
            action: () => toast.info('Seller registration coming soon!')
        }
    ].filter(Boolean)

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">

            {/* MAIN HEADER */}
            <div className="max-w-[1600px] mx-auto h-[72px] px-6 flex items-center justify-between gap-5">

                {/* LEFT */}
                <div className="flex items-center gap-4">

                    {/* MOBILE MENU */}
                    <button className="lg:hidden text-xl text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
                        <FaBars />
                    </button>

                    {/* LOGO */}
                    <Link to={"/"} className="flex items-center">
                        <Logo />
                    </Link>
                </div>

                {/* SEARCH */}
                <div className="flex-1 max-w-3xl hidden sm:flex">

                    <div className="w-full h-[48px] flex items-center border-2 border-blue-500 rounded-xl px-4 bg-white">

                        <GrSearch className='text-gray-400 text-xl flex-shrink-0' />

                        <input
                            type="text"
                            placeholder="Search for Products, Brands and More"
                            className="w-full h-full px-4 text-[17px] text-gray-700 outline-none bg-transparent"
                            onChange={handleSearch}
                        />

                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-8">

                    {/* USER */}
                    <div
                        className='hidden sm:block relative'
                        onMouseEnter={handleUserMenuEnter}
                        onMouseLeave={handleUserMenuLeave}
                    >

                        {user?._id ? (

                            <button className='flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-all'>

                                {user?.profilePic ? (
                                    <img
                                        src={user.profilePic}
                                        alt={user?.name}
                                        className='w-10 h-10 rounded-full object-cover border'
                                    />
                                ) : (
                                    <div className='w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold'>
                                        {user?.name?.[0]?.toUpperCase()}
                                    </div>
                                )}

                                <span className='text-[17px] font-medium'>
                                    {user?.name?.split(' ')[0]}
                                </span>

                                <FaChevronDown
                                    className={`text-sm transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                                />

                            </button>

                        ) : (

                            <Link
                                to="/login"
                                className="flex items-center gap-2 text-[16px] font-medium text-gray-700"
                            >
                                <span>Sign In</span>
                                <FaChevronDown />
                            </Link>

                        )}

                        {/* USER DROPDOWN */}
                        {showUserMenu && user?._id && (

                            <div className='absolute right-0 top-14 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 w-64 z-50 overflow-hidden'>

                                <div className='px-4 py-3 border-b'>
                                    <p className='font-semibold text-gray-800'>
                                        Your Account
                                    </p>
                                </div>

                                <Link
                                    to='/profile'
                                    className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'
                                >
                                    <FaUser />
                                    <span>My Profile</span>
                                </Link>

                                <Link
                                    to='/orders'
                                    className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'
                                >
                                    <FaBox />
                                    <span>Orders</span>
                                </Link>

                                <Link
                                    to='/wishlist'
                                    className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'
                                >
                                    <FaHeart />
                                    <span>Wishlist</span>
                                </Link>

                                <Link
                                    to='/addresses'
                                    className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'
                                >
                                    <FaMapMarkerAlt />
                                    <span>Saved Addresses</span>
                                </Link>

                                <Link
                                    to='/settings'
                                    className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'
                                >
                                    <FaCog />
                                    <span>Settings</span>
                                </Link>

                                <div className='border-t mt-2 pt-2'>

                                    <button
                                        onClick={() => {
                                            navigate('/logout')
                                            setShowUserMenu(false)
                                        }}
                                        className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left'
                                    >
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                    {/* MORE */}
                    <div
                        className='relative hidden sm:block'
                        onMouseEnter={handleMoreMenuEnter}
                        onMouseLeave={handleMoreMenuLeave}
                    >

                        <button className='flex items-center gap-2 text-[17px] font-medium text-gray-700 hover:text-blue-600'>

                            <span>More</span>

                            <FaChevronDown
                                className={`text-sm transition-transform ${showMoreMenu ? 'rotate-180' : ''}`}
                            />

                        </button>

                        {/* MORE DROPDOWN */}
                        {showMoreMenu && (

                            <div className='absolute right-0 top-14 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 w-56 z-50 overflow-hidden'>

                                {moreMenuItems.map((item, idx) => (

                                    <div key={idx}>

                                        {item.path ? (

                                            <Link
                                                to={item.path}
                                                className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'
                                            >
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>

                                        ) : (

                                            <button
                                                onClick={item.action}
                                                className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left'
                                            >
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </button>

                                        )}

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                    {/* CART */}
                    {user?._id && (

                        <Link
                            to={'/cart'}
                            className="relative flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-all"
                        >

                            <div className="relative">

                                <FaShoppingCart className="text-[28px]" />

                                {context?.cartProductCount > 0 && (

                                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center">

                                        {context?.cartProductCount}

                                    </div>

                                )}

                            </div>

                            <span className='text-[17px] font-medium hidden sm:inline'>
                                Cart
                            </span>

                        </Link>

                    )}

                </div>

            </div>

        </header>
    );
};

export default Header;