/// <reference path="/Dependencies/ErrorHandler/ErrorHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />

describe("ResultModel", function () {
    var resultModel;

    beforeEach(function () {
        resultModel = new ResultViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(resultModel).toBeDefined();
        });

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

    describe(".IsSupportSapTransaction", function () {

        beforeEach(function () {
            enableGoToSAP = true;
            spyOn(resultModel, 'Data').and.callFake(function () {
                return {
                    sap_transactions: '/results/1/sap_transactions'
                };
            });
        });

        it("should be true when [GET] result/x has sap_transactions property", function () {
            expect(resultModel.IsSupportSapTransaction()).toBeTruthy();
        });

        it("should be false when [GET] result/x has no sap_transactions property", function () {
            resultModel.Data.and.callFake(function () {
                return { };
            });
            expect(resultModel.IsSupportSapTransaction()).toBeFalsy();
        });

        it("should be false when [GET] result/x has sap_transactions property and GoToSap feature was disabled", function () {
            enableGoToSAP = false;
            expect(resultModel.IsSupportSapTransaction()).toBeFalsy();
        });

        it("should be false when [GET] result/x has no sap_transactions property and GoToSap feature was disabled", function () {
            enableGoToSAP = false;
            resultModel.Data.and.callFake(function () {
                return {};
            });
            expect(resultModel.IsSupportSapTransaction()).toBeFalsy();
        });

    });

});
