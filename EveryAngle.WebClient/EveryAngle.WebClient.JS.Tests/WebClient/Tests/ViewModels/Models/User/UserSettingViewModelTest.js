/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />

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

});
