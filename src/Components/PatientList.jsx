import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { exportToExcel, exportAllToPDF } from '../utils/helpers'
import './PatientList.css'

// Actions Menu Component with Portal
function ActionsMenu({ patientId, isOpen, onToggle, onEdit, onDelete }) {
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const buttonRect = buttonRef.current.getBoundingClientRect()
          setMenuPosition({
            top: buttonRect.bottom + 4,
            right: window.innerWidth - buttonRect.right
          })
        }
      }
      
      updatePosition()
      
      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  return (
    <div className="actions-menu-container">
      <button 
        ref={buttonRef}
        className="actions-menu-btn"
        onClick={onToggle}
        aria-label="Actions"
      >
        <span>⋯</span>
      </button>
      {isOpen && createPortal(
        <div 
          ref={menuRef}
          className="actions-menu"
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
          }}
        >
          <button 
            className="menu-item edit-item"
            onClick={onEdit}
          >
            <span className="menu-item-icon">✏️</span>
            Edit
          </button>
          <button 
            className="menu-item delete-item"
            onClick={onDelete}
          >
            <span className="menu-item-icon">🗑️</span>
            Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}

function PatientList({ patients, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const filteredPatients = patients.filter(patient => 
    patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.empId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contactNo?.includes(searchTerm)
  )

  // Sort patients by Test Date (latest first) - descending order
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const dateA = a.medicalTestDate ? new Date(a.medicalTestDate) : new Date(0)
    const dateB = b.medicalTestDate ? new Date(b.medicalTestDate) : new Date(0)
    // Sort in descending order (latest first)
    return dateB - dateA
  })

  const handleExportAll = () => {
    if (!isAuthenticated) {
      toast.error('Authentication required to export Excel files. Redirecting to login...', {
        icon: '🔒',
        duration: 3000,
      })
      setTimeout(() => {
        navigate('/login', { state: { from: { pathname: location.pathname } } })
      }, 500)
      return
    }
    if (patients.length === 0) {
      toast.error('No patient records found to export', {
        icon: '📋',
      })
      return
    }
    try {
      exportToExcel(patients, 'all_patients')
      toast.success(`Successfully exported ${patients.length} patient record(s) to Excel!`, {
        icon: '📊',
      })
    } catch (error) {
      toast.error('Failed to export Excel file. Please try again.', {
        icon: '❌',
      })
    }
  }

  const handleExportAllPDF = () => {
    if (!isAuthenticated) {
      toast.error('Authentication required to export PDF files. Redirecting to login...', {
        icon: '🔒',
        duration: 3000,
      })
      setTimeout(() => {
        navigate('/login', { state: { from: { pathname: location.pathname } } })
      }, 500)
      return
    }
    if (patients.length === 0) {
      toast.error('No patient records found to export', {
        icon: '📋',
      })
      return
    }
    try {
      exportAllToPDF(patients)
      toast.success(`Successfully exported ${patients.length} patient report(s) to PDF!`, {
        icon: '📄',
      })
    } catch (error) {
      toast.error('Failed to export PDF files. Please try again.', {
        icon: '❌',
      })
    }
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the report for ${name}?`)) {
      onDelete(id)
      setOpenMenuId(null)
      toast.success(`Patient report for ${name} deleted successfully`)
    }
  }

  const handleEdit = (id) => {
    navigate(`/edit/${id}`)
    setOpenMenuId(null)
  }

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.actions-menu-container') && !e.target.closest('.actions-menu')) {
        setOpenMenuId(null)
      }
    }

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

  return (
    <div className="patient-list-container">
      <div className="list-header">
        <div className="header-title-section">
          <h1>Medical Reports Management</h1>
          {patients.length > 0 && (
            <Link to="/new" className="create-new-btn">
              <span className="btn-icon">+</span>
              Create New Report
            </Link>
          )}
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search by name, emp ID, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Link to="/audiometry" className="audiometry-btn">
            Audiometry Report
          </Link>
          {patients.length > 0 && (
            <>
              <button onClick={handleExportAllPDF} className="export-btn pdf-export-btn">
                Export All to PDF
              </button>
              <button onClick={handleExportAll} className="export-btn">
                Export All to Excel
              </button>
            </>
          )}
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <p>No patients found matching "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')}>Clear Search</button>
            </>
          ) : (
            <>
              <p>No medical reports yet.</p>
              <Link to="/new" className="create-btn">
                Create First Report
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="patients-table">
            <thead>
              <tr>
                <th className="sr-no-column">Sr.No.</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Test Date</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map((patient, index) => (
                <tr key={patient.id}>
                  <td className="sr-no-cell">{index + 1}</td>
                  <td>
                    <Link to={`/patient/${patient.id}`} className="patient-name-link">
                      {patient.patientName || 'Unnamed Patient'}
                    </Link>
                  </td>
                  <td>{patient.age || 'N/A'}</td>
                  <td>{patient.gender || patient.sex || 'N/A'}</td>
                  <td>{patient.contactNo || 'N/A'}</td>
                  <td>{patient.medicalTestDate || 'N/A'}</td>
                  <td className="actions-cell">
                    <ActionsMenu
                      patientId={patient.id}
                      isOpen={openMenuId === patient.id}
                      onToggle={() => toggleMenu(patient.id)}
                      onEdit={() => handleEdit(patient.id)}
                      onDelete={() => handleDelete(patient.id, patient.patientName)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PatientList

