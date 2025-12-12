import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { exportToExcel } from '../utils/helpers'
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

  const handleExportAll = () => {
    if (patients.length === 0) {
      alert('No patients to export')
      return
    }
    exportToExcel(patients, 'all_patients')
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the report for ${name}?`)) {
      onDelete(id)
      setOpenMenuId(null)
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
          <Link to="/new" className="create-new-btn">
            <span className="btn-icon">+</span>
            Create New Report
          </Link>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search by name, emp ID, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {patients.length > 0 && (
            <button onClick={handleExportAll} className="export-btn">
              Export All to Excel
            </button>
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
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Test Date</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr key={patient.id}>
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

