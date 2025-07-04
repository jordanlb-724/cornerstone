/* eslint-disable no-unused-vars */
const stylelint = require('stylelint');
const valueParser = require('postcss-value-parser');

const ruleName = 'custom/color-no-solid-alpha';
const messages = stylelint.utils.ruleMessages(ruleName, {
    expected: (func) => `Use ${func.slice(0, -1)}() instead of ${func}() when alpha is 1`,
});

function reportIfSolidAlpha(node, decl, result) {
    if (node.type !== 'function') return;

    if (['rgba', 'hsla'].includes(node.value)) {
        const args = node.nodes.filter((n) => ['word', 'number', 'function'].includes(n.type));

        const alphaNode = args[args.length - 1];
        if (!alphaNode) return;

        const alpha = parseFloat(alphaNode.value);

        if (alpha === 1) {
            stylelint.utils.report({
                message: messages.expected(node.value),
                node: decl,
                result,
                ruleName,
            });
        }
    }
}

function checkDeclaration(decl, result) {
    const parsed = valueParser(decl.value);
    parsed.walk((node) => reportIfSolidAlpha(node, decl, result));
}

function plugin() {
    return (root, result) => {
        root.walkDecls((decl) => checkDeclaration(decl, result));
    };
}

module.exports = stylelint.createPlugin(ruleName, plugin);

module.exports.ruleName = ruleName;
module.exports.messages = messages;
