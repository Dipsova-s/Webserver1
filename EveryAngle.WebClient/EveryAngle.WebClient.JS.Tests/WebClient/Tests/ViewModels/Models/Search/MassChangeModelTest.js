/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Search/masschangemodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />

describe("MassChangeModel", function () {
    var massChangeModel;

    beforeEach(function () {
        massChangeModel = new MassChangeModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(massChangeModel).toBeDefined();
        });

    });

    describe("when select items from the same model", function () {
        it("should be able to set labels", function () {

            massChangeModel.GetSelectedAnglesModel = function () {
                return ['/models/1'];
            };

            var result = massChangeModel.CanSetLabels();
            expect(result).toEqual(true);
        });

    });

    describe("when select items from different models", function () {
        it("should NOT be able to set labels", function () {
            massChangeModel.GetSelectedAnglesModel = function () {
                return ['/models/1','/models/2'];
            };
            var result = massChangeModel.CanSetLabels();
            expect(result).toEqual(false);
        });

    });

});
