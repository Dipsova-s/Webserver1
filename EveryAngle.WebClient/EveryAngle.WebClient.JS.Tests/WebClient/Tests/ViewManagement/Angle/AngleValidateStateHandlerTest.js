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
    });

    describe(".ValidateItem", function () {
        it('always return true and call all functions', function () {
            window.anglePageHandler = window.anglePageHandler || { ApplyExecutionAngle: $.noop };
            spyOn(angleStateHandler, 'ShowValidatingProgressbar').and.callFake($.noop);
            spyOn(angleStateHandler, 'UpdateState').and.callFake(function (uri, data, callback) {
                callback();
            });
            spyOn(angleInfoModel, 'LoadAngle').and.returnValue($.when());
            spyOn(angleStateHandler, 'HideValidatingProgressbar').and.callFake($.noop);
            spyOn(angleStateHandler, 'CloseValidatePopup').and.callFake($.noop);
            spyOn(anglePageHandler, 'ApplyExecutionAngle').and.callFake($.noop);

            // act
            var result = angleStateHandler.ValidateItem();

            // assert
            expect(result).toEqual(true);
            expect(angleStateHandler.ShowValidatingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.UpdateState).toHaveBeenCalled();
            expect(angleInfoModel.LoadAngle).toHaveBeenCalled();
            expect(angleStateHandler.HideValidatingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.CloseValidatePopup).toHaveBeenCalled();
            expect(anglePageHandler.ApplyExecutionAngle).toHaveBeenCalled();
        });
    });
});