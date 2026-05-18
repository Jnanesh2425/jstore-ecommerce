import React, { useState } from 'react'
import { CgClose } from 'react-icons/cg'
import productCaterogy from '../helpers/productCaterogy'
import { FaCloudUploadAlt } from 'react-icons/fa'
import uploadImage from '../helpers/uploadImage'
import DisplayProductImage from './DisplayProductImage'
import { MdDelete } from 'react-icons/md'
import summaryAPI from '../common'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; //  Import CSS for toast to show correctly

const UploadProduct = ({ onClose,fetchData}) => {
  const [data, setData] = useState({
    ProductName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
    sellingPrice: "",
    hotDeal: false
  })
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false)
  const [fullScreenImage, setFullScreenImage] = useState("")

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setData((preve) => {
      return {
        ...preve,
        [name]: value
      }
    })
  }
  const handleUploadProduct = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      
      const uploadImageCloudinary = await uploadImage(file)
      
      if (uploadImageCloudinary.success) {
        setData((preve) => {
          return {
            ...preve,
            productImage: [...preve.productImage, uploadImageCloudinary.url]
          }
        })
        toast.success("Image uploaded successfully")
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload image")
    }
  }
  const handleProductImageDelete = async (index) => {
    const newProductImage = [...data.productImage]
    newProductImage.splice(index, 1)
    setData((preve) => {
      return {
        ...preve,
        productImage: [...newProductImage]
      }
    })
  }
  {/*upload product*/ }
  const handleSubmit = async (e) => {
    e.preventDefault()

    //validation for product img
    if (data.productImage.length === 0) {
      toast.error("Please upload at least one product image")
      return
    }
    const response = await fetch(summaryAPI.uploadProduct.url, {
      method: summaryAPI.uploadProduct.method,
      credentials: 'include',
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(data)
    })
    const responseData = await response.json()

    if (responseData.success) {
      toast.success(responseData?.message)
      onClose()
      fetchData()
    }

    if (responseData.error) {
      toast.error(responseData?.message)
    }
  }
  return (
    <div className='fixed inset-0 bg-slate-200/35 flex justify-center items-center z-50'>
      <div className='bg-white p-4 rounded w-full max-w-2xl max-h-[90%] overflow-hidden flex flex-col shadow-lg'>
        {/* Header */}
        <div className='flex justify-between items-center pb-2 border-b'>
          <h2 className='font-bold text-lg'>Upload Product</h2>
          <button
            className='text-2xl hover:text-red-600 cursor-pointer'
            onClick={onClose}
            aria-label='Close'
          >
            <CgClose />
          </button>
        </div>
        {/* Scrollable Form */}
        <form className='overflow-y-auto mt-4 space-y-4 pr-2' style={{ maxHeight: 'calc(90vh - 80px)' }} onSubmit={handleSubmit}>
          <div>
            <label htmlFor='ProductName' className='block text-sm font-medium'>Product Name
              <span className="text-orange-500">*</span>
            </label>
            <input
              type='text'
              id='ProductName'
              name='ProductName'
              value={data.ProductName}
              onChange={handleOnChange}
              placeholder='Enter product name'
              className='mt-1 p-2 bg-slate-100 border rounded w-full'
            />
          </div>

          <div>
            <label htmlFor='brandName' className='block text-sm font-medium'>Brand Name
              <span className="text-orange-500">*</span>
            </label>
            <input
              type='text'
              id='brandName'
              name='brandName'
              value={data.brandName}
              onChange={handleOnChange}
              placeholder='Enter brand name'
              className='mt-1 p-2 bg-slate-100 border rounded w-full'
            />
          </div>

          <div>
            <label htmlFor='category' className='block text-sm font-medium'>Category
              <span className="text-orange-500">*</span>
            </label>
            <select
              id='category'
              name='category'
              value={data.category}
              onChange={handleOnChange}
              className='mt-1 p-2 bg-slate-100 border rounded w-full'
            >
              <option value="">Select category</option>
              {productCaterogy.map((el, index) => (
                <option value={el.value} key={el.value + index}>{el.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor='productImage' className='block text-sm font-medium'>Product Image
              <span className="text-orange-500">*</span>
            </label>
            <label htmlFor='uploadImageInput'>
              <div className='mt-1 p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center'>
                <div className='text-slate-500 flex justify-center items-center flex-col gap-2 cursor-pointer'>
                  <span className='text-4xl'><FaCloudUploadAlt /></span>
                  <p className='text-sm'>Upload Product Image
                    <span className="text-orange-500">*</span>
                  </p>
                  <input type='file' id='uploadImageInput' className='hidden' onChange={handleUploadProduct} />
                </div>
              </div>
            </label>
          </div>
          <div>
            {
              data?.productImage[0] ? (
                <div className='flex items-center gap-2'>
                  {
                    data.productImage.map((el, index) => {
                      return (
                        <div key={index} className='relative group'>
                          <img
                            src={el}
                            alt={el}
                            width={80}
                            height={80}
                            className='bg-slate-100 border cursor-pointer'
                            onClick={() => {
                              setOpenFullScreenImage(true)
                              setFullScreenImage(el)
                            }} />
                          <div className='absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full hidden group-hover:block cursor-pointer'
                            onClick={() => handleProductImageDelete(index)}
                          >
                            <MdDelete />
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              ) : (
                <p className='text-red-600 text-xs'>* Please upload Product image</p>
              )
            }
          </div>
          <div>
            <label htmlFor='price' className='block text-sm font-medium'>Price
              <span className="text-orange-500">*</span>
            </label>
            <input
              type='number'
              id='price'
              placeholder='Enter the price'
              value={data.price}
              name='price'
              onChange={handleOnChange}
              className='mt-1 p-2 bg-slate-100 border rounded w-full'
            />
          </div>
          <div>
            <label htmlFor='sellingPrice' className='block text-sm font-medium'>Selling Price
              <span className="text-orange-500">*</span>
            </label>
            <input
              type='number'
              id='sellingPrice'
              placeholder='Enter the selling price'
              value={data.sellingPrice}
              name='sellingPrice'
              onChange={handleOnChange}
              className='mt-1 p-2 bg-slate-100 border rounded w-full'
            />
          </div>
          <div>
            <label htmlFor='description' className='block text-sm font-medium'>Description
              <span className="text-orange-500">*</span>
            </label>
            <textarea className='h-28 bg-slate-100 border rounded w-full resize-none p-2'
              placeholder='Enter the product description'
              rows={3}
              value={data.description}
              name='description'
              onChange={handleOnChange}
            />
          </div>
          <div className='flex items-center gap-3'>
            <label className='block text-sm font-medium'>Hot Deal</label>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                name='hotDeal'
                checked={data.hotDeal}
                onChange={(e) => setData(prev => ({ ...prev, hotDeal: e.target.checked }))}
                className='sr-only peer'
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
            {data.hotDeal && <span className='text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded'>🔥 Hot Deal</span>}
          </div>
          <button className='w-full px-3 py-2 bg-red-600 text-white mb-8 hover:bg-red-700 cursor-pointer'>Upload product</button>
        </form>
      </div>

      {/*display full screen image*/}

      {
        openFullScreenImage && (
          <DisplayProductImage onClose={() => setOpenFullScreenImage(false)} imgUrl={fullScreenImage} />
        )
      }
    </div>
  )
}

export default UploadProduct
