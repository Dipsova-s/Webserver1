/* M4-11519: Implemented export to csv */
var exportHandler = new ExportHandler();

function ExportHandler() {
    "use strict";

    var self = this;
    //BOF: Properties
    self.CurrentExportModel = {};
    self.IsCancelExporting = false;
    self.GenerateCSVUri = '';
    var fnCheckExportProgress;
    //EOF: Properties

    //BOF: Methods
    self.ShowExportPopup = function (option) {
        var popupName, htmlExportTemplate;
        switch (option.ExportType) {
            case enumHandlers.ANGLEACTION.EXPORTTOCSV.Id:
                popupName = 'ExportToCSV';
                htmlExportTemplate = exportCSVHtmlTemplate();
                break;
            case enumHandlers.ANGLEACTION.EXPORTTOEXCEL.Id:
                popupName = 'ExportExcel';
                htmlExportTemplate = exportExcelHtmlTemplate();
                break;
            default:
                popupName = 'ExportDrilldownExcel';
                htmlExportTemplate = exportDrilldownExcelHtmlTemplate();
                break;
        }
        var popupSettings = {
            title: option.ExportType === enumHandlers.ANGLEACTION.EXPORTTOEXCEL.Id ? Localization.ExportToExcel : Captions.Popup_SaveAsCSV_Title,
            element: '#popup' + popupName,
            html: htmlExportTemplate,
            className: 'popupExportExcel popup' + popupName,
            resizable: false,
            actions: ["Close"],
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    click: 'close',
                    position: 'right'
                },
                {
                    className: 'executing',
                    text: Localization.Ok,
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj)) {
                            self.ExportDisplay(e, option);
                        }
                    },
                    isPrimary: true,
                    position: 'right'
                }
            ],
            open: function () {
                self.ShowExportPopupCallback(option);
            }
        };

        popup.Show(popupSettings);
    };
    self.ShowExportPopupCallback = function (option) {
        if (option.ExportType === enumHandlers.ANGLEACTION.EXPORTTOEXCEL.Id) {
            /* For refactor export excel */
        }
        else {
            var model = modelsHandler.GetModelByUri(angleInfoModel.Data().model);
            var filename = CleanExcelFileName(angleInfoModel.Name(), 'ExportAngle');
            if (typeof ko.dataFor(jQuery('#export-csv-area').get(0)) === 'undefined') {
                self.CurrentExportModel = new ExportCSVModel({
                    FileName: filename,
                    DatarowUri: resultModel.Data().data_rows,
                    MaxPageSize: systemSettingHandler.GetMaxPageSize(),
                    DisplayUri: displayModel.Data().uri,
                    FieldMetaDataUri: !model ? '' : model.fields,
                    UserSettingUri: userModel.Data().user_settings,
                    ModelDataTimeStamp: modelCurrentInstanceHandler.GetCurrentModelInstance(angleInfoModel.Data().model).modeldata_timestamp,
                    DataFieldUri: resultModel.Data().data_fields,
                    CurrentFields: self.GetCurrentDisplayField(displayModel.Data().display_type),
                    DisplayType: displayModel.Data().display_type
                });
                WC.HtmlHelper.ApplyKnockout(self.CurrentExportModel, jQuery('#export-csv-area'));
            }
            else {
                self.CurrentExportModel.DatarowUri = resultModel.Data().data_rows;
                self.CurrentExportModel.MaxPageSize = systemSettingHandler.GetMaxPageSize();
                self.CurrentExportModel.DisplayUri = displayModel.Data().uri;
                self.CurrentExportModel.FieldMetaDataUri = !model ? '' : model.fields;
                self.CurrentExportModel.UserSettingUri = userModel.Data().user_settings;
                self.CurrentExportModel.ModelDataTimeStamp = modelCurrentInstanceHandler.GetCurrentModelInstance(angleInfoModel.Data().model).modeldata_timestamp;
                self.CurrentExportModel.DataFieldUri = resultModel.Data().data_fields;
                self.CurrentExportModel.CurrentFields = self.GetCurrentDisplayField(displayModel.Data().display_type);
                self.CurrentExportModel.DisplayType = displayModel.Data().display_type;
            }

            self.GetDefaultCSVDatastore();
        }
    };

    self.GetDefaultCSVDatastore = function () {
        var request = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.SYSTEMDATASTORES);
        var query = {};
        query["default_datastore"] = true;

        jQuery('#popupExportToCSV').busyIndicator(true);
        return GetDataFromWebService(request, query)
            .then(function (data) {
                if (data && data.datastores && data.datastores.findObject('datastore_plugin', 'csv')) {
                    var defaultCSVDatastoreUri = data.datastores.findObject('datastore_plugin', 'csv').uri;
                    return GetDataFromWebService(defaultCSVDatastoreUri, query);
                }
                return jQuery.when(null);
            })
            .done(function (data) {
                if (data)
                    self.SetExportModel(data);
            })
            .always(function () {
                self.SetExportModelUI();
                jQuery('#popupExportToCSV').busyIndicator(false);
                self.SetButtonStatus();
            });
    };

    self.SetButtonStatus = function () {
        jQuery('a[id*=btn-popupExportToCSV]').removeClass('executing');
    };

    self.SetExportModel = function (datastore) {
        self.CurrentExportModel.EnquoteHeader.ForEditing(self.GetDatastoreDataSetting(datastore, 'csv_enquote_headers').toString());
        self.CurrentExportModel.EnquoteCharacter(self.GetDatastoreDataSetting(datastore, 'csv_enquote_character'));
        self.CurrentExportModel.FieldSeparator(self.GetDatastoreDataSetting(datastore, 'csv_field_separator'));
        self.CurrentExportModel.DecimalSeparator(self.GetDatastoreDataSetting(datastore, 'decimal_separator'));
        self.CurrentExportModel.DateSeparator(self.GetDatastoreDataSetting(datastore, 'date_separator'));
        self.CurrentExportModel.TimeSeparator(self.GetDatastoreDataSetting(datastore, 'time_separator'));
        self.CurrentExportModel.DateFormat(self.GetDatastoreDataSetting(datastore, 'date_format'));
        self.CurrentExportModel.TimeFormat(self.GetDatastoreDataSetting(datastore, 'time_format'));
        self.CurrentExportModel.TrueChar(self.GetDatastoreDataSetting(datastore, 'bool_format_true'));
        self.CurrentExportModel.FalseChar(self.GetDatastoreDataSetting(datastore, 'bool_format_false'));
        self.CurrentExportModel.HeaderFormat = self.GetDatastoreDataSetting(datastore, 'header_format');
        self.CurrentExportModel.EnquoteSetting = self.GetDatastoreDataSetting(datastore, 'csv_enquote');
        self.CurrentExportModel.LineSeparator = self.GetDatastoreDataSetting(datastore, 'csv_line_separator');
        self.CurrentExportModel.Decimal = self.GetDatastoreDataSetting(datastore, 'number_of_decimals');
        self.CurrentExportModel.EnumFormat = self.GetDatastoreDataSetting(datastore, 'enum_format');
        self.CurrentExportModel.AddModelDateAtColumn = self.GetDatastoreDataSetting(datastore, 'model_timestamp_index');
        self.CurrentExportModel.MaxRowsToExport(self.GetDatastoreDataSetting(datastore, 'max_rows_to_export'));
        return self.CurrentExportModel;
    };

    self.GetDatastoreDataSetting = function (datastore, id) {
        if (datastore && datastore.data_settings && datastore.data_settings.setting_list && datastore.data_settings.setting_list.findObject('id', id))
            return datastore.data_settings.setting_list.findObject('id', id).value;
        else
            return '';
    };

    self.SetExportModelUI = function () {
        var headerFormatDropdownlist = WC.HtmlHelper.DropdownList('#header-format-dropdownlist', self.CurrentExportModel.HeaderFormats, {
            dataTextField: "TEXT",
            dataValueField: "VALUE",
            index: 2,
            change: function (e) {
                self.CurrentExportModel.HeaderFormat = e.sender.value();
            }
        });
        headerFormatDropdownlist.value(self.CurrentExportModel.HeaderFormat);

        var enquoteDropdownlist = WC.HtmlHelper.DropdownList('#enquote-dropdownlist', self.CurrentExportModel.EnquoteSettings, {
            dataTextField: "TEXT",
            dataValueField: "VALUE",
            index: 1,
            change: function (e) {
                self.CurrentExportModel.EnquoteSetting = e.sender.value();
            }
        });
        enquoteDropdownlist.value(self.CurrentExportModel.EnquoteSetting);

        var lineSeparatorDropdownlist = WC.HtmlHelper.DropdownList('#line-separator-dropdownlist', self.CurrentExportModel.LineSeparators, {
            dataTextField: "TEXT",
            dataValueField: "TEXT",
            index: 0,
            change: function (e) {
                self.CurrentExportModel.LineSeparator = e.sender.value();
            }
        });
        lineSeparatorDropdownlist.value(self.CurrentExportModel.LineSeparator);

        WC.HtmlHelper.DestroyNumericIfExists('#decimal-format-text');

        var decimalFormatText = jQuery('#decimal-format-text').kendoNumericTextBox({
            min: 0,

            /* M4-13474: Implemented maximize decimal value into GUI */
            max: self.CurrentExportModel.MaximizeDecimals,

            step: 1,
            format: 'n0',
            decimals: 0,
            placeholder: Localization.AllDecimals,
            change: function (e) {
                self.CurrentExportModel.Decimal = e.sender.value();
            }
        }).data('handler');
        var decimalValue = self.CurrentExportModel.Decimal === -1 ? null : self.CurrentExportModel.Decimal;
        decimalFormatText.value(decimalValue);

        var enumFormatDropdownlist = WC.HtmlHelper.DropdownList('#enum-format-dropdownlist', self.CurrentExportModel.EnumFormats, {
            dataTextField: "TEXT",
            dataValueField: "VALUE",
            index: 0,
            change: function (e) {
                self.CurrentExportModel.EnumFormat = e.sender.value();
            }
        });
        enumFormatDropdownlist.value(self.CurrentExportModel.EnumFormat);

        var dateFormatDropdownlist = WC.HtmlHelper.DropdownList('#date-format-dropdownlist', self.CurrentExportModel.DateFormats, {
            dataTextField: "TEXT",
            dataValueField: "VALUE",
            index: 0,
            change: function (e) {
                self.CurrentExportModel.DateFormat(e.sender.value());
            }
        });
        dateFormatDropdownlist.value(self.CurrentExportModel.DateFormat());

        var timeFormatDropdownlist = WC.HtmlHelper.DropdownList('#time-format-dropdownlist', self.CurrentExportModel.TimeFormats, {
            dataTextField: "TEXT",
            dataValueField: "VALUE",
            index: 0,
            change: function (e) {
                self.CurrentExportModel.TimeFormat(e.sender.value());
            }
        });
        timeFormatDropdownlist.value(self.CurrentExportModel.TimeFormat());

        // M4-33218: new modeldate ui
        self.CreateAddModelDateUI();
    };
    self.CreateAddModelDateUI = function () {
        var addModelDateUI = jQuery('#add-model-date-at-column').data('handler');
        if (addModelDateUI) {
            addModelDateUI.destroy();
        }
        addModelDateUI = jQuery('#add-model-date-at-column').kendoModelTimestampTextBox({
            placeholder: Captions.Label_CSV_Export_ModelDate_Placeholder,
            messages: {
                none: Captions.Label_CSV_Export_ModelDate_None
            },
            value: self.CurrentExportModel.AddModelDateAtColumn,
            change: function (e) {
                self.CurrentExportModel.AddModelDateAtColumn = e.sender.value();
            }
        }).data('handler');
        return addModelDateUI;
    };

    self.ValidateExportCSV = function (exportSettings) {
        // check if file name contains macros
        var angleNormalizedMacro = '{anglename:normalized}';
        var displayNormalizedMacro = '{displayname:normalized}';
        var fileName = exportSettings.FileName;
        fileName = fileName.replace(angleNormalizedMacro, '');
        fileName = fileName.replace(displayNormalizedMacro, '');

        // validate filename
        if (fileName && !IsValidFileAndSheetName(fileName)) {
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.ValidateExportExcel_SpecialCharacter, exportSettings.FileName, Captions.Label_Angle_Export_FileName, "csv"));
            return false;
        }
        return true;
    };
    self.ExportDisplay = function (e, option) {
        if (option.ExportType === enumHandlers.ANGLEACTION.EXPORTTOEXCEL.Id) {
            /* For refactor export excel */
        }
        else {
            self.ExportCSV(e, option);
        }
    };
    self.ExportExcel = function () {
        self.IsCancelExporting = false;
        /* For refactor export excel */
    };
    self.ExportCSV = function (e) {
        self.IsCancelExporting = false;
        var angleModels = jQuery.grep(userModel.Privileges.ModelPrivileges, function (modelPrivilege) { return modelPrivilege.model === angleInfoModel.Data().model; });
        var maxExportRow = angleModels.length === 0 ? null : angleModels[0].privileges.max_export_rows;
        if (IsNullOrEmpty(maxExportRow)) {
            self.CurrentExportModel.ExportRow = resultModel.Data().row_count;
        }
        else {
            self.CurrentExportModel.ExportRow = maxExportRow;
        }

        // extend unset properties to their default value
        var defaultExportSettings = {};
        var currentExportSettings = JSON.parse(JSON.stringify(ko.toJS(self.CurrentExportModel)));
        var keyName;
        jQuery.each(currentExportSettings, function (key, value) {
            if (key.toLowerCase().substr(0, 7) === 'default') {
                keyName = key.substr(7);
                if (keyName === 'BoolChars') {
                    jQuery.each(value, function (keyBoolean, valueBoolean) {
                        defaultExportSettings[keyBoolean] = valueBoolean;
                    });
                }
                else {
                    defaultExportSettings[keyName] = value;
                }
            }
        });
        jQuery.each(currentExportSettings, function (key) {
            if (currentExportSettings[key] === '')
                delete currentExportSettings[key];
        });

        var exportSettings = jQuery.extend({}, defaultExportSettings, currentExportSettings);
        exportSettings.FileName = jQuery.trim(exportSettings.FileName);

        if (!exportSettings.FileName)
            exportSettings.FileName = CleanExcelFileName(angleInfoModel.Name() + ' - ' + displayModel.Name());

        if (!self.ValidateExportCSV(exportSettings)) {
            return false;
        }

        e.kendoWindow.element.closest('.popupExportToCSV').addClass('alwaysHide');
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_SavingAsCSV, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            self.IsCancelExporting = true;
            self.CloseExportExcelPopup(e);
        };

        self.GenerateCSVjsonData = {
            "plugin": "csv",
            "offset": 0,
            "limit": self.CurrentExportModel.ExportRow,
            "file_name": exportSettings.FileName,
            "fields": self.CurrentExportModel.CurrentFields,
            "data_settings": {
                "setting_list": [
                    {
                        "id": "header_format",
                        "value": exportSettings.HeaderFormat
                    },
                    {
                        "id": "csv_enquote_headers",
                        "value": exportSettings.EnquoteHeader
                    },
                    {
                        "id": "csv_enquote",
                        "value": exportSettings.EnquoteSetting
                    },
                    {
                        "id": "csv_enquote_character",
                        "value": exportSettings.EnquoteCharacter || exportSettings.DefaultEnquoteCharacter
                    },
                    {
                        "id": "csv_field_separator",
                        "value": exportSettings.FieldSeparator || exportSettings.DefaultFieldSeparator
                    },
                    {
                        "id": "csv_line_separator",
                        "value": exportSettings.LineSeparator
                    },
                    {
                        "id": "decimal_separator",
                        "value": exportSettings.DecimalSeparator || exportSettings.DefaultDecimalSeparator
                    },
                    {
                        "id": "date_separator",
                        "value": exportSettings.DateSeparator || exportSettings.DefaultDateSeparator
                    },
                    {
                        "id": "time_separator",
                        "value": exportSettings.TimeSeparator || exportSettings.DefaultTimeSeparator
                    },
                    {
                        "id": "date_format",
                        "value": exportSettings.DateFormat
                    },
                    {
                        "id": "time_format",
                        "value": exportSettings.TimeFormat
                    },
                    {
                        "id": "number_of_decimals",
                        "value": isNaN(exportSettings.Decimal) ? exportSettings.DefaultDecimals : parseFloat(exportSettings.Decimal)
                    },
                    {
                        "id": "bool_format_true",
                        "value": exportSettings.TrueChar || exportSettings.DefaultBoolChars.TrueChar
                    },
                    {
                        "id": "bool_format_false",
                        "value": exportSettings.FalseChar || exportSettings.DefaultBoolChars.FalseChar
                    },
                    {
                        "id": "enum_format",
                        "value": exportSettings.EnumFormat
                    },
                    {
                        "id": "model_timestamp_index",
                        "value": isNaN(exportSettings.AddModelDateAtColumn) ? exportSettings.DefaultAddModelDateAtColumn : parseFloat(exportSettings.AddModelDateAtColumn)
                    },
                    {
                        "id": "max_rows_to_export",
                        "value": self.CurrentExportModel.MaxRowsToExport()
                    }
                ]
            }
        };

        var request = resultModel.Data().uri + '/exports/?redirect=no';
        progressbarModel.SetProgressBarText(0, null, Localization.ProgressBar_CurrentRetrievingCSVFileFromApplicationServer);
        clearTimeout(fnCheckExportProgress);

        CreateDataToWebService(request, self.GenerateCSVjsonData)
            .done(function (data) {
                progressbarModel.IsCancelPopup = false;
                self.GenerateCSVUri = data.uri;
                self.GenerateCSV(e);
            });
    };

    self.GenerateCSV = function (e) {
        var uri = self.GenerateCSVUri;
        clearTimeout(fnCheckExportProgress);
        if (!progressbarModel.IsCancelPopup) {
            GetDataFromWebService(uri)
                .done(function (response) {
                    progressbarModel.SetProgressBarText(kendo.toString(response.progress * 100, 'n0'), null, Localization.ProgressBar_CurrentRetrievingCSVFileFromApplicationServer);
                    if (response.status.toLowerCase() === "finished") {

                        WC.Ajax.EnableBeforeExit = false;
                        WC.Utility.DownloadFile(WC.Ajax.BuildRequestUrl(response.file_uri, false));

                        fnCheckExportProgress = setTimeout(function () {
                            self.DoneToGenerateCSV(e, false);
                        }, 2000);

                    }
                    else if (response.status.toLowerCase() === "failed") {
                        popup.Error(Localization.Error_Title, response.message);
                        self.DoneToGenerateCSV(e);
                    }
                    else {
                        fnCheckExportProgress = setTimeout(self.GenerateCSV.bind(self, e), 2000);
                    }
                });
        }
        else {
            DeleteDataToWebService(uri);
        }
    };

    self.DoneToGenerateCSV = function (e, isDeleteProgress) {
        progressbarModel.IsCancelPopup = true;
        progressbarModel.EndProgressBar();
        self.CloseExportExcelPopup(e);
        if (isDeleteProgress !== false) {
            DeleteDataToWebService(self.GenerateCSVUri);
        }
    };

    self.CloseExportExcelPopup = function (e) {
        e.kendoWindow.element.closest('.popupExportToCSV').removeClass('alwaysHide');
        popup.Close('#popupExportExcel');
        popup.Close('#popupExportDrilldownExcel');
        popup.Close('#popupExportToCSV');
    };

    self.GetCurrentDisplayField = function (displayType) {
        var results = [];

        if (displayType === enumHandlers.DISPLAYTYPE.LIST) {
            results = displayModel.Data().fields;
        }
        else {
            var fieldSettings = (displayType === enumHandlers.DISPLAYTYPE.CHART ? chartHandler : pivotPageHandler).FieldSettings.GetFields().findObjects("IsSelected", true);
            for (var loop = 0; loop < fieldSettings.length; loop++) {
                results.push({
                    field: fieldSettings[loop].FieldName,
                    field_details: fieldSettings[loop].FieldDetails,
                    valid: fieldSettings[loop].Valid,
                    validation_error: fieldSettings[loop].ValidError,
                    multi_lang_alias: fieldSettings[loop].MultiLangAlias
                });
            }
        }

        return results;
    };
    //EOF: Methods
}
/* M4-11519: Implemented export to csv */
