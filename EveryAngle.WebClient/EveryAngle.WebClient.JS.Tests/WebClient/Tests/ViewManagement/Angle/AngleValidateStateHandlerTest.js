/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/anglestateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/anglestatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/anglevalidatestatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("AngleStateHandler", function () {

    var angleStateHandler;
    beforeEach(function () {
        angleStateHandler = new AngleStateHandler();
        spyOn(toast, 'MakeSuccessText');
        createMockHandler(window, 'anglePageHandler', {
            ExecuteAngle: $.noop,
            HandlerAngle: {
                ClearData: $.noop,
                ConfirmValidationSaveUsedInTask: $.noop
            },
            HandlerDisplay: {
                ClearPostResultData: $.noop
            }
        });
    });
    afterEach(function () {
        restoreMockHandlers();
    });

    describe(".ValidateItem", function () {
        it('should set all functions and call confirm save', function () {
            spyOn(anglePageHandler.HandlerAngle, 'ConfirmValidationSaveUsedInTask');

            // act
            angleStateHandler.ValidateItem();

            // assert
            expect(anglePageHandler.HandlerAngle.ConfirmValidationSaveUsedInTask).toHaveBeenCalled();
        });
    });

    describe(".CancelValidateItem", function () {
        it('should set checkbox state', function () {
            // act
            var element = $('<input type="checkbox"/>');
            var isValidate = true;
            angleStateHandler.CancelValidateItem(element, isValidate);

            // assert
            expect(element.prop('checked')).toEqual(true);
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
            spyOn(anglePageHandler.HandlerDisplay, 'ClearPostResultData');

            // act
            angleStateHandler.CallbackValidateItem();

            // assert
            expect(angleStateHandler.ShowValidatingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.UpdateState).toHaveBeenCalled();
            expect(angleStateHandler.HideValidatingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.CloseValidatePopup).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.ClearData).toHaveBeenCalled();
            expect(anglePageHandler.ExecuteAngle).toHaveBeenCalled();
            expect(anglePageHandler.HandlerDisplay.ClearPostResultData).toHaveBeenCalled();
        });
    });

    describe(".ShowValidatePopupCallback", function () {
        it('should update checkbox and set new event', function () {
            spyOn($.fn, 'prop');
            spyOn($.fn, 'on');
            spyOn(angleStateHandler.parent.prototype, 'ShowValidatePopupCallback');
            var e = {
                sender: {
                    element: $()
                }
            };
            angleStateHandler.ShowValidatePopupCallback(e);

            // assert
            expect($.fn.prop).toHaveBeenCalledWith('checked', false);
            expect($.fn.on).toHaveBeenCalled();
            expect(angleStateHandler.parent.prototype.ShowValidatePopupCallback).toHaveBeenCalled();
        });
    });
});