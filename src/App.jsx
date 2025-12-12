import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PatientForm from './Components/PatientForm'
import PatientList from './Components/PatientList'
import PatientDetails from './Components/PatientDetails'
import Header from './Components/Header'
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
    <div className="app">
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
        </Routes>
      </main>
    </div>
  )
}

export default App
