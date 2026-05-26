import * as React from 'react'
import { useEffect, useState } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import summaryAPI from './common'
import Context from './context'
import { setUserDetails } from './store/userSlice.jsx'
import { useDispatch } from 'react-redux'


function App() {
  const dispatch = useDispatch()
  const fetchUserDetails = async () => {
    const dataResponse = await fetch(summaryAPI.current_user.url, {
      method: summaryAPI.current_user.method,
      credentials: 'include'
    })
    const dataRes = await dataResponse.json()

    if (dataRes.success) {
      dispatch(setUserDetails(dataRes.data))
    }
  }
  const [cartProductCount, setCartProductCount] = useState(0)
  const [cartItems, setCartItems] = useState([])

  const fetchUserAddToCart = async() => {
    try {
      const dataResponse = await fetch(summaryAPI.addToCartProductCount.url, {
        method: summaryAPI.addToCartProductCount.method,
        credentials: 'include'
      })
      
      const dataRes = await dataResponse.json()
      
      if(dataRes.success) {
        setCartProductCount(dataRes?.data?.count || 0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  const fetchCartItems = async () => {
    try {
      const dataResponse = await fetch(summaryAPI.viewCart.url, {
        method: summaryAPI.viewCart.method,
        credentials: 'include'
      })
      const dataRes = await dataResponse.json()
      if (dataRes.success) {
        setCartItems(dataRes?.data || [])
      }
    } catch (error) {
      console.error('Error fetching cart items:', error)
    }
  }

  const refreshCart = async () => {
    await Promise.all([fetchUserAddToCart(), fetchCartItems()])
  }

  useEffect(() => {
    /* user details */
    fetchUserDetails()
    /* user add to cart count */
    fetchUserAddToCart()
    /* user cart items */
    fetchCartItems()
  }, [])
  return (
      <>
        <ToastContainer 
        position='top-center'
        />
        <Context.Provider value={{
          fetchUserDetails, // user detail fetch
          cartProductCount, // cart product count
          fetchUserAddToCart, // cart count fetch function
          cartItems, // cart items with quantities
          refreshCart // refresh both cart count and items
        }}>
          <div className='flex flex-col min-h-screen'>
            <Header />
            <main className='flex-grow'>
              <Outlet />
            </main>
            <Footer />
          </div>
        </Context.Provider>
      </>
    )
}

export default App
