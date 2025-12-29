import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './AboutUs.css'

function AboutUs() {
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
    <div className="about-us-container">
      <div className="about-us-card">
        <div className="about-header">
          <h1>About Medical Reports Management System</h1>
          <p className="about-subtitle">Streamlining Healthcare Documentation with Advanced Technology</p>
        </div>
        
        <section className="about-section">
          <div className="section-icon">🎯</div>
          <div className="section-content">
            <h2>Our Mission</h2>
            <p>
              We are dedicated to revolutionizing healthcare documentation by providing a comprehensive, 
              user-friendly medical reports management system that empowers healthcare professionals to 
              efficiently create, manage, and maintain patient records with precision and ease.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="section-icon">💡</div>
          <div className="section-content">
            <h2>What We Offer</h2>
            <p>
              Our Medical Reports Management System is a state-of-the-art platform designed specifically 
              for healthcare institutions and medical professionals. The system simplifies the entire 
              workflow of patient documentation, from initial data entry to comprehensive report generation 
              and archival management.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="section-icon">⚡</div>
          <div className="section-content">
            <h2>Key Features & Capabilities</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>Patient Management</h3>
                <p>Comprehensive patient record creation and management with detailed medical history tracking</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Audiometry Reports</h3>
                <p>Specialized audiometry report generation with interactive charts and graphical representations</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📥</div>
                <h3>Excel Integration</h3>
                <p>Bulk data import and export capabilities with Excel file support for efficient data handling</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📄</div>
                <h3>PDF Export</h3>
                <p>Professional PDF report generation with formatted layouts suitable for medical documentation</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure Access</h3>
                <p>Role-based authentication system ensuring data security and controlled access to sensitive information</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Advanced Search</h3>
                <p>Quick and efficient patient search functionality across multiple data fields</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="section-icon">🎨</div>
          <div className="section-content">
            <h2>Why Choose Our System?</h2>
            <ul className="advantages-list">
              <li>
                <strong>Efficiency:</strong> Streamline your documentation process and reduce administrative overhead
              </li>
              <li>
                <strong>Accuracy:</strong> Minimize errors with structured data entry and automated calculations
              </li>
              <li>
                <strong>Compliance:</strong> Maintain medical record standards and regulatory compliance
              </li>
              <li>
                <strong>Accessibility:</strong> User-friendly interface designed for healthcare professionals of all technical levels
              </li>
              <li>
                <strong>Flexibility:</strong> Customizable settings to match your hospital or clinic's specific requirements
              </li>
              <li>
                <strong>Scalability:</strong> Handle single patient records to bulk operations with equal ease
              </li>
            </ul>
          </div>
        </section>

        <section className="about-section">
          <div className="section-icon">🛠️</div>
          <div className="section-content">
            <h2>Technical Excellence</h2>
            <p>
              Built with modern web technologies and best practices, our system ensures reliability, 
              performance, and a seamless user experience. The platform is designed to handle 
              high-volume data operations while maintaining fast response times and data integrity.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="section-icon">📞</div>
          <div className="section-content">
            <h2>Support & Contact</h2>
            <p>
              For technical support, feature requests, or general inquiries, please contact your system 
              administrator or reach out through the designated support channels. We are committed to 
              providing ongoing support and continuous improvement of our platform.
            </p>
          </div>
        </section>
      </div>
      
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
  )
}

export default AboutUs
