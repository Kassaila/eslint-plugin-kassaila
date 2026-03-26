import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'requireBraces';

/**
 * ESLint rule: switch-case-braces
 *
 * Requires each case/default clause in switch statements to have a block statement (braces).
 * This improves readability and prevents scope-related issues with let/const.
 */
const rule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require braces around each case/default clause in switch statements',
    },
    fixable: 'code',
    schema: [],
    messages: {
      requireBraces: 'Expected braces around {{type}} clause.',
    },
  },

  defaultOptions: [],

  create(context) {
    const sourceCode = context.sourceCode;

    const hasBlockStatement = (node: TSESTree.SwitchCase): boolean => {
      if (node.consequent.length === 0) {
        return true;
      }

      if (node.consequent.length === 1 && node.consequent[0].type === 'BlockStatement') {
        return true;
      }

      return false;
    };

    const getIndent = (node: TSESTree.SwitchCase): string => {
      const line = sourceCode.lines[node.loc.start.line - 1];
      const match = line.match(/^(\s*)/);

      return match ? match[1] : '';
    };

    const reindentStatements = (text: string, node: TSESTree.SwitchCase): string => {
      const baseIndent = getIndent(node);
      const lines = text.split('\n');

      return lines.map((line) => (line.trim() ? `${baseIndent}  ${line.trim()}` : '')).join('\n');
    };

    const fix = (fixer: TSESLint.RuleFixer, node: TSESTree.SwitchCase): TSESLint.RuleFix | null => {
      if (node.consequent.length === 0) {
        return null;
      }

      const firstStatement = node.consequent[0];
      const lastStatement = node.consequent[node.consequent.length - 1];

      const statementsText = sourceCode
        .getText()
        .slice(firstStatement.range[0], lastStatement.range[1]);

      const caseText = sourceCode.getText(node);
      const colonIndex = node.test
        ? caseText.indexOf(':', sourceCode.getText(node.test).length)
        : caseText.indexOf(':');

      const colonPosition = node.range[0] + colonIndex + 1;

      return fixer.replaceTextRange(
        [colonPosition, lastStatement.range[1]],
        ` {\n${reindentStatements(statementsText, node)}\n${getIndent(node)}}`,
      );
    };

    return {
      SwitchCase(node): void {
        if (!hasBlockStatement(node)) {
          const clauseType = node.test ? 'case' : 'default';

          context.report({
            node,
            messageId: 'requireBraces',
            data: { type: clauseType },
            fix: (fixer) => fix(fixer, node),
          });
        }
      },
    };
  },
};

export default rule;
