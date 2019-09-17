/// <reference path="/Dependencies/ErrorHandler/ErrorHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />

describe("ResultModel", function () {
    var resultModel;

    beforeEach(function () {
        resultModel = new ResultViewModel();
    });

    describe(".SetRetryPostResultToErrorPopup", function () {
        var testCases = [
            { title: 'should show warning popup if http status code is 404', testValue: 404, expected: true },
            { title: 'should not show warning popup if http status code is 409', testValue: 409, expected: false },
            { title: 'should not show warning popup if http status code is 500', testValue: 500, expected: false }
        ];
        testCases.forEach(function (testCase) {
            it(testCase.title, function () {
                spyOn(popup, 'Alert').and.callFake($.noop);
                popup.OnCloseCallback = $.noop;
                resultModel.SetRetryPostResultToErrorPopup(testCase.testValue);
                var hasOnCloseCallback = popup.OnCloseCallback !== $.noop;
                expect(hasOnCloseCallback).toEqual(testCase.expected);
            });
        });
    });

});
