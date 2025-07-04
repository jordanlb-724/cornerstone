const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

function hasBlockDisplay(node) {
    return node.prop === 'display' && node.value === 'block';
}

/**
 * Transforms a postcss-value-parser node representing an rgb() function.
 * This function mutates the input `node` directly.
 * It handles two main cases:
 * 1. Converts modern `rgb(R G B / A)` syntax (space-separated values with alpha)
 *    to `rgba(R, G, B, A)` (comma-separated with explicit alpha function name).
 * 2. Converts modern `rgb(R G B)` syntax (space-separated values without alpha)
 *    to `rgb(R, G, B)` (comma-separated).
 * @param {object} node - The postcss-value-parser AST node to transform.
 *                        Expected to be of type 'function' with value 'rgb'.
 */
function transformRgbNode(node) {
    if (node.type !== 'function' || node.value !== 'rgb') {
        return;
    }

    const values = [];
    let hasAlpha = false;
    let alphaValue = '';

    node.nodes.forEach((childNode) => {
        if (childNode.type === 'word') {
            // Collect up to 3 color values, as long as alpha separator hasn't been seen
            if (!hasAlpha && values.length < 3) {
                values.push(childNode.value);
                // If alpha separator has been seen, this word should be the alpha value
            } else if (hasAlpha && /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(childNode.value)) {
                // Check if it's a valid numeric value (integers and decimals)
                alphaValue = childNode.value;
            }
            // Alpha separator '/' is a 'div' type node
        } else if (childNode.type === 'div' && childNode.value === '/') {
            hasAlpha = true;
        }
    });

    if (hasAlpha && alphaValue && values.length === 3) {
        node.value = 'rgba';
        node.nodes = [
            { type: 'word', value: values[0] },
            { type: 'div', value: ',' },
            { type: 'space', value: ' ' },
            { type: 'word', value: values[1] },
            { type: 'div', value: ',' },
            { type: 'space', value: ' ' },
            { type: 'word', value: values[2] },
            { type: 'div', value: ',' },
            { type: 'space', value: ' ' },
            { type: 'word', value: alphaValue },
        ];
    } else if (values.length === 3) {
        const str = valueParser.stringify(node);
        if (str.includes(' ') && !str.includes(',')) {
            node.nodes = [
                { type: 'word', value: values[0] },
                { type: 'div', value: ',' },
                { type: 'space', value: ' ' },
                { type: 'word', value: values[1] },
                { type: 'div', value: ',' },
                { type: 'space', value: ' ' },
                { type: 'word', value: values[2] },
            ];
        }
    }
}

module.exports = (_opts = {}) => {
    return {
        Once(root, { _result }) {
            // Step 1: Add stylelint-disable comments at the beginning
            // const stylelintDisables = [
            //     'font-weight-notation',
            //     'alpha-value-notation',
            //     'comment-empty-line-before',
            //     'declaration-block-no-duplicate-properties',
            //     'declaration-block-no-duplicate-custom-properties',
            //     'no-duplicate-selectors',
            //     'plugin/use-defensive-css',
            //     'color-function-notation',
            //     'color-hex-alpha',
            //     'color-hex-length',
            //     'selector-not-notation',
            //     'a11y/selector-pseudo-class-focus',
            //     'declaration-block-no-redundant-longhand-properties',
            //     'length-zero-no-unit',
            //     'order/properties-order',
            //     'order/order',
            // ];

            // Add the stylelint-disable comments
            // First, remove any existing at-rule-no-deprecated and a11y comments to add them at the top
            root.walkComments((comment) => {
                if (
                    comment.text.includes('stylelint-disable at-rule-no-deprecated') ||
                    comment.text.includes('stylelint-disable a11y/')
                ) {
                    comment.remove();
                }
            });

            // Add all stylelint-disable comments at the beginning
            // stylelintDisables.toReversed().forEach((rule) => {
            //     root.prepend(postcss.comment({ text: ` stylelint-disable ${rule} ` }));
            //     root.prepend('\n');
            // });

            // Step 2: Remove dark mode media queries
            root.walkAtRules('media', (atRule) => {
                if (atRule.params.includes('prefers-color-scheme: dark')) {
                    atRule.remove();
                }
            });

            // Step 3: Remove problematic prose selectors
            const toRemove = [];
            root.walkRules((rule) => {
                // Remove any selector containing ol[type= with 's' attribute selector
                // These selectors break in stencil-cli's node-sass
                if (
                    rule.selector.includes('.prose') &&
                    rule.selector.includes('ol[type=') &&
                    rule.selector.match(/ol\[type=["'][AIai]["']\s+s\]/)
                ) {
                    toRemove.push(rule);
                }
            });
            toRemove.forEach((rule) => rule.remove());

            // Step 4: Add !important to background-color (except transparent)
            root.walkDecls('background-color', (decl) => {
                if (!decl.value.includes('!important') && !decl.value.includes('transparent')) {
                    decl.value = `${decl.value} !important`;
                } else if (decl.value === 'transparent !important') {
                    decl.value = 'transparent';
                }
            });

            // // Step 5: Fix duplicate !important
            root.walkDecls((decl) => {
                decl.value = decl.value.replace('!important !important', ' !important');
            });

            // Step 6: Add stylelint-disable-next-line for vertical-align in block elements
            root.walkRules((rule) => {
                if (
                    rule.selector.includes('img,') ||
                    rule.selector.includes('svg,') ||
                    rule.selector.includes('video,')
                ) {
                    rule.walkDecls('vertical-align', (decl) => {
                        if (rule.some(hasBlockDisplay)) {
                            const comment = postcss.comment({
                                text: ' stylelint-disable-next-line plugin/declaration-block-no-ignored-properties',
                            });
                            rule.insertBefore(decl, comment);
                        }
                    });
                }
            });

            // Step 7: Move :root to the top (after comments and functions)
            const rootRule = root.nodes.find((node) => node.type === 'rule' && node.selector === ':root');
            if (rootRule) {
                // Find the position after all comments and @function rules
                let insertAfter = null;
                for (const element of root.nodes) {
                    const node = element;
                    if (node.type !== 'comment' && node.type !== 'atrule') {
                        break;
                    }
                    if (node.type === 'atrule' && node.name === 'function') {
                        insertAfter = node;
                    }
                }

                if (insertAfter) {
                    root.insertAfter(insertAfter, rootRule.clone());
                } else {
                    root.prepend(rootRule.clone());
                }
                rootRule.remove();
            }

            // Step 8: Fix specific color values
            root.walkDecls((decl) => {
                // Fix ring color
                if (decl.prop === '--tw-ring-color' && decl.value.includes('59, 130, 246')) {
                    decl.value = 'rgba(27, 27, 27, 0.5)';
                }

                // Fix prose invert pre bg
                if (decl.prop === '--tw-prose-invert-pre-bg' && decl.value === 'rgb(0 0 0 / 50%)') {
                    decl.value = 'rgb(0 0 0 / 0.5)';
                }

                // Fix specific rgb colors with / 0
                const colorFixes = {
                    'rgb(10 10 10 / 0)': '#0a0a0a',
                    'rgb(27 27 27 / 0)': '#1b1b1b',
                    'rgb(225 163 4 / 0)': '#e1a304',
                    'rgb(251 191 36 / 0)': '#fbbf24',
                };

                Object.entries(colorFixes).forEach(([from, to]) => {
                    if (decl.value.includes(from)) {
                        decl.value = decl.value.replace(new RegExp(from, 'g'), to);
                    }
                });

                // Fix hex color #0b60ea to #1b1b1b
                if (decl.value.includes('#0b60ea')) {
                    decl.value = decl.value.replace(/#0b60ea/g, '#1b1b1b');
                }
            });

            // Step 9: Transform rgb() syntax
            root.walkDecls((decl) => {
                const parsed = valueParser(decl.value);
                parsed.walk(transformRgbNode);
                decl.value = valueParser.stringify(parsed);
            });

            // Step 10: Fix specific box-shadow values
            root.walkDecls('box-shadow', (decl) => {
                if (decl.value.includes('rgb(var(--tw-prose-kbd-shadows) / 10%)')) {
                    decl.value = decl.value
                        .replace('0 0 0 1px rgb(var(--tw-prose-kbd-shadows) / 10%)', '0 0 0 1px rgba(17, 24, 39, 0.1)')
                        .replace('0 3px 0 rgb(var(--tw-prose-kbd-shadows) / 10%)', '0 3px 0 rgba(17, 24, 39, 0.1)');
                }
            });

            // Step 11: Fix font-weight: bolder
            root.walkDecls('font-weight', (decl) => {
                if (decl.value === 'bolder') {
                    decl.value = '800';
                }
            });

            // Step 12: Remove specific comments
            root.walkComments((comment) => {
                const commentsToRemove = [
                    'tailwindcss v3',
                    'MIT License',
                    'Prevent padding and border',
                    'Remove the margin in all browsers',
                    'Add the correct height in Firefox',
                    'Add the correct text decoration',
                    'Remove the default font size',
                    'Reset links to optimize',
                    'Add the correct font weight',
                    "Use the user's configured",
                    'Add the correct font size',
                    'Prevent `sub` and `sup`',
                    'Remove text indentation',
                    'Change the font styles',
                    'Remove the inheritance',
                    'Correct the inability',
                    'Use the modern Firefox',
                    'Remove the additional',
                    'Add the correct vertical',
                    'Correct the cursor style',
                    'Correct the odd appearance',
                    'Remove the inner padding',
                    'Correct the inability to style',
                    'Add the correct display',
                    'Removes the default spacing',
                    'Reset default styling',
                    'Prevent resizing textareas',
                    'Reset the default placeholder',
                    'Set the default cursor',
                    'Make sure disabled buttons',
                    'Make replaced elements',
                    'Constrain images and videos',
                    'Make elements with the HTML',
                ];

                const shouldRemove = commentsToRemove.some((str) => comment.text.includes(str));
                if (shouldRemove || /^\s*\d+\s*$/.test(comment.text)) {
                    comment.remove();
                }
            });

            // Step 13: Fix SCSS function formatting
            root.walkAtRules('function', (atRule) => {
                if (
                    atRule.params === 'rgb($r, $g: null, $b: null)' ||
                    atRule.params === 'rgba($r, $g: null, $b: null, $a: null)'
                ) {
                    // This would need more complex parsing to fix SCSS formatting
                    // For now, we'll leave it as is since it's SCSS-specific
                }
            });

            // Step 14: Add appearance: auto for buttons
            root.walkRules((rule) => {
                if (rule.selector.includes('button') || rule.selector.includes('input:where([type=')) {
                    const hasWebkitAppearance = rule.some((decl) => decl.prop === '-webkit-appearance');
                    if (hasWebkitAppearance && !rule.some((decl) => decl.prop === 'appearance')) {
                        rule.append({ prop: 'appearance', value: 'auto' });
                    }
                }
            });

            // Step 15: Add appearance for search inputs
            root.walkRules((rule) => {
                if (rule.selector.includes("[type='search']")) {
                    const hasWebkitAppearance = rule.some(
                        (decl) => decl.prop === '-webkit-appearance' && decl.value === 'textfield',
                    );
                    if (hasWebkitAppearance && !rule.some((decl) => decl.prop === 'appearance')) {
                        rule.append({ prop: 'appearance', value: 'textfield' });
                    }
                }
            });

            // Step 16: Add line-clamp for webkit-line-clamp
            // root.walkRules((rule) => {
            //     if (rule.selector.includes('.line-clamp-')) {
            //         const hasWebkitLineClamp = rule.some((decl) => decl.prop === '-webkit-line-clamp');
            //         if (hasWebkitLineClamp) {
            //             rule.walkDecls('-webkit-line-clamp', (decl) => {
            //                 if (!rule.some((d) => d.prop === 'line-clamp')) {
            //                     rule.insertAfter(decl, { prop: 'line-clamp', value: decl.value });
            //                 }
            //             });
            //         }
            //     }
            // });

            // Step 17: Fix hex colors with alpha
            root.walkDecls((decl) => {
                // Fix #0000 to rgba(0, 0, 0, 0)
                decl.value = decl.value.replace(/#0000(?![\da-f])/gi, 'rgba(0, 0, 0, 0)');

                // Fix #fff to #ffffff
                decl.value = decl.value.replace(/#fff(?![\da-f])/gi, '#ffffff');

                // Fix #000000e6 to rgba(0, 0, 0, 0.9)
                decl.value = decl.value.replace(/#000000e6/gi, 'rgba(0, 0, 0, 0.9)');

                // Fix #ffffff8a to rgba(255, 255, 255, 0.54)
                decl.value = decl.value.replace(/#ffffff8a/gi, 'rgba(255, 255, 255, 0.54)');
            });

            // Step 19: Add !important to specific opacity rule
            root.walkRules('.focus\\:placeholder\\:opacity-100:focus::placeholder', (rule) => {
                rule.walkDecls('opacity', (decl) => {
                    if (decl.value === '1') {
                        decl.value = '1 !important';
                    }
                });
            });

            // Step 20: Remove duplicate custom properties
            root.walkRules((rule) => {
                const seenProps = new Set();
                const toRemove = [];

                rule.walkDecls((decl) => {
                    if (decl.prop.startsWith('--tw-gradient-')) {
                        if (seenProps.has(decl.prop)) {
                            toRemove.push(decl);
                        } else {
                            seenProps.add(decl.prop);
                        }
                    }
                });

                toRemove.forEach((decl) => decl.remove());
            });

            // Step 21: Remove .dark selectors
            root.walkRules((rule) => {
                if (rule.selector.startsWith('.dark ')) {
                    rule.remove();
                }
            });

            // Step 22: Remove border-style and border-color from universal selector
            root.walkRules((rule) => {
                if (rule.selector === '*,\n::before,\n::after' || rule.selector === '*, ::before, ::after') {
                    rule.walkDecls((decl) => {
                        if (decl.prop === 'border-style' || decl.prop === 'border-color') {
                            decl.remove();
                        }
                    });
                }
            });

            // Step 23: Remove duplicate selectors (basic implementation)
            // const seenSelectors = new Map();
            // root.walkRules((rule) => {
            //     if (seenSelectors.has(rule.selector)) {
            //         // Merge declarations into the first occurrence
            //         const firstRule = seenSelectors.get(rule.selector);
            //         rule.walkDecls((decl) => {
            //             firstRule.append(decl.clone());
            //         });
            //         rule.remove();
            //     } else {
            //         seenSelectors.set(rule.selector, rule);
            //     }
            // });
        },
        postcssPlugin: 'postcss-stencil-tailwind-fix',
    };
};

module.exports.postcss = true;
