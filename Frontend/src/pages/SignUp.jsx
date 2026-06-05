import { useState } from 'react'
import loginIcons from '../assets/signin.gif'
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import imageTobase64 from '../helpers/imageTobase64';
import summaryAPI from '../common/index.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; //  Import CSS for toast to show correctly

const SignUp = () => {
  const navigate = useNavigate(); // for redirecting after signup

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  //to store the email and password
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
    role: "GERENAL" ,
  })

  const handleOnChange = (e) => {
    const { name, value } = e.target

    setData((preve) => {
      return {
        ...preve,
        [name]: value
      }
    })
  }

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0] // [0] means "getget the first file"(since users might select multiple)

    const imagePic = await imageTobase64(file)
    setData((preve) => {
      return {
        ...preve,
        profilePic: imagePic
      }
    })

  }

  const handleSendOtp = async (e) => {
    e.preventDefault()

    if (!data.email) {
      toast.error("Please enter your email")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      toast.error("Please enter a valid email")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(summaryAPI.sendEmailOtp.url, {
        method: summaryAPI.sendEmailOtp.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('OTP sent to your email!')
        setOtpSent(true)
      } else {
        toast.error(result.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast.error('Error sending OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(summaryAPI.verifyEmailOtp.url, {
        method: summaryAPI.verifyEmailOtp.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          otp: otp
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Email verified successfully!')
        setEmailVerified(true)
        setOtp("")
        setOtpSent(false)
      } else {
        toast.error(result.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error('Error verifying OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!emailVerified) {
      toast.error("Please verify your email first")
      return
    }

    /* connect your frontend sign-up form to your backend signup logic (API). */
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match") //  added toast if passwords don't match
      return;
    }

    try {
      const dataResponse = await fetch(summaryAPI.signUp.url, {
        method: summaryAPI.signUp.method,

        headers: {
          "content-type": "application/json" //This tells the server: "Hey, I'm sending data in JSON format".
          //Without this, the server may not know how to parse the body.
        },
        body: JSON.stringify(data) //This is the actual data you're sending to the server.
      })

      const dataRes = await dataResponse.json() //Parse response body to JS object

      //  handled both success and error properly
      if (dataRes.success) {
        toast.success(dataRes.message)

        setTimeout(() => {
          navigate("/login") // Once the user signs up successfully, the app will automatically navigate them to the login page
        }, 2000)
      } else if (dataRes.error) {
        toast.error(dataRes.message)
      }

      console.log('data', dataRes)

    } catch (err) {
      console.error("Signup Error:", err)
      toast.error("Something went wrong!")
    }
  }

  return (
    <section id='sign-up'>
      <div className='mx-auto my-4 sm:my-6 container px-2 sm:p-4'>
        <div className='bg-white p-3 sm:p-4 w-full max-w-sm mx-auto'>
          <div className='w-20 h-20 mx-auto relative overflow-hidden rounded-full'>
            <div>
              <img src={data.profilePic || loginIcons} alt='login icons' />
            </div>
            <form>
              <label>
                <div className='text-xs opacity-70 text-center pb-4 bt-2 bg-slate-100 absolute bottom-0 w-full cursor-pointer hover:text-red-700'>
                  upload photo
                </div>
                <input type='file' className='hidden' onChange={handleUploadPhoto} />
              </label>
            </form>
          </div>

          <form className='pt-6 flex flex-col gap-2' onSubmit={handleSubmit}>

            {/* username */}
            <div className='grid'>
              <label>Name : </label>
              <div className='bg-slate-100 p-2'>
                <input
                  type='text'
                  placeholder='enter your name'
                  name='name'
                  value={data.name}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent' />
              </div>
            </div>

            {/* email */}
            <div className='grid'>
              <label>Email : </label>
              <div className='bg-slate-100 p-2 flex items-center justify-between'>
                <input
                  type='email'
                  placeholder='enter email'
                  name='email'
                  value={data.email}
                  onChange={handleOnChange}
                  disabled={emailVerified}
                  required
                  className='flex-1 outline-none bg-transparent disabled:opacity-50' />
                {emailVerified ? (
                  <FaCheck className='text-green-600 text-lg' />
                ) : (
                  <button
                    type='button'
                    onClick={handleSendOtp}
                    disabled={loading || !data.email}
                    className='text-green-600 hover:text-green-700 cursor-pointer ml-2 text-sm font-semibold disabled:opacity-50 whitespace-nowrap'
                  >
                    {loading ? 'Sending...' : 'Verify'}
                  </button>
                )}
              </div>
            </div>

            {/* OTP Input - shows after verify button clicked */}
            {otpSent && !emailVerified && (
              <div className='grid'>
                <label>Enter OTP : </label>
                <div className='bg-slate-100 p-2 flex gap-2'>
                  <input
                    type='text'
                    placeholder='000000'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    maxLength='6'
                    className='flex-1 outline-none bg-transparent text-center tracking-widest'
                  />
                  <button
                    type='button'
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className='text-green-600 hover:text-green-700 cursor-pointer text-sm font-semibold disabled:opacity-50 whitespace-nowrap'
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {/* password */}
            <div>
              <label>Password : </label>
              <div className='bg-slate-100 p-2 flex'>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder='enter password'
                  name='password'
                  value={data.password}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent' />
                <div className='cursor-pointer text-xl' onClick={() => setShowPassword((preve) => !preve)}>
                  <span>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>
            {/* confirm password */}
            <div>
              <label>Confirm password : </label>
              <div className='bg-slate-100 p-2 flex'>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder='enter confirm password'
                  name='confirmPassword'
                  value={data.confirmPassword}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent' />
                <div className='cursor-pointer text-xl' onClick={() => setShowConfirmPassword((preve) => !preve)}>
                  <span>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>
            <button className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-2 cursor-pointer'>Sign Up</button>
          </form>
          <p className='my-3'>Already have account ?<Link to={"/login"} className=' text-blue-600 text-[15px] hover:underline pl-1'>login</Link></p>
        </div>
      </div>
      <ToastContainer /> {/*  added toast container */}
    </section>
  )
}

export default SignUp
