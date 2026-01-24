import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionProps } from 'motion/react';
import { optimizeSupabaseImage } from '../../utils/supabase-image-optimizer';

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
    fetchpriority?: string; // For resolving React warning vs TS types
    width?: number; // Optimization width
}

export function ParallaxImageComponent({ src, alt, className = '', offset = 50, width = 1200, style, ...props }: ParallaxImageProps) {
    const [hasScrollTarget, setHasScrollTarget] = React.useState(false);
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: hasScrollTarget ? ref : undefined,
        offset: ["start end", "end start"],
    });

    React.useEffect(() => {
        if (ref.current) {
            setHasScrollTarget(true);
        }
    }, []);

    // Moves the image from -offset to +offset based on scroll position
    const y = useSpring(useTransform(scrollYProgress, [0, 1], [-offset, offset]), {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Scale up slightly to prevent whitespace when moving
    const scale = 1.25;

    // --- Optimization & Fallback Logic ---
    const [retryWithRaw, setRetryWithRaw] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    // Try to optimize for a "card" size (large but not full raw 4k)
    // using 'cover' resize mode
    const optimizedSrc = React.useMemo(() => {
        if (!src) return '';
        // If we are retrying with raw, just return raw
        if (retryWithRaw) return src;

        // Otherwise try to optimize
        // Using 'card' preset-ish dimensions (approx 900-1200w depending on usage)
        // Home page cards are quite large, let's go with 1200w for quality
        return optimizeSupabaseImage(src, { width, quality: 80, format: 'webp', resize: 'cover' }) || src;
    }, [src, retryWithRaw, width]);

    const handleError = () => {
        if (!retryWithRaw && optimizedSrc !== src) {
            console.warn('ParallaxImage optimization failed, retrying with raw:', src);
            setRetryWithRaw(true);
        } else {
            console.error('ParallaxImage failed to load even with raw src:', src);
            setHasError(true);
        }
    };

    // If absolutely failed, hide or show fallback (optional, for now just keeping existing behavior of empty)
    if (hasError && !src) return null;

    return (
        <div ref={ref} className={`overflow-hidden relative ${className}`}>
            <motion.img
                src={optimizedSrc}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                style={{
                    y,
                    scale,
                    transformOrigin: style?.objectPosition || 'center center',
                    ...style
                } as any}
                onError={handleError}
                {...props as any}
            />
        </div>
    );
}

export const ParallaxImage = React.memo(ParallaxImageComponent);

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
