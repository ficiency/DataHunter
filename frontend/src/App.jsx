import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import InputForm from './components/InputForm'
import ResultsView from './components/ResultsView'
import NetworkBackground from './components/NetworkBackground'

function App() {
  const [currentView, setCurrentView] = useState('input') // 'input' | 'scanning' | 'results'
  const [scanData, setScanData] = useState(null)
  const [scanResults, setScanResults] = useState(null)
  const [activeNodes, setActiveNodes] = useState(0)
  const [scanId, setScanId] = useState(null)
  const totalWebsites = 40

  const handleStartScan = async (formData) => {
    setScanData(formData)
    setActiveNodes(0)
    setCurrentView('scanning')
    
    // Create scan
    try {
      const response = await axios.post('/api/scans', {
        user_id: 'demo_user',
        target_name: formData.targetName,
        state: formData.state,
        priority: 5
      })
      
      setScanId(response.data.scan.id)
    } catch (error) {
      console.error('Failed to create scan:', error)
      alert('Failed to start scan. Please try again.')
      setCurrentView('input')
    }
  }

  const handleScanComplete = (results) => {
    setScanResults(results)
    // Activate nodes based on findings count
    const findingsCount = results.findings?.length || 0
    setActiveNodes(Math.min(findingsCount * 3, 50)) // Max 50 nodes
    setCurrentView('results')
  }

  const handleNewScan = () => {
    setScanData(null)
    setScanResults(null)
    setActiveNodes(0)
    setScanId(null)
    setCurrentView('input')
  }

  // Poll for scan results
  useEffect(() => {
    if (!scanId || currentView !== 'scanning') {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/scans/${scanId}`)
        const { scan, findings } = response.data

        // Switch to results view as soon as we have findings
        if (findings.length > 0) {
          clearInterval(pollInterval)
          handleScanComplete({
            scan,
            findings,
            totalSites: totalWebsites
          })
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [scanId, currentView])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Animated network background */}
      <NetworkBackground 
        activeNodes={activeNodes} 
        isScanning={currentView === 'scanning'}
      />
      
      {/* Main content with higher z-index */}
      <div className="relative z-10 w-full">
      <AnimatePresence mode="wait">
        {currentView === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <InputForm onStartScan={handleStartScan} />
          </motion.div>
        )}

        {currentView === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsView 
              results={scanResults} 
              onNewScan={handleNewScan} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}

export default App

