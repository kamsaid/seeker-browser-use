# Repository Guide

## Overview

Seeker AI is a Next.js application providing a browser automation interface that integrates the Browser-Use API and optional OpenAI GPT‑4o capabilities.
The project is written in TypeScript and organized under several top level folders:

- **app** – application pages and layouts
- **components** – reusable UI components
- **hooks** – React hooks for interacting with the Browser‑Use API and OpenAI agent
- **agent** – Browser‑Use API client and OpenAI agent logic
- **vm** – sandbox VM utilities and interfaces
- **lib** – configuration and helper utilities

## Directory Guide

| Directory | Contents | When to Modify |
| --- | --- | --- |
| `app/` | Next.js pages, route handlers, and global layout. | When changing UI screens or API routes. |
| `components/` | ShadCN based UI components and custom widgets. | Create or update reusable UI pieces. |
| `hooks/` | React hooks for Browser‑Use tasks, OpenAI integration, and VM state. | Extend client side logic. |
| `agent/` | TypeScript modules for calling the Browser‑Use API and the OpenAI powered agent. | Modify core automation logic or API wrappers. |
| `vm/` | Firecracker/mocked VM management utilities and context provider. | Update sandbox VM behavior. |
| `lib/` | Shared configuration and small helpers. | Add new config or cross‑cutting utilities. |
| `public/` | Static assets served by Next.js. | Rarely edited; avoid automated changes. |
| `styles/` | Tailwind CSS globals. | Only touch when adjusting global styles. |

## Environment Setup

The container image provides Python **3.11**, Node.js **22**, and common tools:

```bash
pyenv --version    # 2.5.5
uv --version       # 0.7.5
poetry --version   # 2.1.3
node --version     # 22.x (via nvm 0.40.2)
```

Install Python development and test dependencies with:

```bash
uv pip install -e ".[test]"
```

For Node packages use `pnpm install` or `npm install`.

## Lint / Test / Type‑check

The CI expects the following commands to succeed before merge:

```bash
ruff check
black --check
pytest
mypy
pyright
```

Run them locally and ensure all pass.

## Contribution Rules

- Use descriptive file and function names; prefer `kebab-case` for files and `camelCase` for variables.
- Commit messages should start with a present‑tense verb, e.g. `Add VM defaults`.
- PR titles follow the same style and summarize the change.
- Keep changes focused; split large refactors into multiple PRs when possible.

## Codex Guidance

Codex should primarily modify files in `app/`, `agent/`, `hooks/`, `components/`, `vm/`, and `lib/`.
Avoid touching `public/` or generated artifacts.
Always run the full lint and test suite before presenting a diff.
