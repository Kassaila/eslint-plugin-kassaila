# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-27

### Added

#### Shareable Configs

- `configs/ts` — full TypeScript config with opinionated rules. Dynamically adapts to installed
  packages (`@eslint/js`, `typescript-eslint`, `eslint-plugin-import-x`, `@stylistic/eslint-plugin`,
  `eslint-config-prettier`). Includes TS rules (consistent-type-imports, no-floating-promises, etc.)
  and JS rules (prefer-const, curly, eqeqeq, etc.)
- `configs/vue` — full Vue + TypeScript config. Extends `tsConfig` with Vue presets
  (`eslint-plugin-vue`, `@vue/eslint-config-typescript`, `@vue/eslint-config-prettier`) and
  opinionated Vue rules (Style Guide A/B/C)
- Dynamic dependency detection via `createRequire` + `resolve()` — each block is conditionally
  included only when the corresponding package is installed

#### Tooling

- Prettier configuration (`.prettierrc.json`, `.prettierignore`)
- EditorConfig (`.editorconfig`)
- Husky pre-commit hooks with lint-staged (eslint --fix + prettier)
- Commitlint with `@commitlint/config-conventional`

## [0.1.0] - 2026-03-26

### Added

#### Rules

- `jsdoc-comment-style` — enforce JSDoc-style block comments (`/** */`) instead of line comments
  (`//`), forbid inline comments, validate TODO format (`TODO: description`)
- `prefer-arrow-without-this` — convert function expressions and declarations to arrow functions
  when `this` is not used (skips methods, constructors, generators, default exports)
- `switch-case-braces` — require braces around each `case`/`default` clause in switch statements to
  prevent scope issues with `let`/`const`
- All rules are auto-fixable

#### Plugin

- `configs.recommended` — recommended config with all rules enabled at `error` level
- Dual ESM/CJS distribution with TypeScript declarations
