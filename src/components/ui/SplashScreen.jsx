// src/components/ui/SplashScreen.jsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import logo from "../../../public/logo.svg"

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="w-screen h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(to right, #0398a6, #d4c905)',
      }}
    >
      <div className="relative w-[300px] h-[210px]">
        <Image
          src={logo}
          alt="Splash Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </motion.div>
  );
}
