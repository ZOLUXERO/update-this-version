const { execSync } = require('child_process');
const tags = execSync('git tag', { encoding: 'utf-8' }).trim().split('\n');

function getGitUrlOrigin() {
    let remoteUrl = ""
    try {
        remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
    } catch (error) {
        console.error('Error:', error.message);
    }
    return remoteUrl.replace(/\.git$/, '');
}

function readCommitHistory(sinceTag = "") {
    let commitHistory = "";
    // El comando que trae los tags si no encuentra ningun tag retorna un array vacio como: ['']
    // validar cuando hay casos legitimos que traen ['', 'v0.0.1'] como primer tag
    if (sinceTag != "") return  execSync(`git log ${sinceTag}..main --oneline`, { encoding: 'utf-8' }).trim().split('\n');

    if (tags.length > 0 && tags[0] != '') {
        const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
        // Get the commits since the latest tag
        commitHistory = execSync(`git log ${latestTag}..main --oneline`, { encoding: 'utf-8' });
        console.log('Commits since latest tag:', commitHistory);
    } else {
        commitHistory = execSync('git log --oneline', { encoding: 'utf-8' });
    }
    return commitHistory.trim().split('\n');
}

function createTag(version) {
    let gitTag = "";
    gitTag = execSync(`git tag v${version}`, { encoding: 'utf-8' });
    return gitTag;
}

function getTagLatestVersion() {
    // TODO: validate if user wants to use package.json as source for versioning
    // if (fs.existsSync('package.json')) {
    //     const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    //     return `${packageJson.version}`;
    // }
    let version = "0.0.0";
    if (tags.length > 0 && tags[0] != '') {
        version = execSync('git describe --tags --abbrev=0 --exclude="*p"', { encoding: 'utf-8' }).trim();
    }
    return version.replace('v', '')
}

function getLatestReleaseVersion() {
    let latestReleaseVersion = "0.0.0";
    if (tags.length <= 0 && tags[0] == '') return latestReleaseVersion;
    try {
        latestReleaseVersion = execSync('git describe --tags --abbrev=0 --match="*p" $(git rev-list --tags --skip=0 --max-count=1)', {encoding: 'utf-8'}).trim();
    } catch (error) {
        latestReleaseVersion = execSync('git for-each-ref --sort=creatordate --count=1 refs/tags --format "%(refname:lstrip=2)"', { encoding: 'utf-8' }).trim();
        // console.log("Error: (there's no git tag that matches '*p') ", error);
    }
    return latestReleaseVersion;
}

module.exports = {getGitUrlOrigin, readCommitHistory, createTag, getTagLatestVersion, getLatestReleaseVersion}