import type { Linter } from 'eslint';
import { createRequire } from 'node:module';

import plugin from '../index';

const _require =
  typeof globalThis.require === 'function' ? globalThis.require : createRequire(import.meta.url);

const resolve = (pkg: string): boolean => {
  try {
    _require.resolve(pkg);

    return true;
  } catch {
    return false;
  }
};

const configs: Linter.Config[] = [];

/**
 * @eslint/js — recommended rules
 */
if (resolve('@eslint/js')) {
  const eslint = _require('@eslint/js') as { configs: { recommended: Linter.Config } };

  configs.push(eslint.configs.recommended);
}

/**
 * typescript-eslint — recommendedTypeChecked
 */
if (resolve('typescript-eslint')) {
  const tseslint = _require('typescript-eslint') as {
    default: { configs: { recommendedTypeChecked: Linter.Config[] } };
  };

  configs.push(...tseslint.default.configs.recommendedTypeChecked);
}

/**
 * eslint-plugin-kassaila — custom rules
 */
configs.push(plugin.configs.recommended as Linter.Config);

/**
 * eslint-plugin-import-x — no-duplicates, no-cycle
 */
if (resolve('eslint-plugin-import-x')) {
  const importPlugin = _require('eslint-plugin-import-x');

  configs.push({
    name: 'kassaila/import-x',
    plugins: {
      'import-x': importPlugin as never,
    },
    rules: {
      'import-x/no-duplicates': 'error',
      'import-x/no-cycle': 'error',
    },
  });
}

/**
 * @stylistic/eslint-plugin — padding-line-between-statements
 */
if (resolve('@stylistic/eslint-plugin')) {
  const stylistic = _require('@stylistic/eslint-plugin') as Record<string, unknown>;

  configs.push({
    name: 'kassaila/stylistic',
    plugins: {
      '@stylistic': stylistic as never,
    },
    rules: {
      '@stylistic/padding-line-between-statements': [
        'error',
        /**
         * Empty line before return/break
         */
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'break' },
        /**
         * Empty line after variable declarations
         */
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        /**
         * Empty line before/after block statements
         */
        { blankLine: 'always', prev: '*', next: ['if', 'for', 'while', 'switch', 'try'] },
        { blankLine: 'always', prev: ['if', 'for', 'while', 'switch', 'try'], next: '*' },
        /**
         * Empty line between assignment and call expressions
         */
        {
          blankLine: 'always',
          prev: { selector: 'ExpressionStatement[expression.type=AssignmentExpression]' },
          next: { selector: 'ExpressionStatement[expression.type=CallExpression]' },
        },
        {
          blankLine: 'always',
          prev: { selector: 'ExpressionStatement[expression.type=CallExpression]' },
          next: { selector: 'ExpressionStatement[expression.type=AssignmentExpression]' },
        },
      ],
    },
  });
}

/**
 * eslint-config-prettier — disable conflicting rules
 */
if (resolve('eslint-config-prettier')) {
  const prettier = _require('eslint-config-prettier') as Linter.Config;

  configs.push(prettier);
}

/**
 * TypeScript rules
 */
if (resolve('typescript-eslint')) {
  configs.push({
    name: 'kassaila/ts-rules',
    rules: {
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    },
  });
}

/**
 * JavaScript rules
 */
configs.push({
  name: 'kassaila/js-rules',
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-implicit-coercion': ['error', { boolean: true, allow: [] }],
    'curly': ['error', 'all'],
    'prefer-arrow-callback': 'error',
    'default-case': 'error',
    'default-case-last': 'error',
  },
});

/**
 * Full TS config — adapts to installed packages.
 */
export const tsConfig: Linter.Config[] = configs;
