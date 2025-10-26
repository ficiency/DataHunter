import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Card 0: Scan Duration
export function ScanDurationCard({ scan }) {
  const [animatedDuration, setAnimatedDuration] = useState(0)
  
  // Calculate duration in seconds
  const calculateDuration = () => {
    if (!scan?.completed_at || !scan?.created_at) return 0
    
    try {
      const completed = new Date(scan.completed_at)
      const created = new Date(scan.created_at)
      
      const durationMs = completed - created
      const durationSec = durationMs / 1000
      
      // If negative or invalid, return 0
      if (isNaN(durationSec) || durationSec < 0 || durationSec > 1000) {
        return 0
      }
      
      return durationSec
    } catch (error) {
      return 0
    }
  }
  
  const duration = calculateDuration()

  useEffect(() => {
    const durationMs = 1500
    const steps = 30
    const increment = duration / steps
    let current = 0

    const interval = setInterval(() => {
      current += increment
      if (current >= duration) {
        setAnimatedDuration(duration)
        clearInterval(interval)
      } else {
        setAnimatedDuration(current)
      }
    }, durationMs / steps)

    return () => clearInterval(interval)
  }, [duration])

  return (
    <div className="bg-white border border-primary/30 rounded-lg p-4">
      <div className="text-center">
        <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-3">
          Scan Time
        </h3>
        <motion.div
          className="text-4xl font-bold text-black mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          {duration > 0 ? (
            <>{animatedDuration.toFixed(1)}<span className="text-2xl text-gray-400">s</span></>
          ) : (
            <span className="text-2xl text-gray-400">--</span>
          )}
        </motion.div>
        <p className="text-gray-400 text-xs">
          {duration === 0 ? '⏳ Calculating...' : duration < 10 ? '⚡ Lightning fast' : duration < 30 ? '🚀 Fast' : '✅ Completed'}
        </p>
      </div>
    </div>
  )
}

// Card 1: Sites Found
export function SitesFoundCard({ sitesWithData, totalSites, totalFindings }) {
  const [animatedCount, setAnimatedCount] = useState(0)

  useEffect(() => {
    const countDuration = 1500
    const countSteps = 30
    const countIncrement = sitesWithData / countSteps
    let currentCount = 0

    const countInterval = setInterval(() => {
      currentCount += countIncrement
      if (currentCount >= sitesWithData) {
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
    const percentDuration = 1500
    const percentSteps = 30
    const percentIncrement = parseFloat(percentage) / percentSteps
    let currentPercent = 0

    const percentInterval = setInterval(() => {
      currentPercent += percentIncrement
      if (currentPercent >= parseFloat(percentage)) {
        setAnimatedPercentage(parseFloat(percentage))
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
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="h-full bg-primary"
        />
      </div>
    </div>
  )
}
