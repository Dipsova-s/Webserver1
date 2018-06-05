var angleExportHtmlTemplate = function () {
    return [
        '<div class="popupTabPanel" id="CreateEAPackageArea">',
            '<div class="row rowExportTypeDownload" data-bind="text: kendo.format(Localization.AngleExport_DownloadAngleConfirmation, $root.GetDownloadAnglesCount())"></div>',
        '</div>'
    ].join('');
};
