function AngleExportHandler(angleDownloadHandler, eaPackageHandler) {
    "use strict";

    var self = this;
    var _self = {};

    // BOF: Properties
    _self.angleDownloadHandler = angleDownloadHandler;
    _self.eaPackageHandler = eaPackageHandler;

    self.IsPackageVisible = ko.observable(true);
    self.Handler = ko.observable(_self.angleDownloadHandler);
    
    self.AngleExportType = ko.observable(AngleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD);

    self.SELECTTYPE = {
        ANGLE: 'angle_only',
        DASHBOARD: 'dashboard_only',
        BOTH: 'angle_and_dashboard',
        NONE: 'none'
    };
    self.SelectType = ko.observable(self.SELECTTYPE.NONE);
    self.IsAllPublish = ko.observable(true);
    self.IsAllSameModel = ko.observable(true);
    self.WarningTitle = ko.observable("");
    self.WarningDesc = ko.observable("");
    // EOF: Properties

    // BOF: Methods
    self.OnChangeAngleExportType = function (newValue) {
        if (newValue === AngleExportHandler.ANGLEEXPORTTYPE.PACKAGE)
            self.Handler(_self.eaPackageHandler);
        else
            self.Handler(_self.angleDownloadHandler);
    };
    self.CheckIsAllSameModel = function (items) {
        var models = items.map(function (item) { return item.model; });
        var distinctModels = models.filter(function (value, index, arr) {
            return arr.indexOf(value) === index;
        });

        return distinctModels.length === 1;
    };

    self.SetSelectTypeByItems = function (items) {
        var hasDashboard = items.hasObject('type', enumHandlers.ITEMTYPE.DASHBOARD);
        var hasAngle = items.hasObject('type', enumHandlers.ITEMTYPE.ANGLE);
        if (hasDashboard && hasAngle)
            self.SelectType(self.SELECTTYPE.BOTH);
        else if (hasDashboard)
            self.SelectType(self.SELECTTYPE.DASHBOARD);
        else
            self.SelectType(self.SELECTTYPE.ANGLE);
    };

    self.IsDownloadable = function (selectType, isAllSameModel, isAllPublish, hasPrivilege) {
        self.WarningTitle('');
        self.WarningDesc('');

        if (selectType === self.SELECTTYPE.ANGLE) {
            if (!hasPrivilege) {
                self.WarningTitle(Localization.AngleExport_TypePackage_Angle_ManageRequired);
            }

            if (!isAllSameModel) {
                self.WarningTitle(Localization.AngleExport_TypePackage_Angle_MultipleModel);
            }

            if (!isAllPublish) {
                self.WarningTitle(Localization.AngleExport_TypePackage_Angle_Private);
            }

            self.AngleExportType(AngleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD);
            return true;
        }
        else {
            popup.Alert(Localization.CreateEAPackage, Localization.AngleExport_WarningNoExportItem, Localization.Ok);
            return false;
        }
    };
    self.ShowAngleExportPopup = function () {
        if (self.ValidateAngleExport()) {
            var popupSettings = self.GetAngleExportSettings();
            popup.Show(popupSettings);
        }
    };
    self.ShowAngleExportPopupCallback = function (e) {
        self.InitialHandler(e);
        self.ApplyHandler(e);
    };
    self.InitialHandler = function (e) {
        _self.angleDownloadHandler.SetSelectedItems(searchModel.SelectedItems()); 
        _self.eaPackageHandler.SetSelectedItems(searchModel.SelectedItems());

        e.sender.element.busyIndicator(true);
        e.sender.element.find('.k-loading-color').css({
            'opacity': 1,
            'background-color': '#efefef'
        });
    };
    self.ValidateAngleExport = function () {
        if (!self.CanAngleExport()) {
            self.CloseAngleExportPopup();
            popup.Alert(Localization.Warning_Title, Localization.AngleExport_WarningNoExportItem);
            return false;
        }
        else {
            return true;
        }
    };
    self.ApplyHandler = function (e) {
        jQuery('#PackageName').val('AngleExport');
        jQuery('#PackageID').val('');
        jQuery('#PackageVersion').val('1.0');
        jQuery('#PackageDescription').val('');

        jQuery('#PackageName').on('change keyup', function () {
            jQuery('#PackageID').val(jQuery(this).val().replace(/\W*/ig, ''));
        })
            .trigger('change');

        e.sender.element.busyIndicator(false);
        e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');

        WC.HtmlHelper.ApplyKnockout(self, e.sender.element);
    };
    self.GetAngleExportSettings = function () {
        var popupName = 'CreateEaPackagePopup';
        return {
            title: Localization.CreateEAPackage,
            element: '#popup' + popupName,
            actions: ['Close'],
            resizable: false,
            html: angleExportHtmlTemplate(),
            width: 500,
            minHeight: 100,
            className: 'popup' + popupName,
            open: self.ShowAngleExportPopupCallback,
            close: popup.Destroy,
            buttons: self.GetAngleExportButtons()
        };
    };
    self.GetAngleExportButtons = function () {
        return [
            {
                text: Captions.Button_Cancel,
                position: 'right',
                click: 'close'
            },
            {
                text: Localization.Ok,
                position: 'right',
                className: 'executing',
                isPrimary: true,
                click: self.SubmitAngleExport
            }
        ];
    };
    self.SubmitAngleExport = function (e, obj) {
        if (popup.CanButtonExecute(obj)) {
            self.StartExportAngle();
        }
    };
    self.CloseAngleExportPopup = function () {
        popup.Close('#popupCreateEaPackagePopup');
    };
    self.CanAngleExport = function () {
        var items = ko.toJS(searchModel.SelectedItems());
        return !items.hasObject('type', enumHandlers.ITEMTYPE.DASHBOARD);
    };
    self.GetAllWarningMessages = function () {
        return _self.angleDownloadHandler.GetWarningMessage() + (self.IsPackageVisible() ? _self.eaPackageHandler.GetWarningMessage() : '');
    };
    self.CanDownloadAngle = function () {
        return true;
    };
    self.CanExportPackage = function () {
        return self.IsAllSameModel() && self.IsAllPublish() && self.IsPackageVisible();
    };
    self.GetDownloadAnglesCount = function () {
        return _self.angleDownloadHandler.SelectedItems.length;
    };
    self.StartExportAngle = function () {
        self.Handler().StartExportAngle();
    };
    self.GetRowExportTypeCss = function () {
        if (self.SelectType() === self.SELECTTYPE.ANGLE) {
            return 'rowExportTypePackage';
        }
        return '';
    };
    // EOF: Methods

    // contructor
    self.AngleExportType.subscribe(self.OnChangeAngleExportType);
    _self.angleDownloadHandler.CloseAngleExportPopup = self.CloseAngleExportPopup;
    _self.eaPackageHandler.CloseAngleExportPopup = self.CloseAngleExportPopup;
}

AngleExportHandler.ANGLEEXPORTTYPE = {
    DOWNLOAD: 'download',
    PACKAGE: 'package'
};

var angleExportHandler = new AngleExportHandler(new AngleDownloadHandler(), new EAPackageHandler());