const fs = require('fs');
const { execSync } = require('child_process');

// ... (existing functions)

// Function to get the last version from the changelog
function getLastVersionFromChangelog() {
    const changelogContent = fs.readFileSync('CHANGELOG.md', 'utf-8');
    const versionRegex = /## VERSIONING: version (\d+\.\d+\.\d+)/g;
    const versions = [...changelogContent.matchAll(versionRegex)];
    return versions.length > 0 ? versions[versions.length - 1][1] : '0.0.0';
}

// Function to add new commit hashes to the changelog
function updateChangelogWithNewCommits(changelog, newCommits) {
    const lastVersion = getLastVersionFromChangelog();
    let changelogContent = fs.readFileSync('CHANGELOG.md', 'utf-8');
    changelogContent += `\n\n## VERSIONING: version ${getLatestVersion()} (${getCurrentDate()})\n\n`;

    for (const change in changelog) {
        if (changelog[change].length > 0) {
            changelogContent += "### " + change + ':\n' + formatChangelogEntries(changelog[change]);
        }
    }

    // Add new commits to the changelog under the latest version
    changelogContent += formatChangelogEntries(newCommits);
    fs.writeFileSync('CHANGELOG.md', changelogContent, 'utf-8');
}

// Function to create CURRENT_RELEASE.md with only the latest version changes
function createCurrentReleaseFile(latestVersion, latestCommits) {
    const currentReleaseContent = `## VERSIONING: version ${latestVersion} (${getCurrentDate()})\n\n`;
    const currentReleaseContentWithCommits = formatChangelogEntries(latestCommits);

    fs.writeFileSync('CURRENT_RELEASE.md', currentReleaseContent + currentReleaseContentWithCommits, 'utf-8');
}

// Main function
function main() {
    const commits = readCommitHistory();
    const weightCounts = calculateCommitWeights(commits);
    const currentVersion = getLatestVersion();
    const newVersion = determineVersionUpgrade(weightCounts, currentVersion);
    const changelog = generateChangelog(commits);

    console.log(`Current Version: ${currentVersion}`);
    console.log(`New Version: ${newVersion}`);

    writePackageVersion(newVersion);
    const newCommits = changelog[newVersion] || []; // Get new commits for the latest version
    updateChangelogWithNewCommits(changelog, newCommits);
    createCurrentReleaseFile(newVersion, newCommits);
}

main();
