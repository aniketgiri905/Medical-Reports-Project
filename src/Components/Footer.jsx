import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section footer-section-full">
          <h3>Medical Reports Management System</h3>
          <p>Streamlining healthcare documentation with advanced technology</p>
        </div>

            <div className="footer-section footer-links-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/new">Create Report</Link></li>
                <li><Link to="/audiometry">Audiometry Report</Link></li>
                <li><Link to="/letterpad">Prescription Pad</Link></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </div>

        <div className="footer-section footer-support-section">
          <h4>Support</h4>
          <ul>
            <li><Link to="/help">Help & Documentation</Link></li>
            <li><Link to="/contact">Contact Administrator</Link></li>
            <li><Link to="/system-info">System Information</Link></li>
          </ul>
        </div>

        <div className="footer-section footer-section-full">
          <h4>System</h4>
          <p>Version 1.0.0</p>
          <p>© {currentYear} All Rights Reserved</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Medical Reports Management System - Designed for Healthcare Professionals</p>
      </div>
    </footer>
  )
}

export default Footer

