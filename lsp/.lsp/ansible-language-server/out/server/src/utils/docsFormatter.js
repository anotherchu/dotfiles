"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetails = exports.formatDescription = exports.formatOption = exports.formatTombstone = exports.formatModule = void 0;
const util_1 = require("util");
const vscode_languageserver_1 = require("vscode-languageserver");
function formatModule(module, route) {
    const sections = [];
    if (module.deprecated || (route === null || route === void 0 ? void 0 : route.deprecation)) {
        sections.push('**DEPRECATED**');
        if (route === null || route === void 0 ? void 0 : route.deprecation) {
            if (route.deprecation.warningText) {
                sections.push(`${route.deprecation.warningText}`);
            }
            sections.push(`Removal date: ${route.deprecation.removalDate}, removal version: ${route.deprecation.removalVersion}`);
        }
    }
    if (route === null || route === void 0 ? void 0 : route.redirect) {
        sections.push(`***Redirected to: ${route.redirect}***`);
    }
    if (module.shortDescription) {
        sections.push(`*${formatDescription(module.shortDescription)}*`);
    }
    if (module.description) {
        sections.push('**Description**');
        sections.push(formatDescription(module.description));
    }
    if (module.requirements) {
        sections.push('**Requirements**');
        sections.push(formatDescription(module.requirements));
    }
    if (module.notes) {
        sections.push('**Notes**');
        sections.push(formatDescription(module.notes));
    }
    return {
        kind: vscode_languageserver_1.MarkupKind.Markdown,
        value: sections.join('\n\n'),
    };
}
exports.formatModule = formatModule;
function formatTombstone(route) {
    const sections = [];
    if (route === null || route === void 0 ? void 0 : route.tombstone) {
        sections.push('**REMOVED**');
        if (route.tombstone.warningText) {
            sections.push(`${route.tombstone.warningText}`);
        }
        sections.push(`Removal date: ${route.tombstone.removalDate}, removal version: ${route.tombstone.removalVersion}`);
    }
    if (route === null || route === void 0 ? void 0 : route.redirect) {
        sections.push(`Use *${route.redirect}* instead.`);
    }
    return {
        kind: vscode_languageserver_1.MarkupKind.Markdown,
        value: sections.join('\n\n'),
    };
}
exports.formatTombstone = formatTombstone;
function formatOption(option, with_details = false) {
    const sections = [];
    if (with_details) {
        const details = getDetails(option);
        if (details) {
            sections.push(`\`${details}\``);
        }
    }
    if (option.description) {
        sections.push(formatDescription(option.description, false));
    }
    if (option.default !== undefined) {
        sections.push(`*Default*:\n \`\`\`javascript\n${util_1.format(option.default)}\n\`\`\``);
    }
    if (option.choices) {
        const formattedChoiceArray = option.choices.map((c) => `\`${c}\``);
        sections.push(`*Choices*: [${formattedChoiceArray.toString()}]`);
    }
    if (option.aliases) {
        const aliasesWithBaseName = [option.name].concat(option.aliases);
        const formattedChoiceArray = aliasesWithBaseName.map((a) => `\`${a}\``);
        sections.push(`*Aliases*: [${formattedChoiceArray.toString()}]`);
    }
    return {
        kind: vscode_languageserver_1.MarkupKind.Markdown,
        value: sections.join('\n\n'),
    };
}
exports.formatOption = formatOption;
function formatDescription(doc, asList = true) {
    let result = '';
    if (doc instanceof Array) {
        const lines = [];
        doc.forEach((element) => {
            if (asList) {
                lines.push(`- ${replaceMacros(element)}`);
            }
            else {
                lines.push(`${replaceMacros(element)}\n`);
            }
        });
        result += lines.join('\n');
    }
    else if (typeof doc === 'string') {
        result += replaceMacros(doc);
    }
    return result;
}
exports.formatDescription = formatDescription;
function getDetails(option) {
    const details = [];
    if (option.required) {
        details.push('(required)');
    }
    if (option.type) {
        if (option.type === 'list' && option.elements) {
            details.push(`list(${option.elements})`);
        }
        else {
            details.push(option.type);
        }
    }
    if (details)
        return details.join(' ');
}
exports.getDetails = getDetails;
// TODO: do something with links
const macroPatterns = {
    link: /L\((.*?),(.*?)\)/g,
    url: /U\((.*?)\)/g,
    reference: /R\((.*?),(.*?)\)/g,
    module: /M\((.*?)\)/g,
    monospace: /C\((.*?)\)/g,
    italics: /I\((.*?)\)/g,
    bold: /B\((.*?)\)/g,
    hr: /\bHORIZONTALLINE\b/,
};
function replaceMacros(text) {
    let safeText;
    if (typeof text === 'string') {
        safeText = text;
    }
    else {
        safeText = JSON.stringify(text);
    }
    return safeText
        .replace(macroPatterns.link, '[$1]($2)')
        .replace(macroPatterns.url, '$1')
        .replace(macroPatterns.reference, '[$1]($2)')
        .replace(macroPatterns.module, '*`$1`*')
        .replace(macroPatterns.monospace, '`$1`')
        .replace(macroPatterns.italics, '_$1_')
        .replace(macroPatterns.bold, '**$1**')
        .replace(macroPatterns.hr, '<hr>');
}
//# sourceMappingURL=docsFormatter.js.map