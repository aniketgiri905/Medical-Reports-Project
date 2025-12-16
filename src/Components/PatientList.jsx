import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { exportToExcel, exportAllToPDF } from '../utils/helpers'
import './PatientList.css'

function PatientList({ patients, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const navigate = useNavigate()

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
    if (patients.length === 0) {
      toast.error('No patients to export')
      return
    }
    exportToExcel(patients, 'all_patients')
    toast.success('Patients exported successfully!')
  }

  const handleExportAllPDF = () => {
    if (patients.length === 0) {
      toast.error('No patients to export')
      return
    }
    try {
      exportAllToPDF(patients)
      toast.success(`All ${patients.length} patient reports exported to PDF successfully!`)
    } catch (error) {
      toast.error('Error exporting PDFs: ' + error.message)
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
      if (!e.target.closest('.actions-menu-container')) {
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
                    <div className="actions-menu-container">
                      <button 
                        className="actions-menu-btn"
                        onClick={() => toggleMenu(patient.id)}
                        aria-label="Actions"
                      >
                        <span>⋯</span>
                      </button>
                      {openMenuId === patient.id && (
                        <div className="actions-menu">
                          <button 
                            className="menu-item edit-item"
                            onClick={() => handleEdit(patient.id)}
                          >
                            Edit
                          </button>
                          <button 
                            className="menu-item delete-item"
                            onClick={() => handleDelete(patient.id, patient.patientName)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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

