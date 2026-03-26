# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-26

### Added

#### Rules

- `jsdoc-comment-style` — enforce JSDoc-style block comments (`/** */`) instead of line comments
  (`//`), forbid inline comments, validate TODO format (`TODO: description`)
- `prefer-arrow-without-this` — convert function expressions and declarations to arrow functions when
  `this` is not used (skips methods, constructors, generators, default exports)
- `switch-case-braces` — require braces around each `case`/`default` clause in switch statements to
  prevent scope issues with `let`/`const`
- All rules are auto-fixable

#### Plugin

- `configs.recommended` — recommended config with all rules enabled at `error` level
- Dual ESM/CJS distribution with TypeScript declarations
