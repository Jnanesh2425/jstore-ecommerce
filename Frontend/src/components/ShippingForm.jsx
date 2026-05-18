import React, { useState } from 'react'

const ShippingForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      alert('Please fill all fields')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className='bg-white rounded-lg shadow-sm p-6 mb-6'>
      <h3 className='text-lg font-semibold mb-4'>Shipping Address</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <input
          type='text'
          name='fullName'
          placeholder='Full Name'
          value={formData.fullName}
          onChange={handleChange}
          className='border rounded-lg px-4 py-2 outline-none focus:border-red-600'
        />
        <input
          type='email'
          name='email'
          placeholder='Email'
          value={formData.email}
          onChange={handleChange}
          className='border rounded-lg px-4 py-2 outline-none focus:border-red-600'
        />
        <input
          type='tel'
          name='phone'
          placeholder='Phone Number'
          value={formData.phone}
          onChange={handleChange}
          className='border rounded-lg px-4 py-2 outline-none focus:border-red-600'
        />
        <input
          type='text'
          name='zipCode'
          placeholder='ZIP Code'
          value={formData.zipCode}
          onChange={handleChange}
          className='border rounded-lg px-4 py-2 outline-none focus:border-red-600'
        />
      </div>

      <textarea
        name='address'
        placeholder='Full Address'
        value={formData.address}
        onChange={handleChange}
        rows='3'
        className='w-full border rounded-lg px-4 py-2 outline-none focus:border-red-600 mt-4'
      ></textarea>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
        <input
          type='text'
          name='city'
          placeholder='City'
          value={formData.city}
          onChange={handleChange}
          className='border rounded-lg px-4 py-2 outline-none focus:border-red-600'
        />
        <input
          type='text'
          name='state'
          placeholder='State'
          value={formData.state}
          onChange={handleChange}
          className='border rounded-lg px-4 py-2 outline-none focus:border-red-600'
        />
        <input
          type='text'
          name='country'
          placeholder='Country'
          value={formData.country}
          onChange={handleChange}
          className='border rounded-lg px-4 py-2 outline-none focus:border-red-600'
        />
      </div>

      <button
        type='submit'
        className='w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium mt-6 transition-colors'
      >
        Continue to Payment
      </button>
    </form>
  )
}

export default ShippingForm