import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, Check, ChevronRight, Coffee, Heart, MapPin, MessageCircle, RefreshCw, Sparkles, UserRound, UsersRound, X } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import CvSlingUpload from './CvSlingUpload';
import { interests } from '../profiles';
import { peopleForIntent, factsForPerson, extrasForPerson } from '../candidateData';
import { meetingDeclined as resolveMeetingPreference } from '../chatPreferences';
import { connectionReasons, rankPeople, domainOptions, roleForDomain, domainForRole, skillSuggestionsForDomain, workQuestions } from '../demoData';
import { AppStatusBar, AppHeader, DiscoveryHeading, ProfileCardContent } from './AppUI';
import './FullExperience.css';

const STORAGE = 'fyd-full-experience-v1';
const ease = [.16, 1, .3, 1];
const initialProfile = { intent: 'job', company: '', project: '', name: '', domain: 'Design & UX', role: 'Product designer', location: 'Paris', interests: ['Coffee', 'Live music'], feedback: 'direct', autonomy: 'freedom', collaboration: 'together', skills: [], salary: '€35–45k', availability: 'Within a month' };
const onboardingSteps = intent => ['you', 'vibe', intent === 'hiring' ? 'brief' : 'cv', 'ready'];
const stepCopy = {
  intent: ['Good people. Both sides.', 'Choose where your story starts.'],
  brief: ['The work behind the vibe.', 'What are you building, and who are you missing?'],
  you: ['Start with you.', 'Your next team should feel like your people.'],
  vibe: ['Personality first.', 'A few things no CV could tell us.'],
  cv: ['Skip the boring stuff.', 'Your skills. Imported in one satisfying move.'],
  ready: ['Look at you.', 'A person. A point of view. Plenty of potential.'],
  discover: ['Meet your people.', 'Real conversations start with mutual interest.'],
  match: ['Good energy, both ways.', 'A shared interest is a pretty good place to start.'],
  chat: ['Less small talk.\nMore connection.', 'Ask about the work. The team. The weird stuff.'],
  meeting: ['Take it offline.', 'The next step is a conversation with a person.'],
  inbox: ['Keep the conversation going.', 'A match is a beginning.'],
  profile: ['More than your CV.', 'Your interests and working style lead the way.'],
};
function makeSession() { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function initialState() {
  return { version: 1, sessionId: makeSession(), step: 'intent', profile: { ...initialProfile }, passed: [], liked: [], threads: {}, personId: 'maya' };
}
function readSavedState() {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE));
    if (value?.version !== 1 || typeof value.sessionId !== 'string' || !value.profile || !Array.isArray(value.profile.interests) || !stepCopy[value.step]) return null;
    const intent = value.profile.intent === 'hiring' ? 'hiring' : 'job';
    const people = peopleForIntent(intent);
    const profile = { ...initialProfile, ...value.profile, intent, domain: domainOptions.some(option => option.label === value.profile.domain) ? value.profile.domain : domainForRole(value.profile.role) };
    return { ...value, step: intent === 'hiring' && value.step === 'cv' ? 'brief' : value.step, profile, passed: Array.isArray(value.passed) ? value.passed : [], liked: Array.isArray(value.liked) ? value.liked : [], threads: value.threads || {}, personId: people.some(p => p.id === value.personId) ? value.personId : people[0].id };
  } catch { return null; }
}

function Primary({ children, ...props }) { return <button type="button" className="fe-primary" {...props}>{children}<ArrowRight size={18}/></button>; }
function StepTitle({ eyebrow, title, children }) { return <div className="fe-step-title">{eyebrow && <span>{eyebrow}</span>}<h3>{title}</h3>{children && <p>{children}</p>}</div>; }
function Choice({ options, value, onChange, label }) {
  return <div className="fe-choice-group" role="group" aria-label={label}>{options.map(option => <button type="button" key={option.value} aria-pressed={value === option.value} className={value === option.value ? 'is-selected' : ''} onClick={() => onChange(option.value)}>{option.label}{value === option.value && <Check size={13}/>}</button>)}</div>;
}
function PersonCard({ person, candidate, onSwipe, onSound }) {
  const [details, setDetails] = useState(false);
  const x = useMotionValue(0);
  const rotation = useTransform(x, [-180, 0, 180], [-11, 0, 11]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);
  const connection = connectionReasons(person, candidate);
  const hiring = candidate.intent === 'hiring';
  const facts = factsForPerson(person, candidate.intent);
  const extra = extrasForPerson(person, candidate.intent);
  const reduced = useReducedMotion();
  function showDetails() { onSound?.('tap'); setDetails(v => !v); }
  return <motion.article className={`fe-person ${details ? 'show-details' : ''}`} style={{ x, rotate: rotation }} drag={details ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={.65} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 72 || Math.abs(info.velocity.x) > 650) onSwipe(info.offset.x > 0 ? 'like' : 'pass'); }} initial={reduced ? false : { opacity: 0, scale: .96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} variants={{ leave: direction => reduced ? { opacity: 0 } : { x: direction * 390, rotate: direction * 16, opacity: 0 } }} exit="leave" transition={{ duration: .35, ease }} aria-label={`${person.name}, ${person.role}`}>
    <img className="fe-person-photo" src={person.photo} alt={`${person.name} in an everyday moment`} draggable="false" style={{ objectPosition: person.position }}/>
    <div className="fe-person-shade"/>
    {!details && <><motion.span className="fe-swipe-stamp fe-stamp-like" style={{ opacity: likeOpacity }}>MY PEOPLE</motion.span><motion.span className="fe-swipe-stamp fe-stamp-pass" style={{ opacity: passOpacity }}>NOT MY VIBE</motion.span><ProfileCardContent person={person} selectedInterests={candidate.interests} facts={facts} onDetails={showDetails}/></>}
    <AnimatePresence>{details && <motion.div className="fe-person-details" initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: .3, ease }}><div className="fe-detail-top"><img src={person.photo} alt=""/><div><span>{hiring ? 'The person behind the CV' : 'The person behind the startup'}</span><h4>{person.name}.</h4></div><button type="button" onClick={showDetails} aria-label="Close profile details"><X size={17}/></button></div><div className="fe-detail-scroll"><h5>Why you two?</h5>{connection.reasons.map(reason => <p className="fe-reason" key={reason}><Check size={14}/>{reason}</p>)}<div className="fe-discuss"><span>Worth a conversation</span><p>{connection.discuss}</p></div><h5>{hiring ? 'What I’ve been building' : 'What we’re building'}</h5><p>{extra.project}</p><div className="fe-mini-tags"><span>{extra.team}</span><span>{extra.mode}</span></div><h5>{hiring ? 'How I work' : 'How we work'}</h5><p>{extra.communication}</p><h5>{hiring ? 'Looking for' : 'The role'}</h5><p>{facts.role} · {facts.salary}</p><div className="fe-mini-tags">{person.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div></motion.div>}</AnimatePresence>
  </motion.article>;
}

export default function FullExperience({ onSound }) {
  const [state, setState] = useState(initialState);
  const [storageReady, setStorageReady] = useState(false);
  const [pendingThreads, setPendingThreads] = useState([]);
  const [threadErrors, setThreadErrors] = useState({});
  const [presentation, setPresentation] = useState(null);
  const [navigationDirection, setNavigationDirection] = useState(1);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [swipeDirection, setSwipeDirection] = useState(1);
  const [resetPrompt, setResetPrompt] = useState(false);
  const resetDialogRef = useRef(null);
  const deviceWrapRef = useRef(null), navigationFrame = useRef(0);
  const requestsRef = useRef(new Map()), requestEpoch = useRef(0), currentViewRef = useRef(null);
  const noticeTimer = useRef(null), chatScroll = useRef(null), chatInput = useRef(null), bubbleTimer = useRef(null);
  const reduced = useReducedMotion();
  const { step, profile, personId } = state;
  const hiring = profile.intent === 'hiring';
  const people = peopleForIntent(profile.intent);
  const introSteps = onboardingSteps(profile.intent);
  const person = people.find(p => p.id === personId) || people[0];
  const questions = hiring ? workQuestions.map(question => ({ ...question, title: ({ feedback: 'How does your team give feedback?', autonomy: 'How does your team build?', collaboration: 'Your best ideas happen…' })[question.key], options: question.options.map(option => ({ ...option, label: ({ direct: 'Honest & direct', talk: 'Talk it through', freedom: 'Room to explore', structure: 'A clear plan', together: 'Thinking together', async: 'Space to focus' })[option.value] })) })) : workQuestions;
  const thread = state.threads[person.id] || { messages: [], invite: false, mode: 'ai' };
  currentViewRef.current = { step, personId, sessionId: state.sessionId };
  const sending = pendingThreads.includes(personId);
  const error = threadErrors[personId] || '';
  const isPresenting = step === 'chat' && presentation?.threadId === personId;
  const chatBusy = sending || isPresenting;
  const lastUserIndex = thread.messages.findLastIndex(message => message.role === 'user');
  const ranked = useMemo(() => rankPeople(people, profile), [profile]);
  const available = ranked.filter(p => !state.passed.includes(p.id) && !state.liked.includes(p.id));
  const current = available[0];
  const progress = introSteps.indexOf(step);
  const hasOnboarded = step !== 'intent' && !introSteps.includes(step);
  const matchedIds = Object.keys(state.threads);

  useEffect(() => { const saved = readSavedState(); if (saved) setState(saved); setStorageReady(true); }, []);
  useEffect(() => { if (!storageReady) return; try { sessionStorage.setItem(STORAGE, JSON.stringify(state)); } catch { /* A blocked browser store never blocks the demo. */ } }, [state, storageReady]);
  useEffect(() => () => { requestsRef.current.forEach(request => request.controller.abort()); clearTimeout(noticeTimer.current); clearTimeout(bubbleTimer.current); cancelAnimationFrame(navigationFrame.current); }, []);
  useEffect(() => {
    if (!resetPrompt) return;
    const previous = document.activeElement;
    const dialog = resetDialogRef.current;
    const buttons = [...(dialog?.querySelectorAll('button') || [])];
    buttons[0]?.focus({ preventScroll: true });
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); setResetPrompt(false); }
      if (event.key === 'Tab' && buttons.length) {
        const index = buttons.indexOf(document.activeElement);
        if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === buttons.length - 1)) { event.preventDefault(); buttons[event.shiftKey ? buttons.length - 1 : 0].focus(); }
      }
    };
    dialog?.addEventListener('keydown', onKey);
    return () => { dialog?.removeEventListener('keydown', onKey); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [resetPrompt]);
  useEffect(() => {
    if (step === 'chat' && chatScroll.current) chatScroll.current.scrollTo({ top: chatScroll.current.scrollHeight, behavior: reduced ? 'instant' : 'smooth' });
  }, [thread.messages.length, sending, thread.invite, presentation?.shown, step, reduced]);
  useEffect(() => {
    // A complete response is persisted before presentation begins. Leaving this
    // view only cancels its bubble animation, never an in-flight reply or history.
    setPresentation(null); setDraft('');
    if (step === 'chat' && thread.messages.at(-1)?.role === 'user' && !requestsRef.current.has(personId)) {
      setThreadErrors(errors => ({ ...errors, [personId]: 'Your last message is saved. Pick up where you left off.' }));
    }
  }, [personId, step]);
  useEffect(() => {
    clearTimeout(bubbleTimer.current);
    if (!presentation) return;
    if (reduced) { setPresentation(null); return; }
    let shown = 0;
    const id = presentation.id;
    const reveal = () => {
      shown += 1;
      onSound?.('receive');
      if (shown >= presentation.bubbles.length) { setPresentation(value => value?.id === id ? null : value); return; }
      setPresentation(value => value?.id === id ? { ...value, shown } : value);
      const pause = Math.min(1000, 430 + presentation.bubbles[shown].length * 5);
      bubbleTimer.current = setTimeout(reveal, pause);
    };
    bubbleTimer.current = setTimeout(reveal, 320);
    return () => clearTimeout(bubbleTimer.current);
  }, [presentation?.id, reduced]);
  function revealPhoneAfterNavigation() {
    cancelAnimationFrame(navigationFrame.current);
    navigationFrame.current = requestAnimationFrame(() => {
      const phone = deviceWrapRef.current;
      if (!phone) return;
      const rect = phone.getBoundingClientRect();
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop || 0;
      const height = viewport?.height || window.innerHeight;
      if (rect.top >= top + 12 && rect.bottom <= top + height - 12) return;
      window.scrollTo({ top: Math.max(0, window.scrollY + rect.top + rect.height / 2 - top - height / 2), behavior: reduced ? 'instant' : 'smooth' });
    });
  }
  function skillsForRole(role) {
    return peopleForIntent('hiring').find(p => factsForPerson(p, 'hiring').role === role)?.skills.slice(0, 5) || [];
  }
  function change(key, value) {
    setState(s => {
      const next = { ...s.profile, [key]: value };
      if (s.profile.intent === 'hiring' && key === 'domain') { next.role = roleForDomain(value); next.skills = skillsForRole(next.role); }
      if (s.profile.intent === 'hiring' && key === 'role') { next.domain = domainForRole(value); next.skills = skillsForRole(value); }
      return { ...s, profile: next };
    });
  }
  function chooseIntent(intent) {
    onSound?.('tap'); setNavigationDirection(1);
    const changed = intent !== profile.intent;
    if (changed) {
      requestEpoch.current += 1;
      requestsRef.current.forEach(request => request.controller.abort()); requestsRef.current.clear();
      setPendingThreads([]); setPresentation(null); setThreadErrors({}); setDraft('');
    }
    setState(previous => ({
      ...(changed ? initialState() : previous), step: 'you',
      profile: { ...previous.profile, intent, ...(changed ? { skills: intent === 'hiring' ? skillsForRole(roleForDomain(previous.profile.domain)) : [], role: roleForDomain(previous.profile.domain) } : {}) },
    }));
    revealPhoneAfterNavigation();
  }
  function go(next, direction = 1) { onSound?.('tap'); setNavigationDirection(direction); setState(s => ({ ...s, step: next })); revealPhoneAfterNavigation(); }
  function flash(text) { setNotice(text); clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(''), 2400); }
  function toggleInterest(id) { onSound?.('tap'); change('interests', profile.interests.includes(id) ? profile.interests.filter(i => i !== id) : [...profile.interests, id]); }
  function completeCV(result) { setNavigationDirection(1); setState(s => ({ ...s, profile: { ...s.profile, skills: result.skills || [], role: roleForDomain(s.profile.domain) }, step: 'ready' })); revealPhoneAfterNavigation(); }
  function startDiscover() { setNavigationDirection(1); onSound?.('tap'); setState(s => ({ ...s, step: 'discover', passed: [], liked: [] })); revealPhoneAfterNavigation(); }
  function openChat(id) {
    setNavigationDirection(1); revealPhoneAfterNavigation();
    onSound?.('tap');
    const p = people.find(item => item.id === id);
    setState(s => ({ ...s, personId: id, step: 'chat', threads: { ...s.threads, [id]: s.threads[id] || { messages: [{ role: 'assistant', content: p.opener }], invite: false, mode: 'ai' } } }));
  }
  function swipe(decision) {
    if (!current) return;
    setSwipeDirection(decision === 'like' ? 1 : -1);
    onSound?.(decision === 'like' ? 'like' : 'pass');
    if (decision === 'pass') { setState(s => ({ ...s, passed: [...s.passed, current.id] })); return; }
    const roleFits = factsForPerson(current, profile.intent).role === profile.role;
    const mutual = roleFits && (hiring || current.mutual || ['alex', 'nina', 'jules'].includes(current.id));
    setState(s => ({ ...s, liked: [...s.liked, current.id], ...(mutual ? { personId: current.id, step: 'match', threads: { ...s.threads, [current.id]: s.threads[current.id] || { messages: [{ role: 'assistant', content: current.opener }], invite: false, mode: 'ai' } } } : {}) }));
    if (mutual) { setNavigationDirection(1); onSound?.('match'); revealPhoneAfterNavigation(); } else flash(roleFits ? 'Interest sent. They get to choose, too.' : hiring ? 'Different focus. Interest saved to explore.' : 'Different role. Interest saved to explore.');
  }
  function reset() {
    revealPhoneAfterNavigation(); setNavigationDirection(-1);
    requestEpoch.current += 1;
    requestsRef.current.forEach(request => request.controller.abort()); requestsRef.current.clear();
    setPendingThreads([]); setPresentation(null); setThreadErrors({}); setDraft(''); setResetPrompt(false);
    setState({ version: 1, sessionId: makeSession(), step: 'intent', profile: { ...initialProfile }, passed: [], liked: [], threads: {}, personId: 'maya' }); onSound?.('tap');
  }
  async function requestReply(targetId, messages, meetingDeclined) {
    if (requestsRef.current.has(targetId)) return;
    const epoch = requestEpoch.current, sessionId = state.sessionId;
    const controller = new AbortController(), request = { controller, epoch };
    requestsRef.current.set(targetId, request);
    setPendingThreads(ids => [...ids.filter(id => id !== targetId), targetId]);
    setThreadErrors(errors => ({ ...errors, [targetId]: '' }));
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, personaId: targetId, profile, meetingDeclined, messages: messages.slice(-12).map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) throw new Error(data.message || data.error || 'The connection took a break. Try sending that again.');
      if (epoch !== requestEpoch.current) return;
      const bubbles = Array.isArray(data.bubbles) ? data.bubbles.filter(value => typeof value === 'string' && value.trim()).slice(0, 4).map(value => value.trim()) : [];
      const assistant = { role: 'assistant', content: data.reply.slice(0, 700), bubbles: bubbles.length ? bubbles : [data.reply.slice(0, 700)] };
      // Save all bubbles together. A reload or navigation can never leave a
      // partial assistant turn behind, nor append a reply to another person.
      const view = currentViewRef.current;
      if (!reduced && view?.step === 'chat' && view.personId === targetId && view.sessionId === sessionId) {
        setPresentation({ id: makeSession(), threadId: targetId, messageIndex: messages.length, bubbles: assistant.bubbles, shown: 0 });
      }
      setState(previous => {
        if (previous.sessionId !== sessionId || !previous.threads[targetId]) return previous;
        return { ...previous, threads: { ...previous.threads, [targetId]: { ...previous.threads[targetId], messages: [...messages, assistant], invite: Boolean(data.invite) && !previous.threads[targetId].inviteDeclined, mode: data.mode || 'ai' } } };
      });
      if (reduced && view?.step === 'chat' && view.personId === targetId) onSound?.('receive');
    } catch (err) {
      if (epoch === requestEpoch.current) setThreadErrors(errors => ({ ...errors, [targetId]: err.name === 'AbortError' ? 'That reply took too long. Your message is saved.' : err.message || 'Couldn’t connect just now. Your message is saved.' }));
    } finally {
      clearTimeout(timer);
      if (requestsRef.current.get(targetId) === request) requestsRef.current.delete(targetId);
      if (epoch === requestEpoch.current) setPendingThreads(ids => ids.filter(id => id !== targetId));
    }
  }
  function sendMessage(text) {
    const content = (typeof text === 'string' ? text : draft).trim();
    if (!content || chatBusy || error || content.length > 500 || requestsRef.current.has(personId)) return;
    onSound?.('send'); setDraft('');
    const targetId = person.id;
    const messages = [...thread.messages, { role: 'user', content }];
    const declined = resolveMeetingPreference(messages, Boolean(thread.inviteDeclined));
    setState(previous => ({ ...previous, threads: { ...previous.threads, [targetId]: { ...previous.threads[targetId], messages, invite: false, inviteDeclined: declined } } }));
    requestReply(targetId, messages, declined);
  }
  function retryMessage() {
    if (thread.messages.at(-1)?.role !== 'user' || chatBusy) return;
    requestReply(personId, thread.messages, Boolean(thread.inviteDeclined));
  }
  function acceptInvite() { onSound?.('match'); go('meeting'); }
  function declineInvite() {
    setState(s => ({ ...s, threads: { ...s.threads, [person.id]: { ...s.threads[person.id], invite: false, inviteDeclined: true } } }));
    sendMessage('I’d rather keep chatting here for now. Let’s leave meeting up for later.');
  }
  function back() { if (step === 'you') go('intent', -1); else if (progress > 0) go(introSteps[progress - 1], -1); else if (step === 'chat' || step === 'meeting') go('inbox', -1); else go('discover', -1); }
  const transition = reduced ? { duration: 0 } : { type: 'spring', stiffness: 330, damping: 35, mass: .85 };
  const screenVariants = { enter: direction => reduced ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 58 : -28, scale: .99 }, active: { opacity: 1, x: 0, scale: 1 }, leave: direction => reduced ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -28 : 58, scale: .99 } };

  return <section className="full-experience" id="your-experience" aria-labelledby="full-experience-heading">
    <div className="fe-section-copy">
      <span className="fe-section-eyebrow">THE APP, IN YOUR HANDS</span>
      <h2 id="full-experience-heading">Your next team.<span> Starts with you.</span></h2>
      <p>Your vibe. Your people. Your first conversation.</p>
    </div>
    <div ref={deviceWrapRef} className="fe-device-wrap"><div className="fe-device-glow" aria-hidden="true"/><PhoneMockup className="fe-device" immersive><div className="fe-app" aria-label="Complete Find Your Daddy app demo">
      <AppStatusBar/>
      <AppHeader>{step !== 'intent' && <button type="button" className="fe-back" onClick={back} aria-label="Go back in the app"><ArrowLeft size={20}/></button>}<button type="button" className="fe-reset" onClick={() => { onSound?.('tap'); setResetPrompt(true); }} aria-label="Restart the full demo"><RefreshCw size={16}/></button></AppHeader>
      {progress >= 0 && <div className="fe-progress" aria-label={`Onboarding step ${progress + 1} of 4`}>{introSteps.map((s, i) => <span key={s} className={i <= progress ? 'complete' : ''}/>)}</div>}
      <div className={`fe-main ${step === 'chat' ? 'fe-main-chat' : ''} ${hasOnboarded ? 'fe-main-onboarded' : ''}`}>
        <AnimatePresence mode="wait" initial={false} custom={navigationDirection}><motion.div className={`fe-screen fe-screen-${step}`} key={step} custom={navigationDirection} variants={screenVariants} initial="enter" animate="active" exit="leave" transition={transition}>
          {step === 'intent' && <div className="fe-intent"><div className="fe-intent-mark" aria-hidden="true"><img src="/assets/app-logo.svg" alt=""/><motion.span initial={reduced ? false : { scale: .5, rotate: -15 }} animate={{ scale: 1, rotate: 8 }} transition={{ type: 'spring', stiffness: 250, damping: 18 }}><Sparkles size={21}/></motion.span></div><StepTitle eyebrow="GOOD PEOPLE. BOTH SIDES." title="What brings you here?">Find your people. Build something good.</StepTitle><div className="fe-intent-options"><motion.button type="button" onClick={() => chooseIntent('job')} whileTap={reduced ? undefined : { scale: .98 }}><span className="fe-intent-icon"><UserRound size={27} strokeWidth={1.6}/></span><span><strong>I’m looking for a job</strong><small>A team that gets you.</small></span><ChevronRight size={22}/></motion.button><motion.button type="button" onClick={() => chooseIntent('hiring')} whileTap={reduced ? undefined : { scale: .98 }}><span className="fe-intent-icon"><UsersRound size={28} strokeWidth={1.6}/></span><span><strong>I’m hiring</strong><small>Your next great teammate.</small></span><ChevronRight size={22}/></motion.button></div><p className="fe-intent-note">Personality first. On either side.</p></div>}
          {step === 'you' && <form className="fe-form-screen" onSubmit={e => { e.preventDefault(); if (profile.name.trim() && (!hiring || profile.company.trim())) { change('name', profile.name.trim()); go('vibe'); } }}><div className="fe-scroll"><div className="fe-welcome-icon">{hiring ? <Building2 size={30} strokeWidth={1.5}/> : <UserRound size={30} strokeWidth={1.5}/>}<motion.span animate={reduced ? {} : { rotate: [0, 12, -4, 0] }} transition={{ duration: 1.1, delay: .3 }}>✦</motion.span></div><StepTitle eyebrow={hiring ? 'HELLO, TEAM BUILDER' : 'HELLO, FUTURE TEAMMATE'} title={hiring ? 'Who’s building?' : 'First, you.'}>{hiring ? 'Great teams start with real people.' : 'Let’s put a person before the CV.'}</StepTitle><label className="fe-field"><span>First name</span><input name="firstName" value={profile.name} placeholder="What should we call you?" maxLength={35} autoComplete="given-name" onChange={e => change('name', e.target.value)} required/></label>{hiring && <label className="fe-field"><span>Your company</span><input name="company" value={profile.company} placeholder="Your startup or small team" maxLength={60} autoComplete="organization" onChange={e => change('company', e.target.value)} required/></label>}<label className="fe-field"><span>{hiring ? 'We’re hiring in' : 'I’d love to work in'}</span><select value={profile.domain} onChange={e => change('domain', e.target.value)}>{domainOptions.map(option => <option key={option.label}>{option.label}</option>)}</select></label><label className="fe-field"><span>{hiring ? 'Where we work' : 'My starting point'}</span><select value={profile.location} onChange={e => change('location', e.target.value)}>{['Paris', 'London', 'Amsterdam', 'Berlin', 'Lyon', 'Remote / open to moving'].map(city => <option key={city}>{city}</option>)}</select></label><button className="fe-sample-link" type="button" onClick={() => { setState(previous => ({ ...previous, profile: { ...previous.profile, name: 'Alex', ...(hiring ? { company: 'Orbit', project: 'We’re building a calmer way for small teams to plan their week.' } : {}) } })); onSound?.('tap'); }}>{hiring ? 'Just exploring? Use Orbit’s demo team' : 'Just exploring? Use Alex’s demo profile'} <ChevronRight size={12}/></button></div><div className="fe-bottom"><button className="fe-primary" type="submit" disabled={!profile.name.trim() || (hiring && !profile.company.trim())}>Let’s do this <ArrowRight size={18}/></button><span>{hiring ? 'A small team. A big next chapter.' : 'No account. No cover letter. No bullshit.'}</span></div></form>}
          {step === 'vibe' && <div className="fe-form-screen"><div className="fe-scroll"><StepTitle eyebrow="01 / THE GOOD STUFF" title={hiring ? 'Your team. Your vibe.' : 'Your vibe. Your people.'}>{hiring ? 'The humans behind the job description.' : 'What makes you, you?'}</StepTitle>{hiring && <span className="fe-group-label">Things your team bonds over</span>}<div className="fe-interest-picker" role="group" aria-label={hiring ? 'Your team’s interests' : 'Your interests'}>{interests.map(i => <button type="button" key={i.id} className={profile.interests.includes(i.id) ? 'selected' : ''} aria-pressed={profile.interests.includes(i.id)} onClick={() => toggleInterest(i.id)}><span>{i.emoji}</span>{i.id}{profile.interests.includes(i.id) && <Check size={12}/>}</button>)}</div><div className="fe-work-questions">{questions.map(question => <div key={question.key}><h4>{question.title}</h4><Choice label={question.title} options={question.options} value={profile[question.key]} onChange={value => { onSound?.('tap'); change(question.key, value); }}/></div>)}</div></div><div className="fe-bottom"><Primary disabled={!profile.interests.length} onClick={() => go(hiring ? 'brief' : 'cv')}>{hiring ? 'That’s us' : 'That’s me'}</Primary></div></div>}
          {step === 'cv' && <div className="fe-form-screen"><div className="fe-scroll fe-cv-scroll"><StepTitle eyebrow="02 / WE’LL HANDLE THIS" title="Now, the boring stuff.">Drop your CV. Keep being a person.</StepTitle><CvSlingUpload name={profile.name} role={roleForDomain(profile.domain)} onComplete={completeCV} onSound={onSound}/></div></div>}
          {step === 'brief' && <form className="fe-form-screen" onSubmit={e => { e.preventDefault(); if (profile.project.trim()) { change('project', profile.project.trim()); go('ready'); } }}><div className="fe-scroll"><div className="fe-role-brief-mark"><BriefcaseBusiness size={25} strokeWidth={1.5}/><span>{profile.company}</span></div><StepTitle eyebrow="02 / THE WORK BEHIND THE VIBE" title="Who’s missing?">A clear role. Room for a real person.</StepTitle><label className="fe-field"><span>We’re looking for a</span><select value={profile.role} onChange={e => change('role', e.target.value)}>{domainOptions.map(option => <option key={option.role}>{option.role}</option>)}</select></label><label className="fe-field"><span>What we’re building</span><textarea name="project" rows={3} value={profile.project} maxLength={240} placeholder="The idea your next teammate will help bring to life…" onChange={e => change('project', e.target.value)} required/></label><div className="fe-brief-skills"><span className="fe-group-label">Helpful skills</span><div className="fe-interest-picker" role="group" aria-label="Helpful skills for this role">{skillSuggestionsForDomain(profile.domain).map(skill => <button type="button" key={skill} className={profile.skills.includes(skill) ? 'selected' : ''} aria-pressed={profile.skills.includes(skill)} onClick={() => { onSound?.('tap'); change('skills', profile.skills.includes(skill) ? profile.skills.filter(value => value !== skill) : [...profile.skills, skill]); }}>{skill}{profile.skills.includes(skill) && <Check size={12}/>}</button>)}</div><p>Skills help us narrow it down. Chemistry starts the conversation.</p></div></div><div className="fe-bottom"><button className="fe-primary" type="submit" disabled={!profile.project.trim()}>Meet the brief <ArrowRight size={18}/></button></div></form>}
          {step === 'ready' && <div className="fe-form-screen"><div className="fe-scroll"><StepTitle eyebrow="03 / READY WHEN YOU ARE" title={hiring ? 'Good team energy.' : `Very ${profile.name}.`}>{hiring ? 'Here’s the team they’ll meet.' : 'A quick look before you meet your people.'}</StepTitle><div className="fe-profile-summary"><div className="fe-avatar-initial">{hiring ? <Building2 size={29} strokeWidth={1.6}/> : profile.name.slice(0, 1).toUpperCase()}<Sparkles size={16}/></div><h4>{hiring ? profile.company : profile.name}</h4><p>{hiring ? `Hiring a ${profile.role.toLowerCase()}` : profile.role} · {profile.location}</p>{hiring && <p className="fe-company-project">{profile.project}</p>}<div className="fe-summary-interests">{profile.interests.map(i => <span key={i}>{i}</span>)}</div><div className="fe-imported"><Check size={13}/><span>{hiring ? 'Helpful skills' : 'Skills imported'}</span></div><div className="fe-skill-tags">{profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div><div className="fe-preference-row"><label><span>{hiring ? 'Salary range' : 'Salary ballpark'}</span><select value={profile.salary} onChange={e => change('salary', e.target.value)}>{['€25–35k', '€35–45k', '€45–55k', 'Let’s talk'].map(s => <option key={s}>{s}</option>)}</select></label><label><span>{hiring ? 'Ideal start' : 'Ready to start'}</span><select value={profile.availability} onChange={e => change('availability', e.target.value)}>{['Within a month', 'In 1–3 months', 'Just exploring'].map(s => <option key={s}>{s}</option>)}</select></label></div><button type="button" className="fe-sample-link" onClick={() => go(hiring ? 'brief' : 'vibe')}>{hiring ? 'Edit the role' : 'Edit my vibe'} <ChevronRight size={12}/></button></div><div className="fe-bottom"><Primary onClick={startDiscover}>{hiring ? 'Meet our next teammate' : 'Meet my people'}</Primary></div></div>}
          {step === 'discover' && <div className="fe-discovery"><DiscoveryHeading title={hiring ? 'Your next teammate.' : 'Your people.'} current={state.passed.length + state.liked.length + 1} total={people.length}/>{current ? <><div className="fe-card-space"><AnimatePresence mode="wait" custom={swipeDirection}><PersonCard key={current.id} person={current} candidate={profile} onSwipe={swipe} onSound={onSound}/></AnimatePresence></div><div className="fe-swipe-controls"><button className="fe-pass" type="button" onClick={() => swipe('pass')} aria-label={`Pass on ${current.name}`}><X size={25}/></button><button className="fe-like" type="button" onClick={() => swipe('like')} aria-label={`Like ${current.name}`}><Heart size={27} fill="currentColor"/></button></div><span className="fe-swipe-note">{hiring ? 'Meet the person behind the potential.' : 'Swipe the person. Start with the connection.'}</span></> : <div className="fe-empty"><Sparkles size={38}/><h3>You’ve met everyone.</h3><p>{matchedIds.length ? 'There are conversations waiting for you.' : 'Good chemistry takes a little exploring.'}</p><Primary onClick={() => matchedIds.length ? go('inbox') : startDiscover()}>{matchedIds.length ? 'Open my conversations' : 'Take another look'}</Primary></div>}</div>}
          {step === 'match' && <div className="fe-match"><div className="fe-match-portraits"><motion.div className="fe-match-you" initial={reduced ? false : { x: -35, rotate: -12 }} animate={{ x: 0, rotate: -7 }} transition={{ type: 'spring', stiffness: 220, damping: 19 }}>{profile.name.slice(0, 1).toUpperCase()}</motion.div><motion.img src={person.photo} alt={person.name} initial={reduced ? false : { x: 35, rotate: 12 }} animate={{ x: 0, rotate: 7 }} transition={{ type: 'spring', stiffness: 220, damping: 19 }}/><motion.span className="fe-match-heart" initial={reduced ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 16, delay: .2 }}><Heart fill="currentColor" size={30}/></motion.span></div><span className="fe-kicker">THE FEELING’S MUTUAL</span><h3>It’s a match.</h3><p>You and {person.name}.<br/>Good people. Good potential.</p><div className="fe-match-reason">{connectionReasons(person, profile).reasons[0]}</div><Primary onClick={() => openChat(person.id)}>Say hey to {person.name}</Primary><button type="button" className="fe-text-button" onClick={() => go('discover')}>Keep meeting people</button><small>Fictional match · Try the conversation with AI</small></div>}
          {step === 'chat' && <div className="fe-chat"><div className="fe-chat-header"><img src={person.photo} alt=""/><div><h3>{person.name}</h3><span>{thread.mode === 'demo' ? 'Practice conversation' : hiring ? 'AI demo candidate' : 'AI demo founder'} <i/></span></div><button type="button" onClick={() => go('inbox')} aria-label="View conversations"><MessageCircle size={19}/></button></div><div className="fe-chat-scroll" ref={chatScroll} role="log" aria-live="polite" aria-label={`Conversation with ${person.name}`}><span className="fe-chat-date">Your conversation starts here</span>{thread.messages.map((message, index) => {
              const bubbles = message.role === 'assistant' && Array.isArray(message.bubbles) && message.bubbles.length ? message.bubbles : [message.content];
              const shown = isPresenting && presentation.messageIndex === index ? presentation.shown : bubbles.length;
              return <div className={`fe-message-turn fe-turn-${message.role}`} key={`${index}-${message.role}`}>
                {bubbles.slice(0, shown).map((bubble, bubbleIndex) => <motion.div key={`${index}-${bubbleIndex}`} className={`fe-message fe-message-${message.role} ${bubbleIndex === bubbles.length - 1 ? 'fe-bubble-last' : ''}`} initial={reduced ? false : { opacity: 0, y: 9, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }}>{bubble}</motion.div>)}
                {message.role === 'user' && index === lastUserIndex && <span className="fe-delivery-state">{error ? 'Not sent' : sending ? 'Sending…' : 'Delivered'}</span>}
              </div>;
            })}{chatBusy && <div className="fe-typing" aria-label={`${person.name} is typing`}><i/><i/><i/></div>}{error && <div className="fe-chat-error" role="alert"><span>{error}</span><button type="button" onClick={retryMessage}>Try again <RefreshCw size={12}/></button></div>}{thread.invite && !thread.inviteDeclined && !isPresenting && <motion.div className="fe-meet-card" initial={reduced ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><span className="fe-meet-icon"><Coffee size={22}/></span><h4>Make it a coffee.</h4><p>A conversation with {person.name}, in person.</p><div><span><MapPin size={12}/>{person.location}</span><span>20 minutes · No pitch deck</span></div><button type="button" onClick={acceptInvite}>I’m in <ArrowRight size={14}/></button><button type="button" className="fe-meet-later" onClick={declineInvite} disabled={chatBusy}>Maybe later</button><small>Demo invitation. Nothing is booked.</small></motion.div>}</div>{thread.messages.length < 3 && !chatBusy && <div className="fe-chat-suggestions"><button type="button" onClick={() => sendMessage(hiring ? 'What kind of team helps you do your best work?' : 'What’s it actually like working with your team?')}>{hiring ? 'Your ideal team?' : 'What’s the team like?'}</button><button type="button" onClick={() => sendMessage(hiring ? 'What’s a project you’re proud of building?' : 'What would I get to build first?')}>{hiring ? 'A project you’re proud of?' : 'What would I build?'}</button></div>}<form className="fe-composer" onSubmit={e => { e.preventDefault(); sendMessage(); }}><input ref={chatInput} aria-label={`Message ${person.name}`} placeholder={`Message ${person.name}…`} value={draft} maxLength={500} onChange={e => setDraft(e.target.value)} autoComplete="off"/><button type="submit" disabled={!draft.trim() || chatBusy || Boolean(error)} aria-label="Send message"><ArrowRight size={22}/></button></form><span className="fe-chat-disclosure">AI demo · Fictional {hiring ? 'candidate' : 'founder'}</span></div>}
          {step === 'meeting' && <div className="fe-meeting"><motion.div className="fe-coffee-mark" initial={reduced ? false : { scale: .6, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 230, damping: 17 }}><Coffee size={46} strokeWidth={1.4}/><span><Check size={15}/></span></motion.div><span className="fe-kicker">FROM A MATCH TO A PERSON</span><h3>Coffee sounds good.</h3><p>You + {person.name}.<br/>A little less formal. A lot more human.</p><div className="fe-coffee-plan"><span>A possible first hello</span><h4>{person.location} · A café, not a boardroom.</h4><p>20 minutes to talk about the team, your ideas, and what you could build together.</p><div><span>Team rhythm</span><span>{hiring ? 'Their first project' : 'Your first project'}</span><span>Next steps</span></div></div><div className="fe-end-disclosure"><Check size={13}/><p>You’ve reached the end of the demo.<br/>No meeting has been booked.</p></div><Primary onClick={() => go('discover')}>Meet more people</Primary><button className="fe-text-button" type="button" onClick={() => go('chat')}>Back to the conversation</button></div>}
          {step === 'inbox' && <div className="fe-inbox"><StepTitle eyebrow="MUTUAL INTEREST. REAL CONVERSATIONS." title="Your conversations."/>{matchedIds.length ? <div className="fe-thread-list">{matchedIds.map(id => { const p = people.find(item => item.id === id), t = state.threads[id]; if (!p) return null; return <button type="button" key={id} onClick={() => openChat(id)}><img src={p.photo} alt=""/><div><h4>{p.name}<span>AI demo</span></h4><p>{t.messages.at(-1)?.content || 'Say hey.'}</p></div><ChevronRight size={16}/></button>; })}</div> : <div className="fe-empty"><MessageCircle size={37}/><h3>Good things start with hey.</h3><p>Find someone you’d like to work with. When the interest is mutual, you can talk.</p><Primary onClick={() => go('discover')}>Meet my people</Primary></div>}<div className="fe-response-note"><Check size={14}/><span>Interested, passed, or still deciding.<br/>Everyone deserves an answer.</span></div></div>}
          {step === 'profile' && <div className="fe-profile-page"><StepTitle eyebrow="PERSONALITY FIRST. ALWAYS." title={`${hiring ? profile.company : profile.name}.`}/><div className="fe-profile-summary"><div className="fe-avatar-initial">{hiring ? <Building2 size={29} strokeWidth={1.6}/> : profile.name.slice(0, 1).toUpperCase()}<Sparkles size={16}/></div><h4>{hiring ? `Hiring a ${profile.role.toLowerCase()}` : profile.role}</h4><p>{profile.location} · {profile.availability}</p>{hiring && <p className="fe-company-project">{profile.project}</p>}<div className="fe-summary-interests">{profile.interests.map(i => <span key={i}>{i}</span>)}</div></div><div className="fe-profile-preferences">{questions.map(q => <div key={q.key}><span>{q.title}</span><strong>{q.options.find(o => o.value === profile[q.key])?.label}</strong></div>)}</div><div className="fe-imported"><Check size={13}/>{hiring ? 'Skills we’re looking for' : 'Skills imported from your CV'}</div><div className="fe-skill-tags">{profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div><button type="button" className="fe-text-button" onClick={() => go('vibe')}>{hiring ? 'Edit our vibe' : 'Edit my vibe'}</button>{hiring && <button type="button" className="fe-text-button" onClick={() => go('brief')}>Edit the role</button>}</div>}
        </motion.div></AnimatePresence>
      </div>
      {hasOnboarded && step !== 'chat' && <nav className="fe-tabbar" aria-label="Full demo navigation"><button type="button" aria-current={step === 'discover' ? 'page' : undefined} onClick={() => go('discover')}><Sparkles size={21}/><span>Discover</span></button><button type="button" aria-current={step === 'inbox' ? 'page' : undefined} onClick={() => go('inbox')}><span className="fe-tab-icon"><MessageCircle size={21}/>{matchedIds.length > 0 && <i>{matchedIds.length}</i>}</span><span>Chats</span></button><button type="button" aria-current={step === 'profile' ? 'page' : undefined} onClick={() => go('profile')}><UserRound size={20}/><span>{hiring ? 'Our team' : 'Me'}</span></button></nav>}
      <div className="fe-home-indicator" aria-hidden="true"/>
      <AnimatePresence>{notice && <motion.div className="fe-toast" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 7 }}>{notice}</motion.div>}</AnimatePresence>
      <AnimatePresence>{resetPrompt && <motion.div className="fe-reset-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div ref={resetDialogRef} role="dialog" aria-modal="true" aria-labelledby="fe-reset-title"><h3 id="fe-reset-title">A fresh start?</h3><p>This resets your demo and takes you back to choosing a side.</p><button type="button" onClick={reset}>Start again</button><button type="button" onClick={() => setResetPrompt(false)}>Keep exploring</button></div></motion.div>}</AnimatePresence>
    </div></PhoneMockup></div>
  </section>;
}
