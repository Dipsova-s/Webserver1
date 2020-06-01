/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.MultiSelect.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardBusinessProcessHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("DashboardBusinessProcessHandler", function () {
    var dashboardBusinessProcessHandler;
    beforeEach(function () {
        var dashboardModel = new DashboardViewModel({});
        var unsavedModel = new DashboardViewModel({});
        dashboardBusinessProcessHandler = new DashboardBusinessProcessHandler(dashboardModel, unsavedModel);
        dashboardBusinessProcessHandler.MultiSelect = {
            hideList: $.noop
        };
    });

    describe(".CanUpdate", function () {
        var tests = [
            {
                title: 'should return true when user can edit',
                update: true,
                expected: true
            },
            {
                title: 'should return false when user cannot edit',
                update: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                //arrange
                dashboardBusinessProcessHandler.DashboardModel.Data().authorizations.update = test.update;

                //act
                var result = dashboardBusinessProcessHandler.CanUpdate();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".Initial", function () {
        it("should call render when initial", function () {
            spyOn(dashboardBusinessProcessHandler, 'Render');
            dashboardBusinessProcessHandler.Initial(jQuery('<div/>'));

            // assert
            expect(dashboardBusinessProcessHandler.$Container.length).toEqual(1);
            expect(dashboardBusinessProcessHandler.Render).toHaveBeenCalled();
        });
    });

    describe(".Render", function () {
        it("should set element", function () {
            spyOn(WC.HtmlHelper, 'MultiSelect').and.returnValue({ element: $() });
            spyOn(dashboardBusinessProcessHandler, 'GetAll').and.returnValue([]);
            spyOn(dashboardBusinessProcessHandler, 'GetActive').and.returnValue('');
            dashboardBusinessProcessHandler.Render($());

            // assert
            expect(WC.HtmlHelper.MultiSelect).toHaveBeenCalled();
        });

    });

    describe(".GetAll", function () {
        beforeEach(function () {
            spyOn(dashboardBusinessProcessHandler.DashboardModel, 'Data').and.returnValue({ is_published: ko.observable(true) });
            spyOn(privilegesViewModel, 'GetModelPrivilegesByUri');
            spyOn(businessProcessHandler, 'ManageBPAuthorization');
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

        it("Should return correct assigend bps from the Dashboard", function () {
            // prepare
            var result = dashboardBusinessProcessHandler.GetAll();

            // assert
            expect(result.length).toEqual(8);

        });
    });

    describe(".GetActive", function () {
        beforeEach(function () {
            dashboardBusinessProcessHandler.UnsavedModel.Data().assigned_labels = ['P2P', 'IT', 'GRC'];
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

        it("Should return correct assigend bps from the Dashboard", function () {
            // prepare
            var result = dashboardBusinessProcessHandler.GetActive();

            // assert
            expect(result).toEqual(['P2P', 'IT']);

        });
    });

    describe(".OnRender", function () {
        it("should render value", function () {
            var bp = { css_class: 'my-class', fullname: 'my-fullname' };
            var element = $('<div/>');
            dashboardBusinessProcessHandler.OnRender('value', bp, element);

            // assert
            expect(element.hasClass('my-class')).toEqual(true);
            expect(element.attr('data-tooltip-text')).toEqual('my-fullname');
            expect(element.attr('data-tooltip-position')).toEqual('bottom');
            expect(element.attr('data-role')).toEqual('tooltip');
        });
        it("should render list (is_allowed=false)", function () {
            var bp = {
                list_css_class: 'my-class',
                fullname: 'my-fullname',
                name: 'my-name',
                is_allowed: false,
                readOnly: true
            };
            var parent = $('<div><div><span></span></div></div>');
            var element = parent.children();
            dashboardBusinessProcessHandler.OnRender('list', bp, element);

            // assert
            expect(element.hasClass('disabled')).toEqual(true);
            expect(element.children('span:last').text()).toEqual('my-name');
            expect(parent.hasClass('business-processes')).toEqual(true);
        });
        it("should render list (readOnly=true)", function () {
            var bp = {
                list_css_class: 'my-class',
                fullname: 'my-fullname',
                name: 'my-name',
                is_allowed: true,
                readOnly: true
            };
            var parent = $('<div><div><span></span></div></div>');
            var element = parent.children();
            dashboardBusinessProcessHandler.OnRender('list', bp, element);

            // assert
            expect(element.hasClass('disabled')).toEqual(true);
            expect(element.children('span:last').text()).toEqual('my-name');
            expect(parent.hasClass('business-processes')).toEqual(true);
        });
        it("should render list", function () {
            var bp = {
                list_css_class: 'my-class',
                fullname: 'my-fullname',
                name: 'my-name',
                is_allowed: true,
                readOnly: false
            };
            var parent = $('<div><div><span></span></div></div>');
            var element = parent.children();
            dashboardBusinessProcessHandler.OnRender('list', bp, element);

            // assert
            expect(element.hasClass('disabled')).toEqual(false);
            expect(element.children('span:last').text()).toEqual('my-name');
            expect(parent.hasClass('business-processes')).toEqual(true);
        });
    });

    describe(".OnChange", function () {
        beforeEach(function () {
            dashboardBusinessProcessHandler.UnsavedModel.Data().assigned_labels = ['id1', 'id2', 'id3'];
            spyOn($.fn, 'show');
            spyOn($.fn, 'hide');
            spyOn(dashboardBusinessProcessHandler, 'Callback');
        });
        it("should show header then add item", function () {
            var item = { id: 'id0' };
            var context = { value: ko.observableArray([]), element: $() };
            dashboardBusinessProcessHandler.OnChange.call(context, 'add', item);

            // assert
            expect($.fn.show).toHaveBeenCalled();
            expect($.fn.hide).not.toHaveBeenCalled();
            expect(dashboardBusinessProcessHandler.Callback).toHaveBeenCalledWith(['id1', 'id2', 'id3', 'id0']);
        });
        it("should hide header but skip adding item", function () {
            var item = { id: 'id1' };
            var context = { value: ko.observableArray(['idX']), element: $() };
            dashboardBusinessProcessHandler.OnChange.call(context, 'add', item);

            // assert
            expect($.fn.show).not.toHaveBeenCalled();
            expect($.fn.hide).toHaveBeenCalled();
            expect(dashboardBusinessProcessHandler.Callback).not.toHaveBeenCalled();
        });
        it("should remove item", function () {
            var item = { id: 'id1' };
            var context = { value: ko.observableArray(['idX']), element: $() };
            dashboardBusinessProcessHandler.OnChange.call(context, 'delete', item);

            // assert
            expect($.fn.show).not.toHaveBeenCalled();
            expect($.fn.hide).toHaveBeenCalled();
            expect(dashboardBusinessProcessHandler.Callback).toHaveBeenCalledWith(['id2', 'id3']);
        });
    });

    describe(".Callback", function () {
        it("should save locally for adhoc", function () {
            spyOn(dashboardBusinessProcessHandler.DashboardModel, 'IsTemporaryDashboard').and.returnValue(true);
            spyOn(dashboardBusinessProcessHandler.DashboardModel, 'SetBusinessProcesses');
            dashboardBusinessProcessHandler.Callback(["S2D", "F2P"]);

            // assert
            expect(dashboardBusinessProcessHandler.DashboardModel.SetBusinessProcesses).toHaveBeenCalled();
            expect(dashboardBusinessProcessHandler.UnsavedModel.Data().assigned_labels).toEqual(["S2D", "F2P"]);
        });
        it("should save with delay 1000ms", function (done) {
            spyOn(dashboardBusinessProcessHandler.DashboardModel, 'IsTemporaryDashboard').and.returnValue(false);
            spyOn(dashboardBusinessProcessHandler, 'Save');
            dashboardBusinessProcessHandler.Callback(["S2D", "F2P"]);

            // assert
            setTimeout(function () {
                expect(dashboardBusinessProcessHandler.Save).toHaveBeenCalled();
                done();
            }, 1200);
        });
    });

    describe(".Save", function () {
        it("should call functions by sequence", function () {
            spyOn($.fn, 'busyIndicator');
            spyOn(dashboardBusinessProcessHandler.MultiSelect, 'hideList');
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(dashboardBusinessProcessHandler.DashboardModel, 'SetBusinessProcesses').and.returnValue($.when({
                assigned_labels: ["S2D", "F2P"]
            }));
            spyOn(dashboardBusinessProcessHandler.DashboardModel, 'Data').and.returnValue({
                name: $.noop
            });
            dashboardBusinessProcessHandler.Save(["S2D", "F2P"]);

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalledWith(true);
            expect(dashboardBusinessProcessHandler.MultiSelect.hideList).toHaveBeenCalled();
            expect(dashboardBusinessProcessHandler.DashboardModel.SetBusinessProcesses).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(dashboardBusinessProcessHandler.UnsavedModel.Data().assigned_labels).toEqual(["S2D", "F2P"]);
        });
    });
});
