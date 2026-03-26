import tseslint from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tseslint,
      parserOptions: {
        sourceType: 'module',
      },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
