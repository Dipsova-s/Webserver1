var listFormatSettingHandler = new ListFormatSettingHandler();

function ListFormatSettingHandler() {
    "use strict";

    var self = this;

    //BOF: Properties
    self.FormatList = ko.observableArray([]);
    self.CurrentFormatSetting = {};
    self.ThousandSeparator = ko.observable();
    //EOF: Properties

    //BOF: Methods

    self.ShowCustomPopup = function (fieldId) {
        var fieldElementId = WC.Utility.ConvertFieldName(fieldId);
        if (jQuery('#PopupListFormatSetting').is(':visible'))
            return;

        var modelUri = angleInfoModel.Data().model;
        var field = modelFieldsHandler.GetFieldById(fieldId, modelUri);
        if (!field)
            return;

        requestHistoryModel.SaveLastExecute(self, self.ShowCustomPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;

        listSortHandler.CloseCustomPopup();

        self.FormatList.removeAll();
        self.FormatList.push.apply(self.FormatList, self.GenerateFormatList(field.fieldtype));

        var popupSettings = {
            title: Localization.ListFormatSettingTitle,
            element: '#PopupListFormatSetting',
            html: listFormatHtmlTemplate(field.fieldtype),
            pinned: false,
            appendTo: '#PopupHeader' + fieldElementId + ' > .k-window-content',
            className: 'listFormatSettingPopup',
            width: 380,
            minHeight: 100,
            buttons: [
                {
                    text: Localization.ListFormatSettingResetDefault,
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj)) {
                            self.ResetSetListFormatDisplay(field);
                            e.kendoWindow.close();
                        }
                    },
                    position: 'right'
                },
                {
                    text: Localization.Ok,
                    className: 'executing',
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj)) {
                            var formValues = e.kendoWindow.wrapper.find('form').serializeArray();
                            self.SetListFormatDisplay(formValues, field);
                            e.kendoWindow.close();
                        }
                    },
                    isPrimary: true,
                    position: 'right'
                }
            ],
            animation: false,
            modal: false,
            center: false,
            draggable: false,
            resizable: false,
            actions: ["Close"],
            open: function (e) {
                self.ShowCustomPopupCallback(e, field);
            },
            close: function (e) {
                WC.HtmlHelper.MenuNavigatable.prototype.UnlockMenu('.HeaderPopup');
                popup.Destroy(e);
            }
        };

        if (jQuery('.HeaderPopup:visible').hasClass('scrollable')) {
            popupSettings.appendTo = 'body';
            popupSettings.draggable = true;
            popupSettings.center = true;
            popupSettings.className += ' k-window-draggable';

            jQuery('#PopupHeader' + fieldElementId).hide();
        }
        else {
            popupSettings.className += ' inside';
        }

        popup.Show(popupSettings);
    };

    self.ShowCustomPopupCallback = function (e, field) {
        ko.applyBindings(self, jQuery(".listFormatSettingPopup").get(0));
        var fieldType = field.fieldtype;
        var fieldId = field.id;

        var displayField = displayModel.Data().fields.findObject('field', fieldId, false);

        var fakeField = ko.toJS(field);
        fakeField.user_specific.user_settings = displayField.field_details;
        var displayFormat = WC.FormatHelper.GetFieldFormatSettings(new FieldFormatter(fakeField, angleInfoModel.Data().model), false);

        var fieldDetails = JSON.parse(displayField.field_details);
        var isNumberDataType = WC.FormatHelper.IsNumberFieldType(fieldType);
        var isSupportDecimal = WC.FormatHelper.IsSupportDecimal(fieldType);
        var isTimeDataType = WC.FormatHelper.IsFieldTypeHasTime(fieldType);
        var isEnumDataType = fieldType === enumHandlers.FIELDTYPE.ENUM;

        jQuery('.UseAsDefaultWrapper #FieldName').text(field.short_name);
        if (isNumberDataType) {
            var prefix = typeof fieldDetails.prefix === 'undefined' ? enumHandlers.FIELDSETTING.USEDEFAULT : fieldDetails.prefix === null ? enumHandlers.DISPLAYUNITSFORMAT.NONE : fieldDetails.prefix;
            var displayUnitDropdown = self.AddUseDefaulToFormatList(fieldType, ko.toJS(enumHandlers.DISPLAYUNITS));
            userSettingsPanelHandler.RenderFormatSettingDropdownlist('FormatDisplayUnitSelect', displayUnitDropdown, prefix);

            if (isSupportDecimal) {
                var decimals = typeof fieldDetails.decimals !== 'undefined' ? fieldDetails.decimals : enumHandlers.FIELDSETTING.USEDEFAULT;
                var decimalDropdown = self.AddUseDefaulToFormatList(fieldType, ko.toJS(enumHandlers.LISTFORMATDECIMALS));
                userSettingsPanelHandler.RenderFormatSettingDropdownlist('FormatDecimalSelect', decimalDropdown, decimals);
            }
        }
        else if (isTimeDataType) {
            var secondsFormat = userSettingsPanelHandler.GetSecondDropdownValue(displayFormat.second);
            userSettingsPanelHandler.RenderTimeFormatSettingDropdownlist('FormatSecondsSelect', self.FormatList(), secondsFormat);
        }
        else if (isEnumDataType) {
            userSettingsPanelHandler.RenderFormatSettingDropdownlist('format', self.FormatList(), displayFormat.format, "Text", "Value");
        }


        var source = modelFieldSourceHandler.GetFieldSourceByUri(field.source);
        var sourceName = source ? userFriendlyNameHandler.GetFriendlyName(source, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME) : '';

        var defaultName = jQuery.trim(sourceName + ' - ' + userFriendlyNameHandler.GetFriendlyName(field, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME));
        var aliasName = WC.Utility.GetDefaultMultiLangText(displayField.multi_lang_alias);
        var aliasInputElement = jQuery('#AliasName');
        aliasInputElement
            .data('default', defaultName)
            .addClass(!aliasName ? 'placeholder' : '')
            .val(aliasName || defaultName)
            .on('keyup', function () {
                // remove class if change alias
                var currentName = jQuery.trim(aliasInputElement.val());
                if (defaultName !== currentName) {
                    aliasInputElement.removeClass('placeholder');
                }
            });

        if (WC.FormatHelper.IsSupportThousandSeparator(fieldType)) {
            var thousandseparator = fieldDetails && typeof fieldDetails.thousandseparator === 'boolean' ? fieldDetails.thousandseparator : null;
            self.ThousandSeparator(thousandseparator);
        }
        else {
            e.sender.element.find('.ThousandSeperateWrapper').remove();
        }

        if (!self.CanFormatField(fieldType))
            e.sender.element.find('.FieldFormatCheckDefault').hide();

        setTimeout(function () {
            listHandler.UpdateAngleGridHeaderPopup();
            e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
        }, 1);
    };
    self.CanFormatField = function (fieldType) {
        var formatFieldTypes = [
            enumHandlers.FIELDTYPE.ENUM,
            enumHandlers.FIELDTYPE.PERCENTAGE,
            enumHandlers.FIELDTYPE.NUMBER,
            enumHandlers.FIELDTYPE.DOUBLE,
            enumHandlers.FIELDTYPE.INTEGER,
            enumHandlers.FIELDTYPE.CURRENCY
        ];
        return jQuery.inArray(fieldType, formatFieldTypes) !== -1;
    };
    self.GenerateFormatList = function (fieldType) {
        var results = [];
        if (fieldType === enumHandlers.FIELDTYPE.ENUM)
            results = enumHandlers.LISTFORMATENUM;
        else if (fieldType === enumHandlers.FIELDTYPE.INTEGER)
            results = enumHandlers.LISTFORMATINTEGER;
        else if (fieldType === enumHandlers.FIELDTYPE.PERCENTAGE)
            results = enumHandlers.LISTFORMATPERCENTAGE;
        else if (fieldType === enumHandlers.FIELDTYPE.PERIOD)
            results = enumHandlers.LISTFORMATPERIOD;
        else if (jQuery.inArray(fieldType, [
            enumHandlers.FIELDTYPE.DOUBLE,
            enumHandlers.FIELDTYPE.CURRENCY,
            enumHandlers.FIELDTYPE.NUMBER
        ]) !== -1)
            results = enumHandlers.LISTFORMATNUMBER;
        else if (jQuery.inArray(fieldType, [
            enumHandlers.FIELDTYPE.DATETIME,
            enumHandlers.FIELDTYPE.TIME,
            enumHandlers.FIELDTYPE.TIMESPAN
        ]) !== -1)
            results = enumHandlers.TIMESECONDSFORMATLIST;

        return self.AddUseDefaulToFormatList(fieldType, results.slice());
    };
    self.AddUseDefaulToFormatList = function (fieldType, formatList) {
        switch (fieldType) {
            case enumHandlers.FIELDTYPE.ENUM:
                formatList.unshift({
                    Text: Localization.FormatSetting_UseDefault,
                    Value: enumHandlers.FIELDSETTING.USEDEFAULT
                });
                break;
            case enumHandlers.FIELDTYPE.INTEGER:
            case enumHandlers.FIELDTYPE.DOUBLE:
            case enumHandlers.FIELDTYPE.TIME:
            case enumHandlers.FIELDTYPE.TIMESPAN:
            case enumHandlers.FIELDTYPE.DATETIME:
            case enumHandlers.FIELDTYPE.CURRENCY:
            case enumHandlers.FIELDTYPE.PERCENTAGE:
                formatList.unshift({
                    name: Localization.FormatSetting_UseDefault,
                    id: enumHandlers.FIELDSETTING.USEDEFAULT
                });
                break;
            default:
                break;
        }

        return formatList;
    };
    self.CloseCustomPopup = function () {
        popup.Close(jQuery('.listFormatSettingPopup .k-window-content'));
    };
    self.UpdateAliasHeader = function (field, displayField) {
        var headerColumn = jQuery('#AngleGrid .k-header[data-field="' + WC.Utility.RevertBackSlashFieldName(field.id) + '"]');
        var headerHtml = listHandler.GetTemplateCellHeader(field, displayField);
        headerColumn.html(headerHtml);
    };
    self.ResetSetListFormatDisplay = function (field) {
        listHandler.HideHeaderPopup();
        // set UI to default
        var displayField = jQuery.grep(displayModel.Data().fields, function (fieldItem) {
            return fieldItem.field.toLowerCase() === field.id.toLowerCase();
        })[0];
        var detail = displayModel.GetFieldSettings(displayField);
        delete detail[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE];
        delete detail[enumHandlers.FIELDDETAILPROPERTIES.FORMAT];
        delete detail[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS];
        delete detail[enumHandlers.FIELDDETAILPROPERTIES.PREFIX];
        displayField.field_details = JSON.stringify(detail);

        var applySetting = function () {
            displayField.multi_lang_alias = [];
            displayField.field_details = JSON.stringify(detail);
            displayModel.Data.commit();

            WC.FormatHelper.ClearFormatCached();
            listHandler.ColumnInfo[field.id.toLowerCase()] = displayField;

            self.UpdateAliasHeader(field, displayField);
            jQuery('#AngleGrid').data(enumHandlers.KENDOUITYPE.GRID).refresh();
            listHandler.HideHeaderPopup();
            historyModel.Save();
        };

        // reset model field user setting format
        var existingModelFieldUserSpecificObject = field.user_specific;
        if (field.user_specific && field.user_specific.user_settings) {
            var existingFieldUserSpecificSettings = ko.toJS(JSON.parse(field.user_specific.user_settings));
            delete existingFieldUserSpecificSettings[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE];
            delete existingFieldUserSpecificSettings[enumHandlers.FIELDDETAILPROPERTIES.FORMAT];
            delete existingFieldUserSpecificSettings[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS];
            delete existingFieldUserSpecificSettings[enumHandlers.FIELDDETAILPROPERTIES.PREFIX];
            if (jQuery.isEmptyObject(existingFieldUserSpecificSettings)) {
                delete existingModelFieldUserSpecificObject.user_settings;
            }
            else {
                existingModelFieldUserSpecificObject.user_settings = JSON.stringify(existingFieldUserSpecificSettings);
            }
            var data = { user_specific: existingModelFieldUserSpecificObject };
            UpdateDataToWebService(field.uri, data)
                .done(function (response) {
                    modelFieldsHandler.SetFields([response]);
                    applySetting();
                });
        }
        else {
            applySetting();
        }
    };
    self.SetListFormatDisplay = function (formValues, field) {
        requestHistoryModel.SaveLastExecute(self, self.SetListFormatDisplay, arguments);

        var displayField = displayModel.Data().fields.findObject('field', field.id, false);
        var displayFieldDetail = displayModel.GetFieldSettings(displayField);
        var saveDefault = WC.HtmlHelper.GetCheckBoxStatus('[id="UseAsDefaultFormat"]:visible');
        var isThousandSeperateDataType = WC.FormatHelper.IsSupportThousandSeparator(field.fieldtype);
        var isNumberDataType = WC.FormatHelper.IsNumberFieldType(field.fieldtype);
        var isTimeDataType = WC.FormatHelper.IsFieldTypeHasTime(field.fieldtype);
        var isEnumDataType = field.fieldtype === enumHandlers.FIELDTYPE.ENUM;

        if (isThousandSeperateDataType) {
            var useThousandSeperate = jQuery('#UseThousandSeperate').data('state');
            if (useThousandSeperate === enumHandlers.CHECKSTATE.TRUE)
                displayFieldDetail[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE] = true;
            else if (useThousandSeperate === enumHandlers.CHECKSTATE.FALSE)
                displayFieldDetail[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE] = false;
            else
                delete displayFieldDetail[enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE];
        }

        jQuery.each(formValues, function (index, formValue) {
            var controlName = formValue.name;
            if (controlName !== 'savedefault' && controlName !== enumHandlers.FIELDDETAILPROPERTIES.THOUSANDSEPARATE) {
                displayFieldDetail[controlName] = formValue.value;
            }
        });

        if (isNumberDataType) {
            var displayUnitFormat = WC.HtmlHelper.DropdownList('#FormatDisplayUnitSelect').value();
            if (displayUnitFormat === enumHandlers.FIELDSETTING.USEDEFAULT)
                delete displayFieldDetail[enumHandlers.FIELDDETAILPROPERTIES.PREFIX];
            else
                displayFieldDetail[enumHandlers.FIELDDETAILPROPERTIES.PREFIX] = displayUnitFormat === enumHandlers.DISPLAYUNITSFORMAT.NONE ? null : displayUnitFormat;

            if (field.fieldtype !== enumHandlers.FIELDTYPE.INTEGER) {
                var deimalFormat = WC.HtmlHelper.DropdownList('#FormatDecimalSelect').value();
                if (deimalFormat === enumHandlers.FIELDSETTING.USEDEFAULT)
                    delete displayFieldDetail[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS];
                else
                    displayFieldDetail[enumHandlers.FIELDDETAILPROPERTIES.DECIMALS] = parseInt(deimalFormat, 10);
            }
        }
        else if (isTimeDataType) {
            var seconds = WC.HtmlHelper.DropdownList('#FormatSecondsSelect').value();
            userSettingsPanelHandler.SetSecondFormat(displayFieldDetail, seconds);
        }
        else if (isEnumDataType) {
            var format = WC.HtmlHelper.DropdownList('#format').value();
            if (format === enumHandlers.FIELDSETTING.USEDEFAULT) {
                delete displayFieldDetail[enumHandlers.FIELDDETAILPROPERTIES.FORMAT];
            }
            else
                displayFieldDetail[enumHandlers.FIELDDETAILPROPERTIES.FORMAT] = format;
        }

        var defaultName = jQuery.trim(jQuery('#AliasName').data('default'));
        var aliasName = jQuery.trim(jQuery('#AliasName').val());
        var language = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES);
        var grid = jQuery('#AngleGrid').data(enumHandlers.KENDOUITYPE.GRID);
        // if check set to defualt
        if (saveDefault) {
            var currentFieldUserSpecific = field.user_specific;
            delete currentFieldUserSpecific.is_starred;

            // delete property that not need to store in model field
            var tempDisplayFieldDetails = jQuery.extend({}, displayFieldDetail);
            delete tempDisplayFieldDetails.width;

            currentFieldUserSpecific.user_settings = JSON.stringify(tempDisplayFieldDetails);
            var data = { user_specific: currentFieldUserSpecific };

            UpdateDataToWebService(field.uri, data)
                .done(function (response) {
                    // update model field
                    modelFieldsHandler.SetFields([response]);

                    // update model instance field
                    var queryFieldUrl = listHandler.GetQueryFieldUrl();
                    modelInstanceFieldsHandler.SetFields([response], queryFieldUrl);

                    // update list handler
                    listHandler.ColumnDefinitions = listHandler.GetColumnDefinitions();

                    self.ApplySetting(displayField, language, field, displayFieldDetail, grid, defaultName, aliasName);
                });

        }
        else {
            self.ApplySetting(displayField, language, field, displayFieldDetail, grid, defaultName, aliasName);
        }
    };
    self.ApplySetting = function (displayField, language, field, displayFieldDetail, grid, defaultName, aliasName) {

        var multiAlias = displayField.multi_lang_alias || [];

        // clear current language
        multiAlias.removeObject('lang', language, false);

        // add new if changes
        if (aliasName && defaultName !== aliasName) {
            multiAlias.push({
                lang: language,
                text: aliasName
            });
        }

        // update model
        displayField.multi_lang_alias = multiAlias;
        displayField.field_details = JSON.stringify(displayFieldDetail);
        displayModel.Data.commit();

        WC.FormatHelper.ClearFormatCached();
        listHandler.ColumnInfo[field.id.toLowerCase()] = displayField;

        self.UpdateAliasHeader(field, displayField);
        grid.refresh();
        listHandler.HideHeaderPopup();
        historyModel.Save();
    };

    //EOF: Methods
}
