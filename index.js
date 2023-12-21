const { generateChangelog, writeChangelog, writeCurrentRelease, generateContent, writeChangelogprd } = require("./lib/changelog");
const { readCommitHistory, getTagLatestVersion, createTag, getLatestReleaseVersion } = require("./lib/git");
const { writePackageVersion } = require("./lib/package");
const { calculateCommitWeights, determineVersionUpgrade } = require("./lib/weigth");

async function updateThisVersion() {
    const commits = readCommitHistory();
    console.log("commit since", commits);
    if (commits.length > 0 && commits[0] != "") {
        const weightCounts = calculateCommitWeights(commits);
        const currentVersion = getTagLatestVersion();
        const newVersion = determineVersionUpgrade(weightCounts, currentVersion);
        const changelog = generateChangelog(commits);
        console.log(`Current Version: ${currentVersion}`);
        console.log(`New Version: ${newVersion}`);

        writePackageVersion(newVersion);
        const content = generateContent(changelog, newVersion)
        const write = writeChangelog(content);
        if (write) {
            createTag(newVersion);
        }
        console.log(write)
    }
}

async function test() {
    console.log("==============================================================");
    const ver = getLatestReleaseVersion();
    const currentVersion = getTagLatestVersion();
    const commits = readCommitHistory(ver);
    if (commits.length > 0 && commits[0] != "") {
        const changelogsito = generateChangelog(commits);
        const content = generateContent(changelogsito, `${currentVersion}-p`);
        const writeLatest = writeCurrentRelease(content);
        writeChangelogprd(`${currentVersion}-p`);
        if (writeLatest) {
            createTag(`${currentVersion}-p`);
        }
        console.log("Release changelog created from version: ", ver, "current version: ", currentVersion);
    }
}

module.exports = { updateThisVersion, test }