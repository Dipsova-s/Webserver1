﻿/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Dashboard/DashboardDetailsHandler.js" />

describe("DashboardDetailsHandler", function () {
    var dashboardDetailsHandler;

    beforeEach(function () {
        dashboardDetailsHandler = new DashboardDetailsHandler();
    });

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(dashboardDetailsHandler).toBeDefined();
        });
    });

    describe("call DefinitionGetHeaderName", function () {

        it("should get name in html format (public icon)", function () {
            var model = {
                selected: function () {
                    return JSON.stringify({
                        is_public: true,
                        type: 'pivot'
                    });
                },
                widget_name: function () { return 'widget name'; }
            };
            var name = dashboardDetailsHandler.DefinitionGetHeaderName(model, true);
            expect(name).toContain('<i class="icon public"></i>');
            expect(name).toContain('<i class="icon pivot"></i>');
        });

        it("should get name in html format (private icon)", function () {
            var model = {
                selected: function () {
                    return JSON.stringify({
                        is_public: false,
                        type: 'list'
                    });
                },
                widget_name: function () { return 'widget name'; }
            };
            var name = dashboardDetailsHandler.DefinitionGetHeaderName(model, true);
            expect(name).toContain('<i class="icon private"></i>');
            expect(name).toContain('<i class="icon list"></i>');
        });

        it("should get name in text format", function () {
            var model = {
                selected: function () {
                    return JSON.stringify({
                        is_public: false,
                        type: 'chart'
                    });
                },
                widget_name: function () { return 'widget name'; }
            };
            var name = dashboardDetailsHandler.DefinitionGetHeaderName(model, false);
            expect(name).toEqual('widget name');
        });

    });

    describe("call DefinitionGetWidgetName", function () {

        it("should get defaultName if it was set", function () {
            var model = {
                full_name: 'model - angle - display'
            };
            var name = dashboardDetailsHandler.DefinitionGetWidgetName(model, 'default name');
            expect(name).toEqual('default name');
        });

        it("should get full name if defaul name was not set", function () {
            var model = {
                full_name: 'model - angle - display'
            };
            var name = dashboardDetailsHandler.DefinitionGetWidgetName(model, '');
            expect(name).toEqual('model - angle - display');
        });

        it("should get empty if nothing set", function () {
            var model = {
                full_name: ''
            };
            var name = dashboardDetailsHandler.DefinitionGetWidgetName(model, '');
            expect(name).toEqual('');
        });

    });

    describe("call DefinitionGetAngleName", function () {

        it("should contain public/template/parameter/error icons", function () {
            spyOn(validationHandler, 'GetAngleValidation').and.callFake(function () { return { Valid: false }; });
            var model = {
                is_published: true,
                is_template: true,
                is_parameterized: true,
                model: ''
            };
            var name = dashboardDetailsHandler.DefinitionGetAngleName(model);
            expect(name).toContain('icon public');
            expect(name).toContain('icon template');
            expect(name).toContain('icon parameterized');
            expect(name).toContain('icon validError');
        });

        it("should contain private/angle/none icon", function () {
            spyOn(validationHandler, 'GetAngleValidation').and.callFake(function () { return { Valid: true }; });
            var model = {
                is_public: false,
                model: ''
            };
            var name = dashboardDetailsHandler.DefinitionGetAngleName(model);
            expect(name).toContain('icon private');
            expect(name).toContain('icon angle');
            expect(name).toContain('icon none');
        });

    });

    describe("call DefinitionChangeWidget", function () {

        beforeEach(function () {
            spyOn(dashboardDetailsHandler, 'DefinitionGetWidgetName').and.callFake(function () { return 'name1'; });
            spyOn(dashboardDetailsHandler, 'DefinitionUpdateWidgetName').and.callFake($.noop);

            dashboardDetailsHandler.Definitions = ko.observableArray([{
                selected: ko.observable(),
                widget_name: ko.observable(''),
                id: '1'
            }]);
            dashboardDetailsHandler.Model = {
                KeyName: 'id',
                Data: ko.observable({
                    widget_definitions: [{
                        id: '1',
                        display: '11'
                    }]
                })
            };
        });

        it("should do nothing if canChangeWidget = false", function () {
            spyOn(dashboardDetailsHandler, 'Definitions');
            dashboardDetailsHandler.DefinitionChangeWidget({}, false);
            expect(dashboardDetailsHandler.Definitions).not.toHaveBeenCalled();
        });

        it("should update definition and model", function () {
            var model = {
                widget_id: '1',
                id: '00'
            };
            dashboardDetailsHandler.DefinitionChangeWidget(model, true);
            expect(dashboardDetailsHandler.Model.Data().widget_definitions[0].display).toEqual('00');
            expect(dashboardDetailsHandler.Definitions()[0].widget_name()).toEqual('name1');
        });

    });

    describe("call DefinitionUpdateWidgetName", function () {

        beforeEach(function () {
            dashboardDetailsHandler.Model = {
                Data: ko.observable({
                    widget_definitions: [{
                        id: '1',
                        multi_lang_name: ko.observableArray([])
                    }]
                })
            };
        });

        it("should add new language and convert '' to ' ' to multi_lang_name object", function () {
            dashboardDetailsHandler.DefinitionUpdateWidgetName('1', '');
            expect(dashboardDetailsHandler.Model.Data().widget_definitions[0].multi_lang_name()[0].text).toEqual(' ');
        });

        it("should update language to multi_lang_name object if exists", function () {
            dashboardDetailsHandler.Model.Data().widget_definitions[0].multi_lang_name.push({
                lang: 'en',
                text: 'old name'
            });
            dashboardDetailsHandler.DefinitionUpdateWidgetName('1', 'new name');
            expect(dashboardDetailsHandler.Model.Data().widget_definitions[0].multi_lang_name()[0].text).toEqual('new name');
        });

    });

    describe("call DefinitionDeleteWidget", function () {

        beforeEach(function () {
            dashboardDetailsHandler.Model = {
                Data: ko.observable({
                    widget_definitions: [{
                        id: '1'
                    }],
                    layout: {
                        widgets: ['1']
                    }
                })
            };
        });

        it("should remove widget from layout and widget_definitions if exist", function () {
            var model = {
                id: '1'
            };
            dashboardDetailsHandler.DefinitionDeleteWidget(model);
            expect(dashboardDetailsHandler.Model.Data().widget_definitions.length).toEqual(0);
            expect(dashboardDetailsHandler.Model.Data().layout.widgets.length).toEqual(0);
        });

        it("should do nothing if not exist", function () {
            var model = {
                id: '2'
            };
            dashboardDetailsHandler.DefinitionDeleteWidget(model);
            expect(dashboardDetailsHandler.Model.Data().widget_definitions.length).toEqual(1);
            expect(dashboardDetailsHandler.Model.Data().layout.widgets.length).toEqual(1);
        });

    });

    describe("call DefinitionGetLink", function () {

        it("should contain editmode and target to publish", function () {

            var link = dashboardDetailsHandler.DefinitionGetLink(mockAngles[0], mockAngles[0].display_definitions[0]);
            var expectEditMode = enumHandlers.ANGLEPARAMETER.EDITMODE + '=true';
            var expectTargetPublish = enumHandlers.ANGLEPARAMETER.TARGET + '=' + enumHandlers.ANGLETARGET.PUBLISH;

            expect(link).toContain(expectEditMode);
            expect(link).toContain(expectTargetPublish);

        });

        it("should contain execution parameters", function () {

            dashboardModel.ExecuteParameters = [{
                "step_type": "filter",
                "field": "PurchasingDocumentCategory",
                "arguments": [{ "argument_type": "value", "field": "A" }],
                "operator": "equal_to",
                "execution_parameter_id": "eaf69c0f8119e5400cbc34c1776c6f466d",
                "is_execution_parameter": true
            }, {
                "step_type": "filter",
                "field": "ExecutionStatus",
                "arguments": [{ "argument_type": "value", "value": "es0ToBeExecuted" }],
                "operator": "equal_to",
                "execution_parameter_id": "eab630425629de488d901c70eed74cdca8",
                "is_execution_parameter": true
            }];

            var link = dashboardDetailsHandler.DefinitionGetLink(mockAngles[1], mockAngles[1].display_definitions[0]);
            var expectExecutionParameters = enumHandlers.ANGLEPARAMETER.ASK_EXECUTION + '=';

            expect(link).toContain(expectExecutionParameters);

        });

    });

    describe("call DefinitionOpenDisplay", function () {
        it("should set publication status", function () {
            dashboardDetailsHandler.DefinitionOpenDisplay({}, 'test_open_angle', true);

            var watcher = jQuery.storageWatcher('__watcher_dashboard_publications_test_open_angle');
            expect(watcher).toEqual(true);
        });
    });

    describe("call GetDefaultModel", function () {

        beforeEach(function () {
            dashboardDetailsHandler.Model.Data({});
        });

        it("if have 1 model available, should be set default", function () {
            var availableModels = [{
                "uri": "/models/1",
                "id": "EA2_800",
                "short_name": "EA2_800"
            }];

            var angles = [{
                "model": "/models/1",
                "id": "angle1"
            }, {
                "model": "/models/1",
                "id": "angle2"
            }];

            modelsHandler.SetData(availableModels, false);
            dashboardDetailsHandler.Model.Angles = angles;
            var defaultModel = dashboardDetailsHandler.GetDefaultModel(availableModels);
            expect(defaultModel).toEqual('/models/1');
        });

        it("if have 2 models available and dashbaord with 2 models in angles, should be undefined", function () {
            var availableModels = [{
                "uri": "/models/1",
                "id": "EA2_800",
                "short_name": "EA2_800"
            }, {
                "uri": "/models/2",
                "id": "EA3_800",
                "short_name": "EA3_800"
            }];

            spyOn(dashboardDetailsHandler.Model, "Data").and.callFake(function () {
                return {};
            });
            spyOn(dashboardDetailsHandler.Model, "GetModels").and.callFake(function () {
                return { length: 2 };
            });

            spyOn(modelsHandler, "GetModelByUri").and.callFake(function (value) {
                if (value === '/models/1')
                    return { "short_name": "EA2_800" };
                else if(value === '/models/2')
                    return { "short_name": "EA3_800" };
            });

            var defaultModel = dashboardDetailsHandler.GetDefaultModel(availableModels);
            expect(defaultModel).toEqual(undefined);
        });

        it("if have 2 models available and dashbaord with 1 models in angle, should be set default", function () {
            var availableModels = [{
                "uri": "/models/1",
                "id": "EA2_800",
                "short_name": "EA2_800"
            }, {
                "uri": "/models/2",
                "id": "EA3_800",
                "short_name": "EA3_800"
            }];

            var angles = [{
                "model": "/models/1",
                "id": "angle1"
            }, {
                "model": "/models/1",
                "id": "angle2"
            }];

            modelsHandler.SetData(availableModels, false);
            dashboardDetailsHandler.Model.Angles = angles;
            var defaultModel = dashboardDetailsHandler.GetDefaultModel(availableModels);
            expect(defaultModel).toEqual('/models/1');
        });
    });
});

