const {getSHA} = require('../../src/index');
const {request} = require('@octokit/request');

jest.mock('@octokit/request')

describe('successfully retrieve SHA attribute from a payload', async () => {

    let sha1;

    beforeEach(async () => {
        request.mockResolvedValue({
            data:
                {
                    "id": 987654,
                    "tag_name": "v3.0",
                    "object" : {
                        "sha" : "0000000000000000000000000000000000000000"
                    }
                }
        });
        sha1 = await getSHA('CarterLeishman','fakeRepo','v3.0','token');
    })

    afterEach(() => {
        jest.resetAllMocks()
    })
     
    test('determines if the length of the SHA atrribute is of length 40 as standard', () => {
            expect(sha1.length == 40);
    })

    test('determines if the right SHA attribute is returned', () => {
        const expectedSha = "0000000000000000000000000000000000000000";
        expect(sha1).toEqual(expectedSha);
    })

    test('check if undefined is returned when api call fails', () => {
        
    })
});