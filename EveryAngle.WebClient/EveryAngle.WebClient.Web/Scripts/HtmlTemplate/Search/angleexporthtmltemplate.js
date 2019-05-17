var angleExportHtmlTemplate = function () {
    return [
        '<div class="popupTabPanel" id="CreateEAPackageArea">',

        '<div class="row rowExportType" data-bind="visible: $root.CanExportPackage() && $root.SelectType() === $root.SELECTTYPE.ANGLE">',
        '<div class="field" data-bind="text: Localization.Download_Type"></div>',
        '<div class="input">',
        '<label>',
        '<input id="AngleExportTypeDownload" type="radio" name="AngleExportType" value="download" data-bind="checked: $root.AngleExportType, enable: $root.CanDownloadAngle()" />',
        '<span class="label" data-bind="text: Captions.AngleExport_TypeDownload"></span>',
        '</label>',
        '<label>',
        '<input id="AngleExportTypePackage" type="radio" name="AngleExportType" value="package" data-bind="checked: $root.AngleExportType, enable: $root.CanExportPackage()" />',
        '<span class="label" data-bind="text: Captions.AngleExport_TypePackage"></span>',
        '</label>',
        '</div>',
        '</div>',

        '<div data-bind="css: $root.GetRowExportTypeCss(), visible: $root.AngleExportType() === AngleExportHandler.ANGLEEXPORTTYPE.PACKAGE && $root.IsAllPublish()">',
        '<div class="row">',
        '<div class="field" data-bind="text: Localization.Name"></div>',
        '<div class="input">',
        '<input id="PackageName" class="eaText" type="text" maxlength="50" />',
        '</div>',
        '</div>',
        '<div class="row">',
        '<div class="field" data-bind="text: Localization.ID"></div>',
        '<div class="input">',
        '<input id="PackageID" class="eaText" type="text" maxlength="50" data-bind="attr: { placeholder: Captions.Label_AngleExport_PackageId }" />',
        '<span data-bind="text: Localization.Version" /> ',
        '<input id="PackageVersion" class="eaText" type="text" maxlength="50" />',
        '</div>',
        '</div>',
        '<div class="row">',
        '<div class="field" data-bind="text: Localization.Description"></div>',
        '<div class="input">',
        '<textarea id="PackageDescription" maxlength="200" class="eaText" rows="4"></textarea>',
        '</div>',
        '</div>',
        '</div>',

        '<!-- ko if: $root.WarningTitle() -->',

        '<div class="popupNotification ">',
        '<div class="notificationIcon alert"></div>',
        '<div class="notificationMessages">',
        '<div class="row" data-bind="text: $root.WarningTitle()"></div>',
        '<!-- ko if: $root.WarningDesc() -->',
        '<div class="row" data-bind="text: $root.WarningDesc()"></div>',
        '<!-- /ko -->',
        '<div class="row" data-bind="text: Localization.AngleExport_TypePackage_Download_Angle_Individually"></div>',
        '</div>',
        '</div>',

        '<!-- /ko -->',

        '</div>'
    ].join('');
};
