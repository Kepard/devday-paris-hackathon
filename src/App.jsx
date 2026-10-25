import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Check, Heart, Play, Volume2, VolumeX, X } from 'lucide-react';
import GradientASCII from './components/GradientASCII';
import PhoneMockup from './components/PhoneMockup';
import SwipeDemo from './components/SwipeDemo';
import SwipeHint from './components/SwipeHint';
import ProfileDetailCard from './components/ProfileDetailCard';
import ImpactSection from './components/ImpactSection';
import OriginalStory from './components/OriginalStory';
import JobHuntStory from './components/JobHuntStory';
import FullExperience from './components/FullExperience';
import GradualBlur from './components/GradualBlur';
import { useInteractionSounds } from './useInteractionSounds';
import { interests } from './profiles';

const ease = [.16, 1, .3, 1];

function Reveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 14, filter: 'blur(1px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: .18 }} transition={{ duration: .85, delay, ease }}>{children}</motion.div>;
}

function Brand({ footer = false }) {
  return <a className={`brand ${footer ? 'footer-brand' : ''}`} href="#top" aria-label="Find Your Daddy home"><img src="/assets/app-logo.svg" alt="" width="36" height="36"/><span>find your<br/>daddy.</span></a>;
}

function VideoModal({ close }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    document.body.style.overflow = 'hidden'; dialog?.showModal(); closeRef.current?.focus();
    function cancel(e) { e.preventDefault(); close(); }
    dialog?.addEventListener('cancel', cancel);
    return () => { dialog?.removeEventListener('cancel', cancel); dialog?.close(); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, []);
  return <motion.dialog ref={dialogRef} aria-label="Find Your Daddy launch film" className="film-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
    <motion.div className="film-dialog" initial={{ scale: .94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .96 }} transition={{ duration: .35, ease }} onClick={e => e.stopPropagation()}>
      <button ref={closeRef} className="film-close" onClick={close} aria-label="Close film"><X size={23}/></button>
      <video autoPlay controls playsInline preload="metadata" poster="/assets/film-poster-v12.jpg" src="/assets/launch-film-v12.mp4" tabIndex="0"/>
    </motion.div>
  </motion.dialog>;
}

function Closing({ tryDemo }) {
  const ref = useRef(null), seen = useInView(ref, { once: true, amount: .48 }), reduced = useReducedMotion();
  const active = seen || reduced;
  return <section className={`closing ${active ? 'closing-active' : ''}`} ref={ref} aria-label="Find your boss. Stop applying. Start matching.">
    <div className="closing-glow" aria-hidden="true"/>
    <div className="closing-type" aria-hidden="true">
      <span className="find-your">Find your</span>
      <motion.span className="boss-word" initial={{ opacity: 0, y: 45, scale: .55 }} animate={active ? { opacity: 1, y: 0, scale: 1 } : {}} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 18, delay: .9 }}>boss.</motion.span>
      <motion.span className="daddy-chat" initial={{ scale: .7, y: 35, opacity: 0 }} animate={active ? { scale: 1, y: 0, opacity: 1 } : {}} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 19 }}><span>daddy.</span><motion.i initial={{ scaleX: 0 }} animate={active ? { scaleX: 1 } : {}} transition={{ delay: reduced ? 0 : .65, duration: .24, ease }}/></motion.span>
    </div>
    <Reveal delay={.1}><p>Stop applying. Start matching.</p><button className="button primary" onClick={tryDemo}>Find my people <ArrowUpRight size={19}/></button></Reveal>
  </section>;
}

export default function App() {
  const [selected, setSelected] = useState(['Coffee', 'Live music']);
  const [filmOpen, setFilmOpen] = useState(false);
  const [matchName, setMatchName] = useState('');
  const [hintVersion, setHintVersion] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [detail, setDetail] = useState(null);
  const { muted, toggleMuted, play } = useInteractionSounds();
  const hintTimer = useRef(null);
  const focusTimer = useRef(null);
  const reduced = useReducedMotion();
  const matchTimer = useRef(null);
  useEffect(() => () => { clearTimeout(matchTimer.current); clearTimeout(hintTimer.current); clearTimeout(focusTimer.current); }, []);
  function dismissHint() { setShowHint(false); clearTimeout(hintTimer.current); clearTimeout(focusTimer.current); }
  function tryDemo() {
    play('tap'); setShowHint(false); setHintVersion(v => v + 1);
    clearTimeout(hintTimer.current); clearTimeout(focusTimer.current);
    document.getElementById('demo')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
    focusTimer.current = setTimeout(() => {
      document.getElementById('swipe-app')?.focus({ preventScroll: true });
      setShowHint(true);
      hintTimer.current = setTimeout(() => setShowHint(false), reduced ? 5000 : 4300);
    }, reduced ? 0 : 550);
  }
  function toggleInterest(id) { play('tap'); dismissHint(); setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function openProfile(profile, element) {
    dismissHint(); play('flip');
    element?.querySelector('.person-more')?.focus({ preventScroll: true });
    const rect = element?.getBoundingClientRect();
    setDetail({ profile, origin: rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : undefined });
  }
  function closeProfile() { setDetail(null); }
  function watchFilm() { dismissHint(); play('tap'); setFilmOpen(true); }
  function matched(p) { setMatchName(p.name); clearTimeout(matchTimer.current); matchTimer.current = setTimeout(() => setMatchName(''), 2600); }

  return <>
    <a className="skip-link" href="#demo">Skip to the interactive demo</a>
    <div id="top"/>


    <main>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="ascii-background" aria-hidden="true"><GradientASCII colors={['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']} shape="horizon" characters=" 01" cellSize={13} density={.77} glow={.15}/></div>
        <div className="hero-layout">
          <div className="hero-copy">
            <p className="hero-purpose">A job-matching app for startup teams.</p>
            <motion.h1 id="hero-heading" initial={reduced ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, ease }}>Your vibe.<br/><span>Your people.</span></motion.h1>
            <motion.p className="hero-description" initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .1, ease }}>Meet the founder. Find your next job.<br/>Personality first. A conversation next.</motion.p>
            <motion.div className="hero-actions" initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .2, ease }}><button className="button primary" onClick={tryDemo}>Try a swipe <ArrowUpRight size={20}/></button><button className="watch-button" onClick={watchFilm}><span><Play size={11} fill="currentColor"/></span>Watch the film</button></motion.div>
            <motion.div className="interest-picker" initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .32, ease }}>
              <p id="interest-label">What’s your thing?</p>
              <div className="interest-options" role="group" aria-labelledby="interest-label">{interests.map(i => <button key={i.id} onClick={() => toggleInterest(i.id)} className={selected.includes(i.id) ? 'chosen' : ''} aria-pressed={selected.includes(i.id)}><span aria-hidden="true">{i.emoji}</span>{i.id}{selected.includes(i.id) && <Check size={13}/>}</button>)}</div>
              <span className="interest-hint">Pick your interests. Find your people.</span>
            </motion.div>
          </div>
          <motion.div className="hero-product" id="demo" initial={reduced ? false : { opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.05, delay: .12, ease }}>
            <div className="phone-halo" aria-hidden="true"/>
            <PhoneMockup className="hero-phone"><SwipeDemo selectedInterests={selected} onMatch={matched} onActivity={dismissHint} onProfileOpen={openProfile} hintVersion={hintVersion} onSound={play}/></PhoneMockup>
            <AnimatePresence>{showHint && <SwipeHint key={hintVersion}/>}</AnimatePresence>
            <AnimatePresence>{matchName && <motion.div className="outside-match" initial={{ opacity: 0, x: 12, scale: .85 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ type: 'spring', stiffness: 260, damping: 21 }}><span><Heart size={16} fill="currentColor"/></span>You + {matchName}. Good energy.</motion.div>}</AnimatePresence>

          </motion.div>
        </div>
        <a className="scroll-cue" href="#job-hunt" aria-label="Explore the idea"><ArrowDown size={19}/></a>
      </section>

      <JobHuntStory/>
      <OriginalStory/>
      <FullExperience onSound={play}/>
      <ImpactSection onSound={play}/>

      <Closing tryDemo={tryDemo}/>
    </main>

    <footer className="site-footer"><Brand footer/><button className="sound-toggle" onClick={toggleMuted} aria-label={muted ? 'Enable interaction sounds' : 'Mute interaction sounds'} aria-pressed={!muted} title={muted ? 'Sound off' : 'Sound on'}>{muted ? <VolumeX size={15}/> : <Volume2 size={15}/>}</button><span>Prototype. All profiles are fictional.<span className="footer-credit-separator" aria-hidden="true">·</span><a className="footer-social" href="https://x.com/KepardOF" target="_blank" rel="noopener noreferrer" aria-label="KepardOF on X">@KepardOF</a></span><button onClick={watchFilm}>Watch the film <ArrowUpRight size={14}/></button></footer>
    <GradualBlur disabled={filmOpen || Boolean(detail)}/>
    <AnimatePresence>{detail && <ProfileDetailCard key={detail.profile.id} profile={detail.profile} origin={detail.origin} onClose={closeProfile} onSound={play}/>}</AnimatePresence>
    <AnimatePresence>{filmOpen && <VideoModal close={() => setFilmOpen(false)}/>}</AnimatePresence>
  </>;
}
