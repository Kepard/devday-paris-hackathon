import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { Heart } from 'lucide-react';
import './IceBreaker.css';

const ICE = '/assets/ice-real.webp';
const BREAK = 1.45;
const DURATION = 4.2;
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
// Unequal fracture cells retain the photograph's natural edge, bubbles and cloudy core.
const seeds = [[24, 24], [51, 18], [78, 29], [19, 48], [43, 43], [66, 50], [83, 67], [30, 74], [53, 71], [66, 88]];
const travel = [
  [-23, -8, -26, 0], [9, -25, 18, 0], [30, -5, 35, .12],
  [-30, 12, -34, .22], [-25, 37, -17, .54], [31, 27, 23, .38],
  [21, 35, 41, .28], [-24, 26, -21, .46], [0, 42, 15, .62], [22, 29, 29, .42],
];
function fractureCell(seed, index) {
  let polygon = [[0, 0], [100, 0], [100, 100], [0, 100]];
  seeds.forEach((other, j) => {
    if (j === index) return;
    const nx = other[0] - seed[0], ny = other[1] - seed[1];
    const limit = (other[0] ** 2 + other[1] ** 2 - seed[0] ** 2 - seed[1] ** 2) / 2;
    const next = [];
    polygon.forEach((a, k) => {
      const b = polygon[(k + 1) % polygon.length];
      const da = a[0] * nx + a[1] * ny - limit, db = b[0] * nx + b[1] * ny - limit;
      if (da <= 0) next.push(a);
      if ((da <= 0) !== (db <= 0)) {
        const t = da / (da - db);
        next.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    });
    polygon = next;
  });
  return { seed, clip: `polygon(${polygon.map(p => `${p[0]}% ${p[1]}%`).join(',')})`, travel: travel[index], delay: (index % 3) * .027 };
}
const fragments = seeds.map(fractureCell);
function Fragment({ fragment, time }) {
  const { seed, travel: [dx, dy, turn, restOpacity], delay } = fragment;
  const progress = useTransform(time, t => clamp((t - BREAK - delay) / 1.9));
  const x = useTransform(progress, t => `${dx * .6 * (1 - (1 - t) ** 4)}%`);
  const y = useTransform(progress, t => `${dy * .32 * (1 - (1 - t) ** 3) - Math.sin(t * Math.PI) * (seed[1] < 50 ? 13 : 6)}%`);
  const rotate = useTransform(progress, t => turn * (1 - (1 - t) ** 3));
  const scale = useTransform(progress, t => 1 - .46 * (1 - (1 - t) ** 2));
  const opacity = useTransform(time, t => {
    if (t < BREAK) return 0;
    return 1 - (1 - restOpacity) * smooth((t - BREAK - .45) / 1.9);
  });
  return <motion.div className="ice-breaker__fragment" style={{ x, y, rotate, scale, opacity, transformOrigin: `${seed[0]}% ${seed[1]}%` }}>
    <img src={ICE} alt="" draggable="false" style={{ clipPath: fragment.clip }}/>
  </motion.div>;
}

export default function IceBreaker() {
  const ref = useRef(null);
  const imageRef = useRef(null);
  const visible = useInView(ref, { amount: .58 });
  const nearby = useInView(ref, { margin: '180px 0px' });
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const time = useMotionValue(0);
  const intactOpacity = useTransform(time, [0, BREAK - .015, BREAK + .02], [1, 1, 0]);
  const intactScale = useTransform(time, [0, 1.12, 1.32, BREAK], [1, 1, .985, 1.015]);
  const intactRotate = useTransform(time, [0, 1.12, 1.22, 1.3, 1.38, BREAK], [0, 0, -.45, .55, -.3, 0]);
  const crackOpacity = useTransform(time, [0, 1.15, 1.35, 1.5, 1.68], [0, 0, .75, 1, 0]);
  const crackLength = useTransform(time, [1.15, BREAK], [0, 1]);
  const chatOpacity = useTransform(time, [BREAK + .13, BREAK + .8], [0, 1]);
  const chatScale = useTransform(time, [BREAK + .13, BREAK + .66, BREAK + 1.1], [.6, 1.08, 1]);
  const chatY = useTransform(time, [BREAK + .13, BREAK + 1.1], [16, 0]);
  const shadowOpacity = useTransform(time, [0, BREAK, BREAK + 1.6], [.45, .45, .12]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => { if (imageRef.current?.complete && imageRef.current.naturalWidth) setReady(true); }, []);
  useEffect(() => {
    if (reduced) { time.set(0); return; }
    if (!nearby) { time.set(0); return; }
    if (!pageVisible || !visible || !ready || time.get() >= DURATION) return;
    const controls = animate(time, DURATION, { duration: DURATION - time.get(), ease: 'linear' });
    return () => controls.stop();
  }, [pageVisible, visible, nearby, ready, reduced, time]);

  return <motion.div ref={ref} className="ice-breaker" role="img" aria-label="A real ice cube breaks apart, revealing a conversation." initial={reduced ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: .2, once: true }} transition={{ duration: .9, ease: [.16, 1, .3, 1] }}>
    <div className="ice-breaker__scene" aria-hidden="true">
      <motion.div className="ice-breaker__shadow" style={{ opacity: shadowOpacity }}/>
      <motion.div className="ice-breaker__connection" style={reduced ? { opacity: 1, scale: .7, x: 90, y: 74 } : { opacity: chatOpacity, scale: chatScale, y: chatY }}>
        <span className="ice-breaker__bubble ice-breaker__bubble-back"><i/><i/><i/></span>
        <span className="ice-breaker__bubble ice-breaker__bubble-front"><Heart size={30} strokeWidth={1.9}/></span>
      </motion.div>
      <div className="ice-breaker__photo-stage">
        <motion.img ref={imageRef} className="ice-breaker__intact" src={ICE} width="1024" height="1024" alt="" draggable="false" onLoad={() => setReady(true)} style={{ opacity: intactOpacity, scale: intactScale, rotate: intactRotate }}/>
        {!reduced && fragments.map((fragment, i) => <Fragment key={i} fragment={fragment} time={time}/>)}
        {!reduced && <motion.svg className="ice-breaker__fractures" viewBox="0 0 100 100" style={{ opacity: crackOpacity, maskImage: `url(${ICE})` }}>
          <motion.path d="M43 15L47 30L43 35L49 45L46 50L51 59L47 69L51 76L49 91 M49 45L62 41L67 43L77 37L87 39 M46 50L35 54L29 52L18 60L12 58 M51 59L63 66L66 74L77 78L82 89" fill="none" stroke="#f9fdff" strokeWidth=".85" strokeLinecap="round" style={{ pathLength: crackLength }}/>
        </motion.svg>}
      </div>
    </div>
  </motion.div>;
}
