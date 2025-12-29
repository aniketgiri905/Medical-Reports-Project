import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

function Header({ hospitalName, hospitalAddress1, hospitalAddress2, companyName }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const isHomePage = location.pathname === '/'
  const isLoginPage = location.pathname === '/login'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

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
        <div className="header-actions-right" ref={menuRef}>
          {/* Hamburger Menu Button (Mobile Only) */}
          {!isLoginPage && (
            <button 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}

          {/* Desktop Buttons */}
          <div className="desktop-buttons">
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
            {!isLoginPage && (
              <Link to="/about" className="about-button" title="About Us">
                About Us
              </Link>
            )}
            {!isHomePage && !isLoginPage && (
              <Link to="/" className="home-button" title="Go to Home">
                🏠 Home
              </Link>
            )}
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && !isLoginPage && (
            <div className="mobile-menu">
              {!isHomePage && (
                <Link to="/" className="mobile-menu-item" onClick={closeMobileMenu}>
                  🏠 Home
                </Link>
              )}
              <Link to="/about" className="mobile-menu-item" onClick={closeMobileMenu}>
                About Us
              </Link>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="mobile-menu-item mobile-logout" title="Logout">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="mobile-menu-item" onClick={closeMobileMenu}>
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

