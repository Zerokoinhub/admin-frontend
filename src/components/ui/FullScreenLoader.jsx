"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-30 h-30">
        {/* <Image
          src="/logo.svg"
          alt="Loading"
          fill
          className="object-contain z-10 relative"
        /> */}
        <motion.div
          className="absolute inset-[-20] border-4 h-40 w-40 border-t-transparent border-white rounded-full animate-spin"
          style={{ animationDuration: "1.2s" }}
        />
      </div>
    </div>
  );
}
