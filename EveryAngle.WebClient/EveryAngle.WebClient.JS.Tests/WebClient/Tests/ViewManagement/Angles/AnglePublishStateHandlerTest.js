/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />

/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itempublishstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/anglestateview.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/anglestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/anglepublishstatehandler.js" />


describe("AngleStateHandler", function () {

    var angleStateHandler;
    beforeEach(function () {
        angleStateHandler = new AngleStateHandler();
    });

    describe(".ReloadPublishingSettingsData", function () {

        it('should call all functions', function () {
            spyOn(angleStateHandler, 'SetAngleData').and.callFake($.noop);
            spyOn(angleStateHandler, '__ReloadPublishingSettingsData').and.callFake($.noop);
            angleStateHandler.ReloadPublishingSettingsData();

            // assert
            expect(angleStateHandler.SetAngleData).toHaveBeenCalled();
            expect(angleStateHandler.__ReloadPublishingSettingsData).toHaveBeenCalled();
        });

    });

    describe(".GetPublishDisplaysData", function () {

        beforeEach(function () {
            spyOn(angleStateHandler, 'Displays').and.callFake(function () {
                return [
                    { is_angle_default: function () { return true; }, state: '/models/1/angles/1/displays/1/state', is_public: function () { return false } },
                    { is_angle_default: function () { return false; }, state: '/models/1/angles/1/displays/2/state', is_public: function () { return false } },
                    { is_angle_default: function () { return false; }, state: '/models/1/angles/1/displays/3/state', is_public: function () { return false } }
                ];
            });
        });

        it("should get published Display when called", function () {
            var result = angleStateHandler.GetPublishDisplaysData();
            expect(result.length).toEqual(2);
            expect(result[0].state).toEqual('/models/1/angles/1/displays/2/state');
            expect(result[1].state).toEqual('/models/1/angles/1/displays/3/state');
        });

    });

    describe(".GetPublishSettingsData", function () {

        it("should get published settings when called", function () {
            spyOn(angleStateHandler, '__GetPublishSettingsData').and.returnValue({});
            spyOn(angleStateHandler.Data, 'not_allow_followups').and.returnValue(true);
            spyOn(angleStateHandler.Data, 'not_allow_more_details').and.returnValue(true);
            spyOn(angleStateHandler, 'GetPublishDisplaysData').and.returnValue([
                { state: '/xx/yy', is_public: false },
                { state: '/aa/bb', is_public: false }
            ]);

            var result = angleStateHandler.GetPublishSettingsData();
            expect(result.allow_followups).toEqual(false);
            expect(result.allow_more_details).toEqual(false);
            expect(result.display_definitions.length).toEqual(2);
        });

    });

    describe(".GetUpdatedValidatedItemMessage", function () {

        it("should get a message", function () {
            var result = angleStateHandler.GetUpdatedValidatedItemMessage();
            expect(result).toEqual('<i class="icon validWarning"></i>You made changes to a Validate Angle');
        });

    });

    describe(".SavePublishSettings", function () {
        var event = { currentTarget: null }; 

        beforeEach(function () {
            spyOn(angleStateHandler, 'GetUpdatedPublishSettingsData').and.callFake(function () {
                return { display_definitions: [] };
            });
            spyOn(angleStateHandler, 'ShowPublishingProgressbar');
            spyOn(angleStateHandler, 'UpdateItem');
        });

        it("should save publish settings when save data is valid", function () {
            spyOn(angleStateHandler, 'CheckSavePublishSettings').and.callFake(function () {
                return true;
            });

            angleStateHandler.SavePublishSettings(null, event);

            expect(angleStateHandler.GetUpdatedPublishSettingsData).toHaveBeenCalled();
            expect(angleStateHandler.ShowPublishingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.UpdateItem).toHaveBeenCalled();
        });

        it("should not save publish settings when save data is invalid", function () {
            spyOn(angleStateHandler, 'CheckSavePublishSettings').and.callFake(function () {
                return false;
            });

            angleStateHandler.SavePublishSettings(null, event);

            expect(angleStateHandler.GetUpdatedPublishSettingsData).not.toHaveBeenCalled();
            expect(angleStateHandler.ShowPublishingProgressbar).not.toHaveBeenCalled();
            expect(angleStateHandler.UpdateItem).not.toHaveBeenCalled();
        });

    });

    describe(".PublishItem", function () {
        var event = { currentTarget: null };

        beforeEach(function () {
            spyOn(requestHistoryModel, 'SaveLastExecute').and.callFake($.noop);
            spyOn(angleStateHandler, 'ShowPublishingProgressbar').and.callFake($.noop);
            spyOn(angleStateHandler, 'UpdateItem');
        });


        it("should publish Angle when values is valid", function () {
            spyOn(angleStateHandler, 'CheckPublishItem').and.callFake(function () {
                return true;
            });
            angleStateHandler.PublishItem(null, event);

            expect(requestHistoryModel.SaveLastExecute).toHaveBeenCalled();
            expect(angleStateHandler.ShowPublishingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.UpdateItem).toHaveBeenCalled();
        });

        it("should not publish Angle when values is invalid", function () {
            spyOn(angleStateHandler, 'CheckPublishItem').and.callFake(function () {
                return false;
            });
            angleStateHandler.PublishItem(null, event);

            expect(requestHistoryModel.SaveLastExecute).not.toHaveBeenCalled();
            expect(angleStateHandler.ShowPublishingProgressbar).not.toHaveBeenCalled();
            expect(angleStateHandler.UpdateItem).not.toHaveBeenCalled();
        });

    });

    describe(".UnpublishItem", function () {
        var event = { currentTarget: null };

        beforeEach(function () {
            spyOn(requestHistoryModel, 'SaveLastExecute');
            spyOn(popup, 'Confirm').and.callFake(function (message, callback) {
                callback();
            });
            spyOn(angleStateHandler, 'ShowPublishingProgressbar');
            spyOn(angleStateHandler, 'UpdateState').and.callFake(function (uri, data, callback) {
                callback();
            });
            spyOn(angleStateHandler, 'UpdateItem').and.callFake($.noop);
        });

        it("should unpublish Angle when user is Angle's creator", function () {
            spyOn(angleStateHandler, 'CanUserManagePrivateItem').and.returnValue(true);
            angleStateHandler.UnpublishItem(null, event);

            expect(popup.Confirm).not.toHaveBeenCalled();
            expect(angleStateHandler.ShowPublishingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.UpdateItem).toHaveBeenCalled();
        });

        it("should show confirmation popup before unpublish Angle when user is not Angle's creator", function () {
            spyOn(angleStateHandler, 'CanUserManagePrivateItem').and.returnValue(false);
            angleStateHandler.UnpublishItem(null, event);

            expect(popup.Confirm).toHaveBeenCalled();
            expect(angleStateHandler.ShowPublishingProgressbar).toHaveBeenCalled();
            expect(angleStateHandler.UpdateItem).toHaveBeenCalled();
        });

    });

    describe(".CanUpdateItem", function () {

        beforeEach(function () {
            spyOn(angleStateHandler.Data, 'authorizations').and.callFake(function () { return { update: true }; });
        });

        it("should be possile to update the angle", function () {
            var result = angleStateHandler.CanUpdateItem();
            expect(result).toEqual(true);
        });
       
    });

    describe(".CanSetAllowMoreDetails", function () {
        it("should be possile to set allow more details", function () {
            spyOn(angleInfoModel, 'CanUpdateAngle').and.returnValue(true);
            spyOn(resultModel, 'Data').and.returnValue({ authorizations: { add_filter: false } });
            spyOn(angleInfoModel, 'Data').and.returnValue({ allow_more_details: false });

            var result = angleStateHandler.CanSetAllowMoreDetails();
            expect(result).toEqual(true);
        });

        it("should not be possile to set allow more details", function () {
            spyOn(angleInfoModel, 'CanUpdateAngle').and.returnValue(false);
            spyOn(resultModel, 'Data').and.returnValue({ authorizations: { add_filter: false } });
            spyOn(angleInfoModel, 'Data').and.returnValue({ allow_more_details: false });

            var result = angleStateHandler.CanSetAllowMoreDetails();
            expect(result).toEqual(false);
        });
    });

    describe(".CanSetAllowFollowups", function () {
        it("should be possile to set allow follwup", function () {
            spyOn(angleInfoModel, 'CanUpdateAngle').and.returnValue(true);
            spyOn(resultModel, 'Data').and.returnValue({ authorizations: { add_followup: false } });
            spyOn(angleInfoModel, 'Data').and.returnValue({ allow_followups: false });

            var result = angleStateHandler.CanSetAllowFollowups();
            expect(result).toEqual(true);
        });

        it("should not be possile to set allow follwup", function () {
            spyOn(angleInfoModel, 'CanUpdateAngle').and.returnValue(false);
            spyOn(resultModel, 'Data').and.returnValue({ authorizations: { add_followup: false } });
            spyOn(angleInfoModel, 'Data').and.returnValue({ add_followup: false });

            var result = angleStateHandler.CanSetAllowFollowups();
            expect(result).toEqual(false);
        });
    });

});