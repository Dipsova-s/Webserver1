/// <reference path="/Dependencies/User/Authentication.js" />

describe("Authentication", function () {
    var authentication;

    beforeEach(function () {
        authentication = new Authentication();
    });

    describe(".IsiPadOS13", function () {
        var tests = [
            {
                title: 'should return true when using MacIntel and max touch points more than 1',
                platform: 'MacIntel',
                maxTouchPoints: 10,
                expected: true
            },
            {
                title: 'should return false when using MacIntel and max touch points less than 1',
                platform: 'MacIntel',
                maxTouchPoints: 1,
                expected: false
            },
            {
                title: 'should return false when using android',
                platform: 'android',
                maxTouchPoints: 10,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(authentication, 'GetNavigatorInfo').and.returnValue({
                    platform: test.platform,
                    maxTouchPoints: test.maxTouchPoints
                });

                expect(authentication.IsiPadOS13()).toEqual(test.expected);
            });
        });
    });
});
