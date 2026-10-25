'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { ArrowDown, ArrowUp, Check, FileText, MousePointer2, Sparkles } from 'lucide-react';
import './CvSlingUpload.css';

// Sling interaction adapted from React Bits by David Haz (2026).
// https://reactbits.dev/c/micro/sling-button
// MIT + Commons Clause: research/REACT-BITS-LICENSE.md.
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const SPRING = { type: 'spring', stiffness: 420, damping: 25, mass: .65 };

function skillsFor(role) {
  const value = role.toLowerCase();
  if (/engineer|develop|code|software|tech/.test(value)) return ['JavaScript', 'React', 'Problem solving'];
  if (/market|growth|content|communicat/.test(value)) return ['Content strategy', 'Analytics', 'Creative thinking'];
  if (/operat|business|sales/.test(value)) return ['Project planning', 'Communication', 'Teamwork'];
  return ['Figma', 'Product thinking', 'Prototyping'];
}

/** A compact vertical Sling Button, with CSS3D scale-aware pointer coordinates. */
function CvSlingButton({ onSend, onHint, disabled, onSound }) {
  const rootRef = useRef(null), padRef = useRef(null), gripRef = useRef(null);
  const animations = useRef([]);
  const firedRef = useRef(false);
  const skipClick = useRef(false);
  const [held, setHeld] = useState(false);
  const [armed, setArmed] = useState(false);
  const [sent, setSent] = useState(false);
  const reduce = useReducedMotion();
  const hintId = useId();
  const x = useMotionValue(0), y = useMotionValue(0);
  const power = useTransform(y, n => clamp(n / 38, 0, 1));
  const band = useTransform([x, y], ([px, py]) => `M-27 0 Q${px - 33} ${py * .45} ${px - 23} ${py} M27 0 Q${px + 33} ${py * .45} ${px + 23} ${py}`);
  const tensionOpacity = useTransform(y, n => clamp(n / 8, 0, 1));
  const iconRotate = useTransform(x, [-20, 0, 20], [-15, 0, 15]);

  useEffect(() => () => animations.current.forEach(a => a.stop()), []);
  const stop = () => { animations.current.forEach(a => a.stop()); animations.current = []; };
  const settle = () => {
    stop();
    animations.current.push(animate(x, 0, reduce ? { duration: 0 } : SPRING), animate(y, 0, reduce ? { duration: 0 } : SPRING));
  };
  function fire() {
    if (disabled || firedRef.current) return;
    firedRef.current = true;
    setSent(true); setHeld(false); setArmed(false);
    onSound?.('tap');
    stop();
    animations.current.push(animate(x, 0, reduce ? { duration: 0 } : { duration: .15 }), animate(y, reduce ? 0 : -112, { duration: reduce ? 0 : .24, ease: [.2, .8, .3, 1] }));
    onSend();
  }
  function start(event) {
    if (disabled || firedRef.current || event.button !== 0 || gripRef.current) return;
    event.preventDefault(); event.stopPropagation(); stop();
    const root = rootRef.current;
    const rect = root.getBoundingClientRect();
    gripRef.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, scaleX: rect.width / root.offsetWidth || 1, scaleY: rect.height / root.offsetHeight || 1, moved: false };
    padRef.current?.setPointerCapture(event.pointerId);
    setHeld(true);
  }
  function move(event) {
    const grip = gripRef.current;
    if (!grip || grip.id !== event.pointerId) return;
    event.preventDefault(); event.stopPropagation();
    const dx = (event.clientX - grip.startX) / grip.scaleX;
    const dy = Math.max(0, (event.clientY - grip.startY) / grip.scaleY);
    if (Math.hypot(dx, dy) > 5) grip.moved = true;
    // Same diminishing-return pull curve as the React Bits reference.
    const pull = 100 * dy / (100 + dy);
    x.set(clamp(dx * .22, -18, 18)); y.set(pull);
    const isArmed = pull >= 38;
    if (isArmed !== armed) { setArmed(isArmed); if (isArmed) onSound?.('tap'); }
  }
  function release(event, cancelled = false) {
    const grip = gripRef.current;
    if (!grip || grip.id !== event.pointerId) return;
    gripRef.current = null; skipClick.current = true;
    try { padRef.current?.releasePointerCapture(event.pointerId); } catch {}
    setHeld(false); setArmed(false);
    if (!cancelled && y.get() >= 38) fire();
    else { settle(); if (!cancelled) onHint(); }
  }
  return <div ref={rootRef} className="cv-sling" data-armed={armed || undefined} data-sent={sent || undefined}>
    <svg className="cv-sling__fx" viewBox="-58 -58 116 116" aria-hidden="true">
      <motion.path d={band} className="cv-sling__band" style={{ opacity: tensionOpacity }}/>
      <circle r="35" className="cv-sling__well"/>
      <motion.circle r="35" className="cv-sling__arc" pathLength="1" style={{ pathLength: power, rotate: -90, opacity: tensionOpacity }}/>
    </svg>
    <motion.span className="cv-sling__move" style={{ x, y }} animate={{ opacity: sent ? 0 : 1, scale: sent ? .65 : 1 }} transition={{ duration: sent ? .28 : .15 }}>
      <button ref={padRef} type="button" className="cv-sling__pad" aria-label="Send CV: drag down and release, or press Enter" aria-describedby={hintId} aria-disabled={disabled || sent} data-held={held || undefined} onPointerDown={start} onPointerMove={move} onPointerUp={release} onPointerCancel={e => release(e, true)} onLostPointerCapture={e => release(e, true)} onKeyDown={e => {
        if (e.key === 'Escape') { if (gripRef.current) release({ pointerId: gripRef.current.id }, true); }
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); skipClick.current = true; fire(); }
      }} onClick={e => { e.preventDefault(); if (skipClick.current) { skipClick.current = false; return; } if (e.detail === 0) fire(); else onHint(); }}>
        <motion.span className="cv-sling__icon" style={{ rotate: iconRotate }}><ArrowUp size={29} strokeWidth={2.3}/></motion.span>
      </button>
    </motion.span>
    <span id={hintId} className="cv-sling-sr">Pull the blue button down until the ring fills, then release to send. Keyboard: press Enter or Space.</span>
    <span className="cv-sling__ready" aria-live="polite">{armed ? 'Let go!' : held ? 'A little further…' : ''}</span>
  </div>;
}

export default function CvSlingUpload({ name = 'Alex', role = 'Product design', onComplete, onSound }) {
  const [phase, setPhase] = useState('file');
  const [dragging, setDragging] = useState(false);
  const [over, setOver] = useState(false);
  const [hint, setHint] = useState(false);
  const [sent, setSent] = useState(false);
  const stageRef = useRef(null), dropRef = useRef(null), fileRef = useRef(null);
  const grip = useRef(null), timers = useRef([]), completed = useRef(false), controls = useRef([]);
  const reduce = useReducedMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotate = useTransform(x, [-130, 0, 130], [-13, -5, 13]);
  const fileId = useId();
  const skills = skillsFor(role || 'Product design');
  const firstName = (name.trim() || 'Alex').split(/\s+/)[0];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };
  useEffect(() => () => { timers.current.forEach(clearTimeout); controls.current.forEach(c => c.stop()); }, []);

  function isOver(event) {
    const rect = dropRef.current?.getBoundingClientRect();
    return rect && event.clientX >= rect.left - 18 && event.clientX <= rect.right + 18 && event.clientY >= rect.top - 18 && event.clientY <= rect.bottom + 18;
  }
  function attach() {
    if (phase !== 'file') return;
    onSound?.('tap'); setDragging(false); setOver(false); setPhase('attaching');
    const card = fileRef.current;
    const drop = dropRef.current;
    const localY = (drop.offsetTop + drop.offsetHeight / 2) - (card.offsetTop + card.offsetHeight / 2);
    controls.current.push(animate(x, 0, reduce ? { duration: 0 } : { ...SPRING, damping: 27 }), animate(y, localY, reduce ? { duration: 0 } : { ...SPRING, damping: 27 }));
    later(() => setPhase('attached'), reduce ? 0 : 420);
  }
  function pointerDown(event) {
    if (phase !== 'file' || event.button !== 0 || grip.current) return;
    event.preventDefault(); event.stopPropagation();
    controls.current.forEach(c => c.stop());
    const stage = stageRef.current, rect = stage.getBoundingClientRect();
    grip.current = { id: event.pointerId, x: event.clientX, y: event.clientY, scaleX: rect.width / stage.offsetWidth || 1, scaleY: rect.height / stage.offsetHeight || 1, originX: x.get(), originY: y.get() };
    fileRef.current?.setPointerCapture(event.pointerId); setDragging(true);
  }
  function pointerMove(event) {
    const start = grip.current;
    if (!start || start.id !== event.pointerId) return;
    event.preventDefault(); event.stopPropagation();
    x.set(clamp(start.originX + (event.clientX - start.x) / start.scaleX, -95, 95));
    y.set(clamp(start.originY + (event.clientY - start.y) / start.scaleY, -265, 45));
    setOver(!!isOver(event));
  }
  function pointerUp(event, cancelled = false) {
    if (!grip.current || grip.current.id !== event.pointerId) return;
    grip.current = null; setDragging(false);
    try { fileRef.current?.releasePointerCapture(event.pointerId); } catch {}
    if (!cancelled && isOver(event)) attach();
    else { setOver(false); controls.current.push(animate(x, 0, reduce ? { duration: 0 } : SPRING), animate(y, 0, reduce ? { duration: 0 } : SPRING)); }
  }
  function send() {
    if (sent || completed.current) return;
    setSent(true); setHint(false); setPhase('sending');
    later(() => { setPhase('imported'); onSound?.('match'); }, reduce ? 180 : 820);
    later(() => { if (completed.current) return; completed.current = true; onComplete?.({ skills }); }, reduce ? 1300 : 2400);
  }
  function showHint() { setHint(true); later(() => setHint(false), 2100); }
  return <div className="cv-upload" aria-label="Import a sample CV">
    <div ref={stageRef} className="cv-upload__stage">
      <motion.div ref={dropRef} className={`cv-upload__drop ${over ? 'is-over' : ''} ${phase !== 'file' && phase !== 'attaching' ? 'has-file' : ''}`} animate={{ scale: over ? 1.025 : 1 }} transition={SPRING}>
        <AnimatePresence mode="wait">
          {(phase === 'file' || phase === 'attaching') ? <motion.div key="drop" className="cv-upload__drop-copy" initial={false} exit={{ opacity: 0, scale: .92 }} transition={{ duration: .15 }}>
            <span className="cv-upload__drop-icon"><ArrowDown size={25} strokeWidth={1.6}/></span><strong>{over ? 'Right here.' : 'Drop your CV here'}</strong><span>We’ll take care of the skills.</span>
          </motion.div> : <motion.div key="attached" className="cv-upload__attached" initial={reduce ? false : { opacity: 0, scale: .9 }} animate={{ opacity: phase === 'sending' ? 0 : 1, scale: phase === 'sending' ? .9 : 1, y: phase === 'sending' ? -15 : 0 }} transition={{ duration: .25 }}>
            <span><FileText size={23} strokeWidth={1.5}/></span><div><strong>{firstName}’s CV.pdf</strong><small>Sample CV · ready to go</small></div><Check size={17} className="cv-upload__attached-check"/>
          </motion.div>}
        </AnimatePresence>
        {phase === 'sending' && <motion.div className="cv-upload__scan" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduce ? 0 : .7, ease: [.16, 1, .3, 1] }}/>}
      </motion.div>

      <AnimatePresence>
        {(phase === 'file' || phase === 'attaching') && <motion.button ref={fileRef} key="file" type="button" className="cv-upload__file" layoutId={fileId} aria-label="Sample CV: drag into the upload zone, or press Enter" style={{ x, y, rotate: phase === 'attaching' ? 0 : rotate, touchAction: 'none' }} animate={{ scale: dragging ? 1.07 : phase === 'attaching' ? .68 : 1 }} exit={{ opacity: 0, scale: .65 }} transition={SPRING} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={e => pointerUp(e, true)} onLostPointerCapture={e => pointerUp(e, true)} onClick={e => { if (e.detail === 0) attach(); }} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); attach(); } if (e.key === 'Escape' && grip.current) pointerUp({ pointerId: grip.current.id }, true); }}>
          <span className="cv-upload__file-icon"><FileText size={25} strokeWidth={1.4}/><b>PDF</b></span>
          <strong>{firstName}’s CV</strong><i/><i/><i/><span className="cv-upload__file-foot">Sample CV</span>
        </motion.button>}
      </AnimatePresence>

      {phase === 'file' && <motion.div className="cv-upload__drag-hint" initial={{ opacity: 0 }} animate={{ opacity: dragging ? 0 : 1 }} transition={{ duration: .3 }}><MousePointer2 size={16}/><span>Drag the file up</span><ArrowUp size={16}/></motion.div>}

      <AnimatePresence>
        {(phase === 'attached' || phase === 'sending') && <motion.div key="sling" className="cv-upload__send" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>
          <CvSlingButton onSend={send} onHint={showHint} disabled={sent} onSound={onSound}/>
          <p className={hint ? 'cv-upload__instruction is-hint' : 'cv-upload__instruction'}>{sent ? 'Finding your skills…' : hint ? 'Give it a little pull ↓' : 'Pull down. Release to send.'}</p>
          {!sent && <span className="cv-upload__send-note">Drag the blue button, then let go.</span>}
        </motion.div>}
        {phase === 'imported' && <motion.div key="imported" className="cv-upload__result" initial={reduce ? false : { opacity: 0, scale: .92, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={SPRING} role="status">
          <motion.span className="cv-upload__success" initial={reduce ? false : { scale: .5 }} animate={{ scale: 1 }} transition={{ ...SPRING, delay: .08 }}><Check size={28} strokeWidth={2.2}/></motion.span>
          <strong>Skills? Sorted.</strong><p>Your personality still comes first.</p>
          <div className="cv-upload__skills">{skills.map((skill, index) => <motion.span key={skill} initial={reduce ? false : { opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay: reduce ? 0 : .15 + index * .12 }}><Sparkles size={13}/>{skill}</motion.span>)}</div>
        </motion.div>}
      </AnimatePresence>
    </div>
    <p className="cv-upload__privacy">Sample CV. No personal file needed.</p>
  </div>;
}
