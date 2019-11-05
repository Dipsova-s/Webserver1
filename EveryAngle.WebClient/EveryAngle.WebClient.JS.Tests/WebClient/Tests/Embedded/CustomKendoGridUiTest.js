/// <reference path="/../SharedDependencies/customkendogridui.js" />

describe("CustomKendoGridUi", function () {

    describe(".SetKendoKineticScrollNeeded", function () {
        beforeEach(function () {
            window.kendo = {
                support: {
                    kineticScrollNeeded: false
                }
            };
        });

        var tests = [
            {
                title: 'should set kineticScrollNeeded to true when using iPad',
                platform: 'iPad',
                maxTouchPoints: 10,
                expected: true
            },
            {
                title: 'should set kineticScrollNeeded to true when using iPhone',
                platform: 'iPhone',
                maxTouchPoints: 10,
                expected: true
            },
            {
                title: 'should set kineticScrollNeeded to true when using iPod',
                platform: 'iPod',
                maxTouchPoints: 10,
                expected: true
            },
            {
                title: 'should set kineticScrollNeeded to true when using MacIntel and max touch points more than 1',
                platform: 'MacIntel',
                maxTouchPoints: 10,
                expected: true
            },
            {
                title: 'should set kineticScrollNeeded to false when using MacIntel and max touch points less than 1',
                platform: 'MacIntel',
                maxTouchPoints: 1,
                expected: false
            },
            {
                title: 'should set kineticScrollNeeded to false when using android',
                platform: 'android',
                maxTouchPoints: 10,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                WindowNavigatorInfo = {
                    platform: test.platform,
                    maxTouchPoints: test.maxTouchPoints
                };

                SetKendoKineticScrollNeeded();

                expect(window.kendo.support.kineticScrollNeeded).toEqual(test.expected);
            });
        });
    });
});
