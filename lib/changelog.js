const fs = require('fs');
const date = require('./utils');
const defaultValues = require('../default');
const { getGitUrlOrigin } = require('./git');

function formatChangelogEntries(entries) {
    return entries.map(({ hash, scope, message, cleanedRemoteUrl }) => `- **${scope}** ${message} ([${hash}](${cleanedRemoteUrl}/commit/${hash}))`).join('\n') + '\n';
}

function writeChangelog(changelog, version) {
    const currentDate = date.getCurrentDate();
    let changelogContent = `## ${defaultValues.versionTitle} ${version} (${currentDate})\n\n`;
    for (const change in changelog) {
        if (changelog[change].length > 0) {
            changelogContent += "### " + change + ':\n' + formatChangelogEntries(changelog[change]);
        }
    }

    try {
        if (fs.existsSync(defaultValues.releasesFile)) {
            const existingContent = fs.readFileSync(defaultValues.releasesFile, 'utf-8');
            const newChangelogContent = changelogContent + '\n\n' + existingContent;
            fs.writeFileSync(defaultValues.releasesFile, newChangelogContent, 'utf-8');
        } else {
            // If the file doesn't exist, create it and write the new content
            fs.appendFileSync(defaultValues.releasesFile, changelogContent, 'utf-8');
        }
        return true;
    } catch (error) {
        console.error('Error appending to changelog:', error);
        return false;
    }
}

function generateChangelog(commits) {
    commits.forEach((commit) => {
        const [hash, typeAndScope, message] = commit.split(/(?<=\w) (BREAKING CHANGE|feat|fix|test|fix\(.*\)|feat\(.*\)|test\(.*\)|feature):/);
        let type, scope;
        if (typeAndScope && typeAndScope.includes('(') && typeAndScope.includes(')')) {
            [type, scope] = typeAndScope.split(/\(|\)/);
        } else {
            type = typeAndScope;
            scope = "";
        }

        if (message != undefined && type)
            defaultValues.conventionalCommits[type].push({ hash, scope: scope, message: message, cleanedRemoteUrl: getGitUrlOrigin() });
    });

    return defaultValues.conventionalCommits;
}

/** Esta funcion y writeChangelog hacen lo mismo ambas funciones se pueden juntar en una sola y dividir
 * el resto de funcionalidades repetidas que hay como el formateo del changelo, pero me da pereza ahorita **/
function createCurrentReleaseFile(changelog, latestVersion) {
    let currentReleaseContent = `## ${defaultValues.versionTitle} ${latestVersion} (${date.getCurrentDate()})\n\n`;
    for (const change in changelog) {
        if (changelog[change].length > 0) {
            currentReleaseContent += "### " + change + ':\n' + formatChangelogEntries(changelog[change]);
        }
    }
    fs.writeFileSync(defaultValues.currentReleaseFile, currentReleaseContent, 'utf-8');
}

module.exports = { writeChangelog, generateChangelog, createCurrentReleaseFile }
