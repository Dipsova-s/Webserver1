/// <reference path="/Dependencies/ErrorHandler/ErrorHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/shared/DirectoryHandler.js" />
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
                spyOn(popup, 'Alert');
                popup.OnCloseCallback = $.noop;
                resultModel.SetRetryPostResultToErrorPopup({ status: testCase.testValue });
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

    describe(".RequestResult", function () {

        beforeEach(function () {
            spyOn(resultModel, 'ObserveResult');
            spyOn(resultModel, 'WatchResult');
            spyOn(resultModel, 'PromiseResult');
        });

        it("should prepare the event looper for observation the result", function () {
            resultModel.RequestResult('/results/1');

            expect(resultModel.ObserveResult).toHaveBeenCalled();
            expect(resultModel.WatchResult).toHaveBeenCalled();
            expect(resultModel.PromiseResult).toHaveBeenCalled();
        });

    });

    describe(".ObserveResult", function () {

        beforeEach(function () {

        });

        it("should send exit request to server when the result need to abort", function () {
            var mockResult = {
                status: enumHandlers.POSTRESULTSTATUS.RUNNING.Value
            };
            var mockResultStatus = { };
            spyOn(window, 'GetDataFromWebService').and.callFake(function () { return $.when($.Deferred().resolve(mockResult)); });
            spyOn(WC.Ajax, 'SendExitRequests');
            spyOn(resultModel, 'StartToObserveResult');

            resultModel.AbortToObserveResult();
            resultModel.ObserveResult('/results/1', mockResultStatus);

            expect(window.GetDataFromWebService).toHaveBeenCalled();
            expect(WC.Ajax.SendExitRequests).toHaveBeenCalled();
            expect(resultModel.StartToObserveResult).toHaveBeenCalled();
        });

        var testCasesForCompletingResult = [
            { name: 'should set complete status to requestStatus when result has been finished', successfully: true, promise_type: 'resolve' },
            { name: 'should set complete status to requestStatus when result has been finished but not completed', successfully: false, promise_type: 'reject' }
        ];

        $.each(testCasesForCompletingResult, function (i, t) {
            it(t.name, function () {
                var mockResult = {
                    status: enumHandlers.POSTRESULTSTATUS.FINISHED.Value,
                    successfully_completed: t.successfully
                };
                var mockResultStatus = {};
                spyOn(window, 'GetDataFromWebService').and.callFake(function () { return $.when($.Deferred().resolve(mockResult)); });

                resultModel.ObserveResult('/results/1', mockResultStatus);

                expect(window.GetDataFromWebService).toHaveBeenCalled();
                expect(mockResultStatus.completed).toBeTruthy();
                expect(mockResultStatus.fn).toEqual(t.promise_type);
            });
        });

    });

});
