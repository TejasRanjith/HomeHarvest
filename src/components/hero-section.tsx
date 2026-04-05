'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function HeroSection() {

  return (
    <section className="w-full relative py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Banner (Left) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 relative bg-gradient-to-br from-[#c4b5fd] to-[#a78bfa] rounded-3xl p-8 md:p-12 min-h-[400px] flex items-center overflow-hidden shadow-md"
        >
          {/* Abstract circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/4" />
          
          <div className="relative z-10 max-w-lg">
            <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold uppercase tracking-wider mb-4 border border-white/30 text-shadow-sm">
              Thrissur, Kerala
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.15] text-shadow-md">
              Farm Fresh<br />
              <span className="text-white">Delivered Daily</span>
            </h1>
            <p className="text-3xl font-extrabold text-white mb-8 tracking-wide">
              $59.00
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-3 bg-[#6b21a8]/80 text-white font-medium rounded-full hover:bg-[#6b21a8] transition shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </motion.div>

        {/* Side Banners (Right) */}
        <div className="flex flex-col gap-6">
          {/* Top Right Banner */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 bg-gradient-to-tr from-[#93c5fd] to-[#60a5fa] rounded-3xl p-6 relative overflow-hidden shadow-md flex flex-col justify-center"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2 text-shadow-sm">Fresh Organic<br />Mangoes</h3>
              <p className="text-xs text-white/90 uppercase tracking-widest mb-1">From</p>
              <p className="text-xl font-extrabold text-white mb-4">₹120.00/kg</p>
              <Link href="/register" className="inline-block px-5 py-2 bg-white text-blue-600 text-xs font-bold rounded-full hover:shadow-md transition">
                Shop Now
              </Link>
            </div>
          </motion.div>

          {/* Bottom Right Banner */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-gradient-to-tr from-[#99f6e4] to-[#2dd4bf] rounded-3xl p-6 relative overflow-hidden shadow-md flex flex-col justify-center"
          >
            <div className="relative z-10 w-2/3">
              <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">Palakkadan Matta Rice</h3>
              <div className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md mb-3 shadow-sm">
                15% OFF
              </div>
              <br />
              <Link href="/register" className="inline-block px-5 py-2 bg-white text-teal-600 text-xs font-bold rounded-full hover:shadow-md transition">
                Shop Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}