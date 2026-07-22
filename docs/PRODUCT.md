# Product

## Vision

Help software developers continuously improve their skills through short, enjoyable daily practice — the way Duolingo made language learning a daily habit.

## Target Audience

Software developers at all levels who want to:

- Reinforce and refresh existing knowledge
- Identify and close knowledge gaps
- Build consistent learning habits
- Practice for technical interviews
- Stay current across a growing technology landscape

Primary persona: A working developer with limited free time who can dedicate 5–15 minutes per day to deliberate practice.

## Problem Being Solved

Developers often learn reactively — studying when a project demands a specific skill — rather than building a durable foundation. The result is knowledge that fades quickly and gaps that remain hidden until they cause problems in production or interviews.

There is no existing product that combines:

- Developer-specific technical content at depth
- Gamified habit-forming mechanics
- Spaced repetition adapted to software concepts
- Short daily sessions that fit a busy professional's schedule

## Value Proposition

dev-game gives developers:

- **Daily structure** — a session they can complete in under 15 minutes
- **Progress visibility** — XP, levels, streaks, and skill mastery bars
- **Adaptive content** — questions selected based on what they know and what they're forgetting
- **Real explanations** — not just "correct/wrong" but why, with code context
- **Honest diagnostics** — a placement test that finds gaps, not just confirms what you already know

## MVP Scope

The minimum viable product must include:

1. Registration and login (Supabase Auth)
2. User profile
3. One learning path: **Java Backend Developer**
4. Skills and levels associated with the learning path
5. Placement test
6. Daily learning sessions
7. Multiple-choice questions
8. Code-output prediction questions
9. Bug-identification questions
10. Explanations for correct and incorrect answers
11. XP calculation
12. User levels
13. Daily streaks
14. Progress by skill
15. Session history
16. User dashboard
17. Minimal administrative interface for managing questions
18. Automated tests
19. API documentation
20. Local development configuration
21. Vercel deployment configuration
22. Development seed data

## Out of Scope (MVP)

- Remote execution of user-submitted code
- Microservices
- Native Android or iOS applications
- Real-time chat or multiplayer
- Payments
- Complex competitive leagues
- Long-running background workers

These capabilities must remain possible to add later without rewriting the core.

## Product Metrics

**North-star metric:** Percentage of active users who complete at least three learning sessions per week.

Supporting metrics:

- Daily active users (DAU)
- Session completion rate
- Average session duration
- 7-day and 30-day retention
- Streak distribution
- Skill mastery progression rate
- Question accuracy rate by skill

## Product Terminology

| Term           | Definition                                                                       |
| -------------- | -------------------------------------------------------------------------------- |
| Learning Path  | A structured curriculum for a developer specialty (e.g., Java Backend Developer) |
| Module         | A topic group within a learning path (e.g., Spring Boot)                         |
| Skill          | A specific concept or capability within a module (e.g., Dependency Injection)    |
| Daily Session  | A curated set of questions for one day's practice                                |
| XP             | Experience points awarded for completing sessions and answering correctly        |
| Level          | A user's overall progression tier calculated from total XP                       |
| Streak         | The count of consecutive days on which the user completed a session              |
| Mastery        | A per-skill score (0–100) reflecting correctness and recency                     |
| Placement Test | An adaptive assessment to determine starting skill levels                        |

## Initial Assumptions

- Users are professional developers or advanced students
- Users will tolerate a Supabase-based auth flow initially
- Daily sessions of 10–15 questions are sufficient for habit formation
- Spaced repetition can be implemented with a simple algorithm initially
- PostgreSQL on Supabase is adequate for MVP traffic

## Known Product Risks

- User drop-off if content quality is low or explanations are shallow
- Difficulty keeping technical content current as languages and frameworks evolve
- Perceived overlap with LeetCode or HackerRank (different purpose — mastery, not competitive)
- Time required to build high-quality questions manually
