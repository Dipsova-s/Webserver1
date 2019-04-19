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

    describe(".GetLastSearchData", function () {

        beforeEach(function () {
            spyOn(userSettingViewModel, 'GetClientSettingByPropertyName').and.returnValue('url_old');
            spyOn(userSettingViewModel, 'GetByName').and.returnValue('{}');
            userModel.Data({ settings: '' });
        });

        var tests = [
            {
                title: 'should not get last search data if it is not search page',
                searchHandler: false,
                settingData: {},
                url: 'url_new',
                expectNull: true
            },
            {
                title: 'should not get last search data if no user setting data',
                searchHandler: true,
                settingData: null,
                url: 'url_new',
                expectNull: true
            },
            {
                title: 'should not get last search data if url is not changed',
                searchHandler: true,
                settingData: {},
                url: 'url_old',
                expectNull: true
            },
            {
                title: 'should get last search data if url is changed',
                searchHandler: true,
                settingData: {},
                url: 'url_new',
                expectNull: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                window.SearchPageHandler = test.searchHandler;
                userSettingViewModel.Data(test.settingData);
                spyOn(jQuery.address, 'value').and.returnValue(test.url);

                var result = userSettingViewModel.GetLastSearchData();
                if (test.expectNull)
                    expect(result).toEqual(null);
                else
                    expect(result).not.toEqual(null);
            });
        });
    });

});
