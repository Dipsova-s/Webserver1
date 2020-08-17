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

    describe(".GetClientSettingsData", function () {
        beforeEach(function () {
            window.searchPageHandler = {};
            spyOn(userSettingViewModel, 'GetClientSettingByPropertyName').and.returnValue('url_old');
            spyOn(userSettingViewModel, 'GetByName').and.returnValue('{}');
            userModel.Data({ settings: '' });
        });
        var tests = [
            {
                title: 'should not get client settings data if it is not search page',
                searchHandler: false,
                settingData: {},
                url: 'url_new',
                searchTerms: ['searchTerms'],
                expectNull: true
            },
            {
                title: 'should not get client settings data if no user setting data',
                searchHandler: true,
                settingData: null,
                url: 'url_new',
                searchTerms: ['searchTerms'],
                expectNull: true
            },
            {
                title: 'should not get client settings data if url and search terms are not changed',
                searchHandler: true,
                settingData: {},
                url: 'url_old',
                searchTerms: ['searchTerms'],
                expectNull: true
            },
            {
                title: 'should not get client settings data if no url and search terms is not changed',
                searchHandler: true,
                settingData: {},
                url: '/',
                searchTerms: ['searchTerms'],
                expectNull: true
            },
            {
                title: 'should get client settings',
                searchHandler: true,
                settingData: {},
                url: 'url_new',
                searchTerms: ['searchTerms'],
                expectNull: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                window.SearchPageHandler = test.searchHandler;
                window.searchPageHandler.SearchTerms = test.searchTerms;
                
                userSettingViewModel.Data(test.settingData);
                spyOn(jQuery.address, 'value').and.returnValue(test.url);
                
                spyOn(userSettingViewModel, 'GetSearchTerms').and.returnValue(test.searchTerms);

                var result = userSettingViewModel.GetClientSettingsData();
                if (test.expectNull)
                    expect(result).toEqual(null);
                else
                    expect(result).not.toEqual(null);
            });
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

    describe(".GetSearchTerms", function () {
        it("should return empty search terms", function () {
            spyOn(userSettingViewModel, 'GetClientSettingByPropertyName').and.returnValue(null);
            expect(userSettingViewModel.GetSearchTerms()).toEqual([]);
        });
        it("should return value search terms", function () {
            spyOn(userSettingViewModel, 'GetClientSettingByPropertyName').and.returnValue(["Analyze your payment behaviour","Angle For Allow Obtain More Details Test","Dashboard","General","Test"]);
            expect(userSettingViewModel.GetSearchTerms()).not.toEqual([]);
        });
    });

    describe(".InitialSidePanelSettingsData", function () {
        it("should set SidePanelSettingsData", function () {
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
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE]).toEqual(310);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_TAB]).toEqual(0);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_ACCORDIONS]).toEqual({ definition: true, description: true, label: true });
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_PANEL_ACCORDIONS]).toEqual({ definition: true, aggregation: true, description: true });

            //search
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.SEARCH_PANEL_COLLAPSED]).toEqual(false);

            //dashboard sidebar
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_COLLAPSED]).toEqual(false);
            expect(result[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE]).toEqual(310);
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
        var element;
        beforeEach(function () {
            element = $('<div class="content-wrapper" />').appendTo('body');
            spyOn(userSettingViewModel, 'GetClientSettings').and.returnValue({});
            userModel.Data({ user_settings: '/users/1/settings' });
        });
        afterEach(function () {
            element.remove();
        });
        
        it("should get null if no content-wrapper element", function () {
            var settings = {};
            spyOn(userSettingViewModel, 'GetSidePanelSettings').and.returnValue(settings);
            userSettingViewModel.SidePanelSettingsData = { test: 1 };
            element.remove();
            var result = userSettingViewModel.GetSidePanelSettingsData();

            expect(result).toEqual(null);
        });

        it("should get null if no changes", function () {
            var settings = {};
            spyOn(userSettingViewModel, 'GetSidePanelSettings').and.returnValue(settings);
            userSettingViewModel.SidePanelSettingsData = {};
            var result = userSettingViewModel.GetSidePanelSettingsData();

            expect(result).toEqual(null);
        });

        it("should get data if have some changes", function () {
            var settings = {};
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_COLLAPSED] = true;
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE] = 320;
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_TAB] = 1;
            spyOn(userSettingViewModel, 'GetSidePanelSettings').and.returnValue(settings);
            userSettingViewModel.SidePanelSettingsData = {};
            var result = userSettingViewModel.GetSidePanelSettingsData();

            expect(result).not.toEqual(null);
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
