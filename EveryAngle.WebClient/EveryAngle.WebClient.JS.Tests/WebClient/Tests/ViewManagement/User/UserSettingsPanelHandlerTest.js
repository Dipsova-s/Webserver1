/// <reference path="/../SharedDependencies/BusinessProcessesModel.js" />
/// <reference path="/../SharedDependencies/FieldsChooser.js" />

/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Search/searchquery.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />

/// <reference path="/Dependencies/ViewManagement/User/UserSettingView.js" />
/// <reference path="/Dependencies/ViewManagement/shared/DirectoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelLabelCategoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemCurrencyHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/shared/SystemInformationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/ListDrilldownHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/ListHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/ChartHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/PivotHandler.js" />

/// <reference path="/Dependencies/ViewManagement/User/UserSettingsPanelHandler.js" />

describe("UserSettingsPanelHandler", function () {
    var stateManagerTest;
    var viewManagerTest;
    var userSettingsPanelHandler;

    var setup = function () {
        stateManagerTest = new UserSettingsPanelStateManager();
        viewManagerTest = new UserSettingsPanelViewManager();

        spyOn(stateManagerTest, 'SaveSettings');
        spyOn(stateManagerTest, 'LoadSettings');

        userSettingsPanelHandler = new UserSettingsPanelHandler(
            stateManagerTest,
            viewManagerTest
        );
    };

    beforeEach(function () {
        spyOn(toast, 'MakeSuccessText');
        setup();
    });
    afterEach(setup);

    describe("get UpdateSampleDateSettings", function () {

        it("should have DATEDAYFORMAT", function () {
            userSettingsPanelHandler.UpdateSampleDateSettings();
            expect(userSettingsPanelHandler.DATEDAYFORMAT.length).toEqual(2);
        });

        it("should have FORMATSETTINGNUMBER", function () {
            userSettingsPanelHandler.UpdateSampleDateSettings();
            expect(userSettingsPanelHandler.DATEMONTHFORMAT.length).toEqual(3);
        });

        it("should have DATEYEARFORMAT ", function () {
            userSettingsPanelHandler.UpdateSampleDateSettings();
            expect(userSettingsPanelHandler.DATEYEARFORMAT.length).toEqual(2);
        });
    });

    describe("call SetLabel ", function () {

        beforeEach(function () {
            spyOn(directoryHandler, "GetDirectoryUri").and.callFake($.noop);
            spyOn(modelLabelCategoryHandler, "LoadAllLabelCategories").and.callFake($.noop);
            spyOn(modelLabelCategoryHandler, "LoadAllLabels").and.callFake($.noop);
        });

        it("when not load all label, retrun load all label", function () {
            var isLoadAllLabels = false;
            userSettingsPanelHandler.SetLabel(isLoadAllLabels).done(function () {
                expect(modelLabelCategoryHandler.LoadAllLabels).toHaveBeenCalled();
            });
        });
    });

    describe("call SetDataModel", function () {
        it("have model data, option should be enabled", function () {
            spyOn(modelsHandler, "GetData").and.callFake(function () {
                var model = [{ uri: '/models/1' }];
                return model;
            });
            userSettingsPanelHandler.SetDataModel();
            expect(userSettingsPanelHandler.DataModels.options.enabled).toEqual(true);
        });
        it("not have model data, option should be disabled", function () {
            spyOn(modelsHandler, "GetData").and.callFake(function () {
                var model = [];
                return model;
            });
            userSettingsPanelHandler.SetDataModel();
            expect(userSettingsPanelHandler.DataModels.options.enabled).toEqual(false);
        });
    });

    describe("call InitialControls ", function () {

        beforeEach(function () {

            spyOn(userSettingModel, "Data").and.callFake(function () {
                return {};
            });
            spyOn(userSettingsPanelHandler, "InitialControlUser").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsModel").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsLabelCategories").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsExecuteLastSearch").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsExecuteItem").and.callFake($.noop);

            spyOn(userSettingsPanelHandler, "InitialControlsBusinessProcess").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsLanguage").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsRowExportToExcel").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsFacetWarning").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsFieldChooser").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsTechnicalInfo").and.callFake($.noop);

            spyOn(userSettingsPanelHandler, "InitialControlsNumberGeneral").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsNumber").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsCurrency").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsPercentages").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsDate").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsTime").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "InitialControlsEnum").and.callFake($.noop);

            userSettingsPanelHandler.InitialControls();
        });

        it("InitialControlsExecuteLastSearch have been called", function () {
            expect(userSettingsPanelHandler.InitialControlsExecuteLastSearch).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsModel", function () {

        beforeEach(function () {

            spyOn(userSettingsPanelHandler, "GetDefaulModel").and.callFake(function () {
                return '/models/1';
            });

            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake(function () {
                var dropdownList = {
                    _enable: false,
                    enable: function (enable) {
                        this._enable = enable;
                    },
                    bind: $.noop,
                    trigger: $.noop
                };
                return dropdownList;
            });


            kendo.data = { DataSource: $.noop };
            userSettingsPanelHandler.DataModels = {};
            userSettingsPanelHandler.DataModels.data = [{
                uri: '/models/1',
                id: 'EA2_800',
                short_name: 'EA2_800'
            },
            {
                uri: '/models/2',
                id: 'EA3_800',
                short_name: 'EA3_800'
            }];
            userSettingsPanelHandler.DataModels.options = { enabled: true };
        });

        it("model dropdown should be enabled", function () {
            var dropdownList = userSettingsPanelHandler.InitialControlsModel();
            expect(dropdownList._enable).toEqual(true);
        });
    });

    describe("call GetDefaulModel ", function () {

        beforeEach(function () {
            spyOn(userSettingsPanelHandler, "DataModels").and.callFake(function () {
                return {
                    options: { enabled: true }
                };
            });
            spyOn(modelsHandler, "GetDefaultModel").and.callFake(function () {
                return {
                    uri: '/models/1'
                };
            });
        });

        it("should return default model", function () {
            var defaultModelValue = userSettingsPanelHandler.GetDefaulModel();
            expect(defaultModelValue).toEqual('/models/1');
        });

    });

    describe("call InitialControlsBusinessProcess", function () {

        beforeEach(function () {

            spyOn(userSettingsPanelHandler, "GetDefaulModel").and.callFake(function () {
                return '/models/1';
            });

            spyOn(userSettingModel, "GetByName").and.callFake(function () {
                return ["P2P", "S2D"];
            });

            var busineessProcessData = [{
                "id": "P2P"
            }, {
                "id": "S2D"
            }, {
                "id": "O2C"
            }, {
                "id": "F2R"
            }];
            businessProcessesModel.UserSetting = {};
            jQuery.localStorage('business_processes', busineessProcessData);
            businessProcessesModel.General.Data(busineessProcessData);
        });
        it("P2P Should active", function () {
            userSettingsPanelHandler.InitialControlsBusinessProcess();
            expect(businessProcessesModel.UserSetting.CurrentActive().P2P).toEqual(true);
        });

        it("O2C Should be inactive", function () {
            userSettingsPanelHandler.InitialControlsBusinessProcess();
            expect(businessProcessesModel.UserSetting.CurrentActive().O2C).toEqual(false);
        });
    });
    describe("call InitialControlsLanguage ", function () {

        beforeEach(function () {
            spyOn(systemLanguageHandler, "GetEnableLanguages").and.callFake(function () {
                return 'en';
            });
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
        });

        it("RenderFormatSettingDropdownlist should be called and set default as 'nl'", function () {
            var setting = { default_language: 'nl' };
            userSettingsPanelHandler.InitialControlsLanguage(setting);
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });

        it("RenderFormatSettingDropdownlist should be called and fallback with 'en'", function () {
            var setting = {};
            userSettingsPanelHandler.InitialControlsLanguage(setting);
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsRowExportToExcel", function () {

        beforeEach(function () {
            spyOn(userSettingModel, "RowsExportToExcel").and.callFake(function () {
                var rowOptions = [
                    { id: '0', name: '0 results' },
                    { id: '100', name: '100 results' },
                    { id: '1000', name: '1000 results' },
                    { id: '10000', name: '10000 results' }
                ];
                return rowOptions;
            });
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
        });

        it("RenderFormatSettingDropdownlist should be called", function () {
            var setting = { default_export_lines: 100 };
            userSettingsPanelHandler.InitialControlsRowExportToExcel(setting);
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });

        it("if not set default, RenderFormatSettingDropdownlist should be called", function () {
            var setting = {};
            userSettingsPanelHandler.InitialControlsRowExportToExcel(setting);
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });

    });

    describe("call InitialControlsFacetWarning", function () {

        beforeEach(function () {
            $('body').append('<input id="ShowFacetAngleWarnings" type="checkbox">');
        });

        afterEach(function () {
            $('#ShowFacetAngleWarnings').remove();
        });

        it("should set warning to enable", function () {
            var clientSettings = { show_facet_angle_warnings: true };
            userSettingsPanelHandler.InitialControlsFacetWarning(clientSettings);
            expect($('#ShowFacetAngleWarnings').is(':checked')).toEqual(true);
        });
    });

    describe("call InitialControlsFieldChooser", function () {

        beforeEach(function () {
            $('body').append('<input id="DefaultStarredfields" type="checkbox">');
            $('body').append('<input id="DefaultSuggestedfields" type="checkbox">');
        });

        afterEach(function () {
            $('#DefaultStarredfields').remove();
            $('#DefaultSuggestedfields').remove();
        });

        it("should set default suggest field to enable", function () {
            var clientSettings = { default_Starred_Fields: true };
            userSettingsPanelHandler.InitialControlsFieldChooser(clientSettings);
            expect($('#DefaultStarredfields').is(':checked')).toEqual(true);
        });

        it("should set default starred field to enable", function () {
            var clientSettings = { default_Suggested_Fields: true };
            userSettingsPanelHandler.InitialControlsFieldChooser(clientSettings);
            expect($('#DefaultSuggestedfields').is(':checked')).toEqual(true);
        });
    });

    describe("call InitialControlsTechnicalInfo ", function () {

        beforeEach(function () {
            $('body').append('<input id="SapFieldsInChooser" type="checkbox">');
            $('body').append('<input id="SapFieldsInHeader" type="checkbox">');
        });

        afterEach(function () {
            $('#SapFieldsInChooser').remove();
            $('#SapFieldsInHeader').remove();
        });

        it("should set default suggest field to enable", function () {
            var settings = { sap_fields_in_chooser: true };
            userSettingsPanelHandler.InitialControlsTechnicalInfo(settings);
            expect($('#SapFieldsInChooser').is(':checked')).toEqual(true);
        });

        it("should set default starred field to enable", function () {
            var settings = { sap_fields_in_header: true };
            userSettingsPanelHandler.InitialControlsTechnicalInfo(settings);
            expect($('#SapFieldsInHeader').is(':checked')).toEqual(true);
        });
    });

    describe("call InitialControlsNumberGeneral", function () {
        var decimalTemp;
        var thousanSeparatorTemp;
        beforeEach(function () {
            decimalTemp = enumHandlers.GENERAL_DEFAULT_SEPARATOR.DECIMAL;
            thousanSeparatorTemp = enumHandlers.GENERAL_DEFAULT_SEPARATOR.SEPARATOR;
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
        });

        afterEach(function () {
            enumHandlers.GENERAL_DEFAULT_SEPARATOR.DECIMAL = decimalTemp;
            enumHandlers.GENERAL_DEFAULT_SEPARATOR.SEPARATOR = thousanSeparatorTemp;
        });

        it("RenderFormatSettingDropdownlist should be called", function () {
            var setting = {
                general_thousand_seperator: ',',
                general_decimal_seperator: '.'
            };
            userSettingsPanelHandler.InitialControlsNumberGeneral(setting);
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
        it("when not have setting, RenderFormatSettingDropdownlist should be called", function () {
            var setting = {};
            enumHandlers.GENERAL_DEFAULT_SEPARATOR.DECIMAL = undefined;
            enumHandlers.GENERAL_DEFAULT_SEPARATOR.SEPARATOR = undefined;
            userSettingsPanelHandler.InitialControlsNumberGeneral(setting);
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsNumber", function () {

        beforeEach(function () {
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    decimals: '',
                    prefix: '',
                    thousandseparator: true
                };
            });
            $('body').append('<input id="enable_thousandseparator_for_number" type="checkbox">');
        });

        afterEach(function () {
            $('#enable_thousandseparator_for_number').remove();
        });

        it("should set thousand seperator for number to enable", function () {
            userSettingsPanelHandler.InitialControlsNumber();
            expect($('#enable_thousandseparator_for_number').is(':checked')).toEqual(true);
        });

        it("should call RenderFormatSettingDropdownlist", function () {
            userSettingsPanelHandler.InitialControlsNumber();
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });

    });

    describe("call InitialControlsCurrency", function () {

        beforeEach(function () {
            spyOn(popup, "Alert").and.callFake($.noop);

            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    decimals: '',
                    prefix: '',
                    thousandseparator: true
                };
            });
            spyOn(systemCurrencyHandler, "GetCurrencies").and.callFake(function () {
                return [{ name: 'euro', id: 'EUR' },
                { name: 'us dollar', id: 'USD' }];
            });

            $('body').append('<input id="enable_thousandseparator_for_currency" type="checkbox">');

        });

        afterEach(function () {
            $('#enable_thousandseparator_for_currency').remove();
        });

        it("should set thousand seperator for currency to enable", function () {
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake(function () {
                return { value: function () { return false; } };
            });
            userSettingsPanelHandler.InitialControlsCurrency();
            expect($('#enable_thousandseparator_for_currency').is(':checked')).toEqual(true);
            expect(popup.Alert).toHaveBeenCalled();
        });

        it("dropdown currency have value, should not call UserFieldSettingTabClick", function () {
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake(function () {
                return { value: function () { return true; } };
            });
            userSettingsPanelHandler.InitialControlsCurrency();
            expect(popup.Alert).not.toHaveBeenCalled();
        });

    });

    describe("call InitialControlsPercentages", function () {

        beforeEach(function () {
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    decimals: '',
                    prefix: '',
                    thousandseparator: true
                };
            });
            $('body').append('<input id="enable_thousandseparator_for_percentage" type="checkbox">');
        });

        afterEach(function () {
            $('#enable_thousandseparator_for_percentage').remove();
        });

        it("should set thousand seperator for percentage to enable", function () {
            userSettingsPanelHandler.InitialControlsPercentages();
            expect($('#enable_thousandseparator_for_percentage').is(':checked')).toEqual(true);
        });

        it("should call RenderFormatSettingDropdownlist", function () {
            userSettingsPanelHandler.InitialControlsPercentages();
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });

    });

    describe("call InitialControlsDate", function () {
        beforeEach(function () {
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    decimals: '',
                    prefix: '',
                    thousandseparator: true
                };
            });
        });

        it("should call RenderFormatSettingDropdownlist", function () {
            userSettingsPanelHandler.InitialControlsDate();
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsTime", function () {
        beforeEach(function () {
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    decimals: '',
                    prefix: '',
                    thousandseparator: true
                };
            });
        });

        it("should call RenderFormatSettingDropdownlist", function () {
            var setting = { format_enum: 'shn' };
            userSettingsPanelHandler.InitialControlsTime(setting);
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsEnum", function () {
        beforeEach(function () {
            spyOn(userSettingsPanelHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    format: 'shn'
                };
            });
        });

        it("should call RenderFormatSettingDropdownlist", function () {
            userSettingsPanelHandler.InitialControlsEnum();
            expect(userSettingsPanelHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsExecuteLastSearch ", function () {

        beforeEach(function () {
            $('body').append('<input id="autoExecuteLastSearch" type="checkbox">');
        });

        afterEach(function () {
            $('#autoExecuteLastSearch').remove();
        });

        it("should set execute last search to enable", function () {
            var setting = { auto_execute_last_search: true };
            userSettingsPanelHandler.InitialControlsExecuteLastSearch(setting);
            expect($('#autoExecuteLastSearch').is(':checked')).toEqual(true);
        });
    });

    describe("call InitialControlsExecuteItem", function () {

        beforeEach(function () {
            $('body').append('<input id="autoExecuteItemsOnLogin" type="checkbox">');
            $('body').append('<div class="settingsPanelActionsAtLoginDisplaysWrapper"></div>');
            $('body').append('<span class="settingsPanelNoExecuteAtLogin"></span>');
            spyOn(ko, 'cleanNode');
            spyOn(ko, 'applyBindings');
        });

        afterEach(function () {
            $('#autoExecuteItemsOnLogin').remove();
            $('.settingsPanelActionsAtLoginDisplaysWrapper').remove();
            $('.settingsPanelNoExecuteAtLogin').remove();
        });

        it("should set execute item to enable", function () {
            var setting = { auto_execute_items_on_login: true };
            userSettingsPanelHandler.InitialControlsExecuteItem(setting);
            expect($('#autoExecuteItemsOnLogin').is(':checked')).toEqual(true);
        });
    });

    describe("call RenderFormatSettingDropdownlist", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (elementId, datas, kendoDropDownOption) {
                return {
                    setDataSource: $.noop,
                    enable: $.noop,
                    bind: $.noop,
                    trigger: $.noop,
                    elementId: elementId,
                    datas: datas,
                    kendoDropDownOption: kendoDropDownOption
                };
            });
        });

        var elementId = 'SystemModel',
            models = [{
                uri: '/models/1',
                id: 'EA2_800',
                short_name: 'EA2_800'
            },
            {
                uri: '/models/2',
                id: 'EA3_800',
                short_name: 'EA3_800'
            }],
            userSettingDefault = '/models/2',
            dataTextField = 'short_name',
            dataValueField = 'uri';

        $('body').append('<div id="SystemModel"></div>');

        it("should set text field dropdown option", function () {
            var ddl = userSettingsPanelHandler.RenderFormatSettingDropdownlist(elementId, models, userSettingDefault, dataTextField, dataValueField);
            expect(ddl.kendoDropDownOption.dataTextField).toEqual('short_name');
            expect(ddl.kendoDropDownOption.dataValueField).toEqual('uri');
            expect(ddl.kendoDropDownOption.index).toEqual(1);
        });

        it("should set initail option", function () {
            var ddl = userSettingsPanelHandler.RenderFormatSettingDropdownlist(elementId, models, userSettingDefault, dataTextField, dataValueField, true);
            expect(ddl.kendoDropDownOption.optionLabel).toBeDefined();
        });

        it("when not set textField or dataField, option should be name and id", function () {
            var ddl = userSettingsPanelHandler.RenderFormatSettingDropdownlist(elementId, models, userSettingDefault, null, null);
            expect(ddl.kendoDropDownOption.dataTextField).toEqual('name');
            expect(ddl.kendoDropDownOption.dataValueField).toEqual('id');
        });

        it("when dropdown change, ChangeDropdownFormat should be called", function () {
            spyOn(userSettingsPanelHandler, "ChangeDropdownFormat").and.callFake($.noop);
            var ddl = userSettingsPanelHandler.RenderFormatSettingDropdownlist(elementId, models, userSettingDefault, null, null);
            var e = { sender: { wrapper: { context: {} } } };
            ddl.kendoDropDownOption.change(e);
            expect(userSettingsPanelHandler.ChangeDropdownFormat).toHaveBeenCalled();
        });

    });

    describe("call SetDefaultItemDropdownList", function () {

        it("should get dropdown if element exist", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () { return { value: $.noop }; });
            var result = userSettingsPanelHandler.SetDefaultItemDropdownList('#id', 'value');
            expect(result).not.toEqual(null);
        });

        it("should not get dropdown if element does not exist", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () { return null; });
            var result = userSettingsPanelHandler.SetDefaultItemDropdownList('#id', 'value');
            expect(result).toEqual(null);
        });

    });

    describe("call GetDefaulModel", function () {

        beforeEach(function () {
            userSettingsPanelHandler.DataModels = {
                options:
                    { enabled: true },
                data: [{
                    uri: '/models/1',
                    id: 'EA2_800',
                    short_name: 'EA2_800'
                },
                {
                    uri: '/models/2',
                    id: 'EA3_800',
                    short_name: 'EA3_800'
                }]
            };

            spyOn(modelsHandler, "GetDefaultModel").and.callFake(function () { });
        });

        it("if not have defaul model, should get first model", function () {
            var defaulModel = userSettingsPanelHandler.GetDefaulModel();
            expect(defaulModel).toEqual('/models/1');
        });

        it("if data model is disabled, should not get defaul model", function () {
            userSettingsPanelHandler.DataModels.options.enabled = false;
            var defaulModel = userSettingsPanelHandler.GetDefaulModel();
            expect(defaulModel).toEqual(null);

        });
    });

    describe("call SaveUserSettings", function () {

        beforeEach(function () {
            spyOn(popup, 'Alert').and.callFake($.noop);
            spyOn(requestHistoryModel, 'SaveLastExecute').and.callFake($.noop);
            spyOn(userSettingModel, 'Data').and.callFake(function () { return {}; });
            spyOn(userSettingsPanelHandler, 'SetDefaultBusinessProcess').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetLanguage').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetNumberExportExcel').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetTechnicalInfoSapFieldChooser').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetTechnicalInfoSapFieldHeader').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetEnumFormat').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetCurrencyType').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetNumberFormat').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetCurrencyFormat').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetPercentFormat').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetDateFormat').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetTimeFormat').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetAutoExecuteLastSearch').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetAutoExecuteAtLogin').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SetClientSetting').and.callFake($.noop);
            spyOn(userSettingModel, 'ReloadAfterChanged').and.callFake($.noop);
            spyOn(window, 'SetLoadingVisibility').and.callFake($.noop);
            spyOn(userSettingModel, 'PutExecuteAtLogin').and.callFake($.noop);
            spyOn(userSettingModel, 'Save').and.callFake($.noop);
            spyOn(userSettingsPanelHandler, 'SaveUserSettingsCallback').and.callFake($.noop);
        });

        it("SaveUserSettingsCallback have been called", function () {
            spyOn(userSettingModel, 'TempRemoveList').and.callFake(function () { return { length: 1 }; });
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#GeneralDecimalSeperatorDropdown')
                            return '.';
                        if (val === '#GeneralThousandSeperatorDropdown')
                            return ',';
                        if (val === '#DefaultCurrencySelect')
                            return 'EUR';
                        return null;
                    }
                };
                return value;
            });
            spyOn(userSettingsPanelHandler, 'IsInvalidUserCurrency').and.callFake(function () { return false; });

            userSettingsPanelHandler.SaveUserSettings();
            expect(userSettingsPanelHandler.SaveUserSettingsCallback).toHaveBeenCalled();
        });

        it("when not have remove list, ReloadAfterChanged have not been called", function () {
            spyOn(userSettingModel, 'TempRemoveList').and.callFake(function () { return {}; });
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#GeneralDecimalSeperatorDropdown')
                            return '.';
                        if (val === '#GeneralThousandSeperatorDropdown')
                            return ',';
                        if (val === '#DefaultCurrencySelect')
                            return 'EUR';
                        return null;
                    }
                };
                return value;
            });

            userSettingsPanelHandler.SaveUserSettings();
            expect(userSettingModel.ReloadAfterChanged).not.toHaveBeenCalled();
        });

        it("when decimal seperator eqaul to thousand seperator, alert popup have been called", function () {
            spyOn(userSettingModel, 'TempRemoveList').and.callFake(function () { return { length: 1 }; });
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#GeneralDecimalSeperatorDropdown')
                            return '.';
                        if (val === '#GeneralThousandSeperatorDropdown')
                            return '.';
                        if (val === '#DefaultCurrencySelect')
                            return 'EUR';
                        return null;
                    }
                };
                return value;
            });

            userSettingsPanelHandler.SaveUserSettings();
            expect(popup.Alert).toHaveBeenCalled();
        });

        it("when not have currency, alert popup have been called", function () {
            spyOn(userSettingModel, 'TempRemoveList').and.callFake(function () { return { length: 1 }; });
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#GeneralDecimalSeperatorDropdown')
                            return '.';
                        if (val === '#GeneralThousandSeperatorDropdown')
                            return ',';
                        return null;
                    }
                };
                return value;
            });
            userSettingsPanelHandler.SaveUserSettings();
            expect(popup.Alert).toHaveBeenCalled();
        });

    });

    describe("call SetDefaultBusinessProcess", function () {

        beforeEach(function () {
            businessProcessesModel.UserSetting = {
                GetActive: $.noop
            };
            spyOn(businessProcessesModel.UserSetting, "GetActive").and.callFake(function () {
                return ["S2D"];
            });
        });

        it("should set business process", function () {
            var defaultUserSetting = { default_business_processes: 'P2P' },
                userSettings = {};
            userSettingsPanelHandler.SetDefaultBusinessProcess(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES].toString()).toEqual('S2D');
        });

        it("when select default setting, should not set business process", function () {
            var defaultUserSetting = { default_business_processes: 'S2D' },
                userSettings = {};
            userSettingsPanelHandler.SetDefaultBusinessProcess(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES]).toEqual(undefined);
        });
    });
    describe("call SetLanguage", function () {
        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                var value = {
                    value: function () {
                        return "en";
                    }
                };
                return value;
            });
        });

        it("should set Language", function () {
            var defaultUserSetting = { default_language: "da" },
                userSettings = {};
            userSettingsPanelHandler.SetLanguage(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES]).toEqual("en");
        });
        it("when select default setting, should not set Language", function () {
            var defaultUserSetting = { default_language: "en" },
                userSettings = {};
            userSettingsPanelHandler.SetLanguage(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES]).toEqual(undefined);
        });
    });

    describe("call SetNumberExportExcel", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                var value = {
                    value: function () {
                        return "1000";
                    }
                };
                return value;
            });
        });

        it("should set number export to excel replace user setting", function () {
            var defaultUserSetting = { default_export_lines: 100 },
                userSettings = {};
            userSettingsPanelHandler.SetNumberExportExcel(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES]).toEqual(1000);
        });

        it("should set number export to excel using user setting", function () {
            var defaultUserSetting = { default_export_lines: 1000 },
                userSettings = {};
            userSettingsPanelHandler.SetNumberExportExcel(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES]).toEqual(undefined);
        });
    });

    describe("call SetTechnicalInfoSapFieldChooser", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return true;
            });
        });

        it("should set technical info sap field chooser", function () {
            var defaultUserSetting = { sap_fields_in_chooser: false },
                userSettings = {};
            userSettingsPanelHandler.SetTechnicalInfoSapFieldChooser(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_CHOOSER]).toEqual(true);
        });
        it("when select default setting, should not set technical info sap field chooser", function () {
            var defaultUserSetting = { sap_fields_in_chooser: true },
                userSettings = {};
            userSettingsPanelHandler.SetTechnicalInfoSapFieldChooser(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_CHOOSER]).toEqual(undefined);
        });
    });

    describe("call SetTechnicalInfoSapFieldHeader", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return true;
            });
        });

        it("should set technical info sap field header", function () {
            var defaultUserSetting = { sap_fields_in_header: false },
                userSettings = {};
            userSettingsPanelHandler.SetTechnicalInfoSapFieldHeader(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_HEADER]).toEqual(true);
        });

        it("when select default setting, should not set technical info sap field header", function () {
            var defaultUserSetting = { sap_fields_in_header: true },
                userSettings = {};
            userSettingsPanelHandler.SetTechnicalInfoSapFieldHeader(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_HEADER]).toEqual(undefined);
        });
    });

    describe("call SetEnumFormat", function () {

        it("should set enum format", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                var value = {
                    value: function () {
                        return "shnln";
                    }
                };
                return value;
            });
            var defaultUserSetting = { format_enum: "shn" },
                userSettings = {};
            userSettingsPanelHandler.SetEnumFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_ENUM]).toEqual("shnln");
        });

        it("when use default setting, should not set enum format", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                var value = {
                    value: function () {
                        return "shnln";
                    }
                };
                return value;
            });
            var defaultUserSetting = { format_enum: "shnln" },
                userSettings = {};
            userSettingsPanelHandler.SetEnumFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_ENUM]).toEqual(undefined);
        });
    });

    describe("call SetCurrencyType", function () {

        it("should set currency type", function () {
            var defaultUserSetting = { default_currency: "USD" },
                userSettings = [],
                selectedCurrency = "EUR";
            userSettingsPanelHandler.SetCurrencyType(defaultUserSetting, userSettings, selectedCurrency);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_CURRENCY]).toEqual("EUR");
        });

        it("select default setting, should not set currency type", function () {
            var defaultUserSetting = { default_currency: "USD" },
                userSettings = [],
                selectedCurrency = "USD";
            userSettingsPanelHandler.SetCurrencyType(defaultUserSetting, userSettings, selectedCurrency);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_CURRENCY]).toEqual(undefined);
        });
    });

    describe("call SetNumberFormat", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return false;
            });
        });

        it("should set number format", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#NumbersSelect')
                            return "0";
                        else if (val === '#NumberFormatDisplayUnitSelect')
                            return "N";
                        else
                            return null;
                    }
                };
                return value;
            });

            var defaultUserSetting = {},
                userSettings = {};
            userSettingsPanelHandler.SetNumberFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_NUMBERS]).toEqual("{\"decimals\":0,\"prefix\":null,\"thousandseparator\":false}");
        });

        it("when not change setting, should not set number format", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#NumbersSelect')
                            return "0";
                        else if (val === '#NumberFormatDisplayUnitSelect')
                            return "K";
                        else
                            return null;
                    }
                };
                return value;
            });

            var defaultUserSetting = { format_numbers: '{"decimals":0,"prefix":"K","thousandseparator":false}' },
                userSettings = {};
            userSettingsPanelHandler.SetNumberFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_NUMBERS]).toEqual(undefined);
        });
    });

    describe("call SetCurrencyFormat", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return false;
            });
        });

        it("should set number format", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#CurrencyUnitSelect')
                            return "0";
                        else if (val === '#CurrencyFormatDisplayUnitSelect')
                            return "N";
                        else
                            return null;
                    }
                };
                return value;
            });
            var defaultUserSetting = {},
                userSettings = {};
            userSettingsPanelHandler.SetCurrencyFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_CURRENCIES]).toEqual("{\"decimals\":0,\"prefix\":null,\"thousandseparator\":false}");
        });

        it("when not change setting, should not set number format", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#CurrencyUnitSelect')
                            return "0";
                        else if (val === '#CurrencyFormatDisplayUnitSelect')
                            return "K";
                        else
                            return null;
                    }
                };
                return value;
            });
            var defaultUserSetting = { format_currencies: '{"decimals":0,"prefix":"K","thousandseparator":false}' },
                userSettings = {};
            userSettingsPanelHandler.SetCurrencyFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_CURRENCIES]).toEqual(undefined);
        });
    });

    describe("call SetPercentFormat", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return false;
            });
        });

        it("should set percent format", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#PercentagesSelect')
                            return "0";
                        else if (val === '#PercentagesFormatDisplayUnitSelect')
                            return "N";
                        else
                            return null;
                    }
                };
                return value;
            });
            var defaultUserSetting = {},
                userSettings = {};
            userSettingsPanelHandler.SetPercentFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_PERCENTAGES]).toEqual("{\"decimals\":0,\"prefix\":null,\"thousandseparator\":false}");
        });

        it("when not change setting, should not set percent format", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#PercentagesSelect')
                            return "0";
                        else if (val === '#PercentagesFormatDisplayUnitSelect')
                            return "K";
                        else
                            return null;
                    }
                };
                return value;
            });
            var defaultUserSetting = { format_percentages: '{"decimals":0,"prefix":"K","thousandseparator":false}' },
                userSettings = {};
            userSettingsPanelHandler.SetPercentFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_PERCENTAGES]).toEqual(undefined);
        });
    });

    describe("call SetDateFormat", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#DateFormatOrderDropdown')
                            return "MDY";
                        else if (val === '#DateFormatDayDropdown')
                            return "dd";
                        else if (val === '#DateFormatMonthDropdown')
                            return "MM";
                        else if (val === '#DateFormatYearDropdown')
                            return "yyyy";
                        else if (val === '#DateFormatSeparatorDropdown')
                            return "/";
                        else
                            return null;
                    }
                };
                return value;
            });
        });

        it("should set date format", function () {
            var defaultUserSetting = {},
                userSettings = {};
            userSettingsPanelHandler.SetDateFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_DATE]).toEqual("{\"order\":\"MDY\",\"day\":\"dd\",\"month\":\"MM\",\"year\":\"yyyy\",\"separator\":\"/\"}");
        });

        it("when not change setting, should not set date format", function () {
            var defaultUserSetting = { format_date: '{"order":"MDY","day":"dd","month":"MM","year":"yyyy","separator":"/"}' },
                userSettings = {};
            userSettingsPanelHandler.SetDateFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_DATE]).toEqual(undefined);
        });
    });

    describe("call SetTimeFormat", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#TimeFormatHoursDropdown')
                            return "HH";
                        else if (val === '#TimeFormatSecondsDropdown')
                            return "";
                        else if (val === '#TimeFormatSeparatorDropdown')
                            return ":";
                        else
                            return null;
                    }
                };
                return value;
            });
        });

        it("should set time format", function () {
            var defaultUserSetting = {},
                userSettings = {};
            userSettingsPanelHandler.SetTimeFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_TIME]).toEqual("{\"hour\":\"HHmm\",\"separator\":\":\",\"second\":\"\"}");
        });

        it("when not change setting, should not set time format", function () {
            var defaultUserSetting = { format_time: '{"hour":"HHmm","separator":":","second":""}' },
                userSettings = {};
            userSettingsPanelHandler.SetTimeFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_TIME]).toEqual(undefined);
        });
    });

    describe("call SetAutoExecuteLastSearch", function () {

        it("should set auto execute last search", function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return true;
            });
            var defaultUserSetting = { auto_execute_last_search: false },
                userSettings = {};
            userSettingsPanelHandler.SetAutoExecuteLastSearch(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.AUTO_EXECUTE_LAST_SEARCH]).toEqual(true);
        });

        it("when not change setting, should not set auto execute last search", function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return false;
            });
            var defaultUserSetting = { auto_execute_last_search: false },
                userSettings = {};
            userSettingsPanelHandler.SetAutoExecuteLastSearch(defaultUserSetting, userSettings);
            expect(userSettings).toEqual({});
        });
    });

    describe("call SetAutoExecuteAtLogin", function () {

        it("should set auto execute at login", function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return true;
            });
            var defaultUserSetting = { auto_execute_items_on_login: false },
                userSettings = {};
            userSettingsPanelHandler.SetAutoExecuteAtLogin(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.AUTO_EXECUTE_ITEMS_ON_LOGIN]).toEqual(true);
        });

        it("if not change setting, should not set auto execute at login", function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return false;
            });
            var defaultUserSetting = { auto_execute_items_on_login: false },
                userSettings = {};
            userSettingsPanelHandler.SetAutoExecuteAtLogin(defaultUserSetting, userSettings);
            expect(userSettings).toEqual({});
        });
    });

    describe("call SetClientSetting", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function (value) {
                if (value === '#ShowFacetAngleWarnings')
                    return true;
                if (value === '#DefaultStarredfields')
                    return true;
                if (value === '#DefaultSuggestedfields')
                    return true;
                return null;
            });

            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#sapLanguageDropdown')
                            return '';
                    }
                };
                return value;
            });

            window.enableGoToSAP = true;
        });

        it("should set client setting", function () {
            var defaultUserSetting = { client_settings: "{\"general_decimal_seperator\":\",\",\"general_thousand_seperator\":\".\"}" },
                userSettings = [],
                generalDecimalSeparator = ".",
                generalThousandSeparator = ",";
          
            userSettingsPanelHandler.SetClientSetting(defaultUserSetting, userSettings, generalDecimalSeparator, generalThousandSeparator);

            var result = {
                default_Starred_Fields: true,
                default_Suggested_Fields: true,
                general_decimal_seperator: ".",
                general_thousand_seperator: ",",
                show_facet_angle_warnings: true,
                sap_logon_user: '',
                sap_logon_language: ''
            };
            
            expect(JSON.parse(userSettings[enumHandlers.USERSETTINGS.CLIENT_SETTINGS])).toEqual(result);
        });

        it("setting is not changed, use the current setting", function () {
            var defaultUserSetting = { client_settings: "{\"show_facet_angle_warnings\":true,\"default_Starred_Fields\":true,\"default_Suggested_Fields\":true,\"general_decimal_seperator\":\".\",\"general_thousand_seperator\":\",\",\"sap_logon_user\":\"\",\"sap_logon_language\":\"\"}" },
                userSettings = [],
                generalDecimalSeparator = ".",
                generalThousandSeparator = ",";

            userSettingsPanelHandler.SetClientSetting(defaultUserSetting, userSettings, generalDecimalSeparator, generalThousandSeparator);
            expect(userSettings).toEqual([]);
        });
    });

    describe("call SaveUserSettingsCallback", function () {
        var searchPageHandlerTemp;
        var anglePageHandlerTemp;
        var dashboardHandlerTemp;
        var data;
        beforeEach(function () {
            spyOn(userSettingsPanelHandler, "ClearLocalStorageAfterChangeUserSetting").and.callFake($.noop);
            spyOn(searchQueryModel, "Search").and.callFake($.noop);
            spyOn(searchQueryModel, "SetUIOfAdvanceSearchFromParams").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "RenderSingleDrilldown").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "RenderDisplayView").and.callFake($.noop);
            spyOn(window, "ReloadWebPage").and.callFake($.noop);
            data = { default_language: 'en' };
            searchPageHandlerTemp = window.searchPageHandler;
            anglePageHandlerTemp = window.anglePageHandler;
            anglePageHandlerTemp = window.anglePageHandler;
        });

        afterEach(function () {
            window.searchPageHandler = searchPageHandlerTemp;
            window.anglePageHandler = anglePageHandlerTemp;
            window.dashboardHandler = dashboardHandlerTemp;
        });

        it("reload after change, function ReloadWebPage have been called", function () {
            spyOn(userSettingModel, "ReloadAfterChanged").and.callFake(function () { return true; });
            userSettingsPanelHandler.SaveUserSettingsCallback(data);
            expect(window.ReloadWebPage).toHaveBeenCalled();
        });
        it("in angle page, function RenderDisplayView have been called", function () {
            spyOn(userSettingModel, "ReloadAfterChanged").and.callFake(function () { return false; });
            window.searchPageHandler = undefined;
            window.anglePageHandler = {};
            userSettingsPanelHandler.SaveUserSettingsCallback(data);
            expect(userSettingsPanelHandler.RenderDisplayView).toHaveBeenCalled();
        });
        it("in dashboard page, function ReApplyResult have been called", function () {
            spyOn(userSettingModel, "ReloadAfterChanged").and.callFake(function () { return false; });
            window.searchPageHandler = undefined;
            window.anglePageHandler = undefined;
            window.dashboardHandler = { ReApplyResult: $.noop };
            spyOn(dashboardHandler, "ReApplyResult").and.callFake(function () { });
            userSettingsPanelHandler.SaveUserSettingsCallback(data);
            expect(dashboardHandler.ReApplyResult).toHaveBeenCalled();
        });
        it("should do nothing if in others page", function () {
            spyOn(userSettingModel, "ReloadAfterChanged").and.callFake(function () { return false; });
            window.searchPageHandler = undefined;
            window.anglePageHandler = undefined;
            window.dashboardHandler = undefined;
            userSettingsPanelHandler.SaveUserSettingsCallback(data);

            expect(userSettingsPanelHandler.RenderDisplayView).not.toHaveBeenCalled();
        });
    });

    describe("call ClearLocalStorageAfterChangeUserSetting", function () {

        beforeEach(function () {
            jQuery.localStorage('mouse', 'mouse');
            jQuery.localStorage('user', 'EAAdmin');
            jQuery.localStorage('session_uri', '/session/1');
            userSettingsPanelHandler.ClearLocalStorageAfterChangeUserSetting();
        });

        it("should not clear user", function () {
            expect(jQuery.localStorage(userModel.DirectoryName)).toEqual('EAAdmin');
        });
        it("should clear mouse", function () {
            expect(jQuery.localStorage('mouse')).toEqual(null);
        });
    });
    describe("call RenderDisplayView", function () {

        beforeEach(function () {
            fieldsChooserModel.GridName = 'myGrid';
            spyOn(listHandler, "GetListDisplay").and.callFake($.noop);
            spyOn(chartHandler, "GetChartDisplay").and.callFake($.noop);
            spyOn(pivotPageHandler, "GetPivotDisplay").and.callFake($.noop);
            spyOn(angleInfoModel, "UpdateAngleQuerySteps").and.callFake($.noop);
            spyOn(resultModel, "SetResultExecution").and.callFake($.noop);
        });

        it("not have model data, SetResultExecution should not becalled", function () {
            spyOn(displayModel, "Data").and.callFake(function () { return false; });
            userSettingsPanelHandler.RenderDisplayView();
            expect(resultModel.SetResultExecution).not.toHaveBeenCalled();
        });

        it("grid name is drilldown, SetResultExecution should not becalled", function () {
            fieldsChooserModel.GridName = enumHandlers.FIELDCHOOSERNAME.LISTDRILLDOWN;
            userSettingsPanelHandler.RenderDisplayView();
            expect(resultModel.SetResultExecution).not.toHaveBeenCalled();
        });

        it("listHandler, render should be called", function () {
            spyOn(displayModel, "Data").and.callFake(function () { return { display_type: 'list' }; });
            userSettingsPanelHandler.RenderDisplayView();
            expect(listHandler.GetListDisplay).toHaveBeenCalled();
        });

        it("chartHandler, get chart display should be called", function () {
            spyOn(displayModel, "Data").and.callFake(function () { return { display_type: 'chart' }; });
            userSettingsPanelHandler.RenderDisplayView();
            expect(chartHandler.GetChartDisplay).toHaveBeenCalled();
        });

        it("pivotPageHandler, get pivot display should be called", function () {
            spyOn(displayModel, "Data").and.callFake(function () { return { display_type: 'pivot' }; });
            userSettingsPanelHandler.RenderDisplayView();
            expect(pivotPageHandler.GetPivotDisplay).toHaveBeenCalled();
        });

        it("other display type, render functions should not be called", function () {
            spyOn(displayModel, "Data").and.callFake(function () { return { display_type: 'other' }; });
            userSettingsPanelHandler.RenderDisplayView();
            expect(listHandler.GetListDisplay).not.toHaveBeenCalled();
            expect(chartHandler.GetChartDisplay).not.toHaveBeenCalled();
            expect(pivotPageHandler.GetPivotDisplay).not.toHaveBeenCalled();
        });
    });

    describe("call RenderSingleDrilldown", function () {
        beforeEach(function () {
            fieldsChooserModel.GridName = 'ListDrilldownGrid';
            fieldsChooserModel.BindDataGrid = '';
            spyOn(listDrilldownHandler, "Render").and.callFake($.noop);
            spyOn(fieldsChooserModel, "BindDataGrid").and.callFake($.noop);

        });
        afterEach(function () {
            $('#ListDrilldownGrid').remove();
            $('#ListGrid').remove();
        });

        it("BindDataGrid should be called", function () {
            $('<div id="ListDrilldownGrid"></div>').data('kendoGrid', true).appendTo('body');
            userSettingsPanelHandler.RenderSingleDrilldown();
            expect(fieldsChooserModel.BindDataGrid).toHaveBeenCalled();
        });

        it("BindDataGrid should be called", function () {
            $('<div id="ListGrid"></div>').data('kendoGrid', true).appendTo('body');
            fieldsChooserModel.GridName = 'ListGrid';
            userSettingsPanelHandler.RenderSingleDrilldown();
            expect(fieldsChooserModel.BindDataGrid).toHaveBeenCalled();
        });

        it("when grid name is not list drill down, should not render drilldown", function () {
            $('<div id="ListDrilldownGrid"></div>').data('kendoGrid', false).appendTo('body');
            userSettingsPanelHandler.RenderSingleDrilldown();
            expect(fieldsChooserModel.BindDataGrid).not.toHaveBeenCalled();
        });

        it("when drildown grid is not visible, BindDataGrid should not be called", function () {
            $('<div id="ListDrilldownGrid"></div>').data('kendoGrid', true).appendTo('body');
            $('#ListDrilldownGrid').hide();
            userSettingsPanelHandler.RenderSingleDrilldown();
            expect(fieldsChooserModel.BindDataGrid).not.toHaveBeenCalled();
        });
    });

    describe("call ChangeDropdownFormat", function () {

        beforeEach(function () {
            spyOn(userSettingsPanelHandler, "ChangeGeneralFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeNumberFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeCurerncyFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangePercentagesFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeDateFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeTimeFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeSetFormat").and.callFake($.noop);
        });

        it("GeneralDecimalSeperatorDropdown should call ChangeGeneralFormat", function () {
            userSettingsPanelHandler.ChangeDropdownFormat('GeneralDecimalSeperatorDropdown');
            expect(userSettingsPanelHandler.ChangeGeneralFormat).toHaveBeenCalled();
        });

        it("NumbersSelect should call ChangeNumberFormat", function () {
            userSettingsPanelHandler.ChangeDropdownFormat('NumbersSelect');
            expect(userSettingsPanelHandler.ChangeNumberFormat).toHaveBeenCalled();
        });

        it("DefaultCurrencySelect should call ChangeCurerncyFormat", function () {
            userSettingsPanelHandler.ChangeDropdownFormat('DefaultCurrencySelect');
            expect(userSettingsPanelHandler.ChangeCurerncyFormat).toHaveBeenCalled();
        });

        it("PercentagesFormatDisplayUnitSelect should call ChangePercentagesFormat", function () {
            userSettingsPanelHandler.ChangeDropdownFormat('PercentagesFormatDisplayUnitSelect');
            expect(userSettingsPanelHandler.ChangePercentagesFormat).toHaveBeenCalled();
        });

        it("DateFormatOrderDropdown should call ChangeDateFormat", function () {
            userSettingsPanelHandler.ChangeDropdownFormat('DateFormatOrderDropdown');
            expect(userSettingsPanelHandler.ChangeDateFormat).toHaveBeenCalled();
        });

        it("TimeFormatHourDropdown should call ChangeTimeFormat", function () {
            userSettingsPanelHandler.ChangeDropdownFormat('TimeFormatHoursDropdown');
            expect(userSettingsPanelHandler.ChangeTimeFormat).toHaveBeenCalled();
        });

        it("EnumSelect should call ChangeSetFormat", function () {
            userSettingsPanelHandler.ChangeDropdownFormat('EnumSelect');
            expect(userSettingsPanelHandler.ChangeSetFormat).toHaveBeenCalled();
        });

        it("EnumSelect should do nothing", function () {
            userSettingsPanelHandler.ChangeDropdownFormat('xxx');
            expect(userSettingsPanelHandler.ChangeSetFormat).not.toHaveBeenCalled();
        });
    });

    describe("call InitialExampleFormat", function () {
        beforeEach(function () {
            spyOn(userSettingsPanelHandler, "ChangeGeneralFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeNumberFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeCurerncyFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangePercentagesFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeDateFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeTimeFormat").and.callFake($.noop);
            spyOn(userSettingsPanelHandler, "ChangeSetFormat").and.callFake($.noop);
        });

        it("ChangeSetFormat should be called", function () {
            userSettingsPanelHandler.InitialExampleFormat();
            expect(userSettingsPanelHandler.ChangeSetFormat).toHaveBeenCalled();
        });
    });

    describe("call GetCustomCulture", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#GeneralDecimalSeperatorDropdown')
                            return ",";
                        else if (val === '#GeneralThousandSeperatorDropdown')
                            return ".";
                        else
                            return null;
                    }
                };
                return value;
            });

        });

        it("should set thousand seperator for custom culture", function () {
            var customCulture = userSettingsPanelHandler.GetCustomCulture();
            expect(customCulture.numberFormat[","]).toEqual(".");
        });

        it("should set decimal seperator for custom culture", function () {
            var customCulture = userSettingsPanelHandler.GetCustomCulture();
            expect(customCulture.numberFormat["."]).toEqual(",");
        });
    });

    describe("call ChangePercentagesFormat", function () {

        var userSettingHandler2;

        beforeEach(function () {

            userSettingHandler2 = new UserSettingsPanelHandler();
            userSettingHandler2.GetCustomCulture = $.noop;
            $('<div class="examplePercentages" />').hide().appendTo('body');

        });

        afterEach(function () {

            $('#PercentagesSelect').remove();
            $('#PercentagesFormatDisplayUnitSelect').remove();
            $('#enable_thousandseparator_for_percentage').remove();

        });

        it("should set as yyyy-MMM-dd format", function () {

            $('<div id="PercentagesSelect" />').data('kendoDropDownList', {
                value: function () { return 3; }
            }).hide().appendTo('body');

            $('<div id="PercentagesFormatDisplayUnitSelect" />').data('kendoDropDownList', {
                value: function () { return 'K'; }
            }).hide().appendTo('body');

            $('<input type="checkbox" id="enable_thousandseparator_for_percentage" checked="checked" />')
                .hide().appendTo('body');

            userSettingHandler2.ChangePercentagesFormat();
            expect($('.examplePercentages').text()).toEqual('123,456,789.000 K %');

        });

    });

    describe("call ChangeDateFormat", function () {

        var userSettingHandler2;

        beforeEach(function () {

            userSettingHandler2 = new UserSettingsPanelHandler();
            userSettingHandler2.GetCustomCulture = $.noop;
            $('<div class="exampleDate" />').hide().appendTo('body');

        });

        afterEach(function () {

            $('#DateFormatOrderDropdown').remove();
            $('#DateFormatDayDropdown').remove();
            $('#DateFormatMonthDropdown').remove();
            $('#DateFormatYearDropdown').remove();
            $('#DateFormatSeparatorDropdown').remove();
            $('.exampleDate').remove();

        });

        it("should set as yyyy-MMM-dd format", function () {

            $('<div id="DateFormatOrderDropdown" />').data('kendoDropDownList', {
                value: function () { return 'YMD'; }
            }).hide().appendTo('body');

            $('<div id="DateFormatDayDropdown" />').data('kendoDropDownList', {
                value: function () { return 'dd'; }
            }).hide().appendTo('body');

            $('<div id="DateFormatMonthDropdown" />').data('kendoDropDownList', {
                value: function () { return 'MMM'; }
            }).hide().appendTo('body');

            $('<div id="DateFormatYearDropdown" />').data('kendoDropDownList', {
                value: function () { return 'yyyy'; }
            }).hide().appendTo('body');

            $('<div id="DateFormatSeparatorDropdown" />').data('kendoDropDownList', {
                value: function () { return '-'; }
            }).hide().appendTo('body');

            userSettingHandler2.ChangeDateFormat();
            expect($('.exampleDate').text()).toContain('-');

        });

    });

    describe("call ChangeTimeFormat", function () {

        var userSettingHandler2;

        beforeEach(function () {

            userSettingHandler2 = new UserSettingsPanelHandler();
            userSettingHandler2.GetCustomCulture = $.noop;
            $('<div class="exampleTime" />').hide().appendTo('body');

        });

        afterEach(function () {
            $('#TimeFormatHourDropdown').remove();
            $('#TimeFormatSeparatorDropdown').remove();
            $('.exampleTime').remove();
        });

        it("should set as HH:mm format", function () {
            $('<div id="TimeFormatHoursDropdown" />').data('kendoDropDownList', {
                value: function () { return 'HH'; }
            }).hide().appendTo('body');
            $('<div id="TimeFormatSecondsDropdown" />').data('kendoDropDownList', {
                value: function () { return 'None'; }
            }).hide().appendTo('body');
            $('<div id="TimeFormatSeparatorDropdown" />').data('kendoDropDownList', {
                value: function () { return ':'; }
            }).hide().appendTo('body');
            userSettingHandler2.ChangeTimeFormat();
            expect($('.exampleTime').text()).toContain(':');
        });

        it("should set as h.mm (tt) format", function () {

            $('<div id="TimeFormatHourDropdown" />').data('kendoDropDownList', {
                value: function () { return 'hmm'; }
            }).hide().appendTo('body');

            $('<div id="TimeFormatSeparatorDropdown" />').data('kendoDropDownList', {
                value: function () { return '.'; }
            }).hide().appendTo('body');

            userSettingHandler2.ChangeTimeFormat();
            expect($('.exampleTime').text()).toContain('.');

        });

    });

    describe("call ChangeGeneralFormat", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#GeneralDecimalSeperatorDropdown')
                            return ".";
                        else if (val === '#GeneralThousandSeperatorDropdown')
                            return ",";
                        else
                            return null;
                    }
                };
                return value;
            });

            $('body').append('<div class="exampleGeneralNumber"></div>');
        });

        afterEach(function () {
            $('.exampleGeneralNumber').remove();
        });

        it("should change genreal format", function () {
            userSettingsPanelHandler.ChangeGeneralFormat();
            expect($('.exampleGeneralNumber').text()).toEqual("1,234,567,890.00");
        });
    });

    describe("call ChangeNumberFormat", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#GeneralDecimalSeperatorDropdown')
                            return ".";
                        else if (val === '#GeneralThousandSeperatorDropdown')
                            return ",";
                        else if (val === '#NumbersSelect')
                            return "3";
                        else if (val === '#NumberFormatDisplayUnitSelect')
                            return "K";
                        else
                            return null;
                    }
                };
                return value;
            });
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return true;
            });

            $('body').append('<div class="exampleNumber"></div>');
        });

        afterEach(function () {
            $('.exampleNumber').remove();
        });

        it("should change genreal format", function () {
            userSettingsPanelHandler.ChangeNumberFormat();
            expect($('.exampleNumber').text()).toEqual("1,234,567.890 K");
        });
    });

    describe("call ChangeCurerncyFormat", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function (val) {
                var value = {
                    value: function () {
                        if (val === '#GeneralDecimalSeperatorDropdown')
                            return ".";
                        else if (val === '#GeneralThousandSeperatorDropdown')
                            return ",";
                        else if (val === '#DefaultCurrencySelect')
                            return "EUR";
                        else if (val === '#CurrencyFormatDisplayUnitSelect')
                            return "K";
                        else if (val === '#CurrencyUnitSelect')
                            return "3";
                        else
                            return null;
                    }
                };
                return value;
            });
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return true;
            });

            $('body').append('<div class="exampleCurrency"></div>');
        });

        afterEach(function () {
            $('.exampleCurrency').remove();
        });

        it("should change genreal format", function () {
            userSettingsPanelHandler.ChangeCurerncyFormat();
            expect($('.exampleCurrency').text()).toEqual("1,234,567.890 K EUR");
        });
    });

    describe("call ChangeSetFormat", function () {

        var userSettingHandler2;

        beforeEach(function () {

            userSettingHandler2 = new UserSettingsPanelHandler();
            userSettingHandler2.GetCustomCulture = $.noop;
            $('<div class="exampleSet" />').hide().appendTo('body');

        });

        afterEach(function () {

            $('#EnumSelect').remove();
            $('.exampleSet').remove();

        });

        it("should set short format to example element", function () {

            $('<div id="EnumSelect" />').data('kendoDropDownList', {
                value: function () { return 'shn'; }
            }).hide().appendTo('body');

            userSettingHandler2.ChangeSetFormat();
            expect($('.exampleSet').text()).toEqual('1000');

        });

        it("should set long format to example element", function () {

            $('<div id="EnumSelect" />').data('kendoDropDownList', {
                value: function () { return 'ln'; }
            }).hide().appendTo('body');

            userSettingHandler2.ChangeSetFormat();
            expect($('.exampleSet').text()).toEqual('IDES AG');

        });

        it("should set short and long format to example element", function () {

            $('<div id="EnumSelect" />').data('kendoDropDownList', {
                value: function () { return 'shnln'; }
            }).hide().appendTo('body');

            userSettingHandler2.ChangeSetFormat();
            expect($('.exampleSet').text()).toEqual('1000 (IDES AG)');
        });

    });

    describe("call GetHourFormat", function () {

        it("set hour HH and no second, should return format HHMM", function () {

            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                var value = {
                    value: function () {
                        return 'HH';
                    }
                };
                return value;
            });

            var hour = userSettingsPanelHandler.GetHourFormat();
            expect(hour).toEqual(enumHandlers.TIME_TEMPLATE.HHMM);

        });

        it("set hour H and no second, should return format HMM", function () {

            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                var value = {
                    value: function () {
                        return 'h';
                    }
                };
                return value;
            });

            var hour = userSettingsPanelHandler.GetHourFormat();
            expect(hour).toEqual(enumHandlers.TIME_TEMPLATE.HMM);

        });
    });

    describe("call GetHoursFromFieldFormat", function () {

        it("should get h", function () {
            var format = 'h:mm';
            var hour = userSettingsPanelHandler.GetHoursFromFieldFormat(format);
            expect(hour).toEqual(enumHandlers.TIME_TEMPLATE.H);
        });

        it("should get HH", function () {
            var format = 'HH:mm';
            var hour = userSettingsPanelHandler.GetHoursFromFieldFormat(format);
            expect(hour).toEqual(enumHandlers.TIME_TEMPLATE.HH);
        });

        it("should get a default if incorrect format", function () {
            var format = '';
            var hour = userSettingsPanelHandler.GetHoursFromFieldFormat(format);
            expect(hour).toEqual(enumHandlers.TIME_TEMPLATE.HH);
        });
    });

    describe("call GetSecondsFromSetting", function () {

        it("should get value as it if have value", function () {
            var second = enumHandlers.TIME_TEMPLATE.SS;
            var result = userSettingsPanelHandler.GetSecondsFromSetting(second);
            expect(result).toEqual(enumHandlers.TIME_TEMPLATE.SS);
        });

        it("should get empty if no value", function () {
            var second = '';
            var result = userSettingsPanelHandler.GetSecondsFromSetting(second);
            expect(result).toEqual(enumHandlers.TIME_TEMPLATE.NONE);
        });
    });

    describe("call GetSecondDropdownValue", function () {

        it("should get ss if value is string type", function () {
            var second = enumHandlers.TIME_TEMPLATE.SS;
            var result = userSettingsPanelHandler.GetSecondDropdownValue(second);
            expect(result).toEqual(enumHandlers.TIME_TEMPLATE.SS);
        });

        it("should get default if value is not string type", function () {
            var second = null;
            var result = userSettingsPanelHandler.GetSecondDropdownValue(second);
            expect(result).toEqual(enumHandlers.FIELDSETTING.USEDEFAULT);
        });
    });

    describe("call SetSecondFormat", function () {

        it("should set format if second is string type and not default", function () {
            var details = {};
            var second = enumHandlers.TIME_TEMPLATE.SS;
            userSettingsPanelHandler.SetSecondFormat(details, second);
            expect(details[enumHandlers.FIELDDETAILPROPERTIES.SECOND]).toEqual(enumHandlers.TIME_TEMPLATE.SS);
        });

        it("should remove format if second is string type but is a default", function () {
            var details = {};
            var second = enumHandlers.FIELDSETTING.USEDEFAULT;
            userSettingsPanelHandler.SetSecondFormat(details, second);
            expect(details[enumHandlers.FIELDDETAILPROPERTIES.SECOND]).not.toBeDefined();
        });

        it("should remove format if second is not string", function () {
            var details = {};
            var second = null;
            userSettingsPanelHandler.SetSecondFormat(details, second);
            expect(details[enumHandlers.FIELDDETAILPROPERTIES.SECOND]).not.toBeDefined();
        });
    });

    describe(".Init", function () {

        beforeEach(function () {
            spyOn(userSettingsPanelHandler, 'TogglePanel').and.callFake(jQuery.noop);
            spyOn(stateManagerTest, 'RestoreSettings').and.callFake(jQuery.noop);
            spyOn(userSettingsPanelHandler, 'LoadData').and.callFake(jQuery.noop);
            jQuery('body')
                .append('<a class="settingsPanelSaveButton"></a>')
                .append('<div id="SettingsPanel" class="hide"></div>');
        });

        afterEach(function () {
            jQuery('.settingsPanelSaveButton').remove();
            jQuery('#SettingsPanel').remove();
        });

        it("should not call any function if it is saving status", function (done) {
            jQuery('.settingsPanelSaveButton').addClass('btn-busy');
            userSettingsPanelHandler.Init();

            setTimeout(function () {
                expect(userSettingsPanelHandler.TogglePanel).not.toHaveBeenCalled();
                expect(stateManagerTest.RestoreSettings).not.toHaveBeenCalled();
                expect(userSettingsPanelHandler.LoadData).not.toHaveBeenCalled();
                done();
            }, 500);
        });

        it("should call toggle panel function if it is not saving status", function (done) {
            userSettingsPanelHandler.Init();

            setTimeout(function () {
                expect(userSettingsPanelHandler.TogglePanel).toHaveBeenCalled();
                expect(stateManagerTest.RestoreSettings).not.toHaveBeenCalled();
                expect(userSettingsPanelHandler.LoadData).not.toHaveBeenCalled();
                done();
            }, 500);
        });

        it("should call load data function if settings panel is expanding", function (done) {
            jQuery('#SettingsPanel').removeClass('hide');
            userSettingsPanelHandler.Init();

            setTimeout(function () {
                expect(userSettingsPanelHandler.TogglePanel).toHaveBeenCalled();
                expect(stateManagerTest.RestoreSettings).toHaveBeenCalled();
                expect(userSettingsPanelHandler.LoadData).toHaveBeenCalled();
                done();
            }, 500);
        });

    });

    describe(".RestoreSettings", function () {

        beforeEach(function () {
            jQuery('body')
                .append('<input type="radio" name="settingsPanelTab" id="SettingsPanelUserTab">')
                .append('<input type="radio" name="settingsPanelTab" id="SettingsPanelSystemTab">')
                .append('<input type="radio" name="settingsPanelTab" id="SettingsPanelFormatTab">')

                .append('<div class="settingsPanelContent" id="SettingsPanelUserContent">')
                .append('<div class="settingsPanelContent" id="SettingsPanelSystemContent">')
                .append('<div class="settingsPanelContent" id="SettingsPanelFormatContent">');
        });

        afterEach(function () {
            jQuery('.settingsPanelTab, .settingsPanelContent').remove();
        });

        it("should set first tab as a active tab by default", function () {
            stateManagerTest.RestoreSettings();
            expect(jQuery('#SettingsPanelUserContent').hasClass('active')).toEqual(true);
        });

        it("should restore tab from previously", function () {
            stateManagerTest.RestoreSettings();
            stateManagerTest.ChangeTab('SettingsPanelSystemTab', 'SettingsPanelSystemContent');

            expect(jQuery('#SettingsPanelUserTab').prop('checked')).toEqual(false);
            expect(jQuery('#SettingsPanelSystemTab').prop('checked')).toEqual(true);

            expect(jQuery('#SettingsPanelUserContent').hasClass('active')).toEqual(false);
            expect(jQuery('#SettingsPanelSystemContent').hasClass('active')).toEqual(true);
        });

    });

    describe(".InitialControlUser", function () {

        var model = {
            assigned_roles: [
                { role_id: 'EA2_800_ALL' }, { role_id: 'EA4IT_ALL' }
            ],
            id: 'Everyangle\EAadmin',
            full_name: 'EAadmin'
        };

        beforeEach(function () {
            spyOn(userModel, 'Data').and.callFake(function () {
                return model;
            });

            jQuery('body')
                .append('<div class="settingsPanelProfileName"><strong></strong><span></span></div>')
                .append('<div class="settingsPanelRoles"><span class="roles"></span></div>');
        });

        afterEach(function () {
            jQuery('.settingsPanelProfileName').remove();
            jQuery('.settingsPanelRoles').remove();
        });

        it("should binding data to view correctly", function () {
            userSettingsPanelHandler.InitialControlUser();
            expect(jQuery('.settingsPanelProfileName strong').text()).toEqual(model.full_name);
            expect(jQuery('.settingsPanelProfileName span').text()).toEqual(model.id);
            expect(jQuery('.settingsPanelRoles .roles').text()).toEqual(model.assigned_roles.map(function (r) { return r.role_id; }).join(', '));
        });

    });

    describe(".CheckDownloadSAP", function () {
        var element;
        beforeEach(function () {
            element = $('<div id="GoToSapSection" />').appendTo('body');
        });
        afterEach(function () {
            element.remove();
        });

        it("should show download SAP launcher", function () {
            window.enableGoToSAP = true;
            userSettingsPanelHandler.CheckDownloadSAP();

            // assert
            expect($('#GoToSapSection').length).toEqual(1);
        });

        it("should not show download SAP launcher", function () {
            window.enableGoToSAP = false;
            userSettingsPanelHandler.CheckDownloadSAP();

            // assert
            expect($('#GoToSapSection').length).toEqual(0);
        });
    });
});
