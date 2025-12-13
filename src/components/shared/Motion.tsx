import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionProps } from 'motion/react';

// --- RevealText Component ---
interface RevealTextProps {
    text: string;
    className?: string;
    delay?: number;
    stagger?: number;
}

export function RevealText({ text, className = '', delay = 0, stagger = 0.05 }: RevealTextProps) {
    const words = text.split(' ');

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: stagger, delayChildren: delay * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 100,
            } as const,
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 100,
            } as const,
        },
    };

    return (
        <motion.div
            className={`inline-block overflow-visible [clip-path:inset(0)] ${className}`}
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {words.map((word, index) => (
                <span key={index} className="inline-block whitespace-nowrap">
                    <motion.span
                        variants={child}
                        className="inline-block relative top-[0.1em]"
                    >
                        {word}
                    </motion.span>
                    {index < words.length - 1 && (
                        <span className="inline-block">&nbsp;</span>
                    )}
                </span>
            ))}
        </motion.div>
    );
}

// --- ParallaxImage Component ---
interface ParallaxImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    offset?: number; // How much the image moves (e.g., 50px)
}

export function ParallaxImage({ src, alt, className = '', offset = 50, style, ...props }: ParallaxImageProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    // Moves the image from -offset to +offset based on scroll position
    const y = useSpring(useTransform(scrollYProgress, [0, 1], [-offset, offset]), {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Scale up slightly to prevent whitespace when moving
    const scale = 1.1;

    return (
        <div ref={ref} className={`overflow-hidden relative ${className}`}>
            <motion.img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                style={{
                    y,
                    scale,
                    ...style
                } as any}
                {...props as any}
            />
        </div>
    );
}

// --- FadeInUp Component ---
interface FadeInUpProps extends MotionProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    enableInView?: boolean;
}

export function FadeInUp({ children, delay = 0, className = '', enableInView = true, ...props }: FadeInUpProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={enableInView ? undefined : { opacity: 1, y: 0 }}
            whileInView={enableInView ? { opacity: 1, y: 0 } : undefined}
            viewport={enableInView ? { once: true, margin: "-10%" } : undefined}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
