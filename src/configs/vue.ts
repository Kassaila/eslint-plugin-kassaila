import type { Linter } from 'eslint';
import { createRequire } from 'node:module';

import { tsConfig } from './ts';

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

const configs: Linter.Config[] = [...tsConfig];

/**
 * eslint-plugin-vue — flat/recommended
 */
if (resolve('eslint-plugin-vue')) {
  const pluginVue = _require('eslint-plugin-vue') as { configs: Record<string, Linter.Config[]> };

  configs.push(...pluginVue.configs['flat/recommended']);
}

/**
 * @vue/eslint-config-typescript — recommendedTypeChecked
 * Must be wrapped with defineConfigWithVueTs (Proxy requirement)
 */
if (resolve('@vue/eslint-config-typescript')) {
  const { defineConfigWithVueTs, vueTsConfigs } = _require('@vue/eslint-config-typescript') as {
    defineConfigWithVueTs: (...args: unknown[]) => Linter.Config[];
    vueTsConfigs: Record<string, unknown>;
  };

  configs.push(...defineConfigWithVueTs(vueTsConfigs.recommendedTypeChecked));
}

/**
 * @vue/eslint-config-prettier — skip formatting
 */
if (resolve('@vue/eslint-config-prettier/skip-formatting')) {
  const skipFormatting = _require('@vue/eslint-config-prettier/skip-formatting') as Linter.Config;

  configs.push(skipFormatting);
}

/**
 * Vue rules
 */
if (resolve('eslint-plugin-vue')) {
  configs.push({
    name: 'kassaila/vue',
    rules: {
      /**
       * Priority A: Essential
       */
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'error',
      'vue/require-v-for-key': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      'vue/require-prop-types': 'error',

      /**
       * Priority B: Strongly Recommended
       */
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/html-self-closing': [
        'error',
        { html: { void: 'always', normal: 'always', component: 'always' } },
      ],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/v-on-event-hyphenation': ['error', 'always'],

      /**
       * Priority C: Recommended
       */
      'vue/attributes-order': ['error', { alphabetical: false }],
      'vue/order-in-components': 'error',

      /**
       * Additional
       */
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/define-macros-order': [
        'error',
        { order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'] },
      ],
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/no-empty-component-block': 'error',
    },
  });
}

/**
 * Full Vue config — adapts to installed packages.
 */
export const vueConfig: Linter.Config[] = configs;
