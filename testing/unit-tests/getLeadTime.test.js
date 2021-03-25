const {getLeadTime} = require('../../src/index');

describe('successful calculate lead times', () => {

    let date1, date2;

    beforeEach(() => {
        // dates are exactly 20 days apart
        date1 = new Date('2021-01-21T01:00:00Z');
        date2 = '2021-01-01T01:00:00Z'
    });

    test('calculates lead time between 20 days with 5 commits', () => {
        expect(getLeadTime(date1, date2, 5)).toBe("4.00");
    })

    test('calculates lead time between 20 days with 20 commits', () => {
        expect(getLeadTime(date1, date2, 20)).toBe("1.00");
    })

    test('calculates lead time between 20 days with 100 commits', () => {
        expect(getLeadTime(date1, date2, 100)).toBe("0.20");
    })

    test('calculates lead time between 0 days with 5 commits', () => {
        date1 = new Date('2021-01-21T01:00:00Z');
        date2 = '2021-01-21T01:00:00Z';
        expect(getLeadTime(date1, date2, 5)).toBe("0.00");
    })

    test('calculates lead time between -20 days with 5 commits', () => {
        date1 = new Date('2021-01-01T01:00:00Z');
        date2 = '2021-01-21T01:00:00Z'
        expect(getLeadTime(date1, date2, 5)).toBe("4.00");
    })

})

describe('calculating lead times that throw errors', () => {

    let date1, date2;

    beforeEach(() => {
        // dates are exactly 20 days apart
        date1 = new Date('2021-01-21T01:00:00Z');
        date2 = '2021-01-01T01:00:00Z'
    });

    test('calculates lead time between 20 days with 0 commits', () => {
        expect(() => getLeadTime(date1, date2, 0)).toThrowError("No commits since last release");

    })

    test('calculates lead time between 20 days with -5 commits', () => {
        expect(() => getLeadTime(date1, date2, -5)).toThrowError("Number of commits is negative");
    })
})

