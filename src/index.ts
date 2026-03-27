import type { ESLint, Linter } from 'eslint';

import jsdocCommentStyle from './rules/jsdoc-comment-style';
import preferArrowWithoutThis from './rules/prefer-arrow-without-this';
import switchCaseBraces from './rules/switch-case-braces';

const plugin: ESLint.Plugin & {
  configs: Record<string, Linter.Config | Linter.Config[]>;
} = {
  meta: {
    name: 'eslint-plugin-kassaila',
    version: '0.2.0',
  },
  rules: {
    'jsdoc-comment-style': jsdocCommentStyle as never,
    'prefer-arrow-without-this': preferArrowWithoutThis as never,
    'switch-case-braces': switchCaseBraces as never,
  },
  configs: {},
};

/**
 * Self-referencing configs — standard pattern for flat config plugins.
 * Usage: import kassaila from 'eslint-plugin-kassaila';
 *        export default [kassaila.configs.recommended];
 */
plugin.configs.recommended = {
  plugins: {
    kassaila: plugin,
  },
  rules: {
    'kassaila/jsdoc-comment-style': 'error',
    'kassaila/prefer-arrow-without-this': 'error',
    'kassaila/switch-case-braces': 'error',
  },
} as Linter.Config;

export default plugin;
