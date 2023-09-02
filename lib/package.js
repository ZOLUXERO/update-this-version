const fs = require('fs');

// Function to write the updated version to package.json
function writePackageVersion(newVersion) {
    if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        packageJson.version = newVersion;
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf-8');
    }
}

function getTagLatestVersion() {
    // TODO: validate if user wants to use package.json as source for versioning
    if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        return `${packageJson.version}`;
    }
}