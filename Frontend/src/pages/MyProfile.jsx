import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import summaryAPI from '../common';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaCamera } from 'react-icons/fa';
import AccountLayout from '../components/AccountLayout';
import { setUserDetails } from '../store/userSlice';

const MyProfile = () => {
    const user = useSelector(state => state?.user?.user);
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        profilePic: user?.profilePic || '',
        gender: user?.gender || ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                profilePic: user.profilePic || '',
                gender: user.gender || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePic: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(summaryAPI.updateUser.url, {
                method: summaryAPI.updateUser.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Profile updated successfully');
                // Update Redux state with new user data
                dispatch(setUserDetails(data.data));
                setIsEditing(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error updating profile');
        }
        setLoading(false);
    };

    return (
        <AccountLayout>
            <div className='p-8'>
                <div className='grid grid-cols-3 gap-6'>
                    {/* Profile Form - Left Side */}
                    <div className='col-span-2 bg-white rounded-lg shadow p-8'>
                        <h1 className='text-2xl font-bold mb-8'>Personal Information</h1>

                        {/* Profile Picture */}
                        <div className='flex flex-col items-center mb-8'>
                            <div className='relative'>
                                <img
                                    src={formData.profilePic || 'https://via.placeholder.com/150'}
                                    alt='Profile'
                                    className='w-32 h-32 rounded-full object-cover border-4 border-blue-200'
                                />
                                {isEditing && (
                                    <label className='absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700'>
                                        <FaCamera />
                                        <input type='file' accept='image/*' onChange={handleImageUpload} className='hidden' />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className='space-y-6'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='flex items-center gap-2 text-sm font-semibold mb-2'>
                                        <FaUser /> First Name
                                    </label>
                                    <input
                                        type='text'
                                        name='name'
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className='w-full border border-gray-300 rounded px-4 py-2 disabled:bg-gray-100 focus:outline-none focus:border-blue-600'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='flex items-center gap-2 text-sm font-semibold mb-2'>
                                    <FaEnvelope /> Email Address
                                </label>
                                <input
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    disabled
                                    className='w-full border border-gray-300 rounded px-4 py-2 bg-gray-100 cursor-not-allowed'
                                />
                                <p className='text-xs text-gray-500 mt-1'>Email cannot be changed</p>
                            </div>

                            <div>
                                <label className='flex items-center gap-2 text-sm font-semibold mb-2'>
                                    <FaPhone /> Mobile Number
                                </label>
                                <input
                                    type='tel'
                                    name='phone'
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className='w-full border border-gray-300 rounded px-4 py-2 disabled:bg-gray-100 focus:outline-none focus:border-blue-600'
                                />
                            </div>

                            <div>
                                <label className='text-sm font-semibold mb-3 block'>Your Gender</label>
                                <div className='flex items-center gap-6'>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='radio'
                                            name='gender'
                                            value='Male'
                                            checked={formData.gender === 'Male'}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className='w-4 h-4 accent-blue-600'
                                        />
                                        <span className='text-gray-700'>Male</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='radio'
                                            name='gender'
                                            value='Female'
                                            checked={formData.gender === 'Female'}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className='w-4 h-4 accent-blue-600'
                                        />
                                        <span className='text-gray-700'>Female</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='radio'
                                            name='gender'
                                            value='Other'
                                            checked={formData.gender === 'Other'}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className='w-4 h-4 accent-blue-600'
                                        />
                                        <span className='text-gray-700'>Other</span>
                                    </label>
                                </div>
                            </div>

                            <div className='flex gap-4 justify-end pt-6 border-t'>
                                {!isEditing ? (
                                    <button
                                        type='button'
                                        onClick={() => setIsEditing(true)}
                                        className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-semibold'
                                    >
                                        Edit
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type='button'
                                            onClick={() => setIsEditing(false)}
                                            className='bg-gray-300 hover:bg-gray-400 text-gray-800 px-8 py-2 rounded font-semibold'
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type='submit'
                                            disabled={loading}
                                            className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-semibold disabled:opacity-50'
                                        >
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* FAQs - Right Side */}
                    <div className='col-span-1 bg-white rounded-lg shadow p-6 h-fit'>
                        <h2 className='text-lg font-bold mb-4'>FAQs</h2>
                        <div className='space-y-4 text-sm'>
                            <div>
                                <p className='font-semibold text-gray-800 mb-2'>Can I change my email?</p>
                                <p className='text-gray-600 text-xs'>No, your email cannot be changed as it is your login ID.</p>
                            </div>
                            <hr />
                            <div>
                                <p className='font-semibold text-gray-800 mb-2'>How often can I update my info?</p>
                                <p className='text-gray-600 text-xs'>You can update your profile information whenever you want.</p>
                            </div>
                            <hr />
                            <div>
                                <p className='font-semibold text-gray-800 mb-2'>Is my data secure?</p>
                                <p className='text-gray-600 text-xs'>Yes, we use encryption to protect your personal information.</p>
                            </div>
                            <hr />
                            <div>
                                <p className='font-semibold text-gray-800 mb-2'>Can I delete my profile?</p>
                                <p className='text-gray-600 text-xs'>Contact support to request account deletion.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AccountLayout>
    );
};

export default MyProfile;