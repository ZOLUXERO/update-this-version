const { generateChangelog, writeChangelog, writeCurrentRelease, generateContent } = require("./lib/changelog");
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
        const writeLatest = writeCurrentRelease(content);
        if (write && writeLatest) {
            createTag(newVersion);
        }
        console.log(write)
    }
}

async function test() {
    const ver = getLatestReleaseVersion();
    const currentVersion = getTagLatestVersion();
    const commits = readCommitHistory(ver);
    if (commits.length > 0 && commits[0] != "") {
        const changelog = generateChangelog(commits);
        const content = generateContent(changelog, `${currentVersion}-p`);
        const writeLatest = writeCurrentRelease(content);
        if (writeLatest) {
            createTag(`${currentVersion}-p`);
        }
        console.log("latest version release: ", ver, "current version: ", currentVersion);
    }
}

module.exports = { updateThisVersion, test }