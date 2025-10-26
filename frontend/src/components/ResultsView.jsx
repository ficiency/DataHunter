import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import FindingCard from './FindingCard'
import { ScanDurationCard, SitesFoundCard, ExposureCard } from './MetricsCard'

// Website Details Component
function WebsiteDetails({ website, findings }) {
  const getWebsiteName = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getTypeEmoji = (type) => {
    switch (type) {
      case 'email':
        return '📧'
      case 'phone':
        return '📱'
      case 'address':
        return '📍'
      case 'name':
        return '👤'
      default:
        return '📄'
    }
  }

  const groupedByType = findings.reduce((acc, finding) => {
    if (!acc[finding.data_type]) {
      acc[finding.data_type] = []
    }
    acc[finding.data_type].push(finding)
    return acc
  }, {})

  const dataTypes = Object.keys(groupedByType)
  const websiteName = getWebsiteName(website)
  
  // Get screenshot path (should be the same for all findings from the same site)
  const screenshotPath = findings[0]?.screenshot_path

  return (
    <div>
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-gray-300">
        <h4 className="text-sm font-semibold text-black truncate">
          {websiteName}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {findings.length} data point{findings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Screenshot */}
      {screenshotPath && (
        <div className="mb-4">
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Preview
          </h4>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <img 
              src={`http://localhost:3000/${screenshotPath}`}
              alt={`Screenshot of ${websiteName}`}
              className="w-full h-auto"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <div 
              style={{ display: 'none' }}
              className="p-4 text-center text-gray-400 text-xs"
            >
              Screenshot not available
            </div>
          </div>
        </div>
      )}

      {/* Summary by type */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {dataTypes.map(type => (
          <div
            key={type}
            className="bg-white border border-gray-200 rounded-lg p-2"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getTypeEmoji(type)}</span>
              <div>
                <p className="text-xs text-gray-400 capitalize">
                  {type}
                </p>
                <p className="text-sm font-medium text-black">
                  {groupedByType[type].length}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed findings */}
      <div className="space-y-1">
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Found Data
        </h4>
        {findings.slice(0, 10).map((finding, index) => (
          <div
            key={finding.id}
            className="flex items-start space-x-2 text-sm py-1"
          >
            <span className="text-base">{getTypeEmoji(finding.data_type)}</span>
            <div className="flex-1 min-w-0">
              <span className="text-gray-400 capitalize text-xs">
                {finding.data_type}:
              </span>
              <span className="text-black ml-2 font-mono text-xs break-all">
                {finding.found_value}
              </span>
            </div>
          </div>
        ))}
        {findings.length > 10 && (
          <p className="text-xs text-gray-600 italic pt-2">
            +{findings.length - 10} more
          </p>
        )}
      </div>

      {/* Website link */}
      <div className="mt-4 pt-3 border-t border-gray-300">
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-primary hover:text-primary-light transition font-medium"
        >
          View on website
          <svg
            className="w-3 h-3 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  )
}

function ResultsView({ results, onNewScan }) {
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [scan, setScan] = useState(results.scan)
  const [findings, setFindings] = useState(results.findings)
  const [isScanning, setIsScanning] = useState(results.scan.status === 'processing')

  // Continue polling if scan is still in progress
  useEffect(() => {
    if (scan.status !== 'completed' && scan.status !== 'failed') {
      setIsScanning(true) // Ensure scanning is true while polling
      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/scans/${scan.id}`)
          setScan(response.data.scan)
          setFindings(response.data.findings)
          
          if (response.data.scan.status === 'completed' || response.data.scan.status === 'failed') {
            setIsScanning(false)
            clearInterval(pollInterval)
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, 2000)
      
      return () => clearInterval(pollInterval)
    } else {
      setIsScanning(false) // Set to false if scan is already completed
    }
  }, [scan.id, scan.status])

  // Group findings by website
  const groupFindingsByWebsite = () => {
    const grouped = {}
    findings.forEach(finding => {
      const url = finding.website_url
      if (!grouped[url]) {
        grouped[url] = []
      }
      grouped[url].push(finding)
    })
    return grouped
  }

  const groupedFindings = groupFindingsByWebsite()
  
  // Keep websites in the order they arrive (reverse to show oldest first)
  const sortedWebsites = Object.entries(groupedFindings).reverse()
  
  const sitesWithData = Object.keys(groupedFindings).length
  const totalFindings = findings.length
  const totalSites = results.totalSites
  // If scan is complete, show all sites scanned, otherwise show sites with data found so far
  const scannedSites = isScanning ? sitesWithData : totalSites
  const percentage = ((sitesWithData / totalSites) * 100).toFixed(1)

  return (
    <motion.div
        className="w-full max-w-7xl mx-auto px-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="minimal-card rounded-xl shadow-2xl p-6 border border-border-dark">
          {/* Header */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo.png" alt="DataHunter Logo" className="h-6 w-6" />
                <h2 className="text-xl font-semibold text-black tracking-tight">
                  DataHunter | {isScanning ? 'Scan in Progress...' : 'Scan Complete'}
                </h2>
              </div>
            </div>
            
            {/* Start New Scan Button - Absolute positioned */}
            <motion.button
              onClick={onNewScan}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-0 top-0 px-6 py-2 bg-primary hover:bg-primary-hover rounded-lg font-medium text-white text-sm transition-all glow"
            >
              Start New Scan
            </motion.button>
          </motion.div>

          {/* 3-Column Layout */}
          <div className="flex gap-6 mb-8" style={{ minHeight: '460px', maxHeight: '460px' }}>
            {/* Left Column - Metrics (15% width) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0 space-y-4"
              style={{ width: '15%' }}
            >
              <SitesFoundCard
                sitesWithData={sitesWithData}
                totalSites={results.totalSites}
                totalFindings={totalFindings}
              />
              <ExposureCard
                percentage={percentage}
              />
              <ScanDurationCard
                selectedWebsite={selectedWebsite}
                findings={groupedFindings[selectedWebsite]}
                isScanning={isScanning}
              />
            </motion.div>

            {/* Middle Column - Website Cards (45% width) */}
            <div className="flex-shrink-0 space-y-3 overflow-y-auto overflow-x-hidden website-list-scroll pr-3" style={{ width: '45%', maxHeight: '600px' }}>
              {/* Completed websites */}
              {sortedWebsites.map(([website, findings], index) => (
                <motion.div
                  key={website}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <FindingCard
                    website={website}
                    findings={findings}
                    isSelected={selectedWebsite === website}
                    onClick={() => setSelectedWebsite(website)}
                  />
                </motion.div>
              ))}
              
              {/* No data found (only if scan complete and no results) */}
              {!isScanning && sortedWebsites.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-8"
                >
                  <h3 className="text-lg font-semibold text-black mb-2">
                    No Data Found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Your information was not found on any scanned websites
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right Column - Details Panel (40% width) */}
            <div className="flex-1 bg-gray-50 rounded-lg p-5 border border-gray-200 overflow-y-auto overflow-x-hidden website-list-scroll" style={{ maxHeight: '600px' }}>
              {selectedWebsite ? (
                <WebsiteDetails 
                  website={selectedWebsite} 
                  findings={groupedFindings[selectedWebsite]} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-gray-400 text-sm">
                      Select a website to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
  )
}

export default ResultsView

