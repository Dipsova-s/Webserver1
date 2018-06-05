/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />

describe("UserSettingViewModel", function () {
    var userSettingViewModel;

    beforeEach(function () {
        userSettingViewModel = new UserSettingViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(userSettingViewModel).toBeDefined();
        });

    });

    describe("call GetUserLocalCultureName", function () {

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

});
