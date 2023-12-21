#!/usr/bin/env node
// ## usage dev:
// ```
// update-this-version
// node ./cli.js
// node ./cli.js --release
// ```

/**
 * To publish use:
 * npm config set registry https://registry.npmjs.org/
 * npm login
 * npm publish
 */
const yargs = require('yargs');
const version = require('./index');
const message = 'chore(release): vx.x.x-p [skip ci]';

const argv = yargs
    .usage('Usage: $0 [options]')
    .option('first-release', {
        alias: 'f',
        description: 'Generate the first-release of your project',
        type: 'boolean',
    })
    .option('version-type', {
        alias: 've',
        description: 'Specify the version type manually (like npm version <major|minor|patch>)',
        requiresArg: true,
        string: true
    })
    .option('release', {
        alias: 'r',
        description: 'Generate a release of your project with a production tag',
        type: 'boolean',
    })
    .option('commit-msg', {
        alias: 'cm',
        description: 'Customize the commit message used to commit the changelog',
        requiresArg: true,
        string: true
    })
    .argv;

if (argv.firstRelease) {
    console.log('You used the --first-release option!');
}

if (argv.versionType == "major") {
    console.log('You used the major patch type');
}

if (argv.commitMsg) message = argv.commitMsg;

if (process.version.match(/v(\d+)\./)[1] < 6) {
    console.error('Update this version uses Node v8 or greater comamnd`update-this-version` did not run.')
} else {
    version.updateThisVersion(message);
}

if (argv.release) {
    console.log('RELEASE!');
    version.updateThisVersionPrd(message);
}