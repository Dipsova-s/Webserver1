var angleExportHandler = new AngleExportHandler(new AngleDownloadHandler());

function AngleExportHandler(angleDownloadHandler) {
    "use strict";

    var self = this;
    var _self = {};

    // BOF: Properties
    _self.angleDownloadHandler = angleDownloadHandler;
    
    self.Handler = ko.observable(_self.angleDownloadHandler);
    // EOF: Properties

    // BOF: Methods
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
    self.CanDownloadAngle = function () {
        return true;
    };
    self.GetDownloadAnglesCount = function () {
        return _self.angleDownloadHandler.SelectedItems.length;
    };
    self.StartExportAngle = function () {
        self.Handler().StartExportAngle();
    };
    // EOF: Methods

    // contructor
    _self.angleDownloadHandler.CloseAngleExportPopup = self.CloseAngleExportPopup;
}
