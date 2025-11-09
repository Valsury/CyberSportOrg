"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  delay?: number
  scale?: boolean
  className?: string
}

export function AnimatedCard({ children, delay = 0, scale = false, className }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...(scale ? { scale: 0.9 } : { y: 20 }) }}
      animate={{ opacity: 1, ...(scale ? { scale: 1 } : { y: 0 }) }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

