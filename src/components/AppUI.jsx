import React from 'react';
import { BatteryFull, ChevronRight, Signal, Sparkles, Wifi } from 'lucide-react';
import './AppUI.css';

// Shared presentation for the quick swipe preview and the complete app.
export function AppStatusBar() {
  return <div className="fe-status" aria-hidden="true"><span>9:41</span><i/><div><Signal size={15} fill="currentColor"/><Wifi size={15}/><BatteryFull size={20}/></div></div>;
}

export function AppHeader({ children }) {
  return <div className="fe-app-header"><div className="fe-brand"><img src="/assets/app-logo.svg" alt=""/><span>find your daddy</span></div>{children}</div>;
}

export function DiscoveryHeading({ title = 'Your people.', current, total, showCount = true }) {
  return <div className="fe-discovery-heading"><div><span>PERSONALITY FIRST</span><h3>{title}</h3></div>{showCount && <small>{Math.min(current, total)}/{total}</small>}</div>;
}

export function ProfileCardContent({ person, selectedInterests, facts, onDetails, detailsLabel = 'Why you two?', detailsClassName, disabled = false, behind = false }) {
  const shared = person.interests.filter(interest => selectedInterests.includes(interest)).length;
  return <>
    <span className="fe-person-shared"><Sparkles size={14}/>{shared ? `${shared} shared interest${shared === 1 ? '' : 's'}` : 'A new perspective'}</span>
    <div className="fe-person-intro">
      <span>{person.role}</span>
      <h4>{person.name}<small>, {person.age}</small></h4>
      <p>“{person.quote}”</p>
      <div className="fe-mini-tags">{person.interests.map(interest => <span key={interest} className={selectedInterests.includes(interest) ? 'shared' : ''}>{interest}</span>)}</div>
      <button type="button" className={detailsClassName} tabIndex={behind ? -1 : 0} disabled={disabled || behind} onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); onDetails(event); }}>{detailsLabel}<ChevronRight size={17}/></button>
    </div>
    <div className="fe-role-strip"><span>{facts.role}</span><span>{facts.salary} · {person.location}</span></div>
  </>;
}
