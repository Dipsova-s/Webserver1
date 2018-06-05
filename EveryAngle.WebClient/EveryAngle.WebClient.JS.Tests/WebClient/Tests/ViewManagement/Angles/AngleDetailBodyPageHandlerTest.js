/// <reference path="/Dependencies/Helper/MeasurePerformance.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/AngleActionMenuHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/AnglePageHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/AngleDetailBodyPageHandler.js" />


describe("AngleDetailBodyPageHandler", function () {

    describe("call ApplyResult", function () {

        beforeEach(function () {
            //initial
            spyOn(anglePageHandler, 'UpdateAngleDisplayValidation').and.callFake($.noop);

            spyOn(angleDetailPageHandler, 'ApplyResultWithSetDisplayAndExecuteAngle').and.callFake($.noop);
            spyOn(angleDetailPageHandler, 'ApplyResultWithExecuteAngle').and.callFake($.noop);
            spyOn(angleDetailPageHandler, 'ApplyResultWithoutExecuteAngle').and.callFake($.noop);
        });

        it("should call angleDetailPageHandler.ApplyResultWithSetDisplayAndExecuteAngle() if add/remove jump", function () {

            //initial
            anglePageHandler.IsEditMode(false);
            spyOn(jQuery, 'deepCompare').and.callFake(function () { return false; });
            anglePageHandler.HandlerValidation.Angle.Valid = true;

            spyOn(angleDetailPageHandler, 'CheckExecuteAngle').and.callFake(function () { return false });

            //process
            angleDetailPageHandler.ApplyResult();

            //assert
            expect(angleDetailPageHandler.ApplyResultWithSetDisplayAndExecuteAngle).toHaveBeenCalled();
            expect(angleDetailPageHandler.ApplyResultWithExecuteAngle).not.toHaveBeenCalled();
            expect(angleDetailPageHandler.ApplyResultWithoutExecuteAngle).not.toHaveBeenCalled();

        });

        it("should call angleDetailPageHandler.ApplyResultWithExecuteAngle() if add/remove jump", function () {

            //initial
            anglePageHandler.IsEditMode(false);
            spyOn(jQuery, 'deepCompare').and.callFake(function () { return true; });
            anglePageHandler.HandlerValidation.Angle.Valid = false;

            spyOn(angleDetailPageHandler, 'CheckExecuteAngle').and.callFake(function () { return true });

            //process
            angleDetailPageHandler.ApplyResult();

            //assert
            expect(angleDetailPageHandler.ApplyResultWithSetDisplayAndExecuteAngle).not.toHaveBeenCalled();
            expect(angleDetailPageHandler.ApplyResultWithExecuteAngle).toHaveBeenCalled();
            expect(angleDetailPageHandler.ApplyResultWithoutExecuteAngle).not.toHaveBeenCalled();

        });

        it("should call angleDetailPageHandler.ApplyResultWithoutExecuteAngle() if add/remove jump", function () {

            //initial
            anglePageHandler.IsEditMode(true);
            spyOn(jQuery, 'deepCompare').and.callFake(function () { return true; });
            anglePageHandler.HandlerValidation.Angle.Valid = false;

            spyOn(angleDetailPageHandler, 'CheckExecuteAngle').and.callFake(function () { return false });

            //process
            angleDetailPageHandler.ApplyResult();

            //assert
            expect(angleDetailPageHandler.ApplyResultWithSetDisplayAndExecuteAngle).not.toHaveBeenCalled();
            expect(angleDetailPageHandler.ApplyResultWithExecuteAngle).not.toHaveBeenCalled();
            expect(angleDetailPageHandler.ApplyResultWithoutExecuteAngle).toHaveBeenCalled();

        });
    });
});
