/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />

describe("UserViewModel", function () {
    var userViewModel;

    beforeEach(function () {
        userViewModel = new UserViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(userViewModel).toBeDefined();
        });

    });
});
