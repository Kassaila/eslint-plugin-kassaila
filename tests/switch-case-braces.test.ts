import { RuleTester } from '@typescript-eslint/rule-tester';
import './setup';
import rule from '../src/rules/switch-case-braces';

const ruleTester = new RuleTester();

ruleTester.run('switch-case-braces', rule, {
  valid: [
    {
      code: `
switch (x) {
  case 1: {
    doSomething();
    break;
  }
  default: {
    doDefault();
  }
}`,
    },
    {
      code: `
switch (x) {
  case 1:
  case 2: {
    doSomething();
    break;
  }
}`,
    },
  ],
  invalid: [
    {
      code: `
switch (x) {
  case 1:
    doSomething();
    break;
  default:
    doDefault();
}`,
      output: `
switch (x) {
  case 1: {
    doSomething();
    break;
  }
  default: {
    doDefault();
  }
}`,
      errors: [{ messageId: 'requireBraces' as const }, { messageId: 'requireBraces' as const }],
    },
  ],
});
