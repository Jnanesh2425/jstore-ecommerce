import React, { useEffect, useRef, useState, useContext } from 'react'
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct'
import displayINRCurrency from '../helpers/displayCurrency'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import addToCart from '../helpers/addToCart'
import Context from '../context'
import summaryAPI from '../common'
import StarRating from './StarRating'

const HorizontalCardProduct = ({ category, heading }) => {
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

    const [scroll, setScroll] = useState(0)
    const scrollElement = useRef()

    const fetchData = async () => {
        if (!category) return
        
        setLoading(true)
        try {
            const categoryProduct = await fetchCategoryWiseProduct(category)
            setData(categoryProduct?.data || [])
        } catch (error) {
            console.error("Fetch error:", error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [category])

    const scrollRight = () => {
        scrollElement.current.scrollLeft += 300
    }
    const scrollLeft = () => {
        scrollElement.current.scrollLeft -= 300
    }
    return (
        <div className='container mx-auto px-2 sm:px-4 my-4 sm:my-6 relative'>
            <h2 className='text-lg sm:text-2xl font-semibold p-2 sm:p-4'>{heading}</h2>
            <div className='flex items-center gap-2 sm:gap-4 md:gap-6 overflow-x-scroll scrollbar-none transition-all' ref={scrollElement}>
                <button onClick={scrollLeft} className='bg-white shadow-md rounded-full p-1 absolute left-0 sm:left-1 text-sm md:text-xl hidden md:block cursor-pointer z-10'><FaAngleLeft /></button>
                <button onClick={scrollRight} className='bg-white shadow-md rounded-full p-1 absolute right-0 sm:right-1 text-sm md:text-xl hidden md:block cursor-pointer z-10'><FaAngleRight /></button>
                {
                    loading ? (
                        loadingList.map((product, index) => {
                            return (
                                <div key={`horizontal-loading-${index}`} className='w-full min-w-[200px] sm:min-w-[280px] md:min-w-[340px] max-w-[200px] sm:max-w-[280px] md:max-w-[340px] h-40 sm:h-48 md:h-56 bg-white rounded-lg shadow flex overflow-hidden flex-shrink-0 animate-pulse'>
                                    <div className='bg-slate-200 h-full min-w-[90px] sm:min-w-[120px] md:min-w-[140px] p-4'></div>
                                    <div className='p-3 flex flex-col w-full gap-2'>
                                        <div className='h-4 bg-slate-200 rounded w-full'></div>
                                        <div className='h-3 bg-slate-200 rounded w-2/3'></div>
                                        <div className='h-3 bg-slate-200 rounded w-1/2 flex-1'></div>
                                        <div className='h-6 bg-slate-200 rounded w-full'></div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        data.map((product, index) => {
                            const discount = product?.price > product?.sellingPrice ? Math.round(((product.price - product.sellingPrice) / product.price) * 100) : 0
                            return (
                                <Link to={'/product-details/'+product?._id} key={product?._id || `horizontal-product-${index}`} className='w-full min-w-[200px] sm:min-w-[280px] md:min-w-[340px] max-w-[200px] sm:max-w-[280px] md:max-w-[340px] h-40 sm:h-48 md:h-56 bg-white rounded-lg shadow flex overflow-hidden hover:shadow-lg transition-shadow flex-shrink-0'>
                                    <div className='bg-slate-200 h-full min-w-[90px] sm:min-w-[120px] md:min-w-[140px] p-4 flex items-center justify-center relative flex-shrink-0'>
                                        {product?.hotDeal && (
                                            <span className='absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10'>🔥 Hot</span>
                                        )}
                                        <img
                                            src={product?.productImage[0]}
                                            alt={product?.productName}
                                            className='object-scale-down h-full w-full hover:scale-110 transition-all mix-blend-multiply'
                                        />
                                    </div>
                                    <div className='p-3 flex flex-col justify-between flex-1 min-w-0'>
                                        <div>
                                            <h3 className='font-medium text-sm md:text-base text-ellipsis line-clamp-2 text-black'>{product?.ProductName}</h3>
                                            <p className='capitalize text-slate-500 text-xs truncate'>{product?.category}</p>
                                            <div className='h-6 mt-0.5'>
                                                {product?.avgRating > 0 && (
                                                    <StarRating rating={product?.avgRating || 0} reviewCount={product?.totalRatings || 0} size='sm' />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='flex items-center gap-1.5 flex-wrap mb-2'>
                                                <p className='text-red-600 font-semibold text-sm'>{displayINRCurrency(product?.sellingPrice)}</p>
                                                <p className='text-slate-400 line-through text-xs'>{displayINRCurrency(product?.price)}</p>
                                                {discount > 0 && (
                                                    <span className='text-green-600 text-xs font-semibold whitespace-nowrap'>{discount}% off</span>
                                                )}
                                            </div>
                                            {
                                                getProductQuantity(product?._id) > 0 ? (
                                                    <div className='flex items-center gap-2 justify-center'>
                                                        <button className='bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold cursor-pointer text-xs flex-shrink-0' onClick={(e) => handleUpdateQuantity(e, product?._id, getProductQuantity(product?._id) - 1)}>−</button>
                                                        <span className='font-semibold text-sm min-w-[16px] text-center'>{getProductQuantity(product?._id)}</span>
                                                        <button className='bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold cursor-pointer text-xs flex-shrink-0' onClick={(e) => handleUpdateQuantity(e, product?._id, getProductQuantity(product?._id) + 1)}>+</button>
                                                    </div>
                                                ) : (
                                                    <button className='bg-red-600 hover:bg-red-700 text-white cursor-pointer text-xs font-medium px-2 py-1.5 rounded-full transition-all w-full flex-shrink-0' onClick={(e)=>handleAddToCart(e,product?._id)}>Add to cart</button>
                                                )
                                            }
                                        </div>
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

export default HorizontalCardProduct