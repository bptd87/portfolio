import React from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';

interface CounterAnimationProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function CounterAnimation({ value, suffix = '', duration = 2, className = '' }: CounterAnimationProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '0px' });
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  React.useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.floor(latest));
    });

    return () => unsubscribe();
  }, [springValue]);

  return (
    <div ref={ref} className={className}>
      {displayValue}{suffix}
    </div>
  );
}
