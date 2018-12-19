/// <reference path="/Dependencies/Helper/MeasurePerformance.js" />
/// <reference path="/Dependencies/HtmlTemplate/Menu/usersettingpopuphtmltemplate.js" />
/// <reference path="/../SharedDependencies/BusinessProcessesModel.js" />
/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewModels/Models/Search/searchquery.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewManagement/User/UserSettingHandler.js" />
/// <reference path="/Dependencies/ViewManagement/User/UserSettingView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelLabelCategoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemCurrencyHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/shared/DirectoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/shared/SystemSettingHandler.js" />
/// <reference path="/Dependencies/ViewManagement/shared/SystemInformationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/ListDrilldownHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/ListHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/ChartHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/PivotHandler.js" />
/// <reference path="/Dependencies/User/Authentication.js" />

describe("UserSettingHandler", function () {

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(userSettingsHandler).toBeDefined();
        });
    });

    describe("get UpdateSampleDateSettings", function () {

        it("should have DATEDAYFORMAT", function () {
            userSettingsHandler.UpdateSampleDateSettings();
            expect(userSettingsHandler.DATEDAYFORMAT.length).toEqual(2);
        });

        it("should have FORMATSETTINGNUMBER", function () {
            userSettingsHandler.UpdateSampleDateSettings();
            expect(userSettingsHandler.DATEMONTHFORMAT.length).toEqual(3);
        });

        it("should have DATEYEARFORMAT ", function () {
            userSettingsHandler.UpdateSampleDateSettings();
            expect(userSettingsHandler.DATEYEARFORMAT.length).toEqual(2);
        });
    });

    describe("call ShowPopup", function () {

        beforeEach(function () {
            spyOn(requestHistoryModel, "SaveLastExecute").and.callFake($.noop);
            spyOn(userSettingsHandler, "GetUserSettingButtons").and.callFake($.noop);
            spyOn(userSettingsView, "SetDisableSaveButton").and.callFake($.noop);
            spyOn(popup, "Show").and.callFake($.noop);
            window.GetImageFolderPath = $.noop;
        });

        it("function show popup have been called", function () {
            userSettingsHandler.ShowPopup();
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe("get TAB", function () {

        var tests = [
            'ACTIONSETTING',
            'FORMATSETTING',
            'FORMATSETTINGCURRENCY',
            'FORMATSETTINGDATE',
            'FORMATSETTINGGENERAL',
            'FORMATSETTINGNUMBER',
            'FORMATSETTINGPERCENTAGES',
            'FORMATSETTINGSET',
            'FORMATSETTINGTIME',
            'SYSTEMSETTING',
            'USERSETTING'
        ];

        $.each(tests, function (index, test) {

            it("should have " + test, function () {
                expect(userSettingsHandler.TAB[test]).toBeDefined();
            });

        });

    });

    describe("call GetUserSettingButtons", function () {

        var userSettingButtons;
        beforeEach(function () {
            userSettingButtons = userSettingsHandler.GetUserSettingButtons();
            spyOn(userSettingsHandler, "SaveUserSettings").and.callFake($.noop);
        });

        it("should contain 3 buttons", function () {
            expect(userSettingButtons.length).toEqual(3);
        });

        it("when click execute button and user can save, CanButtonExecute have been called", function () {
            window.popup = window.popup || {};
            window.popup.CanButtonExecute = $.noop;
            spyOn(popup, "CanButtonExecute").and.callFake(function () { return true; });
            var executeButton = userSettingButtons.findObject('className', 'executing');
            executeButton.click();
            expect(userSettingsHandler.SaveUserSettings).toHaveBeenCalled();
        });

        it("when click execute button and user can not save, CanButtonExecute not have been called", function () {
            spyOn(popup, "CanButtonExecute").and.callFake(function () { return false; });
            var executeButton = userSettingButtons.findObject('className', 'executing');
            executeButton.click();
            expect(userSettingsHandler.SaveUserSettings).not.toHaveBeenCalled();
        });

    });

    describe("call OnUserSettingsPopupResize", function () {

        beforeEach(function () {
            window.businessProcessesModel.UserSetting = window.businessProcessesModel.UserSetting || {};
            window.businessProcessesModel.UserSetting.UpdateLayout = $.noop;
        });

        it("should call UpdateLayout method", function () {
            spyOn(window.businessProcessesModel.UserSetting, "UpdateLayout");

            userSettingsHandler.OnUserSettingsPopupResize();
            expect(businessProcessesModel.UserSetting.UpdateLayout).toHaveBeenCalled();
        });

        it("should not call UpdateLayout method if not define", function () {
            delete window.businessProcessesModel.UserSetting;

            userSettingsHandler.OnUserSettingsPopupResize();
            expect(window.businessProcessesModel.UserSetting).not.toBeDefined();
        });

    });

    describe("call CloseUserSettingPopup", function () {
        var e;
        beforeEach(function () {
            spyOn(popup, "Alert").and.callFake(function () { });
            e = {
                sender: {
                    destroy: $.noop
                }
            };
        });

        it("have an invalid currency should return false", function () {
            spyOn(userSettingsHandler, "IsUserHasValidCurrency").and.callFake(function () {
                return false;
            });
            var closeUserSetting = userSettingsHandler.CloseUserSettingPopup(e);
            expect(closeUserSetting).toEqual(false);
        });

        it("have a valid currency should return true", function () {
            spyOn(userSettingsHandler, "IsUserHasValidCurrency").and.callFake(function () {
                return true;
            });
            var closeUserSetting = userSettingsHandler.CloseUserSettingPopup(e);
            expect(closeUserSetting).toEqual(true);
        });

    });

    describe("call AbortAutoExcecute", function () {

        it("should return false", function () {
            userSettingsHandler.AutoExecuteXhr = {};

            var abort = userSettingsHandler.AbortAutoExcecute();
            expect(abort).toEqual(false);
        });

        it("should return true", function () {
            userSettingsHandler.AutoExecuteXhr = {};
            userSettingsHandler.AutoExecuteXhr.abort = $.noop;

            var abort = userSettingsHandler.AbortAutoExcecute();
            expect(abort).toEqual(true);
        });
    });

    describe("call ShowPopupCallback", function () {
        var e;
        beforeEach(function () {
            spyOn(userSettingsHandler, 'UpdateSampleDateSettings').and.callFake($.noop);
            spyOn(userSettingsView, 'UserSettingTabClick').and.callFake($.noop);
            spyOn(systemInformationHandler, 'LoadSystemInformation').and.callFake($.noop);
            spyOn(systemCurrencyHandler, 'LoadCurrencies').and.callFake($.noop);
            spyOn(systemLanguageHandler, 'LoadLanguages').and.callFake($.noop);
            spyOn(businessProcessesModel.General, 'Load').and.callFake($.noop);
            spyOn(modelsHandler, 'LoadModels').and.callFake($.noop);
            spyOn(window, 'SetLoadingVisibility').and.callFake($.noop);
            spyOn(ko, 'applyBindings').and.callFake($.noop);
            spyOn(userSettingsView, 'UserFieldSettingTabClick').and.callFake($.noop);
            spyOn(userSettingsHandler, 'InitialControls').and.callFake($.noop);
            spyOn(userSettingsHandler, 'InitialExampleFormat').and.callFake($.noop);
            spyOn(userSettingModel, 'LoadAutoExecuteList').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetLabel').and.callFake($.noop);
            e = {
                sender: {
                    element: {
                        busyIndicator: $.noop,
                        find: function () {
                            return {
                                css: $.noop,
                                animate: $.noop,
                                removeClass: $.noop
                            };
                        }
                    },
                    wrapper: {
                        get: $.noop,
                        find: function () {
                            return {
                                removeClass: $.noop
                            };
                        }
                    }
                }
            };
        });

        it("function LoadAutoExecuteList have been called", function (done) {
            spyOn(userSettingsHandler, 'SetDataModel').and.callFake(function () { return true; });
            userSettingsHandler.ShowPopupCallback(e);
            setTimeout(function () {
                expect(userSettingModel.LoadAutoExecuteList).toHaveBeenCalled();
                done();
            }, 2);

        });
    });

    describe("call SetLabel ", function () {

        beforeEach(function () {
            spyOn(directoryHandler, "GetDirectoryUri").and.callFake($.noop);
            spyOn(modelLabelCategoryHandler, "LoadAllLabelCategories").and.callFake($.noop);
            spyOn(modelLabelCategoryHandler, "LoadAllLabels").and.callFake($.noop);
        });

        it("when load all label, retrun true", function () {
            var isLoadAllLabels = true;
            userSettingsHandler.SetLabel(isLoadAllLabels).done(function (e) {
                expect(e).toEqual(true);
            });
        });

        it("when not load all label, retrun load all label", function () {
            var isLoadAllLabels = false;
            userSettingsHandler.SetLabel(isLoadAllLabels).done(function () {
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
            userSettingsHandler.SetDataModel();
            expect(userSettingsHandler.DataModels.options.enabled).toEqual(true);
        });
        it("not have model data, option should be disabled", function () {
            spyOn(modelsHandler, "GetData").and.callFake(function () {
                var model = [];
                return model;
            });
            userSettingsHandler.SetDataModel();
            expect(userSettingsHandler.DataModels.options.enabled).toEqual(false);
        });
    });

    describe("call LoadLabels", function () {

        beforeEach(function () {
            spyOn(privilegesViewModel, "GetModelPrivilegesByUri").and.callFake(function (uri) {
                if (uri === '/models/1')
                    return [{
                        label_authorizations: {
                            'P2P': 'validate',
                            'S2D': 'validate'
                        }
                    }];
                else if (uri === '/models/2')
                    return [{
                        label_authorizations: {
                            'P2P': 'validate',
                            'S2D': 'validate',
                            'O2C': 'validate'
                        }
                    }];
                else return null;
            });

            spyOn(modelLabelCategoryHandler, "GetLabelById").and.callFake(function (label) {
                if (label === 'P2P' || label === 'S2D')
                    return label;
                return null;
            });
        });

        it("isLoadAllLabels should be true", function () {
            var isLoadAllLabels = true;
            var models = [{ uri: '/models/1' }];
            isLoadAllLabels = userSettingsHandler.LoadLabels(models, isLoadAllLabels);
            expect(isLoadAllLabels).toEqual(true);
        });

        it("missing label, isLoadAllLabels should be false", function () {
            var isLoadAllLabels = true;
            var models = [{ uri: '/models/2' }];
            isLoadAllLabels = userSettingsHandler.LoadLabels(models, isLoadAllLabels);
            expect(isLoadAllLabels).toEqual(false);
        });

        it("is notload all label, isLoadAllLabels should be false", function () {
            var isLoadAllLabels = false;
            var models = [{ uri: '/models/2' }];
            isLoadAllLabels = userSettingsHandler.LoadLabels(models, isLoadAllLabels);
            expect(isLoadAllLabels).toEqual(false);
        });

    });

    describe("call IsUserHasValidCurrency", function () {

        beforeEach(function () {
            spyOn(systemCurrencyHandler, "GetCurrencyById").and.callFake(function (userCurrency) {
                var currency;
                if (userCurrency === 'USD')
                    currency = { enabled: true };
                else if (userCurrency === 'GBP')
                    currency = { enabled: false };
                return currency;
            });
        });

        it("currency is enabled, should be true", function () {

            spyOn(userSettingModel, "GetByName").and.callFake(function () {
                return "USD";
            });
            var isValid = userSettingsHandler.IsUserHasValidCurrency();
            expect(isValid).toEqual(true);
        });

        it("currency is disabled, should be false", function () {

            spyOn(userSettingModel, "GetByName").and.callFake(function () {
                return "GBP";
            });

            var isValid = userSettingsHandler.IsUserHasValidCurrency();
            expect(isValid).toEqual(false);
        });

    });

    describe("call CheckUserCurrency", function () {

        beforeEach(function () {
            window.errorHandlerModel = window.errorHandlerModel || {};
            window.errorHandlerModel.Enable = $.noop;
            spyOn(userSettingsHandler, "ShowPopup").and.callFake(function () { });
        });

        it("if invalid currency, should show popup", function (done) {
            spyOn(userSettingsHandler, "IsUserHasValidCurrency").and.callFake(function () {
                return false;
            });
            jQuery.active = 1;
            setTimeout(function () {
                jQuery.active = 0;
            }, 150);
            userSettingsHandler.CheckUserCurrency();

            setTimeout(function () {
                expect(userSettingsHandler.ShowPopup).toHaveBeenCalled();
                done();
            }, 300);

        });

        it("if valid currency, should not show popup", function (done) {
            spyOn(userSettingsHandler, "IsUserHasValidCurrency").and.callFake(function () {
                return true;
            });
            userSettingsHandler.CheckUserCurrency();

            setTimeout(function () {
                expect(userSettingsHandler.ShowPopup).not.toHaveBeenCalled();
                done();
            }, 1500);

        });
    });

    describe("call InitialControls ", function () {

        beforeEach(function () {

            spyOn(userSettingModel, "Data").and.callFake(function () {
                return {};
            });
            spyOn(userSettingsHandler, "InitialControlsModel").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsBusinessProcess").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsLanguage").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsRowExportToExcel").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsFacetWarning").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsFieldChooser").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsTechnicalInfo").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsNumberGeneral").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsNumber").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsCurrency").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsPercentages").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsDate").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsTime").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsEnum").and.callFake($.noop);
            spyOn(userSettingsHandler, "InitialControlsExecuteLastSearch").and.callFake($.noop);
            userSettingsHandler.InitialControls();
        });

        it("InitialControlsExecuteLastSearch have been called", function () {
            expect(userSettingsHandler.InitialControlsExecuteLastSearch).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsModel", function () {

        beforeEach(function () {

            spyOn(userSettingsHandler, "GetDefaulModel").and.callFake(function () {
                return '/models/1';
            });

            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake(function () {
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
            userSettingsHandler.DataModels = {};
            userSettingsHandler.DataModels.data = [{
                uri: '/models/1',
                id: 'EA2_800',
                short_name: 'EA2_800'
            },
            {
                uri: '/models/2',
                id: 'EA3_800',
                short_name: 'EA3_800'
            }];
            userSettingsHandler.DataModels.options = { enabled: true };
        });

        it("model dropdown should be enabled", function () {
            var dropdownList = userSettingsHandler.InitialControlsModel();
            expect(dropdownList._enable).toEqual(true);
        });
    });

    describe("call GetDefaulModel ", function () {

        beforeEach(function () {
            spyOn(userSettingsHandler, "DataModels").and.callFake(function () {
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
            var defaultModelValue = userSettingsHandler.GetDefaulModel();
            expect(defaultModelValue).toEqual('/models/1');
        });

    });

    describe("call InitialControlsBusinessProcess", function () {

        beforeEach(function () {

            spyOn(userSettingsHandler, "GetDefaulModel").and.callFake(function () {
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
            userSettingsHandler.InitialControlsBusinessProcess();
            expect(businessProcessesModel.UserSetting.CurrentActive().P2P).toEqual(true);
        });

        it("O2C Should be inactive", function () {
            userSettingsHandler.InitialControlsBusinessProcess();
            expect(businessProcessesModel.UserSetting.CurrentActive().O2C).toEqual(false);
        });
    });
    
    describe("call InitialControlsLanguage ", function () {

        beforeEach(function () {
            spyOn(systemLanguageHandler, "GetEnableLanguages").and.callFake(function () {
                return 'en';
            });
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
        });

        it("RenderFormatSettingDropdownlist should be called and set default as 'nl'", function () {
            var setting = { default_language: 'nl' };
            userSettingsHandler.InitialControlsLanguage(setting);
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });

        it("RenderFormatSettingDropdownlist should be called and fallback with 'en'", function () {
            var setting = {};
            userSettingsHandler.InitialControlsLanguage(setting);
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
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
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
        });

        it("RenderFormatSettingDropdownlist should be called", function () {
            var setting = { default_export_lines: 100 };
            userSettingsHandler.InitialControlsRowExportToExcel(setting);
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });

        it("if not set default, RenderFormatSettingDropdownlist should be called", function () {
            var setting = {};
            userSettingsHandler.InitialControlsRowExportToExcel(setting);
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
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
            userSettingsHandler.InitialControlsFacetWarning(clientSettings);
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
            userSettingsHandler.InitialControlsFieldChooser(clientSettings);
            expect($('#DefaultStarredfields').is(':checked')).toEqual(true);
        });

        it("should set default starred field to enable", function () {
            var clientSettings = { default_Suggested_Fields: true };
            userSettingsHandler.InitialControlsFieldChooser(clientSettings);
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
            userSettingsHandler.InitialControlsTechnicalInfo(settings);
            expect($('#SapFieldsInChooser').is(':checked')).toEqual(true);
        });

        it("should set default starred field to enable", function () {
            var settings = { sap_fields_in_header: true };
            userSettingsHandler.InitialControlsTechnicalInfo(settings);
            expect($('#SapFieldsInHeader').is(':checked')).toEqual(true);
        });
    });

    describe("call InitialControlsNumberGeneral", function () {
        var decimalTemp;
        var thousanSeparatorTemp;
        beforeEach(function () {
            decimalTemp = enumHandlers.GENERAL_DEFAULT_SEPARATOR.DECIMAL;
            thousanSeparatorTemp = enumHandlers.GENERAL_DEFAULT_SEPARATOR.SEPARATOR;
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
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
            userSettingsHandler.InitialControlsNumberGeneral(setting);
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
        it("when not have setting, RenderFormatSettingDropdownlist should be called", function () {
            var setting = {};
            enumHandlers.GENERAL_DEFAULT_SEPARATOR.DECIMAL = undefined;
            enumHandlers.GENERAL_DEFAULT_SEPARATOR.SEPARATOR = undefined;
            userSettingsHandler.InitialControlsNumberGeneral(setting);
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsNumber", function () {

        beforeEach(function () {
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
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
            userSettingsHandler.InitialControlsNumber();
            expect($('#enable_thousandseparator_for_number').is(':checked')).toEqual(true);
        });

        it("should call RenderFormatSettingDropdownlist", function () {
            userSettingsHandler.InitialControlsNumber();
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });

    });

    describe("call InitialControlsCurrency", function () {

        beforeEach(function () {
            spyOn(popup, "Alert").and.callFake($.noop);
            spyOn(userSettingsView, "UserFieldSettingTabClick").and.callFake($.noop);

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
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake(function () {
                return { value: function () { return false; } };
            });
            userSettingsHandler.InitialControlsCurrency();
            expect($('#enable_thousandseparator_for_currency').is(':checked')).toEqual(true);
            expect(userSettingsView.UserFieldSettingTabClick).toHaveBeenCalled();
        });

        it("dropdown currency have value, should not call UserFieldSettingTabClick", function () {
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake(function () {
                return { value: function () { return true; } };
            });
            userSettingsHandler.InitialControlsCurrency();
            expect(userSettingsView.UserFieldSettingTabClick).not.toHaveBeenCalled();
        });

    });

    describe("call InitialControlsPercentages", function () {

        beforeEach(function () {
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
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
            userSettingsHandler.InitialControlsPercentages();
            expect($('#enable_thousandseparator_for_percentage').is(':checked')).toEqual(true);
        });

        it("should call RenderFormatSettingDropdownlist", function () {
            userSettingsHandler.InitialControlsPercentages();
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });

    });

    describe("call InitialControlsDate", function () {
        beforeEach(function () {
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    decimals: '',
                    prefix: '',
                    thousandseparator: true
                };
            });
        });

        it("should call RenderFormatSettingDropdownlist", function () {
            userSettingsHandler.InitialControlsDate();
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsTime", function () {
        beforeEach(function () {
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
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
            userSettingsHandler.InitialControlsTime(setting);
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
        });
    });

    describe("call InitialControlsEnum", function () {
        beforeEach(function () {
            spyOn(userSettingsHandler, "RenderFormatSettingDropdownlist").and.callFake($.noop);
            spyOn(WC.FormatHelper, "GetUserDefaultFormatSettings").and.callFake(function () {
                return {
                    format: 'shn'
                };
            });
        });

        it("should call RenderFormatSettingDropdownlist", function () {
            userSettingsHandler.InitialControlsEnum();
            expect(userSettingsHandler.RenderFormatSettingDropdownlist).toHaveBeenCalled();
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
            userSettingsHandler.InitialControlsExecuteLastSearch(setting);
            expect($('#autoExecuteLastSearch').is(':checked')).toEqual(true);
        });
    });

    describe("call InitialControlsExecuteItem", function () {

        beforeEach(function () {
            $('body').append('<input id="autoExecuteItemsOnLogin" type="checkbox">');
        });

        afterEach(function () {
            $('#autoExecuteItemsOnLogin').remove();
        });

        it("should set execute item to enable", function () {
            var setting = { auto_execute_items_on_login: true };
            userSettingsHandler.InitialControlsExecuteItem(setting);
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
            var ddl = userSettingsHandler.RenderFormatSettingDropdownlist(elementId, models, userSettingDefault, dataTextField, dataValueField);
            expect(ddl.kendoDropDownOption.dataTextField).toEqual('short_name');
            expect(ddl.kendoDropDownOption.dataValueField).toEqual('uri');
            expect(ddl.kendoDropDownOption.index).toEqual(1);
        });

        it("should set initail option", function () {
            var ddl = userSettingsHandler.RenderFormatSettingDropdownlist(elementId, models, userSettingDefault, dataTextField, dataValueField, true);
            expect(ddl.kendoDropDownOption.optionLabel).toBeDefined();
        });

        it("when not set textField or dataField, option should be name and id", function () {
            var ddl = userSettingsHandler.RenderFormatSettingDropdownlist(elementId, models, userSettingDefault, null, null);
            expect(ddl.kendoDropDownOption.dataTextField).toEqual('name');
            expect(ddl.kendoDropDownOption.dataValueField).toEqual('id');
        });

        it("when dropdown change, ChangeDropdownFormat should be called", function () {
            spyOn(userSettingsHandler, "ChangeDropdownFormat").and.callFake($.noop);
            var ddl = userSettingsHandler.RenderFormatSettingDropdownlist(elementId, models, userSettingDefault, null, null);
            var e = { sender: { wrapper: { context: {} } } };
            ddl.kendoDropDownOption.change(e);
            expect(userSettingsHandler.ChangeDropdownFormat).toHaveBeenCalled();
        });

    });

    describe("call SetDefaultItemDropdownList", function () {

        it("should get dropdown if element exist", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () { return { value: $.noop }; });
            var result = userSettingsHandler.SetDefaultItemDropdownList('#id', 'value');
            expect(result).not.toEqual(null);
        });

        it("should not get dropdown if element does not exist", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () { return null; });
            var result = userSettingsHandler.SetDefaultItemDropdownList('#id', 'value');
            expect(result).toEqual(null);
        });

    });

    describe("call GetShowElementIdWhenTabClick", function () {

        it("should get 'UserDetailSettingArea' if elementId is 'UserDetailSetting'", function () {
            var result = userSettingsHandler.GetShowElementIdWhenTabClick('UserDetailSetting');
            expect(result).toEqual('UserDetailSettingArea');
        });

        it("should get 'SystemSettingArea' if elementId is 'SystemSetting'", function () {
            var result = userSettingsHandler.GetShowElementIdWhenTabClick('SystemSetting');
            expect(result).toEqual('SystemSettingArea');
        });

        it("should get 'FormatSettingArea' if elementId is 'FormatSetting'", function () {
            var result = userSettingsHandler.GetShowElementIdWhenTabClick('FormatSetting');
            expect(result).toEqual('FormatSettingArea');
        });

        it("should get 'ActionSettingArea' if elementId is 'ActionSetting'", function () {
            var result = userSettingsHandler.GetShowElementIdWhenTabClick('ActionSetting');
            expect(result).toEqual('ActionSettingArea');
        });

        it("should get null if elementId does not match", function () {
            var result = userSettingsHandler.GetShowElementIdWhenTabClick('xxx');
            expect(result).toEqual(null);
        });

    });

    describe("call GetDefaulModel", function () {

        beforeEach(function () {
            userSettingsHandler.DataModels = {
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
            var defaulModel = userSettingsHandler.GetDefaulModel();
            expect(defaulModel).toEqual('/models/1');
        });

        it("if data model is disabled, should not get defaul model", function () {
            userSettingsHandler.DataModels.options.enabled = false;
            var defaulModel = userSettingsHandler.GetDefaulModel();
            expect(defaulModel).toEqual(null);

        });
    });

    describe("call SaveUserSettings", function () {

        beforeEach(function () {
            spyOn(popup, 'Alert').and.callFake($.noop);
            spyOn(requestHistoryModel, 'SaveLastExecute').and.callFake($.noop);
            spyOn(userSettingModel, 'Data').and.callFake(function () { return {}; });
            spyOn(userSettingsHandler, 'SetDefaultBusinessProcess').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetLanguage').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetNumberExportExcel').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetTechnicalInfoSapFieldChooser').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetTechnicalInfoSapFieldHeader').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetEnumFormat').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetCurrencyType').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetNumberFormat').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetCurrencyFormat').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetPercentFormat').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetDateFormat').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetTimeFormat').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetAutoExecuteLastSearch').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetAutoExecuteAtLogin').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SetClientSetting').and.callFake($.noop);
            spyOn(userSettingModel, 'ReloadAfterChanged').and.callFake($.noop);
            spyOn(window, 'SetLoadingVisibility').and.callFake($.noop);
            spyOn(userSettingModel, 'PutExecuteAtLogin').and.callFake($.noop);
            spyOn(userSettingModel, 'Save').and.callFake($.noop);
            spyOn(userSettingsHandler, 'SaveUserSettingsCallback').and.callFake($.noop);
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

            userSettingsHandler.SaveUserSettings();
            expect(userSettingsHandler.SaveUserSettingsCallback).toHaveBeenCalled();
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

            userSettingsHandler.SaveUserSettings();
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

            userSettingsHandler.SaveUserSettings();
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
            userSettingsHandler.SaveUserSettings();
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
            userSettingsHandler.SetDefaultBusinessProcess(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES].toString()).toEqual('S2D');
        });

        it("when select default setting, should not set business process", function () {
            var defaultUserSetting = { default_business_processes: 'S2D' },
                userSettings = {};
            userSettingsHandler.SetDefaultBusinessProcess(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetLanguage(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES]).toEqual("en");
        });
        it("when select default setting, should not set Language", function () {
            var defaultUserSetting = { default_language: "en" },
                userSettings = {};
            userSettingsHandler.SetLanguage(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetNumberExportExcel(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES]).toEqual(1000);
        });

        it("should set number export to excel using user setting", function () {
            var defaultUserSetting = { default_export_lines: 1000 },
                userSettings = {};
            userSettingsHandler.SetNumberExportExcel(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetTechnicalInfoSapFieldChooser(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_CHOOSER]).toEqual(true);
        });
        it("when select default setting, should not set technical info sap field chooser", function () {
            var defaultUserSetting = { sap_fields_in_chooser: true },
                userSettings = {};
            userSettingsHandler.SetTechnicalInfoSapFieldChooser(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetTechnicalInfoSapFieldHeader(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_HEADER]).toEqual(true);
        });

        it("when select default setting, should not set technical info sap field header", function () {
            var defaultUserSetting = { sap_fields_in_header: true },
                userSettings = {};
            userSettingsHandler.SetTechnicalInfoSapFieldHeader(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetEnumFormat(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetEnumFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_ENUM]).toEqual(undefined);
        });
    });

    describe("call SetCurrencyType", function () {

        it("should set currency type", function () {
            var defaultUserSetting = { default_currency: "USD" },
                userSettings = [],
                selectedCurrency = "EUR";
            userSettingsHandler.SetCurrencyType(defaultUserSetting, userSettings, selectedCurrency);
            expect(userSettings[enumHandlers.USERSETTINGS.DEFAULT_CURRENCY]).toEqual("EUR");
        });

        it("select default setting, should not set currency type", function () {
            var defaultUserSetting = { default_currency: "USD" },
                userSettings = [],
                selectedCurrency = "USD";
            userSettingsHandler.SetCurrencyType(defaultUserSetting, userSettings, selectedCurrency);
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
            userSettingsHandler.SetNumberFormat(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetNumberFormat(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetCurrencyFormat(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetCurrencyFormat(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetPercentFormat(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetPercentFormat(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetDateFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_DATE]).toEqual("{\"order\":\"MDY\",\"day\":\"dd\",\"month\":\"MM\",\"year\":\"yyyy\",\"separator\":\"/\"}");
        });

        it("when not change setting, should not set date format", function () {
            var defaultUserSetting = { format_date: '{"order":"MDY","day":"dd","month":"MM","year":"yyyy","separator":"/"}' },
                userSettings = {};
            userSettingsHandler.SetDateFormat(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetTimeFormat(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.FORMAT_TIME]).toEqual("{\"hour\":\"HHmm\",\"separator\":\":\",\"second\":\"\"}");
        });

        it("when not change setting, should not set time format", function () {
            var defaultUserSetting = { format_time: '{"hour":"HHmm","separator":":","second":""}' },
                userSettings = {};
            userSettingsHandler.SetTimeFormat(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetAutoExecuteLastSearch(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.AUTO_EXECUTE_LAST_SEARCH]).toEqual(true);
        });

        it("when not change setting, should not set auto execute last search", function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return false;
            });
            var defaultUserSetting = { auto_execute_last_search: false },
                userSettings = {};
            userSettingsHandler.SetAutoExecuteLastSearch(defaultUserSetting, userSettings);
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
            userSettingsHandler.SetAutoExecuteAtLogin(defaultUserSetting, userSettings);
            expect(userSettings[enumHandlers.USERSETTINGS.AUTO_EXECUTE_ITEMS_ON_LOGIN]).toEqual(true);
        });

        it("if not change setting, should not set auto execute at login", function () {
            spyOn(WC.HtmlHelper, "GetCheckBoxStatus").and.callFake(function () {
                return false;
            });
            var defaultUserSetting = { auto_execute_items_on_login: false },
                userSettings = {};
            userSettingsHandler.SetAutoExecuteAtLogin(defaultUserSetting, userSettings);
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
        });

        it("should set client setting", function () {
            var defaultUserSetting = { client_settings: "{\"general_decimal_seperator\":\",\",\"general_thousand_seperator\":\".\"}" },
                userSettings = [],
                generalDecimalSeparator = ".",
                generalThousandSeparator = ",";
            userSettingsHandler.SetClientSetting(defaultUserSetting, userSettings, generalDecimalSeparator, generalThousandSeparator);

            var result = {
                default_Starred_Fields: true,
                default_Suggested_Fields: true,
                general_decimal_seperator: ".",
                general_thousand_seperator: ",",
                show_facet_angle_warnings: true
            };

            expect(JSON.parse(userSettings[enumHandlers.USERSETTINGS.CLIENT_SETTINGS])).toEqual(result);
        });

        it("setting is not changed, use the current setting", function () {
            var defaultUserSetting = { client_settings: "{\"show_facet_angle_warnings\":true,\"default_Starred_Fields\":true,\"default_Suggested_Fields\":true,\"general_decimal_seperator\":\".\",\"general_thousand_seperator\":\",\"}" },
                userSettings = [],
                generalDecimalSeparator = ".",
                generalThousandSeparator = ",";
            userSettingsHandler.SetClientSetting(defaultUserSetting, userSettings, generalDecimalSeparator, generalThousandSeparator);
            expect(userSettings).toEqual([]);
        });
    });

    describe("call SaveUserSettingsCallback", function () {
        var searchPageHandlerTemp;
        var anglePageHandlerTemp;
        var dashboardHandlerTemp;
        var data;
        beforeEach(function () {
            spyOn(userSettingsHandler, "ClearLocalStorageAfterChangeUserSetting").and.callFake($.noop);
            spyOn(userSettingsView, "ClosePopup").and.callFake($.noop);
            spyOn(searchQueryModel, "Search").and.callFake($.noop);
            spyOn(searchQueryModel, "SetUIOfAdvanceSearchFromParams").and.callFake($.noop);
            spyOn(userSettingsHandler, "RenderSingleDrilldown").and.callFake($.noop);
            spyOn(userSettingsHandler, "RenderDisplayView").and.callFake($.noop);
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
            userSettingsHandler.SaveUserSettingsCallback(data);
            expect(window.ReloadWebPage).toHaveBeenCalled();
        });

        it("not reload after change, function ClosePopup have been called", function () {
            spyOn(userSettingModel, "ReloadAfterChanged").and.callFake(function () { return false; });
            userSettingsHandler.SaveUserSettingsCallback(data);
            expect(userSettingsView.ClosePopup).toHaveBeenCalled();
        });
        it("in angle page, function RenderDisplayView have been called", function () {
            spyOn(userSettingModel, "ReloadAfterChanged").and.callFake(function () { return false; });
            window.searchPageHandler = undefined;
            window.anglePageHandler = {};
            userSettingsHandler.SaveUserSettingsCallback(data);
            expect(userSettingsHandler.RenderDisplayView).toHaveBeenCalled();
        });
        it("in dashboard page, function ReApplyResult have been called", function () {
            spyOn(userSettingModel, "ReloadAfterChanged").and.callFake(function () { return false; });
            window.searchPageHandler = undefined;
            window.anglePageHandler = undefined;
            window.dashboardHandler = { ReApplyResult: $.noop };
            spyOn(dashboardHandler, "ReApplyResult").and.callFake(function () { });
            userSettingsHandler.SaveUserSettingsCallback(data);
            expect(dashboardHandler.ReApplyResult).toHaveBeenCalled();
        });
        it("should do nothing if in others page", function () {
            spyOn(userSettingModel, "ReloadAfterChanged").and.callFake(function () { return false; });
            window.searchPageHandler = undefined;
            window.anglePageHandler = undefined;
            window.dashboardHandler = undefined;
            userSettingsHandler.SaveUserSettingsCallback(data);

            expect(userSettingsHandler.RenderDisplayView).not.toHaveBeenCalled();
        });
    });

    describe("call ClearLocalStorageAfterChangeUserSetting", function () {

        beforeEach(function () {
            jQuery.localStorage('mouse', 'mouse');
            jQuery.localStorage('user', 'EAAdmin');
            jQuery.localStorage('session_uri', '/session/1');
            userSettingsHandler.ClearLocalStorageAfterChangeUserSetting();
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
            userSettingsHandler.RenderDisplayView();
            expect(resultModel.SetResultExecution).not.toHaveBeenCalled();
        });

        it("grid name is drilldown, SetResultExecution should not becalled", function () {
            fieldsChooserModel.GridName = enumHandlers.FIELDCHOOSERNAME.LISTDRILLDOWN;
            userSettingsHandler.RenderDisplayView();
            expect(resultModel.SetResultExecution).not.toHaveBeenCalled();
        });

        it("listHandler, render should be called", function () {
            spyOn(displayModel, "Data").and.callFake(function () { return { display_type: 'list' }; });
            userSettingsHandler.RenderDisplayView();
            expect(listHandler.GetListDisplay).toHaveBeenCalled();
        });

        it("chartHandler, get chart display should be called", function () {
            spyOn(displayModel, "Data").and.callFake(function () { return { display_type: 'chart' }; });
            userSettingsHandler.RenderDisplayView();
            expect(chartHandler.GetChartDisplay).toHaveBeenCalled();
        });

        it("pivotPageHandler, get pivot display should be called", function () {
            spyOn(displayModel, "Data").and.callFake(function () { return { display_type: 'pivot' }; });
            userSettingsHandler.RenderDisplayView();
            expect(pivotPageHandler.GetPivotDisplay).toHaveBeenCalled();
        });

        it("other display type, render functions should not be called", function () {
            spyOn(displayModel, "Data").and.callFake(function () { return { display_type: 'other' }; });
            userSettingsHandler.RenderDisplayView();
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
            userSettingsHandler.RenderSingleDrilldown();
            expect(fieldsChooserModel.BindDataGrid).toHaveBeenCalled();
        });

        it("BindDataGrid should be called", function () {
            $('<div id="ListGrid"></div>').data('kendoGrid', true).appendTo('body');
            fieldsChooserModel.GridName = 'ListGrid';
            userSettingsHandler.RenderSingleDrilldown();
            expect(fieldsChooserModel.BindDataGrid).toHaveBeenCalled();
        });

        it("when grid name is not list drill down, should not render drilldown", function () {
            $('<div id="ListDrilldownGrid"></div>').data('kendoGrid', false).appendTo('body');
            userSettingsHandler.RenderSingleDrilldown();
            expect(fieldsChooserModel.BindDataGrid).not.toHaveBeenCalled();
        });

        it("when drildown grid is not visible, BindDataGrid should not be called", function () {
            $('<div id="ListDrilldownGrid"></div>').data('kendoGrid', true).appendTo('body');
            $('#ListDrilldownGrid').hide();
            userSettingsHandler.RenderSingleDrilldown();
            expect(fieldsChooserModel.BindDataGrid).not.toHaveBeenCalled();
        });
    });

    describe("call SystemModelSelected", function () {
        var e = {};
        beforeEach(function () {
            e.sender = { value: function () { return ''; } };
            spyOn(userSettingsHandler, "ChangeNumberFormat").and.callFake($.noop);
            $('body').append('<div class="ExportExcel"></div>');
        });
        afterEach(function () {
            $('.ExportExcel').remove();
        });

        it("allowExport authorization should be show export excel button", function () {
            spyOn(userModel, "GetAllowExportAuthorizationByModelUri").and.callFake(function () {
                return true;
            });
            userSettingsHandler.SystemModelSelected(e);
            expect($('.ExportExcel').css('display')).toEqual('block');
        });

        it("disallow export authorization should be hide export excel button", function () {
            spyOn(userModel, "GetAllowExportAuthorizationByModelUri").and.callFake(function () {
                return false;
            });
            userSettingsHandler.SystemModelSelected(e);
            expect($('.ExportExcel').css('display')).toEqual('none');
        });
    });

    describe("call ChangeDropdownFormat", function () {

        beforeEach(function () {
            spyOn(userSettingsHandler, "ChangeGeneralFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeNumberFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeCurerncyFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangePercentagesFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeDateFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeTimeFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeSetFormat").and.callFake($.noop);
        });

        it("GeneralDecimalSeperatorDropdown should call ChangeGeneralFormat", function () {
            userSettingsHandler.ChangeDropdownFormat('GeneralDecimalSeperatorDropdown');
            expect(userSettingsHandler.ChangeGeneralFormat).toHaveBeenCalled();
        });

        it("NumbersSelect should call ChangeNumberFormat", function () {
            userSettingsHandler.ChangeDropdownFormat('NumbersSelect');
            expect(userSettingsHandler.ChangeNumberFormat).toHaveBeenCalled();
        });

        it("DefaultCurrencySelect should call ChangeCurerncyFormat", function () {
            userSettingsHandler.ChangeDropdownFormat('DefaultCurrencySelect');
            expect(userSettingsHandler.ChangeCurerncyFormat).toHaveBeenCalled();
        });

        it("PercentagesFormatDisplayUnitSelect should call ChangePercentagesFormat", function () {
            userSettingsHandler.ChangeDropdownFormat('PercentagesFormatDisplayUnitSelect');
            expect(userSettingsHandler.ChangePercentagesFormat).toHaveBeenCalled();
        });

        it("DateFormatOrderDropdown should call ChangeDateFormat", function () {
            userSettingsHandler.ChangeDropdownFormat('DateFormatOrderDropdown');
            expect(userSettingsHandler.ChangeDateFormat).toHaveBeenCalled();
        });

        it("TimeFormatHourDropdown should call ChangeTimeFormat", function () {
            userSettingsHandler.ChangeDropdownFormat('TimeFormatHoursDropdown');
            expect(userSettingsHandler.ChangeTimeFormat).toHaveBeenCalled();
        });

        it("EnumSelect should call ChangeSetFormat", function () {
            userSettingsHandler.ChangeDropdownFormat('EnumSelect');
            expect(userSettingsHandler.ChangeSetFormat).toHaveBeenCalled();
        });

        it("EnumSelect should do nothing", function () {
            userSettingsHandler.ChangeDropdownFormat('xxx');
            expect(userSettingsHandler.ChangeSetFormat).not.toHaveBeenCalled();
        });
    });

    describe("call InitialExampleFormat", function () {
        beforeEach(function () {
            spyOn(userSettingsHandler, "ChangeGeneralFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeNumberFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeCurerncyFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangePercentagesFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeDateFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeTimeFormat").and.callFake($.noop);
            spyOn(userSettingsHandler, "ChangeSetFormat").and.callFake($.noop);
        });

        it("ChangeSetFormat should be called", function () {
            userSettingsHandler.InitialExampleFormat();
            expect(userSettingsHandler.ChangeSetFormat).toHaveBeenCalled();
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
            var customCulture = userSettingsHandler.GetCustomCulture();
            expect(customCulture.numberFormat[","]).toEqual(".");
        });

        it("should set decimal seperator for custom culture", function () {
            var customCulture = userSettingsHandler.GetCustomCulture();
            expect(customCulture.numberFormat["."]).toEqual(",");
        });
    });

    describe("call ChangePercentagesFormat", function () {

        var userSettingHandler2;

        beforeEach(function () {

            userSettingHandler2 = new UserSettingsHandler();
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

            userSettingHandler2 = new UserSettingsHandler();
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

            userSettingHandler2 = new UserSettingsHandler();
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
            userSettingsHandler.ChangeGeneralFormat();
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
            userSettingsHandler.ChangeNumberFormat();
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
            userSettingsHandler.ChangeCurerncyFormat();
            expect($('.exampleCurrency').text()).toEqual("1,234,567.890 K EUR");
        });
    });

    describe("call ChangeSetFormat", function () {

        var userSettingHandler2;

        beforeEach(function () {

            userSettingHandler2 = new UserSettingsHandler();
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

            var hour = userSettingsHandler.GetHourFormat();
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

            var hour = userSettingsHandler.GetHourFormat();
            expect(hour).toEqual(enumHandlers.TIME_TEMPLATE.HMM);

        });
    });

    describe("call GetHoursFromFieldFormat", function () {

        it("should get h", function () {
            var format = 'h:mm';
            var hour = userSettingsHandler.GetHoursFromFieldFormat(format);
            expect(hour).toEqual(enumHandlers.TIME_TEMPLATE.H);
        });

        it("should get HH", function () {
            var format = 'HH:mm';
            var hour = userSettingsHandler.GetHoursFromFieldFormat(format);
            expect(hour).toEqual(enumHandlers.TIME_TEMPLATE.HH);
        });

        it("should get a default if incorrect format", function () {
            var format = '';
            var hour = userSettingsHandler.GetHoursFromFieldFormat(format);
            expect(hour).toEqual(enumHandlers.TIME_TEMPLATE.HH);
        });
    });

    describe("call GetSecondsFromSetting", function () {

        it("should get value as it if have value", function () {
            var second = enumHandlers.TIME_TEMPLATE.SS;
            var result = userSettingsHandler.GetSecondsFromSetting(second);
            expect(result).toEqual(enumHandlers.TIME_TEMPLATE.SS);
        });

        it("should get empty if no value", function () {
            var second = '';
            var result = userSettingsHandler.GetSecondsFromSetting(second);
            expect(result).toEqual(enumHandlers.TIME_TEMPLATE.NONE);
        });
    });

    describe("call GetSecondDropdownValue", function () {

        it("should get ss if value is string type", function () {
            var second = enumHandlers.TIME_TEMPLATE.SS;
            var result = userSettingsHandler.GetSecondDropdownValue(second);
            expect(result).toEqual(enumHandlers.TIME_TEMPLATE.SS);
        });

        it("should get default if value is not string type", function () {
            var second = null;
            var result = userSettingsHandler.GetSecondDropdownValue(second);
            expect(result).toEqual(enumHandlers.FIELDSETTING.USEDEFAULT);
        });
    });

    describe("call SetSecondFormat", function () {

        it("should set format if second is string type and not default", function () {
            var details = {};
            var second = enumHandlers.TIME_TEMPLATE.SS;
            userSettingsHandler.SetSecondFormat(details, second);
            expect(details[enumHandlers.FIELDDETAILPROPERTIES.SECOND]).toEqual(enumHandlers.TIME_TEMPLATE.SS);
        });

        it("should remove format if second is string type but is a default", function () {
            var details = {};
            var second = enumHandlers.FIELDSETTING.USEDEFAULT;
            userSettingsHandler.SetSecondFormat(details, second);
            expect(details[enumHandlers.FIELDDETAILPROPERTIES.SECOND]).not.toBeDefined();
        });

        it("should remove format if second is not string", function () {
            var details = {};
            var second = null;
            userSettingsHandler.SetSecondFormat(details, second);
            expect(details[enumHandlers.FIELDDETAILPROPERTIES.SECOND]).not.toBeDefined();
        });
    });

    describe("call GetPrefixDropdownValue", function () {

        it("should get prefix if is string", function () {
            var result = userSettingsHandler.GetPrefixDropdownValue('M');
            expect(result).toEqual('M');
        });

        it("should get NONE if is null", function () {
            var result = userSettingsHandler.GetPrefixDropdownValue(null);
            expect(result).toEqual(enumHandlers.DISPLAYUNITSFORMAT.NONE);
        });

        it("should get USEDEFAULT if other", function () {
            var result = userSettingsHandler.GetPrefixDropdownValue();
            expect(result).toEqual(enumHandlers.FIELDSETTING.USEDEFAULT);
        });

    });

    describe("call GetDecimalDropdownValue", function () {

        it("should get decimal if is number", function () {
            var result = userSettingsHandler.GetDecimalDropdownValue(2);
            expect(result).toEqual(2);
        });

        it("should get USEDEFAULT if is not number", function () {
            var result = userSettingsHandler.GetDecimalDropdownValue();
            expect(result).toEqual(enumHandlers.FIELDSETTING.USEDEFAULT);
        });

    });

    describe("call GetEnumDropdownValue", function () {

        it("should get enum if has format", function () {
            var result = userSettingsHandler.GetEnumDropdownValue('shn');
            expect(result).toEqual('shn');
        });

        it("should get USEDEFAULT if no format", function () {
            var result = userSettingsHandler.GetEnumDropdownValue('');
            expect(result).toEqual(enumHandlers.FIELDSETTING.USEDEFAULT);
        });

    });

});

