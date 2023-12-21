const default_values = {
    releasesFile: 'CHANGELOG.md',
    currentReleaseFile: 'CURRENT_RELEASE.md',
    encoding: 'utf-8',
    versionTitle: 'VERSION: ',
    conventionalCommits: {
        'BREAKING CHANGE': [],
        'feat': [],
        'fix': [],
        'test': [],
        'chore': [],
        'build': [],
        'docs': [],
        'style': [],
        'refactor': [],
        'perf': []
    },
    packageFile: 'package.json'
}

module.exports = default_values