/// <chutzpah_reference path="/../../Dependencies/ErrorHandler/ErrorHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/shared/DirectoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />

describe("ResultModel", function () {
    var resultModel;
    beforeEach(function () {
        resultModel = new ResultViewModel();
        createMockHandler(window, 'anglePageHandler', {
            ExecuteAngle: $.noop,
            HandlerDisplay: {
                ClearPostResultData: $.noop
            }
        });
    });
    afterEach(function () {
        restoreMockHandlers();
    });

    describe(".SetRetryPostResult", function () {
        beforeEach(function () {
            spyOn(errorHandlerModel, 'IgnoreAjaxError');
            spyOn(errorHandlerModel, 'GetAreaErrorMessage').and.returnValue('my error');
            spyOn(errorHandlerModel, 'ShowAreaError');
        });
        it('should set error for 404 status code', function () {
            resultModel.SetRetryPostResult({ status: 404, responseJSON: { message: "Result 3 not found at Model server (ID: EA2_800_SERVER1, URI: https://aa.aa.aa:60010 ); Status: Down."} });
            expect(errorHandlerModel.IgnoreAjaxError).toHaveBeenCalled();
            expect(errorHandlerModel.GetAreaErrorMessage).not.toHaveBeenCalled();
            expect(errorHandlerModel.ShowAreaError).toHaveBeenCalled();
        });
        it('should set error for other status code', function () {
            resultModel.SetRetryPostResult({ responseJSON: {message: "some other error message"} });
            expect(errorHandlerModel.IgnoreAjaxError).toHaveBeenCalled();
            expect(errorHandlerModel.GetAreaErrorMessage).toHaveBeenCalled();
            expect(errorHandlerModel.ShowAreaError).toHaveBeenCalled();
        });
        it('should set error for 200 status code and sorting limit exceeded', function () {
            var sortErrorMessage = "This Angle cannot be sorted. The maximum number of objects to sort is 1000";
            resultModel.SetRetryPostResult({ status: 200, responseText: sortErrorMessage, responseJSON: {message: "Some error message"} });
            expect(errorHandlerModel.IgnoreAjaxError).toHaveBeenCalled();
            expect(errorHandlerModel.GetAreaErrorMessage).toHaveBeenCalled();
            expect(errorHandlerModel.ShowAreaError).toHaveBeenCalled();
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
