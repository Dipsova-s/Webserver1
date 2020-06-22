/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/DashboardModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/DashboardWidgetModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ProgressBar.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Search/DashboardExecutionHandler.js" />

describe("DashboardExecutionHandler", function () {
    var handler;
    beforeEach(function () {
        handler = new DashboardExecutionHandler();
    });

    describe("constructor", function () {
        it("should set default values", function () {
            // assert
            expect(handler.ModelUri).toEqual(null);
            expect(handler.Items).toEqual([]);
        });
    });
    describe(".Execute", function () {
        beforeEach(function () {
            handler.Items = [];
            spyOn(handler, 'SetValidItems');
            spyOn(handler, 'EnsureModelUri');
            spyOn(handler, 'CreateWithWarning');
            spyOn(handler, 'Create');
        });
        it("should not execute (invalid)", function () {
            // prepare
            spyOn(handler, 'Validate').and.returnValue(false);
            handler.Execute([]);

            // assert
            expect(handler.EnsureModelUri).not.toHaveBeenCalled();
            expect(handler.CreateWithWarning).not.toHaveBeenCalled();
            expect(handler.Create).not.toHaveBeenCalled();
        });
        it("should execute with warning", function () {
            // prepare
            spyOn(handler, 'Validate').and.returnValue(true);
            handler.Execute([{}]);

            // assert
            expect(handler.EnsureModelUri).toHaveBeenCalled();
            expect(handler.CreateWithWarning).toHaveBeenCalled();
            expect(handler.Create).not.toHaveBeenCalled();
        });
        it("should execute without warning", function () {
            // prepare
            spyOn(handler, 'Validate').and.returnValue(true);
            handler.Execute([]);

            // assert
            expect(handler.EnsureModelUri).toHaveBeenCalled();
            expect(handler.CreateWithWarning).not.toHaveBeenCalled();
            expect(handler.Create).toHaveBeenCalled();
        });
    });
    describe(".SetValidItems", function () {
        it("should set valid items", function () {
            // prepare
            var items = [
                { type: 'angle', is_template: false, displays: [{}] },
                { type: 'dashboard', is_template: false, displays: [{}] },
                { type: 'angle', is_template: true, displays: [{}] },
                { type: 'angle', is_template: false, displays: [] }
            ];
            handler.SetValidItems(items);

            // assert
            expect(handler.Items.length).toEqual(1);
        });
    });
    describe(".Validate", function () {
        it("should be false (items > limit)", function () {
            // prepare
            window.maxNumberOfDashboard = 2;
            spyOn(popup, 'Show');
            handler.Items = [{}, {}, {}, {}, {}];
            var result = handler.Validate();

            // assert
            expect(result).toEqual(false);
            expect(popup.Show).toHaveBeenCalled();
        });
        it("should be false (no item)", function () {
            // prepare
            spyOn(popup, 'Show');
            handler.Items = [];
            var result = handler.Validate();

            // assert
            expect(result).toEqual(false);
            expect(popup.Show).toHaveBeenCalled();
        });
        it("should be false (no model)", function () {
            // prepare
            spyOn(handler, 'IsValidModel').and.returnValue(false);
            spyOn(handler, 'ShowModelPopup');
            handler.Items = [{}, {}];
            var result = handler.Validate();

            // assert
            expect(result).toEqual(false);
            expect(handler.ShowModelPopup).toHaveBeenCalled();
        });
        it("should be true", function () {
            // prepare
            spyOn(handler, 'IsValidModel').and.returnValue(true);
            handler.Items = [{}, {}];
            var result = handler.Validate();

            // assert
            expect(result).toEqual(true);
        });
    });
    describe(".EnsureModelUri", function () {
        it("should not set model uri", function () {
            // prepare
            handler.Items = [{ model: '/models/2' }];
            handler.ModelUri = '/models/1';
            handler.EnsureModelUri();

            // assert
            expect(handler.ModelUri).toEqual('/models/1');
        });
        it("should set model uri", function () {
            // prepare
            handler.Items = [{ model: '/models/2' }];
            handler.ModelUri = '';
            handler.EnsureModelUri();

            // assert
            expect(handler.ModelUri).toEqual('/models/2');
        });
    });
    describe(".CreateWithWarning", function () {
        it("should show a confirmation popup", function () {
            // prepare
            spyOn(popup, 'Confirm').and.returnValue({ element: $(), setOptions: $.noop });
            handler.CreateWithWarning();

            // assert
            expect(popup.Confirm).toHaveBeenCalled();
        });
    });
    describe(".Create", function () {
        it("should create", function () {
            // prepare
            spyOn(progressbarModel, 'ShowStartProgressBar');
            spyOn(handler, 'LoadItems').and.returnValue($.when());
            spyOn(handler, 'CreateData').and.returnValue($.when());
            spyOn(handler, 'Redirect');
            handler.Create();

            // assert
            expect(progressbarModel.ShowStartProgressBar).toHaveBeenCalled();
            expect(handler.LoadItems).toHaveBeenCalled();
            expect(handler.CreateData).toHaveBeenCalled();
            expect(handler.Redirect).toHaveBeenCalled();
        });
    });
    describe(".LoadItems", function () {
        it("should load full data", function () {
            // prepare
            handler.Items = [{}, {}];
            spyOn(window, 'GetDataFromWebService').and.returnValue($.when('full-item-data'));
            handler.LoadItems()
                .done(function (result) {
                    // assert
                    expect(result).toEqual(['full-item-data', 'full-item-data']);
                });
        });
    });
    describe(".CreateData", function () {
        it("should get data", function (done) {
            // prepare
            var items = [
                { uri: '/angles/1' },
                { uri: '/angles/2' }
            ];
            handler.Items = [
                { uri: '/angles/3' },
                { uri: '/angles/1' },
                { uri: '/angles/2' }
            ];
            handler.ModelUri = '/models/1';
            spyOn(userModel, 'Data').and.returnValue({});
            spyOn(userSettingModel, 'GetByName').and.returnValue('en');
            spyOn(handler, 'GetDefaultDisplay').and.returnValues({ uri: '/displays/1' }, null);
            spyOn(dashboardModel, 'GetDefaultDashboardName').and.returnValue($.when('my-name'));
            spyOn(dashboardModel, 'GetDefaultLayoutConfig').and.returnValue({});
            spyOn(dashboardModel, 'GetBusinessProcesses').and.returnValue(['my-bp']);
            spyOn(dashboardModel, 'SetData');
            handler.CreateData(items)
                .done(function (result) {
                    // assert
                    expect(result.model).toEqual('/models/1');
                    expect(result.assigned_labels).toEqual(['my-bp']);
                    expect(result.layout).toEqual('{}');
                    expect(result.multi_lang_name[0].text).toEqual('my-name');
                    expect(result.widget_definitions.length).toEqual(2);
                    expect(result.widget_definitions[0].angle).toEqual('/angles/1');
                    expect(result.widget_definitions[0].display).toEqual('/displays/1');
                    expect(result.widget_definitions[0].widget_details).toEqual('{}');
                    expect(result.widget_definitions[0].widget_type).toEqual('angle_display');
                    expect(result.widget_definitions[0].multi_lang_name.length).toEqual(1);
                    expect(result.widget_definitions[0].multi_lang_description.length).toEqual(1);
                    expect(result.widget_definitions[1].angle).toEqual('/angles/2');
                    expect(result.widget_definitions[1].display).toEqual(null);
                    expect(result.widget_definitions[1].widget_details).toEqual('{}');
                    expect(result.widget_definitions[1].widget_type).toEqual('angle_display');
                    expect(result.widget_definitions[1].multi_lang_name.length).toEqual(1);
                    expect(result.widget_definitions[1].multi_lang_description.length).toEqual(1);
                    done();
                });
        });
    });
    describe(".GetDefaultDisplay", function () {
        it("should not get Display (null)", function () {
            // prepare
            var item = null;
            var result = handler.GetDefaultDisplay(item);

            // assert
            expect(result).toEqual(null);
        });
        it("should not get Display (no Display)", function () {
            // prepare
            var item = { display_definitions: [] };
            var result = handler.GetDefaultDisplay(item);

            // assert
            expect(result).toEqual(null);
        });
        it("should get Display (default procedure)", function () {
            // prepare
            var item = {
                display_definitions: [
                    { id: 'display1', display_type: 'list', user_specific: {} },
                    { id: 'display2', display_type: 'pivot', user_specific: {} }
                ]
            };
            var result = handler.GetDefaultDisplay(item);

            // assert
            expect(result.id).toEqual('display1');
        });
        it("should get the first Chart (is_user_default)", function () {
            // prepare
            var item = {
                display_definitions: [
                    { id: 'display1', display_type: 'chart', is_public: true, is_angle_default: true, user_specific: { is_user_default: true } },
                    { id: 'display2', display_type: 'chart', is_public: true, is_angle_default: true, user_specific: { is_user_default: false } },
                    { id: 'display3', display_type: 'chart', is_public: true, is_angle_default: false, user_specific: { is_user_default: false } },
                    { id: 'display4', display_type: 'chart', is_public: false, is_angle_default: false, user_specific: { is_user_default: false } },
                    { id: 'display5', display_type: 'chart', is_public: false, is_angle_default: false, user_specific: { is_user_default: false } }
                ]
            };
            var result = handler.GetDefaultDisplay(item);

            // assert
            expect(result.id).toEqual('display1');
        });
        it("should get the first Chart (is_angle_default)", function () {
            // prepare
            var item = {
                display_definitions: [
                    { id: 'display2', display_type: 'chart', is_public: true, is_angle_default: true, user_specific: { is_user_default: false } },
                    { id: 'display3', display_type: 'chart', is_public: true, is_angle_default: false, user_specific: { is_user_default: false } },
                    { id: 'display4', display_type: 'chart', is_public: false, is_angle_default: false, user_specific: { is_user_default: false } },
                    { id: 'display5', display_type: 'chart', is_public: false, is_angle_default: false, user_specific: { is_user_default: false } }
                ]
            };
            var result = handler.GetDefaultDisplay(item);

            // assert
            expect(result.id).toEqual('display2');
        });
        it("should get the first Chart (is_public)", function () {
            // prepare
            var item = {
                display_definitions: [
                    { id: 'display3', display_type: 'chart', is_public: true, is_angle_default: false, user_specific: { is_user_default: false } },
                    { id: 'display4', display_type: 'chart', is_public: false, is_angle_default: false, user_specific: { is_user_default: false } },
                    { id: 'display5', display_type: 'chart', is_public: false, is_angle_default: false, user_specific: { is_user_default: false } }
                ]
            };
            var result = handler.GetDefaultDisplay(item);

            // assert
            expect(result.id).toEqual('display3');
        });
        it("should get the first Chart", function () {
            // prepare
            var item = {
                display_definitions: [
                    { id: 'display4', display_type: 'chart', is_public: false, is_angle_default: false, user_specific: { is_user_default: false } },
                    { id: 'display5', display_type: 'chart', is_public: false, is_angle_default: false, user_specific: { is_user_default: false } }
                ]
            };
            var result = handler.GetDefaultDisplay(item);

            // assert
            expect(result.id).toEqual('display4');
        });
    });
    describe(".Redirect", function () {
        beforeEach(function () {
            spyOn(progressbarModel, 'SetProgressBarText');
            spyOn(WC.Utility, 'GetDashboardPageUri');
            spyOn(WC.Utility, 'RedirectUrl');
        });
        it("should redirect to Dashboard page", function () {
            // prepare
            spyOn(dashboardModel, 'GetDashboardExecutionParameters').and.returnValue({
                query_steps: []
            });
            handler.Redirect({});

            // assert
            expect(progressbarModel.SetProgressBarText).toHaveBeenCalled();
            expect(WC.Utility.RedirectUrl).toHaveBeenCalled();
        });
    });
    describe(".IsValidModel", function () {
        it("should be valid (model defined)", function () {
            // prepare
            spyOn(handler, 'GetValidModels').and.returnValue([]);
            handler.ModelUri = '/models/1';
            var result = handler.IsValidModel();

            // assert
            expect(result).toBeTruthy();
        });
        it("should be valid (nr. of models = 1)", function () {
            // prepare
            spyOn(handler, 'GetValidModels').and.returnValue([{}]);
            handler.ModelUri = null;
            var result = handler.IsValidModel();

            // assert
            expect(result).toBeTruthy();
        });
        it("should not be valid", function () {
            // prepare
            spyOn(handler, 'GetValidModels').and.returnValue([]);
            handler.ModelUri = null;
            var result = handler.IsValidModel();

            // assert
            expect(result).toBeFalsy();
        });
    });
    describe(".GetValidModels", function () {
        it("should get model uris", function () {
            // prepare
            handler.Items = [
                { model: '/models/1' },
                { model: '/models/2' },
                { model: '/models/1' }
            ];
            var result = handler.GetValidModels();

            // assert
            expect(result.length).toEqual(2);
        });
    });
    describe(".ShowModelPopup", function () {
        it("should show a popup", function () {
            // prepare
            spyOn(handler, 'GetModelPopupOptions');
            spyOn(popup, 'Show');
            handler.ShowModelPopup();

            // assert
            expect(popup.Show).toHaveBeenCalled();
        });
    });
    describe(".CloseModelPopup", function () {
        it("should close a popup", function () {
            // prepare
            spyOn(popup, 'Close');
            handler.CloseModelPopup();

            // assert
            expect(popup.Close).toHaveBeenCalled();
        });
    });
    describe(".GetModelPopupOptions", function () {
        it("should get a popup options", function () {
            // prepare
            var result = handler.GetModelPopupOptions();

            // assert
            expect(result.resizable).toEqual(false);
            expect(result.scrollable).toEqual(false);
        });
    });
    describe(".ShowModelPopupCallback", function () {
        it("should load models then create a model dropdown", function () {
            // prepare
            spyOn(modelsHandler, 'LoadModelsInfo').and.returnValue($.when());
            spyOn(handler, 'CreateModelDropdown');
            spyOn($.fn, 'busyIndicator');
            handler.ShowModelPopupCallback({ sender: { wrapper: $() } });

            // assert
            expect(modelsHandler.LoadModelsInfo).toHaveBeenCalled();
            expect(handler.CreateModelDropdown).toHaveBeenCalled();
            expect($.fn.busyIndicator).toHaveBeenCalledWith(true);
            expect($.fn.busyIndicator).toHaveBeenCalledWith(false);
        });
    });
    describe(".CreateModelDropdown", function () {
        it("should create a model dropdown", function () {
            // prepare
            spyOn(handler, 'GetModelDataSource');
            spyOn(WC.HtmlHelper, 'DropdownList');
            handler.CreateModelDropdown({ sender: { wrapper: $() } });

            // assert
            expect(WC.HtmlHelper.DropdownList).toHaveBeenCalled();
        });
    });
    describe(".GetModelDataSource", function () {
        it("should model data source", function () {
            // prepare
            handler.Models = [{}, {}];
            spyOn(modelsHandler, 'GetModelById').and.returnValues({ available: true }, {});
            var result = handler.GetModelDataSource();

            // assert
            expect(result.length).toEqual(3);
        });
    });
    describe(".DropdownModelChange", function () {
        beforeEach(function () {
            spyOn($.fn, 'removeClass');
            spyOn($.fn, 'addClass');
        });
        it("should set model uri and enable button", function () {
            // prepare
            handler.DropdownModelChange({ sender: { value: ko.observable('/models/1') } });

            // assert
            expect(handler.ModelUri).toEqual('/models/1');
            expect($.fn.removeClass).toHaveBeenCalled();
            expect($.fn.addClass).not.toHaveBeenCalled();
        });
        it("should unset model uri and disable button", function () {
            // prepare
            handler.DropdownModelChange({ sender: { value: ko.observable('') } });

            // assert
            expect(handler.ModelUri).toEqual('');
            expect($.fn.removeClass).not.toHaveBeenCalled();
            expect($.fn.addClass).toHaveBeenCalled();
        });
    });
    describe(".SetModel", function () {
        it("should not execute", function () {
            // prepare
            handler.ModelUri = '';
            spyOn(handler, 'Execute');
            handler.SetModel();

            // assert
            expect(handler.Execute).not.toHaveBeenCalled();
        });
        it("should execute", function () {
            // prepare
            handler.ModelUri = '/models/1';
            spyOn(handler, 'Execute');
            handler.SetModel();

            // assert
            expect(handler.Execute).toHaveBeenCalled();
        });
    });
});

