import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

function Header({ hospitalName, hospitalAddress1, hospitalAddress2, companyName }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const isHomePage = location.pathname === '/'
  const isLoginPage = location.pathname === '/login'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="report-header">
      <div className="header-content">
        <div className="hospital-info">
          <div>
            <h2>{hospitalName || 'Hospital Name'}</h2>
            <p>{hospitalAddress1 || 'Hospital Address'}</p>
          </div>
        </div>
        <div className="company-info">
          <div>
            <p className="company-name">
              <span className="company-name-label">Company Name:</span>
              <span className="company-name-value">{companyName || 'Company Name'}</span>
            </p>
          </div>
        </div>
        <div className="header-actions-right">
          {!isLoginPage && (
            <>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="logout-button" title="Logout">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="login-button" title="Sign In">
                  Sign In
                </Link>
              )}
            </>
          )}
          {!isHomePage && !isLoginPage && (
            <Link to="/" className="home-button" title="Go to Home">
              🏠 Home
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

