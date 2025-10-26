import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InputForm from './components/InputForm'
import ScanningView from './components/ScanningView'
import ResultsView from './components/ResultsView'
import NetworkBackground from './components/NetworkBackground'

function App() {
  const [currentView, setCurrentView] = useState('input') // 'input' | 'scanning' | 'results'
  const [scanData, setScanData] = useState(null)
  const [scanResults, setScanResults] = useState(null)
  const [activeNodes, setActiveNodes] = useState(0)

  const handleStartScan = (formData) => {
    setScanData(formData)
    setActiveNodes(0) // Reset nodes
    setCurrentView('scanning')
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
    setCurrentView('input')
  }

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

        {currentView === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <ScanningView 
              scanData={scanData} 
              onComplete={handleScanComplete} 
            />
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

