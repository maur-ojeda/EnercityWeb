"use client";

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  fadeUpVariants,
  revealVariants,
  VIEWPORT_ONCE,
  VIEWPORT_MARGIN,
  defaultTransition,
  staggerContainerVariants,
  staggerItemVariants,
} from '@/lib/animations';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main';
}

export function AnimatedSection({
  children,
  className,
  direction = 'up',
  delay = 0,
  as = 'div',
}: AnimatedSectionProps) {
  const prefersReduced = useReducedMotion();
  const variants = revealVariants(direction);

  if (prefersReduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT_ONCE, ...VIEWPORT_MARGIN }}
      variants={variants}
      transition={{ ...defaultTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT_ONCE, ...VIEWPORT_MARGIN }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay, delayChildren: 0.1 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

interface MotionLinkProps {
  children: ReactNode;
  className?: string;
  href: string;
  onClick?: () => void;
}

export function MotionLink({ children, className, href, onClick }: MotionLinkProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <motion.a
      href={href}
      className={className}
      onClick={onClick}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.a>
  );
}

export { fadeUpVariants, staggerContainerVariants, staggerItemVariants };