import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

function ScanningView({ scanData, onComplete }) {
  const [scanId, setScanId] = useState(null)
  const [scanStatus, setScanStatus] = useState('pending')
  const [findings, setFindings] = useState([])
  const [scannedWebsites, setScannedWebsites] = useState(0)
  const totalWebsites = 15 // Total configured sites

  // Create scan
  useEffect(() => {
    const createScan = async () => {
      try {
        const response = await axios.post('/api/scans', {
          user_id: 'demo_user',
          target_name: scanData.targetName,
          state: scanData.state,
          priority: 5
        })
        
        setScanId(response.data.scan.id)
        setScanStatus('processing')
      } catch (error) {
        console.error('Failed to create scan:', error)
        alert('Failed to start scan. Please try again.')
      }
    }

    createScan()
  }, [scanData])

  // Poll for updates
  useEffect(() => {
    if (!scanId || scanStatus === 'completed' || scanStatus === 'failed') {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/scans/${scanId}`)
        const { scan, findings: scanFindings } = response.data

        console.log('Poll response:', { 
          status: scan.status, 
          findingsCount: scanFindings.length 
        })

        setScanStatus(scan.status)
        setFindings(scanFindings)

        // Count unique websites that have been scanned
        const uniqueWebsites = new Set(
          scanFindings.map(f => f.website_url)
        )
        
        // Update counter (if completed, show all 3)
        if (scan.status === 'completed' || scan.status === 'failed') {
          setScannedWebsites(totalWebsites)
        } else {
          setScannedWebsites(uniqueWebsites.size)
        }

        // Check if completed
        if (scan.status === 'completed' || scan.status === 'failed') {
          clearInterval(pollInterval)
          setTimeout(() => {
            onComplete({
              scan,
              findings: scanFindings,
              totalSites: totalWebsites
            })
          }, 1000)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [scanId, scanStatus, onComplete, totalWebsites])

  return (
    <motion.div
      className="w-full max-w-xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="minimal-card rounded-xl shadow-2xl p-5 border border-border-dark">
        <div className="text-center">
          <motion.h2
            className="text-xl font-semibold text-black tracking-tight"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔎︎ Searching for <span className="text-primary">{scanData.targetName}</span>
            {scanData.state && <span className="text-primary">, {scanData.state}</span>} across{' '}
            <span className="font-bold">{scannedWebsites}/{totalWebsites}</span> websites 🌐
          </motion.h2>
        </div>
      </div>
    </motion.div>
  )
}

export default ScanningView

