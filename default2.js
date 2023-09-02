const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const tags = execSync('git tag', { encoding: 'utf-8' }).trim().split('\n');
console.log('Git tags:', tags);


// Function to read and parse the commit history
function readCommitHistory() {
    let commitHistory = ""
    if (tags.length > 0 && tags[0] != '') {
        const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
        // Get the commits since the latest tag
        commitHistory = execSync(`git log ${latestTag}..main --oneline`, { encoding: 'utf-8' });
        // const commitHistory = execSync(`git log ${latestTag}..main --oneline`, { encoding: 'utf-8' }).trim().split('\n');
        console.log('Commits since latest tag:', commitHistory);
    } else {
        commitHistory = execSync('git log --oneline', { encoding: 'utf-8' });
    }
    return commitHistory.trim().split('\n');
}

function generateChangelog(commits) {
    const changelog = {
        "BREAKING CHANGE": [],
        feat: [],
        fix: [],
        test: [],
    };

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

        console.log(commit)
        console.log("============")
        console.log(hash, "|", typeAndScope, "|", message, "|", type, "|", scope)
        console.log("============")

        if (message != undefined) {
            console.log("inside: ", message, type, hash)
            if (type) {
                changelog[type].push({ hash, scope: scope, message: message });
            }
        }

    });

    return changelog;
}
// Helper function to format changelog entries
function formatChangelogEntries(entries) {
    return entries.map(({ hash, scope, message }) => `- **${scope}** ${message} ([${hash}](http://test.com))`).join('\n') + '\n';
}

// Helper function to get the latest version
function getLatestVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    return packageJson.version;
}

// Function to calculate the weight of each commit type
function calculateCommitWeights(commits) {
    const weightCounts = {
        'BREAKING CHANGE': 0,
        'feat': 0,
        'fix': 0,
    };

    commits.forEach((commit) => {
        for (const type in weightCounts) {
            if (commit.includes(type)) {
                weightCounts[type]++;
                break; // Move to the next commit once the type is found
            }
        }
    });

    return weightCounts;
}

// Function to determine the version upgrade based on weights
function determineVersionUpgrade(weightCounts, currentVersion) {
    const weightOrder = ['BREAKING CHANGE', 'feat', 'fix'];
    console.log(weightCounts)

    if (weightCounts["BREAKING CHANGE"] > 0) {
        // If there are BREAKING CHANGE commits, increment major version
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        return `${major + 1}.${minor}.${patch}`;
    } else if (weightCounts["feat"] > 0) {
        // If there are feat commits, increment minor version
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        return `${major}.${minor + 1}.${patch}`;
    } else if (weightCounts["fix"] > 0) {
        // If there are only fix commits, increment patch version
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        return `${major}.${minor}.${patch + 1}`;
    } else {
        // Default to incrementing the patch version if no specific commits found
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        return `${major}.${minor}.${patch + 1}`;
    }
}

// Function to write the updated version to package.json
function writePackageVersion(newVersion) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    packageJson.version = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf-8');
}

function getLatestVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    return packageJson.version;
}

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 as months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to write changelog to a file
function writeChangelog(changelog) {
    const currentDate = getCurrentDate();
    let changelogContent = `## VERSIONING: version ${getLatestVersion()} (${currentDate})\n\n`;
    for (const change in changelog)
        if (changelog[change].length > 0) {
            changelogContent += "### " + change + ':\n' + formatChangelogEntries(changelog[change]);
        }
    try {
        // Attempt to append to the changelog file
        // Check if the changelog file exists
        if (fs.existsSync('CHANGELOG.md')) {
            // Read the existing content of the changelog file
            const existingContent = fs.readFileSync('CHANGELOG.md', 'utf-8');
    
            // Combine the new content with the existing content
            const newChangelogContent = changelogContent + '\n\n' + existingContent;
    
            // Write the updated content back to the changelog file
            fs.writeFileSync('CHANGELOG.md', newChangelogContent, 'utf-8');
        } else {
            // If the file doesn't exist, create it and write the new content
            fs.appendFileSync('CHANGELOG.md', changelogContent, 'utf-8');
        }

        return true; // Return true if successful
    } catch (error) {
        console.error('Error appending to changelog:', error);
        return false; // Return false if an error occurred
    }
}


function createCurrentReleaseFile(latestVersion, latestCommits) {
    const currentReleaseContent = `## VERSIONING: version ${latestVersion} (${getCurrentDate()})\n\n`;
    const currentReleaseContentWithCommits = formatChangelogEntries(latestCommits);

    fs.writeFileSync('CURRENT_RELEASE.md', currentReleaseContent + currentReleaseContentWithCommits, 'utf-8');
}

function createTag(newVersion) {
    let commitHistory = ""

    commitHistory = execSync(`git tag v${newVersion}`, { encoding: 'utf-8' });
    // const commitHistory = execSync(`git log ${latestTag}..main --oneline`, { encoding: 'utf-8' }).trim().split('\n');
    console.log('Commits create latest tag:', commitHistory);

}

// Main function
function main() {
    const commits = readCommitHistory();
    console.log("commit since", commits);
    if (commits.length > 0 && commits[0] != "") {

        const weightCounts = calculateCommitWeights(commits);
        const currentVersion = getLatestVersion();
        const newVersion = determineVersionUpgrade(weightCounts, currentVersion);
        const changelog = generateChangelog(commits);
        console.log(`Current Version: ${currentVersion}`);
        console.log(`New Version: ${newVersion}`);

        writePackageVersion(newVersion)
        write = writeChangelog(changelog);
        if (write) {
            createTag(newVersion);
        }
        console.log(write)
    }

}

main();
