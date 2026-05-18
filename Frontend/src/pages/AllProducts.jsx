import React, { useEffect, useState } from 'react'
import UploadProduct from '../components/UploadProduct'
import summaryAPI from '../common'
import AdminProductCard from '../components/AdminProductCard'

const AllProducts = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false)
  const [allProduct, setAllProduct] = useState([])

  const fetchAllProduct = async() => {
    const response = await fetch(summaryAPI.allProduct.url)
    const dataResponse = await response.json() //convert into json
    console.log("all products",dataResponse)
    setAllProduct(dataResponse?.data || []) //if no data is sent show empty 
  }

  useEffect(()=> {
    fetchAllProduct()
  },[])
  
  return (
    <div>
      <div className='bg-white py-2 px-2 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0'>
        <h2 className='font-bold text-base sm:text-lg'>All Products</h2>
        <button className='border-2 border-red-600 py-1 px-3 text-red-600 text-sm cursor-pointer rounded-full hover:bg-red-600 hover:text-white transition-all'
          onClick={ () =>setOpenUploadProduct(true)}
        >
          Upload Product</button>
      </div>

      {/*all products to display*/}
      <div className='flex items-center flex-wrap gap-2 sm:gap-3 md:gap-5 py-3 sm:py-5 h-[calc(100vh-190px)] overflow-y-scroll px-2 sm:px-4'>
        {
          allProduct.map((product,index)=>{
            return(
              <AdminProductCard key={product._id || index} data={product} fetchdata={fetchAllProduct}/>
            )
          })
        }
      </div>

      {/*upload product component*/}
      {
        openUploadProduct && (
          <UploadProduct onClose={()=>setOpenUploadProduct(false)} fetchData={fetchAllProduct}/>
        )
      }
    </div>
  )
}

export default AllProducts