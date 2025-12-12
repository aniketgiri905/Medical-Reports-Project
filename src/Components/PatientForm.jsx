import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { calculateBMI, exportToExcel } from '../utils/helpers'
import './PatientForm.css'

function PatientForm({ patients, onSave, onBulkSave, settings, onSettingsChange }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  
  const existingPatient = isEdit ? patients.find(p => p.id === id) : null

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
    fatherHistory: { has: true, details: '' },
    motherHistory: { has: true, details: '' },
    tobacco: false,
    smoking: false,
    drinking: false,
    allergicTo: '',
    remarks: '',
    ecg: '',
    xray: '',
    pulmonaryFunctionTest: ''
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
          : ['']
      }
      setFormData(updatedData)
    }
  }, [existingPatient])

  useEffect(() => {
    if (formData.height && formData.weight) {
      const bmi = calculateBMI(parseFloat(formData.height), parseFloat(formData.weight))
      setFormData(prev => ({ ...prev, bmi: bmi.toFixed(2) }))
    }
  }, [formData.height, formData.weight])

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
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        alert('No data found in the Excel file')
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
          height: row['Height'] || '',
          weight: row['Weight'] || '',
          expectedWeight: row['Expected Weight'] || '',
          chest: row['Chest'] || '',
          bmi: row['BMI'] || (row['Height'] && row['Weight'] ? calculateBMI(parseFloat(row['Height']), parseFloat(row['Weight'])).toFixed(2) : ''),
          bpSystolic: row['B.P(systolic)'] || row['BP Systolic'] || '',
          bpDiastolic: row['B.P(diastolic)'] || row['BP Diastolic'] || '',
          pulse: row['PULSE'] || row['Pulse'] || '',
          medicalTestDate: row['Medical Test Date'] || new Date().toISOString().split('T')[0],
          pastHistory: row['Past History'] ? (typeof row['Past History'] === 'string' ? row['Past History'].split(';').map(h => h.trim()).filter(h => h) : ['']) : [''],
          presentHistory: row['Present History'] ? (typeof row['Present History'] === 'string' ? row['Present History'].split(';').map(h => h.trim()).filter(h => h) : ['']) : [''],
          fatherHistory: { 
            has: row['Father History'] && row['Father History'] !== 'No' ? true : false, 
            details: row['Father History'] && row['Father History'] !== 'No' ? row['Father History'] : '' 
          },
          motherHistory: { 
            has: row['Mother History'] && row['Mother History'] !== 'No' ? true : false, 
            details: row['Mother History'] && row['Mother History'] !== 'No' ? row['Mother History'] : '' 
          },
          tobacco: row['Tobacco'] === 'Yes' || row['Tobacco'] === true,
          smoking: row['Smoking'] === 'Yes' || row['Smoking'] === true,
          drinking: row['Drinking'] === 'Yes' || row['Drinking'] === true,
          allergicTo: row['ALLERGIC TO'] || row['Allergic To'] || '',
          remarks: row['Remarks'] || '',
          ecg: row['ECG'] || '',
          xray: row['X RAY CHEST'] || row['X-Ray'] || '',
          pulmonaryFunctionTest: row['PULMONARY FUNCTION TEST'] || row['PFT'] || ''
        }
      }

      if (jsonData.length === 1) {
        // Single row - fill the form
        const row = jsonData[0]
        const patientData = convertRowToPatientData(row)
        setFormData(prev => ({ ...prev, ...patientData }))
        alert('Patient data imported successfully!')
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
              alert(`Successfully imported ${importedCount} patient record(s). ${skippedCount > 0 ? `${skippedCount} row(s) skipped (missing patient name).` : ''}`)
              navigate('/')
            } else {
              // Fallback: add them one by one with state updates
              newPatients.forEach((patient) => {
                onSave(patient)
              })
              alert(`Successfully imported ${importedCount} patient record(s). ${skippedCount > 0 ? `${skippedCount} row(s) skipped (missing patient name).` : ''}`)
              navigate('/')
            }
          } else {
            alert('No valid patient records found to import.')
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


  return (
    <div className="patient-form-container">
      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-actions-top print-hide">
          <label className="file-upload-btn">
            Import from Excel
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleExcelImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>

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
              <label>Hospital Address Line 1</label>
              <input 
                type="text" 
                value={formData.hospitalAddress1}
                onChange={(e) => handleSettingsChange('hospitalAddress1', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Hospital Address Line 2</label>
              <input 
                type="text" 
                value={formData.hospitalAddress2}
                onChange={(e) => handleSettingsChange('hospitalAddress2', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Patient Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                name="patientName" 
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input 
                type="number" 
                name="age" 
                value={formData.age}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select 
                name="gender" 
                value={formData.gender}
                onChange={handleChange}
              >
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
          <h2>MEDICAL REPORTS 2025</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Medical Test Date</label>
              <input 
                type="date" 
                name="medicalTestDate" 
                value={formData.medicalTestDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Certificate No</label>
              <input 
                type="text" 
                name="certNo" 
                value={formData.certNo}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                name="patientName" 
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Emp Code</label>
              <input 
                type="text" 
                name="empCode" 
                value={formData.empCode}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input 
                type="number" 
                name="age" 
                value={formData.age}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Sex</label>
              <select 
                name="sex" 
                value={formData.sex}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input 
                type="text" 
                name="designation" 
                value={formData.designation}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Department Name</label>
              <input 
                type="text" 
                name="departmentName" 
                value={formData.departmentName}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Physiological Data</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Height (cm)</label>
              <input 
                type="number" 
                name="height" 
                value={formData.height}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input 
                type="number" 
                name="weight" 
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Expected Weight (kg)</label>
              <input 
                type="number" 
                name="expectedWeight" 
                value={formData.expectedWeight}
                onChange={handleChange}
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
              <div className="history-items-list">
                {formData.pastHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <input 
                      type="text" 
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
              <div className="history-items-list">
                {formData.presentHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <input 
                      type="text" 
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
        </div>

        <div className="form-section">
          <h2>Family History</h2>
          <div className="family-history-container">
            <div className="family-history-item">
              <label className="family-history-label">Father</label>
              <select 
                value={formData.fatherHistory.has ? 'yes' : 'no'}
                onChange={(e) => handleFamilyHistoryChange('fatherHistory', 'has', e.target.value)}
                className="family-history-select"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {formData.fatherHistory.has && (
                <div className="family-history-details">
                  <label className="family-details-label">Details</label>
                  <input
                    type="text"
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
                <option value="no">No</option>
              </select>
              {formData.motherHistory.has && (
                <div className="family-history-details">
                  <label className="family-details-label">Details</label>
                  <input
                    type="text"
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
              <input 
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
          <div className="form-group">
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
          <div className="form-group">
            <textarea 
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
          <div className="form-group">
            <textarea 
              name="pulmonaryFunctionTest" 
              value={formData.pulmonaryFunctionTest}
              onChange={handleChange}
              placeholder="Enter PFT results (e.g., Test within normal limits)"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Remarks</h2>
          <div className="form-group">
            <textarea 
              name="remarks" 
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter any additional remarks or notes"
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

