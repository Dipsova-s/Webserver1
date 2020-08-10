/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itempublishstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/anglestateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/anglestatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/anglepublishstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleActionMenuHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSaveActionHandler.js" />

describe("AngleStateHandler", function () {

    var angleStateHandler;
    beforeEach(function () {
        angleStateHandler = new AngleStateHandler();
        createMockHandler(window, 'anglePageHandler', {
            ExecuteAngle: $.noop,
            HandlerAngle: {
                GetData: $.noop,
                ConfirmSave: $.noop
            },
            HasAnyChanged: $.noop
        });
    });

    afterEach(function () {
        restoreMockHandlers();
    });

    describe(".CheckShowingPublishSettingsPopup", function () {
        it("should get a confirmation popup", function () {
            spyOn($, 'noop');
            spyOn(popup, 'Confirm');
            spyOn(anglePageHandler, 'HasAnyChanged').and.returnValue(true);
            angleStateHandler.CheckShowingPublishSettingsPopup($.noop);

            // assert
            expect($.noop).not.toHaveBeenCalled();
            expect(popup.Confirm).toHaveBeenCalled();
        });
        it("should show a popup", function () {
            spyOn($, 'noop');
            spyOn(popup, 'Confirm');
            spyOn(anglePageHandler, 'HasAnyChanged').and.returnValue(false);
            angleStateHandler.CheckShowingPublishSettingsPopup($.noop);

            // assert
            expect($.noop).toHaveBeenCalled();
            expect(popup.Confirm).not.toHaveBeenCalled();
        });
    });

    describe(".ReloadPublishingSettingsData", function () {
        it('should call all functions', function () {
            spyOn(angleStateHandler, 'SetAngleData').and.callFake($.noop);
            spyOn(anglePageHandler.HandlerAngle, 'GetData');
            spyOn(angleStateHandler.parent.prototype, 'ReloadPublishingSettingsData').and.callFake($.noop);
            angleStateHandler.ReloadPublishingSettingsData();

            // assert
            expect(anglePageHandler.HandlerAngle.GetData).toHaveBeenCalled();
            expect(angleStateHandler.SetAngleData).toHaveBeenCalled();
            expect(angleStateHandler.parent.prototype.ReloadPublishingSettingsData).toHaveBeenCalled();
        });

        it('should set all display to be public when angle is not published', function () {
            spyOn(angleStateHandler, 'SetAngleData').and.callFake($.noop);
            spyOn(anglePageHandler.HandlerAngle, 'GetData');
            spyOn(angleStateHandler.parent.prototype, 'ReloadPublishingSettingsData').and.callFake($.noop);

            spyOn(angleStateHandler.Data, 'is_published').and.returnValue(false);

            var displays = [
                { is_public: ko.observable(false) },
                { is_public: ko.observable(false) }
            ];
            spyOn(angleStateHandler, 'Displays').and.returnValue(displays);

            angleStateHandler.ReloadPublishingSettingsData(true);
            expect(anglePageHandler.HandlerAngle.GetData).toHaveBeenCalled();
            expect(displays[0].is_public()).toBe(true);
            expect(displays[1].is_public()).toBe(true);
        });

    });

    describe(".GetPublishDisplaysData", function () {

        beforeEach(function () {
            spyOn(angleStateHandler, 'Displays').and.callFake(function () {
                return [
                    { is_angle_default: function () { return true; }, state: '/models/1/angles/1/displays/1/state', is_public: function () { return false; } },
                    { is_angle_default: function () { return false; }, state: '/models/1/angles/1/displays/2/state', is_public: function () { return false; } },
                    { is_angle_default: function () { return false; }, state: '/models/1/angles/1/displays/3/state', is_public: function () { return false; } }
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
            spyOn(angleStateHandler.parent.prototype, 'GetPublishSettingsData').and.returnValue({});
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
            expect(result).toContain('validWarning');
        });

    });

    describe(".SavePublishSettings", function () {
        var event = { currentTarget: null };

        beforeEach(function () {
            spyOn(angleStateHandler, 'GetUpdatedPublishSettingsData').and.callFake(function () {
                return { display_definitions: [] };
            });
            spyOn(anglePageHandler.HandlerAngle, 'ConfirmSave');
        });

        it("should save publish settings when save data is valid", function () {
            spyOn(angleStateHandler, 'CheckSavePublishSettings').and.callFake(function () {
                return true;
            });
            angleStateHandler.SavePublishSettings(null, event);

            expect(angleStateHandler.GetUpdatedPublishSettingsData).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.ConfirmSave).toHaveBeenCalled();
        });

        it("should not save publish settings when save data is invalid", function () {
            spyOn(angleStateHandler, 'CheckSavePublishSettings').and.callFake(function () {
                return false;
            });

            angleStateHandler.SavePublishSettings(null, event);

            expect(angleStateHandler.GetUpdatedPublishSettingsData).not.toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.ConfirmSave).not.toHaveBeenCalled();
        });

    });

    describe(".PublishItem", function () {
        var event = { currentTarget: null };

        beforeEach(function () {
            spyOn(anglePageHandler.HandlerAngle, 'ConfirmSave');
        });


        it("should publish Angle when values is valid", function () {
            spyOn(angleStateHandler, 'CheckPublishItem').and.callFake(function () {
                return true;
            });
            angleStateHandler.PublishItem(null, event);
            
            expect(anglePageHandler.HandlerAngle.ConfirmSave).toHaveBeenCalled();
        });

        it("should not publish Angle when values is invalid", function () {
            spyOn(angleStateHandler, 'CheckPublishItem').and.callFake(function () {
                return false;
            });
            angleStateHandler.PublishItem(null, event);
            
            expect(anglePageHandler.HandlerAngle.ConfirmSave).not.toHaveBeenCalled();
        });

    });

    describe(".UnpublishItem", function () {
        var event = { currentTarget: null };

        beforeEach(function () {
            spyOn(popup, 'Confirm').and.callFake(function (message, callback) {
                callback();
            });
            spyOn(anglePageHandler.HandlerAngle, 'ConfirmSave');
        });

        it("should unpublish Angle when user is Angle's creator", function () {
            spyOn(angleStateHandler, 'CanUserManagePrivateItem').and.returnValue(true);
            angleStateHandler.UnpublishItem(null, event);

            expect(popup.Confirm).not.toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.ConfirmSave).toHaveBeenCalled();
        });

        it("should show confirmation popup before unpublish Angle when user is not Angle's creator", function () {
            spyOn(angleStateHandler, 'CanUserManagePrivateItem').and.returnValue(false);
            angleStateHandler.UnpublishItem(null, event);

            expect(popup.Confirm).toHaveBeenCalled();
            expect(anglePageHandler.HandlerAngle.ConfirmSave).toHaveBeenCalled();
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
        it("can set allow more details", function () {
            angleStateHandler.Data.authorizations().update = true;
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(true);

            var result = angleStateHandler.CanSetAllowMoreDetails();
            expect(result).toEqual(true);
        });
        it("cannot set allow more details (update=false)", function () {
            angleStateHandler.Data.authorizations().update = false;
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(true);

            var result = angleStateHandler.CanSetAllowMoreDetails();
            expect(result).toEqual(false);
        });
        it("cannot set allow more details (AllowMoreDetails=false)", function () {
            angleStateHandler.Data.authorizations().update = true;
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(false);

            var result = angleStateHandler.CanSetAllowMoreDetails();
            expect(result).toEqual(false);
        });
    });

    describe(".CanSetAllowFollowups", function () {
        it("cal set allow followups", function () {
            angleStateHandler.Data.authorizations().update = true;
            angleStateHandler.Data.not_allow_more_details(false);
            spyOn(privilegesViewModel, 'AllowFollowups').and.returnValue(true);

            var result = angleStateHandler.CanSetAllowFollowups();
            expect(result).toEqual(true);
        });
        it("cannot set allow followups (update=false)", function () {
            angleStateHandler.Data.authorizations().update = false;
            angleStateHandler.Data.not_allow_more_details(false);
            spyOn(privilegesViewModel, 'AllowFollowups').and.returnValue(true);

            var result = angleStateHandler.CanSetAllowFollowups();
            expect(result).toEqual(false);
        });
        it("cannot set allow followups (not_allow_more_details=true)", function () {
            angleStateHandler.Data.authorizations().update = true;
            angleStateHandler.Data.not_allow_more_details(true);
            spyOn(privilegesViewModel, 'AllowFollowups').and.returnValue(true);

            var result = angleStateHandler.CanSetAllowFollowups();
            expect(result).toEqual(false);
        });
        it("cannot set allow followups (AllowFollowups=false)", function () {
            angleStateHandler.Data.authorizations().update = true;
            angleStateHandler.Data.not_allow_more_details(false);
            spyOn(privilegesViewModel, 'AllowFollowups').and.returnValue(false);

            var result = angleStateHandler.CanSetAllowFollowups();
            expect(result).toEqual(false);
        });
    });

});