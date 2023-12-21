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
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    console.log(weightCounts)
    if (weightCounts["BREAKING CHANGE"] > 0)
        return `${major + 1}.0.0`;
    if (weightCounts["feat"] > 0)
        return `${major}.${minor + 1}.0`;
    if (weightCounts["fix"] > 0)
        return `${major}.${minor}.${patch + 1}`;

    return `${major}.${minor}.${patch + 1}`;
}

module.exports = { calculateCommitWeights, determineVersionUpgrade }