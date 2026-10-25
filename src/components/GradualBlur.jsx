'use client';

import React, { useEffect, useState } from 'react';
import './GradualBlur.css';

/**
 * Page-edge adaptation of React Bits GradualBlur by David Haz (2026).
 * Official source inspected:
 * https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/GradualBlur-JS-CSS.json
 * Reference: https://reactbits.dev/animations/gradual-blur?demo=basic
 * MIT + Commons Clause notice: research/REACT-BITS-LICENSE.md
 * and public/assets/REACT-BITS-LICENSE.txt.
 *
 * Incremental Gaussian radii avoid over-blurring where masked layers overlap.
 * Each layer becomes opaque closer to the edge, creating a genuine progressive
 * backdrop blur rather than covering the content with a white gradient.
 */
const COUNT = 6;
const MAX_BLUR = 6;
const level = value => MAX_BLUR * (2 ** (4 * value) - 1) / 15;
const layers = Array.from({ length: COUNT }, (_, index) => {
  const from = level(index / COUNT), to = level((index + 1) / COUNT);
  return {
    radius: Math.sqrt(Math.max(to * to - from * from, 0)).toFixed(3),
    start: (index / COUNT * 100).toFixed(2),
    end: ((index + 1) / COUNT * 100).toFixed(2),
  };
});

export default function GradualBlur({ disabled = false }) {
  const [phoneInView, setPhoneInView] = useState(false);
  useEffect(() => {
    const phone = document.querySelector('.fe-device-wrap');
    if (!phone || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      setPhoneInView(entry.intersectionRatio >= .5);
    }, { threshold: [0, .5, .75, 1] });
    observer.observe(phone);
    return () => observer.disconnect();
  }, []);

  return <>
    {['top', 'bottom'].map(edge => <div key={edge} className={`viewport-gradual-blur viewport-gradual-blur--${edge}`} aria-hidden="true" data-quiet={phoneInView || undefined} data-disabled={disabled || undefined}>
      {layers.map((layer, index) => {
        const mask = `linear-gradient(to ${edge}, transparent ${layer.start}%, #000 ${layer.end}%)`;
        return <div key={index} className="viewport-gradual-blur__layer" style={{
          backdropFilter: `blur(calc(${layer.radius}px * var(--viewport-blur-scale)))`,
          WebkitBackdropFilter: `blur(calc(${layer.radius}px * var(--viewport-blur-scale)))`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}/>;
      })}
    </div>)}
  </>;
}
