/// <reference path="/Dependencies/ViewManagement/Shared/FieldCategoryHandler.js" />

describe("FieldCategoryHandler", function () {
    var fieldCategoryHandler;

    beforeEach(function () {
        fieldCategoryHandler = new FieldCategoryHandler();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(fieldCategoryHandler).toBeDefined();
        });

    });

});
