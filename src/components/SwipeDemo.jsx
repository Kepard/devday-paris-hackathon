import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { ArrowLeft, ArrowUp, Check, ChevronRight, Heart, MessageCircle, RotateCcw, Sparkles, X } from 'lucide-react';
import { profiles } from '../profiles';
import { founderFacts } from '../candidateData';
import { AppStatusBar, AppHeader, DiscoveryHeading, ProfileCardContent } from './AppUI';
import './SwipeDemo.css';

function ProfileCard({ profile, selectedInterests, onDecide, onDetails, onInteract, direction, behind = 0, disabled }) {
  const x = useMotionValue(0);
  const dragMoved = useRef(false);
  const rotate = useTransform(x, [-180, 180], [-14, 14]);
  const yes = useTransform(x, [15, 90], [0, 1]);
  const no = useTransform(x, [-90, -15], [1, 0]);
  const reduced = useReducedMotion();
  const isPresent = useIsPresent();
  useEffect(() => {
    if (!isPresent) return;
    if (reduced) { x.set(0); return; }
    const restore = animate(x, 0, { type: 'spring', stiffness: 400, damping: 32 });
    return () => restore.stop();
  }, [isPresent, behind, x, reduced]);
  return <motion.article
    className={`fe-person person-card ${behind ? 'behind' : 'front'}`}
    style={behind ? { zIndex: 3 - behind } : { x, rotate, zIndex: 4 }}
    initial={{ scale: .94, y: 18, opacity: 0 }}
    animate={{ scale: 1 - behind * .045, y: behind * 13, opacity: 1 }}
    variants={{ exit: d => reduced ? { opacity: 0 } : { x: d * 490, rotate: d * 22, opacity: 0, transition: { duration: .32, ease: [.22, 1, .36, 1] } } }} exit="exit"
    transition={{ type: 'spring', stiffness: 330, damping: 29 }}
    drag={behind || disabled ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={.8}
    onPointerDown={() => { dragMoved.current = false; onInteract?.(); }}
    onDragStart={() => { dragMoved.current = true; }}
    onClick={e => { if (!behind && !disabled && !dragMoved.current) onDetails(e.currentTarget); }}
    onDragEnd={(_, info) => {
      if (Math.abs(info.offset.x) > 85) onDecide(info.offset.x > 0 ? 1 : -1);
      else if (Math.abs(info.velocity.x) > 650) onDecide(info.velocity.x > 0 ? 1 : -1);
    }}
    aria-hidden={behind ? true : undefined}
    aria-label={behind ? undefined : `${profile.name}. ${profile.quote}. ${profile.interests.join(', ')}.`}
  >
    <img className="fe-person-photo" src={profile.photo} alt={`${profile.name} in a candid everyday moment`} style={{ objectPosition: profile.position }} draggable="false" loading={behind ? 'lazy' : 'eager'} />
    <div className="fe-person-shade" />
    {!behind && <><motion.div className="fe-swipe-stamp fe-stamp-like" style={{ opacity: yes }}>MY PEOPLE</motion.div><motion.div className="fe-swipe-stamp fe-stamp-pass" style={{ opacity: no }}>NOT MY VIBE</motion.div></>}
    <ProfileCardContent person={profile} selectedInterests={selectedInterests} facts={founderFacts[profile.id]} behind={behind} disabled={disabled} detailsClassName="person-more" detailsLabel={`More about ${profile.name}`} onDetails={event => onDetails(event.currentTarget.closest('.person-card'))}/>

  </motion.article>;
}

export default function SwipeDemo({ selectedInterests, onMatch, onActivity, onProfileOpen, hintVersion = 0, onSound }) {
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('deck');
  const [activeProfile, setActiveProfile] = useState(null);
  const [direction, setDirection] = useState(1);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState('');
  const [draft, setDraft] = useState('');
  const [chats, setChats] = useState({});
  const [pendingReplies, setPendingReplies] = useState({});
  const timers = useRef([]);
  const decisionTimer = useRef(null);
  const lockedRef = useRef(false);
  const messagesRef = useRef(null);
  const appRef = useRef(null);
  const previousView = useRef('deck');
  const typing = !!pendingReplies[activeProfile?.id];
  const reduced = useReducedMotion();
  const key = selectedInterests.join('|');
  const shared = p => p.interests.filter(i => selectedInterests.includes(i)).length;
  const ranked = useMemo(() => [...profiles].sort((a, b) => shared(b) - shared(a)), [key]);
  const seen = new Set(history.map(h => h.id));
  const remaining = ranked.filter(p => !seen.has(p.id));
  const current = remaining[0];
  const liked = history.filter(h => h.direction > 0).map(h => profiles.find(p => p.id === h.id));
  const matches = liked.filter(p => p.mutual);
  const later = (fn, ms) => { const timer = setTimeout(fn, ms); timers.current.push(timer); return timer; };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setHistory([]); setView('deck'); setActiveProfile(null); setLocked(false); lockedRef.current = false;
    setToast(''); setPendingReplies({}); setChats({}); setDraft('');
  }, [key]);
  useEffect(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight; }, [chats, typing, view]);
  useEffect(() => {
    if (previousView.current !== view && (appRef.current?.contains(document.activeElement) || document.activeElement === document.body)) appRef.current?.focus({ preventScroll: true });
    previousView.current = view;
  }, [view]);

  useEffect(() => {
    if (!hintVersion) return;
    clearTimeout(decisionTimer.current); lockedRef.current = false; setLocked(false);
    setView('deck'); setDraft('');
    if (!remaining.length) setHistory([]);
  }, [hintVersion]);

  function notify(message) { setToast(message); later(() => setToast(''), 2000); }
  function decide(dir) {
    if (lockedRef.current || !current || view !== 'deck') return;
    lockedRef.current = true; setLocked(true); setDirection(dir); onActivity?.(); onSound?.(dir > 0 ? 'like' : 'pass');
    setHistory(h => [...h, { id: current.id, direction: dir }]);
    const person = current;
    decisionTimer.current = later(() => {
      if (dir > 0 && person.mutual) { setActiveProfile(person); setView('match'); onSound?.('match'); onMatch?.(person); }
      else if (dir > 0) notify('Like sent. Their move.');
      lockedRef.current = false; setLocked(false);
    }, reduced ? 50 : 340);
  }
  function reset() {
    onSound?.('tap');
    timers.current.forEach(clearTimeout); timers.current = []; setHistory([]); setView('deck'); setActiveProfile(null);
    setToast(''); setLocked(false); setPendingReplies({}); setChats({}); setDraft(''); lockedRef.current = false; onActivity?.();
  }
  function openChat(person) {
    onSound?.('tap'); onActivity?.();
    setActiveProfile(person); setView('chat'); setDraft('');
    setChats(c => c[person.id] ? c : { ...c, [person.id]: [{ from: 'them', text: person.opener }] });
  }
  function sendMessage(e) {
    e.preventDefault(); const text = draft.trim(); if (!text || typing) return;
    onSound?.('send');
    const id = activeProfile.id; setDraft(''); setPendingReplies(p => ({ ...p, [id]: true }));
    setChats(c => ({ ...c, [id]: [...(c[id] || []), { from: 'you', text }] }));
    later(() => {
      setChats(c => ({ ...c, [id]: [...(c[id] || []), { from: 'them', text: 'love that. let’s grab a coffee and talk about what we could build ☕' }] }));
      setPendingReplies(p => ({ ...p, [id]: false })); onSound?.('receive');
    }, 1100);
  }
  function back() { onSound?.('tap'); setView('deck'); setDraft(''); }

  return <div ref={appRef} className="demo-app fe-app swipe-demo" id="swipe-app" tabIndex="0" aria-label="Interactive job matching demo. Use left arrow to pass and right arrow to like." onKeyDown={e => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (view === 'deck' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); decide(e.key === 'ArrowRight' ? 1 : -1); }
    if (e.key === 'Escape') back();
  }}>
    <AppStatusBar/>
    <AppHeader>
      <button type="button" className="fe-reset" aria-label="Restart swipe demo" onClick={reset}><RotateCcw size={16}/></button>
    </AppHeader>
    <AnimatePresence mode="wait">
      {view === 'deck' && <motion.div className="app-view swipe-deck-view" key="deck" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>
        <div className="fe-discovery">
          <DiscoveryHeading showCount={false}/>
        <div className="deck-stage fe-card-space">
          {remaining.length ? <AnimatePresence custom={direction} initial={false}>
            {remaining.slice(0, 1).map(p => <ProfileCard key={p.id} profile={p} selectedInterests={selectedInterests} behind={remaining.indexOf(p)} direction={direction} onDecide={decide} onInteract={onActivity} disabled={locked} onDetails={element => { if (!lockedRef.current) onProfileOpen?.(p, element); }}/>) }
          </AnimatePresence> : <motion.div className="deck-complete" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }}><div className="complete-icon"><Check size={36}/></div><h3>You’ve met<br/>the whole crew.</h3><p>{liked.length} like{liked.length !== 1 ? 's' : ''}. {matches.length} mutual match{matches.length !== 1 ? 'es' : ''}.<br/>A little chemistry goes a long way.</p><button className="app-primary" onClick={() => matches.length ? setView('matches') : reset()}>{matches.length ? 'See your matches' : 'One more round'}</button><button className="app-text-button" onClick={reset}>Start over <RotateCcw size={13}/></button></motion.div>}
        </div>
        <div className="fe-swipe-controls"><button type="button" className="fe-pass" aria-label="Pass on this person" onClick={() => decide(-1)} disabled={!current || locked}><X size={25}/></button><button type="button" className="fe-like" aria-label="Like this person" onClick={() => decide(1)} disabled={!current || locked}><Heart size={27} fill="currentColor"/></button></div>
        <span className="fe-swipe-note">Swipe the person. Start with the connection.</span>
        </div>
        <nav className="fe-tabbar" aria-label="Demo navigation"><button type="button" aria-current="page" onClick={() => onSound?.('tap')}><Sparkles size={21}/><span>Discover</span></button><button type="button" disabled={locked} onClick={() => { setView('matches'); onSound?.('tap'); onActivity?.(); }}><span className="fe-tab-icon"><MessageCircle size={21}/>{matches.length > 0 && <i>{matches.length}</i>}</span><span>Matches</span></button><button type="button" onClick={reset}><RotateCcw size={20}/><span>Restart</span></button></nav>
      </motion.div>}

      {view === 'match' && activeProfile && <motion.div key="match" className="app-view match-view" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 240 }}>
        <button className="app-back" onClick={back} aria-label="Keep swiping"><ArrowLeft size={20}/></button>
        <div className="match-title"><span>Same wavelength.</span><h2>It’s a match.</h2></div>
        <div className="match-pair"><div className="you-avatar"><span>you</span></div><img src={activeProfile.photo} alt={activeProfile.name}/><motion.span className="match-heart" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 450, damping: 14, delay: .2 }}><Heart size={26} fill="currentColor"/></motion.span></div>
        <p className="match-line">You and {activeProfile.name}.<br/>Could be a good thing.</p>
        <div className="shared-interests">{activeProfile.interests.filter(i => selectedInterests.includes(i)).map(i => <span key={i}>{i}</span>)}</div>
        <div className="match-bottom"><button className="app-primary" onClick={() => openChat(activeProfile)}>Say hey <MessageCircle size={17}/></button><button className="app-text-button" onClick={back}>Keep swiping</button><small>Mutual match simulated for this demo.</small></div>
      </motion.div>}

      {view === 'chat' && activeProfile && <motion.div key="chat" className="app-view chat-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: .22 }}>
        <header className="chat-header"><button aria-label="Back to matches" onClick={() => { setView('matches'); onSound?.('tap'); onActivity?.(); }}><ArrowLeft size={22}/></button><div><img src={activeProfile.photo} alt=""/><strong>{activeProfile.name}</strong></div><span className="chat-status">Demo chat</span></header>
        <div className="chat-messages" ref={messagesRef} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text"><p className="chat-start">You matched. The rest is up to you.</p>{(chats[activeProfile.id] || []).map((m, i) => <motion.div key={i} className={`chat-bubble ${m.from}`} initial={{ opacity: 0, y: 12, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }}>{m.text}</motion.div>)}{typing && <div className="chat-bubble them typing"><i/><i/><i/></div>}</div>
        <form className="chat-composer" onSubmit={sendMessage}><input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Say something human…" maxLength={180} aria-label={`Message ${activeProfile.name}`}/><button type="submit" aria-label="Send message" disabled={!draft.trim() || typing}><ArrowUp size={22}/></button></form>
      </motion.div>}

      {view === 'matches' && <motion.div key="matches" className="app-view matches-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <header className="list-header"><button className="app-back inline" onClick={back} aria-label="Back to discovering"><ArrowLeft size={21}/></button><h2>Your matches.</h2></header>
        {matches.length ? <div className="match-list">{matches.map(p => <button key={p.id} onClick={() => openChat(p)}><img src={p.photo} alt=""/><span><strong>{p.name}</strong><small>{p.quote}</small></span><ChevronRight size={20}/></button>)}</div> : <div className="empty-matches"><Heart size={38}/><h3>Your people are<br/>out there.</h3><p>Like someone. If they like you too,<br/>you’ll find them here.</p><button className="app-primary" onClick={back}>Meet the crew</button></div>}
        {liked.length > matches.length && <p className="pending-note">{liked.length - matches.length} like{liked.length - matches.length > 1 ? 's' : ''} waiting for a reply.</p>}
      </motion.div>}

    </AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="app-toast" role="status" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>{toast}</motion.div>}</AnimatePresence>
    <div className="fe-home-indicator" aria-hidden="true"/>
    <div className="sr-only" role="status" aria-live="polite">{view === 'deck' ? current ? `Profile ${history.length + 1} of 10: ${current.name}. ${shared(current)} shared interests.` : 'All ten profiles viewed.' : view === 'match' ? `You and ${activeProfile?.name} matched.` : ''}</div>
  </div>;
}
