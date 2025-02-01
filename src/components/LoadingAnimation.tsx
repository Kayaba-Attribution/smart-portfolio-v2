"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function LoadingAnimation() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
            {/* Letters - static */}
            <div className="mb-8">
                <Image 
                    src="/SP_ONLY_LETTERS.png"
                    alt="SyntheticPortfolio"
                    width={200}
                    height={40}
                />
            </div>
            
            {/* Icon - spinning */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                <Image 
                    src="/SP_ONLY_ICON.png"
                    alt="Loading"
                    width={60}
                    height={60}
                />
            </motion.div>
        </div>
    )
} 