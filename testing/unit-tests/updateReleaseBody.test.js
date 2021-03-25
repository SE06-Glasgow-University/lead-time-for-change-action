const {updateReleaseBody} = require('../../src/index');
const {request} = require('@octokit/request');

jest.mock('@octokit/request')

describe('successfully retrieve number of commits from a release', async () => {
    let release;
    beforeEach(async () => {
        request.mockResolvedValue({
            data: {
                
            }
        })
        release = updateReleaseBody('CarterLeishman','fakeRepo','releaseID','token','body')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    test('checks if true is returned when function is called with correct parameters', () => {
        expect(release == true);
    })

    test('checks if function returns false when calls fails', () => {
        expect(updateReleaseBody('CarterLeishman','fakeRepo','releaseID','token') == false);
    })
})