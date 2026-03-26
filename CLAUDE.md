# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ESLint plugin (`eslint-plugin-kassaila`) with three auto-fixable rules for ESLint 9+/10+ flat config. Written in TypeScript, distributed as dual ESM/CJS.

## Commands

- `npm run build` — build with tsup (ESM + CJS + types to `dist/`)
- `npm run lint` — lint src/ and tests/ with ESLint
- `npm test` — run vitest in watch mode
- `npm run test:run` — run vitest once
- `npx vitest run tests/<rule-name>.test.ts` — run a single test file

## Architecture

**Rule files** live in `src/rules/` and export a default `TSESLint.RuleModule`. Each rule has `meta` (type, docs, fixable, schema, messages), `defaultOptions`, and a `create(context)` function returning AST visitor methods.

**Plugin entry** (`src/index.ts`) imports all rules, registers them in `plugin.rules` with short names (e.g. `'switch-case-braces'`), and builds a self-referencing `plugin.configs.recommended` for flat config usage.

**Tests** use `@typescript-eslint/rule-tester` integrated with vitest via `tests/setup.ts`. Each test file calls `ruleTester.run()` with `valid` and `invalid` arrays. Invalid cases must specify `errors` (by messageId) and `output` (the auto-fixed result).

## Rules

| Rule | Purpose |
|------|---------|
| `jsdoc-comment-style` | Enforces `/** */` over `//`, forbids inline comments, validates TODO format |
| `prefer-arrow-without-this` | Converts functions to arrows when `this` is unused (skips methods/constructors/generators) |
| `switch-case-braces` | Requires braces around case/default clauses |

## Adding a New Rule

1. Create `src/rules/<rule-name>.ts` exporting a default `TSESLint.RuleModule`
2. Register it in `src/index.ts` under `plugin.rules` and add to `plugin.configs.recommended`
3. Add `tests/<rule-name>.test.ts` using the `RuleTester` pattern (import `./setup`)
