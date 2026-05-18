import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaBox, FaHeart, FaMapMarkerAlt, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { setUserDetails } from '../store/userSlice';
import summaryAPI from '../common';

const AccountLayout = ({ children }) => {
    const user = useSelector(state => state?.user?.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: FaUser, label: 'My Profile', path: '/profile' },
        { icon: FaBox, label: 'My Orders', path: '/orders' },
        { icon: FaHeart, label: 'Wishlist', path: '/wishlist' },
        { icon: FaMapMarkerAlt, label: 'Saved Addresses', path: '/addresses' },
        { icon: FaCog, label: 'Settings', path: '/settings' }
    ];

    const handleLogout = async () => {
        try {
            const response = await fetch(summaryAPI.logout_user.url, {
                method: summaryAPI.logout_user.method,
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Logged out successfully!');
                dispatch(setUserDetails(null));
                navigate('/');
            }
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    return (
        <div className='min-h-[calc(100vh-80px)] bg-slate-50 flex'>
            {/* Left Sidebar */}
            <div className='w-64 bg-white border-r border-gray-200 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto'>
                {/* User Greeting */}
                <div className='p-6 border-b border-gray-200'>
                    <p className='text-gray-600 text-sm'>Hello,</p>
                    <p className='text-lg font-bold text-black'>{user?.name?.split(' ')[0]}</p>
                </div>

                {/* Menu Items */}
                <nav className='py-4'>
                    {menuItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-6 py-3 transition-all border-l-4 ${
                                    isActive
                                        ? 'bg-blue-50 border-blue-600 text-blue-600 font-semibold'
                                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <IconComponent className='text-lg' />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div className='border-t border-gray-200 mt-4 pt-4 px-6 pb-4'>
                    <button
                        onClick={handleLogout}
                        className='w-full flex items-center gap-3 text-red-600 hover:text-red-700 font-semibold py-2'
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className='flex-1 overflow-y-auto'>
                {children}
            </div>
        </div>
    );
};

export default AccountLayout;
