import { RuleTester } from '@typescript-eslint/rule-tester';
import './setup';
import rule from '../src/rules/prefer-arrow-without-this';

const ruleTester = new RuleTester();

ruleTester.run('prefer-arrow-without-this', rule, {
  valid: [
    {
      code: 'const add = (a: number, b: number) => a + b;',
    },
    {
      code: `
const obj = {
  value: 1,
  getValue: function() { return this.value; }
};`,
    },
    {
      code: 'const obj = { method() {} };',
    },
    {
      code: 'function* gen() { yield 1; }',
    },
    {
      code: 'export default function() { return 1; }',
    },
    {
      code: 'function MyComponent() { return this.render(); }',
    },
  ],
  invalid: [
    {
      code: 'const add = function(a: number, b: number) { return a + b; };',
      output: 'const add = (a: number, b: number) => a + b;',
      errors: [{ messageId: 'preferArrow' as const }],
    },
    {
      code: 'function add(a: number, b: number) { return a + b; }',
      output: 'const add = (a: number, b: number) => a + b;',
      errors: [{ messageId: 'preferArrowDeclaration' as const }],
    },
  ],
});
