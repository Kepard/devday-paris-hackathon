# Find Your Daddy

**Stop applying. Start matching.**

A personality-first job-matching web prototype connecting early-career talent with founders and small startup teams. Shared interests and working style start the conversation; skills add the context.

**[Open the app → fyd.kepard.dev](https://fyd.kepard.dev)** · Built for [DevDay Exchange Community: Paris](https://luma.com/6nccj7gu).

## The experience

- Choose your side: looking for a job or hiring.
- Set your interests and working style, then complete CV or role onboarding.
- Swipe through profiles, explore compatibility, and connect after a mutual match.
- Chat with AI-powered personas in short, natural messages, then take the conversation toward coffee in person.

The prototype runs in the browser with an iOS-inspired interface. Native iOS and Android apps are not available yet.

### Onboarding

| Choose your side | Introduce yourself | Your vibe |
| :---: | :---: | :---: |
| [<img src="docs/images/01-welcome.jpg" width="240" alt="Choose between finding a job and hiring" />](docs/images/01-welcome.jpg) | [<img src="docs/images/02-about-you.jpg" width="240" alt="Enter your name, preferred job domain and location" />](docs/images/02-about-you.jpg) | [<img src="docs/images/03-your-vibe.jpg" width="240" alt="Select your interests and working style" />](docs/images/03-your-vibe.jpg) |
| **Drop your CV** | **Ready to send** | **Ready to meet people** |
| [<img src="docs/images/04-cv-upload.jpg" width="240" alt="Drag a CV into the upload area" />](docs/images/04-cv-upload.jpg) | [<img src="docs/images/05-cv-ready.jpg" width="240" alt="Send the CV with the sling button" />](docs/images/05-cv-ready.jpg) | [<img src="docs/images/06-profile-ready.jpg" width="240" alt="Review your profile, skills and availability" />](docs/images/06-profile-ready.jpg) |

<details>
<summary>Recruiter onboarding</summary>

| Your team | Team vibe |
| :---: | :---: |
| [<img src="docs/images/14-your-team.jpg" width="240" alt="Introduce yourself and your startup" />](docs/images/14-your-team.jpg) | [<img src="docs/images/15-team-vibe.jpg" width="240" alt="Choose your team's interests and working style" />](docs/images/15-team-vibe.jpg) |
| **The role** | **Ready to find your teammate** |
| [<img src="docs/images/16-hiring-role.jpg" width="240" alt="Describe the role, project and skills you need" />](docs/images/16-hiring-role.jpg) | [<img src="docs/images/17-team-ready.jpg" width="240" alt="Review your team and hiring preferences" />](docs/images/17-team-ready.jpg) |

</details>

### Matching

| Discover your people | Why you two? | It’s a match |
| :---: | :---: | :---: |
| [<img src="docs/images/07-discover.jpg" width="240" alt="Swipe through people with shared interests" />](docs/images/07-discover.jpg) | [<img src="docs/images/08-compatibility.jpg" width="240" alt="Explore shared interests, working style and project details" />](docs/images/08-compatibility.jpg) | [<img src="docs/images/09-match.jpg" width="240" alt="Celebrate a mutual match" />](docs/images/09-match.jpg) |

### Conversation

| Break the ice | Find your rhythm | Take it to coffee |
| :---: | :---: | :---: |
| [<img src="docs/images/10-first-message.jpg" width="240" alt="Start a conversation after matching" />](docs/images/10-first-message.jpg) | [<img src="docs/images/11-conversation.jpg" width="240" alt="Exchange short, natural chat messages" />](docs/images/11-conversation.jpg) | [<img src="docs/images/12-coffee-invite.jpg" width="240" alt="Receive an invitation to meet over coffee" />](docs/images/12-coffee-invite.jpg) |

<details>
<summary>From a match to a first hello</summary>

[<img src="docs/images/13-coffee-plan.jpg" width="240" alt="Plan an informal first conversation in person" />](docs/images/13-coffee-plan.jpg)

</details>

## Run locally

Requires **Node.js 22.13+**.

```sh
git clone https://github.com/Kepard/devday-paris-hackathon.git
cd devday-paris-hackathon
npm ci
npm run dev
```

Open **http://localhost:5173**. To enable AI replies, copy `.env.example` to `.env`, add your own OpenAI API key and a future expiry date, then restart. Without a key, the complete flow remains usable with built-in conversation responses.

`npm test` runs the backend checks. `npm run build && npm start` serves the built app locally.

## Team

**Gérardo AMOUZOUVI · Vibol Arnaud Sok · Bogdan Gorelov**

React · Vite · Motion · Three.js · Node.js · SQLite · OpenAI API

[Design and asset credits](docs/CREDITS.md)
