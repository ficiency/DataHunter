import { useEffect, useRef } from 'react'

function NetworkBackground({ activeNodes = 0, isScanning = false }) {
  const canvasRef = useRef(null)
  const nodesRef = useRef([])
  const animationFrameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight

    // Set canvas size
    const setCanvasSize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    setCanvasSize()

    // Create nodes ONLY ONCE
    const createNodes = () => {
      const nodeCount = Math.floor((width * height) / 15000)
      const nodes = []

      for (let i = 0; i < nodeCount; i++) {
        const baseVx = (Math.random() - 0.5) * 0.3
        const baseVy = (Math.random() - 0.5) * 0.3
        
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: baseVx,
          vy: baseVy,
          baseVx: baseVx, // Store base velocity to multiply later
          baseVy: baseVy,
          radius: Math.random() * 3 + 2,
          active: false
        })
      }

      return nodes
    }

    // Only create nodes if they don't exist
    if (nodesRef.current.length === 0) {
      nodesRef.current = createNodes()
    }

    // Activate nodes based on findings
    const activateNodes = () => {
      const nodesToActivate = Math.min(activeNodes, nodesRef.current.length)
      
      // Reset all nodes first
      nodesRef.current.forEach(node => {
        node.active = false
      })

      // Activate random nodes
      for (let i = 0; i < nodesToActivate; i++) {
        const randomIndex = Math.floor(Math.random() * nodesRef.current.length)
        nodesRef.current[randomIndex].active = true
      }
    }

    activateNodes()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Update and draw nodes
      nodesRef.current.forEach((node, i) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1

        // Keep within bounds
        node.x = Math.max(0, Math.min(width, node.x))
        node.y = Math.max(0, Math.min(height, node.y))

        // Draw connections to nearby nodes
        nodesRef.current.slice(i + 1).forEach(otherNode => {
          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Only connect if close enough (increased distance for more connections)
          if (distance < 200) {
            const opacity = (1 - distance / 200) * 0.3 // More visible lines
            ctx.strokeStyle = `rgba(150, 150, 150, ${opacity})`
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            ctx.stroke()
          }
        })

        // Draw node with border
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        
        if (node.active) {
          // Blue for active nodes with glow
          ctx.fillStyle = '#0066FF'
          ctx.shadowBlur = 15
          ctx.shadowColor = '#0066FF'
          ctx.fill()
          ctx.shadowBlur = 0
          
          // White border for active nodes
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 2
          ctx.stroke()
        } else {
          // Gray for inactive nodes
          ctx.fillStyle = '#999999'
          ctx.shadowBlur = 0
          ctx.fill()
          
          // White border for better visibility
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      setCanvasSize()
      // Don't recreate nodes, just adjust canvas size
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, []) // Only run once on mount

  // Update velocity when scanning state changes
  useEffect(() => {
    if (nodesRef.current.length === 0) return

    const velocityMultiplier = isScanning ? 9 : 1

    nodesRef.current.forEach(node => {
      node.vx = node.baseVx * velocityMultiplier
      node.vy = node.baseVy * velocityMultiplier
    })
  }, [isScanning])

  // Update active nodes when prop changes
  useEffect(() => {
    if (nodesRef.current.length === 0) return

    const nodesToActivate = Math.min(activeNodes, nodesRef.current.length)
    
    // Reset all nodes
    nodesRef.current.forEach(node => {
      node.active = false
    })

    // Activate random nodes
    for (let i = 0; i < nodesToActivate; i++) {
      const randomIndex = Math.floor(Math.random() * nodesRef.current.length)
      nodesRef.current[randomIndex].active = true
    }
  }, [activeNodes])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

export default NetworkBackground

