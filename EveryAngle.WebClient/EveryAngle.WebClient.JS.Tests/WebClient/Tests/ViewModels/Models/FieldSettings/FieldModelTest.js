/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/FieldSettings/fieldmodel.js" />

describe("FieldModel", function () {
    var fieldModel;

    beforeEach(function () {
        fieldModel = new FieldModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(fieldModel).toBeDefined();
        });

    });

});
