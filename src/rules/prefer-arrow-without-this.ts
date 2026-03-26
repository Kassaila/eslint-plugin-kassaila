import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'preferArrow' | 'preferArrowDeclaration';
type FunctionNode = TSESTree.FunctionExpression | TSESTree.FunctionDeclaration;

/**
 * ESLint rule: prefer-arrow-without-this
 *
 * Enforces arrow functions when `this` is not used.
 * Regular functions should only be used when `this` binding is needed.
 */
const rule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer arrow functions when `this` is not used',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferArrow:
        'Prefer arrow function. Use regular function only when `this` binding is needed.',
      preferArrowDeclaration:
        'Prefer arrow function. Convert `function {{ name }}()` to `const {{ name }} = () =>`.',
    },
  },

  defaultOptions: [],

  create(context) {
    const functionsWithThis = new WeakSet<TSESTree.Node>();
    const functionStack: FunctionNode[] = [];

    const isMethod = (node: TSESTree.FunctionExpression): boolean => {
      const parent = node.parent;

      if (parent?.type === 'Property' && parent.method) {
        return true;
      }

      if (parent?.type === 'MethodDefinition') {
        return true;
      }

      return false;
    };

    const isConstructorLike = (node: FunctionNode): boolean => {
      const parent = node.parent;

      if (parent?.type === 'NewExpression') {
        return true;
      }

      if (node.type === 'FunctionDeclaration' && node.id) {
        const name = node.id.name;

        if (name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase()) {
          return true;
        }
      }

      if (
        node.type === 'FunctionExpression' &&
        parent?.type === 'VariableDeclarator' &&
        parent.id.type === 'Identifier'
      ) {
        const name = parent.id.name;

        if (name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase()) {
          return true;
        }
      }

      return false;
    };

    const shouldSkipDeclaration = (node: TSESTree.FunctionDeclaration): boolean => {
      const parent = node.parent;

      if (parent?.type === 'ExportDefaultDeclaration') {
        return true;
      }

      if (!node.id) {
        return true;
      }

      return false;
    };

    const fixExpression = (
      fixer: TSESLint.RuleFixer,
      node: TSESTree.FunctionExpression,
    ): TSESLint.RuleFix | null => {
      const sourceCode = context.sourceCode;
      const bodyText = sourceCode.getText(node.body);
      const paramsText = node.params.map((p) => sourceCode.getText(p)).join(', ');
      const asyncPrefix = node.async ? 'async ' : '';

      if (node.generator) {
        return null;
      }

      if (
        node.body.type === 'BlockStatement' &&
        node.body.body.length === 1 &&
        node.body.body[0].type === 'ReturnStatement' &&
        node.body.body[0].argument
      ) {
        const returnValue = sourceCode.getText(node.body.body[0].argument);
        const wrappedValue = returnValue.trimStart().startsWith('{')
          ? `(${returnValue})`
          : returnValue;

        return fixer.replaceText(node, `${asyncPrefix}(${paramsText}) => ${wrappedValue}`);
      }

      return fixer.replaceText(node, `${asyncPrefix}(${paramsText}) => ${bodyText}`);
    };

    const fixDeclaration = (
      fixer: TSESLint.RuleFixer,
      node: TSESTree.FunctionDeclaration,
    ): TSESLint.RuleFix | null => {
      if (!node.id || node.generator) {
        return null;
      }

      const sourceCode = context.sourceCode;
      const name = node.id.name;
      const bodyText = sourceCode.getText(node.body);
      const paramsText = node.params.map((p) => sourceCode.getText(p)).join(', ');
      const asyncPrefix = node.async ? 'async ' : '';

      const returnType = node.returnType ? sourceCode.getText(node.returnType) : '';

      if (
        node.body.type === 'BlockStatement' &&
        node.body.body.length === 1 &&
        node.body.body[0].type === 'ReturnStatement' &&
        node.body.body[0].argument
      ) {
        const returnValue = sourceCode.getText(node.body.body[0].argument);
        const wrappedValue = returnValue.trimStart().startsWith('{')
          ? `(${returnValue})`
          : returnValue;

        return fixer.replaceText(
          node,
          `const ${name} = ${asyncPrefix}(${paramsText})${returnType} => ${wrappedValue};`,
        );
      }

      return fixer.replaceText(
        node,
        `const ${name} = ${asyncPrefix}(${paramsText})${returnType} => ${bodyText};`,
      );
    };

    return {
      'FunctionExpression'(node: TSESTree.FunctionExpression): void {
        functionStack.push(node);
      },

      'FunctionDeclaration'(node: TSESTree.FunctionDeclaration): void {
        functionStack.push(node);
      },

      'ThisExpression'(): void {
        for (let i = functionStack.length - 1; i >= 0; i--) {
          const fn = functionStack[i];

          functionsWithThis.add(fn);

          break;
        }
      },

      'FunctionExpression:exit'(node: TSESTree.FunctionExpression): void {
        functionStack.pop();

        if (isMethod(node)) {
          return;
        }

        if (isConstructorLike(node)) {
          return;
        }

        if (node.generator) {
          return;
        }

        if (!functionsWithThis.has(node)) {
          context.report({
            node,
            messageId: 'preferArrow',
            fix: (fixer) => fixExpression(fixer, node),
          });
        }
      },

      'FunctionDeclaration:exit'(node: TSESTree.FunctionDeclaration): void {
        functionStack.pop();

        if (shouldSkipDeclaration(node)) {
          return;
        }

        if (isConstructorLike(node)) {
          return;
        }

        if (node.generator) {
          return;
        }

        if (!functionsWithThis.has(node)) {
          context.report({
            node,
            messageId: 'preferArrowDeclaration',
            data: { name: node.id?.name ?? 'anonymous' },
            fix: (fixer) => fixDeclaration(fixer, node),
          });
        }
      },
    };
  },
};

export default rule;
