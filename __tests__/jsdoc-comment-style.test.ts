import { RuleTester } from '@typescript-eslint/rule-tester';
import './setup';
import rule from '../src/rules/jsdoc-comment-style';

const ruleTester = new RuleTester({
  linterOptions: {
    reportUnusedDisableDirectives: 'off',
  },
});

ruleTester.run('jsdoc-comment-style', rule, {
  valid: [
    {
      code: `
/**
 * This is valid
 */
const x = 1;`,
    },
    {
      code: `
/**
 * TODO: Valid todo
 */
const x = 1;`,
    },
    {
      code: '// eslint-disable-next-line no-unused-vars',
    },
    {
      code: '// @ts-expect-error testing',
    },
    {
      code: '// ═══════════════',
    },
  ],
  invalid: [
    {
      code: '// line comment',
      output: '/**\n * line comment\n */',
      errors: [{ messageId: 'preferJsdoc' as const }],
    },
    {
      code: '/** single line jsdoc */',
      output: '/**\n * single line jsdoc\n */',
      errors: [{ messageId: 'singleLineJsdoc' as const }],
    },
    {
      code: `
/**
 * todo implement
 */`,
      output: `
/**
 * TODO: implement
 */`,
      errors: [{ messageId: 'todoFormat' as const }],
    },
  ],
});
