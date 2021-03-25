const {getRelease} = require('../../src/index');
const {request} = require('@octokit/request');

jest.mock('@octokit/request');


describe('getRelease tested with n = 0', () => {

    let release;
    beforeEach(async () => {
        request.mockResolvedValue({
            data: [
                {

                    "id": 12345678,
                    "tag_name": "v3.0",
                    "created_at": "2021-01-20T14:38:40Z",
                    "body": "anything"
                },
                {
                    "id": 36659713,
                    "tag_name": "v2.0",
                    "created_at": "2021-01-20T14:38:40Z",
                    "body": "second"
                },
                {
                    "id": 87654321,
                    "tag_name": "v1.1",
                    "created_at": "2021-01-20T14:38:40Z",
                    "body": "third"
                },
                {
                    "id": 18273645,
                    "tag_name": "v1.0",
                    "created_at": "2021-01-20T14:38:40Z",
                    "body": "forth"
                }
            ]
        })
        release = getRelease('DanielKirkwood', 'fakeRepo', 'token', 0);
    })

    afterEach(() => {
        jest.resetAllMocks()
    });

    test('should call the API once', () => {
        expect(request.mock.calls.length == 1);
    })

    test('should have "id" property with value set to "12345678"', () => {
        expect(release.id == 12345678);
    })

    test('should have "tagName" property with value set to "v3.0"', () => {
        expect(release.tagName == "v3.0");
    })

    test('should have "createdAt" property with value set to "2021-01-20T14:38:40Z"', () => {
        let expectedCreatedAt = new Date("2021-01-20T14:38:40Z");
        expect(release.createdAt == expectedCreatedAt);
    })

    test('should have "body" property with value set to "anything"', () => {
        expect(release.body == "anything");
    })

    test('should return first release', () => {

        const expectedReturnRelease = {
            "id": 12345678,
            "tagName": "v3.0",
            "createdAt": new Date("2021-01-20T14:38:40Z"),
            "body": "anything"
        }
        expect(release == expectedReturnRelease);
    });
});