function AngleBreadcrumbHandler() {
    "use strict";

    var self = this;
    self.IconAngle = 'icon icon-angle icon-breadcrumb-front';
    self.IconTemplate = 'icon icon-template icon-breadcrumb-front';

    self.GetAngleViewModel = function (angleName, validated, template) {
        var url = self.GetAngleUrl();
        var data = self.GetItemViewModel(angleName, validated);
        data.frontIcon(template ? self.IconTemplate : self.IconAngle);
        if (url) {
            data.url(url);
        }
        else {
            data.hasEditIcon(true);
            data.click = self.ShowEditPopup;
        }
        return data;
    };
    self.GetAngleUrl = function () {
        if (!WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN))
            return '';

        var query = {};
        var angleUri, displayUri;
        jQuery.each(jQuery.address.parameterNames(), function (index, name) {
            if (name === enumHandlers.ANGLEPARAMETER.ANGLE)
                angleUri = WC.Utility.UrlParameter(name);
            else if (name === enumHandlers.ANGLEPARAMETER.DISPLAY)
                displayUri = WC.Utility.UrlParameter(name);
            else if (name !== enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)
                query[name] = WC.Utility.UrlParameter(name);
        });
        return WC.Utility.GetAnglePageUri(angleUri, displayUri, query);
    };
    self.ShowEditPopup = jQuery.noop;

    self.GetDrilldownViewModel = function (listDrilldown, modelUri) {
        var title = self.GetDrilldownResultLabel(listDrilldown.ObjectType, modelUri);
        var data = self.GetDefaultViewModel(title);
        return data;
    };
    self.GetDrilldownResultLabel = function (classId, modelUri) {
        var name = modelClassesHandler.GetClassName(classId, modelUri, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
        return kendo.format('{0} "{1}"', Localization.CellPopupMenuDrillDownTo, name);
    };
}
AngleBreadcrumbHandler.extend(BreadcrumbHandler);
var angleBreadcrumbHandler = new AngleBreadcrumbHandler();
