import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../../components/ui/utils';

interface ParallaxImageProps {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string;
    priority?: boolean;
}

function useParallax(value: MotionValue<number>, distance: number) {
    return useTransform(value, [0, 1], [-distance, distance]);
}

export function ParallaxImage({
    src,
    alt,
    className,
    aspectRatio = "aspect-video",
    priority = false
}: ParallaxImageProps) {
    const [hasScrollTarget, setHasScrollTarget] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current) {
            setHasScrollTarget(true);
        }
    }, []);
    const { scrollYProgress } = useScroll({ target: hasScrollTarget ? ref : undefined });
    const y = useParallax(scrollYProgress, 50);

    return (
        <div
            ref={ref}
            className={cn("relative overflow-hidden w-full", aspectRatio, className)}
        >
            <motion.div style={{ y }} className="absolute inset-0 h-[120%] -top-[10%] w-full">
                <ImageWithFallback
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    priority={priority}
                    responsive={true}
                    sizes="100vw"
                />
            </motion.div>
            <div className="absolute inset-0 bg-black/10" />
        </div>
    );
}
