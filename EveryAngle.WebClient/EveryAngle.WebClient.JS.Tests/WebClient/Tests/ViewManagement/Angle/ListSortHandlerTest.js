/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ListSortHandler.js" />

describe("ListSortHandler", function () {

    var listSortHandler;

    beforeEach(function () {
        listSortHandler = new ListSortHandler();
    });

    describe(".ApplyFail", function () {

        it("should set event for popup.OnCloseCallback function", function (done) {
            popup.OnCloseCallback = null;
            listSortHandler.ApplyFail();

            setTimeout(function () {
                expect(popup.OnCloseCallback).not.toEqual(null);
                expect(popup.OnCloseCallback.toString()).toContain('RollbackSorting');
                done();
            }, 200);
        });

    });

    describe(".ApplyDone", function () {

        it("should set event for popup.OnCloseCallback function if sorting limit exceeded", function () {
            popup.OnCloseCallback = null;
            spyOn(popup, 'Alert').and.callFake($.noop);
            spyOn(resultModel, 'ApplyResult').and.callFake($.noop);
            listSortHandler.ApplyDone(true);

            expect(popup.Alert).toHaveBeenCalled();
            expect(popup.OnCloseCallback).not.toEqual(null);
            expect(popup.OnCloseCallback.toString()).toContain('RollbackSorting');
            expect(resultModel.ApplyResult).not.toHaveBeenCalled();
        });

        it("should call ResultModel.ApplyResult function", function () {
            spyOn(popup, 'Alert').and.callFake($.noop);
            spyOn(resultModel, 'ApplyResult').and.callFake($.noop);
            listSortHandler.ApplyDone(false);

            expect(popup.Alert).not.toHaveBeenCalled();
            expect(resultModel.ApplyResult).toHaveBeenCalled();
        });

    });
});