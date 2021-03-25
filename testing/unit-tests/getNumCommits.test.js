const {getNumCommits} = require('../../src/index');
const {request} = require('@octokit/request');

jest.mock('@octokit/request')


describe('successfully retrieve the number of commits in a release', async () => {
    let numCommits;

    beforeEach(async () => {
        request.mockResolvedValue({
            data:
            {
                "id": 987654,
                "tag_name": "v3.0",
                "numCommits" : 200
            }
        })

        numCommits = getNumCommits('CarterLeishman','fakeRepo','releaseSha','token','date');
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    test('checks to see if the number of commits being returned is an integer', () => {
        expect(Number.isInteger(numCommits));
    })

    test('checks if number of commits is 200', () => {
        expect(numCommits == 200);
    })
});

