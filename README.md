# LearningStack

> Gamified daily learning for software developers — Duolingo for engineers.

---

## What Is LearningStack?

LearningStack is a responsive web app where developers sharpen their software engineering knowledge through daily quiz sessions. It features:

- **6 learning tracks**: JavaScript, Git, Python, SQL, Systems Design, and Java
- **Progressive difficulty**: questions advance from Easy to Medium to Hard as you complete each skill
- **Multiple question types**: single-choice, true/false, and code-output (typed answers)
- **XP, levels, and streaks**: earn experience points, level up, and maintain daily streaks
- **AI assistant**: ask follow-up questions about any quiz question, powered by OpenAI
- **Dark/light mode** with a developer-themed UI

## Technology Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Framework  | Next.js 15 (App Router)  |
| Language   | TypeScript 5 (strict)    |
| Styling    | Tailwind CSS             |
| ORM        | Drizzle ORM              |
| Database   | PostgreSQL (Supabase)    |
| AI         | OpenAI API (gpt-4o-mini) |
| Deployment | Vercel                   |

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (Supabase recommended)

### Setup

```bash
git clone https://github.com/gabrielspaulino/dev-game.git
cd dev-game
npm install
cp .env.example .env.local
```

Edit `.env.local` with your database credentials. At minimum, set:

- `DATABASE_URL` — pooled connection string (Supabase transaction pooler, port 6543)
- `DIRECT_DATABASE_URL` — direct connection string (for migrations and seeding)
- `OPENAI_API_KEY` — optional, enables the AI assistant feature

### Database

```bash
# Apply migrations
npm run db:migrate

# Seed skills and questions
npm run db:seed

# Import additional questions from JSON
npm run db:import
```

### Run

```bash
npm run dev
```

Visit http://localhost:3000.

## Scripts

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `npm run dev`         | Start development server       |
| `npm run build`       | Production build               |
| `npm run lint`        | Run ESLint                     |
| `npm run format`      | Format with Prettier           |
| `npm run typecheck`   | TypeScript type checking       |
| `npm run test`        | Run unit tests                 |
| `npm run test:e2e`    | Run end-to-end tests           |
| `npm run db:generate` | Generate migration from schema |
| `npm run db:migrate`  | Apply pending migrations       |
| `npm run db:seed`     | Seed skills and questions      |
| `npm run db:import`   | Import questions from JSON     |
| `npm run db:studio`   | Open Drizzle Studio            |

## How It Works

Each category (e.g., Systems Design) contains multiple skills (e.g., Fundamentals, Networking, Security). Progression follows a linear path:

```
skill1 EASY → skill2 EASY → ... → skillN EASY
skill1 MEDIUM → skill2 MEDIUM → ... → skillN MEDIUM
skill1 HARD → skill2 HARD → ... → skillN HARD
```

After answering 7 questions in a slot, the user advances to the next one. Quizzes pull 10 random questions from the current slot and track progress per skill and difficulty tier.

## Project Structure

```
├── AGENTS.md              # AI-agent rules
├── database/
│   ├── schema/            # Drizzle schema definitions
│   ├── migrations/        # Versioned migrations
│   ├── seed.ts            # Skill and question seeder
│   └── import-questions.ts# JSON question importer
├── src/
│   ├── app/               # Next.js pages and API routes
│   │   └── api/v1/        # REST endpoints (health, ask-ai)
│   ├── components/game/   # Quiz UI components
│   ├── lib/               # Progress, types, track styles
│   └── styles/            # Global CSS and theme
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/                  # Architecture, game rules, etc.
```

## Documentation

| Document               | Description                         |
| ---------------------- | ----------------------------------- |
| `AGENTS.md`            | AI-agent rules for contributors     |
| `docs/ARCHITECTURE.md` | System design and module boundaries |
| `docs/GAME_RULES.md`   | XP, levels, streaks, rewards        |
| `docs/DATA_MODEL.md`   | Database schema and entities        |
| `docs/DEPLOYMENT.md`   | Vercel + Supabase deployment guide  |
| `docs/SECURITY.md`     | Auth and threat model               |

## License

Private project.
