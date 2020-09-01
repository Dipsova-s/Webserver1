var userSettingModel = new UserSettingViewModel();

function UserSettingViewModel() {
    "use strict";

    //BOF: View model properties
    var self = this;
    self.IsLoaded = ko.observable(false);
    self.DirectoryName = 'settings';
    self.ReloadAfterChanged = ko.observable(false);
    self.ExampleDecimal = 1234;
    self.PercentageDecimal = 1234;
    //** kept current user detail after login **
    self.Data = ko.observable();
    self.IsAutoExecuteListLoaded = ko.observable(false);
    self.OriginalAutoExecuteList = ko.observableArray([]);
    self.AutoExecuteList = ko.observableArray([]);
    self.TempRemoveList = ko.observableArray([]);
    self.SidePanelSettingsData = {};
    self.MinSidePanelSize = 320;
    self.DisplayGroupSettingsData = {};

    var resultsText = Localization.SystemSettingResults;

    // RowsExportToExcel
    self.RowsExportToExcel = ko.observableArray([
        { id: '100', name: '100 ' + resultsText },
        { id: '1000', name: '1000 ' + resultsText },
        { id: '10000', name: '10000 ' + resultsText },
        { id: '100000', name: '100000 ' + resultsText },
        { id: '0', name: Localization.All + ' ' + resultsText }
    ]);

    //Enum
    self.Enums = ko.observableArray([
        { id: 'shn', name: Localization.ListFormatEnumShortName },
        { id: 'ln', name: Localization.ListFormatEnumLongName },
        { id: 'shnln', name: Localization.ListFormatEnumShortName + ' (' + Localization.ListFormatEnumLongName + ')' }
    ]);

    //Period
    self.Periods = [
        { id: 'day', name: Localization.ListFormatPeriodDays }
    ];
    self.LabelAuthorisations = ko.observableArray([]);
    //EOF: View model properties

    // storage
    var storage = jQuery.localStorage(self.DirectoryName);
    if (storage !== null) {
        self.IsLoaded(true);
        self.Data(storage);
    }

    //BOF: View model methods
    self.Load = function () {
        // load usersetting

        if (self.IsLoaded()) {
            SetWebSiteLanguage(self.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES));
            return jQuery.when(self.Data());
        }
        var uri = directoryHandler.ResolveDirectoryUri(userModel.Data().user_settings);

        return GetDataFromWebService(uri)
            .done(function (data) {
                    self.IsLoaded(true);
                self.LoadSuccess(data);
                SetWebSiteLanguage(self.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES));
            });
    };
    self.LoadSuccess = function (data) {
        // format_locale = xx-XX
        if (data.format_locale && data.format_locale.indexOf('-') === -1) {
            data.format_locale = data.format_locale.toLowerCase();
            if (data.format_locale.length === 2) {
                if (data.format_locale === 'en') {
                    data.format_locale = 'en-US';
                }
                else {
                    data.format_locale = data.format_locale + '-' + data.format_locale.toUpperCase();
                }
            }
            else {
                data.format_locale = 'en-US';
            }
        }

        self.Data(data);
        jQuery.localStorage(self.DirectoryName, data);
    };
    self.GetByName = function (name) {
        var getByName = function () {
            return self.IsLoaded() ? typeof self.Data()[name] === 'undefined' ? null : self.Data()[name] : null;
        };
        if (enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES === name) {
            var language = getByName();
            if (!language) {
                language = 'en';
            }
            return language;
        }
        else {
            return getByName();
        }
    };
    self.GetClientSettings = function () {
        return JSON.parse(self.GetByName(enumHandlers.USERSETTINGS.CLIENT_SETTINGS)) || {};
    };
    self.GetClientSettingByPropertyName = function (propertyName) {
        var clientSettings = self.GetClientSettings();
        if (clientSettings[propertyName]) {
            return clientSettings[propertyName];
        }
        else {
            return null;
        }
    };
    self.Save = function (data, updateSession) {
        if (jQuery.isEmptyObject(data)) {
            return jQuery.when(self.Data());
        }

        var deferred = jQuery.Deferred();

        var url = directoryHandler.ResolveDirectoryUri(userModel.Data().user_settings);
        UpdateDataToWebService(url, data)
            .done(function (model) {
                self.LoadSuccess(model);

                if (updateSession === false) {
                    deferred.resolve(model);
                }
                else {
                    self.UpdateUserSettingModel()
                        .always(function () {
                            deferred.resolve(model);
                        });
                }
            });

        return deferred.promise();
    };
    self.UpdateUserSettingModel = function () {
        var url = WC.HtmlHelper.GetInternalUri('updateusersetting', 'user');
        return UpdateDataToWebService(url, null, true);
    };
    self.UpdateClientSettings = function (clientSettings) {
        var data = self.Data();
        if (!data)
            return;

        jQuery.extend(data, clientSettings);
        self.LoadSuccess(data);
    };
    self.GetClientSettingsData = function () {
        if (!self.Data())
            return null;

        var searchPageSettings = self.GetSearchPageClientSettingsData();
        var anglePageSettings = self.GetAnglePageClientSettingsData();
        var dashboardPageSettings = self.GetDashboardPageClientSettingsData();
        var pageSettings = jQuery.extend({}, searchPageSettings, anglePageSettings, dashboardPageSettings);
        if (jQuery.isEmptyObject(pageSettings))
            return null;

        var clientSettings = self.GetClientSettings();
        jQuery.extend(clientSettings, pageSettings);
        var data = {};
        data[enumHandlers.USERSETTINGS.CLIENT_SETTINGS] = JSON.stringify(clientSettings);
        return new RequestModel(RequestModel.METHOD.PUT, userModel.Data().user_settings, data);
    };

    // search page settings
    self.GetSearchPageClientSettingsData = function () {
        var settings = {};
        if (!window.SearchPageHandler)
            return settings;

        jQuery.extend(settings, self.GetLastSearchSettingsData());
        jQuery.extend(settings, self.GetSearchTermSettingsData());
        jQuery.extend(settings, self.GetSidePanelSettingsData());
        return settings;
    };
    self.GetLastSearchSettingsData = function () {
        var settings = {};
        var lastSearchUrl = jQuery.address.value();
        var prevLastSearchUrl = self.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_SEARCH_URL);
        if (prevLastSearchUrl !== lastSearchUrl && lastSearchUrl !== '/')
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.LAST_SEARCH_URL] = lastSearchUrl;
        return settings;
    };
    self.GetSearchTermSettingsData = function () {
        var settings = {};
        var searchTerms = searchPageHandler.SearchTerms;
        var prevSearchTerms = self.GetSearchTerms();
        if (prevSearchTerms.toString() !== searchTerms.toString())
            settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SEARCH_TERMS] = searchTerms;
        return settings;
    };
    self.GetSearchTerms = function () {
        var searchTerms = self.GetClientSettingByPropertyName(enumHandlers.CLIENT_SETTINGS_PROPERTY.SEARCH_TERMS);
        return WC.Utility.ToArray(searchTerms);
    };

    // angle page settings
    self.GetAnglePageClientSettingsData = function () {
        var settings = {};
        if (!window.AnglePageHandler)
            return {};

        jQuery.extend(settings, self.GetDisplayGroupSettingsData());
        jQuery.extend(settings, self.GetSidePanelSettingsData());
        return settings;
    };
    self.InitialDisplayGroupSettingsData = function () {
        self.DisplayGroupSettingsData = self.GetDisplayGroupSettings();
    };
    self.GetDisplayGroupSettingsData = function () {
        var settings = {};
        var displayGroupSettings = self.GetDisplayGroupSettings();
        if (jQuery('.tab-menu-header').length
            && JSON.stringify(displayGroupSettings) !== JSON.stringify(self.DisplayGroupSettingsData))
            jQuery.extend(settings, self.DisplayGroupSettingsData);
        return settings;
    };
    self.GetDisplayGroupSettings = function () {
        var clientSettings = self.GetClientSettings();
        var getValue = function (value, fallback) {
            return typeof value === 'boolean' ? value : fallback;
        };
        var settings = {};
        settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_GROUP_PUBLIC] = getValue(clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_GROUP_PUBLIC], true);
        settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_GROUP_PRIVATE] = getValue(clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_GROUP_PRIVATE], false);
        settings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_GROUP_OTHER] = getValue(clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_GROUP_OTHER], false);
        return settings;
    };
    self.SetDisplayGroupSettings = function (property, value) {
        self.DisplayGroupSettingsData[property] = value;
    };

    // dashboard page settings
    self.GetDashboardPageClientSettingsData = function () {
        var settings = {};
        if (!window.DashboardPageHandler)
            return {};

        jQuery.extend(settings, self.GetSidePanelSettingsData());
        return settings;
    };

    // side panel settings
    self.InitialSidePanelSettingsData = function () {
        self.SidePanelSettingsData = self.GetSidePanelSettings();
    };
    self.GetSidePanelSettings = function () {
        var minSize = self.MinSidePanelSize;
        var clientSettings = self.GetClientSettings();
        var panelSettings = {};
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_COLLAPSED] = clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_COLLAPSED] || false;
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE] = Math.max(clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE] || minSize, minSize);
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_TAB] = clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_TAB] || 0;
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_ACCORDIONS] = jQuery.extend(self.GetDefaultAnglePanelAccordions(), clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_ACCORDIONS]);
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_PANEL_ACCORDIONS] = jQuery.extend(self.GetDefaultDisplayPanelAccordions(), clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DISPLAY_PANEL_ACCORDIONS]);
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SEARCH_PANEL_COLLAPSED] = clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SEARCH_PANEL_COLLAPSED] || false;
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_COLLAPSED] = clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_COLLAPSED] || false;
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE] = Math.max(clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE] || minSize, minSize);
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_TAB] = clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_TAB] || 0;
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_ACCORDIONS] = jQuery.extend(self.GetDefaultDashboardPanelAccordions(), clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_ACCORDIONS]);
        panelSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.WIDGET_PANEL_ACCORDIONS] = jQuery.extend(self.GetDefaultWidgetPanelAccordions(), clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.WIDGET_PANEL_ACCORDIONS]);
        return panelSettings;
    };
    self.SetSidePanelSettings = function (property, value) {
        if (enumHandlers.CLIENT_SETTINGS_PROPERTY.ANGLE_PANEL_SIZE === property ||
            enumHandlers.CLIENT_SETTINGS_PROPERTY.DASHBOARD_PANEL_SIZE === property)
            value = Math.max(value, self.MinSidePanelSize);
        self.SidePanelSettingsData[property] = value;
    };
    self.GetSidePanelSettingsData = function () {
        var sidePanelSettings = self.GetSidePanelSettings();
        return jQuery('.content-wrapper').length
            && JSON.stringify(sidePanelSettings) !== JSON.stringify(self.SidePanelSettingsData)
            ? self.SidePanelSettingsData : {};
    };
    self.GetDefaultAnglePanelAccordions = function () {
        var setting = {};
        setting[enumHandlers.ACCORDION.DEFINITION] = true;
        setting[enumHandlers.ACCORDION.DESCRIPTION] = true;
        setting[enumHandlers.ACCORDION.LABEL] = true;
        return setting;
    };
    self.GetDefaultDisplayPanelAccordions = function () {
        var setting = {};
        setting[enumHandlers.ACCORDION.DEFINITION] = true;
        setting[enumHandlers.ACCORDION.AGGREGATION] = true;
        setting[enumHandlers.ACCORDION.DESCRIPTION] = true;
        return setting;
    };
    self.GetDefaultDashboardPanelAccordions = function () {
        var setting = {};
        setting[enumHandlers.ACCORDION.DEFINITION] = true;
        setting[enumHandlers.ACCORDION.DESCRIPTION] = true;
        setting[enumHandlers.ACCORDION.LABEL] = true;
        return setting;
    };
    self.GetDefaultWidgetPanelAccordions = function () {
        var setting = {};
        setting[enumHandlers.ACCORDION.DEFINITION] = true;
        return setting;
    };

    self.CheckExecuteAutoWhenLogon = function () {
        return self.GetByName(enumHandlers.USERSETTINGS.AUTO_EXECUTE_ITEMS_ON_LOGIN) && jQuery.localStorage('firstLogin') === 1;
    };
    self.CheckExecuteSearchWhenLogon = function () {
        return self.GetByName(enumHandlers.USERSETTINGS.AUTO_EXECUTE_LAST_SEARCH) && jQuery.localStorage('firstLogin') === 1;
    };
    self.LoadAutoExecuteList = function () {
        var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.ITEMS);
        var params = {};
        params[enumHandlers.PARAMETERS.CACHING] = false;
        params[enumHandlers.PARAMETERS.OFFSET] = 0;
        params[enumHandlers.PARAMETERS.LIMIT] = systemSettingHandler.GetMaxPageSize();
        params[enumHandlers.PARAMETERS.FQ] = 'facetcat_characteristics:(facet_executeonlogin)';

        self.IsAutoExecuteListLoaded(false);
        return GetDataFromWebService(uri, params)
            .then(function (data) {
                self.IsAutoExecuteListLoaded(true);
                self.TempRemoveList.removeAll();
                self.OriginalAutoExecuteList.removeAll();
                self.AutoExecuteList.removeAll();

                var list;
                jQuery.each(data.items, function (itemIndex, item) {
                    var model = modelsHandler.GetModelByUri(item.model);
                    var modelName = !model ? item.id : model.short_name || model.id;

                    var linkParams = {};
                    linkParams[SearchStorageHandler.Query] = null;
                    if (item.type === enumHandlers.ITEMTYPE.DASHBOARD) {
                        list = {
                            id: item.id,
                            name: item.name,
                            uri: item.uri,
                            link: WC.Utility.GetDashboardPageUri(item.uri, linkParams),
                            model: modelName,
                            type: item.type,
                            display: {
                                name: ko.observable(''),
                                display_type: enumHandlers.ITEMTYPE.DASHBOARD
                            }
                        };

                        self.OriginalAutoExecuteList.push(jQuery.extend({}, list));
                        self.AutoExecuteList.push(jQuery.extend({}, list));
                    }
                    else {
                        if (item.is_template) {
                            linkParams[enumHandlers.ANGLEPARAMETER.TARGET] = enumHandlers.ANGLETARGET.ANGLEPOPUP;
                            linkParams[enumHandlers.ANGLEPARAMETER.TEMPLATE] = true;
                        }
                        jQuery.each(item.displays, function (displayIndex, display) {
                            if (display.user_specific && display.user_specific.execute_on_login) {
                                display.name = ko.observable(display.name);
                                list = {
                                    id: item.id,
                                    name: item.name,
                                    uri: item.uri,
                                    link: WC.Utility.GetAnglePageUri(item.uri, display.uri, linkParams),
                                    model: modelName,
                                    type: item.type,
                                    display: display
                                };

                                self.OriginalAutoExecuteList.push(jQuery.extend({}, list));
                                self.AutoExecuteList.push(jQuery.extend({}, list));
                            }
                        });
                    }
                });

                return jQuery.when(data);
            });
    };
    self.RemoveAutoExecuteList = function (list) {
        self.AutoExecuteList.remove(list);
        self.TempRemoveList.push(list);
    };
    self.ResetAutoExecuteList = function () {
        self.TempRemoveList.removeAll();
        self.AutoExecuteList.removeAll();
        self.AutoExecuteList.push.apply(self.AutoExecuteList, self.OriginalAutoExecuteList());
    };
    self.PutExecuteAtLogin = function () {
        var deferred = [];
        jQuery.each(self.TempRemoveList(), function (idx, obj) {
            var putData = {
                user_specific: {
                    execute_on_login: false
                }
            };
            if (obj.display.display_type === enumHandlers.ITEMTYPE.DASHBOARD) {
                deferred.pushDeferred(UpdateDataToWebService, [obj.uri, putData]);
            }
            else {
                var params = {};
                params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
                var url = obj.display.uri + '?' + jQuery.param(params);
                deferred.pushDeferred(UpdateDataToWebService, [url, putData]);
            }
        });

        return jQuery.whenAll(deferred)
            .done(function () {
                self.TempRemoveList.removeAll();
                self.OriginalAutoExecuteList.removeAll();
                self.OriginalAutoExecuteList.push.apply(self.OriginalAutoExecuteList, self.AutoExecuteList());
            });
    };
    self.GenerateLabelAuthorisations = function (modelUri) {
        self.LabelAuthorisations.removeAll();
        var priviledgeModels = privilegesViewModel.GetModelPrivilegesByUri(modelUri);
        if (priviledgeModels.length) {
            jQuery.each(privilegesViewModel.PRIVILEGESTATUS, function (propName, propValue) {
                self.LabelAuthorisations.push({
                    StatusId: propValue.Code,
                    StatusName: propValue.Text,
                    LabelCategories: ko.observableArray([])
                });
            });

            jQuery.each(priviledgeModels[0].label_authorizations, function (propName, propValue) {
                var statuses = jQuery.grep(self.LabelAuthorisations(), function (labelAuthorisation) { return labelAuthorisation.StatusId === propValue; });
                if (statuses.length) {
                    var authorizeLabel = modelLabelCategoryHandler.GetLabelById(propName);
                    if (authorizeLabel) {
                        var category = modelLabelCategoryHandler.GetLabelCategoryByUri(authorizeLabel.category);
                        if (category) {
                            var labelCategories = jQuery.grep(statuses[0].LabelCategories(), function (labelCategory) {
                                return labelCategory.CategoryName().toLowerCase() === category.name.toLowerCase();
                            });
                            var label = {
                                LabelName: ko.observable(authorizeLabel.name),
                                LabelId: ko.observable(authorizeLabel.id)
                            };
                            if (labelCategories.length === 0) {
                                var labelCategory = { CategoryId: ko.observable(category.id), CategoryName: ko.observable(category.name), Labels: ko.observableArray([]) };
                                labelCategory.Labels.push(label);
                                statuses[0].LabelCategories.push(labelCategory);
                            }
                            else {
                                labelCategories[0].Labels.push(label);
                            }
                        }
                    }
                }
            });
        }
    };
    self.GetUserLocalCultureName = function () {
        return userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES);
    };
    self.GetTimeFormatTemplateBy = function (name) {
        var timeDefaultSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.TIME);
        return timeDefaultSettings[name];
    };
    self.GetMonthBucketTemplate = function () {
        var dateDefaultSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.DATE);

        var dateStringTemplate;
        switch (dateDefaultSettings.order) {
            case enumHandlers.DATE_ORDER_TEMPLATE.DMY:
            case enumHandlers.DATE_ORDER_TEMPLATE.MDY:
                dateStringTemplate = dateDefaultSettings.month + dateDefaultSettings.datedelimiter + dateDefaultSettings.year;
                break;
            case enumHandlers.DATE_ORDER_TEMPLATE.YMD:
                dateStringTemplate = dateDefaultSettings.year + dateDefaultSettings.datedelimiter + dateDefaultSettings.month;
                break;
            default:
                dateStringTemplate = '';
                break;
        }
        return dateStringTemplate;
    };
    self.GetUserDateTemplate = function () {
        var dateDefaultSettings = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.DATE);

        var dateStringTemplate;
        switch (dateDefaultSettings.order) {
            case enumHandlers.DATE_ORDER_TEMPLATE.DMY:
                dateStringTemplate = dateDefaultSettings.day + dateDefaultSettings.datedelimiter + dateDefaultSettings.month + dateDefaultSettings.datedelimiter + dateDefaultSettings.year;
                break;
            case enumHandlers.DATE_ORDER_TEMPLATE.MDY:
                dateStringTemplate = dateDefaultSettings.month + dateDefaultSettings.datedelimiter + dateDefaultSettings.day + dateDefaultSettings.datedelimiter + dateDefaultSettings.year;
                break;
            case enumHandlers.DATE_ORDER_TEMPLATE.YMD:
                dateStringTemplate = dateDefaultSettings.year + dateDefaultSettings.datedelimiter + dateDefaultSettings.month + dateDefaultSettings.datedelimiter + dateDefaultSettings.day;
                break;
            default:
                dateStringTemplate = '';
                break;
        }
        return dateStringTemplate;
    };
    self.GetUserTimeTemplate = function (customFormat) {
        if (typeof customFormat === 'string')
            return customFormat;

        return WC.FormatHelper.GetUserDefaultFormatter(enumHandlers.FIELDTYPE.TIME);
    };
    //EOF: View modle methods
}
