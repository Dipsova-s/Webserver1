var userSettingsHandler = new UserSettingsHandler();

function UserSettingsHandler() {
    "use strict";

    var self = this;
    self.DataModels = {
        data: [],
        options: {
            enabled: true
        }
    };
    self.TAB = {
        USERSETTING: 'UserDetailSetting',
        SYSTEMSETTING: 'SystemSetting',
        FORMATSETTING: 'FormatSetting',
        ACTIONSETTING: 'ActionSetting',
        FORMATSETTINGGENERAL: 'FormatSettingGeneral',
        FORMATSETTINGNUMBER: 'FormatSettingNumber',
        FORMATSETTINGCURRENCY: 'FormatSettingCurrency',
        FORMATSETTINGPERCENTAGES: 'FormatSettingPercentages',
        FORMATSETTINGDATE: 'FormatSettingDate',
        FORMATSETTINGTIME: 'FormatSettingTime',
        FORMATSETTINGSET: 'FormatSettingSet'
    };
    self.TABFORMAT = {
        NUMBER: 'number',
        DATE: 'date',
        OTHER: 'other'
    };
    self.AutoExecuteXhr = null;
    self.DATEDAYFORMAT = [];
    self.DATEMONTHFORMAT = [];
    self.DATEYEARFORMAT = [];
    self.UpdateSampleDateSettings = function () {
        self.DATEDAYFORMAT = [
            { id: enumHandlers.DATE_DAY_TEMPLATE.d, name: 'd' },
            { id: enumHandlers.DATE_DAY_TEMPLATE.dd, name: 'dd' }
        ];

        self.DATEMONTHFORMAT = [
            { id: enumHandlers.DATE_MONTH_TEMPLATE.M, name: 'M' },
            { id: enumHandlers.DATE_MONTH_TEMPLATE.MM, name: 'MM' },
            { id: enumHandlers.DATE_MONTH_TEMPLATE.MMM, name: 'MMM' }
        ];

        self.DATEYEARFORMAT = [
            { id: enumHandlers.DATE_YEAR_TEMPLATE.yy, name: 'yy' },
            { id: enumHandlers.DATE_YEAR_TEMPLATE.yyyy, name: 'yyyy' }
        ];
    };
    self.ShowPopup = function () {
        requestHistoryModel.SaveLastExecute(self, self.ShowPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        self.AutoExecuteXhr = null;

        var popupName = 'UserSetting',
            popupSettings = {
                title: Localization.Settings,
                element: '#popup' + popupName,
                html: userSettingHtmlTemplate(),
				className: 'popup' + popupName + ' popupWithTabMenu',
                minWidth: 720,
                minHeight: 420,
                buttons: self.GetUserSettingButtons(),
                open: self.ShowPopupCallback,
                resize: self.OnUserSettingsPopupResize,
                close: self.CloseUserSettingPopup
            };

        userSettingsView.SetDisableSaveButton(popupSettings);
        popup.Show(popupSettings);
    };
    self.GetUserSettingButtons = function () {
        var buttons = [
            {
                text: Captions.Button_Cancel,
                click: 'close',
                position: 'right'
            },
            {
                text: Localization.Ok,
                isPrimary: true,
                className: 'executing',
                click: function (kendoWindow, obj) {
                    if (popup.CanButtonExecute(obj)) {
                        self.SaveUserSettings();
                    }
                },
                position: 'right'
            },
            {
                text: '',
                className: 'loading16x16',
                position: 'right'
            }
        ];
        return buttons;
    };
    self.OnUserSettingsPopupResize = function () {
        var businessProcessBar = jQuery('#SystemSettingArea .businessProcesses');
        businessProcessBar.css('max-width', jQuery('#SettingArea').width() - 15);
        if (businessProcessesModel.UserSetting) {
            businessProcessesModel.UserSetting.UpdateLayout(businessProcessBar);
        }
    };
    self.CloseUserSettingPopup = function (e) {
        if (!self.IsUserHasValidCurrency()) {
            popup.Alert(Localization.Warning_Title, Localization.Info_UserCurrencyUnavailable);
            jQuery('#FormatSetting').trigger('click');
            return false;
        }
        self.AbortAutoExcecute();
        setTimeout(function () {
            e.sender.destroy();
        }, 500);

        return true;
    };
    self.AbortAutoExcecute = function () {
        if (self.AutoExecuteXhr && self.AutoExecuteXhr.abort) {
            self.AutoExecuteXhr.abort();
            return true;
        }
        else
            return false;
    };
    self.ShowPopupCallback = function (e) {
        self.UpdateSampleDateSettings();
        userSettingsView.UserSettingTabClick(self.TAB.USERSETTING);

        jQuery('#UserMenu, #HelpMenu').hide();
        e.sender.element.busyIndicator(true);
        e.sender.element.find('.popupTabMenu,.popupTabPanel').css('opacity', 0);

        jQuery.when(
            systemInformationHandler.LoadSystemInformation(),
            systemCurrencyHandler.LoadCurrencies(),
            systemLanguageHandler.LoadLanguages(),
            businessProcessesModel.General.Load(),
            modelsHandler.LoadModels()
        )
        .then(function () {
            var isLoadAllLabels = self.SetDataModel();
            return self.SetLabel(isLoadAllLabels);
        })
        .always(function () {
            setTimeout(function () {
                e.sender.element.find('.popupTabMenu,.popupTabPanel').animate({ opacity: 1 }, 'fast');
                e.sender.element.busyIndicator(false);
                SetLoadingVisibility('.popupUserSetting .loading16x16', false);

                // apply handler
                WC.HtmlHelper.ApplyKnockout(userSettingModel, e.sender.wrapper);
                userSettingsView.UserFieldSettingTabClick(self.TABFORMAT.NUMBER);
                self.InitialControls();
                self.InitialExampleFormat();
                self.AutoExecuteXhr = userSettingModel.LoadAutoExecuteList();
                e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
            }, 1);
        });
    };

    self.SetLabel = function (isLoadAllLabels) {
        if (isLoadAllLabels) {
            return jQuery.when(true);
        }
        else {
            var labelCategoryUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.LABELCATEGORIES);
            var labelUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.LABELS);
            return jQuery.when(modelLabelCategoryHandler.LoadAllLabelCategories(labelCategoryUri), modelLabelCategoryHandler.LoadAllLabels(labelUri));
        }
    };

    self.SetDataModel = function () {
        var isLoadAllLabels = true;
        var models = ko.toJS(modelsHandler.GetData());
        if (models.length) {
            self.DataModels.options.enabled = true;
            self.DataModels.data = models;
            isLoadAllLabels = self.LoadLabels(models, isLoadAllLabels);
        }
        else {
            self.DataModels.data = [{
                id: '',
                short_name: Localization.NoModelAvaliable
            }];
            self.DataModels.options.enabled = false;
        }
        return isLoadAllLabels;
    };
    self.LoadLabels = function (models, isLoadAllLabels) {
        jQuery.each(models, function (index, model) {
            if (!isLoadAllLabels)
                return false;

            var priviledgeModels = privilegesViewModel.GetModelPrivilegesByUri(model.uri);
            if (priviledgeModels.length) {
                jQuery.each(priviledgeModels[0].label_authorizations, function (label) {
                    if (!modelLabelCategoryHandler.GetLabelById(label)) {
                        isLoadAllLabels = false;
                        return false;
                    }
                });
            }
        });
        return isLoadAllLabels;
    };
    self.IsUserHasValidCurrency = function () {
        var userCurrency = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_CURRENCY);
        var currencyData = systemCurrencyHandler.GetCurrencyById(userCurrency);
        return currencyData && currencyData.enabled;
    };
    self.CheckUserCurrency = function () {
        if (!self.IsUserHasValidCurrency()) {
            errorHandlerModel.Enable(false);
            var fnCheckShowUserSetting = setInterval(function () {
                if (jQuery.active <= 0) {
                    errorHandlerModel.Enable(true);
                    clearInterval(fnCheckShowUserSetting);
                    self.ShowPopup();
                }
            }, 100);
        }
    };
    self.InitialControls = function () {
        var setting = userSettingModel.Data();
        var clientSettings = WC.Utility.ParseJSON(setting[enumHandlers.USERSETTINGS.CLIENT_SETTINGS]);

        self.InitialControlsModel();
        self.InitialControlsBusinessProcess();
        self.InitialControlsBusinessProcessStyle(setting);
        self.InitialControlsLanguage(setting);
        self.InitialControlsRowExportToExcel(setting);
        self.InitialControlsFacetWarning(clientSettings);
        self.InitialControlsFieldChooser(clientSettings);
        self.InitialControlsTechnicalInfo(setting);
        self.InitialControlsNumberGeneral(clientSettings);
        self.InitialControlsNumber();
        self.InitialControlsCurrency();
        self.InitialControlsPercentages();
        self.InitialControlsDate();
        self.InitialControlsTime();
        self.InitialControlsEnum();
        self.InitialControlsExecuteLastSearch(setting);
        self.InitialControlsExecuteItem(setting);
    };
    self.InitialControlsModel = function () {
        var defaultModelValue = self.GetDefaulModel();
        var dropdownList = self.RenderFormatSettingDropdownlist('SystemModel', self.DataModels.data, defaultModelValue, 'short_name', 'uri');
        dropdownList.enable(self.DataModels.options.enabled);
        dropdownList.bind('change', self.SystemModelSelected);
        dropdownList.trigger('change');
        return dropdownList;
    };
    self.GetDefaulModel = function () {
        var defaultModelValue = null;
        if (self.DataModels.options.enabled) {
            var defaultModel = modelsHandler.GetDefaultModel();
            if (defaultModel && defaultModel.uri) {
                defaultModelValue = defaultModel.uri;
            }
            else {
                defaultModelValue = self.DataModels.data[0].uri;
            }
        }
        return defaultModelValue;
    };
    self.InitialControlsBusinessProcess = function () {
        businessProcessesModel.UserSetting = new BusinessProcessesViewModel();
        businessProcessesModel.UserSetting.MultipleActive(true);
        businessProcessesModel.UserSetting.CanEmpty(false);
        businessProcessesModel.UserSetting.Mode(businessProcessesModel.UserSetting.MODE.COMPACT);
        businessProcessesModel.UserSetting.ApplyHandler('#UserSettingsBusinessProcesses');

        var currentActiveList = {};
        var currentBusinessProcesses = WC.Utility.ToArray(userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES));
        jQuery.each(businessProcessesModel.UserSetting.Data(), function (k, v) {
            if (jQuery.inArray(v.id, currentBusinessProcesses) !== -1) {
                currentActiveList[v.id] = true;
            }
            else {
                currentActiveList[v.id] = false;
            }
        });
        businessProcessesModel.UserSetting.CurrentActive(currentActiveList);
    };
    self.InitialControlsBusinessProcessStyle = function (setting) {
        WC.HtmlHelper.SetCheckBoxStatus('#CompressedBusinessBar', setting[enumHandlers.USERSETTINGS.COMPRESSED_BP_BAR]);
    };
    self.InitialControlsLanguage = function (setting) {
        var avaliableLanguages = systemLanguageHandler.GetEnableLanguages();
        var defaultLanguage = setting[enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES] ? setting[enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES] : 'en';
        self.RenderFormatSettingDropdownlist('LanguageSelect', avaliableLanguages, defaultLanguage, systemLanguageHandler.FieldLanguageLabel, systemLanguageHandler.FieldLanguageId);
    };
    self.InitialControlsRowExportToExcel = function (setting) {
        jQuery.each(userSettingModel.RowsExportToExcel(), function (index, value) {
            if (value.id !== '0') {
                var formatter = new Formatter({ thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
                value.name = WC.FormatHelper.GetFormattedValue(formatter, parseInt(value.id)) + ' ' + Localization.SystemSettingResults;
            }
        });
        var exportRow = IsNullOrEmpty(setting[enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES]) ? 0 : setting[enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES];
        self.RenderFormatSettingDropdownlist('ExcelRowSelect', userSettingModel.RowsExportToExcel, '' + exportRow);
    };
    self.InitialControlsFacetWarning = function (clientSettings) {
        WC.HtmlHelper.SetCheckBoxStatus('#ShowFacetAngleWarnings', !!clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SHOW_FACET_ANGLE_WARNINGS]);
    };
    self.InitialControlsFieldChooser = function (clientSettings) {
        WC.HtmlHelper.SetCheckBoxStatus('#DefaultStarredfields', !!clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DEFAULT_STARRED_FIELDS]);
        WC.HtmlHelper.SetCheckBoxStatus('#DefaultSuggestedfields', !!clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DEFAULT_SUGGESTED_FIELDS]);
    };
    self.InitialControlsTechnicalInfo = function (setting) {
        WC.HtmlHelper.SetCheckBoxStatus('#SapFieldsInChooser', setting[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_CHOOSER]);
        WC.HtmlHelper.SetCheckBoxStatus('#SapFieldsInHeader', setting[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_HEADER]);

    };
    self.InitialControlsNumberGeneral = function (clientSettings) {
        self.RenderFormatSettingDropdownlist('GeneralDecimalSeperatorDropdown', enumHandlers.DECIMALSEPERATOR, clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.GENERAL_DECIMAL_SEPERATOR] || enumHandlers.GENERAL_DEFAULT_SEPARATOR.DECIMAL);
        self.RenderFormatSettingDropdownlist('GeneralThousandSeperatorDropdown', enumHandlers.GENERALTHOUSANDSEPERATOR, clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.GENERAL_THOUSAND_SEPERATOR] || enumHandlers.GENERAL_DEFAULT_SEPARATOR.SEPARATOR);

    };
    self.InitialControlsNumber = function () {
        var userSettingNumberFormat = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.NUMBER);
        self.RenderFormatSettingDropdownlist('NumbersSelect', enumHandlers.LISTFORMATDECIMALS, userSettingNumberFormat.decimals);
        self.RenderFormatSettingDropdownlist('NumberFormatDisplayUnitSelect', enumHandlers.DISPLAYUNITS, userSettingNumberFormat.prefix);
        WC.HtmlHelper.SetCheckBoxStatus('#enable_thousandseparator_for_number', userSettingNumberFormat.thousandseparator);
    };
    self.InitialControlsCurrency = function () {
        var userSettingCurrencyFormat = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.CURRENCY);
        self.RenderFormatSettingDropdownlist('CurrencyUnitSelect', enumHandlers.LISTFORMATDECIMALS, userSettingCurrencyFormat.decimals);
        self.RenderFormatSettingDropdownlist('CurrencyFormatDisplayUnitSelect', enumHandlers.DISPLAYUNITS, userSettingCurrencyFormat.prefix);
        WC.HtmlHelper.SetCheckBoxStatus('#enable_thousandseparator_for_currency', userSettingCurrencyFormat.thousandseparator);

        var currencies = ko.toJS(systemCurrencyHandler.GetCurrencies());
        jQuery.each(currencies, function (key, value) {
            value.name = value.id + ' (' + value.name.toLowerCase() + ')';
        });
        var ddlCurrency = self.RenderFormatSettingDropdownlist('DefaultCurrencySelect', currencies, userSettingCurrencyFormat.format, systemCurrencyHandler.FieldCurrencyLabel, systemCurrencyHandler.FieldCurrencyId);
        if (!ddlCurrency.value()) {
            popup.Alert(Localization.Warning_Title, Localization.Info_UserCurrencyUnavailable);
            userSettingsView.UserFieldSettingTabClick(self.TAB.FORMATSETTING);
        }
    };
    self.InitialControlsPercentages = function () {
        var userSettingPercentagesFormat = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.PERCENTAGE);
        self.RenderFormatSettingDropdownlist('PercentagesSelect', enumHandlers.LISTFORMATDECIMALS, userSettingPercentagesFormat.decimals);
        self.RenderFormatSettingDropdownlist('PercentagesFormatDisplayUnitSelect', enumHandlers.DISPLAYUNITS, userSettingPercentagesFormat.prefix);
        WC.HtmlHelper.SetCheckBoxStatus('#enable_thousandseparator_for_percentage', userSettingPercentagesFormat.thousandseparator);
    };
    self.InitialControlsDate = function () {
        var existingDateFormat = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.DATE);
        self.RenderFormatSettingDropdownlist('DateFormatOrderDropdown', enumHandlers.DATEORDER, existingDateFormat.order);
        self.RenderFormatSettingDropdownlist('DateFormatDayDropdown', self.DATEDAYFORMAT, existingDateFormat.day);
        self.RenderFormatSettingDropdownlist('DateFormatMonthDropdown', self.DATEMONTHFORMAT, existingDateFormat.month);
        self.RenderFormatSettingDropdownlist('DateFormatYearDropdown', self.DATEYEARFORMAT, existingDateFormat.year);
        self.RenderFormatSettingDropdownlist('DateFormatSeparatorDropdown', enumHandlers.DATESEPERATOR, existingDateFormat.datedelimiter);
    };
    self.InitialControlsTime = function () {
        var existingTimeFormat = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.TIME);
        self.RenderFormatSettingDropdownlist('TimeFormatSeparatorDropdown', enumHandlers.TIMESEPERATOR, existingTimeFormat.timedelimiter);
        self.RenderFormatSettingDropdownlist('TimeFormatHoursDropdown', enumHandlers.TIMEHOURSFORMAT, self.GetHoursFromFieldFormat(existingTimeFormat.hour));

        var secondSetting = self.GetSecondsFromSetting(existingTimeFormat.second);
        self.RenderTimeFormatSettingDropdownlist('TimeFormatSecondsDropdown', enumHandlers.TIMESECONDSFORMATLIST, secondSetting);
    };
    self.InitialControlsEnum = function () {
        var userSettingEnum = WC.FormatHelper.GetUserDefaultFormatSettings(enumHandlers.FIELDTYPE.ENUM);
        self.RenderFormatSettingDropdownlist('EnumSelect', userSettingModel.Enums, userSettingEnum.format);
    };
    self.InitialControlsExecuteLastSearch = function (setting) {
        WC.HtmlHelper.SetCheckBoxStatus('#autoExecuteLastSearch', setting[enumHandlers.USERSETTINGS.AUTO_EXECUTE_LAST_SEARCH]);
    };
    self.InitialControlsExecuteItem = function (setting) {
        WC.HtmlHelper.SetCheckBoxStatus('#autoExecuteItemsOnLogin', setting[enumHandlers.USERSETTINGS.AUTO_EXECUTE_ITEMS_ON_LOGIN]);
    };
    self.RenderFormatSettingDropdownlist = function (elementId, models, userSettingDefault, dataTextField, dataValueField, InitialOptionLabel) {
        var dropdownTextField = dataTextField ? dataTextField : 'name';
        var dropdownValueField = dataValueField ? dataValueField : 'id';

        var defaultIndex = 0;
        var datas = ko.toJS(models);

        jQuery.each(datas, function (index, data) {
            if (data && data[dropdownValueField] === userSettingDefault) {
                defaultIndex = index;
            };
        });

        var kendoDropDownOption = {
            dataTextField: dropdownTextField,
            dataValueField: dropdownValueField,
            index: defaultIndex,
            change: function (e) {
                var currentDropdown = e.sender.wrapper.context.id;
                self.ChangeDropdownFormat(currentDropdown);
            }
        };

        if (!IsNullOrEmpty(InitialOptionLabel)) {
            kendoDropDownOption.optionLabel = Localization.InitialDropdownLabel;
        }

        var ddl = WC.HtmlHelper.DropdownList('#' + elementId, datas, kendoDropDownOption);
        ddl.setDataSource(datas);
        return ddl;
    };
    self.RenderTimeFormatSettingDropdownlist = function (elementId, models, userSettingDefault, dataTextField, dataValueField, InitialOptionLabel) {
        self.RenderFormatSettingDropdownlist(elementId, models, userSettingDefault, dataTextField, dataValueField, InitialOptionLabel);
        self.SetDefaultItemDropdownList(elementId, userSettingDefault);
    };
    self.SetDefaultItemDropdownList = function (elementId, selectedId) {
        var dropdownlist = WC.HtmlHelper.DropdownList('#' + elementId);
        if (dropdownlist) {
            dropdownlist.value(selectedId);
        }
        return dropdownlist;
    };
    self.GetShowElementIdWhenTabClick = function (elementId) {
        var result = null;
        switch (elementId) {
            case 'UserDetailSetting':
                result = 'UserDetailSettingArea';
                break;
            case 'SystemSetting':
                result = 'SystemSettingArea';
                break;
            case 'FormatSetting':
                result = 'FormatSettingArea';
                break;
            case 'ActionSetting':
                result = 'ActionSettingArea';
                break;
            default:
                break;
        }
        return result;
    };
    self.SaveUserSettings = function () {
        // check separator not the same
        var generalDecimalSeparator = WC.HtmlHelper.DropdownList('#GeneralDecimalSeperatorDropdown').value();
        var generalThousandSeparator = WC.HtmlHelper.DropdownList('#GeneralThousandSeperatorDropdown').value();
        if (generalDecimalSeparator === generalThousandSeparator) {
            popup.Alert(Localization.Warning_Title, Localization.Info_WarringCannotUseSameSymbolForSeparator);
            return;
        }

        var selectedCurrency = WC.HtmlHelper.DropdownList('#DefaultCurrencySelect').value();
        if (!selectedCurrency) {
            popup.Alert(Localization.Warning_Title, Localization.Info_UserCurrencyRequired);
            return;
        }

        requestHistoryModel.SaveLastExecute(self, self.SaveUserSettings, arguments);

        var defaultUserSetting = userSettingModel.Data();
        var userSettings = {};

        self.SetDefaultBusinessProcess(defaultUserSetting, userSettings);
        self.SetBusinessProcessBarStyle(defaultUserSetting, userSettings);
        self.SetLanguage(defaultUserSetting, userSettings);
        self.SetNumberExportExcel(defaultUserSetting, userSettings);
        self.SetTechnicalInfoSapFieldChooser(defaultUserSetting, userSettings);
        self.SetTechnicalInfoSapFieldHeader(defaultUserSetting, userSettings);
        self.SetEnumFormat(defaultUserSetting, userSettings);
        self.SetCurrencyType(defaultUserSetting, userSettings, selectedCurrency);
        self.SetNumberFormat(defaultUserSetting, userSettings);
        self.SetCurrencyFormat(defaultUserSetting, userSettings);
        self.SetPercentFormat(defaultUserSetting, userSettings);
        self.SetDateFormat(defaultUserSetting, userSettings);
        self.SetTimeFormat(defaultUserSetting, userSettings);
        self.SetAutoExecuteLastSearch(defaultUserSetting, userSettings);
        self.SetAutoExecuteAtLogin(defaultUserSetting, userSettings);
        self.SetAutoExecuteAtLogin(defaultUserSetting, userSettings);
        self.SetClientSetting(defaultUserSetting, userSettings, generalDecimalSeparator, generalThousandSeparator);

        if (userSettingModel.TempRemoveList().length) {
            userSettingModel.ReloadAfterChanged(true);
        }

        SetLoadingVisibility('.popupUserSetting .loading16x16', true);
        jQuery.when(userSettingModel.PutExecuteAtLogin(), userSettingModel.Save(userSettings))
            .done(function (xhrExecuteAtLogin, xhrUserSetting) {
                self.SaveUserSettingsCallback(xhrUserSetting);
            });
    };
    self.SetDefaultBusinessProcess = function (defaultUserSetting, userSettings) {
        var defaultBusinessProcess = businessProcessesModel.UserSetting.GetActive();
        if (defaultBusinessProcess.toString() !== defaultUserSetting[enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES].toString()) {
            userSettings[enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES] = defaultBusinessProcess;
        }
    };
    self.SetBusinessProcessBarStyle = function (defaultUserSetting, userSettings) {
        var compressBusinessprocessBar = WC.HtmlHelper.GetCheckBoxStatus('#CompressedBusinessBar');
        if (compressBusinessprocessBar !== defaultUserSetting[enumHandlers.USERSETTINGS.COMPRESSED_BP_BAR]) {
            userSettings[enumHandlers.USERSETTINGS.COMPRESSED_BP_BAR] = compressBusinessprocessBar;
        }
    };
    self.SetLanguage = function (defaultUserSetting, userSettings) {
        var selectedLanguage = WC.HtmlHelper.DropdownList('#LanguageSelect').value();
        if (selectedLanguage !== defaultUserSetting[enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES]) {
            userSettingModel.ReloadAfterChanged(true);
            userSettings[enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES] = selectedLanguage;
        }
    };
    self.SetNumberExportExcel = function (defaultUserSetting, userSettings) {
        var defaultExportLine = parseInt(WC.HtmlHelper.DropdownList('#ExcelRowSelect').value());
        if (defaultExportLine !== defaultUserSetting[enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES]) {
            userSettings[enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES] = defaultExportLine;
        }
    };
    self.SetTechnicalInfoSapFieldChooser = function (defaultUserSetting, userSettings) {
        var sapFieldInChooser = WC.HtmlHelper.GetCheckBoxStatus('#SapFieldsInChooser');
        if (sapFieldInChooser !== defaultUserSetting[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_CHOOSER]) {
            userSettings[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_CHOOSER] = sapFieldInChooser;
        }
    };
    self.SetTechnicalInfoSapFieldHeader = function (defaultUserSetting, userSettings) {
        var sapFieldInHeader = WC.HtmlHelper.GetCheckBoxStatus('#SapFieldsInHeader');
        if (sapFieldInHeader !== defaultUserSetting[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_HEADER]) {
            userSettings[enumHandlers.USERSETTINGS.SAP_FIELDS_IN_HEADER] = sapFieldInHeader;
        }
    };
    self.SetEnumFormat = function (defaultUserSetting, userSettings) {
        var selectedEnumSetting = WC.HtmlHelper.DropdownList('#EnumSelect').value();
        if (selectedEnumSetting !== defaultUserSetting[enumHandlers.USERSETTINGS.FORMAT_ENUM]) {
            userSettings[enumHandlers.USERSETTINGS.FORMAT_ENUM] = selectedEnumSetting;
        }
    };
    self.SetCurrencyType = function (defaultUserSetting, userSettings, selectedCurrency) {
        if (selectedCurrency !== defaultUserSetting[enumHandlers.USERSETTINGS.DEFAULT_CURRENCY]) {
            userSettings[enumHandlers.USERSETTINGS.DEFAULT_CURRENCY] = selectedCurrency;
            userSettingModel.ReloadAfterChanged(true);
        }
    };
    self.SetNumberFormat = function (defaultUserSetting, userSettings) {
        var existingNumberFormat = WC.Utility.ParseJSON(defaultUserSetting[enumHandlers.USERSETTINGS.FORMAT_NUMBERS]);
        var newNumberFormat = {};
        newNumberFormat[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS] = parseInt(WC.HtmlHelper.DropdownList('#NumbersSelect').value(), 10);
        newNumberFormat[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = WC.HtmlHelper.DropdownList('#NumberFormatDisplayUnitSelect').value();
        if (newNumberFormat[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] === enumHandlers.DISPLAYUNITSFORMAT.NONE) {
            newNumberFormat[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = null;
        }
        newNumberFormat[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE] = WC.HtmlHelper.GetCheckBoxStatus('#enable_thousandseparator_for_number');

        if (!jQuery.deepCompare(existingNumberFormat, newNumberFormat)) {
            userSettings[enumHandlers.USERSETTINGS.FORMAT_NUMBERS] = JSON.stringify(newNumberFormat);
        }
    };
    self.SetCurrencyFormat = function (defaultUserSetting, userSettings) {
        var existingCurrencyFormat = WC.Utility.ParseJSON(defaultUserSetting[enumHandlers.USERSETTINGS.FORMAT_CURRENCIES]);
        var newCurrencyFormat = {};
        newCurrencyFormat[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS] = parseInt(WC.HtmlHelper.DropdownList('#CurrencyUnitSelect').value(), 10);
        newCurrencyFormat[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = WC.HtmlHelper.DropdownList('#CurrencyFormatDisplayUnitSelect').value();
        if (newCurrencyFormat[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] === enumHandlers.DISPLAYUNITSFORMAT.NONE) {
            newCurrencyFormat[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = null;
        }
        newCurrencyFormat[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE] = WC.HtmlHelper.GetCheckBoxStatus('#enable_thousandseparator_for_currency');

        if (!jQuery.deepCompare(existingCurrencyFormat, newCurrencyFormat)) {
            userSettings[enumHandlers.USERSETTINGS.FORMAT_CURRENCIES] = JSON.stringify(newCurrencyFormat);
        }
    };
    self.SetPercentFormat = function (defaultUserSetting, userSettings) {
        var existingPercentagesFormat = WC.Utility.ParseJSON(defaultUserSetting[enumHandlers.USERSETTINGS.FORMAT_PERCENTAGES]);
        var newPercentagesFormat = {};
        newPercentagesFormat[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS] = parseInt(WC.HtmlHelper.DropdownList('#PercentagesSelect').value(), 10);
        newPercentagesFormat[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = WC.HtmlHelper.DropdownList('#PercentagesFormatDisplayUnitSelect').value();
        if (newPercentagesFormat[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] === enumHandlers.DISPLAYUNITSFORMAT.NONE) {
            newPercentagesFormat[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = null;
        }
        newPercentagesFormat[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE] = WC.HtmlHelper.GetCheckBoxStatus('#enable_thousandseparator_for_percentage');

        if (!jQuery.deepCompare(existingPercentagesFormat, newPercentagesFormat)) {
            userSettings[enumHandlers.USERSETTINGS.FORMAT_PERCENTAGES] = JSON.stringify(newPercentagesFormat);
        }
    };
    self.SetDateFormat = function (defaultUserSetting, userSettings) {
        var existingDateFormat = WC.Utility.ParseJSON(defaultUserSetting[enumHandlers.USERSETTINGS.FORMAT_DATE]);
        var newDateFormat = {};
        newDateFormat[enumHandlers.DATE_SETTINGS_FORMAT.ORDER_FORMAT] = WC.HtmlHelper.DropdownList('#DateFormatOrderDropdown').value();
        newDateFormat[enumHandlers.DATE_SETTINGS_FORMAT.DAY_FORMAT] = WC.HtmlHelper.DropdownList('#DateFormatDayDropdown').value();
        newDateFormat[enumHandlers.DATE_SETTINGS_FORMAT.MONTH_FORMAT] = WC.HtmlHelper.DropdownList('#DateFormatMonthDropdown').value();
        newDateFormat[enumHandlers.DATE_SETTINGS_FORMAT.YEAR_FORMAT] = WC.HtmlHelper.DropdownList('#DateFormatYearDropdown').value();
        newDateFormat[enumHandlers.DATE_SETTINGS_FORMAT.SEPARATOR] = WC.HtmlHelper.DropdownList('#DateFormatSeparatorDropdown').value();
        if (!jQuery.deepCompare(existingDateFormat, newDateFormat)) {
            userSettings[enumHandlers.USERSETTINGS.FORMAT_DATE] = JSON.stringify(newDateFormat);
            userSettingModel.ReloadAfterChanged(true);
        }
    };
    self.SetTimeFormat = function (defaultUserSetting, userSettings) {
        var existingTimeFormat = WC.Utility.ParseJSON(defaultUserSetting[enumHandlers.USERSETTINGS.FORMAT_TIME]);
        var newTimeFormat = {};
        newTimeFormat[enumHandlers.TIME_SETTINGS_FORMAT.HOUR_FORMAT] = self.GetHourFormat();
        newTimeFormat[enumHandlers.TIME_SETTINGS_FORMAT.SEPARATOR] = WC.HtmlHelper.DropdownList('#TimeFormatSeparatorDropdown').value();
        self.SetSecondFormat(newTimeFormat, self.GetSecondFormat());
        if (!jQuery.deepCompare(existingTimeFormat, newTimeFormat)) {
            userSettings[enumHandlers.USERSETTINGS.FORMAT_TIME] = JSON.stringify(newTimeFormat);
            userSettingModel.ReloadAfterChanged(true);
        }
    };
    self.SetAutoExecuteLastSearch = function (defaultUserSetting, userSettings) {
        var defaultExecuteLastSearchWhenLogon = WC.HtmlHelper.GetCheckBoxStatus('#autoExecuteLastSearch');
        if (defaultExecuteLastSearchWhenLogon !== defaultUserSetting[enumHandlers.USERSETTINGS.AUTO_EXECUTE_LAST_SEARCH]) {
            userSettings[enumHandlers.USERSETTINGS.AUTO_EXECUTE_LAST_SEARCH] = defaultExecuteLastSearchWhenLogon;
        }
    };
    self.SetAutoExecuteAtLogin = function (defaultUserSetting, userSettings) {
        var defaultExecuteAutoWhenLogon = WC.HtmlHelper.GetCheckBoxStatus('#autoExecuteItemsOnLogin');
        if (defaultExecuteAutoWhenLogon !== defaultUserSetting[enumHandlers.USERSETTINGS.AUTO_EXECUTE_ITEMS_ON_LOGIN]) {
            userSettings[enumHandlers.USERSETTINGS.AUTO_EXECUTE_ITEMS_ON_LOGIN] = defaultExecuteAutoWhenLogon;
        }
    };
    self.SetClientSetting = function (defaultUserSetting, userSettings, generalDecimalSeparator, generalThousandSeparator) {

        var isClientSettingChange = false;
        var clientSettings = WC.Utility.ParseJSON(defaultUserSetting[enumHandlers.USERSETTINGS.CLIENT_SETTINGS]);

        var showFacetAngleWarnings = WC.HtmlHelper.GetCheckBoxStatus('#ShowFacetAngleWarnings');
        if (showFacetAngleWarnings !== clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SHOW_FACET_ANGLE_WARNINGS]) {
            isClientSettingChange = true;
            clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SHOW_FACET_ANGLE_WARNINGS] = showFacetAngleWarnings;
        }

        var defaultStarredfields = WC.HtmlHelper.GetCheckBoxStatus('#DefaultStarredfields');
        if (defaultStarredfields !== clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DEFAULT_STARRED_FIELDS]) {
            isClientSettingChange = true;
            clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DEFAULT_STARRED_FIELDS] = defaultStarredfields;
        }

        var defaultSuggestedfields = WC.HtmlHelper.GetCheckBoxStatus('#DefaultSuggestedfields');
        if (defaultSuggestedfields !== clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DEFAULT_SUGGESTED_FIELDS]) {
            isClientSettingChange = true;
            clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.DEFAULT_SUGGESTED_FIELDS] = defaultSuggestedfields;
        }

        if (clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.GENERAL_DECIMAL_SEPERATOR] !== generalDecimalSeparator) {
            isClientSettingChange = true;
            clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.GENERAL_DECIMAL_SEPERATOR] = generalDecimalSeparator;
            userSettingModel.ReloadAfterChanged(true);
        }

        if (clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.GENERAL_THOUSAND_SEPERATOR] !== generalThousandSeparator) {
            isClientSettingChange = true;
            clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.GENERAL_THOUSAND_SEPERATOR] = generalThousandSeparator;
            userSettingModel.ReloadAfterChanged(true);
        }

        if (isClientSettingChange) {
            userSettings[enumHandlers.USERSETTINGS.CLIENT_SETTINGS] = JSON.stringify(clientSettings);
        }
    };
    self.SaveUserSettingsCallback = function (data) {
        if (userSettingModel.ReloadAfterChanged()) {
            // clear storage if reload except "tmp"
            self.ClearLocalStorageAfterChangeUserSetting();

            // reload page
            ReloadWebPage(window.webLanguage, data[enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES]);
            return;
        }

        userSettingsView.ClosePopup();
        SetLoadingVisibility('.popupUserSetting .loading16x16', false);
        if (typeof searchPageHandler !== 'undefined') {
            // search grid
            searchQueryModel.Search();
            searchQueryModel.SetUIOfAdvanceSearchFromParams();

            // set topbar business processes if exists
            self.SetTopBarBusinessProcess();
        }
        else if (typeof anglePageHandler !== 'undefined') {
            self.RenderSingleDrilldown();
            self.RenderDisplayView();
        }
        else if (typeof dashboardHandler !== 'undefined') {
            // update widgets
            dashboardHandler.ReApplyResult();
        }
    };
    self.ClearLocalStorageAfterChangeUserSetting = function () {
        // get all keys in storage
        var storageKeys = jQuery.localStorage.getAllKeys();

        // tell the browser, please don't remove storage that contain in this array 
        var whiteList = [
            userModel.DirectoryName,
            systemInformationHandler.Id,
            userSettingModel.DirectoryName,
            directoryHandler.Id,
            privilegesViewModel.DirectoryName,
            userModel.UserPrivilegeName,
            systemCurrencyHandler.Id,
            'create_angle_settings',
            'session_uri',
            'search_facet_cache',
            'search_facet_open_panels',
            'angle',
            'temp_angle',
            'temp_displays'
        ];

        // decide to remove storage for each key except keys in the white list
        jQuery.each(storageKeys, function (i, storageKey) {
            if ($.inArray(storageKey, whiteList) === -1) {
                jQuery.localStorage.removeItem(storageKey);
            }
        });

        // add flag for trigger all other tab to reload the whole page
        // (event handler will contain in Storage.js)
        jQuery.localStorage('user_settings_has_changed', true);
    };
    self.SetTopBarBusinessProcess = function () {
        if (typeof businessProcessesModel.Topbar !== 'undefined') {
            var bpMode = userSettingModel.GetByName(enumHandlers.USERSETTINGS.COMPRESSED_BP_BAR) ? businessProcessesModel.Topbar.MODE.COMPACT : businessProcessesModel.Topbar.MODE.FULL;
            businessProcessesModel.Topbar.Mode(bpMode);
            if ($.address.value() === '/') {
                var currentActiveList = {};
                var currentBusinessProcesses = WC.Utility.ToArray(userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES));
                jQuery.each(businessProcessesModel.Topbar.Data(), function (index, data) {
                    if (jQuery.inArray(data.id, currentBusinessProcesses) !== -1) {
                        currentActiveList[data.id] = true;
                    }
                    else {
                        currentActiveList[data.id] = false;
                    }
                });
                businessProcessesModel.Topbar.CurrentActive(currentActiveList);
            }
            businessProcessesModel.Topbar.UpdateLayout(jQuery('#SearchFacetBusinessProcesses .businessProcesses'));
        }
    };
    self.RenderDisplayView = function () {
        if (fieldsChooserModel.GridName !== enumHandlers.FIELDCHOOSERNAME.LISTDRILLDOWN && displayModel.Data()) {

            if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.LIST) {
                listHandler.GetListDisplay();
            }
            else if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.CHART) {
                chartHandler.GetChartDisplay();
            }
            else if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
                jQuery("#PivotArea").busyIndicator(true);
                pivotPageHandler.GetPivotDisplay();
            }

            angleInfoModel.UpdateAngleQuerySteps(angleInfoModel.Data());

            resultModel.SetResultExecution(resultModel.Data());
        }
    };
    self.RenderSingleDrilldown = function () {
        if (jQuery('#' + fieldsChooserModel.GridName).is(':visible')) {
            var gridFieldChooser = jQuery('#' + fieldsChooserModel.GridName).data(enumHandlers.KENDOUITYPE.GRID);
            if (gridFieldChooser) {

                if (fieldsChooserModel.GridName === enumHandlers.FIELDCHOOSERNAME.LISTDRILLDOWN) {
                    fieldsChooserModel.BindDataGrid = listDrilldownHandler.Render;
                }

                fieldsChooserModel.BindDataGrid();
            }
        }
    };
    self.SystemModelSelected = function (e) {
        if (userModel.GetAllowExportAuthorizationByModelUri(e.sender.value())) {
            jQuery('.ExportExcel').show();
        }
        else {
            jQuery('.ExportExcel').hide();
        }

        var modelUri = e.sender.value();
        userSettingModel.GenerateLabelAuthorisations(modelUri);
    };
    self.ChangeDropdownFormat = function (dropdown) {
        switch (dropdown) {
            case 'GeneralDecimalSeperatorDropdown':
            case 'GeneralThousandSeperatorDropdown':
                self.ChangeGeneralFormat();
                break;
            case 'NumbersSelect':
            case 'NumberFormatDisplayUnitSelect':
                self.ChangeNumberFormat();
                break;
            case 'DefaultCurrencySelect':
            case 'CurrencyFormatDisplayUnitSelect':
            case 'CurrencyUnitSelect':
                self.ChangeCurerncyFormat();
                break;
            case 'PercentagesFormatDisplayUnitSelect':
            case 'PercentagesSelect':
                self.ChangePercentagesFormat();
                break;
            case 'DateFormatOrderDropdown':
            case 'DateFormatDayDropdown':
            case 'DateFormatMonthDropdown':
            case 'DateFormatYearDropdown':
            case 'DateFormatSeparatorDropdown':
                self.ChangeDateFormat();
                break;
            case 'TimeFormatHoursDropdown':
            case 'TimeFormatSecondsDropdown':
            case 'TimeFormatSeparatorDropdown':
                self.ChangeTimeFormat();
                break;
            case 'EnumSelect':
                self.ChangeSetFormat();
                break;
            default:
                break;

        };
    };
    self.InitialExampleFormat = function () {
        self.ChangeGeneralFormat();
        self.ChangeNumberFormat();
        self.ChangeCurerncyFormat();
        self.ChangePercentagesFormat();
        self.ChangeDateFormat();
        self.ChangeTimeFormat();
        self.ChangeSetFormat();
        $('#generalExampleDescription').html(Localization.FormatSettingGeneralDescription);
        $('#numberExampleDescription').html(Localization.FormatSettingGeneralNumber);
        $('#currencyExampleDescription').html(Localization.FormatSettingGeneralCurrency);
        $('#percentagesExampleDescription').html(Localization.FormatSettingGeneralPercentages);
        $('#dateExampleDescription').html(Localization.FormatSettingGeneralDate);
        $('#timeExampleDescription').html(Localization.FormatSettingGeneralTime);
        $('#setExampleDescription').html(Localization.FormatSettingGeneralSet);
    };
    self.GetCustomCulture = function () {
        var generalDecimalSeparator = WC.HtmlHelper.DropdownList('#GeneralDecimalSeperatorDropdown').value();
        var generalThousandSeparator = WC.HtmlHelper.DropdownList('#GeneralThousandSeperatorDropdown').value();
        var customCulture = $.extend({}, ko.toJS(kendo.culture()));
        customCulture.numberFormat[','] = generalThousandSeparator;
        customCulture.numberFormat['.'] = generalDecimalSeparator;
        return customCulture;
    };
    self.ChangeGeneralFormat = function () {
        var value = 1234567890.00;
        var customCulture = self.GetCustomCulture();
        var format = new Formatter({ thousandseparator: true, decimals: 2 }, enumHandlers.FIELDTYPE.NUMBER);
        var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);
        $('.exampleGeneralNumber').text(newValue);

        self.ChangeNumberFormat();
        self.ChangeCurerncyFormat();
        self.ChangePercentagesFormat();
    };
    self.ChangeNumberFormat = function () {
        var value = 1234567890.00;
        var customCulture = self.GetCustomCulture();
        var decimalNumber = WC.HtmlHelper.DropdownList('#NumbersSelect').value();
        var displayUnit = WC.HtmlHelper.DropdownList('#NumberFormatDisplayUnitSelect').value();
        var showThousandSeperator = WC.HtmlHelper.GetCheckBoxStatus('#enable_thousandseparator_for_number');

        var formatOptions = {};
        formatOptions.thousandseparator = showThousandSeperator;
        formatOptions.decimals = parseInt(decimalNumber);
        formatOptions.prefix = displayUnit;

        var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.NUMBER);
        var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);
        $('.exampleNumber').text(newValue);
    };
    self.ChangeCurerncyFormat = function () {
        var value = 1234567890.00;
        var customCulture = self.GetCustomCulture();
        var currencyFormat = WC.HtmlHelper.DropdownList('#DefaultCurrencySelect').value();
        var displayUnit = WC.HtmlHelper.DropdownList('#CurrencyFormatDisplayUnitSelect').value();
        var decimalNumber = WC.HtmlHelper.DropdownList('#CurrencyUnitSelect').value();
        var showThousandSeperator = WC.HtmlHelper.GetCheckBoxStatus('#enable_thousandseparator_for_currency');

        var formatOptions = {};
        formatOptions.thousandseparator = showThousandSeperator;
        formatOptions.decimals = parseInt(decimalNumber);
        formatOptions.prefix = displayUnit;

        var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.CURRENCY);
        format.format = currencyFormat;
        var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);
        $('.exampleCurrency').text(newValue);
    };
    self.ChangePercentagesFormat = function () {
        var value = 1234567890.00;
        var customCulture = self.GetCustomCulture();
        var decimalNumber = WC.HtmlHelper.DropdownList('#PercentagesSelect').value();
        var displayUnit = WC.HtmlHelper.DropdownList('#PercentagesFormatDisplayUnitSelect').value();
        var showThousandSeperator = WC.HtmlHelper.GetCheckBoxStatus('#enable_thousandseparator_for_percentage');

        var formatOptions = {};
        formatOptions.thousandseparator = showThousandSeperator;
        formatOptions.decimals = parseInt(decimalNumber);
        formatOptions.prefix = displayUnit;

        var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.PERCENTAGE);
        var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);
        $('.examplePercentages').text(newValue);
    };
    self.ChangeDateFormat = function () {
        var value = new Date();
        var customCulture = self.GetCustomCulture();
        var order = WC.HtmlHelper.DropdownList('#DateFormatOrderDropdown').value();
        var day = WC.HtmlHelper.DropdownList('#DateFormatDayDropdown').value();
        var month = WC.HtmlHelper.DropdownList('#DateFormatMonthDropdown').value();
        var year = WC.HtmlHelper.DropdownList('#DateFormatYearDropdown').value();
        var separator = WC.HtmlHelper.DropdownList('#DateFormatSeparatorDropdown').value();

        var formatOptions = {};
        formatOptions.order = order;
        formatOptions.day = day;
        formatOptions.month = month;
        formatOptions.year = year;
        formatOptions.datedelimiter = separator;

        var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.DATE);
        var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);
        $('.exampleDate').text(newValue);
    };
    self.ChangeTimeFormat = function () {
        var value = new Date();
        var customCulture = self.GetCustomCulture();
        var hour = self.GetHourFormat();
        var second = self.GetSecondFormat();
        var separator = WC.HtmlHelper.DropdownList('#TimeFormatSeparatorDropdown').value();

        var formatOptions = {};
        formatOptions.hour = hour;
        formatOptions.second = second;
        formatOptions.timedelimiter = separator;

        var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.TIME);
        var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);
        $('.exampleTime').text(newValue);
    };
    self.ChangeSetFormat = function () {
        var value = {
            short_name: '1000',
            long_name: 'IDES AG',
            id: 'id'
        };
        var set = WC.HtmlHelper.DropdownList('#EnumSelect').value();
        var customCulture = self.GetCustomCulture();
        var formatOptions = {};
        formatOptions.format = set;

        var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.ENUM);
        var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);
        $('.exampleSet').text(newValue);
    };
    self.GetHourFormat = function () {
        var hours = WC.HtmlHelper.DropdownList('#TimeFormatHoursDropdown').value();
        if (hours === enumHandlers.TIME_TEMPLATE.H)
            return enumHandlers.TIME_TEMPLATE.HMM;
        else
            return enumHandlers.TIME_TEMPLATE.HHMM;
    };
    self.GetSecondFormat = function () {
        return WC.HtmlHelper.DropdownList('#TimeFormatSecondsDropdown').value();
    };
    self.GetHoursFromFieldFormat = function (format) {
        if (format && format.substring(0, 1) === enumHandlers.TIME_TEMPLATE.H)
            return enumHandlers.TIME_TEMPLATE.H;
        else
            return enumHandlers.TIME_TEMPLATE.HH;
    };
    self.GetSecondsFromSetting = function (second) {
        if (!second)
            return enumHandlers.TIME_TEMPLATE.NONE;
        else
            return enumHandlers.TIME_TEMPLATE.SS;
    };
    self.GetSecondDropdownValue = function (second) {
        if (typeof second === 'string')
            return second;
        else
            return enumHandlers.FIELDSETTING.USEDEFAULT;
    };
    self.SetSecondFormat = function (details, second) {
        if (typeof second === 'string' && second !== enumHandlers.FIELDSETTING.USEDEFAULT) {
            details[enumHandlers.FIELDDETAILPROPERTIES.SECOND] = second;
        }
        else {
            delete details[enumHandlers.FIELDDETAILPROPERTIES.SECOND];
        }
    };

    self.GetPrefixDropdownValue = function (prefix) {
        if (typeof prefix === 'string')
            return prefix;
        else if (prefix === null)
            return enumHandlers.DISPLAYUNITSFORMAT.NONE;
        else
            return enumHandlers.FIELDSETTING.USEDEFAULT;
    };

    self.GetDecimalDropdownValue = function (decimal) {
        if (typeof decimal === 'number')
            return decimal;
        else
            return enumHandlers.FIELDSETTING.USEDEFAULT;
    };

    self.GetEnumDropdownValue = function (format) {
        if (format)
            return format;
        else
            return enumHandlers.FIELDSETTING.USEDEFAULT;
    };
}
