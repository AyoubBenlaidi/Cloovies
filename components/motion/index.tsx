"use client";

import {
  motion,
  AnimatePresence,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils/cn";

/* Easings maison — alignés sur les tokens CSS (--ease / --ease-spring). */
export const EASE = [0.16, 1, 0.3, 1] as const;
export const SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;

export { motion, AnimatePresence };

/* ------------------------------------------------------------------
   Reveal — apparition douce au montage (fade + translate).
   index → léger décalage en cascade. Durée ≤ 350ms.
------------------------------------------------------------------ */
export function Reveal({
  children,
  className,
  delay = 0,
  index,
  y = 12,
  ...rest
}: HTMLMotionProps<"div"> & {
  delay?: number;
  index?: number;
  y?: number;
}) {
  const d = delay + (index ?? 0) * 0.05;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: d }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* In-view : se révèle quand l'élément entre dans le viewport (une fois). */
export function RevealInView({
  children,
  className,
  y = 16,
  amount = 0.25,
  ...rest
}: HTMLMotionProps<"div"> & { y?: number; amount?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.35, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------
   Stagger — conteneur + items pour des listes qui se posent une à une.
------------------------------------------------------------------ */
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

export function Stagger({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------
   Pressable — effet de pression tactile (scale au tap, léger lift hover).
   À utiliser autour d'éléments cliquables non-natifs.
------------------------------------------------------------------ */
export function Pressable({
  children,
  className,
  scale = 0.97,
  lift = true,
  ...rest
}: HTMLMotionProps<"div"> & { scale?: number; lift?: boolean }) {
  return (
    <motion.div
      whileTap={{ scale }}
      whileHover={lift ? { y: -2 } : undefined}
      transition={{ duration: 0.18, ease: EASE }}
      className={cn("will-change-transform", className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
