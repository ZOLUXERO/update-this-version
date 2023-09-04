const weight = require('../lib/weigth')

test('determine version when only feat Has Commits', () => {
    expect(weight.determineVersionUpgrade({ 'BREAKING CHANGE': 0, 'feat': 3, 'fix': 0 }, '0.0.0')).toBe('0.1.0');
});

test('determine version when only breaking change has commits', () => {
    expect(weight.determineVersionUpgrade({ 'BREAKING CHANGE': 1, 'feat': 3, 'fix': 0 }, '0.0.0')).toBe('1.0.0');
});

test('determine Version When breaking change, feat and fix has Commits', () => {
    expect(weight.determineVersionUpgrade({ 'BREAKING CHANGE': 1, 'feat': 3, 'fix': 2 }, '0.0.0')).toBe('1.0.0');
});

test('Determine version when feat and fix has commits', () => {
    expect(weight.determineVersionUpgrade({ 'BREAKING CHANGE': 0, 'feat': 3, 'fix': 4 }, '0.0.0')).toBe('0.1.0');
});

test('Determine version when only fix has commits', () => {
    expect(weight.determineVersionUpgrade({ 'BREAKING CHANGE': 0, 'feat': 0, 'fix': 1 }, '0.0.0')).toBe('0.0.1');
});

test('Determine version when theres no fix, feat or bc', () => {
    expect(weight.determineVersionUpgrade({ 'BREAKING CHANGE': 0, 'feat': 0, 'fix': 0 }, '0.0.0')).toBe('0.0.1');
});

test('Calculate weigth of commits', () => {
    expect(weight.calculateCommitWeights([
        'b35717a fix(modules): for node js',
        '2fce527 feat(functions): move functions to respective js file and to lib folder',
        '91a2511 fix(remove): unused files',
        'bcc665f feat(message): add git origin to message of commit',
        '5eb400d BREAKING CHANGE: logic, source is now git tags',
        '5ff19af fix(logic): whitout package.json'
    ])).toStrictEqual({ 'BREAKING CHANGE': 1, 'feat': 2, 'fix': 3 })
})