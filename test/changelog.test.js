const fs = require('fs');
const { writeChangelog, generateChangelog, createCurrentReleaseFile } = require('../lib/changelog'); 
const date = require('../lib/utils');
const defaultValues = require('../default');

jest.mock('fs');

describe('writeChangelog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should write changelog content to an existing file', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('Existing content');
    // date.getCurrentDate.mockReturnValue('2023-09-04'); 
    const changelog = {
      "feat": [
        {
          hash: 'abc123',
          scope: 'example',
          message: 'Add a new feature',
          cleanedRemoteUrl: 'https://github.com/example/repo'
        }
      ]
    };
    const version = '1.0.0';

    expect(writeChangelog(changelog, version)).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(defaultValues.releasesFile);
    expect(fs.readFileSync).toHaveBeenCalledWith(defaultValues.releasesFile, 'utf-8');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      defaultValues.releasesFile,
      expect.stringContaining('## VERSIONING: version 1.0.0 (2023-09-04)'),
      'utf-8'
    );
  });
});


describe('formatChangelog', () => {
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

describe('createCurrentReleaseFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create the current release file with changelog content', () => {
    // date.getCurrentDate.mockReturnValue('2023-09-04');
    const latestVersion = '1.0.0';
    const changelog = {
      "feat": [
        {
          hash: 'abc123',
          scope: '',
          message: 'Add a new feature',
          cleanedRemoteUrl: 'https://github.com/example/repo'
        }
      ]
    };

    const formatChangelogEntries = jest.fn().mockReturnValue('abc123 **** Add a new feature ([abc123](https://github.com/example/repo))');

    createCurrentReleaseFile(changelog, latestVersion, formatChangelogEntries);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      defaultValues.currentReleaseFile,
      expect.stringContaining('## VERSIONING: version 1.0.0 (2023-09-04)'),
      'utf-8'
    );

    // expect(formatChangelogEntries).toHaveBeenCalledWith(changelog);
  });

  it('should not create the current release file if changelog is empty', () => {
    // date.getCurrentDate.mockReturnValue('2023-09-04');
    const latestVersion = '1.0.0';
    const changelog = {};

    createCurrentReleaseFile(changelog, latestVersion);

    expect(fs.appendFileSync).not.toHaveBeenCalled();
  });
});
