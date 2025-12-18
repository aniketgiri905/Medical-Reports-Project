import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { calculateBMI, calculateExpectedWeight, exportToExcel } from '../utils/helpers'
import './PatientForm.css'

// Reusable Input Component with Checkmark/Pencil Icon
const EditableInput = ({ name, value, onChange, type = 'text', placeholder, required, className = '', ...props }) => {
  const [isEdited, setIsEdited] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleInputChange = (e) => {
    onChange(e)
    const inputValue = e.target.value
    if (inputValue && inputValue.toString().trim() !== '') {
      setIsEdited(true)
      setIsSaved(false)
    } else {
      setIsEdited(false)
      setIsSaved(false)
    }
  }

  const handleSave = () => {
    setIsSaved(true)
    setIsEdited(false)
  }

  const handleEdit = () => {
    setIsSaved(false)
    setIsEdited(true)
  }

  const showCheckmark = isEdited && !isSaved && value && value.toString().trim() !== ''
  const showPencil = isSaved && !isEdited

  const InputComponent = type === 'textarea' ? 'textarea' : 'input'
  const isDisabled = isSaved && !isEdited

  return (
    <div className={`input-with-icon ${type === 'textarea' ? 'textarea-with-icon' : ''}`}>
      <InputComponent
        type={type === 'textarea' ? undefined : type}
        name={name}
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className={className}
        disabled={isDisabled}
        readOnly={isDisabled}
        {...props}
      />
      {showCheckmark && (
        <button
          type="button"
          className="field-action-icon checkmark"
          onClick={handleSave}
          title="Save"
        >
          ✓
        </button>
      )}
      {showPencil && (
        <button
          type="button"
          className="field-action-icon pencil"
          onClick={handleEdit}
          title="Edit"
        >
          ✎
        </button>
      )}
    </div>
  )
}

function PatientForm({ patients, onSave, onBulkSave, settings, onSettingsChange }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const isEdit = !!id
  
  const existingPatient = isEdit ? patients.find(p => p.id === id) : null
  
  // Mode selection: null = not selected, 'import' = excel import, 'manual' = manual entry
  const [entryMode, setEntryMode] = useState(isEdit ? 'manual' : null)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    hospitalName: settings?.hospitalName || 'Hospital Name',
    hospitalAddress1: settings?.hospitalAddress1 || 'Hospital Address Line 1',
    hospitalAddress2: settings?.hospitalAddress2 || 'Hospital Address Line 2',
    companyName: settings?.companyName || 'Company Name',
    patientName: '',
    age: '',
    gender: 'Male',
    sex: 'Male',
    empId: '',
    empCode: '',
    certNo: '',
    contractorName: '',
    department: '',
    departmentName: '',
    designation: '',
    contactNo: '',
    height: '',
    weight: '',
    expectedWeight: '',
    chest: '',
    bmi: '',
    bpSystolic: '',
    bpDiastolic: '',
    pulse: '',
    medicalTestDate: new Date().toISOString().split('T')[0],
    pastHistory: [''],
    presentHistory: [''],
    pastHypertension: 'No',
    pastDiabetes: 'No',
    pastAsthma: 'No',
    pastChestPain: 'No',
    presentHypertension: 'No',
    presentDiabetes: 'No',
    presentAsthma: 'No',
    presentChestPain: 'No',
    fatherHistory: { has: false, details: '' },
    motherHistory: { has: false, details: '' },
    systemicExaminationCVS: 'NAD',
    systemicExaminationRS: 'NAD',
    systemicExaminationCNS: 'NAD',
    systemicExaminationPA: 'NAD',
    visionColor: 'Normal',
    visionDistanceRight1: '6',
    visionDistanceRight2: '6',
    visionDistanceLeft1: '6',
    visionDistanceLeft2: '6',
    visionNearRight1: 'N',
    visionNearRight2: '6',
    visionNearLeft1: 'N',
    visionNearLeft2: '6',
    glasses: 'Without Glasses',
    tobacco: false,
    smoking: false,
    drinking: false,
    allergicTo: '',
    remarks: '',
    advice: '',
    ecg: 'Normal',
    xray: 'Normal',
    pulmonaryFunctionTest: 'Normal',
    audiometry: 'Normal'
  })

  useEffect(() => {
    if (existingPatient) {
      const updatedData = {
        ...existingPatient,
        // Ensure at least one field exists in history arrays
        pastHistory: existingPatient.pastHistory && existingPatient.pastHistory.length > 0 
          ? existingPatient.pastHistory 
          : [''],
        presentHistory: existingPatient.presentHistory && existingPatient.presentHistory.length > 0 
          ? existingPatient.presentHistory 
          : [''],
        // Set default values for medical conditions if not present (backward compatibility)
        pastHypertension: existingPatient.pastHypertension || 'No',
        pastDiabetes: existingPatient.pastDiabetes || 'No',
        pastAsthma: existingPatient.pastAsthma || 'No',
        pastChestPain: existingPatient.pastChestPain || 'No',
        presentHypertension: existingPatient.presentHypertension || 'No',
        presentDiabetes: existingPatient.presentDiabetes || 'No',
        presentAsthma: existingPatient.presentAsthma || 'No',
        presentChestPain: existingPatient.presentChestPain || 'No',
        // Set default values for vision fields if not present
        visionColor: existingPatient.visionColor || 'Normal',
        visionDistanceRight1: existingPatient.visionDistanceRight1 || existingPatient.visionDistanceRight1a || '6',
        visionDistanceRight2: existingPatient.visionDistanceRight2 || existingPatient.visionDistanceRight1b || '6',
        visionDistanceLeft1: existingPatient.visionDistanceLeft1 || existingPatient.visionDistanceLeft1a || '6',
        visionDistanceLeft2: existingPatient.visionDistanceLeft2 || existingPatient.visionDistanceLeft1b || '6',
        visionNearRight1: existingPatient.visionNearRight1 || existingPatient.visionNearRight1a || 'N',
        visionNearRight2: existingPatient.visionNearRight2 || existingPatient.visionNearRight1b || '6',
        visionNearLeft1: existingPatient.visionNearLeft1 || existingPatient.visionNearLeft1a || 'N',
        visionNearLeft2: existingPatient.visionNearLeft2 || existingPatient.visionNearLeft1b || '6',
        glasses: existingPatient.glasses || 'Without Glasses',
        // Set default values for systemic examination fields if not present (backward compatibility)
        systemicExaminationCVS: existingPatient.systemicExaminationCVS || 'NAD',
        systemicExaminationRS: existingPatient.systemicExaminationRS || 'NAD',
        systemicExaminationCNS: existingPatient.systemicExaminationCNS || 'NAD',
        systemicExaminationPA: existingPatient.systemicExaminationPA || 'NAD'
      }
      setFormData(updatedData)
    }
  }, [existingPatient])

  useEffect(() => {
    if (formData.height && formData.weight) {
      const bmi = calculateBMI(parseFloat(formData.height), parseFloat(formData.weight))
      // Calculate Expected Weight based on gender: Male = Height - 100, Female = Height - 105
      const expectedWeight = calculateExpectedWeight(parseFloat(formData.height), formData.gender || formData.sex)
      setFormData(prev => ({ ...prev, bmi: bmi.toFixed(2), expectedWeight: expectedWeight.toFixed(2) }))
    } else if (formData.height) {
      // Calculate Expected Weight based on gender even if weight/BMI is not provided
      const expectedWeight = calculateExpectedWeight(parseFloat(formData.height), formData.gender || formData.sex)
      setFormData(prev => ({ ...prev, expectedWeight: expectedWeight.toFixed(2) }))
    }
  }, [formData.height, formData.weight, formData.bmi, formData.gender, formData.sex])

  // Automatically trigger file input when import mode is selected
  useEffect(() => {
    if (entryMode === 'import' && fileInputRef.current && !isEdit) {
      // Small delay to ensure the input is rendered
      const timer = setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [entryMode, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFamilyHistoryChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: field === 'has' ? value === 'yes' : value
      }
    }))
  }

  const addHistoryItem = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }))
  }

  const updateHistoryItem = (type, index, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }))
  }

  const removeHistoryItem = (type, index) => {
    setFormData(prev => {
      const newArray = prev[type].filter((_, i) => i !== index)
      // Ensure at least one field always remains
      return {
        ...prev,
        [type]: newArray.length > 0 ? newArray : ['']
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isEdit) {
      onSave(id, formData)
    } else {
      onSave(formData)
    }
    navigate('/')
  }

  const handleExcelImport = (e) => {
    if (!isAuthenticated) {
      toast.error('Authentication required to upload Excel files. Redirecting to login...', {
        icon: '🔒',
        duration: 3000,
      })
      e.target.value = '' // Reset file input
      // Smooth transition to login
      setTimeout(() => {
        navigate('/login', { state: { from: { pathname: location.pathname } } })
      }, 500)
      return
    }

    const file = e.target.files[0]
    if (!file) {
      // User cancelled the file dialog - stay in import mode
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        toast.error('No data found in the Excel file')
        return
      }

      // Helper function to convert Excel row to patient data
      const convertRowToPatientData = (row) => {
        return {
          hospitalName: formData.hospitalName,
          hospitalAddress1: formData.hospitalAddress1,
          hospitalAddress2: formData.hospitalAddress2,
          companyName: formData.companyName,
          patientName: row['Patient Name'] || row['Name'] || '',
          age: row['Age'] || '',
          gender: row['Gender'] || row['Sex'] || 'Male',
          sex: row['Sex'] || row['Gender'] || 'Male',
          empId: row['Emp ID'] || row['Emp Id'] || row['Emp Code'] || '',
          empCode: row['Emp Code'] || row['Emp ID'] || row['Emp Id'] || '',
          certNo: row['Certificate Number'] || row['Certificate No'] || row['CERT. NO'] || row['Cert No'] || '',
          contractorName: row['Contractor Name'] || '',
          department: row['Department'] || row['Department Name'] || '',
          departmentName: row['Department Name'] || row['Department'] || '',
          designation: row['Designation'] || '',
          contactNo: row['Contact Number'] || row['Contact No'] || row['Contact No.'] || '',
          height: row['Height (cm)'] || row['Height'] || '',
          weight: row['Weight (kg)'] || row['Weight'] || '',
          bmi: row['BMI'] || (row['Height (cm)'] && row['Weight (kg)'] ? calculateBMI(parseFloat(row['Height (cm)']), parseFloat(row['Weight (kg)'])).toFixed(2) : '') || (row['Height'] && row['Weight'] ? calculateBMI(parseFloat(row['Height']), parseFloat(row['Weight'])).toFixed(2) : ''),
          expectedWeight: row['Expected Weight (kg)'] || row['Expected Weight'] || ((row['Height (cm)'] || row['Height']) && (row['Gender'] || row['Sex']) ? calculateExpectedWeight(parseFloat(row['Height (cm)'] || row['Height']), row['Gender'] || row['Sex']).toFixed(2) : ''),
          chest: row['Chest (cm)'] || row['Chest'] || '',
          bpSystolic: row['B.P. Systolic (mmHg)'] || row['B.P. Systolic'] || row['B.P(systolic)'] || row['BP Systolic'] || row['B.P Systolic'] || '',
          bpDiastolic: row['B.P. Diastolic (mmHg)'] || row['B.P. Diastolic'] || row['B.P(diastolic)'] || row['BP Diastolic'] || row['B.P Diastolic'] || '',
          pulse: row['Pulse (/min)'] || row['Pulse (/min'] || row['PULSE'] || row['Pulse'] || '',
          medicalTestDate: row['Medical Test Date'] || new Date().toISOString().split('T')[0],
          pastHistory: row['Past History'] ? (typeof row['Past History'] === 'string' ? row['Past History'].split(';').map(h => h.trim()).filter(h => h) : ['']) : [''],
          presentHistory: row['Present History'] ? (typeof row['Present History'] === 'string' ? row['Present History'].split(';').map(h => h.trim()).filter(h => h) : ['']) : [''],
          pastHypertension: row['Past Hypertension'] || 'No',
          pastDiabetes: row['Past Diabetes'] || 'No',
          pastAsthma: row['Past Asthma'] || 'No',
          pastChestPain: row['Past Chest Pain'] || 'No',
          presentHypertension: row['Present Hypertension'] || 'No',
          presentDiabetes: row['Present Diabetes'] || 'No',
          presentAsthma: row['Present Asthma'] || 'No',
          presentChestPain: row['Present Chest Pain'] || 'No',
          fatherHistory: { 
            has: row['Father History'] && row['Father History'] !== 'No' ? true : false, 
            details: row['Father History'] && row['Father History'] !== 'No' ? row['Father History'] : '' 
          },
          motherHistory: { 
            has: row['Mother History'] && row['Mother History'] !== 'No' ? true : false, 
            details: row['Mother History'] && row['Mother History'] !== 'No' ? row['Mother History'] : '' 
          },
          systemicExaminationCVS: row['Systemic Examination CVS'] || row['CVS'] || 'NAD',
          systemicExaminationRS: row['Systemic Examination RS'] || row['RS'] || 'NAD',
          systemicExaminationCNS: row['Systemic Examination CNS'] || row['CNS'] || 'NAD',
          systemicExaminationPA: row['Systemic Examination PA'] || row['PA'] || 'NAD',
          visionColor: row['Vision Color'] || row['Vision Colour'] || '',
          visionDistanceRight1: row['Vision Distance Right 1'] || (row['Vision Distance Right'] ? row['Vision Distance Right'].toString().split('/')[0] : '') || '6',
          visionDistanceRight2: row['Vision Distance Right 2'] || (row['Vision Distance Right'] ? row['Vision Distance Right'].toString().split('/')[1] : '') || '6',
          visionDistanceLeft1: row['Vision Distance Left 1'] || (row['Vision Distance Left'] ? row['Vision Distance Left'].toString().split('/')[0] : '') || '6',
          visionDistanceLeft2: row['Vision Distance Left 2'] || (row['Vision Distance Left'] ? row['Vision Distance Left'].toString().split('/')[1] : '') || '6',
          visionNearRight1: row['Vision Near Right 1'] || (row['Vision Near Right'] ? row['Vision Near Right'].toString().split('/')[0] : '') || 'N',
          visionNearRight2: row['Vision Near Right 2'] || (row['Vision Near Right'] ? row['Vision Near Right'].toString().split('/')[1] : '') || '6',
          visionNearLeft1: row['Vision Near Left 1'] || (row['Vision Near Left'] ? row['Vision Near Left'].toString().split('/')[0] : '') || 'N',
          visionNearLeft2: row['Vision Near Left 2'] || (row['Vision Near Left'] ? row['Vision Near Left'].toString().split('/')[1] : '') || '6',
          glasses: row['Glasses'] || 'Without Glasses',
          tobacco: row['Tobacco'] === 'Yes' || row['Tobacco'] === true,
          smoking: row['Smoking'] === 'Yes' || row['Smoking'] === true,
          drinking: row['Drinking'] === 'Yes' || row['Drinking'] === true,
          allergicTo: row['ALLERGIC TO'] || row['Allergic To'] || '',
          remarks: row['Remarks'] || '',
          advice: row['Advice'] || '',
          ecg: row['ECG'] || 'Normal',
          xray: row['X RAY CHEST'] || row['X-Ray'] || 'Normal',
          pulmonaryFunctionTest: row['PULMONARY FUNCTION TEST'] || row['PFT'] || row['Pulmonary Function Test'] || 'Normal',
          audiometry: row['Audiometry'] || row['AUDIOMETRY'] || 'Normal'
        }
      }

      if (jsonData.length === 1) {
        // Single row - fill the form
        const row = jsonData[0]
        const patientData = convertRowToPatientData(row)
        setFormData(prev => ({ ...prev, ...patientData }))
        setEntryMode('manual') // Switch to manual mode to show the form
        toast.success('Patient data imported successfully! You can now review and submit the form.')
      } else {
        // Multiple rows - import all as separate patients
        const confirmImport = window.confirm(
          `Found ${jsonData.length} patient records in the Excel file. Do you want to import all of them?`
        )
        
        if (confirmImport) {
          let importedCount = 0
          let skippedCount = 0
          const newPatients = []
          const baseTime = Date.now()
          
          jsonData.forEach((row, index) => {
            // Skip rows without at least a name
            if (!row['Patient Name'] && !row['Name']) {
              skippedCount++
              return
            }
            
            const patientData = convertRowToPatientData(row)
            
            // Create new patient record with unique ID
            const newPatient = {
              ...patientData,
              id: (baseTime + index).toString(),
              createdAt: new Date().toISOString()
            }
            
            newPatients.push(newPatient)
            importedCount++
          })
          
          // Add all patients at once using bulk save if available, otherwise add them one by one
          if (newPatients.length > 0) {
            if (onBulkSave) {
              // Use bulk save function if available
              onBulkSave(newPatients)
              toast.success(`Successfully imported ${importedCount} patient record(s). ${skippedCount > 0 ? `${skippedCount} row(s) skipped (missing patient name).` : ''}`)
              navigate('/')
            } else {
              // Fallback: add them one by one with state updates
              newPatients.forEach((patient) => {
                onSave(patient)
              })
              toast.success(`Successfully imported ${importedCount} patient record(s). ${skippedCount > 0 ? `${skippedCount} row(s) skipped (missing patient name).` : ''}`)
              navigate('/')
            }
          } else {
            toast.error('No valid patient records found to import.')
          }
        }
      }
      
      // Reset file input
      e.target.value = ''
    }
    reader.readAsArrayBuffer(file)
  }

  const handleSettingsChange = (field, value) => {
    const newSettings = { ...settings, [field]: value }
    onSettingsChange(newSettings)
    setFormData(prev => ({ ...prev, [field]: value }))
  }


  // Show mode selection if not in edit mode and no mode selected
  if (!isEdit && entryMode === null) {
    return (
      <div className="patient-form-container">
        <div className="mode-selection-container">
          <h1>Create New Medical Report</h1>
          <p className="mode-selection-subtitle">Choose how you would like to add patient information</p>
          <div className="mode-selection-cards">
            <div 
              className="mode-card"
              onClick={() => setEntryMode('import')}
            >
              <div className="mode-icon">📊</div>
              <h2>Import from Excel</h2>
              <p>Upload an Excel file with patient data to automatically fill the form</p>
            </div>
            <div 
              className="mode-card"
              onClick={() => setEntryMode('manual')}
            >
              <div className="mode-icon">✍️</div>
              <h2>Enter Details Manually</h2>
              <p>Fill out the form step by step with patient information</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="patient-form-container">
      <form onSubmit={handleSubmit} className="patient-form">
        {entryMode === 'import' && (
          <div className="import-section-container print-hide">
            <div className="import-section-header">
              <h2>Import from Excel</h2>
              <button 
                type="button"
                className="back-to-selection-btn"
                onClick={() => setEntryMode(null)}
              >
                ← Change Method
              </button>
            </div>
            <div className="import-section-content">
              {!isAuthenticated ? (
                <div className="upload-disabled-message">
                  <div className="lock-icon">🔒</div>
                  <p className="disabled-text">Please sign in to upload Excel files</p>
                  <button 
                    type="button"
                    className="signin-prompt-btn"
                    onClick={() => navigate('/login', { state: { from: { pathname: location.pathname } } })}
                  >
                    Sign In to Continue
                  </button>
                </div>
              ) : (
                <>
                  <label className="file-upload-btn">
                    Choose Excel File
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".xlsx,.xls" 
                      onChange={handleExcelImport}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p className="import-help-text">Select an Excel file (.xlsx or .xls) containing patient data</p>
                </>
              )}
            </div>
          </div>
        )}
        
        {entryMode === 'manual' && !isEdit && (
          <div className="form-actions-top print-hide">
            <button 
              type="button"
              className="back-to-selection-btn"
              onClick={() => setEntryMode(null)}
            >
              ← Change Method
            </button>
          </div>
        )}

        <div className="form-section print-hide">
          <h2>Hospital & Company Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Hospital Name</label>
              <input 
                type="text" 
                value={formData.hospitalName}
                onChange={(e) => handleSettingsChange('hospitalName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input 
                type="text" 
                value={formData.companyName}
                onChange={(e) => handleSettingsChange('companyName', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Hospital Address</label>
              <input 
                type="text" 
                value={formData.hospitalAddress1}
                onChange={(e) => handleSettingsChange('hospitalAddress1', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Patient Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Name <span className="required-asterisk">*</span></label>
              <input 
                type="text" 
                name="patientName" 
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Age <span className="required-asterisk">*</span></label>
              <input 
                type="number" 
                name="age" 
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender <span className="required-asterisk">*</span></label>
              <select 
                name="gender" 
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Emp ID</label>
              <input 
                type="text" 
                name="empId" 
                value={formData.empId}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Certificate Number</label>
              <input 
                type="text" 
                name="certNo" 
                value={formData.certNo}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Contractor Name</label>
              <input 
                type="text" 
                name="contractorName" 
                value={formData.contractorName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input 
                type="text" 
                name="department" 
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input 
                type="tel" 
                name="contactNo" 
                value={formData.contactNo}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>


        <div className="form-section">
          <h2>Physiological Data</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Height (cm) <span className="required-asterisk">*</span></label>
              <input 
                type="number" 
                name="height" 
                value={formData.height}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Weight (kg) <span className="required-asterisk">*</span></label>
              <input 
                type="number" 
                name="weight" 
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Expected Weight (kg)</label>
              <input 
                type="number" 
                name="expectedWeight" 
                value={formData.expectedWeight}
                readOnly
                disabled
                className="readonly"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Chest (cm)</label>
              <input 
                type="number" 
                name="chest" 
                value={formData.chest}
                onChange={handleChange}
                step="0.1"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>BMI</label>
              <input 
                type="text" 
                name="bmi" 
                value={formData.bmi}
                readOnly
                className="readonly"
              />
            </div>
            <div className="form-group">
              <label>B.P. Systolic (mmHg)</label>
              <input 
                type="number" 
                name="bpSystolic" 
                value={formData.bpSystolic}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>B.P. Diastolic (mmHg)</label>
              <input 
                type="number" 
                name="bpDiastolic" 
                value={formData.bpDiastolic}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Pulse (/min)</label>
              <input 
                type="number" 
                name="pulse" 
                value={formData.pulse}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Medical History</h2>
          <div className="history-container">
            <div className="history-column">
              <h3>Past Medical History</h3>
              
              {/* Medical Conditions - Yes/No dropdowns */}
              <div className="medical-conditions-section">
                <div className="conditions-grid">
                  <div className="condition-item">
                    <label>Hypertension</label>
                    <select 
                      name="pastHypertension"
                      value={formData.pastHypertension}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="condition-item">
                    <label>Diabetes</label>
                    <select 
                      name="pastDiabetes"
                      value={formData.pastDiabetes}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="condition-item">
                    <label>Asthma</label>
                    <select 
                      name="pastAsthma"
                      value={formData.pastAsthma}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="condition-item">
                    <label>Chest Pain</label>
                    <select 
                      name="pastChestPain"
                      value={formData.pastChestPain}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="history-items-list">
                {formData.pastHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <EditableInput 
                      type="text" 
                      name={`pastHistory_${index}`}
                      value={item}
                      onChange={(e) => updateHistoryItem('pastHistory', index, e.target.value)}
                      placeholder="Enter past medical history"
                    />
                    {formData.pastHistory.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeHistoryItem('pastHistory', index)}
                        className="remove-btn"
                        title="Remove this item"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => addHistoryItem('pastHistory')}
                className="add-more-btn"
              >
                + Add More
              </button>
            </div>
            <div className="history-column">
              <h3>Present Medical History</h3>
              
              {/* Medical Conditions - Yes/No dropdowns */}
              <div className="medical-conditions-section">
                <div className="conditions-grid">
                  <div className="condition-item">
                    <label>Hypertension</label>
                    <select 
                      name="presentHypertension"
                      value={formData.presentHypertension}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="condition-item">
                    <label>Diabetes</label>
                    <select 
                      name="presentDiabetes"
                      value={formData.presentDiabetes}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="condition-item">
                    <label>Asthma</label>
                    <select 
                      name="presentAsthma"
                      value={formData.presentAsthma}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="condition-item">
                    <label>Chest Pain</label>
                    <select 
                      name="presentChestPain"
                      value={formData.presentChestPain}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="history-items-list">
                {formData.presentHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <EditableInput 
                      type="text" 
                      name={`presentHistory_${index}`}
                      value={item}
                      onChange={(e) => updateHistoryItem('presentHistory', index, e.target.value)}
                      placeholder="Enter present medical history"
                    />
                    {formData.presentHistory.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeHistoryItem('presentHistory', index)}
                        className="remove-btn"
                        title="Remove this item"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => addHistoryItem('presentHistory')}
                className="add-more-btn"
              >
                + Add More
              </button>
            </div>
          </div>
          
          {/* Family History within Medical History */}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1em', fontWeight: '600', color: '#2c3e50' }}>Family History</h3>
            <div className="family-history-container" style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap' }}>
              <div className="family-history-item">
                <label className="family-history-label">Father</label>
                <select 
                  value={formData.fatherHistory.has ? 'yes' : 'no'}
                  onChange={(e) => handleFamilyHistoryChange('fatherHistory', 'has', e.target.value)}
                  className="family-history-select"
                >
                  <option value="yes">Yes</option>
                  <option value="no">NAD</option>
                </select>
                {formData.fatherHistory.has && (
                  <div className="family-history-details">
                    <label className="family-details-label">Details</label>
                    <EditableInput
                      type="text"
                      name="fatherHistoryDetails"
                      value={formData.fatherHistory.details}
                      onChange={(e) => handleFamilyHistoryChange('fatherHistory', 'details', e.target.value)}
                      placeholder="Enter father's medical history details"
                      className="family-history-input"
                    />
                  </div>
                )}
              </div>
              <div className="family-history-item">
                <label className="family-history-label">Mother</label>
                <select 
                  value={formData.motherHistory.has ? 'yes' : 'no'}
                  onChange={(e) => handleFamilyHistoryChange('motherHistory', 'has', e.target.value)}
                  className="family-history-select"
                >
                  <option value="yes">Yes</option>
                  <option value="no">NAD</option>
                </select>
                {formData.motherHistory.has && (
                    <div className="family-history-details">
                      <label className="family-details-label">Details</label>
                      <EditableInput
                        type="text"
                        name="motherHistoryDetails"
                        value={formData.motherHistory.details}
                        onChange={(e) => handleFamilyHistoryChange('motherHistory', 'details', e.target.value)}
                        placeholder="Enter mother's medical history details"
                        className="family-history-input"
                      />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Systemic Examination within Medical History */}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1em', fontWeight: '600', color: '#2c3e50' }}>Systemic Examination</h3>
            <div className="systemic-examination-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div className="systemic-examination-item">
                <label className="systemic-examination-label">CVS</label>
                <EditableInput
                  type="text"
                  name="systemicExaminationCVS"
                  value={formData.systemicExaminationCVS}
                  onChange={handleChange}
                  placeholder="NAD"
                  className="systemic-examination-input"
                />
              </div>
              <div className="systemic-examination-item">
                <label className="systemic-examination-label">RS</label>
                <EditableInput
                  type="text"
                  name="systemicExaminationRS"
                  value={formData.systemicExaminationRS}
                  onChange={handleChange}
                  placeholder="NAD"
                  className="systemic-examination-input"
                />
              </div>
              <div className="systemic-examination-item">
                <label className="systemic-examination-label">CNS</label>
                <EditableInput
                  type="text"
                  name="systemicExaminationCNS"
                  value={formData.systemicExaminationCNS}
                  onChange={handleChange}
                  placeholder="NAD"
                  className="systemic-examination-input"
                />
              </div>
              <div className="systemic-examination-item">
                <label className="systemic-examination-label">PA</label>
                <EditableInput
                  type="text"
                  name="systemicExaminationPA"
                  value={formData.systemicExaminationPA}
                  onChange={handleChange}
                  placeholder="NAD"
                  className="systemic-examination-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Vision Examination</h2>
          <div className="vision-examination-container">
            <div className="form-group">
              <label>Vision Colour</label>
              <input
                type="text"
                name="visionColor"
                value={formData.visionColor}
                onChange={handleChange}
                placeholder="Enter vision color (e.g., Normal)"
              />
            </div>
            <div className="form-group">
              <label>Glasses</label>
              <select
                name="glasses"
                value={formData.glasses}
                onChange={handleChange}
              >
                <option value="With Glasses">With Glasses</option>
                <option value="Without Glasses">Without Glasses</option>
              </select>
            </div>
            <div className="vision-group">
              <label>Vision Distance Right</label>
              <div className="vision-two-fields">
                <input
                  type="text"
                  name="visionDistanceRight1"
                  value={formData.visionDistanceRight1}
                  onChange={handleChange}
                  placeholder="6"
                  className="vision-small-field"
                />
                <span className="vision-separator">/</span>
                <input
                  type="text"
                  name="visionDistanceRight2"
                  value={formData.visionDistanceRight2}
                  onChange={handleChange}
                  placeholder="6"
                  className="vision-small-field"
                />
              </div>
            </div>
            <div className="vision-group">
              <label>Vision Distance Left</label>
              <div className="vision-two-fields">
                <input
                  type="text"
                  name="visionDistanceLeft1"
                  value={formData.visionDistanceLeft1}
                  onChange={handleChange}
                  placeholder="6"
                  className="vision-small-field"
                />
                <span className="vision-separator">/</span>
                <input
                  type="text"
                  name="visionDistanceLeft2"
                  value={formData.visionDistanceLeft2}
                  onChange={handleChange}
                  placeholder="6"
                  className="vision-small-field"
                />
              </div>
            </div>
            <div className="vision-group">
              <label>Vision Near Right</label>
              <div className="vision-two-fields">
                <input
                  type="text"
                  name="visionNearRight1"
                  value={formData.visionNearRight1}
                  onChange={handleChange}
                  placeholder="N"
                  className="vision-small-field"
                />
                <span className="vision-separator">/</span>
                <input
                  type="text"
                  name="visionNearRight2"
                  value={formData.visionNearRight2}
                  onChange={handleChange}
                  placeholder="6"
                  className="vision-small-field"
                />
              </div>
            </div>
            <div className="vision-group">
              <label>Vision Near Left</label>
              <div className="vision-two-fields">
                <input
                  type="text"
                  name="visionNearLeft1"
                  value={formData.visionNearLeft1}
                  onChange={handleChange}
                  placeholder="N"
                  className="vision-small-field"
                />
                <span className="vision-separator">/</span>
                <input
                  type="text"
                  name="visionNearLeft2"
                  value={formData.visionNearLeft2}
                  onChange={handleChange}
                  placeholder="6"
                  className="vision-small-field"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Addictions</h2>
          <div className="addictions-container">
            <div className="addictions-checkboxes">
              <label className="addiction-checkbox-label">
              <span className="addiction-label-text">Tobacco</span>
                <input 
                  type="checkbox" 
                  name="tobacco" 
                  checked={formData.tobacco}
                  onChange={handleChange}
                  className="addiction-checkbox"
                />
                
              </label>
              <label className="addiction-checkbox-label">
              <span className="addiction-label-text">Smoking</span>
                <input 
                  type="checkbox" 
                  name="smoking" 
                  checked={formData.smoking}
                  onChange={handleChange}
                  className="addiction-checkbox"
                />
                
              </label>
              <label className="addiction-checkbox-label">
              <span className="addiction-label-text">Drinking</span>
                <input 
                  type="checkbox" 
                  name="drinking" 
                  checked={formData.drinking}
                  onChange={handleChange}
                  className="addiction-checkbox"
                />
                
              </label>
            </div>
            <div className="form-group allergies-input-group">
              <label className="allergies-label">Allergic To</label>
              <EditableInput 
                type="text" 
                name="allergicTo" 
                value={formData.allergicTo}
                onChange={handleChange}
                placeholder="Enter allergies if any"
                className="allergies-input"
              />
            </div>
          </div>
        </div>        

        <div className="form-section">
          <h2>Electrocardiogram (E.C.G)</h2>
          <div className="form-group test-feilds">
            <textarea 
              name="ecg" 
              value={formData.ecg}
              onChange={handleChange}
              placeholder="Enter ECG summary"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>X-Ray Chest</h2>
          <div className="form-group test-feilds">
            <EditableInput 
              type="textarea"
              name="xray" 
              value={formData.xray}
              onChange={handleChange}
              placeholder="Enter X-Ray summary"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Pulmonary Function Test</h2>
          <div className="form-group test-feilds">
            <EditableInput 
              type="textarea"
              name="pulmonaryFunctionTest" 
              value={formData.pulmonaryFunctionTest}
              onChange={handleChange}
              placeholder="Enter PFT results (e.g., Test within normal limits)"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Audiometry</h2>
          <div className="form-group test-feilds">
            <EditableInput 
              type="textarea"
              name="audiometry" 
              value={formData.audiometry}
              onChange={handleChange}
              placeholder="Enter Audiometry results"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Remarks</h2>
          <div className="form-group remarks-feilds">
            <EditableInput 
              type="textarea"
              name="remarks" 
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter any additional remarks or notes"
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Advice</h2>
          <div className="form-group remarks-feilds">
            <EditableInput 
              type="textarea"
              name="advice" 
              value={formData.advice}
              onChange={handleChange}
              placeholder="Enter medical advice"
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions print-hide">
          <button type="submit">{isEdit ? 'Update Report' : 'Save Report'}</button>
          <button type="button" onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default PatientForm

