const convetionalChangelog = require('conventional-changelog')

convetionalChangelog({
    preset: 'conventionalcommits'
}).pipe(process.stdout)