/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemState/itempublishstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardstateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardpublishstatehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardUserSpecificHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardBusinessProcessHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardTagHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardPageHandler.js" />

describe("DashboardStateHandler", function () {

    var dashboardStateHandler;
    beforeEach(function () {
        dashboardStateHandler = new DashboardStateHandler();
        spyOn(toast, 'MakeSuccessText');
        spyOn(dashboardModel, 'Data').and.callFake(function () {
            return { name: jQuery.noop };
        });
    });

    describe(".CheckShowingPublishSettingsPopup", function () {
        it("should get a confirmation popup", function () {
            spyOn($, 'noop');
            spyOn(popup, 'Confirm');
            spyOn(dashboardPageHandler, 'HasAnyChanged').and.returnValue(true);
            dashboardStateHandler.CheckShowingPublishSettingsPopup($.noop);

            // assert
            expect($.noop).not.toHaveBeenCalled();
            expect(popup.Confirm).toHaveBeenCalled();
        });
        it("should show a popup", function () {
            spyOn($, 'noop');
            spyOn(popup, 'Confirm');
            spyOn(dashboardPageHandler, 'HasAnyChanged').and.returnValue(false);
            dashboardStateHandler.CheckShowingPublishSettingsPopup($.noop);

            // assert
            expect($.noop).toHaveBeenCalled();
            expect(popup.Confirm).not.toHaveBeenCalled();
        });
    });

    describe(".GetPublishSettingsPopupOptions", function () {

        it('should get a new width', function () {
            spyOn(dashboardStateHandler.parent.prototype, 'GetPublishSettingsPopupOptions').and.returnValue({});
            var result = dashboardStateHandler.GetPublishSettingsPopupOptions();

            // assert
            expect(result.width).toEqual(440);
        });

    });

    describe(".ReloadPublishingSettingsData", function () {

        it('should call all functions', function () {
            spyOn(dashboardStateHandler, 'SetDashboardData').and.callFake($.noop);
            spyOn(dashboardStateHandler.parent.prototype, 'ReloadPublishingSettingsData').and.callFake($.noop);
            dashboardStateHandler.ReloadPublishingSettingsData();

            // assert
            expect(dashboardStateHandler.SetDashboardData).toHaveBeenCalled();
            expect(dashboardStateHandler.parent.prototype.ReloadPublishingSettingsData).toHaveBeenCalled();
        });

    });

    describe(".SavePublishSettings", function () {
        var event = { currentTarget: null }; 

        beforeEach(function () {
            spyOn(dashboardStateHandler, 'ShowPublishingProgressbar');
            spyOn(dashboardStateHandler, 'UpdateItem').and.returnValue($.when());
            spyOn(dashboardStateHandler, 'AfterUpdatedDashboard').and.callFake($.noop);
        });

        it("should save publish settings when save data is valid", function () {
            spyOn(dashboardStateHandler, 'CheckSavePublishSettings').and.returnValue(true);

            dashboardStateHandler.SavePublishSettings(null, event);

            expect(dashboardStateHandler.ShowPublishingProgressbar).toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateItem).toHaveBeenCalled();
            expect(dashboardStateHandler.AfterUpdatedDashboard).toHaveBeenCalled();
        });

        it("should not save publish settings when save data is invalid", function () {
            spyOn(dashboardStateHandler, 'CheckSavePublishSettings').and.returnValue(false);

            dashboardStateHandler.SavePublishSettings(null, event);

            expect(dashboardStateHandler.ShowPublishingProgressbar).not.toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateItem).not.toHaveBeenCalled();
            expect(dashboardStateHandler.AfterUpdatedDashboard).not.toHaveBeenCalled();
        });

    });

    describe(".CheckPublishItem", function () {

        it('should get false and call all functions', function () {
            spyOn(dashboardStateHandler, 'CheckSavePublishSettings').and.returnValue(false);
            spyOn(dashboardStateHandler, 'CheckWidgets').and.returnValue(false);

            // act
            var result = dashboardStateHandler.CheckPublishItem();

            // assert
            expect(result).toEqual(false);
            expect(dashboardStateHandler.CheckSavePublishSettings).toHaveBeenCalled();
            expect(dashboardStateHandler.CheckWidgets).toHaveBeenCalled();
        });

        it('should get true and call all functions', function () {
            spyOn(dashboardStateHandler, 'CheckSavePublishSettings').and.returnValue(true);
            spyOn(dashboardStateHandler, 'CheckWidgets').and.returnValue(true);

            // act
            var result = dashboardStateHandler.CheckPublishItem();

            // assert
            expect(result).toEqual(true);
            expect(dashboardStateHandler.CheckSavePublishSettings).toHaveBeenCalled();
            expect(dashboardStateHandler.CheckWidgets).toHaveBeenCalled();
        });

    });

    describe(".CheckWidgets", function () {

        it('should get false and update html element', function (done) {
            spyOn(dashboardStateHandler, 'HasPrivateDisplays').and.returnValue(true);
            spyOn($.fn, 'is').and.returnValue(true);
            spyOn($.fn, 'trigger');
            spyOn($.fn, 'addClass');
            spyOn($.fn, 'removeClass');

            // act
            var result = dashboardStateHandler.CheckWidgets();

            // assert
            expect(result).toEqual(false);
            expect($.fn.trigger).toHaveBeenCalled();
            expect($.fn.addClass).toHaveBeenCalled();
            expect($.fn.removeClass).not.toHaveBeenCalled();
            setTimeout(function () {
                expect($.fn.removeClass).toHaveBeenCalled();
                done();
            }, 1500);
        });

        it('should get true', function () {
            spyOn(dashboardStateHandler, 'HasPrivateDisplays').and.returnValue(false);

            // act
            var result = dashboardStateHandler.CheckWidgets();

            // assert
            expect(result).toEqual(true);
        });

    });

    describe(".PublishItem", function () {
        var event = { currentTarget: null };
        beforeEach(function () {
            spyOn(dashboardStateHandler, 'UpdateItem').and.callFake($.when);
            spyOn(dashboardStateHandler, 'UpdateState').and.callFake($.when);
            spyOn(dashboardStateHandler, 'AfterUpdatedDashboard').and.callFake($.noop);
        });


        it("should publish Dashboard when values is valid", function () {
            spyOn(dashboardStateHandler, 'CheckPublishItem').and.returnValue(true);
            dashboardStateHandler.PublishItem(null, event);
            
            expect(dashboardStateHandler.UpdateItem).toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateState).toHaveBeenCalled();
            expect(dashboardStateHandler.AfterUpdatedDashboard).toHaveBeenCalled();
        });

        it("should not publish Angle when values is invalid", function () {
            spyOn(dashboardStateHandler, 'CheckPublishItem').and.returnValue(false);
            dashboardStateHandler.PublishItem(null, event);
            
            expect(dashboardStateHandler.UpdateItem).not.toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateState).not.toHaveBeenCalled();
            expect(dashboardStateHandler.AfterUpdatedDashboard).not.toHaveBeenCalled();
        });

    });

    describe(".UnpublishItem", function () {
        var event = { currentTarget: null };
        beforeEach(function () {
            spyOn(popup, 'Confirm').and.callFake(function (message, callback) {
                callback();
            });
            spyOn(dashboardStateHandler, 'UpdateItem').and.callFake($.when);
            spyOn(dashboardStateHandler, 'UpdateState').and.callFake($.when);
            spyOn(dashboardStateHandler, 'AfterUpdatedDashboard').and.callFake($.noop);
            spyOn(dashboardPageHandler, 'BackToSearch').and.callFake($.noop);
        });

        it("should unpublish Angle when user is Dashboard's creator", function () {
            spyOn(dashboardStateHandler, 'CanUserManagePrivateItem').and.returnValue(true);
            dashboardStateHandler.UnpublishItem(null, event);

            expect(popup.Confirm).not.toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateItem).toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateState).toHaveBeenCalled();
            expect(dashboardStateHandler.AfterUpdatedDashboard).toHaveBeenCalled();
            expect(dashboardPageHandler.BackToSearch).not.toHaveBeenCalled();
        });

        it("should show confirmation popup before unpublish Dashboard when user is not a creator", function () {
            spyOn(dashboardStateHandler, 'CanUserManagePrivateItem').and.returnValue(false);
            dashboardStateHandler.UnpublishItem(null, event);

            expect(popup.Confirm).toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateItem).toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateState).toHaveBeenCalled();
            expect(dashboardStateHandler.AfterUpdatedDashboard).toHaveBeenCalled();
            expect(dashboardPageHandler.BackToSearch).toHaveBeenCalled();
        });

    });

    describe(".UpdateItem", function () {
        it("should save", function () {
            spyOn(dashboardStateHandler, 'GetUpdatedPublishSettingsData');
            spyOn(dashboardStateHandler, 'Update');

            // act
            dashboardStateHandler.UpdateItem();

            // assert
            expect(dashboardStateHandler.Update).toHaveBeenCalled();
        });
    });

    describe(".UpdatePublishState", function () {

        it("should call all functions", function () {
            var event = { currentTarget: null };
            spyOn(dashboardStateHandler, 'ShowPublishingProgressbar').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'UpdateItem').and.callFake($.when);
            spyOn(dashboardStateHandler, 'UpdateState').and.callFake($.when);
            spyOn(dashboardStateHandler, 'AfterUpdatedDashboard').and.callFake($.noop);

            // act
            dashboardStateHandler.UpdatePublishState(null, event);

            // assert
            expect(dashboardStateHandler.ShowPublishingProgressbar).toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateItem).toHaveBeenCalled();
            expect(dashboardStateHandler.UpdateState).toHaveBeenCalled();
            expect(dashboardStateHandler.AfterUpdatedDashboard).toHaveBeenCalled();
        });
       
    });

    describe(".AfterUpdatedDashboard", function () {

        it("should call all functions", function () {
            var event = { currentTarget: null };
            dashboardPageHandler.DashboardModel = dashboardModel;
            spyOn(dashboardPageHandler.DashboardModel, 'SetData').and.callFake($.noop);
            spyOn(dashboardModel, 'GetData').and.returnValue({});
            spyOn(dashboardPageHandler, 'ApplyBindingHandler').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'HidePublishingProgressbar').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'ClosePublishSettingsPopup').and.callFake($.noop);

            // act
            dashboardStateHandler.AfterUpdatedDashboard(event);

            // assert
            expect(dashboardPageHandler.DashboardModel.SetData).toHaveBeenCalled();
            expect(dashboardPageHandler.ApplyBindingHandler).toHaveBeenCalled();
            expect(dashboardStateHandler.HidePublishingProgressbar).toHaveBeenCalled();
            expect(dashboardStateHandler.ClosePublishSettingsPopup).toHaveBeenCalled();
        });

    });

    describe(".HasPrivateDisplays", function () {

        it("should get true", function () {
            dashboardStateHandler.Widgets([
                { is_public: true },
                { is_public: false }
            ]);

            // act
            var result = dashboardStateHandler.HasPrivateDisplays();

            // assert
            expect(result).toEqual(true);
        });

        it("should get false", function () {
            dashboardStateHandler.Widgets([
                { is_public: true },
                { is_public: true }
            ]);

            // act
            var result = dashboardStateHandler.HasPrivateDisplays();

            // assert
            expect(result).toEqual(false);
        });

    });

    describe(".ShowWidgetDefinition", function () {

        it("should call all functions", function () {
            spyOn(dashboardStateHandler, 'ClosePublishSettingsPopup');
            spyOn(dashboardPageHandler.HandlerSidePanel, 'SelectTab');

            // act
            dashboardStateHandler.ShowWidgetDefinition();

            // assert
            expect(dashboardStateHandler.ClosePublishSettingsPopup).toHaveBeenCalled();
            expect(dashboardPageHandler.HandlerSidePanel.SelectTab).toHaveBeenCalled();
        });

    });
});