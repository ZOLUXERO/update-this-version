const fs = require('fs');
const { execSync } = require('child_process');

// Function to read and parse the commit history
function readCommitHistory() {
    const commitHistory = execSync('git log --oneline', { encoding: 'utf-8' });
    return commitHistory.trim().split('\n');
}

function generateChangelog(commits) {
    const changelog = {
        "BREAKING CHANGE": [],
        feat: [],
        fix: [],
    };

    commits.forEach((commit) => {
        const [hash, message] = commit.split(' BREAKING CHANGE: ');
        console.log(commit)
        // Determine the type based on the presence of "BREAKING CHANGE"
        const type = commit.includes('BREAKING CHANGE') ? 'BREAKING CHANGE' : message;
        console.log("============")
        // console.log(type)
        console.log(hash, "|", type, "|", message)
        console.log("============")
        // Extract the version from the message

        if (message != undefined) {
            console.log("inside: ", message, type, hash)
            if (type) {
                changelog[type].push({ hash, version: type, message: message });
            }
        }

    });

    return changelog;
}
// Helper function to format changelog entries
function formatChangelogEntries(entries) {
    return entries.map(({ hash, message }) => `(${hash}): ${message}`).join('\n') + '\n';
}

// Helper function to get the latest version
function getLatestVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    return packageJson.version;
}

// Function to calculate the weight of each commit type
function calculateCommitWeights(commits) {
    const weights = {
        'BREAKING CHANGE': 2,
        feat: 1,
        fix: 0,
    };

    const weightCounts = {
        'BREAKING CHANGE': 0,
        feat: 0,
        fix: 0,
    };

    commits.forEach((commit) => {
        for (const type in weights) {
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
    let maxWeightType = 'fix';

    for (const type of weightOrder) {
        if (weightCounts[type] > weightCounts[maxWeightType]) {
            maxWeightType = type;
        }
    }

    if (maxWeightType === 'BREAKING CHANGE') {
        // If there are BREAKING CHANGE commits, increment major version
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        return `${major + 1}.0.0`;
    } else if (maxWeightType === 'feat') {
        // If there are feat commits, increment minor version
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        return `${major}.${minor + 1}.0`;
    } else {
        // If there are only fix commits, increment patch version
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

// Main function
function main() {
    const commits = readCommitHistory();
    const weightCounts = calculateCommitWeights(commits);
    const currentVersion = getLatestVersion();
    const newVersion = determineVersionUpgrade(weightCounts, currentVersion);
    const changelog = generateChangelog(commits);

    console.log(`Current Version: ${currentVersion}`);
    console.log(`New Version: ${newVersion}`);

    writePackageVersion(newVersion)
    writeChangelog(changelog);;
}

main();
