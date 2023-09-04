const { generateChangelog, writeChangelog, createCurrentReleaseFile } = require("./lib/changelog");
const { readCommitHistory, getTagLatestVersion, createTag } = require("./lib/git");
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

        writePackageVersion(newVersion)
        const write = writeChangelog(changelog, newVersion);
        const writeLatest = createCurrentReleaseFile(changelog, newVersion);
        if (write) {
            createTag(newVersion);
        }
        console.log(write)
    }
}

module.exports = { updateThisVersion }