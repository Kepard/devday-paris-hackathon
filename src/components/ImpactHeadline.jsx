/**
 * Slim adaptation of React Bits BlurText by David Haz (2026).
 * https://reactbits.dev/text-animations/blur-text
 * MIT + Commons Clause: see ../../research/REACT-BITS-LICENSE.md
 * and public/assets/REACT-BITS-LICENSE.txt.
 */
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './ImpactHeadline.css';

const headingVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: .045 } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 8, filter: 'blur(2px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: .7, ease: [.16, 1, .3, 1] },
  },
};

export default function ImpactHeadline({ text = '', className = '', id }) {
  const reducedMotion = useReducedMotion();
  const classes = `impact-headline ${className}`.trim();

  // Immediate, ordinary text also avoids waiting for intersection on this path.
  if (reducedMotion) return <h2 id={id} className={classes}>{text}</h2>;

  return (
    <motion.h2
      id={id}
      className={classes}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: .2 }}
      variants={headingVariants}
    >
      {/* One complete heading name; screen readers skip the animated fragments. */}
      <span aria-hidden="true">
        {text.split(/(\s+)/).map((part, index) => (
          /^\s+$/.test(part)
            ? part
            : <motion.span className="impact-headline-word" key={index} variants={wordVariants}>{part}</motion.span>
        ))}
      </span>
    </motion.h2>
  );
}
