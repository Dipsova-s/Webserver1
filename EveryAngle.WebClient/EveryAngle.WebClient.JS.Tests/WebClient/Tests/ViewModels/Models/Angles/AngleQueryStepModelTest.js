/// <reference path="/Dependencies/ViewModels/Models/Angle/anglequerystepmodel.js" />

describe("AngleQueryStepModel", function () {
    var angleQueryStepModel;

    beforeEach(function () {
        angleQueryStepModel = new AngleQueryStepModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(angleQueryStepModel).toBeDefined();
        });

    });

});
