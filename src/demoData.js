import { factsForPerson } from './candidateData.js';
export { founderFacts } from './candidateData.js';

// Fictional, transparent demo facts. Preferences are declared, never inferred from a photo.
export const domainOptions = [
  { label: 'Design & UX', role: 'Product designer' },
  { label: 'Tech & engineering', role: 'Frontend developer' },
  { label: 'Creative technology', role: 'Creative developer' },
  { label: 'Marketing & community', role: 'Community & growth' },
  { label: 'Product & strategy', role: 'Product manager' },
];
export const roleForDomain = domain => domainOptions.find(option => option.label === domain)?.role || 'Product designer';
export const domainForRole = role => domainOptions.find(option => option.role === role)?.label || 'Design & UX';
export const workQuestions = [
  { key: 'feedback', title: 'Feedback that works for you?', options: [{ value: 'direct', label: 'Tell me straight' }, { value: 'talk', label: 'Talk it through' }] },
  { key: 'autonomy', title: 'How do you like to build?', options: [{ value: 'freedom', label: 'Give me room' }, { value: 'structure', label: 'Give me a plan' }] },
  { key: 'collaboration', title: 'Your best ideas happen…', options: [{ value: 'together', label: 'Thinking together' }, { value: 'async', label: 'In my own space' }] },
];

export const skillSuggestionsForDomain = domain => ({
  'Design & UX': ['Figma', 'Product design', 'User research', 'Prototyping', 'Visual design', 'Motion'],
  'Tech & engineering': ['React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js', 'APIs'],
  'Creative technology': ['Creative coding', 'WebGL', 'Motion', 'React', 'AI tools', 'Three.js'],
  'Marketing & community': ['Community', 'Content', 'Growth', 'Analytics', 'Copywriting', 'Events'],
  'Product & strategy': ['Product strategy', 'Research', 'Analytics', 'Roadmapping', 'Prototyping', 'Communication'],
}[domain] || ['Communication', 'Problem solving', 'Teamwork']);

export function rankPeople(people, candidate) {
  const interests = Array.isArray(candidate.interests) ? candidate.interests : [];
  const wantedSkills = Array.isArray(candidate.skills) ? candidate.skills.map(skill => skill.toLowerCase()) : [];
  const score = person => {
    const facts = factsForPerson(person, candidate.intent);
    if (!facts) return -1;
    const skillOverlap = candidate.intent === 'hiring'
      ? Math.min(3, person.skills.filter(skill => wantedSkills.includes(skill.toLowerCase())).length)
      : 0;
    return (facts.role === candidate.role ? 20 : 0)
      + person.interests.filter(interest => interests.includes(interest)).length * 2
      + ['feedback', 'autonomy', 'collaboration'].filter(key => candidate[key] === facts[key]).length * 2
      + (candidate.location === person.location ? 2 : 0)
      + skillOverlap;
  };
  return [...people].sort((a, b) => score(b) - score(a));
}

export function connectionReasons(person, candidate) {
  const facts = factsForPerson(person, candidate.intent);
  const hiring = candidate.intent === 'hiring';
  const interests = Array.isArray(candidate.interests) ? candidate.interests : [];
  const shared = person.interests.filter(interest => interests.includes(interest));
  if (!facts) return { shared, reasons: ['A person worth getting to know.'], discuss: 'Talk about what each of you is looking for.' };
  const reasons = [];
  if (shared.length) reasons.push(`You both love ${shared.slice(0, 2).map(interest => interest.toLowerCase()).join(' and ')}.`);
  if (facts.feedback === candidate.feedback) reasons.push(facts.feedback === 'direct' ? 'You both like honest, direct feedback.' : 'You both like talking feedback through.');
  if (facts.autonomy === candidate.autonomy) reasons.push(facts.autonomy === 'freedom' ? 'You both value room to figure things out.' : 'You both work well with a clear plan.');
  if (reasons.length < 2) reasons.push(facts.role === candidate.role
    ? hiring ? `They’re exploring ${facts.role.toLowerCase()} roles.` : `They’re looking for a ${candidate.role.toLowerCase()}.`
    : 'Different strengths. A conversation worth having.');
  let discuss = facts.autonomy !== candidate.autonomy
    ? facts.autonomy === 'freedom' ? 'They value a loose plan. You prefer more structure.' : 'They value a clear plan. You prefer more freedom.'
    : facts.feedback !== candidate.feedback
      ? 'You prefer different ways of giving feedback. Find a rhythm that works for both of you.'
      : facts.collaboration !== candidate.collaboration
        ? 'You have different rhythms for collaborating. Talk about it.'
        : 'What does a great first month look like for both of you?';
  if (facts.role !== candidate.role) discuss = hiring
    ? `Their focus is ${facts.role.toLowerCase()} work. Check whether your opening fits.`
    : `Their opening is for a ${facts.role.toLowerCase()}. Check whether the role fits.`;
  return { shared, reasons: reasons.slice(0, 2), discuss };
}
