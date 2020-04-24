/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemvalidatestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/anglestateview.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/anglestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/angletemplatestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("AngleTemplateStateHandler", function () {

    var angleStateHandler;
    beforeEach(function () {
        angleStateHandler = new AngleStateHandler();
        spyOn(toast, 'MakeSuccessText');
        createMockHandler(window, 'anglePageHandler', {
            ExecuteAngle: $.noop,
            HandlerAngle: {
                ClearData: $.noop
            }
        });
    });
    afterEach(function () {
        restoreMockHandlers();
    });

    describe(".SetTemplateStatus", function () {
        var tests = [
            {
                title: 'should return true and call the related functions when template is true',
                istemplate: true
            },
            {
                title: 'should return true and call the related functions when template is false',
                istemplate: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleStateHandler, 'UpdateState').and.callFake(function (uri, data, callback) {
                    callback();
                });
                spyOn(anglePageHandler.HandlerAngle, 'ClearData');
                spyOn(anglePageHandler, 'ExecuteAngle');

                // act
                var result = angleStateHandler.SetTemplateStatus(test.istemplate);

                // assert
                expect(angleStateHandler.UpdateState).toHaveBeenCalled();
                expect(anglePageHandler.HandlerAngle.ClearData).toHaveBeenCalled();
                expect(anglePageHandler.ExecuteAngle).toHaveBeenCalled();
                expect(result).toEqual(true);
            });
        });
      
    });
});