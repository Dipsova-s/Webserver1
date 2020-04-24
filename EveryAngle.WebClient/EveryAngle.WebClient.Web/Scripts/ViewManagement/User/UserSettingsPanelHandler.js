
function UserSettingsPanelStateManager() {
    "use strict";

    var self = this;
    var _settings = {};

    self.RestoreSettings = function () {
        self.LoadSettings();

        if (_settings.tab) {
            var tabIndex = _settings.tab['index'];
            jQuery('#SettingsPanel').data('Tab').active(tabIndex);
        }

        if (_settings.accordions) {
            for (var accordion in _settings.accordions) {
                var classRemoved = 'open', classAdded = 'close';
                if (_settings.accordions[accordion]) {
                    classRemoved = 'close';
                    classAdded = 'open';
                }
                jQuery('#' + accordion).removeClass(classRemoved).addClass(classAdded);
            }
        }
    };
    self.ChangeTab = function (index) {
        _settings.tab = {};
        _settings.tab['index'] = index;
        self.SaveSettings();
    };
    self.ChangeAccordion = function (accordionId, isOpened) {
        if (!_settings.accordions) {
            _settings.accordions = {};
        }
        _settings.accordions[accordionId] = isOpened;
        self.SaveSettings();
    };

    self.SaveSettings = function () {
        jQuery.localStorage(UserSettingsPanelStateManager.StorageKey, _settings);
    };
    self.LoadSettings = function () {
        var settings = jQuery.localStorage(UserSettingsPanelStateManager.StorageKey);
        if (settings) {
            _settings = settings;
        }
    };
}
UserSettingsPanelStateManager.StorageKey = 'usersettings_panel';

function UserSettingsPanelViewManager() {
    "use strict";

    var self = this;
    var _htmlLabelCategories = [
        '<div class="settingsPanelLabelAuthorisations" data-bind="foreach: labelAuthorisations">',
        '<!-- ko if: $data.LabelCategories().length > 0 -->',
        '<div class="card settingsPanelLabelCategories">',
        '<div class="card-header" data-bind="text: $data.StatusName"></div>',
        '<div class="card-body settingsPanelValidateLabelsWrapper" data-bind="foreach: $data.LabelCategories">',
        '<div class="settingsPanelValidateLabels">',
        '<h4 data-bind="text: $data.CategoryName() ? $data.CategoryName : $data.CategoryId"></h4>',
        '<div class="settingsPanelLabelWrapper" data-bind="foreach: $data.Labels">',
        '<label class="settingsPanelLabel" data-bind="text: $data.LabelName() ? $data.LabelName : $data.LabelId"></label>',
        '</div>',
        ' </div>',
        '</div>',
        '</div>',
        '<!-- /ko -->',
        '</div>'
    ].join('');
    var _htmlExecuteItems = [
        '<div class="settingsPanelActionsAtLoginDisplays" data-bind="foreach: $root.AutoExecuteList">',
        '<div class="settingsPanelActionsAtLoginDisplaysItem">',
        '<a target="_blank" data-bind="attr: { href: $data.link }">',
        '<i class="icon display" data-bind="css: \'icon-\' + $data.display.display_type"></i>',
        '<div class="settingsPanelActionsAtLoginDisplayText">',
        '<span class="darkText" data-bind="text: $data.model + \' \' + $data.name">Avg. Duration</span>',
        '<span class="greyText" data-bind="text: $data.display.name"></span>',
        '</div>',
        '</a>',
        '<i class="icon delete-red" data-bind="click: $root.RemoveAutoExecuteList, clickBubble: false"></i>',
        '</div>',
        '</div>'
    ].join('');

    self.RenderLabelCategories = function () {
        var labelAuthorisations = jQuery('.settingsPanelLabelAuthorisationsWrapper');
        labelAuthorisations.empty().append(_htmlLabelCategories);
        ko.cleanNode(labelAuthorisations.get(0));
        ko.applyBindings({ labelAuthorisations: userSettingModel.LabelAuthorisations }, labelAuthorisations.get(0));
    };

    self.RenderExecutionItems = function () {
        var executeItemsElement = jQuery('.settingsPanelActionsAtLoginDisplaysWrapper');
        executeItemsElement.empty().append(_htmlExecuteItems);
        ko.cleanNode(executeItemsElement.get(0));
        ko.applyBindings(userSettingModel, executeItemsElement.get(0));
    };
}

function UserSettingsPanelHandler(stateManager, viewManager) {
    "use strict";

    var self = this;
    var _stateManager = stateManager;
    var _viewManager = viewManager;

    self.DataModels = {
        data: [],
        options: {
            enabled: true
        }
    };

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

    var fncheckLoadData;
    self.Init = function () {
        if (jQuery('.settingsPanelSaveButton').hasClass('btn-busy'))
            return;

        WC.HtmlHelper.Tab('#SettingsPanel', {
            change: self.TabChanged
        });

        jQuery(document).off('click.usersettings').on('click.usersettings', function (e) {
            var target = jQuery(e.target);
            var isHandle = target.attr('id') === 'Settings' || target.closest('#Settings').length;
            var isPopup = target.closest('.popupNotification').length || target.closest('.k-list-container').length || target.is('.k-overlay');
            if (!isHandle
                && !target.closest('#SettingsPanel').length
                && !isPopup) {
                self.HidePanel();
            }
        });
        self.CheckDownloadSAP();
        self.TogglePanel();

        clearTimeout(fncheckLoadData);
        if (!jQuery('#SettingsPanel').hasClass('hide')) {
            _stateManager.RestoreSettings();
            fncheckLoadData = setTimeout(function () {
                self.LoadData();
            }, 300);
        }
    };
    self.TogglePanel = function () {
        jQuery('#SettingsPanel').toggleClass('hide');
    };
    self.HidePanel = function () {
        jQuery('#SettingsPanel').addClass('hide');
    };
    self.TabChanged = function (index) {
        _stateManager.ChangeTab(index);
    };
    self.AccordionChanged = function (element) {
        var accordionId = jQuery(element).attr('id');
        var isOpened = jQuery(element).hasClass('close');
        _stateManager.ChangeAccordion(accordionId, isOpened);
    };

    self.CheckUserCurrency = function () {
        if (self.IsInvalidUserCurrency()) {
            errorHandlerModel.Enable(false);
            var interval = setInterval(function () {
                if (!jQuery.active) {
                    clearInterval(interval);
                    errorHandlerModel.Enable(true);
                    self.Init();
                }
            }, 1000);
        }
    };

    self.LoadData = function () {
        jQuery('#SettingsPanel').busyIndicator(true);

        jQuery.when(
            systemInformationHandler.LoadSystemInformation(),
            systemCurrencyHandler.LoadCurrencies(),
            systemLanguageHandler.LoadLanguages(),
            businessProcessesModel.General.Load(),
            modelsHandler.LoadModels(),
            userSettingModel.LoadAutoExecuteList()
        )
            .then(function () {
                self.SetDataModel();
                return self.SetLabel();
            })
            .always(function () {
                self.UpdateSampleDateSettings();
                self.InitialControls();
                self.InitialExampleFormat();

                jQuery('#SettingsPanel').busyIndicator(false);
            });

    };
    self.SetDataModel = function () {
        var models = ko.toJS(modelsHandler.GetData());
        if (models.length) {
            self.DataModels.options.enabled = true;
            self.DataModels.data = models;
        }
        else {
            self.DataModels.data = [{
                id: '',
                short_name: Localization.NoModelAvaliable
            }];
            self.DataModels.options.enabled = false;
        }
    };
    self.SetLabel = function () {
        var labelCategoryUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.LABELCATEGORIES);
        var labelUri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.LABELS);

        var deferred = [];
        deferred.pushDeferred(modelLabelCategoryHandler.LoadAllLabelCategories, [labelCategoryUri]);
        deferred.pushDeferred(modelLabelCategoryHandler.LoadAllLabels, [labelUri]);
        return jQuery.whenAll(deferred);
    };

    self.InitialControls = function () {
        var setting = userSettingModel.Data();
        var clientSettings = WC.Utility.ParseJSON(setting[enumHandlers.USERSETTINGS.CLIENT_SETTINGS]);

        // User tab
        self.InitialControlUser();
        self.InitialControlsModel();
        self.InitialControlsLabelCategories();
        self.InitialControlsExecuteLastSearch(setting);
        self.InitialControlsExecuteItem(setting);

        // System tab
        self.InitialControlsBusinessProcess();
        self.InitialControlsLanguage(setting);
        self.InitialControlsRowExportToExcel(setting);
        self.InitialControlsFacetWarning(clientSettings);
        self.InitialControlsFieldChooser(clientSettings);
        self.InitialControlsTechnicalInfo(setting);
        self.InitialControlsGotoSap(clientSettings);

        // Fields tab
        self.InitialControlsNumberGeneral(clientSettings);
        self.InitialControlsNumber();
        self.InitialControlsCurrency();
        self.InitialControlsPercentages();
        self.InitialControlsDate();
        self.InitialControlsTime();
        self.InitialControlsEnum();
    };

    self.InitialControlUser = function () {
        var model = userModel.Data();
        var roleIds = model.assigned_roles.map(function (r) {
            return r.role_id;
        }).join(', ');

        jQuery('.settingsPanelProfileName strong').text(model.full_name);
        jQuery('.settingsPanelProfileName span').text(model.id);
        jQuery('.settingsPanelRoles .roles').text(roleIds);
    };
    self.InitialControlsModel = function () {
        var defaultModelValue = self.GetDefaulModel();
        var dropdownList = self.RenderFormatSettingDropdownlist('SystemModel', self.DataModels.data, defaultModelValue, 'short_name', 'uri');
        if (!dropdownList) {
            return null;
        }

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
    self.InitialControlsLabelCategories = function () {
        _viewManager.RenderLabelCategories();
    };
    self.InitialControlsExecuteLastSearch = function (setting) {
        WC.HtmlHelper.SetCheckBoxStatus('#autoExecuteLastSearch', setting[enumHandlers.USERSETTINGS.AUTO_EXECUTE_LAST_SEARCH]);
    };
    self.InitialControlsExecuteItem = function (setting) {
        WC.HtmlHelper.SetCheckBoxStatus('#autoExecuteItemsOnLogin', setting[enumHandlers.USERSETTINGS.AUTO_EXECUTE_ITEMS_ON_LOGIN]);
        _viewManager.RenderExecutionItems();
        var executeItemListView = userSettingModel.AutoExecuteList();
        jQuery('.settingsPanelNoExecuteAtLogin').text(executeItemListView.length ? '' : Captions.Label_No_Information_About_AutoExecute);
    };

    self.InitialControlsBusinessProcess = function () {
        businessProcessesModel.UserSetting = new BusinessProcessesViewModel();
        businessProcessesModel.UserSetting.MultipleActive(true);
        businessProcessesModel.UserSetting.CanEmpty(false);
        businessProcessesModel.UserSetting.Mode(businessProcessesModel.UserSetting.MODE.COMPACT);
        businessProcessesModel.UserSetting.SetCheckBoxStyle();
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

    self.InitialControlsGotoSap = function (setting) {
        if (window.enableGoToSAP) {
            jQuery('#sapusertextbox').val(setting[enumHandlers.CLIENT_SETTINGS_PROPERTY.SAP_LOGON_USER]);
            //use english as default
            var defaultlang = setting[enumHandlers.CLIENT_SETTINGS_PROPERTY.SAP_LOGON_LANGUAGE] ? setting[enumHandlers.CLIENT_SETTINGS_PROPERTY.SAP_LOGON_LANGUAGE] : 'en';
            self.RenderFormatSettingDropdownlist('sapLanguageDropdown', enumHandlers.LANGUAGES, defaultlang, 'name', 'code');
        }
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
        if (ddlCurrency && !ddlCurrency.value()) {
            popup.Alert(Localization.Warning_Title, Localization.Info_UserCurrencyUnavailable);
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

    self.RenderFormatSettingDropdownlist = function (elementId, models, userSettingDefault, dataTextField, dataValueField, InitialOptionLabel) {
        var dropdownTextField = dataTextField ? dataTextField : 'name';
        var dropdownValueField = dataValueField ? dataValueField : 'id';

        var defaultIndex = 0;
        var datas = ko.toJS(models);
        if (datas) {
            jQuery.each(datas, function (index, data) {
                if (data && data[dropdownValueField] === userSettingDefault) {
                    defaultIndex = index;
                }
            });
        }

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
        if (!ddl) {
            return null;
        }

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

        if (self.IsInvalidUserCurrency()) {
            jQuery('#settingsPanelFieldsTab + label').trigger('click');
            popup.Alert(Localization.Warning_Title, Localization.Info_UserCurrencyUnavailable);
            return;
        }

        var defaultUserSetting = userSettingModel.Data();
        var userSettings = {};

        self.SetDefaultBusinessProcess(defaultUserSetting, userSettings);
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

        self.ShowUserSettingsProgressbar();
        jQuery.when(userSettingModel.PutExecuteAtLogin(), userSettingModel.Save(userSettings))
            .done(function (xhrExecuteAtLogin, xhrUserSetting) {
                self.SaveUserSettingsCallback(xhrUserSetting);
            })
            .always(function () {
                self.HideUserSettingsProgressbar();
            });
    };
    self.ShowUserSettingsProgressbar = function () {
        jQuery('.settingsPanelSaveButton').addClass('btn-busy');
        jQuery('#SettingsPanel').busyIndicator(true);
        jQuery('#SettingsPanel .k-loading-mask').addClass('k-loading-none');
    };
    self.HideUserSettingsProgressbar = function () {
        jQuery('.settingsPanelSaveButton').removeClass('btn-busy');
        jQuery('#SettingsPanel').busyIndicator(false);
    };
    self.SetDefaultBusinessProcess = function (defaultUserSetting, userSettings) {
        var defaultBusinessProcess = businessProcessesModel.UserSetting.GetActive();
        if (defaultBusinessProcess.toString() !== defaultUserSetting[enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES].toString()) {
            userSettings[enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES] = defaultBusinessProcess;
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

        if (window.enableGoToSAP) {
            var sapuser = jQuery.trim(jQuery('#sapusertextbox').val() || '');
            if (clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SAP_LOGON_USER] !== sapuser) {
                isClientSettingChange = true;
                clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SAP_LOGON_USER] = sapuser;
            }

            var saplanguage = WC.HtmlHelper.DropdownList('#sapLanguageDropdown').value();
            if (clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SAP_LOGON_LANGUAGE] !== saplanguage) {
                isClientSettingChange = true;
                clientSettings[enumHandlers.CLIENT_SETTINGS_PROPERTY.SAP_LOGON_LANGUAGE] = saplanguage;
            }
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

        self.HidePanel();

        if (typeof searchPageHandler !== 'undefined') {
            // search grid
            searchQueryModel.Search();
            searchQueryModel.SetUIOfAdvanceSearchFromParams();
        }
        else if (typeof anglePageHandler !== 'undefined') {
            anglePageHandler.ExecuteAngle();
        }
        else if (typeof dashboardPageHandler !== 'undefined') {
            // update widgets
            dashboardPageHandler.ReApplyResult();
        }

        toast.MakeSuccessText(Localization.Toast_SaveSettings);
    };
    self.ClearLocalStorageAfterChangeUserSetting = function () {
        // get all keys in storage
        var storageKeys = jQuery.localStorage.getAllKeys();

        // tell the browser to innore removing storage that contain in this array
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
            'temp_displays',
            UserSettingsPanelStateManager.StorageKey
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

    self.IsInvalidUserCurrency = function () {
        var userCurrency = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_CURRENCY);
        var currencyData = systemCurrencyHandler.GetCurrencyById(userCurrency);
        return !(currencyData && currencyData.enabled);
    };
    self.SystemModelSelected = function (e) {
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
        }
    };
    self.InitialExampleFormat = function () {
        self.ChangeGeneralFormat();
        self.ChangeNumberFormat();
        self.ChangeCurerncyFormat();
        self.ChangePercentagesFormat();
        self.ChangeDateFormat();
        self.ChangeTimeFormat();
        self.ChangeSetFormat();
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

    self.CheckDownloadSAP = function () {
        if (!window.enableGoToSAP)
            jQuery('#GoToSapSection').remove();
    };
    self.DownloadSAPLauncher = function (url) {
        WC.Ajax.EnableBeforeExit = false;
        WC.Utility.DownloadFile(url);
    };
}

var userSettingsPanelHandler = new UserSettingsPanelHandler(
    new UserSettingsPanelStateManager(),
    new UserSettingsPanelViewManager()
);
