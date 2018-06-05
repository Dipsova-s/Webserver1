(function (window) {
    "use strict";

    var handler = window.DisplayUpgradeHandler = function () { };

    handler.prototype.UpgradableProperties = ['display_details', 'fields', 'query_blocks'];

    handler.prototype.GetUpgradeDisplayData = function (currentDisplay, sourceDisplay) {
        var self = this;
        var nameProperties = WC.Utility.ToArray(currentDisplay.upgrades_properties);
        var upgradeProperties = {};
        if (nameProperties.length && self.CanUpgradeDisplay(currentDisplay)) {
            jQuery.each(nameProperties, function (index, name) {
                upgradeProperties[name] = currentDisplay[name];
            });

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

    handler.prototype.CanUpgradeDisplay = function (display) {
        return display.authorizations ? display.authorizations.update : false;
    };

    handler.prototype.UpgradeDisplay = function (handler, displayUri, upgradeData) {
        var self = this;
        if (!displayModel.IsTemporaryDisplay(displayUri) && !jQuery.isEmptyObject(upgradeData)) {
            var params = {};
            params[enumHandlers.PARAMETERS.MULTILINGUAL] = 'yes';
            params[enumHandlers.PARAMETERS.ACCEPT_WARNINGS] = true;
            params[enumHandlers.PARAMETERS.FORCED] = true;

            return UpdateDataToWebService(displayUri + '?' + jQuery.param(params), WC.ModelHelper.RemoveReadOnlyDisplayData(upgradeData))
                .done(function (display) {
                    self.UpgradeDisplayDone(handler, displayUri, display, upgradeData);
                });
        }
        else {
            self.UpgradeDisplayDone(handler, displayUri, null, null);
            return jQuery.when(false);
        }
    };

    handler.prototype.UpgradeDisplayDone = function (handler, displayUri, display, upgradeData) {
        // clear upgrade states
        handler.Models.Display.Data().is_upgraded = true;
        handler.Models.Display.Data().upgrades_properties = [];
        handler.Models.Display.Data.commit();

        // save to history
        if (!handler.DashBoardMode()) {
            var historyData1 = historyModel.Get(displayUri, false);
            var historyData2 = historyModel.Get(displayUri, true);

            historyData1.is_upgraded = true;
            historyData1.upgrades_properties = [];
            historyData2.is_upgraded = true;
            historyData2.upgrades_properties = [];

            if (display) {
                display = WC.ModelHelper.ExtendDisplayData(display, handler.Models.Angle.Data());
                jQuery.each(upgradeData, function (name) {
                    historyData1[name] = display[name];
                    historyData2[name] = display[name];
                });
            }

            historyModel.Set(displayUri + historyModel.OriginalVersionSuffix, historyData1);
            historyModel.Set(displayUri, historyData2);
        }
    };


})(window);

var displayUpgradeHandler = new DisplayUpgradeHandler();