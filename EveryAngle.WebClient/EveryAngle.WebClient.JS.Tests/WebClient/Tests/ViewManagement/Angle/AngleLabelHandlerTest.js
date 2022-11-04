/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("AngleLabelHandler", function () {
    var angleLabelHandler;
    beforeEach(function () {
        angleLabelHandler = new AngleLabelHandler(new AngleHandler());
    });

    describe(".CanUpdate", function () {
        it("should be true", function () {
            //arrange
            spyOn(angleLabelHandler.AngleHandler, 'CanUpdate').and.returnValue(true);

            //act
            var result = angleLabelHandler.CanUpdate();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetModelUri", function () {
        it("should get model uri", function () {
            //arrange
            angleLabelHandler.AngleHandler.Data().model = '/models/1';

            //act
            var result = angleLabelHandler.GetModelUri();

            // assert
            expect(result).toEqual('/models/1');
        });
    });

    describe(".IsPublished", function () {
        it("should be true", function () {
            //arrange
            angleLabelHandler.AngleHandler.Data().is_published(true);

            //act
            var result = angleLabelHandler.IsPublished();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".IsAdhoc", function () {
        it("should be true", function () {
            //arrange
            spyOn(angleLabelHandler.AngleHandler, 'IsAdhoc').and.returnValue(true);

            //act
            var result = angleLabelHandler.IsAdhoc();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetAssignedLabels", function () {
        it("should get assigned labels", function () {
            //arrange
            angleLabelHandler.AngleHandler.Data().assigned_labels(['my_label']);

            //act
            var result = angleLabelHandler.GetAssignedLabels();

            // assert
            expect(result).toEqual(['my_label']);
        });
    });

    describe(".Save", function () {
        it("should confirm before saving", function () {
            //arrange
            spyOn(angleLabelHandler.AngleHandler, 'ConfirmSave');

            //act
            angleLabelHandler.Save([]);

            // assert
            expect(angleLabelHandler.AngleHandler.ConfirmSave).toHaveBeenCalled();
        });
    });

    describe(".ForceSave", function () {
        it("should save", function () {
            //arrange
            spyOn(angleLabelHandler, 'ShowProgressbar');
            spyOn(angleLabelHandler.AngleHandler, 'UpdateData');

            //act
            angleLabelHandler.ForceSave(['new-label1', 'new-label2']);

            // assert
            expect(angleLabelHandler.AngleHandler.Data().assigned_labels()).toEqual(['new-label1', 'new-label2']);
            expect(angleLabelHandler.ShowProgressbar).toHaveBeenCalled();
            expect(angleLabelHandler.AngleHandler.UpdateData).toHaveBeenCalled();
        });
    });

    describe(".SaveDone", function () {
        it("should hide progress bar without notification message", function () {
            //arrange
            spyOn(angleLabelHandler, 'HideProgressbar');
            spyOn(angleLabelHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(toast, 'MakeSuccessTextFormatting');

            //act
            angleLabelHandler.SaveDone();

            // assert
            expect(angleLabelHandler.HideProgressbar).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).not.toHaveBeenCalled();
        });
        it("should hide progress bar with notification message", function () {
            //arrange
            spyOn(angleLabelHandler, 'HideProgressbar');
            spyOn(angleLabelHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(toast, 'MakeSuccessTextFormatting');

            //act
            angleLabelHandler.SaveDone();

            // assert
            expect(angleLabelHandler.HideProgressbar).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
        });
    });

    describe(".GetStateData", function () {
        it("should get state data", function () {
            //arrange
            spyOn(angleLabelHandler.AngleHandler, 'GetData').and.returnValue('my-angle-data');

            //act
            var result = angleLabelHandler.GetStateData();

            // assert
            expect(result).toEqual('my-angle-data');
        });
    });
    describe(".CreateAngle", () => {
        beforeEach(() => {
            createMockHandler(window, 'anglePageHandler', {
                HandlerAngleSaveAction: {
                    SaveasHandler: {
                        Save: $.noop
                    }
                },
                SaveAll: $.noop
            });
        });
        afterEach(() => {
            restoreMockHandlers();
        });
        it("Should call SaveAll", () => {
            //arrange
            spyOn(anglePageHandler, "SaveAll");

            //act
            angleLabelHandler.CreateAngle(false);

            // assert
            expect(anglePageHandler.SaveAll).toHaveBeenCalled()
        });
        it("Should call SaveasHandler Save", () => {
            //arrange
            spyOn(anglePageHandler.HandlerAngleSaveAction.SaveasHandler, "Save");

            //act
            angleLabelHandler.CreateAngle(true);

            // assert
            expect(anglePageHandler.HandlerAngleSaveAction.SaveasHandler.Save).toHaveBeenCalled()
        });
    });
});
