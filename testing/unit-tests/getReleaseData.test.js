const {getReleaseData} = require('../../src/index');

const {request} = require('@octokit/request');

jest.mock('@octokit/request')

describe('successfully retrieve the the number of commits and date of a release', async () => {
    let data;
    beforeEach(async() => {
        request.mockResolvedValue({
            data: [
                {
                    "id" : 1234567,
                    "firstDate" : "2021-01-20T14:38:40Z"
                },
                {
                    "id" : 987654,
                    "firstDate" : "2020-01-20T14:38:40Z"
                }
            ],
            "numCommits" : 10
        })
        data = getReleaseData('DanielKirkwood', 'fakeRepo','SHA', 'token', 0)
    });

    afterEach(() => {
        jest.resetAllMocks()
    })

    test('Check the number of commits returned is an integer', () => {
        expect(Number.isInteger(data.numCommits));
    })

    test('Check the release data is the correct one based on the value of n (n = 0)',() => {
        expect(data.firstDate == "2021-01-20T14:38:40Z");
    })

    test('should call the API once', () => {
        expect(request.mock.calls.length == 1);
    })
})