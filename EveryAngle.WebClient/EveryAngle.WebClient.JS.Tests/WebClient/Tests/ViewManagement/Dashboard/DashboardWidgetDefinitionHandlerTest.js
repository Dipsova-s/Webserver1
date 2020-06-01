/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SearchStorageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardwidgetmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardWidgetDefinitionHandler.js" />

describe("DashboardWidgetDefinitionHandler", function () {
    var handler;
    beforeEach(function () {
        var dashboardModel = new DashboardViewModel({});
        handler = new DashboardWidgetDefinitionHandler(dashboardModel);
    });

    describe(".Initial", function () {
        it("should initial", function () {
            // initial
            handler.Widget = { my: 'values' };
            spyOn(handler.Model, 'Initial');
            spyOn(handler, 'SetWidgets');
            spyOn(handler, 'ClosePopup');

            // actions
            handler.Initial();

            // assert
            expect(handler.Model.Initial).toHaveBeenCalled();
            expect(handler.SetWidgets).toHaveBeenCalled();
            expect(handler.ClosePopup).toHaveBeenCalled();
            expect(handler.Widget).toEqual({});
        });
    });
    describe(".SetWidgets", function () {
        it("should set widgets", function () {
            // initial
            handler.DashboardModel.Data().layout.widgets = ['widget0', 'widget1', 'widget2'];
            var widget1 = {
                GetWidgetName: function () { return 'widget1'; },
                GetAngle: function () { return null; },
                GetDisplay: function () { return null; }
            };
            var widget2 = {
                GetWidgetName: function () { return 'widget2'; },
                GetAngle: function () { return {}; },
                GetDisplay: function () { return { display_type: 'list', is_public: false }; }
            };
            spyOn(handler.Model, 'GetWidgetById').and.returnValues(null, widget1, widget2);

            // actions
            handler.SetWidgets();
            var result = handler.Widgets();

            // assert
            expect(result.length).toEqual(2);
            expect(result[0].id).toEqual('widget1');
            expect(result[0].icon_display).toEqual('');
            expect(result[0].icon_publish).toEqual('');
            expect(result[0].name).toEqual('widget1');
            expect(result[0].has_angle).toEqual(false);
            expect(result[1].id).toEqual('widget2');
            expect(result[1].icon_display).toEqual('icon-list');
            expect(result[1].icon_publish).toEqual('icon-private');
            expect(result[1].name).toEqual('widget2');
            expect(result[1].has_angle).toEqual(true);
        });
    });
    describe(".ApplyHandler", function () {
        it("should set html and apply handler", function () {
            // initial
            spyOn($.fn, 'html');
            spyOn(WC.HtmlHelper, 'ApplyKnockout');

            // actions
            handler.ApplyHandler($(), '.view');

            // assert
            expect($.fn.html).toHaveBeenCalled();
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
        });
    });
    describe(".ShowPopup", function () {
        beforeEach(function () {
            spyOn(handler, 'CreateWidgetModel').and.returnValue({
                selected: ko.observable(),
                widget_name: ko.observable()
            });
            spyOn(handler, 'ClosePopup');
            spyOn(popup, 'Show');
        });
        it("should not show popup", function () {
            // actions
            handler.Widget.id = 'widget1';
            handler.ShowPopup({ id: 'widget1' }, {});

            // assert
            expect(handler.ClosePopup).not.toHaveBeenCalled();
            expect(popup.Show).not.toHaveBeenCalled();
        });
        it("should show popup and set clicking outside event", function () {
            // actions
            handler.ShowPopup({ id: 'widget1' }, {});

            // assert
            expect(handler.ClosePopup).toHaveBeenCalled();
            expect(popup.Show).toHaveBeenCalled();
        });
    });
    describe(".GetPopupOptions", function () {
        it("should get options", function () {
            // actions
            var result = handler.GetPopupOptions($());

            // assert
            expect(result.title).toEqual(' ');
            expect(result.element).toEqual('#PopupDashboardWidget');
            expect(result.className).toEqual('dashboard-widget-popup');
            expect(result.scrollable).toEqual(false);
            expect(result.resizable).toEqual(false);
            expect(result.draggable).toEqual(false);
            expect(result.center).toEqual(false);
            expect(result.actions).toEqual(['Close']);
            expect(result.buttons.length).toEqual(1);
        });
    });
    describe(".OnPopupClose", function () {
        it("should close popup", function () {
            // initial
            handler.Widget = { any: true };
            spyOn($.fn, 'removeClass');
            spyOn(popup, 'Destroy');

            // actions
            handler.OnPopupClose($(), {});

            // assert
            expect(handler.Widget).toEqual({});
            expect($.fn.removeClass).toHaveBeenCalled();
            expect(popup.Destroy).toHaveBeenCalled();
        });
    });
    describe(".ClosePopup", function () {
        it("should close popup", function () {
            // initial
            spyOn(popup, 'Close');

            // actions
            handler.ClosePopup();

            // assert
            expect(popup.Close).toHaveBeenCalled();
        });
    });
    describe(".ShowPopupCallback", function () {
        it("should set title, position and scroll to item", function () {
            // initial
            var e = {
                sender: {
                    wrapper: $('<div/>'),
                    element: $(),
                    setOptions: $.noop
                }
            };
            handler.Widget.angle_name = 'my-angle-name';
            spyOn($.fn, 'html');
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            spyOn(e.sender, 'setOptions');
            spyOn(handler, 'GetPopupPosition');
            spyOn(handler, 'ScrollToSelectedItem');

            // actions
            handler.ShowPopupCallback($(), e);

            // assert
            expect(handler.$WidgetContainer.length).toEqual(1);
            expect($.fn.html).toHaveBeenCalledWith('my-angle-name');
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
            expect(e.sender.setOptions).toHaveBeenCalled();
            expect(handler.ScrollToSelectedItem).toHaveBeenCalled();
        });
    });
    describe(".GetPopupPosition", function () {
        var e;
        beforeEach(function () {
            e = {
                sender: { wrapper: $() }
            };
            WC.Window.Height = 600;
            spyOn($.fn, 'outerWidth').and.returnValue(300);
            spyOn($.fn, 'outerHeight').and.returnValues(20, 200);
        });
        it("should get position at bottom", function () {
            // initial
            spyOn($.fn, 'offset').and.returnValue({ left: 0, top: 200 });

            // actions
            var result = handler.GetPopupPosition($(), e);

            // assert
            expect(result.top).toEqual(260);
            expect(result.left).toEqual(5);
        });
        it("should get position at right", function () {
            // initial
            spyOn($.fn, 'offset').and.returnValue({ left: 0, top: 400 });

            // actions
            var result = handler.GetPopupPosition($(), e);

            // assert
            expect(result.top).toEqual(320);
            expect(result.left).toEqual(310);
        });
    });
    describe(".ScrollToSelectedItem", function () {
        beforeEach(function () {
            spyOn($.fn, 'outerHeight').and.returnValue(20);
            spyOn($.fn, 'scrollTop');
        });
        it("should not scroll", function () {
            // initial
            spyOn($.fn, 'index').and.returnValue(8);

            // actions
            handler.ScrollToSelectedItem();

            // assert
            expect($.fn.scrollTop).not.toHaveBeenCalled();
        });
        it("should scroll", function () {
            // initial
            spyOn($.fn, 'index').and.returnValue(9);

            // actions
            handler.ScrollToSelectedItem();

            // assert
            expect($.fn.scrollTop).toHaveBeenCalledWith(120);
        });
    });
    describe(".CreateWidgetModel", function () {
        it("should get widget model", function () {
            // initial
            var widget = {
                id: 'my-widget',
                display: '/displays/1',
                name: ko.observable(''),
                GetAngle: function () {
                    return {
                        display_definitions: [
                            {
                                query_blocks: [],
                                display_type: 'list',
                                is_angle_default: true,
                                used_in_task: true,
                                is_public: true,
                                is_parameterized: true,
                                uri: '/displays/1',
                                name: 'name-xx'
                            },
                            {
                                query_blocks: [],
                                display_type: 'chart',
                                is_angle_default: false,
                                used_in_task: false,
                                is_public: false,
                                is_parameterized: false,
                                uri: '/displays/2',
                                name: 'name-aa'
                            },
                            {
                                query_blocks: [],
                                display_type: 'pivot',
                                is_angle_default: false,
                                used_in_task: false,
                                is_public: false,
                                is_parameterized: false,
                                uri: '/displays/3',
                                name: 'name-bb'
                            }
                        ]
                    };
                },
                GetDefaultWidgetName: function () {
                    return 'my-default-name';
                },
                GetWidgetName: function () {
                    return 'my-name';
                }
            };
            spyOn(handler, 'GetAngleName').and.returnValue('my-angle');
            spyOn(WC.ModelHelper, 'HasFollowup').and.returnValues(true, false, false);
            spyOn(WC.ModelHelper, 'HasFilter').and.returnValues(false, true, false);
            spyOn(handler, 'GetLink').and.returnValues('/displays/1', '/displays/2', '/displays/3');
            spyOn(handler, 'GetParameterizedInfo').and.returnValues('parameter1', 'parameter2', 'parameter3');
            spyOn(handler, 'CanSelectDisplay').and.returnValues(true, false, false);
            spyOn(validationHandler, 'GetDisplayValidation').and.returnValues({ Level: 'error' }, { Level: 'warning' }, { Level: 'valid' });

            // actions
            var result = handler.CreateWidgetModel(widget);

            // assert
            expect(result.id).toEqual('my-widget');
            expect(result.angle_name).toEqual('my-angle');
            expect(result.default_name()).toEqual('my-default-name');
            expect(result.widget_name()).toEqual('my-name');
            expect(result.selected()).toEqual('/displays/1');
            expect(result.raw.widget_name).toEqual('');
            expect(result.raw.display).toEqual('/displays/1');
            expect(result.displays.length).toEqual(3);
            expect(result.displays[0]).toEqual({
                uri: '/displays/2',
                name: 'name-aa',
                default_name: ' - undefined - name-aa',
                icon_display: 'icon-chart',
                icon_publish: 'icon-private',
                icon_valid: 'validWarning',
                icon_filter: 'icon-filter',
                icon_parameters: 'none',
                is_public: false,
                link: '/displays/2',
                parameters: 'parameter2',
                enable: false
            });
            expect(result.displays[1]).toEqual({
                uri: '/displays/3',
                name: 'name-bb',
                default_name: ' - undefined - name-bb',
                icon_display: 'icon-pivot',
                icon_publish: 'icon-private',
                icon_valid: 'none',
                icon_filter: 'none',
                icon_parameters: 'none',
                is_public: false,
                link: '/displays/3',
                parameters: 'parameter3',
                enable: false
            });
            expect(result.displays[2]).toEqual({
                uri: '/displays/1',
                name: 'name-xx',
                default_name: ' - undefined - name-xx',
                icon_display: 'icon-list default schedule',
                icon_publish: 'none',
                icon_valid: 'validError',
                icon_filter: 'icon-followup',
                icon_parameters: 'icon-parameterized',
                is_public: true,
                link: '/displays/1',
                parameters: 'parameter1',
                enable: true
            });
        });
    });
    describe(".WidgetChange", function () {
        beforeEach(function () {
            handler.Widget.displays = [{
                uri: 'another-uri',
                default_name: 'another-name'
            }];
            spyOn(handler, 'CheckChange');
        });
        it("should not set a default name (no Display)", function () {
            // initial
            handler.Widget.widget_name = ko.observable('my-default');
            handler.Widget.default_name = ko.observable('my-default');

            // actions
            handler.WidgetChange('another-uri2');

            // assert
            expect(handler.Widget.widget_name()).toEqual('my-default');
            expect(handler.Widget.default_name()).toEqual('my-default');
            expect(handler.CheckChange).toHaveBeenCalled();
        });
        it("should not set a default name (default name != widget name)", function () {
            // initial
            handler.Widget.widget_name = ko.observable('my-name');
            handler.Widget.default_name = ko.observable('my-default');

            // actions
            handler.WidgetChange('another-uri');

            // assert
            expect(handler.Widget.widget_name()).toEqual('my-name');
            expect(handler.Widget.default_name()).toEqual('my-default');
            expect(handler.CheckChange).toHaveBeenCalled();
        });
        it("should set a default name (default name = widget name)", function () {
            // initial
            handler.Widget.widget_name = ko.observable('my-name');
            handler.Widget.default_name = ko.observable('my-name');

            // actions
            handler.WidgetChange('another-uri');

            // assert
            expect(handler.Widget.widget_name()).toEqual('another-name');
            expect(handler.Widget.default_name()).toEqual('another-name');
            expect(handler.CheckChange).toHaveBeenCalled();
        });
        it("should set a default name (widget name is empty)", function () {
            // initial
            handler.Widget.widget_name = ko.observable('');
            handler.Widget.default_name = ko.observable('my-default');

            // actions
            handler.WidgetChange('another-uri');

            // assert
            expect(handler.Widget.widget_name()).toEqual('another-name');
            expect(handler.Widget.default_name()).toEqual('another-name');
            expect(handler.CheckChange).toHaveBeenCalled();
        });
    });
    describe(".CheckChange", function () {
        it("should enable the apply button", function () {
            // initial
            spyOn(handler, 'HasChanged').and.returnValue(true);
            spyOn($.fn, 'removeClass');

            // actions
            handler.CheckChange();

            // assert
            expect($.fn.removeClass).toHaveBeenCalled();
        });
        it("should disable the apply button", function () {
            // initial
            spyOn(handler, 'HasChanged').and.returnValue(false);
            spyOn($.fn, 'addClass');

            // actions
            handler.CheckChange();

            // assert
            expect($.fn.addClass).toHaveBeenCalled();
        });
    });
    describe(".CheckWidgetName", function () {
        it("should not set a default name", function () {
            // initial
            handler.Widget.widget_name = ko.observable('old-name');
            handler.Widget.default_name = ko.observable('default-name');

            // actions
            handler.CheckWidgetName();

            // assert
            expect(handler.Widget.widget_name()).toEqual('old-name');
        });
        it("should set a default name", function () {
            // initial
            handler.Widget.widget_name = ko.observable(' ');
            handler.Widget.default_name = ko.observable('default-name');

            // actions
            handler.CheckWidgetName();

            // assert
            expect(handler.Widget.widget_name()).toEqual('default-name');
        });
    });
    describe(".GetAngleName", function () {
        it("should get Angle with private, parameters and error icons", function () {
            // initial
            var angle = {
                name: 'angle',
                is_template: false,
                is_published: false,
                is_parameterized: true
            };
            spyOn(modelsHandler, 'GetModelName').and.returnValue('EA2_800');
            spyOn(validationHandler, 'GetAngleValidation').and.returnValue({ Valid: false });

            // actions
            var result = handler.GetAngleName(angle);

            // assert
            expect(result).toContain('EA2_800 - angle');
            expect(result).toContain('icon-angle');
            expect(result).toContain('icon-private');
            expect(result).toContain('icon-parameterized');
            expect(result).toContain('validError');
        });
        it("should get Template", function () {
            // initial
            var angle = {
                name: 'template',
                is_template: true,
                is_published: true,
                is_parameterized: false
            };
            spyOn(modelsHandler, 'GetModelName').and.returnValue('EA2_800');
            spyOn(validationHandler, 'GetAngleValidation').and.returnValue({ Valid: true });

            // actions
            var result = handler.GetAngleName(angle);

            // assert
            expect(result).toContain('EA2_800 - template');
            expect(result).toContain('icon-template');
            expect(result).not.toContain('icon-private');
            expect(result).not.toContain('icon-parameterized');
            expect(result).not.toContain('validError');
        });
    });
    describe(".GetLink", function () {
        it("should get link (is_public=false)", function () {
            // initial
            var angle = { uri: '/models/1/angles/1' };
            var display = { uri: '/models/1/angles/1/displays/1', is_public: false };

            // actions
            var result = handler.GetLink(angle, display);

            // assert
            expect(result).toContain('angle=/models/1/angles/1');
            expect(result).toContain('display=/models/1/angles/1/displays/1');
            expect(result).toContain('target=publish');
            expect(result).toContain('editmode=true');
        });
        it("should get link (is_public=true)", function () {
            // initial
            var angle = { uri: '/models/1/angles/1' };
            var display = { uri: '/models/1/angles/1/displays/1', is_public: true };

            // actions
            var result = handler.GetLink(angle, display);

            // assert
            expect(result).toContain('angle=/models/1/angles/1');
            expect(result).toContain('display=/models/1/angles/1/displays/1');
            expect(result).not.toContain('target=publish');
            expect(result).toContain('editmode=true');
        });
    });
    describe(".GetParameterizedInfo", function () {
        it("should get parameters info", function () {
            // initial
            spyOn(handler.DashboardModel, 'GetAngleExecutionParametersInfo').and.returnValue('my-info');

            // actions
            var result = handler.GetParameterizedInfo({}, {});

            // assert
            expect(result).toEqual('my-info');
        });
        it("should not get parameters info", function () {
            // initial
            spyOn(handler.DashboardModel, 'GetAngleExecutionParametersInfo').and.returnValue(null);

            // actions
            var result = handler.GetParameterizedInfo({}, {});

            // assert
            expect(result).toEqual(null);
        });
    });
    describe(".CanUpdateWidget", function () {
        it("can update widget", function () {
            // initial
            spyOn(handler.DashboardModel, 'CanUpdateDashboard').and.returnValue(true);

            // actions
            var result = handler.CanUpdateWidget();

            // assert
            expect(result).toEqual(true);
        });
    });
    describe(".CanSelectDisplay", function () {
        it("can select display (is_published=false)", function () {
            // initial
            var display = { is_public: false };
            handler.Model.Data().is_published(false);
            spyOn(handler, 'CanUpdateWidget').and.returnValue(true);

            // actions
            var result = handler.CanSelectDisplay(display);

            // assert
            expect(result).toEqual(true);
        });
        it("can select display (is_published=true, is_public=true)", function () {
            // initial
            var display = { is_public: true };
            handler.Model.Data().is_published(true);
            spyOn(handler, 'CanUpdateWidget').and.returnValue(true);

            // actions
            var result = handler.CanSelectDisplay(display);

            // assert
            expect(result).toEqual(true);
        });
        it("cannot select display (no authorization)", function () {
            // initial
            var display = { is_public: false };
            handler.Model.Data().is_published(false);
            spyOn(handler, 'CanUpdateWidget').and.returnValue(false);

            // actions
            var result = handler.CanSelectDisplay(display);

            // assert
            expect(result).toEqual(false);
        });
        it("cannot select display (is_published=true, is_public=false)", function () {
            // initial
            var display = { is_public: false };
            handler.Model.Data().is_published(true);
            spyOn(handler, 'CanUpdateWidget').and.returnValue(true);

            // actions
            var result = handler.CanSelectDisplay(display);

            // assert
            expect(result).toEqual(false);
        });
    });
    describe(".OpenDisplay", function () {
        it("should open Display without parameters", function () {
            // initial
            var model = { parameters: null };
            spyOn(jQuery, 'storageWatcher');
            spyOn(jQuery, 'localStorage');

            // actions
            var result = handler.OpenDisplay(model);

            // assert
            expect(result).toEqual(true);
            expect(jQuery.storageWatcher).toHaveBeenCalled();
            expect(jQuery.localStorage).not.toHaveBeenCalled();
        });
        it("should open Display with parameters", function () {
            // initial
            var model = { parameters: 'my-parameters' };
            spyOn(jQuery, 'storageWatcher');
            spyOn(jQuery, 'localStorage');

            // actions
            var result = handler.OpenDisplay(model);

            // assert
            expect(result).toEqual(true);
            expect(jQuery.storageWatcher).toHaveBeenCalled();
            expect(jQuery.localStorage).toHaveBeenCalled();
        });
    });
    describe(".HasChanged", function () {
        it("should be true, changing Display", function () {
            // initial
            handler.Widget = {
                selected: ko.observable('/displays/2'),
                raw: {
                    display: '/displays/1',
                    widget_name: 'old-name'
                }
            };
            spyOn(handler, 'GetWidgetName').and.returnValue('old-name');

            // actions
            var result = handler.HasChanged();

            // assert
            expect(result).toEqual(true);
        });
        it("should be true, changing Widget name", function () {
            // initial
            handler.Widget = {
                selected: ko.observable('/displays/1'),
                raw: {
                    display: '/displays/1',
                    widget_name: 'old-name'
                }
            };
            spyOn(handler, 'GetWidgetName').and.returnValue('new-name');

            // actions
            var result = handler.HasChanged();

            // assert
            expect(result).toEqual(true);
        });
        it("should be false", function () {
            // initial
            handler.Widget = {
                selected: ko.observable('/displays/1'),
                raw: {
                    display: '/displays/1',
                    widget_name: 'old-name'
                }
            };
            spyOn(handler, 'GetWidgetName').and.returnValue('old-name');

            // actions
            var result = handler.HasChanged();

            // assert
            expect(result).toEqual(false);
        });
    });
    describe(".GetWidgetName", function () {
        it("should get empty", function () {
            // initial
            handler.Widget = {
                widget_name: ko.observable('my-default'),
                default_name: ko.observable('my-default')
            };

            // actions
            var result = handler.GetWidgetName();

            // assert
            expect(result).toEqual('');
        });
        it("should get widget name", function () {
            // initial
            handler.Widget = {
                widget_name: ko.observable('my-name'),
                default_name: ko.observable('my-default')
            };

            // actions
            var result = handler.GetWidgetName();

            // assert
            expect(result).toEqual('my-name');
        });
    });
    describe(".Apply", function () {
        beforeEach(function () {
            handler.Widget.selected = $.noop;
            spyOn(handler, 'GetWidgetName');
            spyOn(handler, 'ApplyCallback');
            spyOn(handler, 'ClosePopup');
        });
        it("should not apply", function () {
            // initial
            spyOn(handler, 'HasChanged').and.returnValue(false);

            // actions
            handler.Apply();

            // assert
            expect(handler.ApplyCallback).not.toHaveBeenCalled();
            expect(handler.ClosePopup).not.toHaveBeenCalled();
        });
        it("should apply", function () {
            // initial
            spyOn(handler, 'HasChanged').and.returnValue(true);

            // actions
            handler.Apply();

            // assert
            expect(handler.ApplyCallback).toHaveBeenCalled();
            expect(handler.ClosePopup).toHaveBeenCalled();
        });
    });
});
