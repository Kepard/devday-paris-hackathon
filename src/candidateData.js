// Canonical fictional identities for both sides of the demo.
// Photos, ages and names are presentation data; matching uses stated role/work preferences only.
import { profiles } from './profiles.js';
import { profileExtras } from './profileExtras.js';

export const founderFacts = {
  maya: { role: 'Product designer', salary: '€38–48k', feedback: 'direct', autonomy: 'freedom', collaboration: 'together', cafe: 'a little café near Canal Saint-Martin' },
  alex: { role: 'Frontend developer', salary: '£38–50k', feedback: 'talk', autonomy: 'freedom', collaboration: 'async', cafe: 'a coffee spot in East London' },
  noor: { role: 'Product designer', salary: '€36–46k', feedback: 'talk', autonomy: 'freedom', collaboration: 'together', cafe: 'a quiet café by the canal' },
  jules: { role: 'Frontend developer', salary: '€36–46k', feedback: 'talk', autonomy: 'structure', collaboration: 'async', cafe: 'a café in Croix-Rousse' },
  sam: { role: 'Creative developer', salary: '€38–48k', feedback: 'direct', autonomy: 'freedom', collaboration: 'together', cafe: 'a coffee spot in Kreuzberg' },
  nina: { role: 'Product manager', salary: '€42–52k', feedback: 'direct', autonomy: 'structure', collaboration: 'async', cafe: 'a café in Nørrebro' },
  eli: { role: 'Community & growth', salary: '€30–40k', feedback: 'talk', autonomy: 'structure', collaboration: 'together', cafe: 'a café in Gràcia' },
  zoe: { role: 'Product designer', salary: '€32–42k', feedback: 'talk', autonomy: 'freedom', collaboration: 'async', cafe: 'a coffee spot in Príncipe Real' },
  amir: { role: 'Frontend developer', salary: '€36–46k', feedback: 'direct', autonomy: 'freedom', collaboration: 'together', cafe: 'a café near the Old Port' },
  leo: { role: 'Creative developer', salary: '€38–48k', feedback: 'direct', autonomy: 'freedom', collaboration: 'together', cafe: 'a café in the 11th' },
};

const candidateDetails = {
  maya: {
    skills: ['Figma', 'Product design', 'Prototyping'],
    experience: 'Design internship + independent projects', availability: 'Available in 4 weeks',
    salary: '€35–42k',
    project: 'A habit tracker that lets friends encourage each other without turning life into a leaderboard.',
    bio: 'A product designer who loves turning messy ideas into something people can actually use.',
    looking: 'A small product team that shares rough ideas early.',
    opener: 'hey! your team caught my eye. what are you most excited to build next?',
  },
  alex: {
    skills: ['React', 'TypeScript', 'CSS'],
    experience: '1 year in frontend development', availability: 'Available in 1 month',
    salary: '£35–42k',
    project: 'A local gig guide with saved line-ups, accessible pages and absolutely no autoplay.',
    bio: 'A frontend developer who cares about readable code, small details and a good playlist.',
    looking: 'A team with clear context and room to build independently.',
    opener: 'hey, i like what you’re building. what would your next frontend hire get to own?',
  },
  noor: {
    skills: ['Figma', 'Brand design', 'User research'],
    experience: 'Recent design graduate + freelance projects', availability: 'Available now',
    salary: '€33–40k',
    project: 'A neighbourhood swap-board prototype built around interviews with local residents.',
    bio: 'A designer who starts with questions and enjoys making useful things feel welcoming.',
    looking: 'A thoughtful team where asking why is a good thing.',
    opener: 'hey! who are you building for, and what have they surprised you with lately?',
  },
  jules: {
    skills: ['TypeScript', 'React', 'Node.js'],
    experience: 'Computer science graduate + 6-month internship', availability: 'Available in 2 weeks',
    salary: '€33–40k',
    project: 'A trail planner that saves routes offline and makes weekend trips easier to organise.',
    bio: 'A calm frontend developer who likes clear priorities, useful feedback and a proper stretch of focus time.',
    looking: 'A team with clear priorities and space to get into the work.',
    opener: 'hey! what does a normal week look like for someone joining your team?',
  },
  sam: {
    skills: ['Creative coding', 'WebGL', 'Motion'],
    experience: '1 year of interactive freelance projects', availability: 'Available in 3 weeks',
    salary: '€34–42k',
    project: 'An interactive music visualiser that turns a track into a live, playful web scene.',
    bio: 'A creative developer who enjoys rough prototypes, weird ideas and honest feedback.',
    looking: 'A team that makes room for experiments and actually ships them.',
    opener: 'hey! what’s the slightly weird idea your team wants to try but hasn’t yet?',
  },
  nina: {
    skills: ['Product strategy', 'Research', 'Analytics'],
    experience: '2 years in product operations and research', availability: 'Available in 1 month',
    salary: '€39–46k',
    project: 'A tiny decision log that helps a team remember what it tried and why.',
    bio: 'A product person who likes useful research, clear decisions and kindly direct feedback.',
    looking: 'A small team that explains the context behind its decisions.',
    opener: 'hey! what’s the most useful thing you’ve learned from your users recently?',
  },
  eli: {
    skills: ['Community', 'Content', 'Growth'],
    experience: 'Community internship + volunteer event organising', availability: 'Available now',
    salary: '€28–35k',
    project: 'A monthly community supper with a simple newsletter, sign-up page and rotating hosts.',
    bio: 'A community builder who enjoys welcoming people, writing useful things and making small events happen.',
    looking: 'A friendly team that wants to build a real community.',
    opener: 'hey! who are the people you’re trying to bring together?',
  },
  zoe: {
    skills: ['Visual design', 'Figma', 'Motion'],
    experience: 'Design graduate + 1 year of freelance work', availability: 'Available in 2 weeks',
    salary: '€30–37k',
    project: 'A quiet portfolio tool that gives photographers more control over how their work is shown.',
    bio: 'A visual designer who notices the small stuff and prefers thoughtful critique to a room full of hot takes.',
    looking: 'A creative team that values thoughtful feedback and autonomy.',
    opener: 'hey! what’s one thing you wish your product felt more like?',
  },
  amir: {
    skills: ['React', 'TypeScript', 'APIs'],
    experience: '2 years building web tools for small teams', availability: 'Available in 1 month',
    salary: '€34–42k',
    project: 'A lightweight booking tool made for a friend’s independent studio.',
    bio: 'A frontend builder who enjoys turning a sketch into a useful little product.',
    looking: 'A low-ego team where people can own an idea from sketch to release.',
    opener: 'hey! if i joined, what’s the first useful thing we could make together?',
  },
  leo: {
    skills: ['React', 'Creative coding', 'AI tools'],
    experience: '1 year of creative coding + independent projects', availability: 'Available in 3 weeks',
    salary: '€35–43k',
    project: 'A collaborative moodboard that turns a group’s references into a small interactive prototype.',
    bio: 'A social, hands-on creative developer who learns best by making something small with other people.',
    looking: 'A close-knit creative team that likes building things together.',
    opener: 'hey! what’s the ambitious thing you’re working towards right now?',
  },
};

export const candidateFacts = Object.fromEntries(profiles.map(person => {
  const details = candidateDetails[person.id];
  return [person.id, { ...founderFacts[person.id], ...details, name: person.name, location: person.location, interests: [...person.interests] }];
}));

export const candidateProfiles = profiles.map(person => {
  const facts = candidateFacts[person.id];
  return {
    ...person,
    role: facts.role,
    skills: [...facts.skills],
    looking: facts.looking,
    opener: facts.opener,
    experience: facts.experience,
    availability: facts.availability,
    // Everyone in this fictional candidate deck is open to an introduction.
    // The UI still checks the selected opening against the stated desired role.
    mutual: true,
  };
});

export const candidateExtras = Object.fromEntries(profiles.map(person => {
  const facts = candidateFacts[person.id], founderExtra = profileExtras[person.id];
  return [person.id, {
    project: facts.project,
    team: facts.experience,
    mode: `${person.location} · Open to hybrid or remote`,
    communication: founderExtra.communication,
    life: founderExtra.life,
    experience: facts.experience,
    availability: facts.availability,
    bio: facts.bio,
  }];
}));

const personId = personOrId => typeof personOrId === 'string' ? personOrId : personOrId?.id;
export const peopleForIntent = intent => intent === 'hiring' ? candidateProfiles : profiles;
export const factsForPerson = (personOrId, intent) => (intent === 'hiring' ? candidateFacts : founderFacts)[personId(personOrId)];
export const extrasForPerson = (personOrId, intent) => (intent === 'hiring' ? candidateExtras : profileExtras)[personId(personOrId)];
