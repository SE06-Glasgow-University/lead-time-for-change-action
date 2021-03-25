const {sendDataToWebsite} = require('../../src/index');
const {request} = require('@octokit/request');

jest.mock('@octokit/request')

describe('successfully test if data is sent to the website' , async() => {
    let response;
    beforeEach(async () => {
        request.mockResolvedValue({
            data: {
                
            }
        })
        response = sendDataToWebsite('ownerName', 'repo', 'webToken', 'tagName', 'createdAt', 'leadTimeForChange')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    test('checks if true is returned when function is called with correct parameters', () => {
        expect(response == true);
    })

    test('checks if function returns false when calls fails', () => {
        expect(sendDataToWebsite('ownerName', 'repo', 'webToken', 'tagName', 'createdAt') == false);
    })
})