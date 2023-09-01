const fs = require('fs');
const { execSync } = require('child_process');
const { version } = require('os');

// Function to read and parse the commit history
function readCommitHistory() {
  const commitHistory = execSync('git log --oneline', { encoding: 'utf-8' });
  return commitHistory.trim().split('\n');
}

// Function to generate the changelog content
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

// Function to write changelog to a file
function writeChangelog(changelog) {
  let changelogContent = `# VERSIONING: version ${getLatestVersion()}\n\n`;
  for (const change in changelog)
    if (changelog[change].length > 0) {
        changelogContent += change + ':\n' + formatChangelogEntries(changelog[change]);
    }
  fs.writeFileSync('CHANGELOG.md', changelogContent, 'utf-8');
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

// Main function
function main() {
  const commits = readCommitHistory();
  const changelog = generateChangelog(commits);
  writeChangelog(changelog);
}

main();