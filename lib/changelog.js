const fs = require('fs');
const date = require('./utils');
const defaultValues = require('../default');
const { getGitUrlOrigin } = require('./git');

function formatChangelogEntries(entries) {
    const groupedCommits = {
        'no group': []
    };
    entries.map(({ hash, scope, message, cleanedRemoteUrl, hu }) => {
        const groupKey = hu || 'no group';
        const scopeText = scope ? `**${scope}:**` : '';
        if (!groupedCommits[groupKey]) {
            groupedCommits[groupKey] = [];
        }
        groupedCommits[groupKey].push(`- ${scopeText} ${message} ([${hash}](${cleanedRemoteUrl}/commit/${hash}))`);
    });
    let formattedEntries = '';
    for (const groupKey in groupedCommits) {
        if (groupKey == 'no group') {
            formattedEntries += `${groupedCommits[groupKey].join('\n')}\n`;
        } else {
            formattedEntries += `#### Historia de usuario [#${groupKey}]()\n>${groupedCommits[groupKey].join('\n')}\n`;
        }
    }
    return formattedEntries;
}

function writeSpecFile(file, content) {
    try {
        fs.writeFileSync(file, content, 'utf-8');
        return true;
    } catch (error) {
        console.error('Error appending to file:', error);
        return false;
    }
}

function generateContent(changelog, version) {
    let content = `## ${defaultValues.versionTitle} ${version} (${date.getCurrentDate()})\n\n`;
    for (const change in changelog) {
        if (changelog[change].length > 0) {
            content += "### " + change + ':\n' + formatChangelogEntries(changelog[change]);
        }
    }
    return content;
}

function writeChangelog(content) {
    changelogContent = content;
    if (fs.existsSync(defaultValues.releasesFile)) {
        const existingContent = fs.readFileSync(defaultValues.releasesFile, 'utf-8');
        changelogContent = content + '\n\n' + existingContent;
    }
    return writeSpecFile(defaultValues.releasesFile, changelogContent)
}

function generateChangelog(commits) {
    const commitTypes = Object.keys(defaultValues.conventionalCommits);
    // 'FIRST RELEASE!': [], // esto no va aca
    const typeRegex = new RegExp(`(?<=\\w) (${commitTypes.map(type => `${type}|${type}\\(.*\\)`).join('|')}):`);
    commits.forEach((commit) => {
        const [hash, typeAndScope, message] = commit.split(typeRegex);
        let type = typeAndScope, scope = "";
        if (typeAndScope && typeAndScope.includes('(') && typeAndScope.includes(')'))
            [type, scope] = typeAndScope.split(/\(|\)/);

        if (message != undefined && type) {
            let match = message.match(/#(\d+): (.+)/);
            let hu = '', newMessage = message;
            if (match) {
                hu = match[1];
                newMessage = match[2];
            }
            defaultValues.conventionalCommits[type].push({ hash, scope: scope, message: newMessage, cleanedRemoteUrl: getGitUrlOrigin(), hu: hu });
        }
    });
    console.log(defaultValues.conventionalCommits);
    return defaultValues.conventionalCommits;
}

// Esto se puedo modificar
function writeCurrentRelease(content) {
    return writeSpecFile(defaultValues.currentReleaseFile, content)
}

module.exports = { writeChangelog, generateChangelog, writeCurrentRelease, generateContent, writeSpecFile }
