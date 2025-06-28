'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import logo from "../../../public/logo.svg";

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="w-screen h-screen flex items-center justify-center bg-gradient-to-r from-[#0398a6] to-[#d4c905]"
    >
      <div
        className="
          relative
          w-40 h-28          // mobile default
          sm:w-60 sm:h-40    // tablets
          md:w-72 md:h-52    // desktop
        "
      >
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
