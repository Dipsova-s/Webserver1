describe("ResultHandler", function () {
    var resultHandler;
    beforeEach(function () {
        var displayHandler = new DisplayHandler({}, new AngleHandler({}));
        resultHandler = new ResultHandler(displayHandler);
    });

    describe(".constructor", function () {
        it("should define default values", function () {
            expect(resultHandler.Data).toEqual({});
            expect(resultHandler.ExecutionInfo()).toEqual(null);
            expect(resultHandler.DisplayHandler instanceof DisplayHandler).toEqual(true);
            expect(resultHandler.IntervalTime).toEqual(500);
            expect(resultHandler.CustomError).toEqual(false);
            expect(ResultHandler.CustomErrorType.SortingLimitExceeded).toEqual('sorting_limit_exceeded');
            expect(ResultHandler.CustomErrorType.SuccessfullyCompleted).toEqual('successfully_completed');
        });
    });
    describe(".SetData", function () {
        it("should set data", function () {
            var data = { id: 1 };
            spyOn(resultHandler, 'ClearData');
            spyOn(resultHandler, 'UpdateExecutionInfo');
            spyOn(resultHandler, 'GetAngleQueryDefinition');
            spyOn(resultHandler, 'GetDisplayQueryDefinition');
            resultHandler.SetData(data);

            // assert
            expect(resultHandler.Data.id).toEqual(1);
            expect(resultHandler.ClearData).toHaveBeenCalled();
            expect(resultHandler.UpdateExecutionInfo).toHaveBeenCalled();
            expect(resultHandler.GetAngleQueryDefinition).toHaveBeenCalled();
            expect(resultHandler.GetDisplayQueryDefinition).toHaveBeenCalled();
        });
    });
    describe(".GetData", function () {
        it("should get data", function () {
            resultHandler.Data = { id: 1 };
            var result = resultHandler.GetData();

            // assert
            expect(resultHandler.Data.id).toEqual(1);
        });
    });
    describe(".ClearData", function () {
        it("should clear data", function () {
            resultHandler.ExecutionInfo({});
            resultHandler.ClearData();

            // assert
            expect(resultHandler.Data).toEqual({});
            expect(resultHandler.ExecutionInfo()).toEqual(null);
        });
    });
});