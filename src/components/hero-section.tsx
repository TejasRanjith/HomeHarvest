'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8 text-center"
    >
      <h1 className="text-4xl font-bold text-primary mb-2">
        Fresh from Thrissur Farms
      </h1>
      <p className="text-gray-600 text-lg">
        Local produce, delivered to your door
      </p>
      <Link
        href="/register"
        className="inline-block mt-4 bg-cta-yellow text-cta-text px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105"
      >
        Get Started
      </Link>
    </motion.div>
  )
}
