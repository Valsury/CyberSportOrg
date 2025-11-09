"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedHoverCardProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function AnimatedHoverCard({ children, delay = 0, className }: AnimatedHoverCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

