import React, { useId, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Check, FileText, MessageCircle, RefreshCw, Sparkles } from 'lucide-react';
import './JobHuntStory.css';

const ease = [.22, 1, .36, 1];
const applications = [
  { title: 'Application sent', detail: 'Cover letter_final_FINAL.pdf', icon: FileText, x: -21, y: -64, rotate: -8 },
  { title: 'Refreshing…', detail: 'Maybe this time.', icon: RefreshCw, x: 14, y: 0, rotate: 5 },
  { title: 'Still waiting…', detail: 'You deserve more than silence.', icon: MessageCircle, x: -8, y: 64, rotate: -3 },
];

export default function JobHuntStory() {
  const headingId = useId();
  const visualRef = useRef(null);
  const seen = useInView(visualRef, { once: true, amount: .55 });
  const reduced = useReducedMotion();
  const active = seen || reduced;
  const reveal = {
    initial: reduced ? false : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: .3 },
    transition: { duration: .7, ease },
  };

  return <section className="job-hunt-story" id="job-hunt" aria-labelledby={headingId}>
    <motion.div className="job-hunt-copy" {...reveal}>
      <span className="job-hunt-eyebrow">A TOUGH MARKET. ESPECIALLY AT THE START.</span>
      <h2 id={headingId}>Job hunting is<br/><span>hard enough.</span></h2>
      <p className="job-hunt-problem">Applications pile up.<br/>Conversations don’t.</p>
      <p className="job-hunt-promise"><strong>A more human starting point.</strong>Shared interests. Working style. A direct conversation with a startup founder.</p>
    </motion.div>

    <figure className="job-hunt-visual" ref={visualRef} aria-label="Illustration: unanswered applications give way to a conversation with a founder after a mutual match.">
      <div className="job-hunt-scene" aria-hidden="true">
        <motion.div className="job-hunt-glow" initial={false} animate={{ opacity: active ? 1 : 0, scale: active ? 1 : .8 }} transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 1.5, ease }}/>
        {applications.map(({ title, detail, icon: Icon, x, y, rotate }, index) => <motion.div key={title} className="job-hunt-application"
          initial={false}
          animate={reduced ? { opacity: 0 } : active ? { x: [x, x + 4, 100], y: [y, y - 3, y - 25], rotate: [rotate, rotate, rotate + 8], scale: [1, 1, .88], opacity: [1, 1, 0], filter: ['blur(0px)', 'blur(0px)', 'blur(5px)'] } : { x, y, rotate, opacity: 1 }}
          transition={{ duration: reduced ? 0 : 2, times: [0, .67, 1], delay: reduced ? 0 : index * .1, ease }}>
          <span className="job-hunt-file-icon"><Icon size={21} strokeWidth={1.6}/></span>
          <span><strong>{title}</strong><small>{detail}</small></span>
          <i/>
        </motion.div>)}
        <motion.div className="job-hunt-conversation"
          initial={reduced ? false : { opacity: 0, y: 28, scale: .9 }}
          animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 28, scale: .9 }}
          transition={{ type: 'spring', stiffness: 240, damping: 25, delay: reduced ? 0 : 1.95, ...(reduced ? { duration: 0 } : {}) }}>
          <div className="job-hunt-person"><img src="/assets/profiles/maya.jpg" alt="" loading="lazy"/><span><strong>Maya</strong><small>Co-founder at Orbit</small></span><span className="job-hunt-mutual"><Check size={12}/> Mutual match</span></div>
          <div className="job-hunt-message">hey, let’s talk about<br/>what we could build.<ArrowUpRight size={21}/></div>
          <span className="job-hunt-connection"><Sparkles size={13}/> It starts with something in common.</span>
        </motion.div>
      </div>
      <figcaption>Fewer barriers to a first hello.<span>Illustrative demo</span></figcaption>
    </figure>
  </section>;
}
