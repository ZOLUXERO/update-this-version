const default_values = {
    releasesFile: 'CHANGELOG.md',
    currentReleaseFile: 'CURRENT_RELEASE.md',
    encoding: 'utf-8',
    versionTitle: 'VERSIONING: version',
    conventionalCommits: {
        'BREAKING CHANGE': [],
        'feat': [],
        'fix': [],
        'test': [],
        'feature': [],
    },
    packageFile: 'package.json'
}

module.exports = default_values