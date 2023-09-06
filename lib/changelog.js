const fs = require('fs');
const date = require('./utils');
const defaultValues = require('../default');
const { getGitUrlOrigin } = require('./git');

function formatChangelogEntries(entries) {
    return entries.map(({ hash, scope, message, cleanedRemoteUrl }) => {
        const scopeText = scope ? `**${scope}:**` : '';
        return `- ${scopeText} ${message} ([${hash}](${cleanedRemoteUrl}/commit/${hash}))`
    }).join('\n') + '\n';
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

        if (message != undefined && type)
            defaultValues.conventionalCommits[type].push({ hash, scope: scope, message: message, cleanedRemoteUrl: getGitUrlOrigin() });
    });

    return defaultValues.conventionalCommits;
}

// Esto se puedo modificar
function writeCurrentRelease(content) {
    return writeSpecFile(defaultValues.currentReleaseFile, content)
}

module.exports = { writeChangelog, generateChangelog, writeCurrentRelease, generateContent, writeSpecFile }
