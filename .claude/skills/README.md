# Project skills

Agent skills that guide how code is written in this repo. Each lives in its own
folder as a `SKILL.md` with frontmatter; Claude Code auto-loads a skill when its
`description` matches the task. They encode our house style: **readability first,
100% type coverage, no `any`.**

## TypeScript / frontend (current set)

| Skill | Loads when… |
|---|---|
| [`typescript-style`](./typescript-style/SKILL.md) | writing/reviewing any `.ts`/`.tsx` — strict types, no `any`, naming, immutability, `as const` |
| [`typescript-generics`](./typescript-generics/SKILL.md) | generics are in play — when they're justified (Golden Rule) and how to keep them readable |
| [`typescript-switch-exhaustive`](./typescript-switch-exhaustive/SKILL.md) | branching on a finite/known set — prefer `switch` + `never` exhaustiveness over if/else chains |
| [`react-typescript`](./react-typescript/SKILL.md) | React `.tsx` — prop typing, discriminated-union props, typed hooks/events/context, no `React.FC` |

The skills cross-reference each other; `react-typescript` builds on the three core
TypeScript skills.
