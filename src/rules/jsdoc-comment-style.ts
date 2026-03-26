import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'preferJsdoc' | 'noInlineComment' | 'singleLineJsdoc' | 'todoFormat';

/**
 * ESLint rule: jsdoc-comment-style
 *
 * Requires comments to use JSDoc-style block comments above the code they describe.
 * Consecutive line comments are merged into a single JSDoc block.
 * Inline comments (on the same line as code) are forbidden.
 */
const rule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require JSDoc-style block comments instead of line comments',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferJsdoc: 'Use JSDoc-style comment /** ... */ instead of line comment.',
      noInlineComment: 'Inline comments are not allowed. Move comment above the code.',
      singleLineJsdoc: 'JSDoc comments must use multiline format.',
      todoFormat: 'TODO comments must use format "TODO: description" (uppercase with colon).',
    },
  },

  defaultOptions: [],

  create(context) {
    const sourceCode = context.sourceCode;

    const shouldIgnore = (comment: TSESTree.Comment): boolean => {
      const text = comment.value.trim();

      if (comment.value.startsWith('/')) {
        return true;
      }

      if (
        text.startsWith('eslint-disable') ||
        text.startsWith('eslint-enable') ||
        text.startsWith('eslint-ignore')
      ) {
        return true;
      }

      if (
        text.startsWith('@ts-') ||
        text.startsWith('ts-ignore') ||
        text.startsWith('ts-expect-error') ||
        text.startsWith('ts-nocheck')
      ) {
        return true;
      }

      if (/^[═=\-─_*#~]+$/.test(text)) {
        return true;
      }

      return false;
    };

    const isInlineComment = (comment: TSESTree.Comment): boolean => {
      const line = sourceCode.lines[comment.loc.start.line - 1];
      const beforeComment = line.slice(0, comment.loc.start.column);

      return beforeComment.trim().length > 0;
    };

    const getIndent = (comment: TSESTree.Comment): string => {
      const line = sourceCode.lines[comment.loc.start.line - 1];
      const match = line.match(/^(\s*)/);

      return match ? match[1] : '';
    };

    const areConsecutive = (prev: TSESTree.Comment, next: TSESTree.Comment): boolean => {
      return prev.loc.end.line + 1 === next.loc.start.line;
    };

    const groupConsecutiveComments = (comments: TSESTree.Comment[]): TSESTree.Comment[][] => {
      const lineComments = comments.filter(
        (c) => c.type === 'Line' && !shouldIgnore(c) && !isInlineComment(c),
      );

      if (lineComments.length === 0) {
        return [];
      }

      const groups: TSESTree.Comment[][] = [];
      let currentGroup: TSESTree.Comment[] = [lineComments[0]];

      for (let i = 1; i < lineComments.length; i++) {
        const prev = lineComments[i - 1];
        const curr = lineComments[i];

        if (areConsecutive(prev, curr)) {
          currentGroup.push(curr);
        } else {
          groups.push(currentGroup);
          currentGroup = [curr];
        }
      }

      groups.push(currentGroup);

      return groups;
    };

    return {
      Program(): void {
        const comments = sourceCode.getAllComments();

        for (const comment of comments) {
          if (comment.type !== 'Line') {
            continue;
          }

          if (shouldIgnore(comment)) {
            continue;
          }

          if (isInlineComment(comment)) {
            context.report({
              loc: comment.loc,
              messageId: 'noInlineComment',
              fix: (fixer) => {
                const line = sourceCode.lines[comment.loc.start.line - 1];
                const indent = line.match(/^(\s*)/)?.[1] ?? '';
                const commentText = comment.value.trim();

                const beforeComment = line.slice(0, comment.loc.start.column);
                const trimmedBefore = beforeComment.trimEnd();

                const jsdocComment = `${indent}/**\n${indent} * ${commentText}\n${indent} */\n`;

                const lineStart =
                  sourceCode.getIndexFromLoc({ line: comment.loc.start.line, column: 0 }) ?? 0;
                const codeEndIndex = lineStart + trimmedBefore.length;
                const commentEndIndex = comment.range[1];

                return [
                  fixer.insertTextBeforeRange([lineStart, lineStart], jsdocComment),
                  fixer.removeRange([codeEndIndex, commentEndIndex]),
                ];
              },
            });
          }
        }

        for (const comment of comments) {
          if (comment.type !== 'Block') {
            continue;
          }

          const value = comment.value;
          if (!value.startsWith('*')) {
            continue;
          }

          if (value.includes('\n')) {
            continue;
          }

          const content = value.slice(1).trim();

          if (!content) {
            continue;
          }

          const indent = getIndent(comment);
          const replacement = `/**\n${indent} * ${content}\n${indent} */`;

          context.report({
            loc: comment.loc,
            messageId: 'singleLineJsdoc',
            fix: (fixer) => {
              return fixer.replaceTextRange(comment.range, replacement);
            },
          });
        }

        for (const comment of comments) {
          if (comment.type !== 'Block') {
            continue;
          }

          const value = comment.value;
          if (!value.startsWith('*')) {
            continue;
          }

          if (!/\btodo\b/i.test(value)) {
            continue;
          }

          const lines = value.split('\n');
          let hasInvalidTodo = false;

          for (const line of lines) {
            const content = line.replace(/^\s*\*?\s*/, '');

            if (!/\btodo\b/i.test(content)) {
              continue;
            }

            if (/^TODO: \S/.test(content)) {
              continue;
            }

            hasInvalidTodo = true;
            break;
          }

          if (!hasInvalidTodo) {
            continue;
          }

          const fixedLines = lines.map((line) => {
            const lineContent = line.replace(/^\s*\*?\s*/, '');

            if (!/\btodo\b/i.test(lineContent)) {
              return line;
            }

            const fixedContent = lineContent.replace(/\btodo\s*[-:]?\s*/i, 'TODO: ');

            const leadingMatch = line.match(/^(\s*\*?\s*)/);
            const leading = leadingMatch ? leadingMatch[1] : ' * ';

            return `${leading}${fixedContent}`;
          });

          const fixedValue = fixedLines.join('\n');
          const replacement = `/*${fixedValue}*/`;

          context.report({
            loc: comment.loc,
            messageId: 'todoFormat',
            fix: (fixer) => {
              return fixer.replaceTextRange(comment.range, replacement);
            },
          });
        }

        const groups = groupConsecutiveComments(comments);

        for (const group of groups) {
          const firstComment = group[0];
          const lastComment = group[group.length - 1];
          const indent = getIndent(firstComment);

          const lines = group.map((c) => c.value.trim());
          const jsdocLines = lines.map((line) => `${indent} * ${line}`).join('\n');
          const replacement = `/**\n${jsdocLines}\n${indent} */`;

          context.report({
            loc: {
              start: firstComment.loc.start,
              end: lastComment.loc.end,
            },
            messageId: 'preferJsdoc',
            fix: (fixer) => {
              return fixer.replaceTextRange(
                [firstComment.range[0], lastComment.range[1]],
                replacement,
              );
            },
          });
        }
      },
    };
  },
};

export default rule;
