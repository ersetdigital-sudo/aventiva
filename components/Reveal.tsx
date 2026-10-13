"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article";
};

/** Scroll-reveal halus; otomatis nonaktif jika user memilih reduce motion. */
export function Reveal({ children, className, delay = 0, as = "div" }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const props = {
    className,
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
  };

  return as === "section" ? (
    <motion.section {...props}>{children}</motion.section>
  ) : as === "article" ? (
    <motion.article {...props}>{children}</motion.article>
  ) : (
    <motion.div {...props}>{children}</motion.div>
  );
}
