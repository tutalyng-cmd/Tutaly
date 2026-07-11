'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedNumber({ value }: { value: number }) {
  const [inView, setInView] = useState(false);
  const springValue = useSpring(0, {
    stiffness: 40,
    damping: 15,
  });

  const display = useTransform(springValue, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    if (inView) {
      springValue.set(value);
    }
  }, [inView, value, springValue]);

  return (
    <motion.span
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
    >
      {display}
    </motion.span>
  );
}
