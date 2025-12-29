import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Help.css'

function Help() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="help-container">
      <div className="help-card">
        <div className="help-header">
          <h1>Help & Documentation</h1>
          <p className="help-subtitle">Complete guide to using the Medical Reports Management System</p>
        </div>

        <section className="help-section">
          <div className="section-icon">🚀</div>
          <div className="section-content">
            <h2>Getting Started</h2>
            <p>
              Welcome to the Medical Reports Management System! This comprehensive platform is designed
              to streamline healthcare documentation and patient record management. Whether you're creating
              new reports, viewing patient details, or generating audiometry reports, this guide will help
              you navigate and utilize all features effectively.
            </p>
            <div className="info-box">
              <strong>Quick Tip:</strong> Make sure you're signed in to access all features including
              Excel file uploads and PDF exports.
            </div>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">📋</div>
          <div className="section-content">
            <h2>Creating a New Medical Report</h2>
            <h3>Step-by-Step Guide:</h3>
            <ol className="help-list">
              <li>
                <strong>Navigate to Create Report:</strong> Click the "Create New Report" button on the
                home page or use the footer link.
              </li>
              <li>
                <strong>Choose Entry Method:</strong>
                <ul>
                  <li><strong>Import from Excel:</strong> Upload a pre-formatted Excel file to automatically populate patient data</li>
                  <li><strong>Enter Details Manually:</strong> Fill out the form step by step with patient information</li>
                </ul>
              </li>
              <li>
                <strong>Fill in Patient Information:</strong>
                <ul>
                  <li>Basic details: Name, Age, Gender, Employee ID, Certificate Number</li>
                  <li>Contact information: Phone number</li>
                  <li>Contractor and department information</li>
                </ul>
              </li>
              <li>
                <strong>Complete Medical History:</strong> Add past medical history, surgical history,
                and family history as applicable.
              </li>
              <li>
                <strong>Enter Examination Data:</strong> Fill in physiological data, systemic examination
                results, addictions, allergies, and other medical findings.
              </li>
              <li>
                <strong>Add Remarks and Advice:</strong> Include any additional notes or medical advice.
              </li>
              <li>
                <strong>Save Report:</strong> Click "Save Report" to store the patient information.
              </li>
            </ol>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">✏️</div>
          <div className="section-content">
            <h2>Editing Existing Reports</h2>
            <ol className="help-list">
              <li>Navigate to the Patient List on the home page</li>
              <li>Find the patient you want to edit</li>
              <li>Click the actions menu (three dots) next to the patient name</li>
              <li>Select "Edit" from the dropdown menu</li>
              <li>Make your changes to any fields</li>
              <li>Click "Update Report" to save changes</li>
            </ol>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">👁️</div>
          <div className="section-content">
            <h2>Viewing Patient Details</h2>
            <ol className="help-list">
              <li>Click on any patient name in the Patient List</li>
              <li>View the complete medical report with all sections</li>
              <li>Use the "Print" button to generate a PDF of the report</li>
              <li>Use the "Edit" button to modify the report</li>
              <li>Use the "Back" button to return to the patient list</li>
            </ol>
            <div className="info-box">
              <strong>Note:</strong> The detailed view displays all information in organized sections
              for easy reading and reference.
            </div>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">🔍</div>
          <div className="section-content">
            <h2>Searching Patients</h2>
            <p>
              The search functionality allows you to quickly find patients using:
            </p>
            <ul className="help-list">
              <li><strong>Patient Name:</strong> Search by full or partial name</li>
              <li><strong>Employee ID:</strong> Search by employee identification number</li>
              <li><strong>Contact Number:</strong> Search by phone number</li>
            </ul>
            <p>
              Simply type your search term in the search box at the top of the Patient List page.
              Results will filter in real-time as you type.
            </p>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">📊</div>
          <div className="section-content">
            <h2>Audiometry Report Generator</h2>
            <h3>Creating Audiometry Reports:</h3>
            <ol className="help-list">
              <li>Navigate to "Audiometry Report" from the home page or footer</li>
              <li>Fill in patient and company information</li>
              <li>Enter hearing test data for both ears at different frequencies (250Hz, 500Hz, 1000Hz, 2000Hz, 4000Hz, 8000Hz)</li>
              <li>View the interactive audiogram charts that are automatically generated</li>
              <li>Review the hearing status summary (Normal, Mild, Moderate, Severe, Profound)</li>
              <li>Export to PDF when complete</li>
            </ol>
            <div className="info-box">
              <strong>Excel Upload:</strong> You can also upload Excel files to automatically populate
              audiometry data for multiple patients at once.
            </div>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">📥</div>
          <div className="section-content">
            <h2>Exporting Data</h2>
            <h3>Export to Excel:</h3>
            <ul className="help-list">
              <li>On the Patient List page, click "Export All to Excel"</li>
              <li>This will download all patient records in Excel format</li>
              <li>Useful for backup, analysis, or sharing with other systems</li>
            </ul>
            <h3>Export to PDF:</h3>
            <ul className="help-list">
              <li><strong>Individual Reports:</strong> View a patient's details and click "Print" to generate a PDF</li>
              <li><strong>Bulk Export:</strong> Click "Export All to PDF" on the Patient List page</li>
              <li>PDFs are formatted for printing and official documentation</li>
            </ul>
            <div className="warning-box">
              <strong>Authentication Required:</strong> You must be signed in to export files.
              If you're not signed in, you'll be redirected to the login page.
            </div>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">📤</div>
          <div className="section-content">
            <h2>Importing from Excel</h2>
            <h3>Preparing Your Excel File:</h3>
            <ol className="help-list">
              <li>Ensure your Excel file (.xlsx or .xls format) contains the required columns</li>
              <li>Include patient information such as name, age, gender, employee ID, etc.</li>
              <li>Make sure data is properly formatted (dates, numbers, text)</li>
            </ol>
            <h3>Upload Process:</h3>
            <ol className="help-list">
              <li>Go to "Create New Report"</li>
              <li>Select "Import from Excel" option</li>
              <li>Click "Choose Excel File" button</li>
              <li>Select your prepared Excel file</li>
              <li>The system will automatically parse and populate the form</li>
              <li>Review the imported data and make any necessary adjustments</li>
              <li>Save the report(s)</li>
            </ol>
            <div className="info-box">
              <strong>Bulk Import:</strong> Excel files can contain multiple patient records,
              and the system will create separate reports for each row.
            </div>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">🎨</div>
          <div className="section-content">
            <h2>Customization Features</h2>
            <h3>Hospital Settings:</h3>
            <ul className="help-list">
              <li>Customize hospital name and address</li>
              <li>Set company name for reports</li>
              <li>Settings are automatically saved and used in all generated reports</li>
            </ul>
            <h3>Dark Mode:</h3>
            <ul className="help-list">
              <li>Toggle between light and dark themes using the theme button in the header</li>
              <li>Your preference is automatically saved</li>
              <li>Reduces eye strain in low-light environments</li>
            </ul>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">❓</div>
          <div className="section-content">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-item">
              <h3>Q: How do I delete a patient record?</h3>
              <p>
                A: Click the actions menu (three dots) next to the patient name in the Patient List,
                then select "Delete" from the dropdown menu. Please note that this action cannot be undone.
              </p>
            </div>
            <div className="faq-item">
              <h3>Q: Can I edit a report after saving?</h3>
              <p>
                A: Yes! Simply click on the patient name to view details, then click the "Edit" button,
                or use the actions menu in the Patient List to access the edit function directly.
              </p>
            </div>
            <div className="faq-item">
              <h3>Q: What file formats are supported for import?</h3>
              <p>
                A: The system supports Excel files in .xlsx and .xls formats for bulk data import.
              </p>
            </div>
            <div className="faq-item">
              <h3>Q: Why can't I upload Excel files?</h3>
              <p>
                A: Excel file uploads require authentication. Please sign in to access this feature.
                If you're already signed in, try logging out and logging back in.
              </p>
            </div>
            <div className="faq-item">
              <h3>Q: How do I print or save a report as PDF?</h3>
              <p>
                A: View the patient details and click the "Print" button. This will generate a
                professional PDF document that you can save or print directly from your browser.
              </p>
            </div>
            <div className="faq-item">
              <h3>Q: Is my data saved automatically?</h3>
              <p>
                A: Yes, all patient records and settings are automatically saved to your browser's
                local storage. However, we recommend exporting important data regularly as a backup.
              </p>
            </div>
            <div className="faq-item">
              <h3>Q: Can I use this system offline?</h3>
              <p>
                A: Yes, once the application is loaded in your browser, you can use most features
                offline. However, some features may require an internet connection.
              </p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">🔧</div>
          <div className="section-content">
            <h2>Troubleshooting</h2>
            <div className="troubleshooting-item">
              <h3>Issue: PDF export is not working</h3>
              <ul>
                <li>Ensure you're signed in to the system</li>
                <li>Check that all required fields are filled in</li>
                <li>Try refreshing the page and attempting the export again</li>
                <li>Check your browser's pop-up blocker settings</li>
              </ul>
            </div>
            <div className="troubleshooting-item">
              <h3>Issue: Excel file import fails</h3>
              <ul>
                <li>Verify the file format is .xlsx or .xls</li>
                <li>Check that required columns are present in the file</li>
                <li>Ensure data is properly formatted (no special characters that might cause errors)</li>
                <li>Try opening the file in Excel first to verify it's not corrupted</li>
              </ul>
            </div>
            <div className="troubleshooting-item">
              <h3>Issue: Search is not finding patients</h3>
              <ul>
                <li>Check for typos in your search term</li>
                <li>Try searching with partial names or IDs</li>
                <li>Ensure you're searching in the correct field (name, ID, or contact)</li>
                <li>Clear the search box and try again</li>
              </ul>
            </div>
            <div className="troubleshooting-item">
              <h3>Issue: Page is not scrolling to top</h3>
              <ul>
                <li>Use the scroll-to-top button (↑) that appears when you scroll down</li>
                <li>Refresh the page if navigation seems stuck</li>
                <li>Check your browser's zoom level - try resetting to 100%</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">💡</div>
          <div className="section-content">
            <h2>Tips & Best Practices</h2>
            <ul className="help-list">
              <li>
                <strong>Regular Backups:</strong> Export your data regularly to Excel or PDF to maintain
                backups of important patient records.
              </li>
              <li>
                <strong>Complete Information:</strong> Fill in all available fields for comprehensive
                patient documentation and better reporting.
              </li>
              <li>
                <strong>Consistent Naming:</strong> Use consistent naming conventions for patient names
                to make searching easier.
              </li>
              <li>
                <strong>Review Before Saving:</strong> Always review imported or entered data before
                saving to ensure accuracy.
              </li>
              <li>
                <strong>Use Search Efficiently:</strong> The search function works across multiple fields,
                so you can quickly find patients using any identifying information.
              </li>
              <li>
                <strong>Dark Mode:</strong> Enable dark mode for comfortable viewing during extended
                use periods.
              </li>
            </ul>
          </div>
        </section>

        <section className="help-section">
          <div className="section-icon">📞</div>
          <div className="section-content">
            <h2>Support & Contact</h2>
            <p>
              If you encounter any issues or have questions not covered in this documentation:
            </p>
            <ul className="help-list">
              <li>Contact your system administrator for technical support</li>
              <li>Check the troubleshooting section above for common issues</li>
              <li>Ensure you're using a supported browser (Chrome, Firefox, Edge, Safari)</li>
              <li>Clear your browser cache if you experience persistent issues</li>
            </ul>
            <div className="info-box">
              <strong>System Version:</strong> Medical Reports Management System v1.0.0<br />
              <strong>Last Updated:</strong> {new Date().getFullYear()}
            </div>
          </div>
        </section>

        {showScrollTop && (
          <button 
            className="scroll-to-top-btn" 
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  )
}

export default Help

