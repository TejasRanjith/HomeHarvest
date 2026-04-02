'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const floatingItems = [
  { emoji: '🥬', delay: 0, x: 10, y: 20, duration: 6 },
  { emoji: '🍅', delay: 1, x: 80, y: 15, duration: 7 },
  { emoji: '🥕', delay: 2, x: 70, y: 70, duration: 5 },
  { emoji: '🐔', delay: 0.5, x: 20, y: 75, duration: 8 },
  { emoji: '🐟', delay: 1.5, x: 85, y: 50, duration: 6.5 },
  { emoji: '🌶️', delay: 3, x: 50, y: 85, duration: 7.5 },
]

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-terracotta/10 to-cta-yellow/20 p-8 md:p-12 mb-8"
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingItems.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl md:text-5xl opacity-20"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </div>

      {/* Mouse-following gradient overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(143, 188, 143, 0.15) 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4"
            whileHover={{ scale: 1.05 }}
          >
            🌱 Fresh from Thrissur Farms
          </motion.span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Farm Fresh,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-terracotta">
            Delivered Local
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Hyperlocal marketplace connecting Thrissur&apos;s local farms directly to your kitchen. 
          Fresh vegetables, country chicken, nadan fish, and more.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            href="/register"
            className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/30"
          >
            <span className="relative z-10">Start Shopping</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary to-green-600"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
          
          <Link
            href="/login"
            className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold text-lg hover:border-primary hover:text-primary transition-all"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { value: '50+', label: 'Local Farms' },
            { value: '1000+', label: 'Happy Customers' },
            { value: '24h', label: 'Farm to Door' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
