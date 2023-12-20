#!/usr/bin/env node

const yargs = require('yargs')

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
    description: 'Generate the first-release of your project',
    type: 'boolean', 
  })
  .argv;

if (argv.firstRelease) {
  console.log('You used the --first-release option!');
}

if (argv.release) {
  console.log('RELEASE!');
  const version = require('./index')
  version.test();
}

if (argv.versionType == "major") {
  console.log('You used the major patch type');
}

if (process.version.match(/v(\d+)\./)[1] < 6) {
  console.error('Update this version uses Node v8 or greater comamnd`update-this-version` did not run.')
} else {
  // const version = require('./index')
  // version.updateThisVersion();
}