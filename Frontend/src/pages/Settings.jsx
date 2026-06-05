import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBell, FaLock, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import AccountLayout from '../components/AccountLayout';

const Settings = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotions: false,
        privacy: 'private'
    });

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        toast.success('Setting updated');
    };

    const handlePrivacyChange = (value) => {
        setSettings(prev => ({ ...prev, privacy: value }));
        toast.success('Privacy setting updated');
    };

    return (
        <AccountLayout>
            <div className='p-8'>
                {/* Breadcrumb */}
                <div className='text-sm text-gray-600 mb-6 flex items-center gap-3'>
                    <button 
                        onClick={() => navigate('/')}
                        className='hover:text-blue-600 cursor-pointer font-medium'
                    >
                        Home
                    </button>
                    <span className='text-gray-400'>›</span>
                    <button 
                        onClick={() => navigate('/profile')}
                        className='hover:text-blue-600 cursor-pointer font-medium'
                    >
                        My Account
                    </button>
                    <span className='text-gray-400'>›</span>
                    <span className='text-gray-600 font-medium'>Settings</span>
                </div>

                <h1 className='text-2xl font-bold mb-6'>Settings</h1>

                {/* Notifications */}
                <div className='bg-white rounded-lg shadow p-8 mb-6'>
                    <h2 className='text-lg font-semibold mb-6 flex items-center gap-2'>
                        <FaBell className='text-blue-600' /> Notification Preferences
                    </h2>

                    <div className='space-y-4'>
                        <div className='flex items-center justify-between pb-4 border-b'>
                            <div>
                                <p className='font-semibold'>Email Notifications</p>
                                <p className='text-sm text-gray-500'>Receive updates via email</p>
                            </div>
                            <button onClick={() => handleToggle('emailNotifications')} className='text-3xl'>
                                {settings.emailNotifications ? <FaToggleOn className='text-blue-600' /> : <FaToggleOff className='text-gray-400' />}
                            </button>
                        </div>

                        <div className='flex items-center justify-between pb-4 border-b'>
                            <div>
                                <p className='font-semibold'>SMS Notifications</p>
                                <p className='text-sm text-gray-500'>Receive updates via SMS</p>
                            </div>
                            <button onClick={() => handleToggle('smsNotifications')} className='text-3xl'>
                                {settings.smsNotifications ? <FaToggleOn className='text-blue-600' /> : <FaToggleOff className='text-gray-400' />}
                            </button>
                        </div>

                        <div className='flex items-center justify-between pb-4 border-b'>
                            <div>
                                <p className='font-semibold'>Order Updates</p>
                                <p className='text-sm text-gray-500'>Get notified about order status</p>
                            </div>
                            <button onClick={() => handleToggle('orderUpdates')} className='text-3xl'>
                                {settings.orderUpdates ? <FaToggleOn className='text-blue-600' /> : <FaToggleOff className='text-gray-400' />}
                            </button>
                        </div>

                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='font-semibold'>Promotional Emails</p>
                                <p className='text-sm text-gray-500'>Receive deals and special offers</p>
                            </div>
                            <button onClick={() => handleToggle('promotions')} className='text-3xl'>
                                {settings.promotions ? <FaToggleOn className='text-blue-600' /> : <FaToggleOff className='text-gray-400' />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Privacy & Security */}
                <div className='bg-white rounded-lg shadow p-8'>
                    <h2 className='text-lg font-semibold mb-6 flex items-center gap-2'>
                        <FaLock className='text-red-600' /> Privacy & Security
                    </h2>

                    <div className='space-y-6'>
                        <div>
                            <label className='font-semibold mb-3 flex items-center gap-2'>
                                <FaEye className='text-blue-600' /> Profile Visibility
                            </label>
                            <select
                                value={settings.privacy}
                                onChange={(e) => handlePrivacyChange(e.target.value)}
                                className='w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600 cursor-pointer'
                            >
                                <option value='private'>🔒 Private - Only visible to you</option>
                                <option value='friends'>👥 Friends - Visible to friends only</option>
                                <option value='public'>🌐 Public - Visible to everyone</option>
                            </select>
                            <p className='text-sm text-gray-500 mt-2'>Control who can see your account details</p>
                        </div>

                        <div className='mt-8 p-4 bg-blue-50 border-l-4 border-blue-600 rounded'>
                            <p className='text-sm text-blue-800 font-semibold mb-2'>🔐 Security Reminder</p>
                            <p className='text-sm text-blue-700'>
                                Keep your password strong and update it regularly. Never share your credentials with anyone. Enable two-factor authentication for added security.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AccountLayout>
    );
};

export default Settings;