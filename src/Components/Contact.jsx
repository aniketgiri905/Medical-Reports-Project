import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Contact.css'

function Contact() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="contact-container">
      <div className="contact-card">
        <div className="contact-header">
          <h1>Contact Administrator</h1>
          <p className="contact-subtitle">Get in touch with the system administrator</p>
        </div>

        <section className="contact-section">
          <div className="section-icon">📧</div>
          <div className="section-content">
            <h2>Administrator Contact Information</h2>
            <p>
              For technical support, system issues, access requests, or general inquiries about
              the Medical Reports Management System, please contact your system administrator.
            </p>
            <div className="info-box">
              <strong>Note:</strong> Contact information is managed by your organization's IT department.
              If you don't have the administrator's contact details, please reach out to your
              IT support team or department head.
            </div>
          </div>
        </section>

        <div className="contact-sections-row">
          <section className="contact-section contact-section-half">
            <div className="section-icon">🔧</div>
            <div className="section-content">
              <h2>Common Support Requests</h2>
              <p>You may need to contact the administrator for:</p>
              <ul className="help-list">
                <li>Account access and authentication issues</li>
                <li>System errors or technical problems</li>
                <li>Data backup and recovery requests</li>
                <li>Feature requests or system improvements</li>
                <li>Training and user guidance</li>
                <li>System configuration changes</li>
                <li>Data export and migration assistance</li>
              </ul>
            </div>
          </section>

          <section className="contact-section contact-section-half">
            <div className="section-icon">📋</div>
            <div className="section-content">
              <h2>Before Contacting</h2>
              <p>
                To help the administrator assist you more effectively, please have the following
                information ready:
              </p>
              <ul className="help-list">
                <li>Description of the issue or request</li>
                <li>Steps to reproduce the problem (if applicable)</li>
                <li>Error messages or screenshots</li>
                <li>Your user account information</li>
                <li>Browser and system information (available in System Information page)</li>
                <li>Date and time when the issue occurred</li>
              </ul>
            </div>
          </section>
        </div>

        <section className="contact-section">
          <div className="section-icon">⚡</div>
          <div className="section-content">
            <h2>Quick Resources</h2>
            <p>Before contacting the administrator, you might find help in these resources:</p>
            <div className="resource-links">
              <Link to="/help" className="resource-link">
                📚 Help & Documentation
              </Link>
              <Link to="/system-info" className="resource-link">
                ℹ️ System Information
              </Link>
            </div>
          </div>
        </section>

        {showScrollTop && (
          <button 
            className="scroll-to-top-btn" 
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  )
}

export default Contact

