var exportExcelHandler = new ExportExcelHandler();

function ExportExcelHandler() {
    "use strict";

    var self = this;
    var fnCheckExportProgress;
    self.CurrentExportModel = {};
    //BOF: Properties
    self.AngleName = ko.observable();
    self.Description = ko.observable();
    self.ExportRow = 0;
    self.IsCancelExporting = false;
    self.GenerateExcelUri = '';
    self.GenerateExceljsonData = {};
    self.SupportExcelExportAsChart = ['area', 'area_stack', 'bar', 'bar_stack', 'column', 'column_stack', 'line', 'line_stack', 'radarLine', 'radarLine_stack', 'donut', 'pie', 'bubble', 'scatter'];
    self.DefaultSetting = {};
    //EOF: Properties

    //BOF: Methods
    self.SetData = function (angle) {
        self.AngleName(WC.Utility.GetDefaultMultiLangText(angle.multi_lang_name));
        self.Description(WC.Utility.GetDefaultMultiLangText(angle.multi_lang_description));
    };
    self.GetDisplayExcelDefaultSettings = function () {
        var fieldsData = self.GetCurrentDisplayField(displayModel.Data().display_type);
        displayModel.ConvertDisplayFieldPrefixNoneToNull(fieldsData);

        return {
            "plugin": "msexcel",
            "file_name": '',
            "offset": 0,
            "limit": 0,
            "fields": fieldsData,
            "angle_multi_lang_name": angleInfoModel.Data().multi_lang_name,
            "angle_multi_lang_description": angleInfoModel.Data().multi_lang_description,
            "query_definition": angleQueryStepModel.CollectQueryBlocks(),
            "display_definitions": [{
                "display_type": displayModel.Data().display_type,
                "multi_lang_name": displayModel.Data().multi_lang_name,
                "multi_lang_description": displayModel.Data().multi_lang_description,
                "query_blocks": displayQueryBlockModel.CollectQueryBlocks()
            }],
            "data_settings": {
                "setting_list": []
            }
        };
    };
    self.GetAngleSummary = function () {
        return {};
    };
    self.GetDisplaySummary = function () {
        return {};
    };
    self.GetCurrentDisplayField = function (displayType) {
        return exportHandler.GetCurrentDisplayField(displayType);
    };
    self.GenerateExcel = function (e) {
        var uri = self.GenerateExcelUri;
        clearTimeout(fnCheckExportProgress);
        if (!progressbarModel.IsCancelPopup) {
            GetDataFromWebService(uri)
                .done(function (response) {
                    progressbarModel.SetProgressBarText(kendo.toString(response.progress * 100, 'n0'), null, Localization.ProgressBar_CurrentRetrievingExcelFileFromApplicationServer);
                    if (response.status.toLowerCase() === "finished") {

                        WC.Ajax.EnableBeforeExit = false;
                        WC.Utility.DownloadFile(WC.Ajax.BuildRequestUrl(response.file_uri, false));
                        fnCheckExportProgress = setTimeout(function () {
                            self.DoneToGenerateExcel(e, false);
                        }, 2000);

                    }
                    else if (response.status.toLowerCase() === "failed") {
                        popup.Error(Localization.Error_Title, response.message);
                        self.DoneToGenerateExcel(e);
                    }
                    else {
                        fnCheckExportProgress = setTimeout(function () {
                            self.GenerateExcel(e);
                        }, 2000);
                    }
                });
        }
        else {
            DeleteDataToWebService(uri);
        }
    };
    self.DoneToGenerateExcel = function (e, isDeleteProgress) {
        progressbarModel.IsCancelPopup = true;
        progressbarModel.EndProgressBar();
        self.CloseExportExcelPopup(e);
        if (isDeleteProgress !== false) {
            DeleteDataToWebService(self.GenerateExcelUri);
        }
    };
    self.ShowExportExcelPopup = function (displayType) {
        /*
        * M4-9903: Implement for single item
        * 1.If export excel from single drill-down get seperate partial view (ExportDrilldownExcel)
        */
        var popupName = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN) ? 'ExportDrilldownExcel' : 'ExportExcel';
        var htmltemplate = WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN) ? exportDrilldownExcelHtmlTemplate() : exportExcelHtmlTemplate();
        var popupSettings = {
            title: Localization.ExportToExcel,
            element: '#popup' + popupName,
            html: htmltemplate,
            className: 'popupExportExcel',
            resizable: false,
            width: 450,
            minHeight: 100,
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
                            /*
                            * M4-9963: Export to excel: data only for chart
                            * 2.Group export list/chart to one function
                            * 2.1.Send display type parameter, use for call function condition
                            * M4-9903: Implement for single item
                            * 2.Send 'listdrilldown' to parameter for check
                            */
                            self.ExportDisplay(e, displayType);

                        }
                    },
                    isPrimary: true,
                    position: 'right'
                }
            ],
            open: function () {
                self.SetData(angleInfoModel.Data());
                self.ShowExportExcelPopupCallback(displayType);
                //M4-23212: Show or hide the number of export items
                self.SetVisibilityForNumberOfItems(displayType);

                //M4-23209: Indicate when charttype not supported
                self.ShowNotSupportExportChartToExcelWarning(displayType, WC.Utility.ParseJSON(displayModel.Data().display_details));
            },
            close: function (e) {
                setTimeout(function () {
                    e.sender.destroy();
                }, 500);
            }
        };

        popup.Show(popupSettings);
    };
    self.ShowNotSupportExportChartToExcelWarning = function (displayType, displayDetails) {
        var element = jQuery('.row.warningMessage');
        element.hide();
        if (displayType === enumHandlers.DISPLAYTYPE.CHART
            && !self.IsSupportExcelExportAsChart(displayDetails.chart_type, displayDetails.stacked)) {
            element.show();
        }
    };
    self.IsSupportExcelExportAsChart = function (chartType, isStack) {
        if (isStack) {
            chartType += '_stack';
        }
        return jQuery.inArray(chartType, self.SupportExcelExportAsChart) !== -1 && !self.HasMultiDoughnutOrPie();
    };
    self.HasMultiDoughnutOrPie = function () {
        return jQuery('.k-chart-item').length > 0;
    };

    self.ShowExportExcelPopupCallback = function (displayType) {
        self.SetDefaultExcelSettings();
        var rowCount = resultModel.Data().row_count;
        var exportRow = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES);
        if (!exportRow) {
            exportRow = rowCount;
        }
        jQuery('[id="NumberOfItems"]:visible').val(exportRow);

        if (typeof jQuery('[id="popupExportExcel"]:visible').get(0) !== 'undefined') {
            if (self.CanSetNumberOfItem()) {
                // if pivot hide number of rows for export
                jQuery('[id="NumberOfItem"]:visible').hide();
            }
            else {
                var numberOfObjectFormat = new Formatter({ thousandseparator: true }, enumHandlers.FIELDTYPE.INTEGER);
                /* BOF: M4-11556: Implement max export rows */
                if (displayType === enumHandlers.DISPLAYTYPE.LIST) {
                    // Find model privileges by angle model
                    var angleModels = jQuery.grep(userModel.Privileges.ModelPrivileges, function (modelPrivilege) { return modelPrivilege.model === angleInfoModel.Data().model; });
                    var maxExportRow = angleModels.length === 0 ? null : angleModels[0].privileges.max_export_rows || 0;
                    // Check if max export row is null use all total row but if not use max row
                    if (!maxExportRow) {
                        self.CurrentExportModel.TotalRow(Localization.All + ' (' + WC.FormatHelper.GetFormattedValue(numberOfObjectFormat, rowCount) + ')');
                        self.ExportRow = rowCount;
                    }
                    else {
                        self.CurrentExportModel.TotalRow(Localization.Max + ' (' + maxExportRow + ')');
                        self.ExportRow = maxExportRow;
                    }
                }
                else {
                    self.CurrentExportModel.TotalRow(Localization.All + ' (' + WC.FormatHelper.GetFormattedValue(numberOfObjectFormat, rowCount) + ')');
                    self.ExportRow = rowCount;
                }
            }
        }
        self.SetSheetName();
        // Binding knockout
        /* EOF: M4-11556: Implement max export rows */

        /*
        * M4-10439: FB: Excel single item export
        * 1.Default workbook name = <row.Object.shortname> #<row.id>
        * 2.Default sheet name = 'sheet1' or whatever the default in excel version
        */

        self.SetVisibleHeaderFormat(displayType);
        self.SetVisibleInsertModelStamp(displayType);
        jQuery('[id="SaveFileName"]:visible, [id="SaveSheetName"]:visible').removeClass('k-invalid');
    };
    self.SetSheetName = function () {
        var workbookName = angleInfoModel.Name();
        var sheetName = displayModel.Name();
        if (WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)) {
            var listDrilldown = JSON.parse(decodeURI(WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)));
            var classObject = modelClassesHandler.GetClassById(listDrilldown.ObjectType, angleInfoModel.Data().model);
            var objectShortName = !classObject ? listDrilldown.ObjectType : classObject.short_name;
            workbookName = objectShortName + ' #' + listDrilldown.ID;
            sheetName = Localization.CellPopupMenuDrillDownTo + ' ' + objectShortName;
        }
        // EOF: M4-10439: FB: Excel single item export

        workbookName = CleanExcelFileName(workbookName, 'ExportAngle');
        sheetName = CleanSheetName(sheetName, 'Sheet1', 30);


        jQuery('[id="SaveFileName"]:visible').val(workbookName);
        jQuery('[id="SaveSheetName"]:visible').val(sheetName);
    };
    self.SetDefaultExcelSettings = function () {
        var model = modelsHandler.GetModelByUri(angleInfoModel.Data().model);

        if (typeof ko.dataFor(jQuery('#ExportOptionArea').get(0)) === 'undefined') {
            var filename = CleanExcelFileName(angleInfoModel.Name(), 'ExportAngle');

            self.CurrentExportModel = new ExportExcelModel({
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
            WC.HtmlHelper.ApplyKnockout(self.CurrentExportModel, jQuery('#ExportOptionArea'));
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

        self.GetDefaultExcelDatastore();
    };
    self.GetDefaultExcelDatastore = function () {
        var request = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.SYSTEMDATASTORES);
        var query = {};
        query["default_datastore"] = true;

        jQuery('.popupExportExcel').busyIndicator(true);
        return GetDataFromWebService(request, query)
            .then(function (data) {
                if (data && data.datastores && data.datastores.findObject('datastore_plugin', 'msexcel')) {
                    var defaultExcelDatastoreUri = data.datastores.findObject('datastore_plugin', 'msexcel').uri;
                    return GetDataFromWebService(defaultExcelDatastoreUri, query);
                }
                return jQuery.when(null);
            })
            .done(function (data) {
                if (data)
                    self.SetExportModel(data);
            })
            .always(function () {
                self.SetExportModelUI();
                jQuery('.popupExportExcel').busyIndicator(false);
                self.SetButtonStatus();
            });
    };
    self.SetButtonStatus = function () {
        var templates = excelTemplateFilesHandler.GetDropdownData();
        if (!templates.hasObject('id', self.CurrentExportModel.TemplateFile())) {
            jQuery('a[id=btn-popupExportExcel1]').addClass('executing');
            jQuery('a[id=btn-popupExportDrilldownExcel1]:visible').addClass('executing');
        }
        else {
            jQuery('a[id=btn-popupExportExcel1]').removeClass('executing');
            jQuery('a[id=btn-popupExportDrilldownExcel1]:visible').removeClass('executing');
        }
    };
    self.SetExportModel = function (datastore) {
        self.CurrentExportModel.HeaderFormat(self.GetDatastoreDataSetting(datastore, 'header_format'));
        self.CurrentExportModel.AddAngleDefinition(self.GetDatastoreDataSetting(datastore, 'add_angle_definition'));
        self.CurrentExportModel.AddAngleSummary(self.GetDatastoreDataSetting(datastore, 'add_angle_summary'));
        self.CurrentExportModel.TemplateFile(self.GetExcelTemplate());
        self.CurrentExportModel.MaxRowsToExport(self.GetDatastoreDataSetting(datastore, 'max_rows_to_export'));
        self.CurrentExportModel.ModelTimestampIndex(self.GetDatastoreDataSetting(datastore, 'model_timestamp_index'));
        self.CurrentExportModel.TechnicalInfo(self.GetDatastoreDataSetting(datastore, 'include_techinfo'));

        return self.CurrentExportModel;
    };
    self.GetDatastoreDataSetting = function (datastore, id) {
        if (datastore && datastore.data_settings && datastore.data_settings.setting_list && datastore.data_settings.setting_list.findObject('id', id))
            return datastore.data_settings.setting_list.findObject('id', id).value;
        else
            return '';
    };
    self.GetExcelItemTemplate = function () {
        return [
            '<div class="displayNameContainer small">',
            '<div class="front">',
            '<i class="icon #= data.icon_class #"></i>',
            '</div>',
            '<span class="name" data-role="tooltip" data-tooltip-position="bottom" data-showwhenneed="true">#: data.name #</span>',
            '</div>'
        ].join('');
    };
    self.SetExportModelUI = function () {
        jQuery('#HeaderFormatEnum').kendoDropDownList({
            dataTextField: "TEXT",
            dataValueField: "VALUE",
            dataSource: self.CurrentExportModel.HeaderFormats,
            value: self.CurrentExportModel.HeaderFormat()
        });
        
        var excelDropdown = jQuery('#ExcelTemplate').kendoDropDownList({
            dataTextField: "name",
            dataValueField: "id",
            dataSource: self.GetDropdownData(),
            template: self.GetExcelItemTemplate(),
            valueTemplate: self.GetExcelItemTemplate(),
            change: function (e) {
                self.CurrentExportModel.TemplateFile(e.sender.value());
                self.ShowInnoweraDetails(this.dataSource.get(this.value()));
                self.ShowWarningMessageTemplateDeleted(e.sender.value());
            }
        }).data(enumHandlers.KENDOUITYPE.DROPDOWNLIST);

        if (!WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)) {
            var addModelDateUI = jQuery('#InsertModelTimestamp').data('handler');
            if (addModelDateUI) {
                addModelDateUI.destroy();
            }
            jQuery('#InsertModelTimestamp').kendoModelTimestampTextBox({
                placeholder: Captions.Label_CSV_Export_ModelDate_Placeholder,
                messages: {
                    none: Captions.Label_CSV_Export_ModelDate_None
                },
                value: self.CurrentExportModel.ModelTimestampIndex(),
                change: function (e) {
                    self.CurrentExportModel.ModelTimestampIndex(e.sender.value());
                }
            });
        }
        
        excelDropdown.value(self.CurrentExportModel.TemplateFile());
        excelDropdown.trigger('change');
    };
    self.GetDropdownData = function () {
        var excelTemplates = excelTemplateFilesHandler.GetDropdownData();
        var displayDetails = WC.Utility.ParseJSON(displayModel.Data().display_details);
        if (typeof displayDetails.excel_template === 'string' && !excelTemplates.hasObject('id', displayDetails.excel_template)) {
            excelTemplates.push({
                id: displayDetails.excel_template,
                name: displayDetails.excel_template,
                icon_class: "none"
            });
        }
        return excelTemplates;
    };
    self.ShowInnoweraDetails = function (fileData) {
        $('#InnoweraDetails').html('');
        if (!fileData.is_innowera) {
            $("#ExportOptionArea .innowera-details").hide();
            return;
        }
        var processes = fileData.innowera_details.map(function (process) {
            var text = process.sap_process_name + "/" + process.display_name;
            return '<span data-role="tooltip" data-tooltip-text=\"' + text + '\">' + text + '</span><br\>';
        });
        $('#InnoweraDetails').html(processes);
    };
    self.ShowWarningMessageTemplateDeleted = function (template) {
        $("#template-warning-message-popup").html('');
        var warningMessage = '';
        if (!excelTemplateFilesHandler.GetDropdownData().hasObject('id', template)) {
            warningMessage += '<span>' + Captions.Label_Template_Not_Exist_Message + '</span>';
            $("#template-warning-message-popup").show();
            $('div.excel-template .k-dropdown .k-dropdown-wrap').addClass('dropdown-border-warning');
            $("#ExportOptionArea .innowera-details").hide();
        }
        else {
            jQuery('div.excel-template .k-dropdown .k-dropdown-wrap').removeClass('dropdown-border-warning');
            $("#ExportOptionArea .innowera-details").show();
            $("#template-warning-message-popup").hide();
        }

        $("#template-warning-message-popup").html(warningMessage);
        self.SetButtonStatus();
    };
    self.CloseExportExcelPopup = function (e) {
        e.kendoWindow.element.closest('.popupExportExcel').removeClass('alwaysHide');
        popup.Close('#popupExportExcel');
        popup.Close('#popupExportDrilldownExcel');
    };
    self.CanSetNumberOfItem = function () {
        return displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT;
    };
    self.NumberOfRowsCustomFocus = function () {
        jQuery('[id="NumberOfItems"]:visible').focus();
    };
    self.NumberOfRowsCustomBlur = function () {
        var element = jQuery('[id="NumberOfItems"]:visible');
        if (element.length) {
            var v = element.val().replace(/\D/g, '');
            if (v === '' || isNaN(v) || !isNaN(v) && parseInt(v, 10) === 0) {
                var exportRow = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES);
                if (!exportRow) {
                    exportRow = 70;
                }

                element.val(exportRow);
            }
            else {
                element.val(v.replace(/\D/g, ''));
            }
        }
    };
    self.SetVisibilityForNumberOfItems = function (displaytype) {
        if (displaytype === enumHandlers.DISPLAYTYPE.LIST) {
            $('#NumberOfItem').show();
        }
        else {
            $('#NumberOfItem').hide();
        }
    };
    self.SetVisibleHeaderFormat = function (displayType) {
        if (displayType === enumHandlers.DISPLAYTYPE.LIST || self.IsExportPivotAsList(displayType))
            jQuery('#HeaderFormat').show();
        else
            jQuery('#HeaderFormat').hide();
    };
    self.SetVisibleInsertModelStamp = function (displayType) {
        if (displayType === enumHandlers.DISPLAYTYPE.LIST)
            jQuery('#ModeltimeStamp').show();
        else
            jQuery('#ModeltimeStamp').hide();
    }
    /*
    * Move duplicate validate export options code to one function
    */
    self.ValidateExportOptions = function (fileName, sheetName) {
        if (!IsValidFileName(fileName)) {
            jQuery('[id="SaveFileName"]:visible').addClass('k-invalid');
            popup.Alert(Localization.Warning_Title, Localization.ErrorExcelFileName);
            return false;
        }
        else {
            jQuery('[id="SaveFileName"]:visible').removeClass('k-invalid');
        }

        if (!IsValidSheetName(sheetName)) {
            jQuery('[id="SaveSheetName"]:visible').addClass('k-invalid');
            popup.Alert(Localization.Warning_Title, Localization.ErrorExcelSheetName);
            return false;
        }
        else {
            jQuery('[id="SaveSheetName"]:visible').removeClass('k-invalid');
        }

        return true;
    };

    self.GetExcelTemplate = function () {
        var displayDetails = WC.Utility.ParseJSON(displayModel.Data().display_details);
        if (typeof displayDetails.excel_template !== 'undefined')
            return displayDetails.excel_template;
        return defaultExcelDatastoreHandler.GetDefaultTemplate();
    };

    /*
    * M4-9963: Export to excel: data only for chart
    * 3.This function use for collect client side data, angle/display/result uri and send these information to web server generate excel file
    * M4-9903: Implement for single item
    * 4.Check 'displayType' if drill-down single item call seperate function
    */
    self.ExportDisplay = function (e, displayType) {
        //Validate file name, sheet name
        var exportOptions = {};
        exportOptions.FileName = jQuery.trim(jQuery('[id="SaveFileName"]:visible').val());
        exportOptions.SheetName = jQuery.trim(jQuery('[id="SaveSheetName"]:visible').val());
        self.DefaultSetting = [
            {
                "id": "template_file",
                "value": self.CurrentExportModel.TemplateFile()
            },
            {
                "id": "include_techinfo",
                "value": Boolean(self.CurrentExportModel.TechnicalInfo())
            }];
        // validate file name and sheet name
        if (!self.ValidateExportExcel(exportOptions.FileName)) {
            return false;
        }
        if (!self.ValidateExportExcel(exportOptions.SheetName)) {
            return false;
        }

        if (displayType === enumHandlers.DISPLAYTYPE.PIVOT) {
            self.ExportPivotDisplay(e, exportOptions);
        }
        else if (displayType === enumHandlers.DISPLAYTYPE.CHART) {
            self.ExportChartDisplay(e, exportOptions);
        }
        else if (WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)) {
            self.ExporSingleDrilldownItem(e, exportOptions);
        }
        else {
            self.ExportListDisplay(e, exportOptions);
        }

        progressbarModel.CancelForceStop = true;
    };
    self.ValidateExportExcel = function (FileName) {
        // check if file name contains macros
        var angleNormalizedMacro = '{anglename:normalized}';
        var displayNormalizedMacro = '{displayname:normalized}';
        var fileName = FileName;
        fileName = fileName.replace(angleNormalizedMacro, '');
        fileName = fileName.replace(displayNormalizedMacro, '');

        // validate filename
        if (fileName && !IsValidFileAndSheetName(fileName)) {
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.ValidateExportExcel_SpecialCharacter, FileName, Captions.Label_Angle_Export_FileName, "csv"));
            return false;
        }
        return true;
    };
    self.ExportPivotDisplay = function (e, options) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CurrentPrepareToExportData, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            self.IsCancelExporting = true;
            self.CloseExportExcelPopup(e);
        };

        var fieldsData = self.GetCurrentDisplayField(displayModel.Data().display_type);
        displayModel.ConvertDisplayFieldPrefixNoneToNull(fieldsData);

        var enumFormat, headerFormat;
        if (self.IsExportPivotAsList(enumHandlers.DISPLAYTYPE.PIVOT)) {
            enumFormat = 'display';
            headerFormat = jQuery('#HeaderFormatEnum').data('handler').value();
        }
        else {
            enumFormat = 'id';
            headerFormat = 'id';
        }

        var exportOptions = self.GetDisplayExcelDefaultSettings();
        exportOptions.file_name = options.FileName;
        exportOptions.limit = resultModel.Data().row_count;
        exportOptions.data_settings.setting_list = [
            {
                "id": "sheet_name",
                "value": options.SheetName
            },
            {
                "id": "enum_format",
                "value": enumFormat
            },
            {
                "id": "header_format",
                "value": headerFormat
            },
            {
                "id": "pivot_settings",
                "value": JSON.stringify(pivotPageHandler.FieldSettings)
            },
            {
                "id": "add_angle_summary",
                "value": jQuery('#EnableSummarySheet').is(':checked')
            },
            {
                "id": "add_angle_definition",
                "value": jQuery('[id="EnableDefinitionSheet"]:visible').is(':checked')
            }
        ];
        exportOptions.data_settings.setting_list = exportOptions.data_settings.setting_list.concat(self.DefaultSetting);
        e.kendoWindow.element.closest('.popupExportExcel').addClass('alwaysHide');
        clearTimeout(fnCheckExportProgress);
        var request = resultModel.Data().uri + '/exports/?redirect=no';
        progressbarModel.SetProgressBarText(0, null, Localization.ProgressBar_CurrentRetrievingExcelFileFromApplicationServer);
        CreateDataToWebService(request, exportOptions)
            .done(function (data) {
                progressbarModel.IsCancelPopup = false;
                self.GenerateExcelUri = data.uri;
                self.GenerateExcel(e);
            });
    };
    self.IsExportPivotAsList = function (displayType) {
        return displayType === enumHandlers.DISPLAYTYPE.PIVOT && !pivotPageHandler.FieldSettings.GetFields(enumHandlers.FIELDSETTINGAREA.COLUMN).length;
    };

    self.ExportChartDisplay = function (e, options) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CurrentPrepareToExportData, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            self.IsCancelExporting = true;
            self.CloseExportExcelPopup(e);
        };

        var fieldsData = self.GetCurrentDisplayField(displayModel.Data().display_type);
        displayModel.ConvertDisplayFieldPrefixNoneToNull(fieldsData);

        var exportOptions = self.GetDisplayExcelDefaultSettings();
        exportOptions.file_name = options.FileName;
        exportOptions.limit = resultModel.Data().row_count;
        exportOptions.data_settings.setting_list = [
            {
                "id": "sheet_name",
                "value": options.SheetName
            },
            {
                "id": "enum_format",
                "value": 'display'
            },
            {
                "id": "header_format",
                "value": 'display'
            },
            {
                "id": "chart_display_settings",
                "value": JSON.stringify(chartHandler.GetDisplayDetails())
            },
            {
                "id": "chart_settings",
                "value": JSON.stringify(chartHandler.FieldSettings)
            },
            {
                "id": "add_angle_summary",
                "value": jQuery('#EnableSummarySheet').is(':checked')
            },
            {
                "id": "add_angle_definition",
                "value": jQuery('[id="EnableDefinitionSheet"]:visible').is(':checked')
            },
            {
                "id": "template_file",
                "value": self.CurrentExportModel.TemplateFile()
            },
            {
                "id": "include_techinfo",
                "value": Boolean(self.CurrentExportModel.TechnicalInfo())
            }
        ];
        e.kendoWindow.element.closest('.popupExportExcel').addClass('alwaysHide');
        clearTimeout(fnCheckExportProgress);
        var request = resultModel.Data().uri + '/exports/?redirect=no';
        progressbarModel.SetProgressBarText(0, null, Localization.ProgressBar_CurrentRetrievingExcelFileFromApplicationServer);
        CreateDataToWebService(request, exportOptions)
            .done(function (data) {
                progressbarModel.IsCancelPopup = false;
                self.GenerateExcelUri = data.uri;
                self.GenerateExcel(e);
            });
    };

    self.ExportListDisplay = function (e, options) {
        //get number of export's rows
        var numberOfItem;
        if (jQuery('[id="NumberOfRowsCustom"]:visible').is(':checked')) {
            numberOfItem = parseFloat(jQuery('[id="NumberOfItems"]:visible').val());
            if (isNaN(numberOfItem))
                numberOfItem = self.ExportRow;
            if (numberOfItem > self.ExportRow)
                numberOfItem = self.ExportRow;
        }
        else {
            numberOfItem = self.ExportRow;
        }
        options.NumberOfItem = numberOfItem;

        if (options.NumberOfItem > 1048575) {
            popup.Alert(Localization.Warning_Title, Localization.ValidateExportExcel_RowLimit);
            return false;
        }

        /* M4-11348: Check columns limited */
        var fieldCount;
        if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.LIST) {
            fieldCount = displayModel.Data().fields.length;
        }
        else {
            fieldCount = chartHandler.FieldSettings.GetFields().findObjects('IsSelected', true).length;
        }

        if (fieldCount > 16384) {
            popup.Alert(Localization.Warning_Title, Localization.ValidateExportExcel_ColumnLimit);
            return false;
        }

        if (Modernizr.touch && !!$.browser.safari
            && listHandler.IsGridHasBooleanColumn()
            && !jQuery.localStorage('remember_export_ipad')) {

            popup.Alert(Localization.Info, Localization.AlertWarningExportiPad, {
                session_name: 'remember_export_ipad'
            });
            popup.OnCloseCallback = function () {
                self.ExecuteExportListDisplay(e, options.NumberOfItem, options.FileName, options.SheetName);
            };
        }
        else {
            self.ExecuteExportListDisplay(e, options.NumberOfItem, options.FileName, options.SheetName);
        }
    };
    self.ExecuteExportListDisplay = function (e, limitRows, fileName, sheetName) {

        limitRows = limitRows === 0 ? userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_EXPORT_LINES) : limitRows;

        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CurrentPrepareToExportData, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            self.IsCancelExporting = true;
            self.CloseExportExcelPopup(e);
        };

        var exportOptions = self.GetDisplayExcelDefaultSettings();
        exportOptions.file_name = fileName;
        exportOptions.limit = limitRows;
        exportOptions.data_settings.setting_list = [
            {
                "id": "sheet_name",
                "value": sheetName
            },
            {
                "id": "enum_format",
                "value": "display"
            },
            {
                "id": "header_format",
                "value": jQuery('#HeaderFormatEnum').data('handler').value()
            },
            {
                "id": "add_angle_summary",
                "value": jQuery('#EnableSummarySheet').is(':checked')
            },
            {
                "id": "add_angle_definition",
                "value": jQuery('[id="EnableDefinitionSheet"]:visible').is(':checked')
            },
            {
                "id": "model_timestamp_index",
                "value": parseInt(self.CurrentExportModel.ModelTimestampIndex())
            },
        ];
        exportOptions.data_settings.setting_list = exportOptions.data_settings.setting_list.concat(self.DefaultSetting);
        self.GenerateExceljsonData = exportOptions;

        e.kendoWindow.element.closest('.popupExportExcel').addClass('alwaysHide');
        clearTimeout(fnCheckExportProgress);
        var request = resultModel.Data().uri + '/exports/?redirect=no';
        progressbarModel.SetProgressBarText(0, null, Localization.ProgressBar_CurrentRetrievingExcelFileFromApplicationServer);
        CreateDataToWebService(request, self.GenerateExceljsonData)
            .done(function (data) {
                progressbarModel.IsCancelPopup = false;
                self.GenerateExcelUri = data.uri;
                self.GenerateExcel(e);
            });
    };

    self.ExporSingleDrilldownItem = function (e, options) {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_CurrentPrepareToExportData, false);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            self.IsCancelExporting = true;
            self.CloseExportExcelPopup(e);
        };

        var headersText = [Localization.Source, Localization.Field, Localization.Value];
        if (userSettingModel.GetByName(enumHandlers.USERSETTINGS.SAP_FIELDS_IN_HEADER)) {
            headersText.push(Localization.TechnicalInfo);
        }

        var sortQuery = listDrilldownHandler.GetSortQuery();
        var facetsQuery = listDrilldownHandler.FacetModel.GetFacetQuery();

        self.GenerateExceljsonData = {
            "plugin": "msexcel",
            "file_name": options.FileName.substr(0, 39),
            "data_settings": {
                "setting_list": [
                    {
                        "id": "is_single_item",
                        "value": true
                    },
                    {
                        "id": "sheet_name",
                        "value": options.SheetName
                    },
                    {
                        "id": "add_angle_definition",
                        "value": jQuery('[id="EnableDefinitionSheet"]:visible').is(':checked')
                    },
                    {
                        "id": "headers_text",
                        "value": headersText
                    },
                    {
                        "id": "sort",
                        "value": sortQuery.sort
                    },
                    {
                        "id": "dir",
                        "value": sortQuery.dir
                    },
                    {
                        "id": "fq",
                        "value": jQuery.isEmptyObject(facetsQuery) ? "" : facetsQuery.fq
                    },
                    {
                        "id": "template_file",
                        "value": self.CurrentExportModel.TemplateFile()
                    }
                ]
            }
        };
        e.kendoWindow.element.closest('.popupExportExcel').addClass('alwaysHide');
        clearTimeout(fnCheckExportProgress);
        var request = resultModel.Data().uri + '/exports/?redirect=no';
        progressbarModel.SetProgressBarText(0, null, Localization.ProgressBar_CurrentRetrievingExcelFileFromApplicationServer);
        CreateDataToWebService(request, self.GenerateExceljsonData)
            .done(function (data) {
                progressbarModel.IsCancelPopup = false;
                self.GenerateExcelUri = data.uri;
                self.GenerateExcel(e);
            });

    };
    //EOF: Methods
}
