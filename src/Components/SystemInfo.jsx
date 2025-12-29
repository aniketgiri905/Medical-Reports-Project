import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './SystemInfo.css'

function SystemInfo() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const [systemData, setSystemData] = useState({
    userAgent: '',
    platform: '',
    screenResolution: '',
    browserVersion: '',
    browserName: '',
    language: '',
    timezone: '',
    cookiesEnabled: false,
    localStorageEnabled: false,
    onlineStatus: false
  })

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    handleResize() // Initial size

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    // Get browser information
    const userAgent = navigator.userAgent
    const platform = navigator.platform || 'Unknown'
    const screenResolution = `${window.screen.width}x${window.screen.height}`
    const language = navigator.language || 'Unknown'
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'
    const cookiesEnabled = navigator.cookieEnabled
    const localStorageEnabled = typeof(Storage) !== 'undefined'
    const onlineStatus = navigator.onLine

    // Detect browser name and version
    let browserName = 'Unknown'
    let browserVersion = 'Unknown'

    if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox'
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown'
    } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
      browserName = 'Chrome'
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown'
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      browserName = 'Safari'
      browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown'
    } else if (userAgent.indexOf('Edg') > -1) {
      browserName = 'Edge'
      browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown'
    }

    setSystemData({
      userAgent,
      platform,
      screenResolution,
      browserVersion,
      browserName,
      language,
      timezone,
      cookiesEnabled,
      localStorageEnabled,
      onlineStatus
    })
  }, [])

  const getStorageSize = () => {
    if (!systemData.localStorageEnabled) return 'Not Available'
    
    try {
      let total = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
      return `${(total / 1024).toFixed(2)} KB`
    } catch (e) {
      return 'Unknown'
    }
  }

  return (
    <div className="system-info-container">
      <div className="system-info-card">
        <div className="system-info-header">
          <h1>System Information</h1>
          <p className="system-info-subtitle">Technical details and system specifications</p>
        </div>

        <section className="system-info-section">
          <div className="section-icon">🖥️</div>
          <div className="section-content">
            <h2>Application Information</h2>
            <div className="info-grid">
              <div className="info-item info-item-full-text">
                <span className="info-label">Application Name:</span>
                <span className="info-value">Medical Reports Management System</span>
              </div>
              <div className="info-item">
                <span className="info-label">Version:</span>
                <span className="info-value">1.0.0</span>
              </div>
              <div className="info-item">
                <span className="info-label">Release Date:</span>
                <span className="info-value">2024</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value status-active">● Active</span>
              </div>
            </div>
          </div>
        </section>

        <section className="system-info-section">
          <div className="section-icon">🌐</div>
          <div className="section-content">
            <h2>Browser Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Browser:</span>
                <span className="info-value">{systemData.browserName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Browser Version:</span>
                <span className="info-value">{systemData.browserVersion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Platform:</span>
                <span className="info-value">{systemData.platform}</span>
              </div>
              <div className="info-item full-width-item">
                <span className="info-label">User Agent:</span>
                <span className="info-value info-value-small" title={systemData.userAgent || ''}>
                  {systemData.userAgent || 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="system-info-section">
          <div className="section-icon">📱</div>
          <div className="section-content">
            <h2>Display Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Screen Resolution:</span>
                <span className="info-value">{systemData.screenResolution}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Window Size:</span>
                <span className="info-value">
                  {windowSize.width > 0 ? `${windowSize.width}x${windowSize.height}` : 'Calculating...'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Color Depth:</span>
                <span className="info-value">{window.screen.colorDepth} bits</span>
              </div>
              <div className="info-item">
                <span className="info-label">Pixel Ratio:</span>
                <span className="info-value">{window.devicePixelRatio || 1}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="system-info-section">
          <div className="section-icon">⚙️</div>
          <div className="section-content">
            <h2>System Capabilities</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Cookies Enabled:</span>
                <span className={`info-value ${systemData.cookiesEnabled ? 'status-success' : 'status-error'}`}>
                  {systemData.cookiesEnabled ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Local Storage:</span>
                <span className={`info-value ${systemData.localStorageEnabled ? 'status-success' : 'status-error'}`}>
                  {systemData.localStorageEnabled ? '✓ Available' : '✗ Not Available'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Storage Used:</span>
                <span className="info-value">{getStorageSize()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Online Status:</span>
                <span className={`info-value ${systemData.onlineStatus ? 'status-success' : 'status-error'}`}>
                  {systemData.onlineStatus ? '● Online' : '● Offline'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="system-info-section">
          <div className="section-icon">🌍</div>
          <div className="section-content">
            <h2>Regional Settings</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Language:</span>
                <span className="info-value">{systemData.language}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Timezone:</span>
                <span className="info-value">{systemData.timezone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Date:</span>
                <span className="info-value">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Time:</span>
                <span className="info-value">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="system-info-section">
          <div className="section-icon">💾</div>
          <div className="section-content">
            <h2>Data Storage & Privacy</h2>
            <p>
              The Medical Reports Management System stores data locally in your browser using
              LocalStorage technology. This means:
            </p>
            <ul className="help-list">
              <li>All patient records are stored locally on your device</li>
              <li>No data is transmitted to external servers</li>
              <li>Your data is private and secure</li>
              <li>Data persists between browser sessions</li>
              <li>You can export data to Excel or PDF for backup</li>
            </ul>
            <div className="warning-box">
              <strong>Important:</strong> Clearing your browser's cache or local storage will
              remove all stored patient data. Always maintain regular backups by exporting
              your data to Excel or PDF files.
            </div>
          </div>
        </section>

        <section className="system-info-section">
          <div className="section-icon">📋</div>
          <div className="section-content">
            <h2>Browser Compatibility</h2>
            <p>
              This application is optimized for modern web browsers. Recommended browsers include:
            </p>
            <ul className="compatibility-list">
              <li>
                <strong>Google Chrome</strong> - Version 90 or higher (Recommended)
              </li>
              <li>
                <strong>Mozilla Firefox</strong> - Version 88 or higher
              </li>
              <li>
                <strong>Microsoft Edge</strong> - Version 90 or higher
              </li>
              <li>
                <strong>Safari</strong> - Version 14 or higher
              </li>
            </ul>
            <div className="info-box">
              <strong>Note:</strong> For the best experience, please ensure JavaScript is enabled
              and your browser is up to date.
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

export default SystemInfo
