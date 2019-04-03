var eaPackageHandler = new EAPackageHandler();

function EAPackageHandler() {
    "use strict";

    var self = this;

    // BOF: Properties
    self.SelectedItems = [];

    self.ModelUris = [];
    self.ContainsOnlyPublicItems = false;
    self.FromTheSameModel = false;
    self.GeneratePackageUri = '';
    // EOF: Properties

    // BOF: Methods
    self.GetWarningMessage = function () {
        var message = '';

        if (!self.FromTheSameModel)
            message += '<div class="warningItem warningItemModel">' + Localization.AngleExport_TypePackage_WarningModel + '</div>';
        if (!self.ContainsOnlyPublicItems)
            message += '<div class="warningItem warningItemPrivate">' + Localization.AngleExport_TypePackage_WarningPrivate + '</div>';

        return !self.ContainsOnlyPublicItems || !self.FromTheSameModel ? message : '';
    };
    self.GetSelectData = function () {
        var ids = [];
        jQuery.each(self.SelectedItems, function (index, item) {
            ids.push(item.id);
        });
        return ids;
    };
    self.SetSelectedItems = function (items) {
        self.SelectedItems = [];
        self.ModelUris = [];
        self.ContainsOnlyPublicItems = true;
        self.FromTheSameModel = true;
        jQuery.each(ko.toJS(items), function (index, item) {
            //check if the item is angle/template
            if (item.type === enumHandlers.ITEMTYPE.DASHBOARD)
                return;

            // check for a warning message (private)
            if (!item.is_published)
                self.ContainsOnlyPublicItems = false;

            // check for a warning message (model)
            if (jQuery.inArray(item.model, self.ModelUris) === -1) {
                self.ModelUris.push(item.model);
                if (self.ModelUris.length > 1)
                    self.FromTheSameModel = false;
            }

            if (self.IsExportableItem(item.type, item.is_published))
                self.SelectedItems.push(item);
        });
    };
    self.StartExportAngle = function () {
        if (self.ValidateExportPackage()) {
            self.ExportAnglePackage(self.GetSelectData());
        }
    };
    self.CloseAngleExportPopup = jQuery.noop;

    self.IsNotPublishedAngle = function (itemType, isPublished) {
        return itemType === enumHandlers.ITEMTYPE.ANGLE && !isPublished;
    };
    self.IsExportableItem = function (itemType, isPublished) {
        return itemType !== enumHandlers.ITEMTYPE.DASHBOARD && isPublished;
    };
    self.GetPackageName = function () {
        var packageName = jQuery.trim(jQuery('#PackageName').val());
        if (!packageName)
            packageName = Localization.EAPackage;
        return packageName;
    };
    self.ValidateExportPackage = function () {
        jQuery('#PackageName, #PackageID, #PackageVersion').removeClass('k-invalid');

        if (!self.ValidatePackageName()) {
            return false;
        }

        if (!self.ValidatePackageId()) {
            return false;
        }

        if (!self.ValidatePackageVersion()) {
            return false;
        }

        return true;
    };
    self.ValidatePackageName = function () {
        if (!IsValidPackageName(self.GetPackageName())) {
            popup.Alert(Localization.Warning_Title, Localization.CreateEAPackageInvalidPackageName);
            jQuery('#PackageName').addClass('k-invalid');
            return false;
        }

        return true;
    };
    self.ValidatePackageId = function () {
        var packageId = jQuery.trim(jQuery('#PackageID').val());
        if (!packageId) {
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.ValidationForRequired, Localization.ID));
            jQuery('#PackageID').addClass('k-invalid');
            return false;
        }
        if (!IsValidPackageId(packageId)) {
            popup.Alert(Localization.Warning_Title, Localization.Info_InvalidPackageId);
            jQuery('#PackageID').addClass('k-invalid');
            return false;
        }

        return true;
    };
    self.ValidatePackageVersion = function () {
        var packageVersion = jQuery.trim(jQuery('#PackageVersion').val());
        if (!packageVersion) {
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.ValidationForRequired, Localization.Version));
            jQuery('#PackageVersion').addClass('k-invalid');
            return false;
        }
        if (!IsValidPackageVersion(packageVersion)) {
            popup.Alert(Localization.Warning_Title, Localization.Info_InvalidPackageVersion);
            jQuery('#PackageVersion').addClass('k-invalid');
            return false;
        }

        return true;
    };
    self.ExportAnglePackage = function (angleIds) {
        self.StartExportProgressBar();

        var query = self.GetExportAnglePackageQuery(angleIds);
        CreateDataToWebService('item_exports', query)
            .done(function (data) {
                self.ExportAnglePackageSuccess(data.uri);
            })
            .fail(function (xhr) {
                self.ExportAnglePackageFail(xhr.responseText);
            })
            .always(function () {
                self.ExportAnglePackageComplete();
            });
    };
    self.StartExportProgressBar = function () {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_ExportingEAPackage, false);
        progressbarModel.SetProgressBarText(0, null, Localization.ProgressBar_CurrentRetrievingPackageFileFromApplicationServer);
        progressbarModel.CancelCustomHandler = true;
        progressbarModel.CancelFunction = function () {
            WC.Ajax.AbortAll();
        };
        errorHandlerModel.Enable(false);
    };
    self.GetExportAnglePackageQuery = function (angleIds) {
        var model = modelsHandler.GetModelByUri(self.ModelUris[0]);
        var sortBy = WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT);
        if (sortBy === enumHandlers.SEARCHPARAMETER.RELEVANCY)
            sortBy = '';

        var query = {
            "source": "WebClient",
            "name": self.GetPackageName(),
            "version": jQuery.trim(jQuery("#PackageVersion").val()),
            "description": jQuery.trim(jQuery("#PackageDescription").val()),
            "package_id": jQuery.trim(jQuery("#PackageID").val()),
            "format": 'package',
            "model": model.id,
            "sort": sortBy,
            "dir": WC.Utility.UrlParameter(enumHandlers.SEARCHPARAMETER.SORT_DIR),
            "ids": angleIds.join(',')
        };

        return query;
    };
    self.ExportAnglePackageSuccess = function (uri) {
        progressbarModel.IsCancelPopup = false;
        self.GeneratePackageUri = uri;
        self.GeneratePackage();
    };
    self.ExportAnglePackageFail = function (responseText) {
        setTimeout(function () {
            popup.Alert(Localization.Warning_Title, JSON.parse(responseText).message);
            progressbarModel.IsCancelPopup = true;
            progressbarModel.EndProgressBar();
            self.CloseAngleExportPopup();
            searchPageHandler.ClearAllSelectedRows();
        }, 1000);
    };
    self.ExportAnglePackageComplete = function () {
        setTimeout(function () {
            errorHandlerModel.Enable(true);
        }, 1000);
    };
    self.GeneratePackage = function () {
        var uri = self.GeneratePackageUri;
        if (!progressbarModel.IsCancelPopup) {
            GetDataFromWebService(uri)
                .done(function (response) {
                    self.CheckGeneratePackageStatus(response);
                });
        }
        else {
            DeleteDataToWebService(uri);
        }
    };
    self.CheckGeneratePackageStatus = function (response) {
        progressbarModel.SetProgressBarText(kendo.toString(response.progress * 100, 'n0'), null, Localization.ProgressBar_CurrentRetrievingPackageFileFromApplicationServer);

        if (response.status === 'ready') {
            WC.Utility.DownloadFile(WC.Ajax.BuildRequestUrl(response.file, false));

            setTimeout(function () {
                self.DoneToGeneratePackage(false);
            }, 2000);
        }
        else if (response.status === 'failed') {
            popup.Error(Localization.Error_Title, response.message);
            self.DoneToGeneratePackage();
        }
        else {
            setTimeout(self.GeneratePackage, 2000);
        }
    };
    self.DoneToGeneratePackage = function (isDeleteProgress) {
        progressbarModel.IsCancelPopup = true;
        progressbarModel.EndProgressBar();
        self.CloseAngleExportPopup();
        searchPageHandler.ClearAllSelectedRows();
        if (isDeleteProgress !== false) {
            DeleteDataToWebService(self.GeneratePackageUri);
        }
    };
    // EOF: Methods
}
