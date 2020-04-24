/// <reference path="/Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />

describe("ModelFollowupsHandler", function () {
    var modelFollowupsHandler;

    beforeEach(function () {
        modelFollowupsHandler = new ModelFollowupsHandler();
    });

    describe(".GetResultClassesByQueryStep", function () {
        var tests = [
            {
                title: 'should get result from query step',
                queryStep: 'queryStep',
                modelUri: '/models/1',
                fallback: 'result followup from fallback',
                followupByQueryStep: {
                    resulting_classes: 'result followup from query step'
                },
                expected: 'result followup from query step'
            },
            {
                title: 'should get result from fallback',
                queryStep: 'queryStep',
                modelUri: '/models/1',
                fallback: 'result followup from fallback',
                followupByQueryStep: null,
                expected: 'result followup from fallback'
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(modelFollowupsHandler, 'GetFollowupByQueryStep').and.returnValue(test.followupByQueryStep);

                var result = modelFollowupsHandler.GetResultClassesByQueryStep(test.queryStep, test.modelUri, test.fallback);
                expect(result).toEqual(test.expected);
            });
        });
    });
});
