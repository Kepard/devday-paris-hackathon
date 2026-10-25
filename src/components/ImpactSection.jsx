import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check, FileText, Heart, MessageCircle, Sparkles } from 'lucide-react';
import ImpactHeadline from './ImpactHeadline';
import IceBreaker from './IceBreaker';
import './ImpactSection.css';

const ease = [.16, 1, .3, 1];
const topics = [
  { title: 'Feedback', question: 'How do you like to get feedback?', answer: 'Honest. Kind. Before I overthink it.' },
  { title: 'Autonomy', question: 'A clear plan or room to explore?', answer: 'Give me the goal. Let me find the way.' },
  { title: 'Ambition', question: 'What do you want to build next?', answer: 'Something small that actually matters.' },
];
function Entrance({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .85, delay, ease }}>{children}</motion.div>;
}

function PotentialVisual() {
  const reduced = useReducedMotion();
  return <div className="potential-visual" aria-hidden="true">
    <motion.div className="potential-cv" initial={reduced ? false : { rotate: 0, x: 28 }} whileInView={{ rotate: -10, x: 0 }} viewport={{ once: true }} transition={{ duration: .95, ease }}>
      <FileText size={25} strokeWidth={1.4}/><span>My CV</span><i/><i/><i/><small>Just getting started.</small><b><Check size={11}/> Skills imported</b>
    </motion.div>
    <motion.div className="potential-photo" initial={reduced ? false : { opacity: 0, y: 30, rotate: -5 }} whileInView={{ opacity: 1, y: 0, rotate: 5 }} viewport={{ once: true }} transition={{ duration: .8, delay: .2, ease }}><img src="/assets/profiles/noor.jpg" alt="" loading="lazy"/><span>More to me.</span></motion.div>
    <motion.span className="potential-chip chip-curious" initial={reduced ? false : { opacity: 0, scale: .8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: .5, type: 'spring', stiffness: 280, damping: 18 }}><Sparkles size={13}/> Curious</motion.span>
    <motion.span className="potential-chip chip-builds" initial={reduced ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .65, duration: .5 }}>Makes things happen</motion.span>
  </div>;
}
function FounderVisual() {
  const reduced = useReducedMotion();
  return <div className="founder-visual" aria-hidden="true">
    <div className="shortlist-pile"><span/><span/><span/></div>
    <div className="shortlist-people">{['maya', 'jules', 'sam'].map((id, i) => <motion.div key={id} initial={reduced ? false : { opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .16 + i * .12, type: 'spring', stiffness: 240, damping: 24 }}><img src={`/assets/profiles/${id}.jpg`} alt="" loading="lazy"/>{i === 1 && <b><Heart size={11} fill="currentColor"/></b>}</motion.div>)}</div>
    <svg className="shortlist-path" viewBox="0 0 260 80"><motion.path d="M 130 0 V 20 Q 130 36 148 36 H 190 Q 208 36 208 54 V 80" fill="none" stroke="#b4d5fb" strokeWidth="1.5" strokeDasharray="4 5" initial={reduced ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .8, delay: .4 }}/></svg>
    <motion.div className="founder-message" initial={reduced ? false : { opacity: 0, y: 15, scale: .9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ delay: .65, type: 'spring', stiffness: 260, damping: 21 }}><MessageCircle size={17}/><span>Hey. Let’s build something.</span></motion.div>
    <span className="mutual-note"><Check size={12}/> The interest goes both ways.</span>
  </div>;
}

export default function ImpactSection({ onSound }) {
  const [topic, setTopic] = useState(0);
  const reduced = useReducedMotion();
  return <section id="idea" className="impact-section" aria-labelledby="impact-heading">
    <div className="impact-intro">
      <Entrance><p className="impact-eyebrow">Early careers. Small teams. Big potential.</p></Entrance>
      <ImpactHeadline id="impact-heading" text="Find people you can build with." className="impact-heading"/>
      <Entrance delay={.12}><p className="impact-premise">Bring personality, interests and working style into the <strong className="first-highlight">first<motion.svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><motion.path d="M3 8 Q45 0 97 6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" initial={reduced ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .5, delay: .45 }}/></motion.svg></strong> conversation.</p></Entrance>
    </div>
    <div className="impact-benefits">
      <Entrance className="impact-benefit">
        <PotentialVisual/>
        <div className="benefit-copy"><span className="benefit-audience">For early-career talent</span><h3>Potential gets a face.</h3><p>Show founders the person behind a short CV.</p></div>
      </Entrance>
      <Entrance className="impact-benefit" delay={.12}>
        <FounderVisual/>
        <div className="benefit-copy"><span className="benefit-audience">For small teams without HR</span><h3>A head start on hiring.</h3><p>Meet relevant people. Give a clear answer. Start talking.</p></div>
      </Entrance>
    </div>

    <div className="ice-story">
      <div className="ice-story-copy">
        <Entrance><span className="impact-eyebrow">Chemistry starts somewhere.</span><h3>Shared interests<br/><span>break the ice.</span></h3><p>Working style takes the conversation further.</p></Entrance>
        <div className="working-topics" role="group" aria-label="Explore a working-style conversation">{topics.map((t, i) => <button key={t.title} aria-pressed={topic === i} onClick={() => { setTopic(i); onSound?.('tap'); }}>{t.title}</button>)}</div>
        <div className="working-conversation" aria-live="polite">
          <AnimatePresence mode="wait"><motion.div key={topic} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .23 }}><span className="working-question">{topics[topic].question}</span><span className="working-answer">{topics[topic].answer}</span></motion.div></AnimatePresence>
        </div>
      </div>
      <div className="ice-story-art"><IceBreaker/></div>
    </div>

    <Entrance className="impact-evidence">
      <a className="teamwork-fact" href="https://www.naceweb.org/docs/default-source/default-document-library/2025/publication/research-report/2025-nace-job-outlook-jan-2025.pdf" target="_blank" rel="noreferrer"><strong>81<span>%</span></strong><span>look for teamwork.<small>US graduate employers · NACE 2025 <ArrowUpRight size={11}/></small></span></a>
      <div className="pilot-goals"><span className="benefit-audience">Our next test: a real hiring pilot.</span><div><span>Conversation</span><ArrowRight size={14}/><span>Interview</span><ArrowRight size={14}/><span>Offer</span></div><p>Measure the journey. Check in again after 90 days.</p></div>
    </Entrance>
  </section>;
}
