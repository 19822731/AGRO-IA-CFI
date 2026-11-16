"use client"

import { motion } from "framer-motion"

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Deep Space Background */}
            <div className="absolute inset-0 bg-[#050505]" />

            {/* Animated Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-blue/20 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 2,
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-brand-green/10 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 18,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 5,
                }}
                className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] bg-brand-blue/10 rounded-full blur-[100px]"
            />
        </div>
    )
}
