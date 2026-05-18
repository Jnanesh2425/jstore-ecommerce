import { useContext, useState } from 'react'
import loginIcons from '../assets/signin.gif'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import summaryAPI from '../common/index.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; //  Import CSS for toast to show correctly
import Context from '../context/index.jsx';


const Login = () => {
    const [showPassword, setShowPassword] = useState(false)
    //to store the email and password
    const [data, setData] = useState({
        email: "",
        password: "",
    })

    const navigate = useNavigate()
    const { fetchUserDetails, fetchUserAddToCart} = useContext(Context)

    const handleOnChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        //connecting backend data with frontend 
        const dataResponse = await fetch(summaryAPI.signIn.url, {
            method: summaryAPI.signIn.method,
            credentials: 'include', // Allow sending cookies
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(data)
        })

        const dataRes = await dataResponse.json()

        if (dataRes.error) {
            // Show red error toast only
            toast.error(dataRes.message);
        } else {
            // Show success toast and navigate on close
            toast.success(dataRes.message, {
                onClose: () => navigate('/'),
                autoClose: 1000
            });
            fetchUserDetails()
            fetchUserAddToCart()
        }
    }
    console.log('data login', data)

    return (
        <section id='login'>
            <div className='mx-auto my-4 sm:my-6 container px-2 sm:p-4'>
                <div className='bg-white p-3 sm:p-4 w-full max-w-sm mx-auto'>
                    <div className='w-20 h-20 mx-auto'>
                        <img src={loginIcons} alt='login icons' />
                    </div>

                    <form className='pt-6 flex flex-col gap-2' onSubmit={handleSubmit}>
                        <div className='grid'>
                            <label>Email : </label>
                            <div className='bg-slate-100 p-2'>
                                <input
                                    type='email'
                                    placeholder='enter email'
                                    name='email'
                                    value={data.email}
                                    onChange={handleOnChange}
                                    className='w-full h-full outline-none bg-transparent' />
                            </div>
                        </div>

                        <div>
                            <label>Password : </label>
                            <div className='bg-slate-100 p-2 flex'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder='enter password'
                                    name='password'
                                    value={data.password}
                                    onChange={handleOnChange}
                                    className='w-full h-full outline-none bg-transparent' />
                                <div className='cursor-pointer text-xl' onClick={() => setShowPassword((preve) => !preve)}>
                                    <span>
                                        {
                                            showPassword ? (
                                                <FaEyeSlash />
                                            )
                                                :
                                                (
                                                    <FaEye />
                                                )
                                        }
                                    </span>
                                </div>
                            </div>
                            <Link to={"/forget-password"} className='block w-fit ml-auto text-[15px] text-blue-600 hover:underline my-1'>
                                Forgot password?
                            </Link>
                        </div>

                        <button className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-1 cursor-pointer'>Login</button>

                    </form>

                    <p className='my-3'>Don't have account ? <Link to={"/sign-up"} className=' text-blue-600 text-[15px] hover:underline'>Sign up</Link></p>
                </div>
                <ToastContainer /> {/*  added toast container */}
            </div>
        </section>
    )
}
export default Login