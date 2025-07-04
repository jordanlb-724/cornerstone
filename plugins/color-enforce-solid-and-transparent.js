/* eslint-disable no-unused-vars */
const stylelint = require('stylelint');
const valueParser = require('postcss-value-parser');

const ruleName = 'custom/color-enforce-solid-and-transparent';
const messages = stylelint.utils.ruleMessages(ruleName, {
    noAlphaSolid: (func) => `Solid colors should use HEX or HSL instead of ${func.toUpperCase()} when alpha is 1.`,
    noHexTransparency: () => 'Transparent colors must use RGBA or HSLA, not HEX or HSL.',
});

function reportNoAlphaSolid(fnName, decl, result) {
    stylelint.utils.report({
        message: messages.noAlphaSolid(fnName),
        node: decl,
        result,
        ruleName,
    });
}

function reportNoHexTransparency(decl, result) {
    stylelint.utils.report({
        message: messages.noHexTransparency(),
        node: decl,
        result,
        ruleName,
    });
}

const isValueNode = (n) => n.type === 'word' || n.type === 'function' || n.type === 'number';

function handleFunctionNode(node, decl, result) {
    const fnName = node.value.toLowerCase();
    const args = node.nodes.filter(isValueNode);

    if (['rgba', 'hsla'].includes(fnName)) {
        const alphaNode = args[args.length - 1];
        if (!alphaNode) {
            return;
        }

        const alpha = parseFloat(alphaNode.value);
        if (alpha === 1) {
            reportNoAlphaSolid(fnName, decl, result);
        }
    }
}

function handleWordNode(node, decl, result) {
    const value = node.value.toLowerCase();

    if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/.test(value)) {
        return;
    }

    if (value.startsWith('rgb') || value.startsWith('hsl')) {
        if (value.includes('/')) {
            reportNoHexTransparency(decl, result);
        }
    }
}

function walkNode(node, decl, result) {
    if (node.type === 'function') {
        handleFunctionNode(node, decl, result);
    } else if (node.type === 'word') {
        handleWordNode(node, decl, result);
    }
}

module.exports = stylelint.createPlugin(ruleName, function (primaryOption, secondaryOptions) {
    return function (root, result) {
        root.walkDecls((decl) => {
            const parsed = valueParser(decl.value);
            parsed.walk((node) => walkNode(node, decl, result));
        });
    };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
