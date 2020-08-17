/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SearchStorageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardstateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/dashboardstatehandler.js" />

describe("DashboardStateHandler", function () {

    var dashboardStateHandler;
    beforeEach(function () {
        dashboardStateHandler = new DashboardStateHandler();
    });
    
    describe(".SetDashboardData", function () {
        
        it("should set data", function () {
            spyOn(dashboardStateHandler, 'SetItemData').and.callFake($.noop);
            spyOn(dashboardStateHandler, 'GetWidgetsData').and.returnValue([]);
            spyOn(dashboardModel, 'IsTemporaryDashboard').and.returnValue(false);
            var dashboard = {
                model: "model",
                is_published: true,
                is_validated: true,
                assigned_labels :["S2D"],
                uri: "uri",
                state: "state",
                multi_lang_name: ["en"],
                authorizations: {
                    update: true,
                    publish: true,
                    unpublish: true,
                    validate: true,
                    unvalidate: true
                },
                widget_definitions: []
            };
            
            dashboardStateHandler.SetDashboardData(dashboard);

            expect(dashboardStateHandler.SetItemData).toHaveBeenCalled();
            expect(dashboardStateHandler.Widgets().length).toEqual(0);
            expect(dashboardStateHandler.CanSetState()).toEqual(true);
        });

    });

    describe(".GetWidgetsData", function () {
        it("should get Widgets data", function () {
            spyOn(dashboardStateHandler, "GetWidgetData").and.returnValue({ name: 'widget1' });
            spyOn(dashboardStateHandler, "GetEmptyWidgetData").and.returnValue({ name: 'widget2' });

            var widgets = [
                {
                    GetAngle: function () { return {}; },
                    GetDisplay: function () { return {}; }
                },
                {
                    GetAngle: function () { return null; },
                    GetDisplay: function () { return {}; }
                },
                {
                    GetAngle: function () { return {}; },
                    GetDisplay: function () { return null; }
                },
                {
                    GetAngle: function () { return null; },
                    GetDisplay: function () { return null; }
                }
            ];
            var result = dashboardStateHandler.GetWidgetsData(widgets);
            expect(result.length).toEqual(4);
            expect(dashboardStateHandler.GetWidgetData).toHaveBeenCalledTimes(1);
            expect(dashboardStateHandler.GetEmptyWidgetData).toHaveBeenCalledTimes(3);
        });
    });

    describe(".GetWidgetData", function () {
        it('should get Widget data', function () {
            spyOn(dashboardStateHandler, 'GetParametersInfo').and.returnValue('parameterized1');
            spyOn(dashboardStateHandler, 'GetWidgetLink').and.returnValue('link1');
            var widget = {
                id: 'id1',
                GetWidgetName: function () { return 'name1'; }
            };
            var angle = {
                is_validated: true
            };
            var display = {
                uri: 'uri1',
                display_type: 'list',
                is_angle_default: true,
                is_public: true
            };

            // act
            var result = dashboardStateHandler.GetWidgetData(widget, angle, display);

            // assert
            expect(result.id).toEqual('id1');
            expect(result.name).toEqual('name1');
            expect(result.uri).toEqual('uri1');
            expect(result.display_icon).toEqual('icon-list default');
            expect(result.is_public).toEqual(true);
            expect(result.is_validated).toEqual(true);
            expect(result.parameterized).toEqual('parameterized1');
            expect(result.link).toEqual('link1');
            expect(typeof result.click).toEqual('function');
        });
    });

    describe(".GetEmptyWidgetData", function () {
        it('should get empty Widget data', function () {
            var widget = {
                id: 'id1',
                GetWidgetName: function () { return 'name1'; }
            };

            // act
            var result = dashboardStateHandler.GetEmptyWidgetData(widget);

            // assert
            expect(result.id).toEqual('id1');
            expect(result.name).toEqual('name1');
            expect(result.uri).toEqual('');
            expect(result.display_icon).toEqual('');
            expect(result.is_public).toEqual(false);
            expect(result.is_validated).toEqual(false);
            expect(result.parameterized).toEqual({});
            expect(result.link).toEqual('');
            expect(typeof result.click).toEqual('function');
        });
    });

    describe(".GetParametersInfo", function () {
        it('should call DashboardModel.GetAngleExecutionParametersInfo', function () {
            spyOn(dashboardModel, 'GetAngleExecutionParametersInfo').and.returnValue('info');

            // act
            var result = dashboardStateHandler.GetParametersInfo();

            // assert
            expect(result).toEqual('info');
            expect(dashboardModel.GetAngleExecutionParametersInfo).toHaveBeenCalled();
        });
    });

    describe(".GetWidgetLink", function () {
        it('should get empty if no Angle', function () {
            // act
            var result = dashboardStateHandler.GetWidgetLink(null, {});

            // assert
            expect(result).toEqual('');
        });

        it('should get empty if no Display', function () {
            // act
            var result = dashboardStateHandler.GetWidgetLink({}, null);

            // assert
            expect(result).toEqual('');
        });

        it('should get link without target', function () {
            var angle = { uri: '/angles/1' };
            var display = { uri: '/angles/1/displays/1', is_public: true };

            // act
            var result = dashboardStateHandler.GetWidgetLink(angle, display);

            // assert
            expect(result).toContain('angle=/angles/1');
            expect(result).toContain('display=/angles/1/displays/1');
            expect(result).toContain('editmode=true');
            expect(result).not.toContain('target=');
        });

        it('should get link for private Display', function () {
            var angle = { uri: '/angles/1' };
            var display = { uri: '/angles/1/displays/1', is_public: false };

            // act
            var result = dashboardStateHandler.GetWidgetLink(angle, display);

            // assert
            expect(result).toContain('angle=/angles/1');
            expect(result).toContain('display=/angles/1/displays/1');
            expect(result).toContain('editmode=true');
            expect(result).toContain('target=publish');
        });
    });
});