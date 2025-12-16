import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header({ hospitalName, hospitalAddress1, hospitalAddress2, companyName }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

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
        {!isHomePage && (
          <Link to="/" className="home-button" title="Go to Home">
            🏠 Home
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header

