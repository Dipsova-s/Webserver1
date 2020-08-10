/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSaveAsHandler.js" />

describe("AngleSaveAsHandler", function () {

    var angleSaveAsHandler;
    beforeEach(function () {
        var angleHandler = new AngleHandler({ multi_lang_name: [] });
        var displayHandler = new DisplayHandler({ uri: '/displays/1' }, angleHandler);
        angleSaveAsHandler = new AngleSaveAsHandler(angleHandler, displayHandler);
    });

    describe(".Initial", function () {
        it("should initial", function () {
            // prepare
            spyOn(angleSaveAsHandler.ItemSaveAsHandler, 'SetData');
            angleSaveAsHandler.Initial();

            // assert
            expect(angleSaveAsHandler.ItemSaveAsHandler.SetData).toHaveBeenCalled();
        });
    });

    describe(".ShowPopup", function () {
        it("should show popup", function () {
            // prepare
            spyOn(angleSaveAsHandler.ItemSaveAsHandler, 'ShowPopup');
            angleSaveAsHandler.ShowPopup();

            // assert
            expect(angleSaveAsHandler.ItemSaveAsHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".GetWarningText", function () {
        it("should get a warning text (Angle has a warning)", function () {
            // prepare
            spyOn(angleSaveAsHandler.AngleHandler, "GetValidationResult").and.returnValue({ Valid: false });
            var result = angleSaveAsHandler.GetWarningText();

            // assert
            expect(result).toEqual(Localization.Info_SaveAsAngleWarning);
        });
        it("should get a warning text (Display has a warning)", function () {
            // prepare
            spyOn(angleSaveAsHandler.AngleHandler, "GetValidationResult").and.returnValue({ Valid: true });
            angleSaveAsHandler.AngleHandler.Displays = [
                { GetValidationResult: ko.observable({ Valid: true }) },
                { GetValidationResult: ko.observable({ Valid: false }) }
            ];
            var result = angleSaveAsHandler.GetWarningText();

            // assert
            expect(result).toEqual(Localization.Info_SaveAsAngleWarning);
        });
        it("should not get a warning text", function () {
            // prepare
            spyOn(angleSaveAsHandler.AngleHandler, "GetValidationResult").and.returnValue({ Valid: true });
            angleSaveAsHandler.AngleHandler.Displays = [
                { GetValidationResult: ko.observable({ Valid: true }) },
                { GetValidationResult: ko.observable({ Valid: true }) }
            ];
            var result = angleSaveAsHandler.GetWarningText();

            // assert
            expect(result).toEqual('');
        });
    });

    describe(".GetSaveData", function () {
        it("should get data", function () {
            // prepare
            spyOn(angleSaveAsHandler.AngleHandler, "CloneData").and.returnValue({});
            spyOn(angleSaveAsHandler.ItemSaveAsHandler, "GetData").and.returnValue({
                multi_lang_name: []
            });
            spyOn(angleSaveAsHandler.ItemSaveAsHandler, "GetLanguages").and.returnValue('my-description');
            var result = angleSaveAsHandler.GetSaveData();

            // assert
            expect(result.multi_lang_description).toEqual('my-description');
        });
    });

    describe(".Save", function () {
        it("should save", function () {
            // prepare
            spyOn(angleSaveAsHandler, 'GetSaveData');
            spyOn(angleSaveAsHandler, 'GetCurrentDisplayId');
            spyOn(angleSaveAsHandler.ItemSaveAsHandler, 'ShowProgressbar');
            spyOn(angleSaveAsHandler.AngleHandler, 'CreateNew');
            angleSaveAsHandler.Save();

            // assert
            expect(angleSaveAsHandler.ItemSaveAsHandler.ShowProgressbar).toHaveBeenCalled();
            expect(angleSaveAsHandler.AngleHandler.CreateNew).toHaveBeenCalled();
        });
    });

    describe(".GetCurrentDisplayId", function () {
        it("should get Id", function () {
            // prepare
            var data = {
                display_definitions: [
                    { uri: '/displays/1', id: 'display1' }
                ]
            };
            var result = angleSaveAsHandler.GetCurrentDisplayId(data);

            // assert
            expect(result).toEqual('display1');
        });
        it("should not get Id", function () {
            // prepare
            var data = {
                display_definitions: [
                    { uri: '/displays/2', id: 'display2' }
                ]
            };
            var result = angleSaveAsHandler.GetCurrentDisplayId(data);

            // assert
            expect(result).toEqual(null);
        });
    });

    describe(".SaveDone", function () {
        it("should show a notification and redirect", function () {
            // prepare
            spyOn(angleSaveAsHandler.ItemSaveAsHandler, 'ClosePopup');
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(angleSaveAsHandler.ItemSaveAsHandler, 'Redirect');
            angleSaveAsHandler.SaveDone();

            // assert
            expect(angleSaveAsHandler.ItemSaveAsHandler.ClosePopup).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(angleSaveAsHandler.ItemSaveAsHandler.Redirect).toHaveBeenCalled();
        });
    });

    describe(".SaveFail", function () {
        it("should hide a progress bar", function () {
            // prepare
            spyOn(angleSaveAsHandler.ItemSaveAsHandler, 'HideProgressbar');
            angleSaveAsHandler.SaveFail();

            // assert
            expect(angleSaveAsHandler.ItemSaveAsHandler.HideProgressbar).toHaveBeenCalled();
        });
    });
});