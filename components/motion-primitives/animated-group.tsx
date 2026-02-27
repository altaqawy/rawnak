'use client';

import React, { type ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';

export type PresetType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'blur'
  | 'blur-slide'
  | 'zoom'
  | 'flip'
  | 'bounce'
  | 'rotate'
  | 'swing';

export type AnimatedGroupProps = {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  preset?: PresetType;
  triggerOnView?: boolean;
  viewportOptions?: {
    once?: boolean;
    amount?: number | 'some' | 'all';
    margin?: string;
  };
};

const defaultContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const presetVariants: Record<PresetType, Variants> = {
  fade: {},
  slide: {
    hidden: { y: 20 },
    visible: { y: 0 },
  },
  scale: {
    hidden: { scale: 0.8 },
    visible: { scale: 1 },
  },
  blur: {
    hidden: { filter: 'blur(4px)' },
    visible: { filter: 'blur(0px)' },
  },
  'blur-slide': {
    hidden: { filter: 'blur(4px)', y: 20 },
    visible: { filter: 'blur(0px)', y: 0 },
  },
  zoom: {
    hidden: { scale: 0.5 },
    visible: {
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  },
  flip: {
    hidden: { rotateX: -90 },
    visible: {
      rotateX: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  },
  bounce: {
    hidden: { y: -50 },
    visible: {
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
  },
  rotate: {
    hidden: { rotate: -180 },
    visible: {
      rotate: 0,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  },
  swing: {
    hidden: { rotate: -10 },
    visible: {
      rotate: 0,
      transition: { type: 'spring', stiffness: 300, damping: 8 },
    },
  },
};

function addDefaultItemVariants(variants: Variants): Variants {
  return {
    hidden: { ...(defaultItemVariants.hidden ?? {}), ...(variants.hidden ?? {}) },
    visible: { ...(defaultItemVariants.visible ?? {}), ...(variants.visible ?? {}) },
  };
}

export function AnimatedGroup({
  children,
  className,
  variants,
  preset,
  triggerOnView = false,
  viewportOptions = { once: true, amount: 0.3 },
}: AnimatedGroupProps) {
  const containerVariants = variants?.container ?? defaultContainerVariants;
  const itemVariants = variants?.item ?? addDefaultItemVariants(preset ? presetVariants[preset] : {});

  const animationProps = triggerOnView
    ? {
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: viewportOptions,
      }
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
      };

  return (
    <motion.div {...animationProps} variants={containerVariants} className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
