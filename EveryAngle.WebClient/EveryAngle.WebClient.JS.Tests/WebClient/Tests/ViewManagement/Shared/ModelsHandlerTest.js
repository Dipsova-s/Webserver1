/// <reference path="/Dependencies/ViewManagement/Shared/FieldChooserHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />

describe("ModelsHandler", function () {
    var modelsHandler;

    beforeEach(function () {
        modelsHandler = new ModelsHandler();
    });

    describe(".GetLatestFollowupQuery", function () {

        it("should get correct query", function () {
            spyOn(modelsHandler, 'GetFollowupInfo').and.returnValue({});
            spyOn(modelsHandler, 'GetResultClassesFromFollowupInfo').and.returnValue(['followup1', 'followup2']);

            var result = modelsHandler.GetLatestFollowupQuery();
            expect(result).toEqual('?classes=followup1,followup2');
        });

    });

    describe(".GetFollowupInfo", function () {

        var tests = [
            {
                title: 'should no followup if not Angle or Display',
                config: 'AnyDetail',
                expected: {
                    countFollowups: 0,
                    followupIndex: 'last'
                }
            },
            {
                title: 'should get followups for Angle',
                config: 'AngleDetail,1',
                expected: {
                    countFollowups: 2,
                    followupIndex: '1'
                }
            },
            {
                title: 'should get followups for Display with followupIndex = -1',
                config: 'DisplayDetail,-1',
                expected: {
                    countFollowups: 3,
                    followupIndex: '1'
                }
            },
            {
                title: 'should get followups for Display with followupIndex = last',
                config: 'DisplayDetail,last',
                expected: {
                    countFollowups: 3,
                    followupIndex: 'last'
                }
            },
            {
                title: 'should get followups for Display with followupIndex is not in (-1, last)',
                config: 'DisplayDetail,0',
                expected: {
                    countFollowups: 3,
                    followupIndex: '2'
                }
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                var angleSteps = [
                    { step_type: enumHandlers.FILTERTYPE.FOLLOWUP },
                    { step_type: enumHandlers.FILTERTYPE.FOLLOWUP }
                ];
                var displaySteps = [
                    { step_type: enumHandlers.FILTERTYPE.FOLLOWUP }
                ];

                var result = modelsHandler.GetFollowupInfo(angleSteps, displaySteps, test.config);
                expect(result.followups.length).toEqual(test.expected.countFollowups);
                expect(result.followupIndex).toEqual(test.expected.followupIndex);
            });
        });

    });

    describe(".GetResultClassesFromFollowupInfo", function () {

        var tests = [
            {
                title: 'should use fallback if no followup steps',
                followupInfo: { followups: [], followupIndex: 'last' },
                followupData: {},
                fallback: ['fb1', 'fb2'],
                expected: 'fb1,fb2'
            },
            {
                title: 'should use fallback if no followup from model',
                followupInfo: { followups: [{}], followupIndex: 'last' },
                followupData: null,
                fallback: ['fb1', 'fb2'],
                expected: 'fb1,fb2'
            },
            {
                title: 'should use fallback if followupIndex = -1',
                followupInfo: { followups: [{}], followupIndex: '-1' },
                followupData: { resulting_classes: ['f1', 'f2'] },
                fallback: ['fb1', 'fb2'],
                expected: 'fb1,fb2'
            },
            {
                title: 'should use resulting class',
                followupInfo: { followups: [{}, {}], followupIndex: 1 },
                followupData: { resulting_classes: ['f1', 'f2'] },
                fallback: ['fb1', 'fb2'],
                expected: 'f1,f2'
            }
        ];

        $.each(tests, function (index, test) { 
            it(test.title, function () {
                spyOn(modelFollowupsHandler, 'GetFollowupByQueryStep').and.returnValue(test.followupData);
                var result = modelsHandler.GetResultClassesFromFollowupInfo(test.followupInfo, '', test.fallback);
                expect(result.join(',')).toEqual(test.expected);
            });
        });

    });

});
