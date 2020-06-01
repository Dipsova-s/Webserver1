/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.MultiSelect.js" />
/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.MenuNavigatable.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/ResultModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/BaseItemHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleUserSpecificHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleBusinessProcessHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("AngleBusinessProcessHandler", function () {
    var angleBusinessProcessHandler;
    beforeEach(function () {
        angleBusinessProcessHandler = new AngleBusinessProcessHandler(new AngleHandler());
    });

    describe(".CanUpdate", function () {
        var tests = [
            {
                title: 'should return true when user can edit the angle',
                update: true,
                expected: true
            },
            {
                title: 'should return false when user can edit the angle',
                update: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                //arrange
                spyOn(angleBusinessProcessHandler.AngleHandler, 'Data').and.returnValue({
                    authorizations: { update: test.update }
                });

                //act
                var result = angleBusinessProcessHandler.CanUpdate();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanGetAll", function () {
        beforeEach(function () {

            spyOn(angleBusinessProcessHandler.AngleHandler, 'Data').and.returnValue({
                model: 'models/1',
                is_published: function () {
                    return true;
                }
            });

            spyOn(businessProcessesModel.General, 'Data').and.returnValue(
                [{
                    "id": "P2P",
                    "enabled": true,
                    "system": true,
                    "name": "Purchase to Pay",
                    "abbreviation": "P2P",
                    "order": 1,
                    "is_allowed": true
                }, {
                    "id": "S2D",
                    "enabled": true,
                    "system": true,
                    "name": "Supply to Demand",
                    "abbreviation": "S2D",
                    "order": 2,
                    "is_allowed": true
                }, {
                    "id": "O2C",
                    "enabled": true,
                    "system": true,
                    "name": "Order to Cash",
                    "abbreviation": "O2C",
                    "order": 3,
                    "is_allowed": true
                }, {
                    "id": "F2R",
                    "enabled": true,
                    "system": true,
                    "name": "Finance to Report",
                    "abbreviation": "F2R",
                    "order": 4,
                    "is_allowed": true
                }, {
                    "id": "PM",
                    "enabled": true,
                    "system": true,
                    "name": "Plant Maintenance",
                    "abbreviation": "PM",
                    "order": 5,
                    "is_allowed": true
                }, {
                    "id": "HCM",
                    "enabled": true,
                    "system": true,
                    "name": "Human Capital Management",
                    "abbreviation": "HCM",
                    "order": 6,
                    "is_allowed": true
                }, {
                    "id": "GRC",
                    "enabled": true,
                    "system": true,
                    "name": "Governance, Risk and Compliance",
                    "abbreviation": "GRC",
                    "order": 7,
                    "is_allowed": true
                }, {
                    "id": "IT",
                    "enabled": true,
                    "system": true,
                    "name": "Information Technology",
                    "abbreviation": "IT",
                    "order": 8,
                    "is_allowed": true
                }]);
        });

        it("Should return correct privileges when user have View & Deny privileges", function () {

            //arrange
            spyOn(privilegesViewModel, 'GetModelPrivilegesByUri').and.returnValue(
                [{
                    "roles": [{
                        "model_id": "EA2_800"
                    }],
                    "model": "/models/1",
                    "label_authorizations": {
                        "P2P": "validate",
                        "S2D": "validate",
                        "O2C": "validate",
                        "F2R": "validate",
                        "PM": "validate",
                        "HCM": "validate",
                        "GRC": "deny",
                        "IT": "view"
                    }
                }]);

            var expected = [
                { id: 'P2P', is_allowed: true, readOnly: false },
                { id: 'S2D', is_allowed: true, readOnly: false },
                { id: 'O2C', is_allowed: true, readOnly: false },
                { id: 'F2R', is_allowed: true, readOnly: false },
                { id: 'PM', is_allowed: true, readOnly: false },
                { id: 'HCM', is_allowed: true, readOnly: false },
                { id: 'GRC', is_allowed: false, readOnly: false },
                { id: 'IT', is_allowed: true, readOnly: true }
            ];

            //act
            var businessProcesses = angleBusinessProcessHandler.GetAll();

            $.each(businessProcesses, function (index, actualBp) {
                // assert
                var expectedBp = expected.findObject('id', actualBp.id);
                expect(actualBp.is_allowed).toEqual(expectedBp.is_allowed);
                expect(actualBp.readOnly).toEqual(expectedBp.readOnly);
            });

        });

    });

    describe(".GetActive", function () {
        beforeEach(function () {

            spyOn(angleBusinessProcessHandler.AngleHandler, 'Data').and.returnValue({
                assigned_labels: function () {
                    return ['P2P', 'IT', 'GRC'];
                }
            });

            spyOn(businessProcessesModel.General, 'Data').and.returnValue(
                [{
                    "id": "P2P",
                    "enabled": true,
                    "system": true,
                    "name": "Purchase to Pay",
                    "abbreviation": "P2P",
                    "order": 1,
                    "is_allowed": true
                }, {
                    "id": "S2D",
                    "enabled": true,
                    "system": true,
                    "name": "Supply to Demand",
                    "abbreviation": "S2D",
                    "order": 2,
                    "is_allowed": true
                }, {
                    "id": "O2C",
                    "enabled": true,
                    "system": true,
                    "name": "Order to Cash",
                    "abbreviation": "O2C",
                    "order": 3,
                    "is_allowed": true
                }, {
                    "id": "F2R",
                    "enabled": true,
                    "system": true,
                    "name": "Finance to Report",
                    "abbreviation": "F2R",
                    "order": 4,
                    "is_allowed": true
                }, {
                    "id": "PM",
                    "enabled": true,
                    "system": true,
                    "name": "Plant Maintenance",
                    "abbreviation": "PM",
                    "order": 5,
                    "is_allowed": true
                }, {
                    "id": "HCM",
                    "enabled": true,
                    "system": true,
                    "name": "Human Capital Management",
                    "abbreviation": "HCM",
                    "order": 6,
                    "is_allowed": true
                }, {
                    "id": "GRC",
                    "enabled": true,
                    "system": true,
                    "name": "Governance, Risk and Compliance",
                    "abbreviation": "GRC",
                    "order": 7,
                    "is_allowed": false
                }, {
                    "id": "IT",
                    "enabled": true,
                    "system": true,
                    "name": "Information Technology",
                    "abbreviation": "IT",
                    "order": 8,
                    "is_allowed": true
                }]);
        });

        it("Should return correct assigend bps from the angle", function () {

            var expected = ['P2P', 'IT'];

            //act
            var businessProcesses = angleBusinessProcessHandler.GetActive();
            expect(businessProcesses).toEqual(expected);

        });
    });

    describe(".Initial", function () {
        beforeEach(function () {
            $('<div class="section-business-process"><div class="business-processes-wrapper"></div></div>').appendTo('body');
            spyOn(angleBusinessProcessHandler, 'GetAll').and.returnValue(['P2P', 'S2D', 'C2C']);
            spyOn(angleBusinessProcessHandler, 'GetActive').and.returnValue(['P2P']);
            spyOn(angleBusinessProcessHandler, 'CanUpdate').and.returnValue(true);
            spyOn(angleBusinessProcessHandler.AngleHandler, 'Data').and.returnValue({
                assigned_labels: function () {
                    return ['P2P'];
                }
            });
        });

        afterEach(function () {
            $('.section-business-process').remove();
        });

        it("should call render when initial", function () {
            spyOn(angleBusinessProcessHandler, 'Render');
            angleBusinessProcessHandler.Initial(jQuery('.section-business-process'));
            // assert
            expect(angleBusinessProcessHandler.Render).toHaveBeenCalled();
        });

        it("should set element", function () {
            angleBusinessProcessHandler.Initial(jQuery('.section-business-process'));
            var element = $('.business-processes-wrapper');
            var settings = $(element).data('MultiSelect').settings;
            // assert
            expect(element.hasClass('multiple-select')).toEqual(true);
            expect(settings.data).toEqual(['P2P', 'S2D', 'C2C']);
            expect(settings.min).toEqual(1);
        });

    });

    describe(".Save", function () {
        it("should call functions by sequence", function () {

            var element = { addClass: $.noop };
            spyOn(element, 'addClass');

            angleBusinessProcessHandler.MultiSelect = {
                hideList: $.noop
            };
            spyOn(angleBusinessProcessHandler.MultiSelect, 'hideList');

            angleBusinessProcessHandler.$Container = {
                busyIndicator: $.noop,
                find: $.noop
            };
            spyOn(angleBusinessProcessHandler.$Container, 'busyIndicator');
            spyOn(angleBusinessProcessHandler.$Container, 'find').and.returnValue(element);

            spyOn(angleBusinessProcessHandler.AngleHandler, 'ConfirmSave');
            var labels = ["S2D", "F2P"];
            angleBusinessProcessHandler.Save(labels);

            expect(angleBusinessProcessHandler.$Container.busyIndicator).toHaveBeenCalledWith(true);
            expect(element.addClass).toHaveBeenCalledWith('k-loading-none');
            expect(angleBusinessProcessHandler.MultiSelect.hideList).toHaveBeenCalled();
            expect(angleBusinessProcessHandler.AngleHandler.ConfirmSave).toHaveBeenCalled();
        });
    });

    describe(".Cancel", function () {
        it("should call functions by sequence", function () {
            angleBusinessProcessHandler.$Container = {
                busyIndicator: $.noop
            };
            spyOn(angleBusinessProcessHandler.$Container, 'busyIndicator');
            spyOn(angleBusinessProcessHandler, 'Render');

            angleBusinessProcessHandler.Cancel();

            expect(angleBusinessProcessHandler.$Container.busyIndicator).toHaveBeenCalledWith(false);
            expect(angleBusinessProcessHandler.Render).toHaveBeenCalled();
        });
    });

    describe(".OnChangeComplete", function () {
        it("should show toast when the angle is not an adhoc angle", function () {
            angleBusinessProcessHandler.$Container = { busyIndicator: $.noop };

            spyOn(angleBusinessProcessHandler.AngleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleBusinessProcessHandler.$Container, 'busyIndicator');
            spyOn(toast, 'MakeSuccessTextFormatting');

            angleBusinessProcessHandler.OnChangeComplete();
            expect(angleBusinessProcessHandler.$Container.busyIndicator).toHaveBeenCalledWith(false);
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
        });

        it("should not show toast when the angle is an adhoc angle", function () {
            angleBusinessProcessHandler.$Container = { busyIndicator: $.noop };

            spyOn(angleBusinessProcessHandler.AngleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleBusinessProcessHandler.$Container, 'busyIndicator');
            spyOn(toast, 'MakeSuccessTextFormatting');

            angleBusinessProcessHandler.OnChangeComplete();
            expect(angleBusinessProcessHandler.$Container.busyIndicator).toHaveBeenCalledWith(false);
            expect(toast.MakeSuccessTextFormatting).not.toHaveBeenCalled();
        });
    });

    describe(".OnChangeFail", function () {
        it("should call functions by sequence", function () {
            angleBusinessProcessHandler.$Container = { busyIndicator: $.noop };

            spyOn(angleBusinessProcessHandler.$Container, 'busyIndicator');
            angleBusinessProcessHandler.OnChangeFail();
            expect(angleBusinessProcessHandler.$Container.busyIndicator).toHaveBeenCalledWith(false);
        });
    });

    describe(".Validate", function () {
        it("should not show warning popup when there is a label in angle", function () {
            angleBusinessProcessHandler.MultiSelect = {
                items: $.noop
            };
            spyOn(angleBusinessProcessHandler.MultiSelect, 'items').and.returnValue(["S2D"]);
            spyOn(popup, 'Alert');

            var result = angleBusinessProcessHandler.Validate();

            expect(result).toEqual(true);
            expect(popup.Alert).not.toHaveBeenCalled();
        });

        it("should show warning popup when there is no label in angle", function () {
            angleBusinessProcessHandler.MultiSelect = {
                items: $.noop
            };
            spyOn(angleBusinessProcessHandler.MultiSelect, 'items').and.returnValue([]);
            spyOn(popup, 'Alert');

            var result = angleBusinessProcessHandler.Validate();

            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
    })
});
