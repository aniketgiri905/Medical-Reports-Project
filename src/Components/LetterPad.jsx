import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import './LetterPad.css'

function LetterPad() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const letterPadRef = useRef(null)
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

  const [letterPadData, setLetterPadData] = useState({
    hospitalName: '',
    doctorName: '',
    doctorDegree: '',
    doctorSpecialist: '',
    address: '',
    patientName: '',
    patientAge: '',
    date: '',
    weight: '',
    height: '',
    gender: ''
  })

  const handleChange = (e) => {
    const { name, value, type } = e.target

    // Prevent negative values for numeric fields
    if (type === 'number') {
      if (value === '-' || (value !== '' && parseFloat(value) < 0)) {
        return
      }
    }

    setLetterPadData(prev => ({
      ...prev,
      [name]: value
    }))
  }


  const handleExportPDF = async () => {
    if (!isAuthenticated) {
      toast.error('Authentication required to export PDF files. Redirecting to login...', {
        icon: '🔒',
        duration: 3000,
      })
      setTimeout(() => {
        navigate('/login', { state: { from: { pathname: location.pathname } } })
      }, 1000)
      return
    }

    // Validate mandatory fields
    if (!letterPadData.hospitalName.trim() || !letterPadData.doctorName.trim() || !letterPadData.address.trim()) {
      toast.error('Please fill all mandatory fields (Hospital Name, Doctor Name, and Address)', {
        icon: '⚠️',
        duration: 3000,
      })
      return
    }

    if (!letterPadRef.current) {
      toast.error('Unable to generate PDF. Preview element not found.', { duration: 3000 })
      return
    }

    try {
      toast.loading('Generating PDF...')

      const canvas = await html2canvas(letterPadRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.width
      const pageHeight = pdf.internal.pageSize.height
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // If content fits on one page, add it directly
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      } else {
        // If content is taller than one page, add new pages
        let heightLeft = imgHeight
        let position = 0

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        // Only add pages if there's significant content left (more than 5mm)
        while (heightLeft > 5) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }
      }

      const fileName = `Letter_Pad_${letterPadData.patientName || 'Document'}_${Date.now()}.pdf`
      pdf.save(fileName)

      toast.dismiss()
      toast.success('PDF generated successfully!')
    } catch (error) {
      toast.dismiss()
      toast.error('Unable to generate PDF. Please try again.')
      console.error('PDF Generation Error:', error)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all fields?')) {
      setLetterPadData({
        hospitalName: '',
        doctorName: '',
        doctorDegree: '',
        doctorSpecialist: '',
        address: '',
        patientName: '',
        patientAge: '',
        date: '',
        weight: '',
        height: '',
        gender: ''
      })
      toast.success('Form reset successfully!')
    }
  }

  return (
    <div className="letterpad-container">
      <div className="letterpad-header-actions">
        <h1>Prescription Pad</h1>
        <div className="header-buttons">
          <button onClick={handleExportPDF} className="btn-primary">
            📄 Export PDF
          </button>
          <button onClick={handleReset} className="btn-secondary">
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="letterpad-main-content">
        {/* Hidden preview section for PDF generation - always A4 size */}
        <div className="letterpad-data-section" ref={letterPadRef}>
            {/* Header Section with Hospital and Doctor Info */}
            <div className="letterpad-header-section">
              <div className="letterpad-header-content">
                {/* Left Side - Hospital */}
                <div className="letterpad-header-left">
                  <div className="letterpad-hospital-name">{letterPadData.hospitalName || 'Hospital Name'}</div>
                  <div className="letterpad-hospital-address">{letterPadData.address}</div>
                </div>

                {/* Right Side - Doctor */}
                <div className="letterpad-header-right">
                  <div className="letterpad-doctor-name">Dr. {letterPadData.doctorName || 'Doctor Name'}</div>
                  <div className="letterpad-doctor-degree">{letterPadData.doctorDegree}</div>
                </div>
              </div>
            </div>

            {/* Patient Information Fields */}
            <div className="letterpad-patient-fields">
              <div className="letterpad-field-row">
                <div className="letterpad-field-item">
                  <span className="letterpad-field-label">Patient Name:</span>
                  <span className="letterpad-field-line">{letterPadData.patientName}</span>
                </div>
                <div className="letterpad-field-item">
                  <span className="letterpad-field-label">Date:</span>
                  <span className="letterpad-field-line">
                    {letterPadData.date ? new Date(letterPadData.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : ''}
                  </span>
                </div>
              </div>
              <div className="letterpad-field-row">
                <div className="letterpad-field-item">
                  <span className="letterpad-field-label">Age:</span>
                  <span className="letterpad-field-line">{letterPadData.patientAge}</span>
                </div>
                <div className="letterpad-field-item">
                  <span className="letterpad-field-label">Gender:</span>
                  <span className="letterpad-field-line">{letterPadData.gender}</span>
                </div>
                <div className="letterpad-field-item">
                  <span className="letterpad-field-label">Height:</span>
                  <span className="letterpad-field-line">{letterPadData.height ? `${letterPadData.height} cm` : ''}</span>
                </div>
                <div className="letterpad-field-item">
                  <span className="letterpad-field-label">Weight:</span>
                  <span className="letterpad-field-line">{letterPadData.weight ? `${letterPadData.weight} kg` : ''}</span>
                </div>
              </div>
            </div>

            {/* Prescription Area */}
            <div className="letterpad-prescription-wrapper">
              <div className="letterpad-prescription-area">
                <div className="letterpad-prescription-lines"></div>
              </div>
            </div>

            {/* Signature */}
            <div className="letterpad-signature-section">
              <div className="letterpad-signature-line"></div>
              <p className="letterpad-signature-label">Signature</p>
            </div>
        </div>

        <div className="letterpad-form-sections">
          <div className="letterpad-form-section">
            <h2>Letter Pad Information</h2>
            <div className="letterpad-form-grid">
              <div className="letterpad-form-group">
                <label>Hospital Name <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  name="hospitalName"
                  value={letterPadData.hospitalName}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              <div className="letterpad-form-group">
                <label>Doctor Name <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  name="doctorName"
                  value={letterPadData.doctorName}
                  onChange={handleChange}
                  placeholder="Enter doctor name"
                  required
                />
              </div>

              <div className="letterpad-form-group">
                <label>Doctor Degree</label>
                <input
                  type="text"
                  name="doctorDegree"
                  value={letterPadData.doctorDegree}
                  onChange={handleChange}
                  placeholder="e.g., MBBS, MD, MS"
                />
              </div>

              <div className="letterpad-form-group">
                <label>Doctor Specialist</label>
                <input
                  type="text"
                  name="doctorSpecialist"
                  value={letterPadData.doctorSpecialist}
                  onChange={handleChange}
                  placeholder="e.g., Cardiologist, Neurologist"
                />
              </div>

              <div className="letterpad-form-group letterpad-form-group-full">
                <label>Address <span className="required-asterisk">*</span></label>
                <textarea
                  name="address"
                  value={letterPadData.address}
                  onChange={handleChange}
                  placeholder="Enter hospital/clinic address"
                  rows="3"
                  required
                />
              </div>
            </div>
          </div>

          <div className="letterpad-form-section">
            <h2>Patient Information</h2>
            <div className="letterpad-form-grid">
              <div className="letterpad-form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={letterPadData.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                />
              </div>

              <div className="letterpad-form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="patientAge"
                  value={letterPadData.patientAge}
                  onChange={handleChange}
                  placeholder="Enter age"
                  min="0"
                />
              </div>

              <div className="letterpad-form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={letterPadData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="letterpad-form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={letterPadData.weight}
                  onChange={handleChange}
                  placeholder="Enter weight"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="letterpad-form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={letterPadData.height}
                  onChange={handleChange}
                  placeholder="Enter height"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="letterpad-form-group">
                <label>Gender</label>
                <input
                  type="text"
                  name="gender"
                  value={letterPadData.gender}
                  onChange={handleChange}
                  placeholder="Enter gender"
                />
              </div>
            </div>
          </div>
        </div>
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

export default LetterPad

