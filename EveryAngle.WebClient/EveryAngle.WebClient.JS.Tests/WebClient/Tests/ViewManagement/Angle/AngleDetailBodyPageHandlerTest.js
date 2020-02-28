/// <reference path="/Dependencies/Helper/MeasurePerformance.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleActionMenuHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/anglestateview.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/anglestatehandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AnglePageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleDetailBodyPageHandler.js" />

describe("AngleDetailBodyPageHandler", function () {

    describe(".ApplyResult", function () {

        beforeEach(function () {
            //initial
            spyOn(anglePageHandler, 'UpdateAngleDisplayValidation').and.callFake($.noop);
            spyOn(anglePageHandler, 'RenderBreadcrumb').and.callFake($.noop);

            spyOn(angleDetailPageHandler, 'ApplyResultWithSetDisplayAndExecuteAngle').and.callFake($.noop);
            spyOn(angleDetailPageHandler, 'ApplyResultWithExecuteAngle').and.callFake($.noop);
            spyOn(angleDetailPageHandler, 'ApplyResultWithoutExecuteAngle').and.callFake($.noop);
        });

        it("should call angleDetailPageHandler.ApplyResultWithSetDisplayAndExecuteAngle() if add/remove jump", function () {

            //initial
            anglePageHandler.IsEditMode(false);
            spyOn(jQuery, 'deepCompare').and.callFake(function () { return false; });
            anglePageHandler.HandlerValidation.Angle.Valid = true;

            spyOn(angleDetailPageHandler, 'CheckExecuteAngle').and.returnValue(false);

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

            spyOn(angleDetailPageHandler, 'CheckExecuteAngle').and.returnValue(true);

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

            spyOn(angleDetailPageHandler, 'CheckExecuteAngle').and.returnValue(false);

            //process
            angleDetailPageHandler.ApplyResult();

            //assert
            expect(angleDetailPageHandler.ApplyResultWithSetDisplayAndExecuteAngle).not.toHaveBeenCalled();
            expect(angleDetailPageHandler.ApplyResultWithExecuteAngle).not.toHaveBeenCalled();
            expect(angleDetailPageHandler.ApplyResultWithoutExecuteAngle).toHaveBeenCalled();

        });

        it("should update validation sign for breadcrumb when user save Angle", function () {
            spyOn(angleDetailPageHandler, 'CheckExecuteAngle').and.returnValue(true);
            angleDetailPageHandler.ApplyResult();
            expect(anglePageHandler.RenderBreadcrumb).toHaveBeenCalled();
        });

    });
});
