var importAngleHandler = new ImportAngleHandler();
function ImportAngleHandler() {
    "use strict";

    var self = this;
    self.Data = ko.observableArray([]);
    self.SuccessAngles = ko.observableArray([]);
    self.FailAngles = ko.observableArray([]);
    self.OverwriteAngle = ko.observableArray([]);
    self.NumberOfUploadedFile = 0;
    self.UploadCount = 0;

    self.UploadAngleTemplate = [
        '<div class="popupTabPanel popupImportAngleContainer">',
            '<div class="row">',
                '<div class="field" data-bind="text: Localization.Model">' + Localization.Model + '</div>',
                '<div class="input"><div class="eaDropdown" id="ddlModelImportAngle"></div></div>',
            '</div>',
            '<div class="row rowUpload">',
                '<div class="input"><input name="ImportAngle" id="ImportAngle" type="file" value="import angle" accept=".angle.json"/></div>',
            '</div>',
        '</div>'
    ].join('');

    self.CompleteUploadReportTemplate = [
        '<strong data-bind="text: $root.GetUploadMessage()"></strong>',
        '<br>',
        '<br>',
        '<ul data-bind="foreach: $root.FailAngles()">',
            '<li class="fail" data-bind="html: Name + \'<em>\' + ErrorMessage + \'</em>\'"></li>',
        '</ul>'
    ].join('');

    self.GetUploadMessage = function () {
        var numberOfSuccess = self.SuccessAngles().length;
        var numberOfFail = self.FailAngles().length;
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

        $("#ImportAngle").kendoUpload({
            multiple: true,
            async: {
                saveUrl: WC.HtmlHelper.GetInternalUri('ImportAngle', 'search'),
                autoUpload: true
            },
            showFileList: false,
            success: self.UploadSuccess,
            complete: self.UploadComplete,
            enabled: (models && models.length === 1),
            select: self.SelectFileUpload,
            progress: self.OnProgress,
            localization: {
                select: Localization.UploadAngles_SelectFile
            }
        });

        self.SuccessAngles([]);
        self.FailAngles([]);
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
        var enableUpload;
        var modelUri = WC.HtmlHelper.DropdownList('#ddlModelImportAngle').value();
        var upload = $("#ImportAngle").data("kendoUpload");
        if (modelUri !== '') {
            enableUpload = true;
            upload.enable();
        }
        else {
            upload.enable(false);
            enableUpload = false;
        }
        return enableUpload;
    };

    self.ShowCompleteUploadReport = function () {
        var popupName = 'CompleteUploadReport',
            popupSettings = {
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
        var importAnglePopup = jQuery("#popupImportAngle").data("kendoWindow");
        importAnglePopup.destroy();
    };

    self.SetAngleForUpload = function (angle, modelUri) {
        angle = self.RemoveDenyLabel(angle, modelUri);
        angle.is_published = false;
        angle.is_template = false;
        angle.is_validated = false;
        angle.model = modelUri;

        var defaultDisplay = (angle.display_definitions) ? angle.display_definitions.findObject('is_angle_default', true) : null;
        if (defaultDisplay)
            angle.angle_default_display = defaultDisplay.id;

        return angle;
    };

    self.RemoveDenyLabel = function (angle, modelUri) {
        if (angle.assigned_labels) {
            var modelPrivilege = userModel.GetModelPrivilegeByUri(modelUri);
            jQuery.each(modelPrivilege.label_authorizations, function (key, privilege) {
                if (privilege === "deny") {
                    angle.assigned_labels = jQuery.grep(angle.assigned_labels, function (value) { return value !== key; });
                }
            });
        }
        if (!angle.assigned_labels || angle.assigned_labels.length === 0)
            angle.assigned_labels = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES);

        return angle;
    };

    self.GetUploadAngleUri = function (modelUri) {
        var uri = modelUri + '/angles';
        var query = {};
        query[enumHandlers.PARAMETERS.REDIRECT] = 'no';
        query[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
        query[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
        return uri + '?' + jQuery.param(query);
    };

    self.UploadSuccess = function (e) {
        var file = {
            Name: e.files[0].name,
            Angle: {},
            ErrorMessage: ''
        };

        if (e && e.response && e.response.Result) {
            self.UploadAngleToWebService(e, file);
        }
        else {
            if (e && e.response && e.response.ErrorMessage)
                file.ErrorMessage = e.response.ErrorMessage;
            else
                file.ErrorMessage = Localization.UploadAngles_InvalideUploadedFile;

            self.FailAngles.push(file);
            self.UploadCount++;
            progressbarModel.SetProgressBarText(self.UploadCount / self.NumberOfUploadedFile * 100, null, Localization.ProgressBar_UploadingAngles);
        }
    };

    self.UploadAngleToWebService = function (e, file) {
        var modelUri = WC.HtmlHelper.DropdownList('#ddlModelImportAngle').value();
        var fileName = e.files[0].name;
        var angle = e.response.Result.angle;
        var uri = self.GetUploadAngleUri(modelUri);

        angle = self.SetAngleForUpload(angle, modelUri, fileName);
        file.Angle = angle;

        CreateDataToWebService(uri, angle)
            .fail(function (e, status, error) {
                file.ErrorMessage = self.GetErroMessage(e, error);
                self.FailAngles.push(file);
            })
            .done(function () {
                self.SuccessAngles.push(file);
            })
            .always(function () {
                self.UploadCount++;
                progressbarModel.SetProgressBarText(self.UploadCount / self.NumberOfUploadedFile * 100, null, Localization.ProgressBar_UploadingAngles);
            });
    };

    self.GetErroMessage = function (e, error) {
        var ErrorMessage;
        if (error === 'abort')
            ErrorMessage = 'cancelled';
        else if (e.responseJSON)
            ErrorMessage = e.responseJSON.message;
        else
            ErrorMessage = e.responseText;
        return ErrorMessage;
    };

    self.UploadComplete = function() {
        var showCompleteReport = setInterval(function () {
            if (self.UploadCount >= self.NumberOfUploadedFile) {
                errorHandlerModel.Enable(true);
                progressbarModel.CancelCustomHandler = false;
                progressbarModel.EndProgressBar();
                self.ShowCompleteUploadReport();

                if (self.SuccessAngles().length > 0) {
                    searchModel.ClearSelectedRow();
                    setTimeout(function () {
                        searchPageHandler.BindSearchResultGrid(0);
                    }, 500);
                }
                clearInterval(showCompleteReport);
            }
        }, 100);
    };

    self.SelectFileUpload = function(e) {
        errorHandlerModel.Enable(false);
        self.UploadCount = 0;
        self.NumberOfUploadedFile = (e && e.files) ? e.files.length : 0;

        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_UploadingAngles, false);
        progressbarModel.SetProgressBarText(0, null, Localization.ProgressBar_UploadingAngles);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            WC.Ajax.AbortAll();
        };
    };
};