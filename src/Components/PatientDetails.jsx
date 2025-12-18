import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { exportToPDF } from '../utils/helpers'
import './PatientDetails.css'

function PatientDetails({ patients }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const patient = patients.find(p => p.id === id)

  const handleExportPDF = () => {
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
    try {
      exportToPDF(patient)
      toast.success('Patient report exported to PDF successfully!', {
        icon: '📄',
      })
    } catch (error) {
      toast.error('Failed to export PDF. Please try again.', {
        icon: '❌',
      })
    }
  }

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
          <button onClick={handleExportPDF} className="print-btn">
            Export PDF
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
              {/* Medical Conditions */}
              {(patient.pastHypertension === 'Yes' || patient.pastDiabetes === 'Yes' || 
                patient.pastAsthma === 'Yes' || patient.pastChestPain === 'Yes') && (
                <div className="medical-conditions-subsection">
                  <div className="medical-conditions-grid">
                    {patient.pastHypertension === 'Yes' && (
                      <div className="detail-item">
                        <span className="detail-label">Hypertension:</span>
                        <span className="detail-value">Yes</span>
                      </div>
                    )}
                    {patient.pastDiabetes === 'Yes' && (
                      <div className="detail-item">
                        <span className="detail-label">Diabetes:</span>
                        <span className="detail-value">Yes</span>
                      </div>
                    )}
                    {patient.pastAsthma === 'Yes' && (
                      <div className="detail-item">
                        <span className="detail-label">Asthma:</span>
                        <span className="detail-value">Yes</span>
                      </div>
                    )}
                    {patient.pastChestPain === 'Yes' && (
                      <div className="detail-item">
                        <span className="detail-label">Chest Pain:</span>
                        <span className="detail-value">Yes</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {patient.pastHistory && patient.pastHistory.length > 0 && patient.pastHistory[0] ? (
                <ul className="history-list">
                  {patient.pastHistory.map((item, index) => (
                    item && <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                (!patient.pastHypertension || patient.pastHypertension === 'No') &&
                (!patient.pastDiabetes || patient.pastDiabetes === 'No') &&
                (!patient.pastAsthma || patient.pastAsthma === 'No') &&
                (!patient.pastChestPain || patient.pastChestPain === 'No') && (
                  <p className="no-data">No past medical history recorded</p>
                )
              )}
            </div>
            <div className="history-subsection">
              <h3>Present Medical History</h3>
              {/* Medical Conditions */}
              {(patient.presentHypertension === 'Yes' || patient.presentDiabetes === 'Yes' || 
                patient.presentAsthma === 'Yes' || patient.presentChestPain === 'Yes') && (
                <div className="medical-conditions-subsection">
                  <div className="medical-conditions-grid">
                    {patient.presentHypertension === 'Yes' && (
                      <div className="detail-item">
                        <span className="detail-label">Hypertension:</span>
                        <span className="detail-value">Yes</span>
                      </div>
                    )}
                    {patient.presentDiabetes === 'Yes' && (
                      <div className="detail-item">
                        <span className="detail-label">Diabetes:</span>
                        <span className="detail-value">Yes</span>
                      </div>
                    )}
                    {patient.presentAsthma === 'Yes' && (
                      <div className="detail-item">
                        <span className="detail-label">Asthma:</span>
                        <span className="detail-value">Yes</span>
                      </div>
                    )}
                    {patient.presentChestPain === 'Yes' && (
                      <div className="detail-item">
                        <span className="detail-label">Chest Pain:</span>
                        <span className="detail-value">Yes</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {patient.presentHistory && patient.presentHistory.length > 0 && patient.presentHistory[0] ? (
                <ul className="history-list">
                  {patient.presentHistory.map((item, index) => (
                    item && <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                (!patient.presentHypertension || patient.presentHypertension === 'No') &&
                (!patient.presentDiabetes || patient.presentDiabetes === 'No') &&
                (!patient.presentAsthma || patient.presentAsthma === 'No') &&
                (!patient.presentChestPain || patient.presentChestPain === 'No') && (
                  <p className="no-data">No present medical history recorded</p>
                )
              )}
            </div>
          </div>
          
          {/* Family History within Medical History */}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1em', fontWeight: '600' }}>Family History</h3>
            <div className="details-grid">
              <div className="detail-item full-width">
                <span className="detail-label">Father:</span>
                <span className="detail-value">
                  {patient.fatherHistory?.has 
                    ? (patient.fatherHistory.details || 'Yes') 
                    : 'NAD'}
                </span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Mother:</span>
                <span className="detail-value">
                  {patient.motherHistory?.has 
                    ? (patient.motherHistory.details || 'Yes') 
                    : 'NAD'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Systemic Examination within Medical History */}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1em', fontWeight: '600' }}>Systemic Examination</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">CVS:</span>
                <span className="detail-value">{patient.systemicExaminationCVS || 'NAD'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">RS:</span>
                <span className="detail-value">{patient.systemicExaminationRS || 'NAD'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">CNS:</span>
                <span className="detail-value">{patient.systemicExaminationCNS || 'NAD'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">PA:</span>
                <span className="detail-value">{patient.systemicExaminationPA || 'NAD'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Examination Section */}
        <div className="details-section">
          <h2>Vision Examination</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Vision Colour:</span>
              <span className="detail-value">{patient.visionColor || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Vision Distance Right:</span>
              <span className="detail-value">
                {patient.visionDistanceRight1 && patient.visionDistanceRight2 
                  ? `${patient.visionDistanceRight1}/${patient.visionDistanceRight2}`
                  : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Vision Distance Left:</span>
              <span className="detail-value">
                {patient.visionDistanceLeft1 && patient.visionDistanceLeft2 
                  ? `${patient.visionDistanceLeft1}/${patient.visionDistanceLeft2}`
                  : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Vision Near Right:</span>
              <span className="detail-value">
                {patient.visionNearRight1 && patient.visionNearRight2 
                  ? `${patient.visionNearRight1}/${patient.visionNearRight2}`
                  : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Vision Near Left:</span>
              <span className="detail-value">
                {patient.visionNearLeft1 && patient.visionNearLeft2 
                  ? `${patient.visionNearLeft1}/${patient.visionNearLeft2}`
                  : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Glasses:</span>
              <span className="detail-value">{patient.glasses || 'N/A'}</span>
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
            <div className="detail-item full-width">
              <span className="detail-label">Audiometry:</span>
              <span className="detail-value">{patient.audiometry || 'N/A'}</span>
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

        {/* Advice Section */}
        {patient.advice && (
          <div className="details-section">
            <h2>Advice</h2>
            <div className="remarks-content">
              <p>{patient.advice}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientDetails

