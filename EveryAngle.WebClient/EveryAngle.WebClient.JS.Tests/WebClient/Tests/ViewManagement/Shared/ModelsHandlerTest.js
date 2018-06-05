/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />

describe("ModelstModel", function () {
    var modelsHandler;

    beforeEach(function () {
        modelsHandler = new ModelsHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(modelsHandler).toBeDefined();
        });

    });

});
