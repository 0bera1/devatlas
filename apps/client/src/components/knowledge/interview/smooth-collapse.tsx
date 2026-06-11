'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SmoothCollapseProps {
  readonly open: boolean;
  readonly children: ReactNode;
  readonly className?: string;
}

export function SmoothCollapse({
  open,
  children,
  className,
}: SmoothCollapseProps): ReactNode {
  const reduceMotion: boolean | null = useReducedMotion();
  const duration: number = reduceMotion === true ? 0 : 0.3;

  return (
    <motion.div
      initial={false}
      animate={{
        height: open ? 'auto' : 0,
        opacity: open ? 1 : 0,
      }}
      transition={{
        duration,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className !== undefined ? `overflow-hidden ${className}` : 'overflow-hidden'}
    >
      {children}
    </motion.div>
  );
}
