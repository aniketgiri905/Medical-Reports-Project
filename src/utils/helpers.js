import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const calculateBMI = (height, weight) => {
  if (!height || !weight || height <= 0 || weight <= 0) return 0
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

export const calculateExpectedWeight = (height, gender) => {
  if (!height || height <= 0) return 0
  const genderLower = (gender || '').toLowerCase()
  if (genderLower === 'female' || genderLower === 'f') {
    return height - 105
  }
  // Default to Male formula
  return height - 100
}

// Core function to generate PDF content for a patient
// Can work with an existing doc instance (for multi-patient export) or create a new one
const generatePatientPDFContent = (patientData, existingDoc = null, startNewPage = false) => {
  // Use existing doc or create new one
  const doc = existingDoc || new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 12
  let yPos = margin
  const lineHeight = 5.5
  const sectionSpacing = 3
  const maxY = pageHeight - margin

  // If using existing doc and starting new page, add page and reset position
  if (existingDoc && startNewPage) {
    doc.addPage()
    yPos = margin
    doc.setTextColor(0, 0, 0)
    doc.setDrawColor(0, 0, 0)
  }

  // Helper: Check and add new page if needed
  const checkPageBreak = (requiredSpace = lineHeight) => {
    if (yPos + requiredSpace > maxY) {
      doc.addPage()
      yPos = margin
      // Reset colors for new page
      doc.setTextColor(0, 0, 0)
      doc.setDrawColor(0, 0, 0)
    }
  }

  // Helper: Add key-value pair on single line
  const addKeyValue = (key, value, xPos = margin, maxWidth = null) => {
    checkPageBreak(lineHeight + 1)
    doc.setTextColor(0, 0, 0) // Black text
    doc.setFontSize(11)
    
    const label = `${key}: `
    const textValue = String(value || 'N/A')
    
    // Label in bold
    doc.setFont(undefined, 'bold')
    const actualLabelWidth = doc.getTextWidth(label)
    // Minimum label width: 140px ≈ 37mmyy
    const minLabelWidth = 37
    const labelWidth = Math.max(actualLabelWidth, minLabelWidth)
    
    doc.text(label, xPos, yPos)
    
    // Value in normal weight - positioned after minimum label width
    doc.setFont(undefined, 'normal')
    const valueX = xPos + labelWidth
    const availableWidth = maxWidth ? maxWidth - labelWidth : pageWidth - valueX - margin
    
    // Handle text wrapping if value is too long
    const valueLines = doc.splitTextToSize(textValue, availableWidth)
    doc.text(valueLines, valueX, yPos)
    
    // Update yPos for next line - reduced spacing
    yPos += valueLines.length * lineHeight + 0.3
  }

  // Helper: Add two key-value pairs side by side
  const addTwoKeyValues = (key1, value1, key2, value2) => {
    const col1X = margin
    const col2X = (pageWidth / 2) + 10
    const colWidth = (pageWidth / 2) - 20
    
    checkPageBreak(lineHeight + 1)
    const startY = yPos
    
    // Minimum label width: 140px ≈ 37mm
    const minLabelWidth = 37
    
    // Draw first key-value
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    const label1 = `${key1}: `
    const textValue1 = String(value1 || 'N/A')
    doc.setFont(undefined, 'bold')
    const actualLabelWidth1 = doc.getTextWidth(label1)
    const labelWidth1 = Math.max(actualLabelWidth1, minLabelWidth)
    doc.text(label1, col1X, yPos)
    doc.setFont(undefined, 'normal')
    const valueX1 = col1X + labelWidth1
    const availableWidth1 = colWidth - labelWidth1
    const valueLines1 = doc.splitTextToSize(textValue1, availableWidth1)
    doc.text(valueLines1, valueX1, yPos)
    const height1 = valueLines1.length * lineHeight + 1
    
    // Draw second key-value at same y position
    yPos = startY
    const label2 = `${key2}: `
    const textValue2 = String(value2 || 'N/A')
    doc.setFont(undefined, 'bold')
    const actualLabelWidth2 = doc.getTextWidth(label2)
    const labelWidth2 = Math.max(actualLabelWidth2, minLabelWidth)
    doc.text(label2, col2X, yPos)
    doc.setFont(undefined, 'normal')
    const valueX2 = col2X + labelWidth2
    const availableWidth2 = colWidth - labelWidth2
    const valueLines2 = doc.splitTextToSize(textValue2, availableWidth2)
    doc.text(valueLines2, valueX2, yPos)
    const height2 = valueLines2.length * lineHeight + 1
    
    // Advance yPos by maximum height - reduced spacing
    yPos = startY + Math.max(height1, height2) - 0.3
  }

  // Helper: Add section header
  const addSectionHeader = (title) => {
    checkPageBreak(sectionSpacing + lineHeight + 3)
    // Consistent spacing before header
    yPos += sectionSpacing
    const headerStartY = yPos
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    // Convert title to uppercase
    doc.text(title.toUpperCase(), margin, yPos)
    yPos += lineHeight + 0.3 // Gap between header and underline
    
    // Add underline
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    const underlineY = yPos - 1
    doc.line(margin, underlineY, pageWidth - margin, underlineY)
    
    // Add more spacing after underline (gap between line and content below)
    yPos = underlineY + sectionSpacing + 1.5
  }

  // ========== HEADER SECTION ==========
  // Hospital Name in RED - CENTERED
  doc.setFontSize(24)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(255, 0, 0) // Red color
  doc.text(patientData.hospitalName || 'Hospital Name', pageWidth / 2, yPos, { align: 'center' })
  yPos += lineHeight + 0.7

  // Hospital Address in BLACK - CENTERED (only first line)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  if (patientData.hospitalAddress1) {
    doc.text(patientData.hospitalAddress1, pageWidth / 2, yPos, { align: 'center' })
    yPos += lineHeight
  }

  // Company Name - LEFT ALIGNED with larger value in CAPITAL LETTERS
  if (patientData.companyName) {
    yPos += 1 // Reduced gap
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0, 0, 0)
    const labelText = 'Company Name: '
    doc.text(labelText, margin, yPos)
    const labelWidth = doc.getTextWidth(labelText)
    // Company name value in larger, bold font - UPPERCASE
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text(patientData.companyName.toUpperCase(), margin + labelWidth, yPos)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(11) // Reset font size
    yPos += lineHeight + 0.3 // Reduced gap before next section
  }

  yPos += sectionSpacing - 1.5 // Reduced gap between company name and patient information

  // ========== PATIENT INFORMATION SECTION ==========
  addSectionHeader('Patient Information')
  
  const col1X = margin
  const col2X = (pageWidth / 2) + 10
  const colWidth = (pageWidth / 2) - 20

  addTwoKeyValues('Name', patientData.patientName, 'Age', patientData.age)
  addTwoKeyValues('Gender', patientData.gender || patientData.sex, 'Emp ID', patientData.empId || patientData.empCode)
  addTwoKeyValues('Certificate Number', patientData.certNo, 'Contractor Name', patientData.contractorName)
  addTwoKeyValues('Department', patientData.department || patientData.departmentName, 'Contact Number', patientData.contactNo)

  // ========== PHYSIOLOGICAL DATA SECTION ==========
  addSectionHeader('Physiological Data')

  addTwoKeyValues('Height (CM)', patientData.height, 'Weight (KG)', patientData.weight)
  addTwoKeyValues('Expected Weight (KG)', patientData.expectedWeight, 'Chest (CM)', patientData.chest)
  addTwoKeyValues('BMI', patientData.bmi, 'BPSystolic', patientData.bpSystolic || 'N/A')
  addTwoKeyValues('BPDiastolic', patientData.bpDiastolic || 'N/A', 'Pulse (/MIN)', patientData.pulse)

  // ========== MEDICAL HISTORY SECTION ==========
  addSectionHeader('Medical History')

  // Past Medical History
  const pastConditions = []
  if (patientData.pastHypertension === 'Yes') pastConditions.push('Hypertension')
  if (patientData.pastDiabetes === 'Yes') pastConditions.push('Diabetes')
  if (patientData.pastAsthma === 'Yes') pastConditions.push('Asthma')
  if (patientData.pastChestPain === 'Yes') pastConditions.push('Chest Pain')
  const pastHistoryItems = (patientData.pastHistory || []).filter(i => i && i.trim())
  const pastHistoryList = [...pastConditions, ...pastHistoryItems]

  // Present Medical History
  const presentConditions = []
  if (patientData.presentHypertension === 'Yes') presentConditions.push('Hypertension')
  if (patientData.presentDiabetes === 'Yes') presentConditions.push('Diabetes')
  if (patientData.presentAsthma === 'Yes') presentConditions.push('Asthma')
  if (patientData.presentChestPain === 'Yes') presentConditions.push('Chest Pain')
  const presentHistoryItems = (patientData.presentHistory || []).filter(i => i && i.trim())
  const presentHistoryList = [...presentConditions, ...presentHistoryItems]

  // Sub-headings
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('Past Medical History', col1X, yPos)
  doc.text('Present Medical History', col2X, yPos)
  yPos += lineHeight + 1.5

  // Content - Past History
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  const pastStartY = yPos
  let pastLines = []
  if (pastHistoryList.length > 0) {
    const pastText = pastHistoryList.join('; ')
    pastLines = doc.splitTextToSize(pastText, colWidth)
    doc.text(pastLines, col1X, yPos)
  } else {
    doc.setFont(undefined, 'italic')
    doc.setTextColor(128, 128, 128)
    doc.text('No past medical history recorded', col1X, yPos)
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')
    pastLines = ['No past medical history recorded']
  }

  // Content - Present History
  yPos = pastStartY
  let presentLines = []
  if (presentHistoryList.length > 0) {
    const presentText = presentHistoryList.join('; ')
    presentLines = doc.splitTextToSize(presentText, colWidth)
    doc.text(presentLines, col2X, yPos)
  } else {
    doc.setFont(undefined, 'italic')
    doc.setTextColor(128, 128, 128)
    doc.text('No present medical history recorded', col2X, yPos)
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')
    presentLines = ['No present medical history recorded']
  }

  // Move to bottom of tallest column
  const maxLines = Math.max(pastLines.length, presentLines.length)
  yPos = pastStartY + (maxLines * lineHeight) + 2

  // Family History within Medical History section
  checkPageBreak(lineHeight + 3)
  yPos += 2 // Add spacing before family history
  doc.setFont(undefined, 'bold')
  doc.setFontSize(11)
  doc.text('Family History', col1X, yPos)
  yPos += lineHeight + 1

  const fatherValue = patientData.fatherHistory?.has 
    ? (patientData.fatherHistory.details || 'Yes') 
    : 'NAD'
  const motherValue = patientData.motherHistory?.has 
    ? (patientData.motherHistory.details || 'Yes') 
    : 'NAD'

  addTwoKeyValues('Father', fatherValue, 'Mother', motherValue)

  // ========== VISION EXAMINATION SECTION ==========
  addSectionHeader('Vision Examination')

  // Vision fields - single pair format (e.g., 6/6)
  const visionDistanceRight = (patientData.visionDistanceRight1 && patientData.visionDistanceRight2)
    ? `${patientData.visionDistanceRight1}/${patientData.visionDistanceRight2}`
    : 'N/A'
  const visionDistanceLeft = (patientData.visionDistanceLeft1 && patientData.visionDistanceLeft2)
    ? `${patientData.visionDistanceLeft1}/${patientData.visionDistanceLeft2}`
    : 'N/A'
  const visionNearRight = (patientData.visionNearRight1 && patientData.visionNearRight2)
    ? `${patientData.visionNearRight1}/${patientData.visionNearRight2}`
    : 'N/A'
  const visionNearLeft = (patientData.visionNearLeft1 && patientData.visionNearLeft2)
    ? `${patientData.visionNearLeft1}/${patientData.visionNearLeft2}`
    : 'N/A'

  addTwoKeyValues('Vision Colour', patientData.visionColor || 'N/A', 'Glasses', patientData.glasses || 'N/A')
  addTwoKeyValues('Vision Distance Right', visionDistanceRight, 'Vision Distance Left', visionDistanceLeft)
  addTwoKeyValues('Vision Near Right', visionNearRight, 'Vision Near Left', visionNearLeft)

  // ========== ADDICTIONS SECTION ==========
  addSectionHeader('Addictions')

  addTwoKeyValues('Tobacco', patientData.tobacco ? 'Yes' : 'No', 'Smoking', patientData.smoking ? 'Yes' : 'No')
  addTwoKeyValues('Drinking', patientData.drinking ? 'Yes' : 'No', 'Allergic To', patientData.allergicTo || 'No')

  // ========== SPECIALIZED TEST SECTION ==========
  addSectionHeader('Specialized Test')
  
  // ECG, X-Ray Chest, and Pulmonary Function Test in single line with 33.33% width each
  checkPageBreak(lineHeight + 1)
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  
  const colWidthTest = (pageWidth - 2 * margin) / 3
  const col1TestX = margin
  const col2TestX = margin + colWidthTest
  const col3TestX = margin + (colWidthTest * 2)
  
  // ECG
  const ecgLabel = 'ECG: '
  const ecgValue = String(patientData.ecg || 'N/A')
  doc.setFont(undefined, 'bold')
  doc.text(ecgLabel, col1TestX, yPos)
  const ecgLabelWidth = doc.getTextWidth(ecgLabel)
  doc.setFont(undefined, 'normal')
  doc.text(ecgValue, col1TestX + ecgLabelWidth, yPos)
  
  // X-Ray Chest
  const xrayLabel = 'X-Ray Chest: '
  const xrayValue = String(patientData.xray || 'N/A')
  doc.setFont(undefined, 'bold')
  doc.text(xrayLabel, col2TestX, yPos)
  const xrayLabelWidth = doc.getTextWidth(xrayLabel)
  doc.setFont(undefined, 'normal')
  doc.text(xrayValue, col2TestX + xrayLabelWidth, yPos)
  
  // Pulmonary Function Test
  const pftLabel = 'PFT: '
  const pftValue = String(patientData.pulmonaryFunctionTest || 'N/A')
  doc.setFont(undefined, 'bold')
  doc.text(pftLabel, col3TestX, yPos)
  const pftLabelWidth = doc.getTextWidth(pftLabel)
  doc.setFont(undefined, 'normal')
  const pftAvailableWidth = colWidthTest - pftLabelWidth
  const pftLines = doc.splitTextToSize(pftValue, pftAvailableWidth)
  doc.text(pftLines, col3TestX + pftLabelWidth, yPos)
  
  yPos += Math.max(lineHeight, pftLines.length * lineHeight) + 0.3

  // Audiometry - 50% width (below PFT)
  checkPageBreak(lineHeight + 1)
  const audiometryColWidth = (pageWidth - 2 * margin) / 2
  const audiometryCol1X = margin
  const audiometryLabel = 'Audiometry: '
  const audiometryValue = String(patientData.audiometry || 'N/A')
  doc.setFont(undefined, 'bold')
  doc.text(audiometryLabel, audiometryCol1X, yPos)
  const audiometryLabelWidth = doc.getTextWidth(audiometryLabel)
  doc.setFont(undefined, 'normal')
  const audiometryAvailableWidth = audiometryColWidth - audiometryLabelWidth
  const audiometryLines = doc.splitTextToSize(audiometryValue, audiometryAvailableWidth)
  doc.text(audiometryLines, audiometryCol1X + audiometryLabelWidth, yPos)
  
  yPos += Math.max(lineHeight, audiometryLines.length * lineHeight) + 0.3

  // ========== REMARKS AND ADVICE ==========
  // Simple key-value pairs without section headers
  yPos += 1 // Reduced spacing
  addKeyValue('Remark', patientData.remarks || 'N/A', col1X, colWidth)
  addKeyValue('Advice', patientData.advice || 'N/A', col1X, colWidth)

  // Return the doc instance and current yPos
  return { doc, yPos }
}

export const exportToPDF = (patientData) => {
  const { doc } = generatePatientPDFContent(patientData)
  // Save PDF for single patient export
  const fileName = `Medical_Report_${patientData.patientName || 'Patient'}_${patientData.empId || patientData.empCode || Date.now()}.pdf`
  doc.save(fileName)
}

export const exportAllToPDF = (patientsArray) => {
  if (!patientsArray || patientsArray.length === 0) {
    throw new Error('No patients to export')
  }

  // Initialize PDF document
  let doc = null
  let isFirstPatient = true

  // Generate PDF content for each patient
  patientsArray.forEach((patient, index) => {
    const { doc: updatedDoc } = generatePatientPDFContent(
      patient, 
      doc, 
      !isFirstPatient // Start new page for all patients except the first one
    )
    doc = updatedDoc
    isFirstPatient = false
  })

  // Save the combined PDF
  const fileName = `All_Medical_Reports_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}


// ------------------ EXCEL EXPORT (Unchanged) ------------------ //

export const exportToExcel = (data, fileName = 'medical_reports') => {
  const patients = Array.isArray(data) ? data : [data]

  const excelData = patients.map(patient => ({
    'Medical Test Date': patient.medicalTestDate || '',
    'Certificate No': patient.certNo || '',
    'Name': patient.patientName || '',
    'Emp Code': patient.empCode || patient.empId || '',
    'Age': patient.age || '',
    'Sex': patient.sex || patient.gender || '',
    'Designation': patient.designation || '',
    'Department Name': patient.departmentName || patient.department || '',
    'Gender': patient.gender || patient.sex || '',
    'Emp ID': patient.empId || patient.empCode || '',
    'Certificate Number': patient.certNo || '',
    'Contractor Name': patient.contractorName || '',
    'Department': patient.department || patient.departmentName || '',
    'Contact Number': patient.contactNo || '',
    'Height (cm)': patient.height || '',
    'Weight (kg)': patient.weight || '',
    'Expected Weight (kg)': patient.expectedWeight || '',
    'Chest (cm)': patient.chest || '',
    'BMI': patient.bmi || '',
    'B.P. Systolic (mmHg)': patient.bpSystolic || '',
    'B.P. Diastolic (mmHg)': patient.bpDiastolic || '',
    'Pulse (/min)': patient.pulse || '',
    'Past History': patient.pastHistory?.join('; ') || '',
    'Past Hypertension': patient.pastHypertension || 'No',
    'Past Diabetes': patient.pastDiabetes || 'No',
    'Past Asthma': patient.pastAsthma || 'No',
    'Past Chest Pain': patient.pastChestPain || 'No',
    'Present History': patient.presentHistory?.join('; ') || '',
    'Present Hypertension': patient.presentHypertension || 'No',
    'Present Diabetes': patient.presentDiabetes || 'No',
    'Present Asthma': patient.presentAsthma || 'No',
    'Present Chest Pain': patient.presentChestPain || 'No',
    'Father History': patient.fatherHistory?.has ? patient.fatherHistory.details : 'NAD',
    'Mother History': patient.motherHistory?.has ? patient.motherHistory.details : 'NAD',
    'Vision Color': patient.visionColor || '',
    'Vision Distance Right': (patient.visionDistanceRight1 && patient.visionDistanceRight2) 
      ? `${patient.visionDistanceRight1}/${patient.visionDistanceRight2}` 
      : '',
    'Vision Distance Right 1': patient.visionDistanceRight1 || '',
    'Vision Distance Right 2': patient.visionDistanceRight2 || '',
    'Vision Distance Left': (patient.visionDistanceLeft1 && patient.visionDistanceLeft2) 
      ? `${patient.visionDistanceLeft1}/${patient.visionDistanceLeft2}` 
      : '',
    'Vision Distance Left 1': patient.visionDistanceLeft1 || '',
    'Vision Distance Left 2': patient.visionDistanceLeft2 || '',
    'Vision Near Right': (patient.visionNearRight1 && patient.visionNearRight2) 
      ? `${patient.visionNearRight1}/${patient.visionNearRight2}` 
      : '',
    'Vision Near Right 1': patient.visionNearRight1 || '',
    'Vision Near Right 2': patient.visionNearRight2 || '',
    'Vision Near Left': (patient.visionNearLeft1 && patient.visionNearLeft2) 
      ? `${patient.visionNearLeft1}/${patient.visionNearLeft2}` 
      : '',
    'Vision Near Left 1': patient.visionNearLeft1 || '',
    'Vision Near Left 2': patient.visionNearLeft2 || '',
    'Glasses': patient.glasses || '',
    'Tobacco': patient.tobacco ? 'Yes' : 'No',
    'Smoking': patient.smoking ? 'Yes' : 'No',
    'Drinking': patient.drinking ? 'Yes' : 'No',
    'Allergic To': patient.allergicTo || '',
    'Remarks': patient.remarks || '',
    'Advice': patient.advice || '',
    'ECG': patient.ecg || '',
    'X-Ray': patient.xray || '',
    'Pulmonary Function Test': patient.pulmonaryFunctionTest || '',
    'Audiometry': patient.audiometry || ''
  }))

  const ws = XLSX.utils.json_to_sheet(excelData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Medical Reports')
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}
