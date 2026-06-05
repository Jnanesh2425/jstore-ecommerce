import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import summaryAPI from '../common/index.jsx'
import { toast } from 'react-toastify'
import loginIcons from '../assets/signin.gif'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { token } = useParams()

  const [step, setStep] = useState(1) // 1: Email, 2: Reset
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSendResetCode = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(summaryAPI.forgotPassword.url, {
        method: summaryAPI.forgotPassword.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Reset code sent to your email!')
        setStep(2)
      } else {
        toast.error(result.message || 'Failed to send reset code')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error sending reset code')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!resetCode || resetCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(summaryAPI.resetPassword.url, {
        method: summaryAPI.resetPassword.method,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          resetCode,
          password
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Password reset successfully!')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        toast.error(result.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error resetting password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id='forgot-password'>
      <div className='mx-auto my-4 sm:my-6 container px-2 sm:p-4'>
        <div className='bg-white p-3 sm:p-4 w-full max-w-sm mx-auto'>
          {/* Logo/Icon */}
          <div className='w-20 h-20 mx-auto relative overflow-hidden rounded-full mb-4 border-4 border-red-600'>
            <img src={loginIcons} alt='profile' className='w-full h-full object-cover' />
          </div>

          {/* STEP 1: Send Reset Code */}
          {step === 1 && (
            <form onSubmit={handleSendResetCode}>
              <h2 className='text-center font-bold text-xl mb-6'>Forgot Password</h2>

              <div className='mb-4'>
                <label className='text-sm font-semibold text-slate-700 mb-2 block'>Email :</label>
                <div className='bg-slate-100 p-2'>
                  <input
                    type='email'
                    placeholder='enter email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full outline-none bg-transparent'
                    required
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full rounded-full font-semibold cursor-pointer disabled:opacity-50'
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>

              <p className='text-center text-slate-600 mt-4'>
                Remember password?{' '}
                <Link to={'/login'} className='text-blue-600 hover:underline font-semibold'>
                  Login
                </Link>
              </p>
            </form>
          )}

          {/* STEP 2: Reset Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <h2 className='text-center font-bold text-xl mb-6'>Reset Password</h2>

              <div className='mb-4'>
                <label className='text-sm font-semibold text-slate-700 mb-2 block'>Reset Code :</label>
                <div className='bg-slate-100 p-2'>
                  <input
                    type='text'
                    placeholder='000000'
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.slice(0, 6))}
                    maxLength='6'
                    className='w-full outline-none bg-transparent text-center tracking-widest'
                    required
                  />
                </div>
              </div>

              <div className='mb-4'>
                <label className='text-sm font-semibold text-slate-700 mb-2 block'>New Password :</label>
                <div className='bg-slate-100 p-2 flex items-center'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='enter new password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full outline-none bg-transparent'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='text-xl'
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className='mb-4'>
                <label className='text-sm font-semibold text-slate-700 mb-2 block'>Confirm Password :</label>
                <div className='bg-slate-100 p-2 flex items-center'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='confirm password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='w-full outline-none bg-transparent'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='text-xl'
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full rounded-full font-semibold cursor-pointer disabled:opacity-50'
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type='button'
                onClick={() => {
                  setStep(1)
                  setEmail('')
                  setResetCode('')
                }}
                className='w-full text-center text-blue-600 hover:underline mt-3 text-sm'
              >
                ← Back to Email
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default ForgotPassword