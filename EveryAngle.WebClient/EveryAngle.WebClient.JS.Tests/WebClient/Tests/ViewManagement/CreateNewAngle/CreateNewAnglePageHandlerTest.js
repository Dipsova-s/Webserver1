/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />
/// <reference path="/Dependencies/ViewManagement/CreateNewAngle/createnewanglepagehandler.js" />

describe("CreateNewAnglePageHandlerTest", function () {

    var createNewAngleViewManagementModel;

    beforeEach(function () {
        createNewAngleViewManagementModel = new CreateNewAngleViewManagementModel();
    });

    describe(".CanUseTemplate", function () {

        var angle = {
            template_has_invalid_classes: false,
            displays_summary: [{ display_type: 'list'}]
        };

        it("can use the template", function () {
            expect(createNewAngleViewManagementModel.CanUseTemplate(angle)).toEqual(true);
        });

        it("cannot use the template", function () {
            angle.template_has_invalid_classes = true;
            expect(createNewAngleViewManagementModel.CanUseTemplate(angle)).toEqual(false);
        });
    });

    describe(".GetListFields", function () {
        var resultModel = {
            Data: function () {
                return { query_fields: '' };
            }
        };

        beforeEach(function () {
            spyOn(displayModel, "GenerateDefaultField").and.callFake($.noop);
            spyOn(displayModel, "GetDefaultListFields").and.callFake($.noop);
        });

        it("if skip template, function GenerateDefaultField have been called", function () {
            var skipTemplate = true;
            createNewAngleViewManagementModel.GetListFields(skipTemplate, resultModel);
            expect(displayModel.GenerateDefaultField).toHaveBeenCalled();
        });

        it("if not skip template, function GetDefaultListFields have been called", function () {
            var skipTemplate = false;
            createNewAngleViewManagementModel.GetListFields(skipTemplate, resultModel);
            expect(displayModel.GetDefaultListFields).toHaveBeenCalled();
        });
    });
    
    describe(".SetCreateAngleByObjectSelectionMode", function () {

        beforeEach(function () {
            createNewAngleViewManagementModel.ClassesChooserHandler = {};
        });

        var tests = [
            {
                title: 'should be multiple selection if not a real time model',
                is_real_time: false,
                expected: true
            },
            {
                title: 'should be single selection if a real time model',
                is_real_time: true,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(aboutSystemHandler, 'IsRealTimeModel').and.returnValue(test.is_real_time);
                createNewAngleViewManagementModel.SetCreateAngleByObjectSelectionMode();
                expect(createNewAngleViewManagementModel.ClassesChooserHandler.MultipleSelection).toEqual(test.expected);
            });
        });
    });
});
