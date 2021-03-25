const {getCommitsList} = require('../../src/index');

const {request} = require('@octokit/request');

jest.mock('@octokit/request')

describe('successfully retrieve the list of commits based on a given date', async () => {
    let response;
    beforeEach(async () => {
        request.mockResolvedValue({
            data: {
                "foo" : "bar"
            }
        })
        response1 = getCommitsList("Carter Leishman","fakeRepo","sha",10,"token",0)
        response2 = getCommitsList("Carter Leishman","fakeRepo","sha",10,"token",10)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    test('test that if since data is 0 then data is returned', () => {
        const expectedResponse = {
            "foo" : "bar"
        }
        expect(response1.foo == "bar");
    })

    test('test that if since data is not 0 then data is returned', () => {
        const expectedResponse = {
            "foo" : "bar"
        }
        expect(response2.foo == "bar");
    })
})