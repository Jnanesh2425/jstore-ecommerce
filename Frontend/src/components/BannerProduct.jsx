import React, { useEffect, useState } from 'react'
import image1 from '../assets/banners/img1.webp'
import image2 from '../assets/banners/img2.webp'
import image3 from '../assets/banners/img3.jpg'
import image4 from '../assets/banners/img4.jpg'
import image5 from '../assets/banners/img5.webp'

import image1Mobile from '../assets/banners/img1_mobile.jpg'
import image2Mobile from '../assets/banners/img2_mobile.webp'
import image3Mobile from '../assets/banners/img3_mobile.jpg'
import image4Mobile from '../assets/banners/img4_mobile.jpg'
import image5Mobile from '../assets/banners/img5_mobile.png'

import { FaAngleRight } from 'react-icons/fa6'
import { FaAngleLeft } from 'react-icons/fa6'

const BannerProduct = () => {

  const [currentImage, setCurrentImage] = useState(0)

  const desktopImages = [image1, image2, image3, image4, image5];
  const mobileImages = [image1Mobile, image2Mobile, image3Mobile, image4Mobile, image5Mobile];

  const nextImage = () => {
    setCurrentImage(pre => (pre === desktopImages.length - 1 ? 0 : pre + 1));
  }
  // const preImage = () => {
  //   if (currentImage != 0) {
  //     setCurrentImage(pre => pre - 1)
  //   }
  // }

  // creating loop back to the previous image when  u click 'previous' 
  const preImage = () => {
    setCurrentImage(pre => (pre === 0 ? desktopImages.length - 1 : pre - 1))
  }

  useEffect(()=>{
    const interval = setInterval(()=> {
      if(desktopImages.length - 1 > currentImage) {
        nextImage()
      } else {
        setCurrentImage(0)
      }
    },5000)
  },[])
  return (
    <div className='container mx-auto px-4 rounded'>
      <div className='h-72 w-full bg-slate-200 relative'>
        <div className='absolute z-10 w-full h-full md:flex items-center hidden'>
          <div className='flex justify-between w-full text-2xl'>
            <button onClick={preImage} className='bg-white shadow-md rounded-full p-1'><FaAngleLeft /></button>
            <button onClick={nextImage} className='bg-white shadow-md rounded-full p-1'><FaAngleRight /></button>
          </div>
        </div>
        {/*Desktop and laptop version */}
        <div className='hidden md:flex w-full h-full overflow-hidden'>
          {
            desktopImages.map((images, index) => {
              return (
                <div className='min-w-full min-h-full transition-all' key={images} style={{ transform: `translatex(-${currentImage * 100}%)` }}>
                  <img src={images} className='w-full h-full' />
                </div>
              )
            })
          }
        </div>
         {/*Mobile version */}
        <div className='flex w-full h-full overflow-hidden md:hidden object-cover'>
          {
            mobileImages.map((images, index) => {
              return (
                <div className='min-w-full min-h-full transition-all' key={images} style={{ transform: `translatex(-${currentImage * 100}%)` }}>
                  <img src={images} className='w-full h-full' />
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default BannerProduct