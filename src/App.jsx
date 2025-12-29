import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PatientForm from './Components/PatientForm'
import PatientList from './Components/PatientList'
import PatientDetails from './Components/PatientDetails'
import AudiometryReport from './Components/AudiometryReport'
import AboutUs from './Components/AboutUs'
import Help from './Components/Help'
import SystemInfo from './Components/SystemInfo'
import Contact from './Components/Contact'
import Header from './Components/Header'
import Footer from './Components/Footer'
import Login from './Components/Auth/Login'
import ScrollToTop from './Components/ScrollToTop'
import './App.css'

function App() {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('medicalReports')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('medicalReports', JSON.stringify(patients))
  }, [patients])

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hospitalSettings')
    return saved ? JSON.parse(saved) : {
      hospitalName: 'Hospital Name',
      hospitalAddress1: 'Hospital Address Line 1',
      hospitalAddress2: 'Hospital Address Line 2',
      companyName: 'Company Name'
    }
  })

  useEffect(() => {
    localStorage.setItem('hospitalSettings', JSON.stringify(settings))
  }, [settings])

  const addPatient = (patientData) => {
    const newPatient = {
      ...patientData,
      id: patientData.id || Date.now().toString(),
      createdAt: patientData.createdAt || new Date().toISOString()
    }
    setPatients(prevPatients => [...prevPatients, newPatient])
  }

  const addMultiplePatients = (patientsArray) => {
    const baseTime = Date.now()
    const newPatients = patientsArray.map((patientData, index) => ({
      ...patientData,
      id: patientData.id || (baseTime + index).toString(),
      createdAt: patientData.createdAt || new Date().toISOString()
    }))
    setPatients(prevPatients => [...prevPatients, ...newPatients])
  }

  const updatePatient = (id, patientData) => {
    setPatients(patients.map(p => p.id === id ? { ...patientData, id } : p))
  }

  const deletePatient = (id) => {
    setPatients(patients.filter(p => p.id !== id))
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ScrollToTop />
        <div className="app">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--medical-card-bg)',
              color: 'var(--medical-text)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px var(--medical-shadow)',
              border: '1px solid var(--medical-border)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: '#10b981',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: '#ef4444',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              },
            },
          }}
        />
        <Header 
          hospitalName={settings.hospitalName}
          hospitalAddress1={settings.hospitalAddress1}
          hospitalAddress2={settings.hospitalAddress2}
          companyName={settings.companyName}
        />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <PatientList 
                  patients={patients} 
                  onDelete={deletePatient}
                />
              } 
            />
            <Route 
              path="/new" 
              element={
                <PatientForm 
                  onSave={addPatient}
                  onBulkSave={addMultiplePatients}
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              } 
            />
            <Route 
              path="/edit/:id" 
              element={
                <PatientForm 
                  patients={patients}
                  onSave={updatePatient}
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              } 
            />
            <Route 
              path="/patient/:id" 
              element={
                <PatientDetails 
                  patients={patients}
                />
              } 
            />
            <Route 
              path="/audiometry" 
              element={
                <AudiometryReport />
              } 
            />
            <Route 
              path="/about" 
              element={<AboutUs />} 
            />
            <Route 
              path="/help" 
              element={<Help />} 
            />
            <Route 
              path="/system-info" 
              element={<SystemInfo />} 
            />
            <Route 
              path="/contact" 
              element={<Contact />} 
            />
            <Route 
              path="/login" 
              element={<Login />} 
            />
          </Routes>
        </main>
        <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
