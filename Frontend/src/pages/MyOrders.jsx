import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import summaryAPI from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import { toast } from 'react-toastify';
import { FaBox, FaSearch, FaStar } from 'react-icons/fa';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');

  const statusOptions = [
    { label: 'On the way', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Payment Failed', value: 'payment_failed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // Dynamic time options based on current year
  const getCurrentYear = () => new Date().getFullYear();
  const currentYear = getCurrentYear();
  
  const timeOptions = [
    { label: 'Last 30 days', value: 30 },
    { label: `${currentYear}`, value: currentYear },
    { label: `${currentYear - 1}`, value: currentYear - 1 },
    { label: `${currentYear - 2}`, value: currentYear - 2 },
    { label: 'Older', value: 'older' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, selectedStatus, selectedTime]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(summaryAPI.getOrders.url, {
        method: summaryAPI.getOrders.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products?.some(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (selectedStatus.length > 0) {
      filtered = filtered.filter(order => selectedStatus.includes(order.status));
    }

    // Time filter
    if (selectedTime) {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        if (selectedTime === 30) {
          // Last 30 days
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= thirtyDaysAgo;
        } else if (typeof selectedTime === 'number' && selectedTime > 1900) {
          // Specific year (2024, 2025, 2026, etc.)
          return orderDate.getFullYear() === selectedTime;
        } else if (selectedTime === 'older') {
          // Before the oldest year we track (3 years ago)
          return orderDate.getFullYear() < (currentYear - 2);
        }
        return true;
      });
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      confirmed: 'text-blue-600 bg-blue-50',
      shipped: 'text-purple-600 bg-purple-50',
      delivered: 'text-green-600 bg-green-50',
      payment_failed: 'text-red-600 bg-red-50',
      cancelled: 'text-red-600 bg-red-50'
    };
    return colors[status] || colors.pending;
  };

  const getStatusDot = (status) => {
    const dots = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      payment_failed: 'bg-red-500',
      cancelled: 'bg-red-500'
    };
    return dots[status] || dots.pending;
  };

  const getDeliveryText = (status, orderDate) => {
    const deliveryDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    const dateStr = deliveryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    
    if (status === 'delivered') {
      return `Delivered on ${dateStr}`;
    } else if (status === 'shipped') {
      return `On the way`;
    } else if (status === 'cancelled') {
      return 'Order Cancelled';
    } else if (status === 'payment_failed') {
      return 'Payment Failed';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  if (loading) {
    return <div className='container mx-auto px-4 py-8 text-center'>Loading...</div>;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
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
          <span className='text-gray-600 font-medium'>My Orders</span>
        </div>

        {/* Search Bar */}
        <div className='mb-8'>
          <div className='relative'>
            <FaSearch className='absolute left-4 top-3.5 text-gray-400 text-lg' />
            <input
              type='text'
              placeholder='Search your orders here'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <button className='absolute right-2 top-2.5 bg-blue-600 text-white px-6 py-1.5 rounded hover:bg-blue-700 font-semibold text-sm'>
              Search Orders
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Filters Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg p-6 shadow-sm'>
              {/* Order Status Filter */}
              <div className='mb-8'>
                <h3 className='font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider'>ORDER STATUS</h3>
                <div className='space-y-3'>
                  {statusOptions.map(status => (
                    <label key={status.value} className='flex items-center gap-3 cursor-pointer group'>
                      <input
                        type='checkbox'
                        checked={selectedStatus.includes(status.value)}
                        onChange={() => handleStatusChange(status.value)}
                        className='w-4 h-4 rounded border-gray-300 cursor-pointer accent-blue-600'
                      />
                      <span className='text-gray-700 group-hover:text-gray-900'>{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Time Filter */}
              <div className='border-t pt-8'>
                <h3 className='font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider'>ORDER TIME</h3>
                <div className='space-y-3'>
                  {timeOptions.map(time => (
                    <label key={time.value} className='flex items-center gap-3 cursor-pointer group'>
                      <input
                        type='radio'
                        name='time'
                        checked={selectedTime === time.value}
                        onChange={() => setSelectedTime(selectedTime === time.value ? '' : time.value)}
                        className='w-4 h-4 cursor-pointer accent-blue-600'
                      />
                      <span className='text-gray-700 group-hover:text-gray-900'>{time.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className='lg:col-span-3'>
            {filteredOrders.length === 0 ? (
              <div className='bg-white rounded-lg p-12 text-center shadow-sm'>
                <FaBox className='text-6xl text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500 text-lg font-semibold'>No orders found</p>
                <p className='text-gray-400 mt-2'>Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredOrders.map((order) => {
                  const orderDate = new Date(order.createdAt);

                  return (
                    <Link
                      key={order._id}
                      to={`/order-details/${order._id}`}
                      className='block hover:shadow-md transition-all'
                    >
                      <div className='bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 overflow-hidden'>
                        {/* Each Product in Order */}
                        {order.products?.map((product, idx) => (
                          <div
                            key={idx}
                            className={`p-6 flex items-center gap-4 sm:gap-6 ${
                              idx !== 0 ? 'border-t border-gray-100' : ''
                            } hover:bg-gray-50 transition-colors`}
                          >
                            {/* Product Image */}
                            <div className='flex-shrink-0'>
                              {product.productImage ? (
                                <img
                                  src={product.productImage}
                                  alt={product.productName}
                                  className='w-20 h-20 sm:w-24 sm:h-24 object-scale-down bg-pink-50 rounded-lg p-2'
                                />
                              ) : (
                                <div className='w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center'>
                                  <FaBox className='text-2xl text-gray-400' />
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className='flex-1 min-w-0'>
                              <h4 className='font-semibold text-gray-900 mb-1 line-clamp-2'>{product.productName}</h4>
                              <p className='text-sm text-gray-600 mb-2'>Qty: {product.quantity}</p>
                              <div className='flex items-center gap-3 flex-wrap'>
                                <span className='text-base sm:text-lg font-bold text-gray-900'>
                                  {displayINRCurrency(product.sellingPrice * product.quantity)}
                                </span>
                                {product.price !== product.sellingPrice && (
                                  <>
                                    <span className='text-sm text-gray-500 line-through'>
                                      {displayINRCurrency(product.price * product.quantity)}
                                    </span>
                                    <span className='text-sm text-orange-500 font-semibold'>
                                      {Math.round((1 - product.sellingPrice / product.price) * 100)}% off
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Status & Action - Right aligned */}
                            <div className='flex-shrink-0 text-right'>
                              <div className='mb-3'>
                                <div className={`flex items-center gap-2 justify-end mb-2 ${getStatusColor(order.status)}`}>
                                  <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(order.status)}`}></div>
                                </div>
                                <p className={`text-xs sm:text-sm font-semibold ${getStatusColor(order.status)}`}>
                                  {getDeliveryText(order.status, orderDate)}
                                </p>
                              </div>

                              {order.status === 'delivered' && (
                                <div className='flex items-center justify-end gap-1.5 text-blue-600 font-semibold hover:text-blue-800 cursor-pointer text-xs sm:text-sm'>
                                  <FaStar className='text-yellow-500' />
                                  <span>Rate & Review Product</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
