import { ESLint, Linter } from 'eslint';

declare const plugin: ESLint.Plugin & {
    configs: Record<string, Linter.Config>;
};

export { plugin as default };
