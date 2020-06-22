/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/CreateNewAngle/createnewanglepagehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />

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

    describe(".SelectBusinessProcesses", function () {
        it("should select the first active and allowed BP", function () {
            var result = [{ id: 'P2P', enabled: false, is_allowed: false },
                { id: 'S2D', enabled: true, is_allowed: true },
                { id: 'IT', enabled: false, is_allowed: false }];

            var handler = { Data: $.noop };
            spyOn(handler, 'Data').and.returnValue(result);
            spyOn(window, 'BusinessProcessesViewModel').and.returnValue(handler);
            spyOn(businessProcessHandler, 'ManageBPAuthorization').and.returnValue();

            var result = createNewAngleViewManagementModel.SelectBusinessProcesses();
            expect(result).toEqual('S2D');
        });
    });
});
