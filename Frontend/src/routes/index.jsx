import { createBrowserRouter } from 'react-router-dom'
import App from '../App';
import Home from '../pages/Home';
import Login from '../pages/Login';
import ForgetPassword from '../pages/ForgetPassword';
import SignUp from '../pages/SignUp';
import AdminPanel from '../pages/AdminPanel';
import AllUsers from '../pages/AllUsers';
import AllProducts from '../pages/AllProducts';
import CategoryProduct from '../pages/CategoryProduct';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import SearchProduct from '../pages/SearchProduct';
import NotFound from '../pages/NotFound';
import MyProfile from '../pages/MyProfile';
import MyOrders from '../pages/MyOrders';
import OrderDetails from '../pages/OrderDetails';
import Wishlist from '../pages/Wishlist';
import SavedAddresses from '../pages/SavedAddresses';
import Settings from '../pages/Settings';
import Payment from '../pages/Payment';
import OrderConfirmation from '../pages/OrderConfirmation';


const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '',
                element: <Home />
            },
            {
                path: 'login',
                element: <Login />
            },
            {
                path: 'forget-password',
                element: <ForgetPassword />
            },
            {
                path: 'sign-up',
                element: <SignUp />
            },
            {
                path: 'product-category/:categoryName',
                element: <CategoryProduct />
            },
            {
                path: 'product-details/:id',
                element: <ProductDetails />
            },
            {
                path: 'cart',
                element: <Cart />
            },
            {
                path: 'payment',
                element: <Payment />
            },
            {
                path: 'search',
                element: <SearchProduct />
            },
            {
                path: '*',
                element: <NotFound />
            },
            {
                path: 'profile',
                element: <MyProfile />
            },
            {
                path: 'orders',
                element: <MyOrders />
            },
            {
                path: 'order-details/:orderId',
                element: <OrderDetails />
            },
            {
                path: 'wishlist',
                element: <Wishlist />
            },
            {
                path: 'addresses',
                element: <SavedAddresses />
            },
            {
                path: 'settings',
                element: <Settings />
            },
            {
                path: 'order-confirmation',
                element: <OrderConfirmation />
            },
            {
                path: 'admin-panel',
                element: <AdminPanel />,
                children: [
                    {
                        path: 'all-users',
                        element: <AllUsers />
                    },
                    {
                        path: 'all-products',
                        element: <AllProducts />
                    }
                ]
            }
        ]
    }
])

export default router;