import { useParams, useNavigate, Link } from 'react-router-dom'
import './PatientDetails.css'

function PatientDetails({ patients }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = patients.find(p => p.id === id)

  if (!patient) {
    return (
      <div className="patient-details-container">
        <div className="not-found">
          <h2>Patient not found</h2>
          <Link to="/">Back to Patient List</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="patient-details-container">
      <div className="details-header">
        <h1>Patient Medical Report Details</h1>
        <div className="header-actions">
          <button onClick={() => window.print()} className="print-btn">
            Print Report
          </button>
          <Link to={`/edit/${patient.id}`} className="edit-btn">
            Edit Report
          </Link>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to List
          </button>
        </div>
      </div>

      <div className="details-content">
        {/* Patient Information Section */}
        <div className="details-section">
          <h2>Patient Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{patient.patientName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Age:</span>
              <span className="detail-value">{patient.age || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{patient.gender || patient.sex || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Emp ID:</span>
              <span className="detail-value">{patient.empId || patient.empCode || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Certificate Number:</span>
              <span className="detail-value">{patient.certNo || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contractor Name:</span>
              <span className="detail-value">{patient.contractorName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{patient.department || patient.departmentName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contact Number:</span>
              <span className="detail-value">{patient.contactNo || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Medical Report Details Section */}
        <div className="details-section">
          <h2>Medical Report Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Medical Test Date:</span>
              <span className="detail-value">{patient.medicalTestDate || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Certificate No:</span>
              <span className="detail-value">{patient.certNo || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{patient.patientName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Emp Code:</span>
              <span className="detail-value">{patient.empCode || patient.empId || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Age:</span>
              <span className="detail-value">{patient.age || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sex:</span>
              <span className="detail-value">{patient.sex || patient.gender || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Designation:</span>
              <span className="detail-value">{patient.designation || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department Name:</span>
              <span className="detail-value">{patient.departmentName || patient.department || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Physiological Data Section */}
        <div className="details-section">
          <h2>Physiological Data</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Height (cm):</span>
              <span className="detail-value">{patient.height || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Weight (kg):</span>
              <span className="detail-value">{patient.weight || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expected Weight (kg):</span>
              <span className="detail-value">{patient.expectedWeight || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Chest (cm):</span>
              <span className="detail-value">{patient.chest || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">BMI:</span>
              <span className="detail-value">{patient.bmi || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Blood Pressure:</span>
              <span className="detail-value">
                {patient.bpSystolic && patient.bpDiastolic 
                  ? `${patient.bpSystolic}/${patient.bpDiastolic} mmHg`
                  : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Pulse (/min):</span>
              <span className="detail-value">{patient.pulse || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Medical History Section */}
        <div className="details-section">
          <h2>Medical History</h2>
          <div className="history-section">
            <div className="history-subsection">
              <h3>Past Medical History</h3>
              {patient.pastHistory && patient.pastHistory.length > 0 && patient.pastHistory[0] ? (
                <ul className="history-list">
                  {patient.pastHistory.map((item, index) => (
                    item && <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No past medical history recorded</p>
              )}
            </div>
            <div className="history-subsection">
              <h3>Present Medical History</h3>
              {patient.presentHistory && patient.presentHistory.length > 0 && patient.presentHistory[0] ? (
                <ul className="history-list">
                  {patient.presentHistory.map((item, index) => (
                    item && <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No present medical history recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Family History Section */}
        <div className="details-section">
          <h2>Family History</h2>
          <div className="details-grid">
            <div className="detail-item full-width">
              <span className="detail-label">Father:</span>
              <span className="detail-value">
                {patient.fatherHistory?.has 
                  ? (patient.fatherHistory.details || 'Yes') 
                  : 'No'}
              </span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Mother:</span>
              <span className="detail-value">
                {patient.motherHistory?.has 
                  ? (patient.motherHistory.details || 'Yes') 
                  : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Addictions Section */}
        <div className="details-section">
          <h2>Addictions</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Tobacco:</span>
              <span className="detail-value">{patient.tobacco ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Smoking:</span>
              <span className="detail-value">{patient.smoking ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Drinking:</span>
              <span className="detail-value">{patient.drinking ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Allergic To:</span>
              <span className="detail-value">{patient.allergicTo || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Test Results Section */}
        <div className="details-section">
          <h2>Test Results</h2>
          <div className="details-grid">
            <div className="detail-item full-width">
              <span className="detail-label">ECG:</span>
              <span className="detail-value">{patient.ecg || 'N/A'}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">X-Ray:</span>
              <span className="detail-value">{patient.xray || 'N/A'}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Pulmonary Function Test:</span>
              <span className="detail-value">{patient.pulmonaryFunctionTest || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        {patient.remarks && (
          <div className="details-section">
            <h2>Remarks</h2>
            <div className="remarks-content">
              <p>{patient.remarks}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientDetails

