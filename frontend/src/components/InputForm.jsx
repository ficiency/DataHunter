import { useState } from 'react'
import { motion } from 'framer-motion'

const US_STATES = [
  { code: '', name: 'Select a state (optional)' },
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

function InputForm({ onStartScan }) {
  const [formData, setFormData] = useState({
    fullName: '',
    state: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.fullName.trim()) {
      setError('Please enter a full name')
      return
    }

    if (formData.fullName.trim().split(' ').length < 2) {
      setError('Please enter both first and last name')
      return
    }

    setIsLoading(true)

    // Simulate brief delay for better UX
    setTimeout(() => {
      onStartScan({
        targetName: formData.fullName.trim(),
        state: formData.state || undefined
      })
    }, 500)
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="minimal-card rounded-xl shadow-2xl p-8 border border-border-dark">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/logo.png" alt="DataHunter Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-black tracking-tight">
              DataHunter
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Find where your data exists online
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
              Full Name <span className="text-primary">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-border-dark rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* State Select */}
          <div>
            <label htmlFor="state" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
              State (Optional)
            </label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-border-dark rounded-lg text-black focus:outline-none focus:border-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {US_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-error/10 border border-error/30 rounded-lg p-3 text-error text-xs"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.99 }}
            className={`w-full py-4 rounded-lg font-medium text-white transition-all ${
              isLoading
                ? 'bg-primary/50 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover glow'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Starting Scan...
              </span>
            ) : (
              'Start Scanning'
            )}
          </motion.button>
        </form>

        {/* Footer Note */}
        <p className="text-xs text-gray-600 text-center mt-6">
          Scanning public data broker websites
        </p>
      </div>
    </motion.div>
  )
}

export default InputForm

