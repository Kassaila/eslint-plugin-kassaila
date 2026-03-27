# eslint-plugin-kassaila

Custom ESLint plugin with auto-fixable code style rules and shareable configs for TypeScript and Vue
projects.

Requires ESLint 9 / 10 flat config.

## Table of Contents

- [Installation](#installation)
- [Rules](#rules)
  - [jsdoc-comment-style](#jsdoc-comment-style)
  - [prefer-arrow-without-this](#prefer-arrow-without-this)
  - [switch-case-braces](#switch-case-braces)
- [Configs](#configs)
  - [recommended](#recommended)
  - [tsConfig](#tsconfig)
  - [vueConfig](#vueconfig)

## Installation

```bash
npm install eslint-plugin-kassaila --save-dev
```

## Rules

All rules are auto-fixable.

| Rule                                 | Description                                                 |
| ------------------------------------ | ----------------------------------------------------------- |
| `kassaila/jsdoc-comment-style`       | Require JSDoc-style block comments instead of line comments |
| `kassaila/prefer-arrow-without-this` | Prefer arrow functions when `this` is not used              |
| `kassaila/switch-case-braces`        | Require braces around each `case`/`default` clause          |

### jsdoc-comment-style

Enforces `/** */` block comments instead of `//` line comments. Consecutive line comments are merged
into a single JSDoc block. Inline comments (on the same line as code) are forbidden. TODO comments
must use the format `TODO: description`.

```js
// bad
// fetch user data
const user = getUser();
const x = 1; // increment

// good
/** fetch user data */
const user = getUser();
```

### prefer-arrow-without-this

Converts function expressions and declarations to arrow functions when `this` is not used. Skips
methods, constructors, generators, and default exports.

```js
// bad
const fn = function (x) {
  return x + 1;
};
function add(a, b) {
  return a + b;
}

// good
const fn = (x) => x + 1;
const add = (a, b) => a + b;
```

### switch-case-braces

Requires braces around each `case`/`default` clause in switch statements to prevent scope issues
with `let`/`const`.

```js
// bad
switch (x) {
  case 1:
    const y = 2;
    break;
}

// good
switch (x) {
  case 1: {
    const y = 2;
    break;
  }
}
```

## Configs

### recommended

Enables all three custom rules. No external dependencies required.

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

### tsConfig

Full TypeScript config with opinionated rules. Includes `recommended`. Each block is conditionally
included based on installed packages — install only what you need.

```bash
npm install --save-dev \
  @eslint/js \
  typescript-eslint \
  eslint-config-prettier \
  @stylistic/eslint-plugin \
  eslint-plugin-import-x
```

```js
import { tsConfig } from 'eslint-plugin-kassaila/configs/ts';

export default [
  { ignores: ['dist/**'] },
  ...tsConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

**What each package adds:**

| Package                    | Preset / Rules                                        |
| -------------------------- | ----------------------------------------------------- |
| `@eslint/js`               | `recommended` preset                                  |
| `typescript-eslint`        | `recommendedTypeChecked` preset, TS rules (see below) |
| `eslint-plugin-import-x`   | `import-x/no-duplicates`, `import-x/no-cycle`         |
| `@stylistic/eslint-plugin` | `@stylistic/padding-line-between-statements`          |
| `eslint-config-prettier`   | Disables formatting rules that conflict with Prettier |

**TypeScript rules** (require `typescript-eslint`):

| Rule                          | Setting                                          |
| ----------------------------- | ------------------------------------------------ |
| `consistent-type-imports`     | `type-imports`, `inline-type-imports`            |
| `consistent-type-definitions` | `interface`                                      |
| `no-floating-promises`        | `ignoreVoid: true`                               |
| `no-misused-promises`         | `checksVoidReturn: false`                        |
| `no-unused-vars`              | `argsIgnorePattern: ^_`, `varsIgnorePattern: ^_` |
| `no-explicit-any`             | `warn`                                           |
| `no-non-null-assertion`       | `warn`                                           |
| `array-type`                  | `array-simple`                                   |

**JavaScript rules** (always included):

| Rule                    | Setting                      |
| ----------------------- | ---------------------------- |
| `prefer-const`          | `error`                      |
| `no-var`                | `error`                      |
| `eqeqeq`                | `always`, `null: ignore`     |
| `no-console`            | `warn`, allow `warn`/`error` |
| `no-implicit-coercion`  | `boolean: true`              |
| `curly`                 | `all`                        |
| `prefer-arrow-callback` | `error`                      |
| `default-case`          | `error`                      |
| `default-case-last`     | `error`                      |

### vueConfig

Full Vue + TypeScript config. Extends `tsConfig` with Vue presets and rules.

```bash
npm install --save-dev \
  @eslint/js \
  typescript-eslint \
  eslint-config-prettier \
  @stylistic/eslint-plugin \
  eslint-plugin-import-x \
  eslint-plugin-vue \
  @vue/eslint-config-typescript \
  @vue/eslint-config-prettier
```

```js
import { vueConfig } from 'eslint-plugin-kassaila/configs/vue';

export default [
  { ignores: ['dist/**'] },
  ...vueConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

**What each package adds** (in addition to `tsConfig`):

| Package                         | Preset / Rules                                   |
| ------------------------------- | ------------------------------------------------ |
| `eslint-plugin-vue`             | `flat/recommended` preset, Vue rules (see below) |
| `@vue/eslint-config-typescript` | `recommendedTypeChecked` for `.vue` files        |
| `@vue/eslint-config-prettier`   | Skip formatting in Vue templates                 |

**Vue rules** (require `eslint-plugin-vue`):

| Rule                                | Setting                                                |
| ----------------------------------- | ------------------------------------------------------ |
| `multi-word-component-names`        | `off`                                                  |
| `no-reserved-component-names`       | `error`                                                |
| `require-v-for-key`                 | `error`                                                |
| `no-use-v-if-with-v-for`            | `error`                                                |
| `require-prop-types`                | `error`                                                |
| `component-definition-name-casing`  | `PascalCase`                                           |
| `component-name-in-template-casing` | `PascalCase`                                           |
| `prop-name-casing`                  | `camelCase`                                            |
| `custom-event-name-casing`          | `camelCase`                                            |
| `html-self-closing`                 | `always` (void, normal, component)                     |
| `attribute-hyphenation`             | `always`                                               |
| `v-on-event-hyphenation`            | `always`                                               |
| `attributes-order`                  | `alphabetical: false`                                  |
| `order-in-components`               | `error`                                                |
| `block-order`                       | `script, template, style`                              |
| `define-macros-order`               | `defineOptions, defineProps, defineEmits, defineSlots` |
| `no-unused-refs`                    | `error`                                                |
| `no-useless-v-bind`                 | `error`                                                |
| `padding-line-between-blocks`       | `error`                                                |
| `prefer-separate-static-class`      | `error`                                                |
| `prefer-true-attribute-shorthand`   | `error`                                                |
| `no-empty-component-block`          | `error`                                                |

## License

MIT
