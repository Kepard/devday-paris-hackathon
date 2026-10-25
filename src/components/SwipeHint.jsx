import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Heart, Pointer, X } from 'lucide-react';

export default function SwipeHint() {
  const reduced = useReducedMotion();
  return <motion.div className="swipe-hint" role="status" initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .92, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, scale: .96 }} transition={{ duration: .24 }}>
    <div className="swipe-hint-track" aria-hidden="true"><span><X size={16}/></span><i/><span><Heart size={16}/></span>
      <motion.div className="swipe-hint-hand" animate={reduced ? {} : { x: [0, -51, 51, 0], rotate: [0, -12, 12, 0] }} transition={{ duration: 1.8, times: [0, .28, .7, 1], repeat: 1, repeatDelay: .18, ease: 'easeInOut' }}><Pointer size={29} fill="white" strokeWidth={1.7}/></motion.div>
    </div>
    <span>Drag left or right</span>
  </motion.div>;
}
