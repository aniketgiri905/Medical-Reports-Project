import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { toast } from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import './AudiometryReport.css'

function AudiometryReport() {
  const navigate = useNavigate()
  const reportRef = useRef(null)
  const rightChartRef = useRef(null)
  const leftChartRef = useRef(null)

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Convert Excel date to YYYY-MM-DD format
  const convertExcelDate = (dateValue) => {
    if (!dateValue) return ''

    // If already in YYYY-MM-DD format, return as is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue
    }

    try {
      let date

      // If it's a Date object
      if (dateValue instanceof Date) {
        date = dateValue
      }
      // If it's an Excel serial number (number between 1 and 100000)
      else if (typeof dateValue === 'number' && dateValue > 1 && dateValue < 100000) {
        // Excel epoch starts on 1900-01-01, but Excel incorrectly treats 1900 as a leap year
        const excelEpoch = new Date(1899, 11, 30)
        date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000)
      }
      // If it's a string, try to parse it
      else if (typeof dateValue === 'string') {
        // Try parsing various date formats
        date = new Date(dateValue)
        // Check if date is valid
        if (isNaN(date.getTime())) {
          // Try parsing with different formats
          const dateStr = dateValue.trim()
          // Handle formats like "2025-12-13", "12/13/2025", "13-12-2025", etc.
          date = new Date(dateStr)
          if (isNaN(date.getTime())) {
            return '' // Return empty if can't parse
          }
        }
      }
      // If it's already a valid Date-like value but not recognized, return empty
      else {
        return ''
      }

      // Format to YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch (error) {
      console.error('Error converting date:', error)
      return ''
    }
  }

  const [reportData, setReportData] = useState({
    companyName: '',
    medicalTestDate: getTodayDate(),
    name: '',
    age: '',
    certNo: '',
    empCode: '',
    departmentName: '',
    sex: '',
    designation: '',
    dateOfBirth: '',
    rightEar: {
      '500': '15',
      '1000': '10',
      '2000': '15',
      '4000': '20',
      '6000': '15',
      '8000': '20'
    },
    leftEar: {
      '500': '15',
      '1000': '15',
      '2000': '15',
      '4000': '20',
      '6000': '15',
      '8000': '20'
    },
    remark: ''
  })

  const handleExcelImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          toast.error('No data found in the Excel file')
          return
        }

        // Helper function to convert Excel row to data structure
        const convertRowToData = (row) => {
          return {
            companyName: row['Company Name'] || row['Company'] || '',
            medicalTestDate: row['Medical Test Date'] || row['Test Date'] || '',
            name: row['Name'] || '',
            age: row['Age'] || '',
            certNo: row['Certificate Number'] || row['Cert No'] || row['CERTI NO.'] || '',
            empCode: row['Employee Code'] || row['Emp Code'] || row['Emp Code'] || '',
            departmentName: row['Department Name'] || row['Department'] || row['Dep. Name'] || '',
            sex: row['Sex'] || row['Gender'] || '',
            designation: row['Designation'] || '',
            dateOfBirth: row['Date Of Birth'] || row['DOB'] || row['Date of Birth'] || '',
            rightEar: {
              '500': row['Right 500'] || row['Right Ear 500'] || '',
              '1000': row['Right 1000'] || row['Right Ear 1000'] || '',
              '2000': row['Right 2000'] || row['Right Ear 2000'] || '',
              '4000': row['Right 4000'] || row['Right Ear 4000'] || '',
              '6000': row['Right 6000'] || row['Right Ear 6000'] || '',
              '8000': row['Right 8000'] || row['Right Ear 8000'] || ''
            },
            leftEar: {
              '500': row['Left 500'] || row['Left Ear 500'] || '',
              '1000': row['Left 1000'] || row['Left Ear 1000'] || '',
              '2000': row['Left 2000'] || row['Left Ear 2000'] || '',
              '4000': row['Left 4000'] || row['Left Ear 4000'] || '',
              '6000': row['Left 6000'] || row['Left Ear 6000'] || '',
              '8000': row['Left 8000'] || row['Left Ear 8000'] || ''
            },
            remark: row['Remark'] || row['remark'] || ''
          }
        }

        // Convert all rows to data
        const allRowsData = jsonData.map(convertRowToData)

        // Set first row data for display
        const firstRowData = allRowsData[0]
        setReportData(firstRowData)

        toast.success(`${jsonData.length} record(s) imported. Generating PDF...`)

        // Generate PDF for all rows - wait longer to ensure charts are rendered
        setTimeout(() => {
          handleExportPDFMultiple(allRowsData)
        }, 1500)
      } catch (error) {
        toast.error('Error reading Excel file: ' + error.message)
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  // Helper function to generate chart image from data
  const generateChartImage = (earData, earLabel, frequencies) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 400
      const ctx = canvas.getContext('2d')

      // Background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Chart area
      const padding = { top: 40, right: 40, bottom: 60, left: 60 }
      const chartWidth = canvas.width - padding.left - padding.right
      const chartHeight = canvas.height - padding.top - padding.bottom
      const chartX = padding.left
      const chartY = padding.top

      // Title
      ctx.fillStyle = '#333'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(earLabel, canvas.width / 2, 25)

      // Y-axis (Hearing Level in dB, inverted: -10 to 120)
      const minY = -10
      const maxY = 120
      const yRange = maxY - minY
      const yScale = chartHeight / yRange

      // X-axis (Frequency in Hz)
      const freqCount = frequencies.length
      const xScale = chartWidth / (freqCount - 1)

      // Grid lines
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1

      // Horizontal grid lines (hearing levels every 10dB)
      for (let db = -10; db <= 120; db += 10) {
        const y = chartY + (db - minY) * yScale
        ctx.beginPath()
        ctx.moveTo(chartX, y)
        ctx.lineTo(chartX + chartWidth, y)
        ctx.stroke()

        // Y-axis labels
        ctx.fillStyle = '#666'
        ctx.font = '12px Arial'
        ctx.textAlign = 'right'
        ctx.fillText(db.toString(), chartX - 10, y + 4)
      }

      // Vertical grid lines
      frequencies.forEach((freq, index) => {
        const x = chartX + index * xScale
        ctx.beginPath()
        ctx.moveTo(x, chartY)
        ctx.lineTo(x, chartY + chartHeight)
        ctx.stroke()

        // X-axis labels
        ctx.fillStyle = '#666'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(freq, x, chartY + chartHeight + 20)
      })

      // Axis labels
      ctx.fillStyle = '#333'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Frequency (Hz)', canvas.width / 2, canvas.height - 10)

      ctx.save()
      ctx.translate(20, canvas.height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Hearing Level (dB)', 0, 0)
      ctx.restore()

      // Draw the line chart
      const dataPoints = frequencies.map((freq, index) => {
        const value = parseFloat(earData[freq] || 0)
        const x = chartX + index * xScale
        const y = chartY + (Math.max(-10, Math.min(120, value)) - minY) * yScale
        return { x, y, value }
      })

      // First, draw the line connecting all points
      ctx.strokeStyle = '#ef5350'
      ctx.lineWidth = 3
      ctx.beginPath()

      dataPoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })

      ctx.stroke()

      // Then, draw dots on top of the line (so they're visible)
      dataPoints.forEach((point) => {
        // Draw dot with white border
        ctx.fillStyle = '#ef5350'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2)
        ctx.fill()

        // White border around dot
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // Convert to image data URL
      resolve(canvas.toDataURL('image/png'))
    })
  }

  // Helper function to generate a single PDF page for a patient
  const generatePatientPDFPage = async (pdf, dataToUse, pageWidth, pageHeight, margin, primaryColor, secondaryColor, includeCharts = false) => {
    let yPos = margin

    // Helper function to check page break (very lenient to fit on one page)
    const checkPageBreak = (requiredSpace = 10) => {
      // Only break if we're very close to the bottom (within 3mm)
      if (yPos + requiredSpace >= pageHeight - 3) {
        pdf.addPage()
        yPos = margin
      }
    }

    // 1. Title "AUDIOMETRY REPORT" - Large, bold, teal, centered
    pdf.setFontSize(18)
    pdf.setTextColor(...primaryColor)
    pdf.setFont(undefined, 'bold')
    const titleText = 'AUDIOMETRY REPORT'
    const titleWidth = pdf.getTextWidth(titleText)
    pdf.text(titleText, (pageWidth - titleWidth) / 2, yPos)
    yPos += 6

    // 2. Company name - centered, bold, larger size (no "Company:" label)
    pdf.setFontSize(12)
    pdf.setTextColor(60, 60, 60) // Dark grey
    pdf.setFont(undefined, 'bold')
    const companyValue = dataToUse.companyName || 'Company Name'

    // Center the company name only
    const companyWidth = pdf.getTextWidth(companyValue)
    pdf.text(companyValue, (pageWidth - companyWidth) / 2, yPos)
    yPos += 6

    // 3. Thick horizontal line - teal
    pdf.setDrawColor(...primaryColor)
    pdf.setLineWidth(0.8)
    pdf.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 8

    // 4. Patient Information Section - Match image layout (compact)
    pdf.setTextColor(0, 0, 0) // Black for values
    pdf.setFontSize(9)

    const rowStartY = yPos
    let currentX = margin
    let currentY = yPos
    const itemSpacing = 10
    const maxWidth = pageWidth - 2 * margin
    let itemsInCurrentRow = 0
    const itemsPerRow = 3
    const itemWidth = (maxWidth - (itemsPerRow - 1) * itemSpacing) / itemsPerRow
    const lineHeight = 6

    // Helper function to add a patient info item
    const addPatientInfoItem = (label, value, addYrs = false) => {
      if (!value && value !== 0 && value !== '') return

      const valueStr = String(value)
      const displayValue = addYrs ? `${valueStr} yrs` : valueStr
      const labelText = `${label}: `

      if (itemsInCurrentRow >= itemsPerRow) {
        currentY += lineHeight
        currentX = margin
        itemsInCurrentRow = 0
        checkPageBreak(lineHeight)
      }

      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(...primaryColor)
      const labelWidth = Math.max(pdf.getTextWidth(labelText), 38)
      pdf.text(labelText, currentX, currentY)

      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(0, 0, 0)
      pdf.text(displayValue, currentX + labelWidth, currentY)

      currentX += itemWidth + itemSpacing
      itemsInCurrentRow++
    }

    // Add patient info items in the order shown in image
    addPatientInfoItem('Medical Test Date', dataToUse.medicalTestDate)
    addPatientInfoItem('Date Of Birth', dataToUse.dateOfBirth)
    addPatientInfoItem('Sex', dataToUse.sex)
    addPatientInfoItem('Name', dataToUse.name)
    addPatientInfoItem('CERTI NO.', dataToUse.certNo)
    addPatientInfoItem('Designation', dataToUse.designation)
    addPatientInfoItem('Age', dataToUse.age, true)
    addPatientInfoItem('Emp Code', dataToUse.empCode)
    addPatientInfoItem('Dep. Name', dataToUse.departmentName)

    yPos = currentY + lineHeight + 6

    // 5. Audiometry Table - Match image format with borders
    checkPageBreak(50)

    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(...primaryColor)
    pdf.text('AUDIOMETRY :', margin, yPos)
    yPos += 6

    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)

    const frequencies = ['500', '1000', '2000', '4000', '6000', '8000']
    const colWidth = 23
    const labelColWidth = 42
    const rowHeight = 7

    const startX = margin + labelColWidth
    const tableStartY = yPos
    const tableEndX = startX + (frequencies.length * colWidth)

    // ─── Borders setup ─────────────────────────────
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.5)

    // ─── HEADER ROW ────────────────────────────────
    pdf.setFont(undefined, 'bold')

    frequencies.forEach((freq, i) => {
      pdf.text(
        `${freq} dbe`,
        startX + (i * colWidth) + 2,
        yPos + 5
      )
    })

    // Top border
    pdf.line(margin, tableStartY, tableEndX, tableStartY)

    yPos += rowHeight

    // Header bottom border
    pdf.line(margin, yPos, tableEndX, yPos)

    // ─── RIGHT EAR ROW ─────────────────────────────
    pdf.text('RIGHT EAR', margin + 2, yPos + 5)
    pdf.setFont(undefined, 'normal')

    frequencies.forEach((freq, i) => {
      pdf.text(
        String(dataToUse.rightEar?.[freq] ?? '0'),
        startX + (i * colWidth) + 2,
        yPos + 5
      )
    })

    yPos += rowHeight
    pdf.line(margin, yPos, tableEndX, yPos)

    // ─── LEFT EAR ROW ──────────────────────────────
    pdf.setFont(undefined, 'bold')
    pdf.text('LEFT EAR', margin + 2, yPos + 5)
    pdf.setFont(undefined, 'normal')

    frequencies.forEach((freq, i) => {
      pdf.text(
        String(dataToUse.leftEar?.[freq] ?? '0'),
        startX + (i * colWidth) + 2,
        yPos + 5
      )
    })

    yPos += rowHeight

    // Bottom border
    pdf.line(margin, yPos, tableEndX, yPos)

    // ─── VERTICAL BORDERS ──────────────────────────
    pdf.line(margin, tableStartY, margin, yPos)               // left
    pdf.line(startX, tableStartY, startX, yPos)               // label divider

    frequencies.forEach((_, i) => {
      const x = startX + ((i + 1) * colWidth)
      pdf.line(x, tableStartY, x, yPos)
    })

    pdf.line(tableEndX, tableStartY, tableEndX, yPos)         // right

    yPos += 10


    // 6. Add charts if requested - generate programmatically from data (one below the other, smaller)
    if (includeCharts) {
      checkPageBreak(120) // Need space for two charts stacked (reduced)

      try {
        const frequencies = ['500', '1000', '2000', '4000', '6000', '8000']

        // Generate chart images programmatically
        const rightChartImg = await generateChartImage(dataToUse.rightEar || {}, 'RIGHT EAR', frequencies)
        const leftChartImg = await generateChartImage(dataToUse.leftEar || {}, 'LEFT EAR', frequencies)

        const chartWidth = pageWidth - 2 * margin // Full width
        const chartHeight = 55 // Reduced height in mm to fit on one page

        // Right Ear Chart (first, full width)
        pdf.addImage(rightChartImg, 'PNG', margin, yPos, chartWidth, chartHeight)
        yPos += chartHeight + 6

        // Left Ear Chart (below Right Ear, full width)
        checkPageBreak(chartHeight + 6)
        pdf.addImage(leftChartImg, 'PNG', margin, yPos, chartWidth, chartHeight)
        yPos += chartHeight + 6
      } catch (chartError) {
        console.error('Error generating charts:', chartError)
      }
    }

    // 7. Add Right Ear and Left Ear Normal/Abnormal status at the end (after graphs)
    checkPageBreak(20)

    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)

    // ─── Helper: Determine Normal / Abnormal ───────
    const getEarStatusForPDF = (earData = {}) => {
      const frequencies = ['500', '1000', '2000', '4000', '6000', '8000']
      return frequencies.some(freq => Number(earData[freq] || 0) >= 50)
        ? 'Abnormal'
        : 'Normal'
    }

    // ─── Compute Status Values ─────────────────────
    const rightEarStatusPDF = getEarStatusForPDF(dataToUse?.rightEar)
    const leftEarStatusPDF = getEarStatusForPDF(dataToUse?.leftEar)

    // ─── Styled Status Box ─────────────────────────
    const boxHeight = 10
    const boxWidth = pageWidth - (margin * 2)
    const boxY = yPos

    pdf.setDrawColor(0, 153, 204)      // blue border
    pdf.setFillColor(230, 246, 248)     // light blue background
    pdf.setLineWidth(0.6)

    // Rounded container
    pdf.roundedRect(
      margin,
      boxY,
      boxWidth,
      boxHeight,
      3,
      3,
      'FD'
    )

    // ─── Text Content ──────────────────────────────
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)

    // Right Ear
    pdf.setFont(undefined, 'bold')
    pdf.text('Right Ear:', margin + 25, boxY + 6)

    pdf.setFont(undefined, 'normal')
    pdf.text(rightEarStatusPDF, margin + 45, boxY + 6)

    // Left Ear
    pdf.setFont(undefined, 'bold')
    pdf.text('Left Ear:', margin + boxWidth / 2 + 5, boxY + 6)

    pdf.setFont(undefined, 'normal')
    pdf.text(leftEarStatusPDF, margin + boxWidth / 2 + 25, boxY + 6)

    // ─── Move cursor down ──────────────────────────
    yPos += boxHeight + 10


    // 8. Add Remark field at the end
    checkPageBreak(8)
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Remark: ', margin, yPos)

    const remarkText = dataToUse.remark || ''
    if (remarkText) {
      const remarkLines = pdf.splitTextToSize(String(remarkText), pageWidth - 2 * margin - 25)
      pdf.text(remarkLines, margin + 22, yPos)
      yPos += remarkLines.length * 5 + 3
    } else {
      yPos += 5
    }

    return yPos
  }

  // Generate PDF for multiple patients (one page per patient)
  const handleExportPDFMultiple = async (allRowsData) => {
    // Filter out rows missing required fields
    const validRows = allRowsData.filter(row =>
      row.name && row.medicalTestDate && row.age && row.sex && row.certNo
    )

    if (validRows.length === 0) {
      toast.error('No valid records found. Please ensure all required fields (Medical Test Date, Name, Age, Sex, Certificate Number) are filled.')
      return
    }

    try {
      toast.loading(`Generating PDF for ${validRows.length} record(s)...`)

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.width
      const pageHeight = pdf.internal.pageSize.height
      const margin = 10 // Reduced margin to fit more content

      // Define colors
      const primaryColor = [0, 131, 143] // Teal color (RGB)
      const secondaryColor = [107, 114, 128] // Grey/Brown color (RGB)

      // Generate a page for each patient
      for (let index = 0; index < validRows.length; index++) {
        if (index > 0) {
          pdf.addPage() // Add new page for each patient (except first)
        }

        // Generate page with charts for this patient (charts generated programmatically from data)
        await generatePatientPDFPage(pdf, validRows[index], pageWidth, pageHeight, margin, primaryColor, secondaryColor, true)
      }

      const fileName = `Audiometry_Reports_Batch_${Date.now()}.pdf`
      pdf.save(fileName)

      toast.dismiss()
      toast.success(`PDF generated successfully with ${validRows.length} page(s)!`)
    } catch (error) {
      toast.dismiss()
      let errorMessage = 'Unable to generate PDF. Please try again.'

      if (error.message && error.message.includes('Type of text must be string')) {
        errorMessage = 'PDF generation failed due to invalid data format. Please check that all fields contain valid text or numbers.'
      } else if (error.message) {
        errorMessage = `PDF generation failed: ${error.message}. Please try again or contact support.`
      }

      toast.error(errorMessage)
      console.error('PDF Generation Error:', error)
    }
  }

  // Auto-export PDF function that uses provided data
  const handleExportPDFAuto = async (dataToUse = reportData) => {
    if (!dataToUse.name || !dataToUse.medicalTestDate || !dataToUse.age || !dataToUse.sex || !dataToUse.certNo) {
      toast.error('Please fill all required fields (Medical Test Date, Name, Age, Sex, Certificate Number)')
      return
    }

    try {
      toast.loading('Generating PDF...')

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.width
      const pageHeight = pdf.internal.pageSize.height
      const margin = 10 // Reduced margin to fit more content

      // Define colors
      const primaryColor = [0, 131, 143] // Teal color (RGB)
      const secondaryColor = [107, 114, 128] // Grey/Brown color (RGB)

      // Use the helper function to generate the page with charts
      await generatePatientPDFPage(pdf, dataToUse, pageWidth, pageHeight, margin, primaryColor, secondaryColor, true)

      const fileName = `Audiometry_Report_${dataToUse.empCode || dataToUse.name || 'Report'}_${Date.now()}.pdf`
      pdf.save(fileName)

      toast.dismiss()
      toast.success('PDF generated successfully!')
    } catch (error) {
      toast.dismiss()
      // Provide user-friendly error messages
      let errorMessage = 'Unable to generate PDF. Please try again.'

      if (error.message && error.message.includes('Type of text must be string')) {
        errorMessage = 'PDF generation failed due to invalid data format. Please check that all fields contain valid text or numbers.'
      } else if (error.message && error.message.includes('chart')) {
        errorMessage = 'PDF generation failed while processing charts. Please try again.'
      } else if (error.message) {
        errorMessage = `PDF generation failed: ${error.message}. Please try again or contact support.`
      }

      toast.error(errorMessage)
      console.error('PDF Generation Error:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setReportData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEarChange = (ear, frequency, value) => {
    setReportData(prev => ({
      ...prev,
      [ear]: {
        ...prev[ear],
        [frequency]: value
      }
    }))
  }

  // Prepare chart data
  const frequencies = ['500', '1000', '2000', '4000', '6000', '8000']

  const rightEarData = frequencies.map(freq => ({
    frequency: `${freq} Hz`,
    hearingLevel: reportData.rightEar[freq] ? parseFloat(reportData.rightEar[freq]) : 0
  }))

  const leftEarData = frequencies.map(freq => ({
    frequency: `${freq} Hz`,
    hearingLevel: reportData.leftEar[freq] ? parseFloat(reportData.leftEar[freq]) : 0
  }))

  // Helper function to determine Normal/Abnormal status
  // If any dB value is >= 50, then Abnormal, otherwise Normal
  const getEarStatus = (earData) => {
    const hasAbnormalValue = earData.some(d => d.hearingLevel >= 50)
    return hasAbnormalValue ? 'Abnormal' : 'Normal'
  }

  const rightEarStatus = getEarStatus(rightEarData)
  const leftEarStatus = getEarStatus(leftEarData)

  const handleExportPDF = async () => {
    if (!reportData.name || !reportData.medicalTestDate || !reportData.age || !reportData.sex || !reportData.certNo) {
      toast.error('Please fill all required fields (Medical Test Date, Name, Age, Sex, Certificate Number)')
      return
    }

    try {
      toast.loading('Generating PDF...')

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.width
      const pageHeight = pdf.internal.pageSize.height
      const margin = 10 // Reduced margin to fit more content

      // Define colors
      const primaryColor = [0, 131, 143] // Teal color (RGB)
      const secondaryColor = [107, 114, 128] // Grey/Brown color (RGB)

      // Use the helper function to generate the page with charts
      await generatePatientPDFPage(pdf, reportData, pageWidth, pageHeight, margin, primaryColor, secondaryColor, true)

      const fileName = `Audiometry_Report_${reportData.empCode || reportData.name || 'Report'}_${Date.now()}.pdf`
      pdf.save(fileName)

      toast.dismiss()
      toast.success('PDF generated successfully!')
    } catch (error) {
      toast.dismiss()
      // Provide user-friendly error messages
      let errorMessage = 'Unable to generate PDF. Please try again.'

      if (error.message && error.message.includes('Type of text must be string')) {
        errorMessage = 'PDF generation failed due to invalid data format. Please check that all fields contain valid text or numbers.'
      } else if (error.message && error.message.includes('chart')) {
        errorMessage = 'PDF generation failed while processing charts. Please try again.'
      } else if (error.message) {
        errorMessage = `PDF generation failed: ${error.message}. Please try again or contact support.`
      }

      toast.error(errorMessage)
      console.error('PDF Generation Error:', error)
    }
  }

  return (
    <div className="audiometry-report-container">
      <div className="report-header-actions">
        <h1>Audiometry Report Generator</h1>
        <div className="header-buttons">
          <label className="file-upload-btn">
            Upload Excel File
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={handleExportPDF} className="export-pdf-btn" disabled={!reportData.companyName}>
            Export PDF
          </button>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to List
          </button>
        </div>
      </div>

      <div className="report-form-section">
        <h2>Patient & Company Information</h2>
        <div className="audiometry-form-grid">
          <div className="audiometry-form-group">
            <label>Company Name <span className="required-asterisk">*</span></label>
            <input
              type="text"
              name="companyName"
              value={reportData.companyName}
              onChange={handleChange}
              required
              placeholder="Enter company name"
            />
          </div>
          <div className="audiometry-form-group">
            <label>Medical Test Date <span className="required-asterisk">*</span></label>
            <input
              type="date"
              name="medicalTestDate"
              value={reportData.medicalTestDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="audiometry-form-group">
            <label>Name <span className="required-asterisk">*</span></label>
            <input
              type="text"
              name="name"
              value={reportData.name || ''}
              onChange={handleChange}
              placeholder="Enter patient name"
              required
            />
          </div>
          <div className="audiometry-form-group">
            <label>Age <span className="required-asterisk">*</span></label>
            <input
              type="number"
              name="age"
              value={reportData.age}
              onChange={handleChange}
              placeholder="Enter age"
              required
            />
          </div>
          <div className="audiometry-form-group">
            <label>Certificate Number <span className="required-asterisk">*</span></label>
            <input
              type="text"
              name="certNo"
              value={reportData.certNo}
              onChange={handleChange}
              required
              placeholder="Enter certificate number"
            />
          </div>
          <div className="audiometry-form-group">
            <label>Employee Code</label>
            <input
              type="text"
              name="empCode"
              value={reportData.empCode}
              onChange={handleChange}
              placeholder="Enter employee code"
            />
          </div>
          <div className="audiometry-form-group">
            <label>Department Name</label>
            <input
              type="text"
              name="departmentName"
              value={reportData.departmentName}
              onChange={handleChange}
              placeholder="Enter department name"
            />
          </div>
          <div className="audiometry-form-group">
            <label>Gender <span className="required-asterisk">*</span></label>
            <select
              name="sex"
              value={reportData.sex}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="audiometry-form-group">
            <label>Designation</label>
            <input
              type="text"
              name="designation"
              value={reportData.designation}
              onChange={handleChange}
              placeholder="Enter designation"
            />
          </div>
          <div className="audiometry-form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={reportData.dateOfBirth}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Remark Section */}
      <div className="audiometry-data-section">
        <h2>Remark</h2>
        <div className="audiometry-form-group">
          <textarea
            name="remark"
            value={reportData.remark}
            onChange={handleChange}
            placeholder="Enter any remarks or notes"
            rows="1"
            style={{ width: '100%', padding: '0.75em', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95em' }}
          />
        </div>
      </div>

      <div className="audiometry-data-section" ref={reportRef}>
        <div className="print-header">
          <h2>AUDIOMETRY REPORT</h2>
          {reportData.companyName && (
            <p className="company-name-print">
              Company: <strong className='company-name-value'>{reportData.companyName}</strong>
            </p>
          )}
        </div>

        <div className="patient-info-section">
          <div className="info-row">
            {reportData.medicalTestDate && (
              <div className="info-item">
                <strong>Medical Test Date:</strong> {reportData.medicalTestDate}
              </div>
            )}
            {reportData.name && (
              <div className="info-item">
                <strong>Name:</strong> {reportData.name}
              </div>
            )}
            {reportData.age && (
              <div className="info-item">
                <strong>Age:</strong> {reportData.age} yrs
              </div>
            )}
            {reportData.dateOfBirth && (
              <div className="info-item">
                <strong>Date Of Birth:</strong> {reportData.dateOfBirth}
              </div>
            )}
            {reportData.certNo && (
              <div className="info-item">
                <strong>CERTI NO.:</strong> {reportData.certNo}
              </div>
            )}
            {reportData.empCode && (
              <div className="info-item">
                <strong>Emp Code:</strong> {reportData.empCode}
              </div>
            )}
            {reportData.sex && (
              <div className="info-item">
                <strong>Sex:</strong> {reportData.sex}
              </div>
            )}
            {reportData.designation && (
              <div className="info-item">
                <strong>Designation:</strong> {reportData.designation}
              </div>
            )}
            {reportData.departmentName && (
              <div className="info-item">
                <strong>Dep. Name:</strong> {reportData.departmentName}
              </div>
            )}
          </div>
        </div>

        <div className="audiometry-tables-section">
          <div className="audiometry-table-container">
            <h3>Audiometry Results</h3>
            <table className="audiometry-table">
              <thead>
                <tr>
                  <th>Frequency (Hz)</th>
                  <th>Right Ear (dB)</th>
                  <th>Left Ear (dB)</th>
                </tr>
              </thead>
              <tbody>
                {frequencies.map(freq => (
                  <tr key={freq}>
                    <td>{freq}</td>
                    <td>
                      <input
                        type="number"
                        value={reportData.rightEar[freq]}
                        onChange={(e) => handleEarChange('rightEar', freq, e.target.value)}
                        className="frequency-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={reportData.leftEar[freq]}
                        onChange={(e) => handleEarChange('leftEar', freq, e.target.value)}
                        className="frequency-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="audiogram-charts-section">
          <div className="chart-container" ref={rightChartRef}>
            <h3 className="chart-title right-ear-title">RIGHT EAR</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rightEarData} margin={{ top: 20, right: 30, left: 30, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis
                    dataKey="frequency"
                    label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5, style: { fill: '#666' } }}
                    stroke="#333"
                  />
                  <YAxis
                    label={{ value: 'Hearing Level (dB)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                    domain={[-10, 120]}
                    reversed
                    stroke="#333"
                    ticks={[-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hearingLevel"
                    stroke="#ef5350"
                    strokeWidth={3}
                    dot={{ fill: '#ef5350', r: 6, strokeWidth: 2, stroke: '#fff' }}
                    name="Right Ear"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container" ref={leftChartRef}>
            <h3 className="chart-title left-ear-title">LEFT EAR</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={leftEarData} margin={{ top: 20, right: 30, left: 30, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis
                    dataKey="frequency"
                    label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5, style: { fill: '#666' } }}
                    stroke="#333"
                  />
                  <YAxis
                    label={{ value: 'Hearing Level (dB)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                    domain={[-10, 120]}
                    reversed
                    stroke="#333"
                    ticks={[-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hearingLevel"
                    stroke="#ef5350"
                    strokeWidth={3}
                    dot={{ fill: '#ef5350', r: 6, strokeWidth: 2, stroke: '#fff' }}
                    name="Left Ear"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <div className="summary-item">
            <strong>Right Ear:</strong> {rightEarStatus}
          </div>
          <div className="summary-item">
            <strong>Left Ear:</strong> {leftEarStatus}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudiometryReport

