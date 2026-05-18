import React, { useState, useEffect } from 'react';
import summaryAPI from '../common';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaEdit, FaTrash, FaPlus, FaCheck, FaHome, FaBriefcase, FaCircle } from 'react-icons/fa';
import AccountLayout from '../components/AccountLayout';

const SavedAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        addressType: 'home'
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await fetch(summaryAPI.getAddresses.url, {
                method: summaryAPI.getAddresses.method,
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setAddresses(data.data || []);
            }
        } catch (error) {
            toast.error('Error fetching addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId 
                ? summaryAPI.updateAddress.url
                : summaryAPI.addAddress.url;
            
            const payload = editingId ? { ...formData, addressId: editingId } : formData;

            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                toast.success(editingId ? 'Address updated' : 'Address added');
                resetForm();
                fetchAddresses();
            }
        } catch (error) {
            toast.error('Error saving address');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name: '', phone: '', email: '', addressLine1: '', addressLine2: '',
            city: '', state: '', postalCode: '', country: 'India', addressType: 'home'
        });
    };

    const handleEdit = (address) => {
        setEditingId(address.id);
        setFormData(address);
        setShowForm(true);
    };

    const deleteAddress = async (addressId) => {
        try {
            const response = await fetch(summaryAPI.deleteAddress.url, {
                method: summaryAPI.deleteAddress.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ addressId })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Address deleted');
                fetchAddresses();
            }
        } catch (error) {
            toast.error('Error deleting address');
        }
    };

    return (
        <AccountLayout>
            <div className='p-8'>
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-2xl font-bold'>Saved Addresses</h1>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold'
                        >
                            <FaPlus /> Add New Address
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className='bg-white rounded-lg shadow p-6 mb-6'>
                        <h2 className='text-lg font-semibold mb-6'>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <input type='text' name='name' placeholder='Full Name' value={formData.name} onChange={handleChange} className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600' required />
                                <input type='tel' name='phone' placeholder='Phone Number' value={formData.phone} onChange={handleChange} className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600' required />
                            </div>
                            <input type='email' name='email' placeholder='Email Address' value={formData.email} onChange={handleChange} className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600' required />
                            <input type='text' name='addressLine1' placeholder='Address Line 1' value={formData.addressLine1} onChange={handleChange} className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600' required />
                            <input type='text' name='addressLine2' placeholder='Address Line 2 (Optional)' value={formData.addressLine2} onChange={handleChange} className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600' />
                            <div className='grid grid-cols-3 gap-4'>
                                <input type='text' name='city' placeholder='City' value={formData.city} onChange={handleChange} className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600' required />
                                <input type='text' name='state' placeholder='State' value={formData.state} onChange={handleChange} className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600' required />
                                <input type='text' name='postalCode' placeholder='Postal Code' value={formData.postalCode} onChange={handleChange} className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600' required />
                            </div>
                            
                            {/* Address Type with Icons */}
                            <div>
                                <label className='block text-sm font-semibold mb-3'>Address Type</label>
                                <div className='grid grid-cols-3 gap-4'>
                                    <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded cursor-pointer transition-all ${formData.addressType === 'home' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <input
                                            type='radio'
                                            name='addressType'
                                            value='home'
                                            checked={formData.addressType === 'home'}
                                            onChange={handleChange}
                                            className='hidden'
                                        />
                                        <FaHome className='text-green-600 text-lg' />
                                        <span className='font-medium'>Home</span>
                                    </label>
                                    
                                    <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded cursor-pointer transition-all ${formData.addressType === 'work' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <input
                                            type='radio'
                                            name='addressType'
                                            value='work'
                                            checked={formData.addressType === 'work'}
                                            onChange={handleChange}
                                            className='hidden'
                                        />
                                        <FaBriefcase className='text-orange-600 text-lg' />
                                        <span className='font-medium'>Work</span>
                                    </label>
                                    
                                    <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded cursor-pointer transition-all ${formData.addressType === 'other' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <input
                                            type='radio'
                                            name='addressType'
                                            value='other'
                                            checked={formData.addressType === 'other'}
                                            onChange={handleChange}
                                            className='hidden'
                                        />
                                        <FaCircle className='text-purple-600 text-lg' />
                                        <span className='font-medium'>Other</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div className='flex gap-4 pt-4'>
                                <button type='submit' className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold'>Save Address</button>
                                <button type='button' onClick={resetForm} className='bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded font-semibold'>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className='text-center py-12'>Loading addresses...</div>
                ) : addresses.length === 0 ? (
                    <div className='bg-white rounded-lg shadow p-12 text-center'>
                        <FaMapMarkerAlt className='text-6xl text-gray-300 mx-auto mb-4' />
                        <p className='text-gray-500 text-lg'>No saved addresses</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {addresses.map((address) => (
                            <div key={address.id} className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-600'>
                                <div className='flex items-start justify-between mb-4'>
                                    <div className='flex items-start gap-3 flex-1'>
                                        <FaMapMarkerAlt className='text-blue-600 mt-1 flex-shrink-0' />
                                        <div>
                                            <h3 className='font-semibold text-lg'>{address.name}</h3>
                                            <p className='text-sm text-gray-600 capitalize'>{address.addressType}</p>
                                        </div>
                                    </div>
                                    {address.isDefault && (
                                        <span className='bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 flex-shrink-0'>
                                            <FaCheck size={12} /> Default
                                        </span>
                                    )}
                                </div>
                                <p className='text-sm text-gray-700 mb-2'>{address.addressLine1}</p>
                                {address.addressLine2 && <p className='text-sm text-gray-700 mb-2'>{address.addressLine2}</p>}
                                <p className='text-sm text-gray-700 mb-4'>{address.city}, {address.state} {address.postalCode}</p>
                                <p className='text-sm text-gray-600 mb-4'>{address.phone}</p>
                                <div className='flex gap-2 pt-4 border-t'>
                                    <button 
                                        onClick={() => handleEdit(address)} 
                                        className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer'
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button 
                                        onClick={() => deleteAddress(address.id)} 
                                        className='flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer'
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AccountLayout>
    );
};

export default SavedAddresses;