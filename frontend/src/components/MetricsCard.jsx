import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Card 0: Processing Time per Website
export function ScanDurationCard({ selectedWebsite, findings, isScanning = false }) {
  const [animatedDuration, setAnimatedDuration] = useState(0)
  const [prevDuration, setPrevDuration] = useState(0)
  
  // Get processing time from first finding (all findings from same website have same processing_time)
  const getProcessingTime = () => {
    if (!findings || findings.length === 0) return 0
    const processingTime = parseFloat(findings[0]?.processing_time || 0)
    return isNaN(processingTime) ? 0 : processingTime
  }
  
  const duration = getProcessingTime()

  useEffect(() => {
    if (duration === prevDuration) return  // No change, skip animation
    
    const animDuration = 800
    const steps = 20
    const difference = duration - animatedDuration
    const increment = difference / steps
    let current = animatedDuration

    const interval = setInterval(() => {
      current += increment
      if ((increment > 0 && current >= duration) || (increment < 0 && current <= duration)) {
        setAnimatedDuration(duration)
        setPrevDuration(duration)
        clearInterval(interval)
      } else {
        setAnimatedDuration(current)
      }
    }, animDuration / steps)

    return () => clearInterval(interval)
  }, [duration, selectedWebsite])

  // Get website name for display
  const getWebsiteName = (url) => {
    if (!url) return '---'
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return 'Select a site'
    }
  }

  return (
    <div>
      <div className="bg-white border border-primary/30 rounded-lg p-4">
        <div className="text-center">
          <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-1">
            Processing Time
          </h3>
          <p className="text-gray-400 text-xs mb-3 truncate">
            {getWebsiteName(selectedWebsite)}
          </p>
          <motion.div
            className="text-4xl font-bold text-black mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            {duration > 0 ? (
              <>{animatedDuration.toFixed(2)}<span className="text-2xl text-gray-400">s</span></>
            ) : (
              <span className="text-2xl text-gray-400">--</span>
            )}
          </motion.div>
          <p className="text-gray-400 text-xs">
            {duration === 0 ? '⏳ Select a website' : duration < 2 ? '⚡ Lightning fast' : duration < 5 ? '🚀 Fast' : '✅ Completed'}
          </p>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-400">
          Status: <span className={isScanning ? 'text-blue-500' : 'text-green-500'}>
            {isScanning ? '🔄 Scanning' : '✓ Completed'}
          </span>
        </p>
      </div>
    </div>
  )
}

// Card 1: Sites Found
export function SitesFoundCard({ sitesWithData, totalSites, totalFindings }) {
  const [animatedCount, setAnimatedCount] = useState(0)

  useEffect(() => {
    const countDuration = 1000
    const countSteps = 20
    const difference = sitesWithData - animatedCount  // Calculate difference
    const countIncrement = difference / countSteps
    let currentCount = animatedCount  // Start from current value

    const countInterval = setInterval(() => {
      currentCount += countIncrement
      if ((countIncrement > 0 && currentCount >= sitesWithData) || 
          (countIncrement < 0 && currentCount <= sitesWithData)) {
        setAnimatedCount(sitesWithData)
        clearInterval(countInterval)
      } else {
        setAnimatedCount(Math.floor(currentCount))
      }
    }, countDuration / countSteps)

    return () => clearInterval(countInterval)
  }, [sitesWithData])

  return (
    <div className="bg-white border border-primary/30 rounded-lg p-4">
      <div className="text-center">
        <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3">
          Data Found On
        </h3>
        <motion.div
          className="text-4xl font-bold text-black mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          {animatedCount} <span className="text-2xl text-gray-400">of</span> {totalSites}
        </motion.div>
        <p className="text-gray-400 text-xs">
          {totalFindings} data points
        </p>
      </div>
    </div>
  )
}

// Card 2: Exposure Percentage
export function ExposureCard({ percentage }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    const percentDuration = 1000
    const percentSteps = 20
    const targetPercent = parseFloat(percentage)
    const difference = targetPercent - animatedPercentage  // Calculate difference
    const percentIncrement = difference / percentSteps
    let currentPercent = animatedPercentage  // Start from current value

    const percentInterval = setInterval(() => {
      currentPercent += percentIncrement
      if ((percentIncrement > 0 && currentPercent >= targetPercent) || 
          (percentIncrement < 0 && currentPercent <= targetPercent)) {
        setAnimatedPercentage(targetPercent)
        clearInterval(percentInterval)
      } else {
        setAnimatedPercentage(currentPercent)
      }
    }, percentDuration / percentSteps)

    return () => clearInterval(percentInterval)
  }, [percentage])

  return (
    <div className="bg-white border border-primary/30 rounded-lg p-4">
      <div className="text-center mb-3">
        <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-2">
          Exposure
        </h3>
        <motion.div
          className="text-3xl font-bold text-primary mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
        >
          {animatedPercentage.toFixed(1)}%
        </motion.div>
      </div>
      
      {/* Progress Bar */}
      <div className="overflow-hidden h-2 rounded-full bg-gray-200 border border-gray-300">
        <motion.div
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-primary"
        />
      </div>
    </div>
  )
}
