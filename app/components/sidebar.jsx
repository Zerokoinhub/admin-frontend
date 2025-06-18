'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  Wallet,
  User,
  Book,
  Trophy,
  Calculator,
  Settings,
} from 'lucide-react'
import MenuButton from './MenuButton'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {/* === Mobile View Sidebar + Backdrop === */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sliding Sidebar */}
          <motion.div
            className="fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 py-6 flex flex-col shadow-md md:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <SidebarContent />
          </motion.div>
        </>
      )}

      {/* === Desktop Static Sidebar === */}
      <div className="hidden md:flex md:flex-col md:w-64 md:h-screen md:border-r md:border-gray-200 md:bg-white md:py-6">
        <SidebarContent />
      </div>
    </AnimatePresence>
  )
}

function SidebarContent({ onClose }) {
  return (
    <>
      {/* Logo and nav */}
      <div className="flex items-center gap-2 text-xl px-9 font-semibold text-cyan-700 mb-6">
        <Image src="/logo.png" alt="Zerokoin Logo" width={33} height={33} />
        <span className="text-3xl">Zerokoin</span>
      </div>

      <hr className="border-gray-300 mb-6" />

      <nav>
        <ul className="space-y-2 px-4">
          <li>
            <MenuButton label="Dashboard" Icon={LayoutDashboard} path="/" onClick={onClose} />
          </li>
          <li>
            <MenuButton label="User Management" Icon={Users} path="/user-management" onClick={onClose} />
          </li>
          <li>
            <MenuButton label="Coin Transfer" Icon={Wallet} path="/coin-transfer" onClick={onClose} />
          </li>
          <li>
            <MenuButton label="User Profile" Icon={User} path="/user-profile" onClick={onClose} />
          </li>
          <li>
            <MenuButton label="Course Management" Icon={Book} path="/course-management" onClick={onClose} />
          </li>
          <li>
            <MenuButton label="Rewards System" Icon={Trophy} path="/rewards-system" onClick={onClose} />
          </li>
          <li>
            <MenuButton label="Calculator" Icon={Calculator} path="/calculator" onClick={onClose} />
          </li>
          <li>
            <MenuButton label="Setting" Icon={Settings} path="/setting" onClick={onClose} />
          </li>
        </ul>
      </nav>
    </>
  );
}

