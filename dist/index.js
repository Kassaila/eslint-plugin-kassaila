// src/rules/jsdoc-comment-style.ts
var rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require JSDoc-style block comments instead of line comments"
    },
    fixable: "code",
    schema: [],
    messages: {
      preferJsdoc: "Use JSDoc-style comment /** ... */ instead of line comment.",
      noInlineComment: "Inline comments are not allowed. Move comment above the code.",
      singleLineJsdoc: "JSDoc comments must use multiline format.",
      todoFormat: 'TODO comments must use format "TODO: description" (uppercase with colon).'
    }
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;
    const shouldIgnore = (comment) => {
      const text = comment.value.trim();
      if (comment.value.startsWith("/")) {
        return true;
      }
      if (text.startsWith("eslint-disable") || text.startsWith("eslint-enable") || text.startsWith("eslint-ignore")) {
        return true;
      }
      if (text.startsWith("@ts-") || text.startsWith("ts-ignore") || text.startsWith("ts-expect-error") || text.startsWith("ts-nocheck")) {
        return true;
      }
      if (/^[═=\-─_*#~]+$/.test(text)) {
        return true;
      }
      return false;
    };
    const isInlineComment = (comment) => {
      const line = sourceCode.lines[comment.loc.start.line - 1];
      const beforeComment = line.slice(0, comment.loc.start.column);
      return beforeComment.trim().length > 0;
    };
    const getIndent = (comment) => {
      const line = sourceCode.lines[comment.loc.start.line - 1];
      const match = line.match(/^(\s*)/);
      return match ? match[1] : "";
    };
    const areConsecutive = (prev, next) => {
      return prev.loc.end.line + 1 === next.loc.start.line;
    };
    const groupConsecutiveComments = (comments) => {
      const lineComments = comments.filter(
        (c) => c.type === "Line" && !shouldIgnore(c) && !isInlineComment(c)
      );
      if (lineComments.length === 0) {
        return [];
      }
      const groups = [];
      let currentGroup = [lineComments[0]];
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
      Program() {
        const comments = sourceCode.getAllComments();
        for (const comment of comments) {
          if (comment.type !== "Line") {
            continue;
          }
          if (shouldIgnore(comment)) {
            continue;
          }
          if (isInlineComment(comment)) {
            context.report({
              loc: comment.loc,
              messageId: "noInlineComment",
              fix: (fixer) => {
                const line = sourceCode.lines[comment.loc.start.line - 1];
                const indent = line.match(/^(\s*)/)?.[1] ?? "";
                const commentText = comment.value.trim();
                const beforeComment = line.slice(0, comment.loc.start.column);
                const trimmedBefore = beforeComment.trimEnd();
                const jsdocComment = `${indent}/**
${indent} * ${commentText}
${indent} */
`;
                const lineStart = sourceCode.getIndexFromLoc({ line: comment.loc.start.line, column: 0 }) ?? 0;
                const codeEndIndex = lineStart + trimmedBefore.length;
                const commentEndIndex = comment.range[1];
                return [
                  fixer.insertTextBeforeRange([lineStart, lineStart], jsdocComment),
                  fixer.removeRange([codeEndIndex, commentEndIndex])
                ];
              }
            });
          }
        }
        for (const comment of comments) {
          if (comment.type !== "Block") {
            continue;
          }
          const value = comment.value;
          if (!value.startsWith("*")) {
            continue;
          }
          if (value.includes("\n")) {
            continue;
          }
          const content = value.slice(1).trim();
          if (!content) {
            continue;
          }
          const indent = getIndent(comment);
          const replacement = `/**
${indent} * ${content}
${indent} */`;
          context.report({
            loc: comment.loc,
            messageId: "singleLineJsdoc",
            fix: (fixer) => {
              return fixer.replaceTextRange(comment.range, replacement);
            }
          });
        }
        for (const comment of comments) {
          if (comment.type !== "Block") {
            continue;
          }
          const value = comment.value;
          if (!value.startsWith("*")) {
            continue;
          }
          if (!/\btodo\b/i.test(value)) {
            continue;
          }
          const lines = value.split("\n");
          let hasInvalidTodo = false;
          for (const line of lines) {
            const content = line.replace(/^\s*\*?\s*/, "");
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
            const lineContent = line.replace(/^\s*\*?\s*/, "");
            if (!/\btodo\b/i.test(lineContent)) {
              return line;
            }
            const fixedContent = lineContent.replace(/\btodo\s*[-:]?\s*/i, "TODO: ");
            const leadingMatch = line.match(/^(\s*\*?\s*)/);
            const leading = leadingMatch ? leadingMatch[1] : " * ";
            return `${leading}${fixedContent}`;
          });
          const fixedValue = fixedLines.join("\n");
          const replacement = `/*${fixedValue}*/`;
          context.report({
            loc: comment.loc,
            messageId: "todoFormat",
            fix: (fixer) => {
              return fixer.replaceTextRange(comment.range, replacement);
            }
          });
        }
        const groups = groupConsecutiveComments(comments);
        for (const group of groups) {
          const firstComment = group[0];
          const lastComment = group[group.length - 1];
          const indent = getIndent(firstComment);
          const lines = group.map((c) => c.value.trim());
          const jsdocLines = lines.map((line) => `${indent} * ${line}`).join("\n");
          const replacement = `/**
${jsdocLines}
${indent} */`;
          context.report({
            loc: {
              start: firstComment.loc.start,
              end: lastComment.loc.end
            },
            messageId: "preferJsdoc",
            fix: (fixer) => {
              return fixer.replaceTextRange(
                [firstComment.range[0], lastComment.range[1]],
                replacement
              );
            }
          });
        }
      }
    };
  }
};
var jsdoc_comment_style_default = rule;

// src/rules/prefer-arrow-without-this.ts
var rule2 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer arrow functions when `this` is not used"
    },
    fixable: "code",
    schema: [],
    messages: {
      preferArrow: "Prefer arrow function. Use regular function only when `this` binding is needed.",
      preferArrowDeclaration: "Prefer arrow function. Convert `function {{ name }}()` to `const {{ name }} = () =>`."
    }
  },
  defaultOptions: [],
  create(context) {
    const functionsWithThis = /* @__PURE__ */ new WeakSet();
    const functionStack = [];
    const isMethod = (node) => {
      const parent = node.parent;
      if (parent?.type === "Property" && parent.method) {
        return true;
      }
      if (parent?.type === "MethodDefinition") {
        return true;
      }
      return false;
    };
    const isConstructorLike = (node) => {
      const parent = node.parent;
      if (parent?.type === "NewExpression") {
        return true;
      }
      if (node.type === "FunctionDeclaration" && node.id) {
        const name = node.id.name;
        if (name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase()) {
          return true;
        }
      }
      if (node.type === "FunctionExpression" && parent?.type === "VariableDeclarator" && parent.id.type === "Identifier") {
        const name = parent.id.name;
        if (name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase()) {
          return true;
        }
      }
      return false;
    };
    const shouldSkipDeclaration = (node) => {
      const parent = node.parent;
      if (parent?.type === "ExportDefaultDeclaration") {
        return true;
      }
      if (!node.id) {
        return true;
      }
      return false;
    };
    const fixExpression = (fixer, node) => {
      const sourceCode = context.sourceCode;
      const bodyText = sourceCode.getText(node.body);
      const paramsText = node.params.map((p) => sourceCode.getText(p)).join(", ");
      const asyncPrefix = node.async ? "async " : "";
      if (node.generator) {
        return null;
      }
      if (node.body.type === "BlockStatement" && node.body.body.length === 1 && node.body.body[0].type === "ReturnStatement" && node.body.body[0].argument) {
        const returnValue = sourceCode.getText(node.body.body[0].argument);
        const wrappedValue = returnValue.trimStart().startsWith("{") ? `(${returnValue})` : returnValue;
        return fixer.replaceText(node, `${asyncPrefix}(${paramsText}) => ${wrappedValue}`);
      }
      return fixer.replaceText(node, `${asyncPrefix}(${paramsText}) => ${bodyText}`);
    };
    const fixDeclaration = (fixer, node) => {
      if (!node.id || node.generator) {
        return null;
      }
      const sourceCode = context.sourceCode;
      const name = node.id.name;
      const bodyText = sourceCode.getText(node.body);
      const paramsText = node.params.map((p) => sourceCode.getText(p)).join(", ");
      const asyncPrefix = node.async ? "async " : "";
      const returnType = node.returnType ? sourceCode.getText(node.returnType) : "";
      if (node.body.type === "BlockStatement" && node.body.body.length === 1 && node.body.body[0].type === "ReturnStatement" && node.body.body[0].argument) {
        const returnValue = sourceCode.getText(node.body.body[0].argument);
        const wrappedValue = returnValue.trimStart().startsWith("{") ? `(${returnValue})` : returnValue;
        return fixer.replaceText(
          node,
          `const ${name} = ${asyncPrefix}(${paramsText})${returnType} => ${wrappedValue};`
        );
      }
      return fixer.replaceText(
        node,
        `const ${name} = ${asyncPrefix}(${paramsText})${returnType} => ${bodyText};`
      );
    };
    return {
      "FunctionExpression"(node) {
        functionStack.push(node);
      },
      "FunctionDeclaration"(node) {
        functionStack.push(node);
      },
      "ThisExpression"() {
        for (let i = functionStack.length - 1; i >= 0; i--) {
          const fn = functionStack[i];
          functionsWithThis.add(fn);
          break;
        }
      },
      "FunctionExpression:exit"(node) {
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
            messageId: "preferArrow",
            fix: (fixer) => fixExpression(fixer, node)
          });
        }
      },
      "FunctionDeclaration:exit"(node) {
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
            messageId: "preferArrowDeclaration",
            data: { name: node.id?.name ?? "anonymous" },
            fix: (fixer) => fixDeclaration(fixer, node)
          });
        }
      }
    };
  }
};
var prefer_arrow_without_this_default = rule2;

// src/rules/switch-case-braces.ts
var rule3 = {
  meta: {
    type: "layout",
    docs: {
      description: "Require braces around each case/default clause in switch statements"
    },
    fixable: "code",
    schema: [],
    messages: {
      requireBraces: "Expected braces around {{type}} clause."
    }
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;
    const hasBlockStatement = (node) => {
      if (node.consequent.length === 0) {
        return true;
      }
      if (node.consequent.length === 1 && node.consequent[0].type === "BlockStatement") {
        return true;
      }
      return false;
    };
    const getIndent = (node) => {
      const line = sourceCode.lines[node.loc.start.line - 1];
      const match = line.match(/^(\s*)/);
      return match ? match[1] : "";
    };
    const reindentStatements = (text, node) => {
      const baseIndent = getIndent(node);
      const lines = text.split("\n");
      return lines.map((line) => line.trim() ? `${baseIndent}  ${line.trim()}` : "").join("\n");
    };
    const fix = (fixer, node) => {
      if (node.consequent.length === 0) {
        return null;
      }
      const firstStatement = node.consequent[0];
      const lastStatement = node.consequent[node.consequent.length - 1];
      const statementsText = sourceCode.getText().slice(firstStatement.range[0], lastStatement.range[1]);
      const caseText = sourceCode.getText(node);
      const colonIndex = node.test ? caseText.indexOf(":", sourceCode.getText(node.test).length) : caseText.indexOf(":");
      const colonPosition = node.range[0] + colonIndex + 1;
      return fixer.replaceTextRange(
        [colonPosition, lastStatement.range[1]],
        ` {
${reindentStatements(statementsText, node)}
${getIndent(node)}}`
      );
    };
    return {
      SwitchCase(node) {
        if (!hasBlockStatement(node)) {
          const clauseType = node.test ? "case" : "default";
          context.report({
            node,
            messageId: "requireBraces",
            data: { type: clauseType },
            fix: (fixer) => fix(fixer, node)
          });
        }
      }
    };
  }
};
var switch_case_braces_default = rule3;

// src/index.ts
var plugin = {
  meta: {
    name: "eslint-plugin-kassaila",
    version: "1.0.0"
  },
  rules: {
    "jsdoc-comment-style": jsdoc_comment_style_default,
    "prefer-arrow-without-this": prefer_arrow_without_this_default,
    "switch-case-braces": switch_case_braces_default
  },
  configs: {}
};
plugin.configs.recommended = {
  plugins: {
    kassaila: plugin
  },
  rules: {
    "kassaila/jsdoc-comment-style": "error",
    "kassaila/prefer-arrow-without-this": "error",
    "kassaila/switch-case-braces": "error"
  }
};
var index_default = plugin;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map