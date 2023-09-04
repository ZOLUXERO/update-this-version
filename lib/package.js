const fs = require('fs');
const defaultValues = require('../default')

// Function to write the updated version to package.json
function writePackageVersion(newVersion) {
    if (!fs.existsSync(defaultValues.packageFile)) return;
    const packageJson = JSON.parse(fs.readFileSync(defaultValues.packageFile, 'utf-8'));
    packageJson.version = newVersion;
    fs.writeFileSync(defaultValues.packageFile, JSON.stringify(packageJson, null, 2), 'utf-8');
}

function getPackageLatestVersion() {
    // TODO: validate if user wants to use package.json as source for versioning
    if (!fs.existsSync(defaultValues.packageFile)) return;
    const packageJson = JSON.parse(fs.readFileSync(defaultValues.packageFile, 'utf-8'));
    return `${packageJson.version}`;
}

module.exports = { writePackageVersion, getPackageLatestVersion }