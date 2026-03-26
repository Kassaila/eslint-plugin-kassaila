# eslint-plugin-kassaila

Custom ESLint plugin with opinionated code style rules. All rules are auto-fixable.

Requires ESLint 9+ (flat config).

## Installation

```bash
npm install eslint-plugin-kassaila --save-dev
```

## Usage

Use the recommended config to enable all rules:

```js
import kassaila from 'eslint-plugin-kassaila';

export default [kassaila.configs.recommended];
```

Or configure rules individually:

```js
import kassaila from 'eslint-plugin-kassaila';

export default [
  {
    plugins: { kassaila },
    rules: {
      'kassaila/jsdoc-comment-style': 'error',
      'kassaila/prefer-arrow-without-this': 'error',
      'kassaila/switch-case-braces': 'error',
    },
  },
];
```

## Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| [jsdoc-comment-style](#jsdoc-comment-style) | Require JSDoc-style block comments instead of line comments | Yes |
| [prefer-arrow-without-this](#prefer-arrow-without-this) | Prefer arrow functions when `this` is not used | Yes |
| [switch-case-braces](#switch-case-braces) | Require braces around each case/default clause in switch statements | Yes |

### jsdoc-comment-style

Enforces `/** */` block comments instead of `//` line comments. Consecutive line comments are merged into a single JSDoc block. Inline comments (on the same line as code) are forbidden. TODO comments must use the format `TODO: description`.

```js
/* bad */
// fetch user data
const user = getUser();
const x = 1; // increment

/* good */
/** fetch user data */
const user = getUser();
```

### prefer-arrow-without-this

Converts function expressions and declarations to arrow functions when `this` is not used. Skips methods, constructors, generators, and default exports.

```js
/* bad */
const fn = function (x) { return x + 1; };
function add(a, b) { return a + b; }

/* good */
const fn = (x) => x + 1;
const add = (a, b) => a + b;
```

### switch-case-braces

Requires braces around each `case`/`default` clause in switch statements to prevent scope issues with `let`/`const`.

```js
/* bad */
switch (x) {
  case 1:
    const y = 2;
    break;
}

/* good */
switch (x) {
  case 1: {
    const y = 2;
    break;
  }
}
```

## License

MIT
