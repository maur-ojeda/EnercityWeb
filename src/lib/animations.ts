import type { Variants, Transition, Variant } from 'framer-motion';

export const REVEAL_DURATION = 0.5;
export const STAGGER_DELAY = 0.1;
export const HOVER_DURATION = 0.2;
export const VIEWPORT_ONCE = { once: true as const };
export const VIEWPORT_MARGIN = { margin: '-100px' };

export const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const defaultTransition: Transition = {
  duration: REVEAL_DURATION,
  ease: easeOut,
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: { duration: HOVER_DURATION } },
  whileTap: { scale: 0.98 },
};

export const cardLift = {
  whileHover: { y: -8, transition: { duration: HOVER_DURATION } },
};

const hiddenUp: Variant = { opacity: 0, y: 30 };
const hiddenDown: Variant = { opacity: 0, y: -30 };
const hiddenLeft: Variant = { opacity: 0, x: -40 };
const hiddenRight: Variant = { opacity: 0, x: 40 };
const visible: Variant = { opacity: 1, x: 0, y: 0 };

const directionVariants: Record<string, Variant> = {
  up: hiddenUp,
  down: hiddenDown,
  left: hiddenLeft,
  right: hiddenRight,
};

export function revealVariants(direction: 'up' | 'down' | 'left' | 'right' = 'up'): Variants {
  return {
    hidden: directionVariants[direction],
    visible: visible,
  };
}

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: STAGGER_DELAY, delayChildren: 0.1 },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: REVEAL_DURATION, ease: easeOut } },
};

export function staggerDelay(index: number, base = 0): number {
  return base + index * STAGGER_DELAY;
}