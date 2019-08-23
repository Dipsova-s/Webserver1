function AngleBreadcrumbHandler() {
    "use strict";

    var self = this;

    self.GetAngleViewModel = function (angleName, isValidated) {
        var angleViewModel = self.GetItemViewModel(angleName, isValidated);
        angleViewModel.url(self.GetAngleUrl());
        return angleViewModel;
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

    self.GetDrilldownViewModel = function (listDrilldown, modelUri) {
        var viewModel = new BreadcrumbViewModel();
        viewModel.frontIcon(self.IconChevron);
        viewModel.label(self.GetDrilldownResultLabel(listDrilldown.ObjectType, modelUri));
        return viewModel;
    };

    self.GetDrilldownResultLabel = function (classId, modelUri) {
        var object = modelClassesHandler.GetClassById(classId, modelUri) || { id: classId };
        return kendo.format('{0} "{1}"', Localization.CellPopupMenuDrillDownTo, object.short_name || object.id);
    };
}
AngleBreadcrumbHandler.extend(BreadcrumbHandler);

var angleBreadcrumbHandler = new AngleBreadcrumbHandler();
