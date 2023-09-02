const fs = require('fs');
const date = require('./utils');
const changelog = {
    "BREAKING CHANGE": [],
    feat: [],
    fix: [],
    test: [],
};

// Helper function to format changelog entries
function formatChangelogEntries(entries) {
    return entries.map(({ hash, scope, message, cleanedRemoteUrl }) => `- **${scope}** ${message} ([${hash}](${cleanedRemoteUrl}/commit/${hash}))`).join('\n') + '\n';
}

function writeChangelog(changelog, version) {
    const currentDate = date.getCurrentDate();
    let changelogContent = `## VERSIONING: version ${version} (${currentDate})\n\n`;
    for (const change in changelog)
        if (changelog[change].length > 0) {
            changelogContent += "### " + change + ':\n' + formatChangelogEntries(changelog[change]);
        }
    try {
        if (fs.existsSync('CHANGELOG.md')) {
            const existingContent = fs.readFileSync('CHANGELOG.md', 'utf-8');
            const newChangelogContent = changelogContent + '\n\n' + existingContent;
            fs.writeFileSync('CHANGELOG.md', newChangelogContent, 'utf-8');
        } else {
            // If the file doesn't exist, create it and write the new content
            fs.appendFileSync('CHANGELOG.md', changelogContent, 'utf-8');
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
        if (typeAndScope) {
            if (typeAndScope.includes('(') && typeAndScope.includes(')')) {
                [type, scope] = typeAndScope.split(/\(|\)/);
            } else {
                type = typeAndScope;
                scope = "";
            }
        }

        if (message != undefined) {
            if (type) {
                changelog[type].push({ hash, scope: scope, message: message, cleanedRemoteUrl: getGitUrlOrigin() });
            }
        }
    });

    return changelog;
}

function createCurrentReleaseFile(latestVersion, latestCommits) {
    const currentReleaseContent = `## VERSIONING: version ${latestVersion} (${getCurrentDate()})\n\n`;
    const currentReleaseContentWithCommits = formatChangelogEntries(latestCommits);

    fs.writeFileSync('CURRENT_RELEASE.md', currentReleaseContent + currentReleaseContentWithCommits, 'utf-8');
}
