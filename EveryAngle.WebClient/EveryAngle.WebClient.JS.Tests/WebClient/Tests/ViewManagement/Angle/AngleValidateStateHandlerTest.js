/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemvalidatestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/anglestateview.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/anglestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/anglevalidatestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("AngleStateHandler", function () {

    var angleStateHandler;
    beforeEach(function () {
        angleStateHandler = new AngleStateHandler();
        spyOn(toast, 'MakeSuccessText');
        createMockHandler(window, 'anglePageHandler', {
            ExecuteAngle: $.noop,
            HandlerAngle: {
                ClearData: $.noop,
                ConfirmSave: $.noop
            }
        });
    });
    afterEach(function () {
        restoreMockHandlers();
    });

    describe(".ValidateItem", function () {
        it('set all functions and call confirm save', function () {
            spyOn(anglePageHandler.HandlerAngle, 'ConfirmSave');

            // act
            angleStateHandler.ValidateItem();

            // assert
            expect(anglePageHandler.HandlerAngle.ConfirmSave).toHaveBeenCalled();
        });
    });

    describe(".CallbackValidateItem", function () {
        it('should call all functions', function () {
            spyOn(angleStateHandler, 'ShowValidatingProgressbar');
            spyOn(angleStateHandler, 'UpdateState').and.callFake(function (uri, data, callback) {
                callback();
            });
            spyOn(angleStateHandler, 'HideValidatingProgressbar');
            spyOn(angleStateHandler, 'CloseValidatePopup');
            spyOn(anglePageHandler.HandlerAngle, 'ClearData');
            spyOn(anglePageHandler, 'ExecuteAngle');

            // act
            angleStateHandler.CallbackValidateItem();

            // assert
            expect(angleStateHandler.ShowValidatingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.UpdateState).toHaveBeenCalled();
            expect(angleStateHandler.HideValidatingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.CloseValidatePopup).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.ClearData).toHaveBeenCalled();
            expect(anglePageHandler.ExecuteAngle).toHaveBeenCalled();
        });
    });
});