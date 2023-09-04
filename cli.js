#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

// if (argv.ships > 3 && argv.distance < 53.5) {
//   console.log('Plunder more riffiwobbles!')
// } else {
//   console.log('Retreat from the xupptumblers!')
// }

if (process.version.match(/v(\d+)\./)[1] < 6) {
  console.error('Update this version uses Node v8 or greater comamnd`update-this-version` did not run.')
} else {
  const version = require('./index')
  version.updateThisVersion();
}