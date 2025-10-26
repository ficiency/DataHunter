import { motion } from 'framer-motion'

function FindingCard({ website, findings, isSelected, onClick }) {
  // Get website name from URL
  const getWebsiteName = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const websiteName = getWebsiteName(website)

  return (
    <motion.div 
      onClick={onClick}
      className={`rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'bg-primary/10 border-2 border-primary shadow-lg' 
          : 'bg-white border border-gray-300 hover:border-primary/50'
      }`}
    >
      <div className="p-3 flex items-center space-x-3">
        <span className={`text-lg ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
          ●
        </span>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm truncate ${isSelected ? 'text-primary' : 'text-black'}`}>
            {websiteName}
          </h3>
          <p className="text-gray-500 text-xs">
            {findings.length} data point{findings.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default FindingCard
