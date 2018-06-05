/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />

describe("PrivilegesViewModel", function () {
    var privilegesViewModel;

    beforeEach(function () {
        privilegesViewModel = new PrivilegesViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(privilegesViewModel).toBeDefined();
        });

    });

});
