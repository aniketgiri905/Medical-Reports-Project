import './Header.css'

function Header({ hospitalName, hospitalAddress1, hospitalAddress2, companyName }) {
  return (
    <header className="report-header">
      <div className="header-content">
        <div className="hospital-info">
          <div>
            <h2>{hospitalName || 'Hospital Name'}</h2>
            <p>{hospitalAddress1 || 'Hospital Address Line 1'}</p>
            <p>{hospitalAddress2 || 'Hospital Address Line 2'}</p>
          </div>
        </div>
        <div className="company-info">
          <div>
            <p className="company-name">Company Name:</p>
            <h2>{companyName || 'Company Name'}</h2>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

