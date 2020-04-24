(function (window) {
    "use strict";

    // store upgraded flag
    window.UpgradedDisplays = {};

    window.DisplayUpgradeHandler = function () {
        var self = this;
        self.UpgradableProperties = ['display_details', 'fields'];

        self.GetUpgradeDisplayData = function (currentDisplay, sourceDisplay) {
            var upgradeProperties = {};
            if (self.CanUpgradeDisplay(currentDisplay)) {
                var changeData = WC.ModelHelper.GetChangeDisplay(currentDisplay, sourceDisplay);
                if (changeData) {
                    jQuery.each(changeData, function (name, value) {
                        if (jQuery.inArray(name, self.UpgradableProperties) !== -1)
                            upgradeProperties[name] = value;
                    });
                }
            }
            return upgradeProperties;
        };
        self.CanUpgradeDisplay = function (display) {
            var canUpdate = display.authorizations ? display.authorizations.update : false;
            return canUpdate && !window.UpgradedDisplays[display.uri];
        };
        self.UpgradeDisplay = function (displayUri, upgradeData) {
            if (!WC.ModelHelper.IsAdhocUri(displayUri) && !jQuery.isEmptyObject(upgradeData)) {
                var params = {};
                params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
                params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
                params[enumHandlers.PARAMETERS.FORCED] = true;

                return UpdateDataToWebService(displayUri + '?' + jQuery.param(params), WC.ModelHelper.RemoveReadOnlyDisplayData(upgradeData))
                    .then(function (display) {
                        display = WC.ModelHelper.ExtendDisplayData(display);
                        self.UpgradeDisplayDone(displayUri);
                        return jQuery.when(display);
                    });
            }
            else {
                self.UpgradeDisplayDone(displayUri);
                return jQuery.when(false);
            }
        };
        self.UpgradeDisplayDone = function (displayUri) {
            window.UpgradedDisplays[displayUri] = true;
        };
    };
})(window);
var displayUpgradeHandler = new DisplayUpgradeHandler();