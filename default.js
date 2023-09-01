const fs = require('fs');
const { execSync } = require('child_process');

// Function to read and parse the commit history
function readCommitHistory() {
  const commitHistory = execSync('git log --oneline', { encoding: 'utf-8' });
  return commitHistory.trim().split('\n');
}

// Function to generate the changelog content
function generateChangelog(commits) {
  const changelog = {
    BREAKING: [],
    feat: [],
    fix: [],
  };

  commits.forEach((commit) => {
    const [hash, message] = commit.split(': ');
    const [type, version] = message.match(/(BREAKING CHANGE|feat|fix): (\d+\.\d+\.\d+)/) || [];

    if (type && version) {
      changelog[type].push({ hash, version });
    }
  });

  return changelog;
}

// Function to write changelog to a file
function writeChangelog(changelog) {
  const changelogContent = `VERSIONING: version ${getLatestVersion()}\n` +
    'BREAKING CHANGE:\n' + formatChangelogEntries(changelog.BREAKING) +
    'feat:\n' + formatChangelogEntries(changelog.feat) +
    'fix:\n' + formatChangelogEntries(changelog.fix);

  fs.writeFileSync('CHANGELOG.md', changelogContent, 'utf-8');
}

// Helper function to format changelog entries
function formatChangelogEntries(entries) {
  return entries.map(({ hash, version }) => `(${hash}): ${version}`).join('\n') + '\n';
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