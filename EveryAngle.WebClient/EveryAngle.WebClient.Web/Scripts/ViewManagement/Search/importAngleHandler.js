function ImportAngleHandler() {
    "use strict";
    
    var self = this;
    self.Data = ko.observableArray([]);
    self.SuccessItems = ko.observableArray([]);
    self.FailItems = ko.observableArray([]);
    self.OverwriteAngle = ko.observableArray([]);
    self.NumberOfUploadedFile = 0;
    self.UploadCount = 0;
    self.AllowedExtensions = ['.json', '.eapackage'];

    // use for mapping old and new Angles
    self.Angles = {};

    self.UploadAngleTemplate = [
        '<div class="popupTabPanel popupImportAngleContainer">',
            '<div class="row">',
                '<div class="field" data-bind="text: Localization.Model">' + Localization.Model + '</div>',
                '<div class="input"><div class="eaDropdown" id="ddlModelImportAngle"></div></div>',
            '</div>',
            '<div class="row rowUpload">',
                '<div class="input"><input name="file" id="ImportAngle" type="file" value="import angle" accept="' + self.AllowedExtensions.join(',') + '"/></div>',
            '</div>',
        '</div>'
    ].join('');

    self.CompleteUploadReportTemplate = [
        '<strong data-bind="text: $root.GetUploadMessage()"></strong>',
        '<br>',
        '<br>',
        '<ul data-bind="foreach: $root.SuccessItems()">',
            '<!-- ko if: ErrorMessage -->',
            '<li class="fail" data-bind="html: Name + \'<em>\' + ErrorMessage + \'</em>\'"></li>',
            '<!-- /ko -->',
        '</ul>',
        '<ul data-bind="foreach: $root.FailItems()">',
            '<li class="fail" data-bind="html: Name + \'<em>\' + ErrorMessage + \'</em>\'"></li>',
        '</ul>'
    ].join('');

    self.GetUploadMessage = function () {
        var numberOfSuccess = self.SuccessItems().length;
        var numberOfFail = self.FailItems().length;
        return kendo.format(Localization.UploadAngles_SuccessfulMessage, numberOfSuccess, numberOfSuccess + numberOfFail);
    };

    self.ShowImportAnglePopup = function () {
        var popupName = 'ImportAngle',
            popupSettings = {
                width: 420,
                height: 150,
                minHeight: 150,
                title: Localization.UploadAngles,
                html: self.UploadAngleTemplate,
                element: '#popup' + popupName,
                className: 'popup' + popupName,
                resizable: false,
                actions: ["Close"],
                open: self.ShowImportAnglePopupCallback,
                close: popup.Destroy
            };

        var win = popup.Show(popupSettings);

        // M4-33531: fixed safari issue
        win.wrapper.height(popupSettings.height);
        win.center();
    };

    self.ShowImportAnglePopupCallback = function () {

        self.SetModelsDropdown();
        var models = modelsHandler.GetData();

        jQuery('#ImportAngle').kendoUpload({
            multiple: true,
            async: {
                saveUrl: WC.HtmlHelper.GetInternalUri('importitem', 'search'),
                autoUpload: true
            },
            showFileList: false,
            success: self.UploadSuccess,
            complete: self.UploadComplete,
            enabled: models && models.length === 1,
            select: self.SelectFileUpload,
            progress: self.OnProgress,
            localization: {
                select: Localization.UploadAngles_SelectFile
            }
        });
    };

    self.SetModelsDropdown = function () {
        var availableModels = [];
        var element = '#ddlModelImportAngle';
        var dropdownlistOptions = {
            dataTextField: 'short_name',
            dataValueField: 'uri',
            enabled: false,
            change: self.ChangeModelDropdown
        };

        if (!modelsHandler.HasData()) {
            availableModels.unshift({ short_name: Localization.NoModelAvaliable, uri: '' });
            WC.HtmlHelper.DropdownList(element, availableModels, dropdownlistOptions);
        }
        else {
            var models = modelsHandler.GetData();
            availableModels = ko.toJS(models);
            if (availableModels.length > 1)
                availableModels.unshift({ short_name: Localization.PleaseSelect, uri: '' });

            var dropdownlist = WC.HtmlHelper.DropdownList(element, [], dropdownlistOptions);
            dropdownlist.setDataSource(availableModels);
            dropdownlist.enable(true);
            dropdownlist.value(availableModels[0].uri);
        }
        return availableModels;
    };

    self.ChangeModelDropdown = function () {
        var modelUri = WC.HtmlHelper.DropdownList('#ddlModelImportAngle').value();
        var upload = jQuery("#ImportAngle").data("kendoUpload");
        var enableUpload = WC.Utility.ToBoolean(modelUri);
        upload.enable(enableUpload);
        return enableUpload;
    };

    self.ShowCompleteUploadReport = function () {
        var popupName = 'CompleteUploadReport';
        var popupSettings = {
            width: 700,
            height: 400,
            title: Localization.UploadAnglesReport,
            html: self.CompleteUploadReportTemplate,
            element: '#popup' + popupName,
            className: 'popup' + popupName,
            close: popup.Destroy
        };

        popup.Show(popupSettings);
        WC.HtmlHelper.ApplyKnockout(self, jQuery('#popupCompleteUploadReport'));
        popup.Close('#popupImportAngle');
    };

    self.SetAngleForUpload = function (angle, modelUri) {
        // angle
        var validAngleProperties = [
            'assigned_labels',
            'multi_lang_name',
            'multi_lang_description',
            'query_definition',
            'display_definitions'
        ];
        jQuery.each(angle, function (name) {
            if (jQuery.inArray(name, validAngleProperties) === -1)
                delete angle[name];
        });
        self.RemoveDenyLabel(angle, modelUri);
        angle.is_published = false;
        angle.is_template = false;
        angle.is_validated = false;
        angle.model = modelUri;

        // displays
        var validDisplayProperties = [
            'id',
            'display_type',
            'is_angle_default',
            'multi_lang_name',
            'multi_lang_description',
            'display_details',
            'query_blocks',
            'fields'
        ];
        jQuery.each(angle.display_definitions, function (index, display) {
            jQuery.each(display, function (name) {
                if (jQuery.inArray(name, validDisplayProperties) === -1)
                    delete display[name];
            });
            display.is_public = false;
        });

        // angle_default_display
        var defaultDisplay = angle.display_definitions.findObject('is_angle_default', true);
        if (defaultDisplay)
            angle.angle_default_display = defaultDisplay.id;
    };

    self.SetDashboardForUpload = function (dashboard, modelUri) {
        // dashboard
        var validDashboardProperties = [
            'assigned_labels',
            'filters',
            'layout',
            'multi_lang_name',
            'multi_lang_description',
            'widget_definitions'
        ];
        jQuery.each(dashboard, function (name, value) {
            if (jQuery.inArray(name, validDashboardProperties) === -1)
                delete dashboard[name];
        });
        self.RemoveDenyLabel(dashboard, modelUri);
        dashboard.is_published = false;
        dashboard.is_validated = false;
        dashboard.model = modelUri;

        // widgets
        var validWidgetProperties = [
            'id',
            'angle',
            'display',
            'multi_lang_name',
            'multi_lang_description',
            'widget_details',
            'widget_type'
        ];
        jQuery.each(dashboard.widget_definitions, function (index, widget) {
            jQuery.each(widget, function (name) {
                if (jQuery.inArray(name, validWidgetProperties) === -1)
                delete widget[name];
            });

            var widgetDetails = WC.Utility.ParseJSON(widget.widget_details);
            widgetDetails.model = modelUri;
            widget.widget_details = JSON.stringify(widgetDetails);

            // mapping with old Angle
            var widgetAngleId = widget.angle;
            var widgetDisplayId = widget.display;
            var sourceInfo = self.Angles[widgetAngleId];
            delete widget.angle;
            delete widget.display;
            if (sourceInfo && sourceInfo.displays[widgetDisplayId]) {
                widget.angle = sourceInfo.uri;
                widget.display = sourceInfo.displays[widgetDisplayId];
            }
        });
    };

    self.RemoveDenyLabel = function (angle, modelUri) {
        var labels = WC.Utility.ToArray(angle.assigned_labels);
        var modelPrivilege = userModel.GetModelPrivilegeByUri(modelUri);
        jQuery.each(modelPrivilege.label_authorizations, function (key, privilege) {
            if (privilege === 'deny') {
                labels = jQuery.grep(labels, function (value) { return value !== key; });
            }
        });
        if (!labels.length)
            labels = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES);

        angle.assigned_labels = labels;
    };

    self.GetUploadAngleUri = function (modelUri) {
        var uri = modelUri + '/angles';
        var query = {};
        query[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        query[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        return uri + '?' + jQuery.param(query);
    };

    self.GetUploadDashboardUri = function () {
        var uri = '/dashboards';
        var query = {};
        query[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        query[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        return uri + '?' + jQuery.param(query);
    };

    self.UploadSuccess = function (e) {
        var file = {
            Name: e.files[0].name,
            Results: [],
            ErrorMessage: ''
        };
        var response = e && e.response ? e.response : {};

        if (response.Result) {
            var modelUri = WC.HtmlHelper.DropdownList('#ddlModelImportAngle').value();
            if (response.Result.type === AngleExportHandler.ANGLEEXPORTTYPE.DONWLOAD)
                self.UploadIndividualAngle(e, modelUri, file);
            else
                self.UploadPackageItems(e, modelUri, file);
        }
        else {
            if (response.ErrorMessage)
                file.ErrorMessage = response.ErrorMessage;
            else
                file.ErrorMessage = Localization.UploadAngles_InvalideUploadedFile;

            self.FailItems.push(file);
            self.UploadCount++;
            self.UpdateProgressBar(file.Name);
        }
    };

    self.UpdateProgressBar = function (fileName) {
        progressbarModel.SetProgressBarText(self.UploadCount / self.NumberOfUploadedFile * 100, null);
        var displayFileName = fileName;
        if (fileName.length > 55) {
            // show 55 chars
            displayFileName = fileName.substr(0, 37) + '...' + fileName.substr(fileName.length - 15);
        }
        var progressText = kendo.format('{0}<br>{1}', Localization.ProgressBar_UploadingAngles, displayFileName);
        jQuery('#ProgressText').html(progressText);
    };

    self.CreateItem = function (uri, item, file, type) {
        var name = WC.Utility.GetDefaultMultiLangText(item.multi_lang_name);
        return CreateDataToWebService(uri, item)
            .fail(function (e, status, error) {
                var errorMessage = self.GetErrorMessage(e, error);
                file.Results.push({ name: name, type: type, error: errorMessage });
            })
            .done(function () {
                file.Results.push({ name: name, type: type });
            });
    };

    self.CreateAngle = function (angle, modelUri, file) {
        var sourceId = angle.id;
        var uri = self.GetUploadAngleUri(modelUri);
        self.SetAngleForUpload(angle, modelUri);
        return self.CreateItem(uri, angle, file, enumHandlers.ITEMTYPE.ANGLE)
            .done(function (data) {
                self.CreateMappingAngle(sourceId, data);
            });
    };

    self.CreateMappingAngle = function (sourceId, angle) {
        if (!sourceId)
            return;

        self.Angles[sourceId] = {
            uri: angle.uri,
            displays: {}
        };
        jQuery.each(angle.display_definitions, function (index, display) {
            self.Angles[sourceId].displays[display.id] = display.uri;
        });
    };

    self.CreateDashboard = function (dashboard, modelUri, file) {
        var uri = self.GetUploadDashboardUri(modelUri);
        self.SetDashboardForUpload(dashboard, modelUri);
        
        if (dashboard.widget_definitions.length > maxNumberOfDashboard) {
            var name = WC.Utility.GetDefaultMultiLangText(dashboard.multi_lang_name);
            file.Results.push({ name: name, type: enumHandlers.ITEMTYPE.DASHBOARD, error: Localization.UploadAngles_ItemPackageDashboardsExceedMaximum });
            return jQuery.Deferred().reject().promise();
        }
        else {
            return self.CreateItem(uri, dashboard, file, enumHandlers.ITEMTYPE.DASHBOARD);
        }
    };

    self.UploadIndividualAngle = function (e, modelUri, file) {
        self.UpdateProgressBar(file.Name);
        self.CreateAngle(e.response.Result.angle, modelUri, file)
            .fail(function (e, status, error) {
                var errorMessage = self.GetErrorMessage(e, error);
                file.ErrorMessage = errorMessage;
                self.FailItems.push(file);
            })
            .done(function () {
                self.SuccessItems.push(file);
            })
            .always(function () {
                self.UploadCount++;
                self.UpdateProgressBar(file.Name);
            });
    };

    self.UploadPackageItems = function (e, modelUri, file) {
        self.UpdateProgressBar(file.Name);
        self.UploadPackageAngles(e.response.Result.angles, modelUri, file)
            .then(function () {
                return self.UploadPackageDashboards(e.response.Result.dashboards, modelUri, file);
            })
            .done(function () {
                var report = self.GetUploadPackageItemsReport(file);
                file.Name = kendo.format(Localization.UploadAngles_ItemPackageReportTitle,
                    file.Name,
                    report[enumHandlers.ITEMTYPE.ANGLE],
                    report.total_angles,
                    report[enumHandlers.ITEMTYPE.DASHBOARD],
                    report.total_dashboards);
                file.ErrorMessage = report.errors.join('<br>');

                var totolItems = report.total_angles + report.total_dashboards;
                if (report.errors.length < totolItems) {
                    self.SuccessItems.push(file);
                }
                else {
                    self.FailItems.push(file);
                }
            })
            .always(function () {
                self.UploadCount++;
                self.UpdateProgressBar(file.Name);
            });
    };
    self.GetUploadPackageItemsReport = function (file) {
        var report = {
            errors: [],
            total_angles: file.Results.findObjects('type', enumHandlers.ITEMTYPE.ANGLE).length,
            total_dashboards: file.Results.findObjects('type', enumHandlers.ITEMTYPE.DASHBOARD).length
        };
        report[enumHandlers.ITEMTYPE.ANGLE] = 0;
        report[enumHandlers.ITEMTYPE.DASHBOARD] = 0;
        jQuery.each(file.Results, function (index, result) {
            if (result.error) {
                report.errors.push(kendo.format('[{0}] {1}, {2}', result.type, result.name, result.error));
            }
            else {
                report[result.type]++;
            }
        });
        return report;
    };

    self.UploadPackageAngles = function (angles, modelUri, file) {
        var deferred = [];
        jQuery.each(angles, function (index, angle) {
            deferred.pushDeferred(self.CreateAngle, [angle, modelUri, file]);
        });
        return jQuery.whenAllSet(deferred, 5);
    };

    self.UploadPackageDashboards = function (dashboards, modelUri, file) {
        var deferred = [];
        jQuery.each(dashboards, function (index, dashboard) {
            deferred.pushDeferred(self.CreateDashboard, [dashboard, modelUri, file]);
        });
        return jQuery.whenAllSet(deferred, 5);
    };

    self.GetErrorMessage = function (e, error) {
        if (error === 'abort')
            return 'cancelled';
        else if (e.responseJSON)
            return e.responseJSON.message;
        else
            return e.responseText;
    };

    self.UploadComplete = function() {
        var showCompleteReport = setInterval(function () {
            if (self.UploadCount >= self.NumberOfUploadedFile) {
                errorHandlerModel.Enable(true);
                progressbarModel.CancelCustomHandler = false;
                progressbarModel.EndProgressBar();
                self.ShowCompleteUploadReport();
                
                searchModel.ClearSelectedRow();
                setTimeout(function () {
                    searchPageHandler.BindSearchResultGrid(0);
                }, 500);
                clearInterval(showCompleteReport);
            }
        }, 100);
    };

    self.SelectFileUpload = function(e) {
        errorHandlerModel.Enable(false);
        self.SuccessItems([]);
        self.FailItems([]);
        self.UploadCount = 0;
        self.NumberOfUploadedFile = e.files.length;
        self.Angles = {};

        // check file extensions
        var files = [];
        jQuery.each(e.files, function (index, file) {
            if (jQuery.inArray(file.extension, self.AllowedExtensions) !== -1) {
                files.push(file);
            }
            else {
                self.UploadCount++;
                self.FailItems.push({
                    Name: file.name,
                    ErrorMessage: Localization.UploadAngles_InvalideExtension
                });
            }
        });
        e.files = files;

        if (!e.files.length) {
            self.UploadComplete();
            e.preventDefault();
            return;
        }

        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_UploadingAngles, false);
        progressbarModel.SetProgressBarText(0, null, Localization.ProgressBar_UploadingAngles);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            WC.Ajax.AbortAll();
        };
    };
}
var importAngleHandler = new ImportAngleHandler();