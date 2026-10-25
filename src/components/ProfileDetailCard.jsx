import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion, useSpring } from 'motion/react';
import { ArrowLeft, ArrowRight, MapPin, Sparkles, X } from 'lucide-react';
import './ProfileDetailCard.css';
import { profileExtras } from '../profileExtras';

// Adapted from React Bits Flip Card's perspective / two-face spring treatment.
// Original MIT + Commons Clause notice: /assets/REACT-BITS-LICENSE.txt.
const FLIP_SPRING = { type: 'spring', stiffness: 170, damping: 20, mass: 0.85 };
const LIFT_SPRING = { type: 'spring', stiffness: 230, damping: 27, mass: 0.9 };
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function originPose(origin) {
  if (typeof window === 'undefined') return { x: 0, y: 28, scale: 0.9 };
  const width = Math.min(430, window.innerWidth - 32);
  const height = Math.min(680, window.innerHeight - 48);
  const valid = origin && [origin.left, origin.top, origin.width, origin.height].every(Number.isFinite);
  if (!valid || origin.width <= 0 || origin.height <= 0) return { x: 0, y: 35, scale: 0.86 };
  return {
    x: origin.left + origin.width / 2 - window.innerWidth / 2,
    y: origin.top + origin.height / 2 - window.innerHeight / 2,
    scale: clamp(Math.min(origin.width / width, origin.height / height), 0.28, 1.15),
  };
}

function ProfileDialog({ profile, origin, onClose, onSound }) {
  const id = useId();
  const dialogRef = useRef(null);
  const liftRef = useRef(null);
  const closeRef = useRef(null);
  const pointerStart = useRef(null);
  const pressedPointer = useRef(null);
  const releaseFrame = useRef(0);
  const frontScrollRef = useRef(null);
  const backScrollRef = useRef(null);
  const callbacks = useRef({ onClose, onSound });
  callbacks.current = { onClose, onSound };
  const closingRef = useRef(false);
  const notifiedRef = useRef(false);
  const [closing, setClosing] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [entry] = useState(() => originPose(origin));
  const reduce = useReducedMotion();
  const tiltX = useSpring(0, { stiffness: 260, damping: 26, mass: 0.7 });
  const tiltY = useSpring(0, { stiffness: 260, damping: 26, mass: 0.7 });

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    if (scrollbar) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight || '0') + scrollbar}px`;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    window.addEventListener('pointerup', releasePress);
    window.addEventListener('pointercancel', cancelTap);
    window.addEventListener('blur', cancelTap);
    return () => {
      cancelAnimationFrame(releaseFrame.current);
      window.removeEventListener('pointerup', releasePress);
      window.removeEventListener('pointercancel', cancelTap);
      window.removeEventListener('blur', cancelTap);
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
    };
  }, []);

  function freezeTilt() { tiltX.jump(tiltX.get()); tiltY.jump(tiltY.get()); }
  function rest() {
    if (pressedPointer.current !== null) { freezeTilt(); return; }
    tiltX.set(0); tiltY.set(0);
  }
  function releasePress(event) {
    if (event?.pointerId !== undefined && pressedPointer.current !== event.pointerId) return;
    cancelAnimationFrame(releaseFrame.current);
    // Keep the target still through pointerup and its native click event.
    releaseFrame.current = requestAnimationFrame(() => {
      pressedPointer.current = null;
      rest();
    });
  }
  function cancelTap() {
    pointerStart.current = null;
    pressedPointer.current = null;
    cancelAnimationFrame(releaseFrame.current);
    rest();
  }

  function requestClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    rest();
    callbacks.current.onSound?.('tap');
    setClosing(true);
  }

  function finishClose() {
    if (!closingRef.current || notifiedRef.current) return;
    notifiedRef.current = true;
    if (dialogRef.current?.open) dialogRef.current.close();
    callbacks.current.onClose?.();
  }

  function flip() {
    if (closingRef.current) return;
    rest();
    // Move focus before making the outgoing face inert.
    closeRef.current?.focus({ preventScroll: true });
    callbacks.current.onSound?.('flip');
    setFlipped(value => !value);
  }

  function beginTap(event) {
    if (event.button !== 0 || event.isPrimary === false) return;
    cancelAnimationFrame(releaseFrame.current);
    pressedPointer.current = event.pointerId;
    freezeTilt();
    if (event.target.closest('button, a, input, summary')) { pointerStart.current = null; return; }
    const face = event.target.closest('.pd-face');
    if (!face || face.getAttribute('aria-hidden') === 'true') { pointerStart.current = null; return; }
    const scroller = event.target.closest('.pd-scroll');
    pointerStart.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId, face, scroller, scrollTop: scroller?.scrollTop || 0 };
  }
  function endTap(event) {
    const start = pointerStart.current; pointerStart.current = null;
    releasePress(event);
    if (!start || start.pointerId !== event.pointerId || event.target.closest('button, a, input, summary')) return;
    if (event.target.closest('.pd-face') !== start.face) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;
    if (start.scroller && Math.abs(start.scroller.scrollTop - start.scrollTop) > 2) return;
    if (window.getSelection()?.toString()) return;
    flip();
  }

  function onPointerMove(event) {
    if (reduce || flipped || closing || pressedPointer.current !== null || event.pointerType !== 'mouse' || event.buttons) return;
    if (event.target.closest('button, a, input, [tabindex]')) { rest(); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    tiltX.set((0.5 - clamp((event.clientY - rect.top) / rect.height, 0, 1)) * 5);
    tiltY.set((clamp((event.clientX - rect.left) / rect.width, 0, 1) - 0.5) * 6);
  }

  const closedPose = reduce
    ? { opacity: 0, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0 }
    : { opacity: 0, ...entry, rotateX: 7, rotateY: -12, rotateZ: -1.5 };
  const openPose = { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0 };
  const traits = Array.isArray(profile.vibe) ? profile.vibe : String(profile.vibe || '').split('·').map(value => value.trim()).filter(Boolean);
  const interests = profile.interests || [];
  const skills = profile.skills || [];
  const extra = profileExtras[profile.id];

  return createPortal(
    <dialog
      ref={dialogRef}
      className="profile-detail-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      data-profile-side={flipped ? 'back' : 'front'}
      data-reduced-motion={reduce ? 'true' : undefined}
      onCancel={event => { event.preventDefault(); requestClose(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        // An edge-on card briefly has no hit surface; a rapid repeat tap in its
        // footprint must not accidentally become a backdrop dismissal.
        const rect = liftRef.current?.getBoundingClientRect();
        if (rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) return;
        requestClose();
      }}
      onKeyDown={event => event.stopPropagation()}
    >
      <h2 id={`${id}-title`} className="pd-sr-only">{profile.name}’s profile</h2>
      <p id={`${id}-description`} className="pd-sr-only">Personality and interests first. Tap the card or use the button for more photos, skills and work style.</p>
      <motion.div className="pd-scrim" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: closing ? 0 : 1 }} transition={{ duration: reduce ? 0.12 : 0.25 }} />
      <motion.article
        ref={liftRef}
        className="pd-lift"
        initial={closedPose}
        animate={closing ? closedPose : openPose}
        transition={reduce ? { duration: 0.16 } : closing ? { duration: 0.32, ease: [0.32, 0, 0.67, 0] } : LIFT_SPRING}
        onAnimationComplete={finishClose}
        onPointerMove={onPointerMove}
        onPointerLeave={rest}
        onFocusCapture={rest}
        onPointerDownCapture={beginTap}
        onPointerUpCapture={endTap}
        onPointerCancel={cancelTap}
      >
        <button ref={closeRef} type="button" className="pd-close" onClick={requestClose} aria-label="Close profile"><X size={19} strokeWidth={1.8} /></button>
        <motion.div className="pd-tilt" style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY }}>
          <motion.div className="pd-rotor" animate={{ rotateY: reduce ? 0 : flipped ? 180 : 0 }} transition={reduce ? { duration: 0 } : FLIP_SPRING}>
            <motion.section className="pd-face pd-front" aria-hidden={flipped} inert={flipped} animate={{ opacity: reduce ? (flipped ? 0 : 1) : 1 }} transition={{ duration: 0.15 }}>
              <div className="pd-photo">
                <img src={profile.photo} alt={`${profile.name}, candid portrait`} style={{ objectPosition: '50% 20%' }} draggable="false" />
                <div className="pd-photo-shade" />
                <span className="pd-personality-badge"><Sparkles size={12} /> Personality first</span>
                <div className="pd-photo-name"><h3>{profile.name}<span>{profile.age ? `, ${profile.age}` : ''}</span></h3><p>{profile.role}</p><span className="pd-location"><MapPin size={12} />{profile.location}</span></div>
              </div>
              <div ref={frontScrollRef} className="pd-scroll pd-front-copy" tabIndex={0} role="region" aria-label={`${profile.name}’s personality and interests`}>
                {profile.quote && <p className="pd-quote">“{profile.quote}”</p>}
                <div className="pd-section"><h4>The vibe</h4><div className="pd-traits">{traits.map(trait => <span key={trait}>{trait}</span>)}</div></div>
                <div className="pd-section"><h4>Into the same stuff?</h4><div className="pd-interest-list">{interests.map(interest => <span key={interest}>{interest}</span>)}</div></div>
                {profile.looking && <div className="pd-section pd-looking"><h4>Looking for</h4><p>{profile.looking}</p></div>}
              </div>
              <footer className="pd-footer"><button type="button" className="pd-flip-button" onClick={flip} aria-label="More of me — flip for photos and work details"><span>More of me</span><ArrowRight size={17}/></button></footer>
            </motion.section>
            <motion.section className="pd-face pd-back" aria-hidden={!flipped} inert={!flipped} animate={{ opacity: reduce ? (flipped ? 1 : 0) : 1 }} transition={{ duration: 0.15 }}>
              <div className="pd-back-header"><img src={profile.photo} alt="" style={{ objectPosition: profile.position || '50% 35%' }} /><div><span className="pd-small-label">The other side of</span><h3>{profile.name}.</h3><p>{profile.role}</p></div></div>
              <div ref={backScrollRef} className="pd-scroll pd-back-copy" tabIndex={0} role="region" aria-label={`${profile.name}’s work style and skills`}>
                <div className="pd-gallery" aria-label={`More of ${profile.name}’s life`}>
                  <figure><img src={`/assets/profiles/${profile.id}-life.jpg`} alt={`${profile.name} in another candid moment`} draggable="false"/><figcaption>{extra?.life}</figcaption></figure>
                  <img src={profile.photo} alt={`${profile.name}’s everyday life`} style={{ objectPosition: profile.position }} draggable="false"/>
                </div>
                {extra && <div className="pd-section"><h4>What we’re building</h4><p>{extra.project}</p><div className="pd-work-facts"><span>{extra.team}</span><span>{extra.mode}</span></div></div>}
                {extra && <div className="pd-section"><h4>How we work together</h4><p>{extra.communication}</p></div>}
                {profile.style && <div className="pd-section"><h4>Work style</h4><p className="pd-work-style">{profile.style}.</p></div>}
                <div className="pd-section"><h4>Skills</h4><div className="pd-skills-list">{skills.map(skill => <span key={skill}>{skill}</span>)}</div></div>
                {profile.looking && <div className="pd-section"><h4>Make something together</h4><p>{profile.looking}</p></div>}
                {profile.opener && <div className="pd-icebreaker"><span className="pd-small-label">A conversation starts here</span><p>“{profile.opener}”</p></div>}
              </div>
              <footer className="pd-footer"><button type="button" className="pd-flip-button pd-flip-button-back" onClick={flip} aria-label="Back to the person — flip to personality"><ArrowLeft size={17}/><span>Back to the person</span></button></footer>
            </motion.section>
          </motion.div>
        </motion.div>
      </motion.article>
    </dialog>,
    document.body,
  );
}

export default function ProfileDetailCard(props) {
  return props.profile ? <ProfileDialog key={props.profile.id || props.profile.name} {...props} /> : null;
}
