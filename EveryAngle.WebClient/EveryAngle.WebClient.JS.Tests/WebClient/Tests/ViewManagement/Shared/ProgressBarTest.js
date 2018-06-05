/// <reference path="/Dependencies/ViewManagement/Shared/ProgressBar.js" />

describe("ProgressBar", function () {
    var progressbarModel;

    beforeEach(function () {
        progressbarModel = new ProgressbarModel();
    });

    //Define new ProgressBar
    describe("when using ProgressBar", function () {
        it("should be defined", function () {
            expect(progressbarModel).toBeDefined();
        });
    });

    describe("call GetPercentageValue", function () {

        it("should get 25 when input 25.04", function () {
            var result = progressbarModel.GetPercentageValue(25.04);

            expect(result).toBe(25);
        });

    });

});
