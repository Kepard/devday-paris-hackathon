import React, { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Coffee, FileText, Sparkles } from 'lucide-react';
import './OriginalStory.css';

const ease = [.22, 1, .36, 1];
const steps = [
  { title: 'Start with you.', copy: 'Your personality. Your interests. The stuff a CV can’t tell us.', visual: 'traits' },
  { title: 'Skip the admin.', copy: 'Drop your CV. Skills import themselves. We’ll deal with the boring stuff.', visual: 'cv' },
  { title: 'Talk like people.', copy: 'You like them. They like you. Say hey to the person building the team.', visual: 'chat' },
];

function SmallVisual({ kind }) {
  return <div className={`original-story-visual original-story-${kind}`} aria-hidden="true">
    {kind === 'traits' && <><span><Sparkles size={12} strokeWidth={1.7}/> Curious</span><span><Coffee size={12} strokeWidth={1.7}/> Coffee</span></>}
    {kind === 'cv' && <div className="original-story-paper"><FileText size={19} strokeWidth={1.5}/><i/><i/><b><Check size={12} strokeWidth={2.4}/></b></div>}
    {kind === 'chat' && <><span>hey you.</span><span>hey :)</span></>}
  </div>;
}

export default function OriginalStory() {
  const headingId = useId();
  const reduced = useReducedMotion();
  const reveal = {
    initial: reduced ? false : { opacity: 0, y: 12 },
    animate: reduced ? { opacity: 1, y: 0 } : undefined,
    whileInView: reduced ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: .3 },
  };

  return <section id="how-it-works" className="original-story" aria-labelledby={headingId}>
    <motion.h2 id={headingId} className="original-story-heading" {...reveal} transition={{ duration: .7, ease }}>
      Less corporate bullshit.<br/><span>More actual chemistry.</span>
    </motion.h2>
    <ol className="original-story-steps">
      {steps.map((step, index) => <motion.li key={step.visual} {...reveal} transition={{ duration: .7, delay: reduced ? 0 : index * .06, ease }}>
        <SmallVisual kind={step.visual}/>
        <div className="original-story-copy"><h3>{step.title}</h3><p>{step.copy}</p></div>
      </motion.li>)}
    </ol>
  </section>;
}
