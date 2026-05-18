import React, { useEffect, useRef, useState, useContext } from 'react'
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct'
import displayINRCurrency from '../helpers/displayCurrency'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import addToCart from '../helpers/addToCart'
import { Link } from 'react-router-dom'
import Context from '../context'
import summaryAPI from '../common'
import StarRating from './StarRating'

const CategoryWiseProductDisplay = ({ category, heading }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const loadingList = new Array(13).fill(null)
    const { refreshCart, cartItems } = useContext(Context)

    const handleAddToCart = async (e, id) => {
        await addToCart(e, id, refreshCart)
    }

    const getProductQuantity = (productId) => {
        const item = cartItems?.find(item => item.ProductId === productId)
        return item ? item.quantity : 0
    }

    const handleUpdateQuantity = async (e, productId, newQuantity) => {
        e?.stopPropagation()
        e?.preventDefault()
        try {
            await fetch(summaryAPI.updateCartQuantity.url, {
                method: summaryAPI.updateCartQuantity.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ productId, quantity: newQuantity })
            })
            refreshCart()
        } catch (error) {
            console.error('Error updating quantity:', error)
        }
    }

    const fetchData = async () => {
        if (!category) return

        setLoading(true)
        try {
            const categoryProduct = await fetchCategoryWiseProduct(category)
            setData(categoryProduct?.data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [category])

    return (
        <div className='container mx-auto px-4 my-6 relative'>
            <h2 className='text-2xl font-semibold p-4'>{heading}</h2>
            <div className=' grid grid-cols-[repeat(auto-fit,minmax(280px,300px))] justify-between md:gap-6 overflow-scroll scrollbar-none transition-all'>
                {
                    loading ? (
                        loadingList.map((product, index) => {
                            return (
                                <div key={`vertical-loading-${index}`} className='w-full min-w-[280px] md:min-w-[300px] max-w-[280px] md:max-w-[300px] bg-white rounded-lg shadow overflow-hidden'>
                                    <div className='bg-slate-200 h-48 p-4 flex justify-center items-center animate-pulse'>
                                    </div>
                                    <div className='p-4 flex flex-col gap-2.5'>
                                        <div className='bg-slate-200 animate-pulse h-5 rounded-full'></div>
                                        <div className='bg-slate-200 animate-pulse h-4 rounded-full w-2/3'></div>
                                        <div className='flex gap-2'>
                                            <div className='bg-slate-200 animate-pulse h-4 rounded-full w-20'></div>
                                            <div className='bg-slate-200 animate-pulse h-4 rounded-full w-16'></div>
                                        </div>
                                        <div className='bg-slate-200 animate-pulse h-8 rounded-full'></div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        data.map((product, index) => {
                            const discount = product?.price > product?.sellingPrice ? Math.round(((product.price - product.sellingPrice) / product.price) * 100) : 0
                            return (
                                <Link to={'/product-details/' + product?._id} key={product?._id || `vertical-product-${index}`} className='w-full min-w-[280px] md:min-w-[300px] max-w-[280px] md:max-w-[300px] bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow'>
                                    <div className='bg-slate-200 h-48 p-4 flex justify-center items-center relative'>
                                        {product?.hotDeal && (
                                            <span className='absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded z-10'>🔥 Hot Deal</span>
                                        )}
                                        {discount > 0 && (
                                            <span className='absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded z-10'>
                                                {discount}% OFF
                                            </span>
                                        )}
                                        <img
                                            src={product?.productImage[0]}
                                            alt={product?.productName}
                                            className='object-scale-down h-full hover:scale-110 transition-all mix-blend-multiply'
                                        />
                                    </div>
                                    <div className='p-4 flex flex-col gap-1.5'>
                                        <h3 className='font-medium text-sm md:text-base text-ellipsis line-clamp-1 text-black'>{product?.ProductName}</h3>
                                        <p className='capitalize text-slate-500 text-xs'>{product?.category}</p>
                                        <div className='h-6'>
                                            {product?.avgRating > 0 && (
                                                <StarRating rating={product?.avgRating || 0} reviewCount={product?.totalRatings || 0} size='sm' />
                                            )}
                                        </div>
                                        <div className='flex items-center gap-1.5 flex-wrap'>
                                            <p className='text-red-600 font-semibold text-sm'>{displayINRCurrency(product?.sellingPrice)}</p>
                                            <p className='text-slate-400 line-through text-xs'>{displayINRCurrency(product?.price)}</p>
                                            {discount > 0 && (
                                                <span className='text-green-600 text-xs font-semibold whitespace-nowrap'>{discount}% off</span>
                                            )}
                                        </div>
                                        {
                                            getProductQuantity(product?._id) > 0 ? (
                                                <div className='flex items-center justify-center gap-3 mt-1'>
                                                    <button className='bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold cursor-pointer text-sm' onClick={(e) => handleUpdateQuantity(e, product?._id, getProductQuantity(product?._id) - 1)}>−</button>
                                                    <span className='font-semibold text-base min-w-[20px] text-center'>{getProductQuantity(product?._id)}</span>
                                                    <button className='bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold cursor-pointer text-sm' onClick={(e) => handleUpdateQuantity(e, product?._id, getProductQuantity(product?._id) + 1)}>+</button>
                                                </div>
                                            ) : (
                                                <button className='bg-red-600 hover:bg-red-700 text-white cursor-pointer text-sm font-medium px-4 py-1.5 rounded-full w-full mt-1 transition-all' onClick={(e) => handleAddToCart(e, product?._id)}>Add to cart</button>
                                            )
                                        }
                                    </div>
                                </Link>
                            )
                        })
                    )
                }
            </div>
        </div>
    )
}

export default CategoryWiseProductDisplay