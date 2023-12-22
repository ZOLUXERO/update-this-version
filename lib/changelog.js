const fs = require('fs');
const date = require('./utils');
const defaultValues = require('../default');
const { getGitUrlOrigin } = require('./git');

function formatChangelogEntries(entries) {
    const groupedCommits = {
        'no group': []
    };
    let userHistoryUrl = '';
    entries.map(({ hash, scope, message, cleanedRemoteUrl, hu }) => {
        const groupKey = hu || 'no group';
        const scopeText = scope ? `**${scope}:**` : '';
        if (!groupedCommits[groupKey]) {
            groupedCommits[groupKey] = [];
        }
        if(cleanedRemoteUrl.includes("dev.azure.com")) userHistoryUrl = cleanedRemoteUrl.replace(/\/_git\/.+$/, "/");
        groupedCommits[groupKey].push(`- ${scopeText} ${message} ([${hash.slice(0, 7)}](${cleanedRemoteUrl}/commit/${hash}))`);
    });
    let formattedEntries = '';
    for (const groupKey in groupedCommits) {
        if (groupKey == 'no group') {
            formattedEntries += `${groupedCommits[groupKey].join('\n')}\n`;
        } else {
            formattedEntries += `#### Historia de usuario [#${groupKey}](${userHistoryUrl})\n>${groupedCommits[groupKey].join('\n>')}\n`;
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
    let content = `### ${defaultValues.versionTitle} ${version} (${date.getCurrentDate()})formatTitle\n\n`;
    let counter = 0;
    for (const change in changelog) {
        if (changelog[change].length > 0) {
            content += "### " + change + ':\n' + formatChangelogEntries(changelog[change]);
            counter++;
        }
    }
    console.log(counter);
    if(counter == 0) {
        content = content.replace("formatTitle", " No changes found!");
        content += "### <span style='color:#696969;'>This version was released with NO NEW changes!</span>\n";
    }
    return content.replace("formatTitle", "") + "\n---\n";
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
    let changelog = JSON.parse(JSON.stringify(defaultValues.conventionalCommits));
    const typeRegex = new RegExp(`(?<=\\w) (${commitTypes.map(type => `${type}|${type}\\(.*\\)`).join('|')}):`);
    commits.forEach((commit) => {
        commit = commit.toLowerCase();
        const [hash, typeAndScope, message] = commit.split(typeRegex);
        let type = typeAndScope, scope = "";
        if (typeAndScope && typeAndScope.includes('(') && typeAndScope.includes(')'))
            [type, scope] = typeAndScope.split(/\(|\)/);

        if (message != undefined && type) {
            if(type == 'chore' && scope == 'release') return;
            let match = message.match(/#(\d+): (.+)/);
            let hu = '', newMessage = message;
            if (match) {
                hu = match[1];
                newMessage = match[2];
            }
            changelog[type].push({ hash, scope: scope, message: newMessage, cleanedRemoteUrl: getGitUrlOrigin(), hu: hu });
        }
    });
    return changelog;
}

function writeChangelogprd(tagPrd) {
    changelogContent = "";
    if (fs.existsSync(defaultValues.releasesFile)) {
        const existingContent = fs.readFileSync(defaultValues.releasesFile, 'utf-8');
        changelogContent = `# <span style="color:#6495ED;">PRODUCTION: Release #${tagPrd}</span>\n` + existingContent;
    }
    return writeSpecFile(defaultValues.releasesFile, changelogContent)
}

// Esto se puedo modificar
function writeCurrentRelease(content) {
    return writeSpecFile(defaultValues.currentReleaseFile, content);
}

module.exports = { writeChangelog, generateChangelog, writeCurrentRelease, generateContent, writeSpecFile, writeChangelogprd }
