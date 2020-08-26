/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usermodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usersettingmodel.js" />

describe("UserSettingViewModel", function () {
    var userSettingViewModel;
    beforeEach(function () {
        userSettingViewModel = new UserSettingViewModel();
    });

    describe(".GetUserLocalCultureName", function () {
        it("should get culture name from default language", function () {
            spyOn(userSettingModel, "GetByName").and.callFake(function (value) {
                if (value === enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES)
                    return 'nl';
                if (value === enumHandlers.USERSETTINGS.FORMAT_LOCALE)
                    return 'en';
            });
            var cultureName = userSettingViewModel.GetUserLocalCultureName();
            expect(cultureName).toEqual('nl');
        });
    });
    describe(".UpdateClientSettings", function () {
        it("should not update to storage if no data", function () {
            spyOn(userSettingViewModel, "Data").and.returnValue(null);
            spyOn(userSettingViewModel, "LoadSuccess");
            userSettingViewModel.UpdateClientSettings({});
            expect(userSettingViewModel.LoadSuccess).not.toHaveBeenCalled();
        });
        it("should update to storage if has data", function () {
            spyOn(userSettingViewModel, "Data").and.returnValue({});
            spyOn(userSettingViewModel, "LoadSuccess");
            userSettingViewModel.UpdateClientSettings({});
            expect(userSettingViewModel.LoadSuccess).toHaveBeenCalled();
        });
    });
    describe(".GetClientSettingsData", function () {
        it("should get null (no data)", function () {
            userSettingViewModel.Data(null);

            var result = userSettingViewModel.GetClientSettingsData();
            expect(result).toEqual(null);
        });
        it("should get null (bo changes)", function () {
            userSettingViewModel.Data({});
            spyOn(userSettingViewModel, 'GetSearchPageClientSettingsData').and.returnValue({});
            spyOn(userSettingViewModel, 'GetAnglePageClientSettingsData').and.returnValue({});
            spyOn(userSettingViewModel, 'GetDashboardPageClientSettingsData').and.returnValue({});

            var result = userSettingViewModel.GetClientSettingsData();
            expect(result).toEqual(null);
        });
        it("should get data", function () {
            userModel.Data({});
            userSettingViewModel.Data({});
            spyOn(userSettingViewModel, 'GetSearchPageClientSettingsData').and.returnValue({ search_setting: 'any' });
            spyOn(userSettingViewModel, 'GetAnglePageClientSettingsData').and.returnValue({ angle_setting: 'any' });
            spyOn(userSettingViewModel, 'GetDashboardPageClientSettingsData').and.returnValue({ dashboard_setting: 'any' });

            var result = userSettingViewModel.GetClientSettingsData();
            expect(result).not.toEqual(null);
        });
    });

    describe(".GetSearchPageClientSettingsData", function () {
        beforeEach(function () {
            window._SearchPageHandler = window.SearchPageHandler;
            spyOn(userSettingViewModel, 'GetLastSearchSettingsData').and.returnValue({ last_search: 'any' });
            spyOn(userSettingViewModel, 'GetSearchTermSettingsData').and.returnValue({ search_term: 'any' });
            spyOn(userSettingViewModel, 'GetSidePanelSettingsData').and.returnValue({ side_panel: 'any' });
        });
        afterEach(function () {
            window.SearchPageHandler = window._SearchPageHandler;
            delete window._SearchPageHandler;
        });
        it("should not get data", function () {
            window.SearchPageHandler = null;
            var result = userSettingViewModel.GetSearchPageClientSettingsData();
            expect(result).toEqual({});
        });
        it("should get data", function () {
            window.SearchPageHandler = $.noop;
            var result = userSettingViewModel.GetSearchPageClientSettingsData();
            expect(result).toEqual({ last_search: 'any', search_term: 'any', side_panel: 'any' });
        });
    });
    describe(".GetLastSearchSettingsData", function () {
        it("should not get data (no changes)", function () {
            spyOn(jQuery.address, 'value').and.returnValue('url1');
            spyOn(userSettingViewModel, 'GetClientSettingByPropertyName').and.returnValue('url1');
            var result = userSettingViewModel.GetLastSearchSettingsData();

            expect(result).toEqual({});
        });
        it("should not get data (url = '/')", function () {
            spyOn(jQuery.address, 'value').and.returnValue('\/');
            spyOn(userSettingViewModel, 'GetClientSettingByPropertyName').and.returnValue('url1');
            var result = userSettingViewModel.GetLastSearchSettingsData();

            expect(result).toEqual({});
        });
        it("should get data", function () {
            spyOn(jQuery.address, 'value').and.returnValue('url2');
            spyOn(userSettingViewModel, 'GetClientSettingByPropertyName').and.returnValue('url1');
            var result = userSettingViewModel.GetLastSearchSettingsData();

            expect(result).toEqual({ last_search_url: 'url2' });
        });
    });
    describe(".GetSearchTermSettingsData", function () {
        beforeEach(function () {
            createMockHandler(window, 'searchPageHandler', {
                SearchTerms: []
            });
            searchPageHandler.SearchTerms = ['term1', 'term2'];
        });
        afterEach(function () {
            restoreMockHandler('searchPageHandler');
        });
        it("should not get data", function () {
            spyOn(userSettingViewModel, 'GetSearchTerms').and.returnValue(['term1', 'term2']);
            var result = userSettingViewModel.GetSearchTermSettingsData();

            expect(result).toEqual({});
        });
        it("should get data", function () {
            spyOn(userSettingViewModel, 'GetSearchTerms').and.returnValue([]);
            var result = userSettingViewModel.GetSearchTermSettingsData();

            expect(result).toEqual({ search_terms: ['term1', 'term2'] });
        });
    });
    describe(".GetSearchTerms", function () {
        it("should return empty search terms", function () {
            spyOn(userSettingViewModel, 'GetClientSettingByPropertyName').and.returnValue(null);
            expect(userSettingViewModel.GetSearchTerms()).toEqual([]);
        });
        it("should return value search terms", function () {
            spyOn(userSettingViewModel, 'GetClientSettingByPropertyName').and.returnValue(["Analyze your payment behaviour", "Angle For Allow Obtain More Details Test", "Dashboard", "General", "Test"]);
            expect(userSettingViewModel.GetSearchTerms()).not.toEqual([]);
        });
    });

    describe(".GetAnglePageClientSettingsData", function () {
        beforeEach(function () {
            window._AnglePageHandler = window.AnglePageHandler;
            spyOn(userSettingViewModel, 'GetDisplayGroupSettingsData').and.returnValue({ display_group: 'any' });
            spyOn(userSettingViewModel, 'GetSidePanelSettingsData').and.returnValue({ side_panel: 'any' });
        });
        afterEach(function () {
            window.AnglePageHandler = window._AnglePageHandler;
            delete window._AnglePageHandler;
        });
        it("should not get data", function () {
            window.AnglePageHandler = null;
            var result = userSettingViewModel.GetAnglePageClientSettingsData();
            expect(result).toEqual({});
        });
        it("should get data", function () {
            window.AnglePageHandler = $.noop;
            var result = userSettingViewModel.GetAnglePageClientSettingsData();
            expect(result).toEqual({ display_group: 'any', side_panel: 'any' });
        });
    });
    describe(".InitialDisplayGroupSettingsData", function () {
        it("should initial", function () {
            spyOn(userSettingViewModel, 'GetDisplayGroupSettings').and.returnValue('test');
            userSettingViewModel.InitialDisplayGroupSettingsData();

            expect(userSettingViewModel.DisplayGroupSettingsData).toEqual('test');
        });
    });
    describe(".GetDisplayGroupSettingsData", function () {
        beforeEach(function () {
            $('<div class="tab-menu-header"/>').appendTo('body');
            userSettingViewModel.DisplayGroupSettingsData = { settings: 'new' };
        });
        afterEach(function () {
            $('.tab-menu-header').remove();
        });
        it("should not get data (no tab-menu-header element)", function () {
            $('.tab-menu-header').remove();
            spyOn(userSettingViewModel, 'GetDisplayGroupSettings').and.returnValue({ settings: 'any' });
            var result = userSettingViewModel.GetDisplayGroupSettingsData();

            expect(result).toEqual({});
        });
        it("should not get data (no changes)", function () {
            spyOn(userSettingViewModel, 'GetDisplayGroupSettings').and.returnValue({ settings: 'new' });
            var result = userSettingViewModel.GetDisplayGroupSettingsData();

            expect(result).toEqual({});
        });
        it("should get data", function () {
            spyOn(userSettingViewModel, 'GetDisplayGroupSettings').and.returnValue({ settings: 'any' });
            var result = userSettingViewModel.GetDisplayGroupSettingsData();

            expect(result).toEqual({ settings: 'new' });
        });
    });
    describe(".GetDisplayGroupSettings", function () {
        it("should get settings", function () {
            spyOn(userSettingViewModel, 'GetClientSettings').and.returnValue({ display_group_private: true });
            var result = userSettingViewModel.GetDisplayGroupSettings();

            expect(result).toEqual({ display_group_public: true, display_group_private: true, display_group_other: false });
        });
    });
    describe(".SetDisplayGroupSettings", function () {
        it("should set data", function () {
            userSettingViewModel.DisplayGroupSettingsData = {
                display_group_public: true,
                display_group_private: false,
                display_group_other: false
            };
            userSettingViewModel.SetDisplayGroupSettings('display_group_public', false);
            userSettingViewModel.SetDisplayGroupSettings('display_group_private', true);
            userSettingViewModel.SetDisplayGroupSettings('display_group_other', false);

            expect(userSettingViewModel.DisplayGroupSettingsData).toEqual({
                display_group_public: false,
                display_group_private: true,
                display_group_other: false
            });
        });
    });

    describe(".GetDashboardPageClientSettingsData", function () {
        beforeEach(function () {
            window._DashboardPageHandler = window.DashboardPageHandler;
            spyOn(userSettingViewModel, 'GetSidePanelSettingsData').and.returnValue({ side_panel: 'any' });
        });
        afterEach(function () {
            window.DashboardPageHandler = window._DashboardPageHandler;
            delete window._DashboardPageHandler;
        });
        it("should not get data", function () {
            window.DashboardPageHandler = null;
            var result = userSettingViewModel.GetDashboardPageClientSettingsData();
            expect(result).toEqual({});
        });
        it("should get data", function () {
            window.DashboardPageHandler = $.noop;
            var result = userSettingViewModel.GetDashboardPageClientSettingsData();
            expect(result).toEqual({ side_panel: 'any' });
        });
    });

    describe(".InitialSidePanelSettingsData", function () {
        it("should initial", function () {
            spyOn(userSettingViewModel, 'GetSidePanelSettings').and.returnValue('test');
            userSettingViewModel.InitialSidePanelSettingsData();

            expect(userSettingViewModel.SidePanelSettingsData).toEqual('test');
        });
    });
    describe(".GetSidePanelSettings", function () {
        it("should get a default values", function () {
            var settings = {};
            spyOn(userSettingViewModel, 'GetClientSettings').and.returnValue(settings);
            var result = userSettingViewModel.GetSidePanelSettings();

            //angle sidebar
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_COLLAPSED]).toEqual(false);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE]).toEqual(320);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_TAB]).toEqual(0);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_ACCORDIONS]).toEqual({ definition: true, description: true, label: true });
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_PANEL_ACCORDIONS]).toEqual({ definition: true, aggregation: true, description: true });

            //search
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.SEARCH_PANEL_COLLAPSED]).toEqual(false);

            //dashboard sidebar
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_COLLAPSED]).toEqual(false);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE]).toEqual(320);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_TAB]).toEqual(0);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_ACCORDIONS]).toEqual({ definition: true, description: true, label: true });
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.WIDGET_PANEL_ACCORDIONS]).toEqual({ definition: true });
        });

        it("should get a saved values", function () {
            var settings = {};
            //angle sidebar
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_COLLAPSED] = true;
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE] = 320;
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_TAB] = 1;
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_ACCORDIONS] = { definition: true, description: false, label: true };
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_PANEL_ACCORDIONS] = { definition: true, aggregation: false, description: true };

            //search
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SEARCH_PANEL_COLLAPSED] = true;

            //dashboard sidebar
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_COLLAPSED] = true;
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE] = 400;
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_TAB] = 0;
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_ACCORDIONS] = { definition: true, description: false, label: true };
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.WIDGET_PANEL_ACCORDIONS] = { definition: false };

            spyOn(userSettingViewModel, 'GetClientSettings').and.returnValue(settings);
            var result = userSettingViewModel.GetSidePanelSettings();

            // angle sidebar
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_COLLAPSED]).toEqual(true);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE]).toEqual(320);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_TAB]).toEqual(1);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_ACCORDIONS]).toEqual({ definition: true, description: false, label: true });
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_PANEL_ACCORDIONS]).toEqual({ definition: true, aggregation: false, description: true });

            // search sidebar
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.SEARCH_PANEL_COLLAPSED]).toEqual(true);

            // dashboar sidebar
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_COLLAPSED]).toEqual(true);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE]).toEqual(400);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_TAB]).toEqual(0);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_ACCORDIONS]).toEqual({ definition: true, description: false, label: true });
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.WIDGET_PANEL_ACCORDIONS]).toEqual({ definition: false });
        });
    });
    describe(".SetSidePanelSettings", function () {
        it("should set a setting", function () {
            userSettingViewModel.SetSidePanelSettings('test', 'hello');

            expect(userSettingViewModel.SidePanelSettingsData['test']).toEqual('hello');
        });

        it("should check before set size", function () {
            userSettingViewModel.SetSidePanelSettings(enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE, 100);
            userSettingViewModel.SetSidePanelSettings(enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE, 50);

            expect(userSettingViewModel.SidePanelSettingsData[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE]).toEqual(userSettingViewModel.MinSidePanelSize);
            expect(userSettingViewModel.SidePanelSettingsData[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE]).toEqual(userSettingViewModel.MinSidePanelSize);
        });
    });

    describe(".GetSidePanelSettingsData", function () {
        beforeEach(function () {
            $('<div class="content-wrapper"/>').appendTo('body');
            userSettingViewModel.SidePanelSettingsData = { settings: 'new' };
        });
        afterEach(function () {
            $('.content-wrapper').remove();
        });
        it("should not get data (no tab-menu-header element)", function () {
            $('.content-wrapper').remove();
            spyOn(userSettingViewModel, 'GetSidePanelSettings').and.returnValue({ settings: 'any' });
            var result = userSettingViewModel.GetSidePanelSettingsData();

            expect(result).toEqual({});
        });
        it("should not get data (no changes)", function () {
            spyOn(userSettingViewModel, 'GetSidePanelSettings').and.returnValue({ settings: 'new' });
            var result = userSettingViewModel.GetSidePanelSettingsData();

            expect(result).toEqual({});
        });
        it("should get data", function () {
            spyOn(userSettingViewModel, 'GetSidePanelSettings').and.returnValue({ settings: 'any' });
            var result = userSettingViewModel.GetSidePanelSettingsData();

            expect(result).toEqual({ settings: 'new' });
        });
    });

    describe(".GetDefaultAnglePanelAccordions", function () {
        it("should get default values", function () {
            // prepare
            var result = userSettingViewModel.GetDefaultAnglePanelAccordions();

            // assert
            expect(Object.keys(result).length).toEqual(3);
            expect(result[enumHandlers.ACCORDION.DEFINITION]).toEqual(true);
            expect(result[enumHandlers.ACCORDION.DESCRIPTION]).toEqual(true);
            expect(result[enumHandlers.ACCORDION.LABEL]).toEqual(true);
        });
    });

    describe(".GetDefaultDisplayPanelAccordions", function () {
        it("should get default values", function () {
            // prepare
            var result = userSettingViewModel.GetDefaultDisplayPanelAccordions();

            // assert
            expect(Object.keys(result).length).toEqual(3);
            expect(result[enumHandlers.ACCORDION.DEFINITION]).toEqual(true);
            expect(result[enumHandlers.ACCORDION.AGGREGATION]).toEqual(true);
            expect(result[enumHandlers.ACCORDION.DESCRIPTION]).toEqual(true);
        });
    });

    describe(".GetDefaultDashboardPanelAccordions", function () {
        it("should get default values", function () {
            // prepare
            var result = userSettingViewModel.GetDefaultDashboardPanelAccordions();

            // assert
            expect(Object.keys(result).length).toEqual(3);
            expect(result[enumHandlers.ACCORDION.DEFINITION]).toEqual(true);
            expect(result[enumHandlers.ACCORDION.DESCRIPTION]).toEqual(true);
            expect(result[enumHandlers.ACCORDION.LABEL]).toEqual(true);
        });
    });

    describe(".GetDefaultWidgetPanelAccordions", function () {
        it("should get default values", function () {
            // prepare
            var result = userSettingViewModel.GetDefaultWidgetPanelAccordions();

            // assert
            expect(Object.keys(result).length).toEqual(1);
            expect(result[enumHandlers.ACCORDION.DEFINITION]).toEqual(true);
        });
    });
});
