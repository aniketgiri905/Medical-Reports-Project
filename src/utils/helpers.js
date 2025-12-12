import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const calculateBMI = (height, weight) => {
  if (!height || !weight || height <= 0 || weight <= 0) return 0
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

export const exportToPDF = (patientData) => {
  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.height
  const pageWidth = doc.internal.pageSize.width
  const margin = 10
  let yPos = 12
  const lineHeight = 4.5
  const maxY = pageHeight - margin
  const col1X = margin
  const col2X = pageWidth / 2 + 5

  // Page break only when necessary
  const checkPageBreak = (requiredSpace = lineHeight) => {
    if (yPos + requiredSpace >= maxY) {
      doc.addPage()
      yPos = margin
    }
  }

  // Compact key:value on single line
  const addKeyValue = (key, value, x = col1X, width = pageWidth / 2 - 15) => {
    checkPageBreak(lineHeight)
    doc.setFontSize(11)
    const text = `${key}: ${value || 'N/A'}`
    // Set font for label (bold) and value (normal)
    const labelText = `${key}: `
    const valueText = value || 'N/A'
    doc.setFont(undefined, 'bold')
    doc.text(labelText, x, yPos)
    const labelWidth = doc.getTextWidth(labelText)
    doc.setFont(undefined, 'normal')
    const valueLines = doc.splitTextToSize(valueText, width - labelWidth)
    doc.text(valueLines, x + labelWidth, yPos)
    yPos += valueLines.length * lineHeight
  }

  // Compact section header
  const sectionHeader = (title) => {
    checkPageBreak(lineHeight + 2)
    doc.setFontSize(12).setFont(undefined, 'bold')
    doc.text(title, margin, yPos)
    yPos += lineHeight + 1
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 2
    doc.setFont(undefined, 'normal')
  }

  // Page Title - Compact
  doc.setFontSize(15)
  doc.setFont(undefined, 'bold')
  doc.text('MEDICAL REPORTS 2025', pageWidth / 2, yPos, { align: 'center' })
  doc.setLineWidth(0.3)
  doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2)
  yPos += 6

  // Hospital & Company Info - Compact
  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  doc.text(patientData.hospitalName || 'Hospital Name', margin, yPos)
  yPos += 3.5
  if (patientData.hospitalAddress1) {
    doc.text(patientData.hospitalAddress1, margin, yPos)
    yPos += 3
  }
  if (patientData.hospitalAddress2) {
    doc.text(patientData.hospitalAddress2, margin, yPos)
    yPos += 3
  }
  yPos += 2
  
  // Company Name - Left aligned on single line
  if (patientData.companyName) {
    checkPageBreak(lineHeight)
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text('Company Name:', margin, yPos)
    const labelWidth = doc.getTextWidth('Company Name:')
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    const companyText = patientData.companyName
    // Ensure it doesn't wrap - use the full width available
    const maxWidth = pageWidth - margin - labelWidth - 5
    const companyLines = doc.splitTextToSize(companyText, maxWidth)
    doc.text(companyLines, margin + labelWidth + 2, yPos)
    doc.setFont(undefined, 'normal')
    yPos += companyLines.length * lineHeight
  }

  // MEDICAL REPORT DETAILS - Two columns
  sectionHeader('Medical Report Details')
  addKeyValue('Test Date', patientData.medicalTestDate, col1X)
  addKeyValue('Cert No', patientData.certNo, col2X)
  addKeyValue('Name', patientData.patientName, col1X)
  addKeyValue('Emp Code', patientData.empCode || patientData.empId, col2X)
  addKeyValue('Age', patientData.age, col1X)
  addKeyValue('Sex', patientData.sex || patientData.gender, col2X)
  addKeyValue('Designation', patientData.designation, col1X)
  addKeyValue('Department', patientData.departmentName || patientData.department, col2X)
  
  // Reset to single column
  yPos += 1

  // PATIENT INFORMATION - Two columns
  sectionHeader('Patient Information')
  addKeyValue('Name', patientData.patientName, col1X)
  addKeyValue('Age', patientData.age, col2X)
  addKeyValue('Gender', patientData.gender || patientData.sex, col1X)
  addKeyValue('Emp ID', patientData.empId || patientData.empCode, col2X)
  addKeyValue('Cert Number', patientData.certNo, col1X)
  addKeyValue('Contractor', patientData.contractorName, col2X)
  addKeyValue('Department', patientData.department || patientData.designation, col1X)
  addKeyValue('Contact', patientData.contactNo, col2X)
  yPos += 1

  // PHYSIOLOGICAL DATA - Two columns
  sectionHeader('Physiological Data')
  addKeyValue('Height (cm)', patientData.height, col1X)
  addKeyValue('Weight (kg)', patientData.weight, col2X)
  addKeyValue('Expected Wt', patientData.expectedWeight, col1X)
  addKeyValue('BMI', patientData.bmi, col2X)
  addKeyValue('Chest (cm)', patientData.chest, col1X)
  addKeyValue('BP', `${patientData.bpSystolic || ''}/${patientData.bpDiastolic || ''}`, col2X)
  addKeyValue('Pulse (/min)', patientData.pulse, col1X)
  yPos += 1

  // MEDICAL HISTORY - Compact
  const printList = (title, list) => {
    const items = (list || []).filter(i => i && i.trim())
    if (!items.length) return

    sectionHeader(title)
    doc.setFontSize(11)
    const itemsText = items.join('; ')
    const lines = doc.splitTextToSize(itemsText, pageWidth - 2 * margin)
    checkPageBreak(lines.length * lineHeight)
    doc.text(lines, margin, yPos)
    yPos += lines.length * lineHeight + 1
  }

  printList('Past Medical History', patientData.pastHistory)
  printList('Present Medical History', patientData.presentHistory)

  // FAMILY HISTORY - Two columns
  sectionHeader('Family History')
  const fatherValue = patientData.fatherHistory?.has ? (patientData.fatherHistory.details || 'Yes') : 'No'
  const motherValue = patientData.motherHistory?.has ? (patientData.motherHistory.details || 'Yes') : 'No'
  addKeyValue('Father', fatherValue, col1X)
  addKeyValue('Mother', motherValue, col2X)
  yPos += 1

  // ADDICTIONS - Two columns
  sectionHeader('Addictions')
  addKeyValue('Tobacco', patientData.tobacco ? 'Yes' : 'No', col1X)
  addKeyValue('Smoking', patientData.smoking ? 'Yes' : 'No', col2X)
  addKeyValue('Drinking', patientData.drinking ? 'Yes' : 'No', col1X)
  addKeyValue('Allergic To', patientData.allergicTo || 'No', col2X)
  yPos += 1

  // TEST RESULTS - Compact paragraphs
  const printParagraph = (title, text) => {
    if (!text || !text.trim()) return

    sectionHeader(title)
    checkPageBreak(lineHeight)
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin)
    checkPageBreak(lines.length * lineHeight)
    doc.text(lines, margin, yPos)
    yPos += lines.length * lineHeight + 1
  }

  printParagraph('ECG', patientData.ecg)
  printParagraph('X-Ray Chest', patientData.xray)
  printParagraph('Pulmonary Function Test', patientData.pulmonaryFunctionTest)
  printParagraph('Remarks', patientData.remarks)

  // SAVE PDF
  const fileName = `Medical_Report_${patientData.patientName || 'Patient'}_${patientData.empId || patientData.empCode || Date.now()}.pdf`
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
    'Present History': patient.presentHistory?.join('; ') || '',
    'Father History': patient.fatherHistory?.has ? patient.fatherHistory.details : 'No',
    'Mother History': patient.motherHistory?.has ? patient.motherHistory.details : 'No',
    'Tobacco': patient.tobacco ? 'Yes' : 'No',
    'Smoking': patient.smoking ? 'Yes' : 'No',
    'Drinking': patient.drinking ? 'Yes' : 'No',
    'Allergic To': patient.allergicTo || '',
    'Remarks': patient.remarks || '',
    'ECG': patient.ecg || '',
    'X-Ray': patient.xray || '',
    'Pulmonary Function Test': patient.pulmonaryFunctionTest || ''
  }))

  const ws = XLSX.utils.json_to_sheet(excelData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Medical Reports')
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}
