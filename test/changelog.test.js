const fs = require('fs');
const { writeChangelog, generateChangelog, generateContent, writeSpecFile } = require('../lib/changelog');
const date = require('../lib/utils');
const defaultValues = require('../default');

jest.mock('fs');

describe('writeChangelog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should write content to the changelog file', () => {
        fs.existsSync.mockReturnValue(true);
        let content = '## VERSIONING: version 1.0.0 (2023-09-04)'
        expect(writeChangelog(content)).toBe(true);
        expect(fs.existsSync).toHaveBeenCalledWith(defaultValues.releasesFile);
        expect(fs.readFileSync).toHaveBeenCalledWith(defaultValues.releasesFile, 'utf-8');
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            defaultValues.releasesFile,
            expect.stringContaining('## VERSIONING: version 1.0.0 (2023-09-04)'),
            'utf-8'
        );
    }); 
});

describe('getCurrentDate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return the current date in the "YYYY-MM-DD" format', () => {
        const mockDate = new Date('2024-09-04T12:00:01Z');
        const originalDate = global.Date;
        global.Date = jest.fn(() => mockDate);
        const currentDate = date.getCurrentDate();
        global.Date = originalDate;
        expect(currentDate).toBe('2024-09-04');
    });
});

describe('writeFile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should write content to a specific file', () => {
        let content = '## VERSIONING: version 1.0.0 (2023-09-04)'
        expect(writeSpecFile(defaultValues.releasesFile, content)).toBe(true);
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            defaultValues.releasesFile,
            expect.stringContaining('## VERSIONING: version 1.0.0 (2023-09-04)'),
            'utf-8'
        );
    });

    it('should handle errors and return false on failure', () => {
        const content = 'Test content';
        fs.writeFileSync.mockImplementation(() => {
            throw new Error('Error');
        });
        const result = writeSpecFile(defaultValues.releasesFile, content);
        expect(fs.writeFileSync).toHaveBeenCalledWith(defaultValues.releasesFile, content, 'utf-8');
        // expect(console.error).toHaveBeenCalledWith('Error appending to file:', error);
        expect(result).toBe(false);
    });
});

describe('generateChangelog', () => {
    it('Should generate the changelog for each case', () => {
        const commits = [
            'b35717a fix(modules): for node js',
            'bcc665f feat(message): add git origin to message of commit',
            '5eb400d BREAKING CHANGE: logic, source is now git tags',
        ];

        const changelog = generateChangelog(commits);

        expect(changelog).toEqual({
            "feat": [
                {
                    hash: 'bcc665f',
                    scope: 'message',
                    message: ' add git origin to message of commit',
                    cleanedRemoteUrl: 'https://github.com/ZOLUXERO/update-this-version'
                }
            ],
            "fix": [
                {
                    hash: 'b35717a',
                    scope: 'modules',
                    message: ' for node js',
                    cleanedRemoteUrl: 'https://github.com/ZOLUXERO/update-this-version'
                }
            ],
            "BREAKING CHANGE": [
                {
                    hash: '5eb400d',
                    scope: '',
                    message: ' logic, source is now git tags',
                    cleanedRemoteUrl: 'https://github.com/ZOLUXERO/update-this-version'
                }
            ],
            "feature": [],
            "test": []
        });
    });
});

describe('generateContent', () => {
    const changelog = {
        "feat": [
            {
                hash: 'bcc665f',
                scope: 'message',
                message: ' add git origin to message of commit',
                cleanedRemoteUrl: 'https://github.com/ZOLUXERO/update-this-version'
            }
        ],
    }

    it('should return content based on the changelog', () => {
        const mockGetCurrentDate = jest.fn().mockReturnValue('2024-09-04');
        date.getCurrentDate = mockGetCurrentDate;
        const content = generateContent(changelog, '0.0.1');
        expect(content).toContain('## VERSIONING: version 0.0.1 (2024-09-04)');
        expect(content).toContain('### feat:');
        expect(content).toContain('- **message:**  add git origin to message of commit ([bcc665f](https://github.com/ZOLUXERO/update-this-version/commit/bcc665f))');
    });
});
