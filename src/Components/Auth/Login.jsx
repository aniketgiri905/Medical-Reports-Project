import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'
import '../Header.css'

const VALID_CREDENTIALS = [
  {
    username: 'adityagoswami',
    password: 'Aditya@2002'
  },
  {
    username: 'aniket',
    password: 'aniket'
  }
]

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!username || !password) {
      toast.error('Please enter username and password')
      return
    }

    setLoading(true)

    setTimeout(() => {
      const isValid = VALID_CREDENTIALS.some(
        cred => cred.username === username && cred.password === password
      )
      
      if (isValid) {
        login()
        toast.success('Login successful')
        navigate(from, { replace: true })
      } else {
        toast.error('Invalid username or password')
        setLoading(false)
      }
    }, 800)
  }

  useEffect(() => {
    document.body.classList.add('login-bg')
    return () => document.body.classList.remove('login-bg')
  }, [])

  return (
    <div className="login-container">
      <div className="login-card">
        <Link to="/" className="home-button" title="Go to Home">
          🏠 Home
        </Link>
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="info-text">
            Contact administrator for access if you do not have login credentials.
        </p>
      </div>
    </div>
  )
}

export default Login;
