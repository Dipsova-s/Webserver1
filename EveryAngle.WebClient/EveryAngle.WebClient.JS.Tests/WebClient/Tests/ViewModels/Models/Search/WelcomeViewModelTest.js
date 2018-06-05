/// <reference path="/Dependencies/ViewModels/Models/Search/welcomemodel.js" />

describe("WelcomeViewModel", function () {
    var welcomeViewModel;

    beforeEach(function () {
        welcomeViewModel = new WelcomeViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(welcomeViewModel).toBeDefined();
        });

    });

});
