/// <reference path="/Dependencies/ViewModels/Models/Session/sessionmodel.js" />

describe("SessionModel", function () {
    var sessionViewModel;

    beforeEach(function () {
        sessionViewModel = new SessionViewModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(sessionViewModel).toBeDefined();
        });

    });

});
